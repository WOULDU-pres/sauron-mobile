/**
 * @fileoverview 에러 로깅 시스템
 * 
 * 앱에서 발생하는 모든 에러를 체계적으로 수집, 분류, 저장하는 시스템입니다.
 * 
 * @features
 * - 구조화된 에러 로깅
 * - 에러 분류 및 우선순위 지정
 * - 로컬 저장 및 원격 전송
 * - 성능 정보 포함
 * - 개인정보 보호
 * 
 * @author Sauron Mobile Team
 * @version 1.0.0
 * @since 2024
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== 타입 정의 =====

/**
 * 에러 심각도 레벨
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * 에러 카테고리
 */
export type ErrorCategory = 
  | 'network' 
  | 'api' 
  | 'ui' 
  | 'storage' 
  | 'permission' 
  | 'validation' 
  | 'business_logic' 
  | 'unknown';

/**
 * 에러 로그 엔트리 인터페이스
 */
export interface ErrorLogEntry {
  /** 고유 ID */
  id: string;
  /** 에러 메시지 */
  message: string;
  /** 에러 스택 트레이스 */
  stack?: string;
  /** 에러 카테고리 */
  category: ErrorCategory;
  /** 심각도 */
  severity: ErrorSeverity;
  /** 발생 시각 */
  timestamp: Date;
  /** 사용자 액션 (개인정보 제거됨) */
  userAction?: string;
  /** 앱 상태 정보 */
  appState: {
    version: string;
    screen: string;
    userId?: string; // 해시된 값
    deviceInfo: {
      platform: string;
      version: string;
      model?: string;
    };
  };
  /** 성능 정보 */
  performance: {
    memoryUsage?: number;
    responseTime?: number;
    networkStatus: 'online' | 'offline';
  };
  /** 추가 컨텍스트 */
  context?: Record<string, any>;
  /** 해결 여부 */
  resolved: boolean;
}

/**
 * 에러 통계 인터페이스
 */
export interface ErrorStats {
  /** 총 에러 수 */
  totalErrors: number;
  /** 카테고리별 에러 수 */
  errorsByCategory: Record<ErrorCategory, number>;
  /** 심각도별 에러 수 */
  errorsBySeverity: Record<ErrorSeverity, number>;
  /** 최근 24시간 에러 수 */
  last24Hours: number;
  /** 해결된 에러 수 */
  resolvedErrors: number;
  /** 가장 빈번한 에러 */
  mostFrequentError?: string;
}

// ===== 설정 =====

/** 로컬 저장소 키 */
const ERROR_LOG_STORAGE_KEY = '@sauron_error_logs';

/** 최대 로그 보관 개수 */
const MAX_LOG_ENTRIES = 1000;

/** 로그 보관 기간 (일) */
const LOG_RETENTION_DAYS = 7;

// ===== 유틸리티 함수들 =====

/**
 * 고유 ID 생성
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 사용자 정보 해싱 (개인정보 보호)
 */
const hashUserId = (userId: string): string => {
  // 간단한 해싱 (실제 환경에서는 더 강력한 해싱 사용)
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수 변환
  }
  return `user_${Math.abs(hash)}`;
};

/**
 * 민감한 정보 제거
 */
const sanitizeData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'email', 'phone'];
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  
  return sanitized;
};

/**
 * 에러 카테고리 자동 감지
 */
const detectErrorCategory = (error: Error): ErrorCategory => {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return 'network';
  }
  if (message.includes('api') || message.includes('request') || stack.includes('axios')) {
    return 'api';
  }
  if (message.includes('render') || message.includes('component') || stack.includes('react')) {
    return 'ui';
  }
  if (message.includes('storage') || message.includes('asyncstorage')) {
    return 'storage';
  }
  if (message.includes('permission') || message.includes('denied')) {
    return 'permission';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  
  return 'unknown';
};

/**
 * 에러 심각도 자동 감지
 */
const detectErrorSeverity = (error: Error, category: ErrorCategory): ErrorSeverity => {
  const message = error.message.toLowerCase();
  
  // 심각한 키워드들
  if (message.includes('crash') || message.includes('fatal') || message.includes('critical')) {
    return 'critical';
  }
  
  // API 에러는 보통 중요
  if (category === 'api' || category === 'network') {
    return 'high';
  }
  
  // UI 에러는 보통 중간
  if (category === 'ui') {
    return 'medium';
  }
  
  // 기본값
  return 'medium';
};

// ===== 메인 에러 로거 클래스 =====

/**
 * 에러 로깅 시스템 클래스
 */
class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private isInitialized = false;
  
  /**
   * 초기화
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.loadLogs();
      await this.cleanupOldLogs();
      this.isInitialized = true;
      console.log('📝 Error Logger initialized');
    } catch (error) {
      console.error('Failed to initialize ErrorLogger:', error);
    }
  }
  
  /**
   * 에러 로그 기록
   */
  async logError(
    error: Error,
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      userAction?: string;
      screen?: string;
      userId?: string;
      context?: Record<string, any>;
    } = {}
  ): Promise<void> {
    try {
      const category = options.category || detectErrorCategory(error);
      const severity = options.severity || detectErrorSeverity(error, category);
      
      const logEntry: ErrorLogEntry = {
        id: generateId(),
        message: error.message,
        stack: error.stack,
        category,
        severity,
        timestamp: new Date(),
        userAction: options.userAction,
        appState: {
          version: '1.0.0', // TODO: 실제 앱 버전으로 대체
          screen: options.screen || 'unknown',
          userId: options.userId ? hashUserId(options.userId) : undefined,
          deviceInfo: {
            platform: 'react-native',
            version: '0.72.0', // TODO: 실제 RN 버전으로 대체
          },
        },
        performance: {
          networkStatus: 'online', // TODO: 실제 네트워크 상태 감지
        },
        context: options.context ? sanitizeData(options.context) : undefined,
        resolved: false,
      };
      
      this.logs.push(logEntry);
      await this.saveLogs();
      
      // 콘솔에도 출력 (개발 환경)
      if (__DEV__) {
        console.error(`[${severity.toUpperCase()}] ${category}:`, error.message);
        if (error.stack) {
          console.error(error.stack);
        }
      }
      
      // 심각한 에러의 경우 즉시 원격 전송 (TODO: 구현)
      if (severity === 'critical') {
        await this.sendCriticalError(logEntry);
      }
      
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }
  
  /**
   * 커스텀 로그 기록
   */
  async logCustom(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context?: Record<string, any>
  ): Promise<void> {
    const customError = new Error(message);
    await this.logError(customError, { category, severity, context });
  }
  
  /**
   * 로그 조회
   */
  getLogs(filter?: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    limit?: number;
    since?: Date;
  }): ErrorLogEntry[] {
    let filteredLogs = [...this.logs];
    
    if (filter) {
      if (filter.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filter.category);
      }
      if (filter.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filter.severity);
      }
      if (filter.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.since!);
      }
      if (filter.limit) {
        filteredLogs = filteredLogs.slice(-filter.limit);
      }
    }
    
    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  /**
   * 에러 통계 계산
   */
  getStats(): ErrorStats {
    const totalErrors = this.logs.length;
    
    // 카테고리별 통계
    const errorsByCategory: Record<ErrorCategory, number> = {
      network: 0,
      api: 0,
      ui: 0,
      storage: 0,
      permission: 0,
      validation: 0,
      business_logic: 0,
      unknown: 0,
    };
    
    // 심각도별 통계
    const errorsBySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    
    // 최근 24시간 통계
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let last24HoursCount = 0;
    let resolvedErrors = 0;
    
    // 메시지별 빈도 계산
    const messageCount: Record<string, number> = {};
    
    for (const log of this.logs) {
      errorsByCategory[log.category]++;
      errorsBySeverity[log.severity]++;
      
      if (log.timestamp >= last24Hours) {
        last24HoursCount++;
      }
      
      if (log.resolved) {
        resolvedErrors++;
      }
      
      messageCount[log.message] = (messageCount[log.message] || 0) + 1;
    }
    
    // 가장 빈번한 에러 찾기
    const mostFrequentError = Object.entries(messageCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    
    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      last24Hours: last24HoursCount,
      resolvedErrors,
      mostFrequentError,
    };
  }
  
  /**
   * 에러 해결 표시
   */
  async markResolved(errorId: string): Promise<void> {
    const logIndex = this.logs.findIndex(log => log.id === errorId);
    if (logIndex !== -1) {
      this.logs[logIndex].resolved = true;
      await this.saveLogs();
    }
  }
  
  /**
   * 로그 정리
   */
  async clearLogs(): Promise<void> {
    this.logs = [];
    await this.saveLogs();
  }
  
  /**
   * 심각한 에러 즉시 전송 (미구현)
   */
  private async sendCriticalError(logEntry: ErrorLogEntry): Promise<void> {
    // TODO: 실제 서버로 에러 정보 전송
    console.warn('Critical error detected:', logEntry.message);
  }
  
  /**
   * 로그를 로컬 저장소에서 불러오기
   */
  private async loadLogs(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(ERROR_LOG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.logs = parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load error logs:', error);
      this.logs = [];
    }
  }
  
  /**
   * 로그를 로컬 저장소에 저장
   */
  private async saveLogs(): Promise<void> {
    try {
      // 최대 개수 제한
      if (this.logs.length > MAX_LOG_ENTRIES) {
        this.logs = this.logs.slice(-MAX_LOG_ENTRIES);
      }
      
      await AsyncStorage.setItem(ERROR_LOG_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save error logs:', error);
    }
  }
  
  /**
   * 오래된 로그 정리
   */
  private async cleanupOldLogs(): Promise<void> {
    const cutoffDate = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const initialCount = this.logs.length;
    
    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);
    
    if (this.logs.length !== initialCount) {
      await this.saveLogs();
      console.log(`🧹 Cleaned up ${initialCount - this.logs.length} old error logs`);
    }
  }
}

// ===== 싱글톤 인스턴스 =====

/** 전역 에러 로거 인스턴스 */
export const errorLogger = new ErrorLogger();

// ===== 편의 함수들 =====

/**
 * 에러 로깅 (간단 버전)
 */
export const logError = async (
  error: Error,
  context?: string,
  category?: ErrorCategory
): Promise<void> => {
  await errorLogger.logError(error, {
    category,
    userAction: context,
  });
};

/**
 * API 에러 로깅
 */
export const logApiError = async (
  error: Error,
  endpoint: string,
  responseTime?: number
): Promise<void> => {
  await errorLogger.logError(error, {
    category: 'api',
    context: { endpoint, responseTime },
  });
};

/**
 * UI 에러 로깅
 */
export const logUiError = async (
  error: Error,
  screen: string,
  userAction?: string
): Promise<void> => {
  await errorLogger.logError(error, {
    category: 'ui',
    screen,
    userAction,
  });
};

/**
 * 초기화 함수
 */
export const initializeErrorLogger = async (): Promise<void> => {
  await errorLogger.initialize();
};

export default errorLogger;