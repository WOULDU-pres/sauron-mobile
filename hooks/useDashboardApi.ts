/**
 * @fileoverview 대시보드 API 연동 훅
 * 
 * 대시보드에 필요한 실시간 데이터를 관리하는 커스텀 훅입니다.
 * 
 * @features
 * - 자동 데이터 새로고침
 * - 풀투리프레시 지원
 * - 에러 상태 관리
 * - 성능 모니터링 통합
 * - 오프라인 대응
 * 
 * @author Sauron Mobile Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { apiClient, type DashboardStats, withPerformanceMonitoring } from '~/lib/api/apiClient';
import { usePerformanceMonitor } from '~/hooks/usePerformanceMonitor';
import { errorLogger } from '~/lib/errorLogger';
import type { DetectedMessage, AnnouncementRequest } from '~/types/detection-log';

// ===== 타입 정의 =====

/**
 * 대시보드 데이터 상태
 */
interface DashboardData {
  /** 통계 데이터 */
  stats: DashboardStats | null;
  /** 최근 감지된 메시지 */
  recentMessages: DetectedMessage[];
  /** 공지 요청 목록 */
  announcements: AnnouncementRequest[];
  /** 감시 중인 채팅방 목록 */
  watchedChatrooms: Array<{
    name: string;
    members: number;
    lastActivity: string;
    status: string;
  }>;
}

/**
 * API 상태
 */
interface ApiState {
  /** 로딩 상태 */
  isLoading: boolean;
  /** 새로고침 상태 */
  isRefreshing: boolean;
  /** 에러 상태 */
  error: string | null;
  /** 마지막 업데이트 시간 */
  lastUpdated: Date | null;
  /** 네트워크 연결 상태 */
  isOnline: boolean;
  /** 서버 연결 상태 */
  isServerOnline: boolean;
}

/**
 * 훅 설정 옵션
 */
interface UseDashboardApiOptions {
  /** 자동 새로고침 간격 (ms) */
  refreshInterval?: number;
  /** 자동 새로고침 활성화 여부 */
  enableAutoRefresh?: boolean;
  /** 에러 재시도 횟수 */
  maxRetries?: number;
  /** 오프라인 모드 지원 여부 */
  enableOfflineMode?: boolean;
}

// ===== 기본값 =====

/** 기본 새로고침 간격 (30초) */
const DEFAULT_REFRESH_INTERVAL = 30 * 1000;

/** 기본 재시도 횟수 */
const DEFAULT_MAX_RETRIES = 3;

/** 더미 데이터 */
const MOCK_DETECTED_MESSAGES: DetectedMessage[] = [
  {
    id: 1,
    type: '광고',
    content: '특가 할인! 지금 주문하면 50% 할인해드립니다!',
    timestamp: '2024-01-15 14:30',
    author: '사용자123',
    chatroom: '일반채팅방',
    confidence: 92.5,
    reason: '광고성 키워드와 할인 문구가 포함되어 있습니다.',
  },
  {
    id: 2,
    type: '도배',
    content: '안녕하세요 안녕하세요 안녕하세요 안녕하세요',
    timestamp: '2024-01-15 14:25',
    author: '사용자456',
    chatroom: '자유채팅방',
    confidence: 87.1,
    reason: '동일한 문구의 반복적 사용이 감지되었습니다.',
  },
  {
    id: 3,
    type: '분쟁',
    content: '이 사람이 욕을 했어요! 신고합니다!',
    timestamp: '2024-01-15 14:20',
    author: '사용자789',
    chatroom: '일반채팅방',
    confidence: 78.9,
    reason: '공격적인 언어와 신고 의도가 감지되었습니다.',
  },
];

const MOCK_ANNOUNCEMENTS: AnnouncementRequest[] = [
  {
    id: 1,
    title: '시스템 점검 공지',
    content: '내일 오후 2시부터 4시까지 시스템 점검이 있을 예정입니다.',
    timestamp: '2024-01-15 10:00',
    status: '대기',
    room: 'IT 개발자 모임',
  },
  {
    id: 2,
    title: '새 기능 업데이트',
    content: '새로운 채팅 기능이 추가되었습니다.',
    timestamp: '2024-01-15 09:30',
    status: '승인',
    room: '코인 투자방',
  },
];

// ===== 커스텀 훅 =====

/**
 * 대시보드 API 연동 훅
 */
export const useDashboardApi = (options: UseDashboardApiOptions = {}) => {
  const {
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    enableAutoRefresh = true,
    maxRetries = DEFAULT_MAX_RETRIES,
    enableOfflineMode = true,
  } = options;
  
  // ===== 상태 관리 =====
  
  const [data, setData] = useState<DashboardData>({
    stats: null,
    recentMessages: [],
    announcements: [],
    watchedChatrooms: [],
  });
  
  const [apiState, setApiState] = useState<ApiState>({
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    isOnline: true,
    isServerOnline: false,
  });
  
  // 성능 모니터링
  const { measureApiCall } = usePerformanceMonitor();
  
  // 참조값들
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);
  
  // ===== 네트워크 상태 모니터링 =====
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (mountedRef.current) {
        setApiState(prev => ({
          ...prev,
          isOnline: state.isConnected ?? false,
        }));
      }
    });
    
    return unsubscribe;
  }, []);
  
  // ===== 데이터 fetching 함수들 =====
  
  /**
   * 대시보드 통계 데이터 조회
   */
  const fetchStats = useCallback(async (): Promise<DashboardStats | null> => {
    try {
      return await measureApiCall(
        'dashboard-stats',
        () => apiClient.getDashboardData()
      );
    } catch (error: any) {
      await errorLogger.logError(error, {
        category: 'api',
        context: { endpoint: 'dashboard-stats' },
      });
      
      if (enableOfflineMode) {
        // 오프라인 모드에서는 더미 데이터 반환
        return {
          totalMessages: 1247,
          harmfulMessages: 27,
          processedToday: 156,
          categories: {
            advertisement: 14,
            spam: 8,
            abuse: 5,
            normal: 1220,
          },
          recentActivity: [],
        };
      }
      
      throw error;
    }
  }, [measureApiCall, enableOfflineMode]);
  
  /**
   * 서버 헬스 체크
   */
  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    try {
      const health = await measureApiCall(
        'health-check',
        () => apiClient.healthCheck()
      );
      return health.healthy;
    } catch (error) {
      return false;
    }
  }, [measureApiCall]);
  
  /**
   * 모든 대시보드 데이터 새로고침
   */
  const fetchAllData = useCallback(async (): Promise<void> => {
    if (!apiState.isOnline && !enableOfflineMode) {
      throw new Error('네트워크에 연결되지 않았습니다.');
    }
    
    try {
      // 병렬로 데이터 fetching
      const [stats, serverHealthy] = await Promise.all([
        fetchStats(),
        checkServerHealth(),
      ]);
      
      if (mountedRef.current) {
        setData(prev => ({
          ...prev,
          stats,
          // 실제 API가 구현되기 전까지 더미 데이터 사용
          recentMessages: MOCK_DETECTED_MESSAGES,
          announcements: MOCK_ANNOUNCEMENTS,
          watchedChatrooms: [
            {
              name: '일반 채팅방',
              members: 1247,
              lastActivity: '5분 전',
              status: '활성',
            },
            {
              name: '투자 정보방',
              members: 892,
              lastActivity: '2시간 전',
              status: '활성',
            },
            {
              name: '자유수다방',
              members: 634,
              lastActivity: '15분 전',
              status: '비활성',
            },
          ],
        }));
        
        setApiState(prev => ({
          ...prev,
          error: null,
          lastUpdated: new Date(),
          isServerOnline: serverHealthy,
        }));
        
        retryCountRef.current = 0;
      }
      
    } catch (error: any) {
      if (mountedRef.current) {
        setApiState(prev => ({
          ...prev,
          error: error.message,
          isServerOnline: false,
        }));
        
        // 재시도 로직
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(() => {
            if (mountedRef.current) {
              fetchAllData();
            }
          }, 2000 * retryCountRef.current); // 지수적 백오프
        }
      }
    }
  }, [apiState.isOnline, enableOfflineMode, fetchStats, checkServerHealth, maxRetries]);
  
  // ===== 공개 API 함수들 =====
  
  /**
   * 수동 새로고침
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (apiState.isRefreshing) return;
    
    setApiState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      await fetchAllData();
    } finally {
      if (mountedRef.current) {
        setApiState(prev => ({ ...prev, isRefreshing: false }));
      }
    }
  }, [apiState.isRefreshing, fetchAllData]);
  
  /**
   * 초기 데이터 로드
   */
  const initialize = useCallback(async (): Promise<void> => {
    if (apiState.isLoading) return;
    
    setApiState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await fetchAllData();
    } finally {
      if (mountedRef.current) {
        setApiState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [apiState.isLoading, fetchAllData]);
  
  /**
   * 에러 상태 클리어
   */
  const clearError = useCallback(() => {
    setApiState(prev => ({ ...prev, error: null }));
    retryCountRef.current = 0;
  }, []);
  
  /**
   * 특정 메시지 추가 (실시간 업데이트 시뮬레이션)
   */
  const addMessage = useCallback((message: DetectedMessage) => {
    setData(prev => ({
      ...prev,
      recentMessages: [message, ...prev.recentMessages.slice(0, 9)], // 최대 10개 유지
    }));
  }, []);
  
  // ===== 자동 새로고침 관리 =====
  
  useEffect(() => {
    if (enableAutoRefresh && apiState.isOnline) {
      refreshIntervalRef.current = setInterval(() => {
        if (mountedRef.current && !apiState.isLoading && !apiState.isRefreshing) {
          fetchAllData();
        }
      }, refreshInterval);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [enableAutoRefresh, apiState.isOnline, apiState.isLoading, apiState.isRefreshing, refreshInterval, fetchAllData]);
  
  // ===== 생명주기 관리 =====
  
  useEffect(() => {
    // 컴포넌트 마운트 시 초기 데이터 로드
    initialize();
    
    // 언마운트 시 정리
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);
  
  // ===== 반환값 =====
  
  return {
    // 데이터
    data,
    
    // 상태
    isLoading: apiState.isLoading,
    isRefreshing: apiState.isRefreshing,
    error: apiState.error,
    lastUpdated: apiState.lastUpdated,
    isOnline: apiState.isOnline,
    isServerOnline: apiState.isServerOnline,
    
    // 액션
    refresh,
    initialize,
    clearError,
    addMessage,
    
    // 헬퍼
    hasData: !!data.stats,
    isEmpty: !data.stats && !apiState.isLoading,
    needsRefresh: !data.stats || (apiState.lastUpdated && 
      Date.now() - apiState.lastUpdated.getTime() > refreshInterval * 2),
  };
};

export default useDashboardApi;