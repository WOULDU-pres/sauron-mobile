/**
 * @fileoverview 성능 모니터링 훅
 * 
 * API 응답 시간, 에러율, 메모리 사용량 등 앱의 성능 지표를 실시간으로 모니터링합니다.
 * 
 * @features
 * - API 응답 시간 측정
 * - 에러 발생 추적
 * - 메모리 사용량 모니터링
 * - 성능 임계값 알림
 * - 자동화된 리포팅
 * 
 * @author Sauron Mobile Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ===== 타입 정의 =====

/**
 * API 성능 메트릭 인터페이스
 */
export interface ApiMetrics {
  /** API 엔드포인트 */
  endpoint: string;
  /** 응답 시간 (ms) */
  responseTime: number;
  /** 요청 상태 코드 */
  statusCode: number;
  /** 성공 여부 */
  success: boolean;
  /** 요청 시각 */
  timestamp: Date;
  /** 에러 메시지 (있는 경우) */
  error?: string;
}

/**
 * 성능 통계 인터페이스
 */
export interface PerformanceStats {
  /** 총 요청 수 */
  totalRequests: number;
  /** 성공한 요청 수 */
  successfulRequests: number;
  /** 실패한 요청 수 */
  failedRequests: number;
  /** 평균 응답 시간 (ms) */
  averageResponseTime: number;
  /** 최대 응답 시간 (ms) */
  maxResponseTime: number;
  /** 최소 응답 시간 (ms) */
  minResponseTime: number;
  /** 성공률 (%) */
  successRate: number;
  /** 최근 1분간 요청 수 */
  requestsPerMinute: number;
}

/**
 * 성능 알림 인터페이스
 */
export interface PerformanceAlert {
  /** 알림 ID */
  id: string;
  /** 알림 유형 */
  type: 'slow_response' | 'high_error_rate' | 'memory_warning' | 'api_failure';
  /** 알림 메시지 */
  message: string;
  /** 심각도 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 발생 시각 */
  timestamp: Date;
  /** 관련 데이터 */
  data?: any;
}

/**
 * 성능 임계값 설정
 */
export interface PerformanceThresholds {
  /** 응답 시간 임계값 (ms) */
  responseTimeThreshold: number;
  /** 에러율 임계값 (%) */
  errorRateThreshold: number;
  /** 메모리 사용량 임계값 (MB) */
  memoryThreshold: number;
  /** 연속 실패 허용 횟수 */
  consecutiveFailureThreshold: number;
}

// ===== 기본값 설정 =====

/** 기본 성능 임계값 */
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  responseTimeThreshold: 3000, // 3초
  errorRateThreshold: 10, // 10%
  memoryThreshold: 100, // 100MB
  consecutiveFailureThreshold: 3, // 3회 연속 실패
};

/** 메트릭 보존 기간 (ms) */
const METRICS_RETENTION_PERIOD = 5 * 60 * 1000; // 5분

// ===== 커스텀 훅 =====

/**
 * 성능 모니터링 훅
 * 
 * @param thresholds - 성능 임계값 설정
 * @returns 성능 모니터링 관련 함수들과 상태
 */
export const usePerformanceMonitor = (
  thresholds: Partial<PerformanceThresholds> = {}
) => {
  // ===== 상태 관리 =====
  
  const [metrics, setMetrics] = useState<ApiMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // 설정된 임계값 (기본값과 병합)
  const activeThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  
  // 성능 통계 계산을 위한 참조
  const metricsRef = useRef<ApiMetrics[]>([]);
  const alertsRef = useRef<PerformanceAlert[]>([]);
  
  // ===== 유틸리티 함수들 =====
  
  /**
   * 고유 ID 생성
   */
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);
  
  /**
   * 오래된 메트릭 정리
   */
  const cleanupOldMetrics = useCallback(() => {
    const now = Date.now();
    const cutoffTime = now - METRICS_RETENTION_PERIOD;
    
    setMetrics(prev => prev.filter(metric => 
      metric.timestamp.getTime() > cutoffTime
    ));
    
    setAlerts(prev => prev.filter(alert => 
      alert.timestamp.getTime() > cutoffTime
    ));
  }, []);
  
  // ===== 메트릭 기록 및 분석 =====
  
  /**
   * API 요청 성능 메트릭 기록
   */
  const recordApiMetric = useCallback((
    endpoint: string,
    responseTime: number,
    statusCode: number,
    error?: string
  ) => {
    const metric: ApiMetrics = {
      endpoint,
      responseTime,
      statusCode,
      success: statusCode >= 200 && statusCode < 300,
      timestamp: new Date(),
      error,
    };
    
    setMetrics(prev => {
      const updated = [...prev, metric];
      metricsRef.current = updated;
      return updated;
    });
    
    // 성능 분석 및 알림 체크
    checkPerformanceThresholds(metric);
    
    return metric;
  }, [activeThresholds]);
  
  /**
   * 성능 임계값 체크 및 알림 생성
   */
  const checkPerformanceThresholds = useCallback((metric: ApiMetrics) => {
    const newAlerts: PerformanceAlert[] = [];
    
    // 응답 시간 체크
    if (metric.responseTime > activeThresholds.responseTimeThreshold) {
      newAlerts.push({
        id: generateId(),
        type: 'slow_response',
        message: `Slow API response: ${metric.endpoint} took ${metric.responseTime}ms`,
        severity: metric.responseTime > activeThresholds.responseTimeThreshold * 2 ? 'critical' : 'high',
        timestamp: new Date(),
        data: { metric },
      });
    }
    
    // API 실패 체크
    if (!metric.success) {
      newAlerts.push({
        id: generateId(),
        type: 'api_failure',
        message: `API request failed: ${metric.endpoint} (${metric.statusCode})`,
        severity: 'medium',
        timestamp: new Date(),
        data: { metric },
      });
    }
    
    // 연속 실패 체크
    const recentMetrics = metricsRef.current
      .filter(m => m.endpoint === metric.endpoint)
      .slice(-activeThresholds.consecutiveFailureThreshold);
    
    if (recentMetrics.length >= activeThresholds.consecutiveFailureThreshold &&
        recentMetrics.every(m => !m.success)) {
      newAlerts.push({
        id: generateId(),
        type: 'high_error_rate',
        message: `High error rate detected for ${metric.endpoint}`,
        severity: 'critical',
        timestamp: new Date(),
        data: { consecutiveFailures: recentMetrics.length },
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => {
        const updated = [...prev, ...newAlerts];
        alertsRef.current = updated;
        return updated;
      });
    }
  }, [activeThresholds, generateId]);
  
  // ===== 성능 통계 계산 =====
  
  /**
   * 현재 성능 통계 계산
   */
  const getPerformanceStats = useCallback((): PerformanceStats => {
    const currentMetrics = metricsRef.current;
    
    if (currentMetrics.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        successRate: 0,
        requestsPerMinute: 0,
      };
    }
    
    const totalRequests = currentMetrics.length;
    const successfulRequests = currentMetrics.filter(m => m.success).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimes = currentMetrics.map(m => m.responseTime);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    const successRate = (successfulRequests / totalRequests) * 100;
    
    // 최근 1분간 요청 수 계산
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const requestsPerMinute = currentMetrics.filter(m => 
      m.timestamp.getTime() > oneMinuteAgo
    ).length;
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(averageResponseTime),
      maxResponseTime,
      minResponseTime,
      successRate: Math.round(successRate * 100) / 100,
      requestsPerMinute,
    };
  }, []);
  
  // ===== API 래퍼 함수 =====
  
  /**
   * API 요청을 감싸서 성능을 측정하는 함수
   */
  const measureApiCall = useCallback(async <T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      const responseTime = Date.now() - startTime;
      
      recordApiMetric(endpoint, responseTime, 200);
      
      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const statusCode = error?.response?.status || 0;
      const errorMessage = error?.message || 'Unknown error';
      
      recordApiMetric(endpoint, responseTime, statusCode, errorMessage);
      
      throw error;
    }
  }, [recordApiMetric]);
  
  // ===== 모니터링 제어 =====
  
  /**
   * 모니터링 시작
   */
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    console.log('🚀 Performance monitoring started');
  }, []);
  
  /**
   * 모니터링 정지
   */
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    console.log('⏹️ Performance monitoring stopped');
  }, []);
  
  /**
   * 메트릭 초기화
   */
  const clearMetrics = useCallback(() => {
    setMetrics([]);
    setAlerts([]);
    metricsRef.current = [];
    alertsRef.current = [];
    console.log('🧹 Performance metrics cleared');
  }, []);
  
  /**
   * 알림 제거
   */
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);
  
  // ===== 생명주기 관리 =====
  
  // 주기적인 정리 작업
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(cleanupOldMetrics, 30 * 1000); // 30초마다 정리
    
    return () => clearInterval(interval);
  }, [isMonitoring, cleanupOldMetrics]);
  
  // 컴포넌트 언마운트 시 모니터링 정지
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, []);
  
  // ===== 반환값 =====
  
  return {
    // 상태
    metrics,
    alerts,
    isMonitoring,
    
    // 통계
    stats: getPerformanceStats(),
    
    // 제어 함수들
    startMonitoring,
    stopMonitoring,
    clearMetrics,
    dismissAlert,
    
    // 측정 함수들
    recordApiMetric,
    measureApiCall,
    
    // 설정
    thresholds: activeThresholds,
  };
};

export default usePerformanceMonitor;