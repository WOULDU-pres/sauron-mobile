/**
 * Message Transmission Hook for Sauron Mobile
 * Integrates message transmission service with React Query and Zustand store
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import messageService from '~/lib/api/messageService';
import { useTransmissionStore } from '~/lib/store/transmissionStore';
import { API_CONFIG, getRetryDelay } from '../../constants/ApiConfig';
import type { NotificationData } from '~/types/NotificationBridge';
import type { MessageTransmissionResponse, TransmissionError } from '~/lib/api/messageService';

// Hook options
export interface UseMessageTransmissionOptions {
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: (response: MessageTransmissionResponse) => void;
  onError?: (error: TransmissionError) => void;
}

// Hook return type
export interface MessageTransmissionHook {
  // Mutation functions
  transmitMessage: (notification: NotificationData, priority?: 'high' | 'normal' | 'low') => Promise<MessageTransmissionResponse>;
  transmitMessageBatch: (notifications: NotificationData[]) => Promise<void>;
  
  // Queue management
  processQueue: () => Promise<void>;
  clearQueue: () => void;
  
  // State
  isTransmitting: boolean;
  isOnline: boolean;
  queueSize: number;
  stats: any;
  
  // Server health
  isServerHealthy: boolean;
  checkServerHealth: () => Promise<boolean>;
}

/**
 * Custom hook for message transmission with queue management and retry logic
 */
export const useMessageTransmission = (
  options: UseMessageTransmissionOptions = {}
): MessageTransmissionHook => {
  const queryClient = useQueryClient();
  const store = useTransmissionStore();
  
  const {
    autoRetry = true,
    maxRetries = API_CONFIG.RETRY.MAX_ATTEMPTS,
    retryDelay = API_CONFIG.RETRY.INITIAL_DELAY,
    onSuccess,
    onError,
  } = options;

  // Server health check query
  const {
    data: isServerHealthy = false,
    refetch: refetchServerHealth,
  } = useQuery({
    queryKey: ['serverHealth'],
    queryFn: () => messageService.checkServerHealth(),
    staleTime: 30000, // 30 seconds
    retry: false,
  });

  // Single message transmission mutation
  const transmissionMutation = useMutation({
    mutationFn: async ({ 
      notification, 
      attempt = 1 
    }: { 
      notification: NotificationData; 
      attempt?: number 
    }) => {
      store.setTransmitting(true);
      
      try {
        const response = await messageService.transmitMessage(notification, {
          timeout: API_CONFIG.TIMEOUT,
        });
        
        return { response, notification, attempt };
      } catch (error) {
        throw { error: error as TransmissionError, notification, attempt };
      } finally {
        store.setTransmitting(false);
      }
    },
    onSuccess: ({ response, notification, attempt }) => {
      // Record successful transmission
      store.recordSuccessfulTransmission(response);
      
      console.log(`Message ${notification.id} transmitted successfully on attempt ${attempt}`);
      onSuccess?.(response);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['transmissionHistory'] });
    },
    onError: ({ error, notification, attempt }: any) => {
      // Record failed transmission
      store.recordFailedTransmission(notification.id, error, attempt);
      
      console.error(`Message ${notification.id} transmission failed on attempt ${attempt}:`, error);
      
      // Handle retry logic
      if (autoRetry && error.retryable && attempt < maxRetries) {
        const delay = getRetryDelay(attempt);
        
        setTimeout(() => {
          store.incrementRetryCount(notification.id);
          transmissionMutation.mutate({ notification, attempt: attempt + 1 });
        }, delay);
        
        console.log(`Retrying message ${notification.id} in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      } else {
        // Max retries reached or non-retryable error
        if (error.retryable) {
          // Add to queue for later processing
          store.addToQueue(notification, 'high');
          console.log(`Message ${notification.id} added to queue after max retries`);
        }
        
        onError?.(error);
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['transmissionHistory'] });
    },
    retry: false, // We handle retries manually
  });

  // Batch transmission mutation
  const batchTransmissionMutation = useMutation({
    mutationFn: async (notifications: NotificationData[]) => {
      store.setTransmitting(true);
      
      try {
        const result = await messageService.transmitMessageBatch(notifications, {
          concurrency: 3,
        });
        
        return result;
      } finally {
        store.setTransmitting(false);
      }
    },
    onSuccess: (result) => {
      // Record successful transmissions
      result.successful.forEach(response => {
        store.recordSuccessfulTransmission(response);
      });
      
      // Handle failed transmissions
      result.failed.forEach(({ notification, error }) => {
        store.recordFailedTransmission(notification.id, error, 1);
        
        if (error.retryable) {
          store.addToQueue(notification, 'normal');
        }
      });
      
      console.log(`Batch transmission completed: ${result.successful.length} successful, ${result.failed.length} failed`);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['transmissionHistory'] });
    },
    onError: (error) => {
      console.error('Batch transmission failed:', error);
      store.setTransmitting(false);
    },
  });

  // Queue processing function
  const processQueue = useCallback(async () => {
    if (!store.isOnline || store.isTransmitting) {
      return;
    }
    
    const nextMessage = store.getNextQueuedMessage();
    if (!nextMessage) {
      return;
    }
    
    console.log(`Processing queued message ${nextMessage.id} (retry count: ${nextMessage.retryCount})`);
    
    try {
      await transmissionMutation.mutateAsync({ 
        notification: nextMessage.notification,
        attempt: nextMessage.retryCount + 1,
      });
    } catch (error) {
      console.error(`Failed to process queued message ${nextMessage.id}:`, error);
    }
  }, [store.isOnline, store.isTransmitting, transmissionMutation]);

  // Network state monitoring (simplified version without NetInfo)
  useEffect(() => {
    // For now, assume online status based on server health checks
    // In production, implement proper network monitoring
    const checkNetworkStatus = async () => {
      try {
        const healthCheck = await messageService.checkServerHealth();
        store.setOnlineStatus(healthCheck);
        
        if (healthCheck) {
          console.log('Network appears to be restored');
          setTimeout(() => {
            processQueue();
          }, 1000);
        }
      } catch (error) {
        store.setOnlineStatus(false);
      }
    };

    // Check network status every 30 seconds
    const interval = setInterval(checkNetworkStatus, 30000);
    
    // Initial check
    checkNetworkStatus();

    return () => clearInterval(interval);
  }, [processQueue, store]);

  // App state monitoring for queue processing
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && store.isOnline) {
        // App became active and we're online, process queue
        setTimeout(() => {
          processQueue();
        }, 500);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [processQueue, store.isOnline]);

  // Automatic queue processing interval
  useEffect(() => {
    if (!autoRetry) return;
    
    const interval = setInterval(() => {
      if (store.isOnline && !store.isTransmitting && store.getQueueSize() > 0) {
        processQueue();
      }
    }, 10000); // Process queue every 10 seconds
    
    return () => clearInterval(interval);
  }, [autoRetry, processQueue, store]);

  // Public interface
  const transmitMessage = useCallback(async (
    notification: NotificationData,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<MessageTransmissionResponse> => {
    if (!store.isOnline) {
      // Add to queue if offline
      store.addToQueue(notification, priority);
      throw new Error('Offline: Message added to queue');
    }
    
    const result = await transmissionMutation.mutateAsync({ notification });
    return result.response;
  }, [store.isOnline, transmissionMutation]);

  const transmitMessageBatch = useCallback(async (
    notifications: NotificationData[]
  ): Promise<void> => {
    if (!store.isOnline) {
      // Add all to queue if offline
      notifications.forEach(notification => {
        store.addToQueue(notification, 'normal');
      });
      throw new Error('Offline: Messages added to queue');
    }
    
    await batchTransmissionMutation.mutateAsync(notifications);
  }, [store.isOnline, batchTransmissionMutation]);

  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    const result = await refetchServerHealth();
    return result.data ?? false;
  }, [refetchServerHealth]);

  const clearQueue = useCallback(() => {
    store.clearQueue();
  }, [store]);

  return {
    // Mutation functions
    transmitMessage,
    transmitMessageBatch,
    
    // Queue management
    processQueue,
    clearQueue,
    
    // State
    isTransmitting: store.isTransmitting,
    isOnline: store.isOnline,
    queueSize: store.getQueueSize(),
    stats: store.transmissionStats,
    
    // Server health
    isServerHealthy,
    checkServerHealth,
  };
};