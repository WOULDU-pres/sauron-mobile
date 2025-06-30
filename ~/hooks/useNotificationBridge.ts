import { useEffect, useState, useCallback, useRef } from 'react';
import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { useMessageTransmission } from './useMessageTransmission';
import type { 
  NotificationData, 
  NotificationBridgeInterface,
  NotificationServiceStatus,
  NotificationBridgeError 
} from '~/types/NotificationBridge';

/**
 * NotificationBridge 사용을 위한 React Hook
 */
export const useNotificationBridge = () => {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [serviceStatus, setServiceStatus] = useState<NotificationServiceStatus>({
    permissionGranted: false,
    serviceRunning: false,
    lastActivity: 0,
    processedCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<NotificationBridgeError | null>(null);

  const eventSubscriptionRef = useRef<EmitterSubscription | null>(null);
  const bridge = NativeModules.NotificationBridge as NotificationBridgeInterface;

  // Initialize message transmission hook
  const messageTransmission = useMessageTransmission({
    onSuccess: (response) => {
      console.log(`Notification ${response.messageId} transmitted successfully to server`);
    },
    onError: (error) => {
      console.error(`Notification transmission failed:`, error);
    },
  });

  /**
   * 권한 상태 확인
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!bridge) {
        throw new Error('NotificationBridge module not available');
      }

      const granted = await bridge.checkNotificationPermission();
      setPermissionGranted(granted);
      setServiceStatus(prev => ({ ...prev, permissionGranted: granted }));
      
      return granted;
    } catch (err) {
      const error: NotificationBridgeError = {
        code: 'PERMISSION_CHECK_ERROR',
        message: err instanceof Error ? err.message : 'Failed to check permission',
        userInfo: err,
      };
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [bridge]);

  /**
   * 설정 화면 열기
   */
  const openSettings = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!bridge) {
        throw new Error('NotificationBridge module not available');
      }

      const result = await bridge.openNotificationSettings();
      return result;
    } catch (err) {
      const error: NotificationBridgeError = {
        code: 'SETTINGS_OPEN_ERROR',
        message: err instanceof Error ? err.message : 'Failed to open settings',
        userInfo: err,
      };
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [bridge]);

  /**
   * 감시 대상 채팅방 설정
   */
  const setWatchedRooms = useCallback(async (rooms: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!bridge) {
        throw new Error('NotificationBridge module not available');
      }

      const result = await bridge.setWatchedRooms(rooms);
      return result;
    } catch (err) {
      const error: NotificationBridgeError = {
        code: 'SETTINGS_SAVE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to save watched rooms',
        userInfo: err,
      };
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [bridge]);

  /**
   * 감시 대상 채팅방 조회
   */
  const getWatchedRooms = useCallback(async (): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!bridge) {
        throw new Error('NotificationBridge module not available');
      }

      const rooms = await bridge.getWatchedRooms();
      return rooms;
    } catch (err) {
      const error: NotificationBridgeError = {
        code: 'SETTINGS_LOAD_ERROR',
        message: err instanceof Error ? err.message : 'Failed to load watched rooms',
        userInfo: err,
      };
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [bridge]);

  /**
   * 서비스 시작
   */
  const startService = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!bridge) {
        throw new Error('NotificationBridge module not available');
      }

      const result = await bridge.startNotificationListener();
      setServiceStatus(prev => ({ ...prev, serviceRunning: result }));
      
      return result;
    } catch (err) {
      const error: NotificationBridgeError = {
        code: 'SERVICE_START_ERROR',
        message: err instanceof Error ? err.message : 'Failed to start service',
        userInfo: err,
      };
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [bridge]);

  /**
   * 저장된 알림 조회
   */
  const getStoredNotifications = useCallback(async (): Promise<NotificationData[]> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!bridge) {
        throw new Error('NotificationBridge module not available');
      }

      const storedNotifications = await bridge.getStoredNotifications();
      setNotifications(storedNotifications);
      
      return storedNotifications;
    } catch (err) {
      const error: NotificationBridgeError = {
        code: 'DATA_LOAD_ERROR',
        message: err instanceof Error ? err.message : 'Failed to load notifications',
        userInfo: err,
      };
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [bridge]);

  /**
   * 저장된 알림 삭제
   */
  const clearStoredNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!bridge) {
        throw new Error('NotificationBridge module not available');
      }

      const result = await bridge.clearStoredNotifications();
      if (result) {
        setNotifications([]);
      }
      
      return result;
    } catch (err) {
      const error: NotificationBridgeError = {
        code: 'DATA_CLEAR_ERROR',
        message: err instanceof Error ? err.message : 'Failed to clear notifications',
        userInfo: err,
      };
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [bridge]);

  /**
   * 새로운 알림 추가 및 서버 전송
   */
  const addNotification = useCallback(async (notification: NotificationData) => {
    // Add to local notifications immediately
    setNotifications(prev => [notification, ...prev]);
    setServiceStatus(prev => ({
      ...prev,
      lastActivity: Date.now(),
      processedCount: prev.processedCount + 1,
    }));

    // Attempt server transmission
    try {
      // Determine transmission priority based on notification type
      const priority = notification.isAnnouncement ? 'high' : 'normal';
      
      console.log(`Attempting to transmit notification ${notification.id} to server...`);
      await messageTransmission.transmitMessage(notification, priority);
    } catch (error) {
      // Transmission failed - error is already handled by the transmission hook
      // The message will be queued for retry if the error is retryable
      console.log(`Notification ${notification.id} transmission failed, will retry if possible`);
    }
  }, [messageTransmission]);

  /**
   * 알림 삭제
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  /**
   * 에러 클리어
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 초기화 및 이벤트 리스너 설정
   */
  useEffect(() => {
    // 초기 권한 확인
    checkPermission();

    // 알림 이벤트 리스너 등록
    if (bridge) {
      const constants = bridge.getConstants();
      eventSubscriptionRef.current = DeviceEventEmitter.addListener(
        constants.EVENT_NOTIFICATION_RECEIVED,
        (data: NotificationData) => {
          console.log('New notification received:', data);
          addNotification(data);
        }
      );
    }

    // cleanup
    return () => {
      if (eventSubscriptionRef.current) {
        eventSubscriptionRef.current.remove();
        eventSubscriptionRef.current = null;
      }
    };
  }, [bridge, checkPermission, addNotification]);

  return {
    // State
    permissionGranted,
    notifications,
    serviceStatus,
    loading,
    error,
    
    // Actions
    checkPermission,
    openSettings,
    setWatchedRooms,
    getWatchedRooms,
    startService,
    getStoredNotifications,
    clearStoredNotifications,
    addNotification,
    removeNotification,
    clearError,
    
    // Utils
    isServiceAvailable: !!bridge,
    
    // Message Transmission (T-003 integration)
    transmission: {
      isTransmitting: messageTransmission.isTransmitting,
      isOnline: messageTransmission.isOnline,
      queueSize: messageTransmission.queueSize,
      stats: messageTransmission.stats,
      isServerHealthy: messageTransmission.isServerHealthy,
      processQueue: messageTransmission.processQueue,
      clearQueue: messageTransmission.clearQueue,
      checkServerHealth: messageTransmission.checkServerHealth,
    },
  };
};

/**
 * 알림 필터링을 위한 Hook
 */
export const useNotificationFilter = (notifications: NotificationData[]) => {
  const [filterKeyword, setFilterKeyword] = useState<string>('');
  const [showAnnouncementsOnly, setShowAnnouncementsOnly] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const filteredNotifications = notifications.filter(notification => {
    // 키워드 필터
    if (filterKeyword) {
      const keyword = filterKeyword.toLowerCase();
      const searchableText = `${notification.title} ${notification.message} ${notification.roomName}`.toLowerCase();
      if (!searchableText.includes(keyword)) {
        return false;
      }
    }

    // 공지사항 필터
    if (showAnnouncementsOnly && !notification.isAnnouncement) {
      return false;
    }

    // 날짜 필터
    if (dateRange.start || dateRange.end) {
      const notificationDate = new Date(notification.timestamp);
      if (dateRange.start && notificationDate < dateRange.start) {
        return false;
      }
      if (dateRange.end && notificationDate > dateRange.end) {
        return false;
      }
    }

    return true;
  });

  return {
    filteredNotifications,
    filterKeyword,
    setFilterKeyword,
    showAnnouncementsOnly,
    setShowAnnouncementsOnly,
    dateRange,
    setDateRange,
  };
}; 