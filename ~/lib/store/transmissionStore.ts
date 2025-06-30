/**
 * Transmission Store for Sauron Mobile
 * Manages message transmission state, queue, and error tracking using Zustand
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationData } from '~/types/NotificationBridge';
import type { MessageTransmissionResponse, TransmissionError } from '../api/messageService';

// State interfaces
export interface QueuedMessage {
  id: string;
  notification: NotificationData;
  timestamp: number;
  retryCount: number;
  lastError?: TransmissionError;
  priority: 'high' | 'normal' | 'low';
}

export interface TransmissionAttempt {
  messageId: string;
  attempt: number;
  timestamp: number;
  success: boolean;
  error?: TransmissionError;
  processingTimeMs?: number;
}

export interface TransmissionStats {
  totalAttempts: number;
  successfulTransmissions: number;
  failedTransmissions: number;
  averageProcessingTime: number;
  lastSuccessfulTransmission?: number;
  lastFailedTransmission?: number;
}

interface TransmissionStore {
  // State
  isOnline: boolean;
  isTransmitting: boolean;
  messageQueue: QueuedMessage[];
  completedTransmissions: MessageTransmissionResponse[];
  failedTransmissions: TransmissionAttempt[];
  transmissionStats: TransmissionStats;
  
  // Actions - Queue Management
  addToQueue: (notification: NotificationData, priority?: 'high' | 'normal' | 'low') => void;
  removeFromQueue: (messageId: string) => void;
  clearQueue: () => void;
  getQueueSize: () => number;
  getNextQueuedMessage: () => QueuedMessage | null;
  
  // Actions - Transmission State
  setOnlineStatus: (isOnline: boolean) => void;
  setTransmitting: (isTransmitting: boolean) => void;
  recordSuccessfulTransmission: (response: MessageTransmissionResponse) => void;
  recordFailedTransmission: (messageId: string, error: TransmissionError, attempt: number) => void;
  incrementRetryCount: (messageId: string) => void;
  
  // Actions - Stats & Cleanup
  updateStats: () => void;
  clearCompletedTransmissions: () => void;
  clearFailedTransmissions: () => void;
  resetStats: () => void;
  
  // Selectors
  getTransmissionHistory: () => (MessageTransmissionResponse | TransmissionAttempt)[];
  getFailedMessagesCount: () => number;
  getQueuedMessagesCount: () => number;
  hasHighPriorityMessages: () => boolean;
}

const defaultStats: TransmissionStats = {
  totalAttempts: 0,
  successfulTransmissions: 0,
  failedTransmissions: 0,
  averageProcessingTime: 0,
};

export const useTransmissionStore = create<TransmissionStore>()(
  persist(
    (set, get) => ({
      // Initial State
      isOnline: true,
      isTransmitting: false,
      messageQueue: [],
      completedTransmissions: [],
      failedTransmissions: [],
      transmissionStats: defaultStats,

      // Queue Management Actions
      addToQueue: (notification, priority = 'normal') => {
        set((state) => {
          // Check if message already exists in queue
          const exists = state.messageQueue.find(item => item.id === notification.id);
          if (exists) {
            return state; // Don't add duplicates
          }

          const queuedMessage: QueuedMessage = {
            id: notification.id,
            notification,
            timestamp: Date.now(),
            retryCount: 0,
            priority,
          };

          // Sort queue by priority (high -> normal -> low) and timestamp
          const newQueue = [...state.messageQueue, queuedMessage].sort((a, b) => {
            const priorityOrder = { high: 0, normal: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return a.timestamp - b.timestamp;
          });

          return { messageQueue: newQueue };
        });
      },

      removeFromQueue: (messageId) => {
        set((state) => ({
          messageQueue: state.messageQueue.filter(item => item.id !== messageId),
        }));
      },

      clearQueue: () => {
        set({ messageQueue: [] });
      },

      getQueueSize: () => {
        return get().messageQueue.length;
      },

      getNextQueuedMessage: () => {
        const { messageQueue } = get();
        return messageQueue.length > 0 ? messageQueue[0] : null;
      },

      // Transmission State Actions
      setOnlineStatus: (isOnline) => {
        set({ isOnline });
      },

      setTransmitting: (isTransmitting) => {
        set({ isTransmitting });
      },

      recordSuccessfulTransmission: (response) => {
        set((state) => {
          // Remove from queue if exists
          const newQueue = state.messageQueue.filter(item => item.id !== response.messageId);
          
          // Add to completed transmissions (keep only last 100)
          const newCompleted = [response, ...state.completedTransmissions].slice(0, 100);

          return {
            messageQueue: newQueue,
            completedTransmissions: newCompleted,
          };
        });
        
        // Update stats
        get().updateStats();
      },

      recordFailedTransmission: (messageId, error, attempt) => {
        set((state) => {
          const failedAttempt: TransmissionAttempt = {
            messageId,
            attempt,
            timestamp: Date.now(),
            success: false,
            error,
          };

          // Add to failed transmissions (keep only last 100)
          const newFailed = [failedAttempt, ...state.failedTransmissions].slice(0, 100);

          return {
            failedTransmissions: newFailed,
          };
        });
        
        // Update stats
        get().updateStats();
      },

      incrementRetryCount: (messageId) => {
        set((state) => ({
          messageQueue: state.messageQueue.map(item =>
            item.id === messageId
              ? { ...item, retryCount: item.retryCount + 1 }
              : item
          ),
        }));
      },

      // Stats & Cleanup Actions
      updateStats: () => {
        set((state) => {
          const { completedTransmissions, failedTransmissions } = state;
          
          const successfulTransmissions = completedTransmissions.length;
          const failedCount = failedTransmissions.length;
          const totalAttempts = successfulTransmissions + failedCount;

          // Calculate average processing time from successful transmissions
          const avgProcessingTime = successfulTransmissions > 0
            ? completedTransmissions.reduce((sum, tx) => sum + tx.processingTimeMs, 0) / successfulTransmissions
            : 0;

          const lastSuccessful = completedTransmissions.length > 0
            ? new Date(completedTransmissions[0].timestamp).getTime()
            : undefined;

          const lastFailed = failedTransmissions.length > 0
            ? failedTransmissions[0].timestamp
            : undefined;

          const updatedStats: TransmissionStats = {
            totalAttempts,
            successfulTransmissions,
            failedTransmissions: failedCount,
            averageProcessingTime: Math.round(avgProcessingTime),
            lastSuccessfulTransmission: lastSuccessful,
            lastFailedTransmission: lastFailed,
          };

          return { transmissionStats: updatedStats };
        });
      },

      clearCompletedTransmissions: () => {
        set({ completedTransmissions: [] });
        get().updateStats();
      },

      clearFailedTransmissions: () => {
        set({ failedTransmissions: [] });
        get().updateStats();
      },

      resetStats: () => {
        set({
          transmissionStats: defaultStats,
          completedTransmissions: [],
          failedTransmissions: [],
        });
      },

      // Selectors
      getTransmissionHistory: () => {
        const { completedTransmissions, failedTransmissions } = get();
        
        // Combine and sort by timestamp (most recent first)
        // Convert string timestamps to numbers for sorting, but maintain original objects
        const completedWithNumericTimestamp = completedTransmissions.map(tx => ({
          ...tx,
          numericTimestamp: new Date(tx.timestamp).getTime()
        }));

        const combined = [
          ...completedWithNumericTimestamp,
          ...failedTransmissions.map(tx => ({ ...tx, numericTimestamp: tx.timestamp })),
        ].sort((a, b) => b.numericTimestamp - a.numericTimestamp);

        // Remove the temporary numericTimestamp field and return original types
        return combined.slice(0, 50).map(({ numericTimestamp, ...item }) => item);
      },

      getFailedMessagesCount: () => {
        return get().failedTransmissions.length;
      },

      getQueuedMessagesCount: () => {
        return get().messageQueue.length;
      },

      hasHighPriorityMessages: () => {
        return get().messageQueue.some(msg => msg.priority === 'high');
      },
    }),
    {
      name: 'sauron-transmission-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist essential data, not runtime state
        messageQueue: state.messageQueue,
        transmissionStats: state.transmissionStats,
        completedTransmissions: state.completedTransmissions.slice(0, 20), // Keep only recent 20
        failedTransmissions: state.failedTransmissions.slice(0, 20), // Keep only recent 20
      }),
    }
  )
);

// Computed selectors (non-reactive)
export const getTransmissionSummary = () => {
  const state = useTransmissionStore.getState();
  return {
    queueSize: state.messageQueue.length,
    isProcessing: state.isTransmitting,
    isOnline: state.isOnline,
    stats: state.transmissionStats,
    hasErrors: state.failedTransmissions.length > 0,
    hasPendingMessages: state.messageQueue.length > 0,
  };
};