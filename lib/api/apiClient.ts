/**
 * @fileoverview API 클라이언트
 * 
 * 백엔드 서버와 통신하는 중앙화된 API 클라이언트입니다.
 * 성능 모니터링, 에러 처리, 재시도 로직을 포함합니다.
 * 
 * @features
 * - 자동 인증 토큰 관리
 * - 요청/응답 인터셉터
 * - 에러 처리 및 재시도
 * - 성능 모니터링 통합
 * - 타입 안전성
 * 
 * @author Sauron Mobile Team
 * @version 1.0.0
 * @since 2024
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorLogger, logApiError } from '~/lib/errorLogger';

// ===== 설정 =====

/** API 기본 URL */
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8080/api' // Android 에뮬레이터용
  : 'https://api.sauron.app/api'; // 프로덕션

/** 요청 타임아웃 (ms) */
const REQUEST_TIMEOUT = 10000;

/** 재시도 횟수 */
const MAX_RETRIES = 3;

/** 재시도 지연시간 (ms) */
const RETRY_DELAY = 1000;

// ===== 타입 정의 =====

/**
 * API 응답 기본 구조
 */
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

/**
 * API 에러 응답 구조
 */
interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
}

/**
 * 요청 설정 인터페이스
 */
interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
}

/**
 * 메시지 요청 DTO
 */
export interface MessageRequest {
  messageId: string;
  chatRoomTitle: string;
  senderHash: string;
  messageContent: string;
  receivedAt: string;
  packageName: string;
  deviceId: string;
  priority: 'low' | 'normal' | 'high';
}

/**
 * 메시지 응답 DTO
 */
export interface MessageResponse {
  messageId: string;
  processed: boolean;
  detectionResult?: {
    isHarmful: boolean;
    confidence: number;
    category: string;
    reason: string;
  };
  timestamp: string;
}

/**
 * 큐 상태 응답
 */
export interface QueueStatus {
  mainQueueSize: number;
  dlqSize: number;
  healthy: boolean;
  status: string;
}

/**
 * 대시보드 통계 응답
 */
export interface DashboardStats {
  totalMessages: number;
  harmfulMessages: number;
  processedToday: number;
  categories: {
    advertisement: number;
    spam: number;
    abuse: number;
    normal: number;
  };
  recentActivity: Array<{
    timestamp: string;
    count: number;
  }>;
}

// ===== 유틸리티 함수들 =====

/**
 * 지연 함수
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 토큰 저장
 */
const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('@sauron_auth_token', token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
};

/**
 * 토큰 불러오기
 */
const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('@sauron_auth_token');
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

/**
 * 토큰 제거
 */
const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@sauron_auth_token');
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

// ===== API 클라이언트 클래스 =====

/**
 * API 클라이언트 클래스
 */
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  
  constructor(baseURL: string = API_BASE_URL, timeout: number = REQUEST_TIMEOUT) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }
  
  /**
   * HTTP 요청 실행
   */
  private async makeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const { method, url, data, headers = {}, timeout = this.defaultTimeout, retries = MAX_RETRIES, skipAuth = false } = config;
    
    // 인증 토큰 추가
    if (!skipAuth) {
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // 기본 헤더 설정
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    };
    
    const fullUrl = `${this.baseURL}${url}`;
    
    let lastError: any;
    
    // 재시도 로직
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(fullUrl, {
          method,
          headers: defaultHeaders,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const responseTime = Date.now() - startTime;
        
        // 응답 처리
        const responseText = await response.text();
        let responseData: any;
        
        try {
          responseData = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
          responseData = responseText;
        }
        
        if (!response.ok) {
          const apiError = new Error(`API Error: ${response.status} ${response.statusText}`);
          await logApiError(apiError, fullUrl, responseTime);
          
          // 인증 에러 처리
          if (response.status === 401) {
            await removeToken();
            throw new Error('Authentication required. Please login again.');
          }
          
          throw apiError;
        }
        
        return {
          data: responseData,
          status: response.status,
          message: 'Success',
        };
        
      } catch (error: any) {
        lastError = error;
        const responseTime = Date.now() - startTime;
        
        // 네트워크 에러 로깅
        await errorLogger.logError(error, {
          category: 'network',
          context: { 
            url: fullUrl, 
            method, 
            attempt: attempt + 1,
            responseTime 
          },
        });
        
        // 마지막 시도가 아니면 재시도
        if (attempt < retries) {
          console.log(`Request failed, retrying in ${RETRY_DELAY}ms... (${attempt + 1}/${retries})`);
          await delay(RETRY_DELAY * (attempt + 1)); // 지수적 백오프
          continue;
        }
        
        break;
      }
    }
    
    throw lastError;
  }
  
  // ===== HTTP 메서드들 =====
  
  /**
   * GET 요청
   */
  async get<T>(url: string, config: Partial<RequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'GET', url, ...config });
  }
  
  /**
   * POST 요청
   */
  async post<T>(url: string, data?: any, config: Partial<RequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'POST', url, data, ...config });
  }
  
  /**
   * PUT 요청
   */
  async put<T>(url: string, data?: any, config: Partial<RequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'PUT', url, data, ...config });
  }
  
  /**
   * DELETE 요청
   */
  async delete<T>(url: string, config: Partial<RequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'DELETE', url, ...config });
  }
  
  // ===== 특화된 API 메서드들 =====
  
  /**
   * 메시지 처리 요청
   */
  async processMessage(message: MessageRequest): Promise<MessageResponse> {
    const response = await this.post<MessageResponse>('/v1/messages', message);
    return response.data;
  }
  
  /**
   * 서비스 헬스 체크
   */
  async healthCheck(): Promise<{ healthy: boolean; status: string }> {
    try {
      const response = await this.get<string>('/v1/messages/health', { skipAuth: true });
      return { healthy: true, status: 'healthy' };
    } catch (error) {
      return { healthy: false, status: 'unhealthy' };
    }
  }
  
  /**
   * 큐 상태 조회
   */
  async getQueueStatus(): Promise<QueueStatus> {
    const response = await this.get<QueueStatus>('/v1/messages/queue/status');
    return response.data;
  }
  
  /**
   * 처리 통계 조회
   */
  async getStats(): Promise<string> {
    const response = await this.get<string>('/v1/messages/stats');
    return response.data;
  }
  
  /**
   * 대시보드 데이터 조회 (모킹된 데이터)
   */
  async getDashboardData(): Promise<DashboardStats> {
    // TODO: 실제 백엔드 엔드포인트가 구현되면 교체
    try {
      // 헬스체크를 통해 서버 연결 확인
      await this.healthCheck();
      
      // 임시로 모킹된 데이터 반환
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
        recentActivity: [
          { timestamp: new Date(Date.now() - 60000).toISOString(), count: 23 },
          { timestamp: new Date(Date.now() - 120000).toISOString(), count: 18 },
          { timestamp: new Date(Date.now() - 180000).toISOString(), count: 31 },
          { timestamp: new Date(Date.now() - 240000).toISOString(), count: 12 },
          { timestamp: new Date(Date.now() - 300000).toISOString(), count: 27 },
        ],
      };
    } catch (error) {
      // 서버 연결 실패 시 로컬 데이터 반환
      throw new Error('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
    }
  }
  
  /**
   * 인증 토큰 설정
   */
  async setAuthToken(token: string): Promise<void> {
    await saveToken(token);
  }
  
  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    await removeToken();
  }
  
  /**
   * 현재 인증 상태 확인
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return !!token;
  }
}

// ===== 싱글톤 인스턴스 =====

/** 전역 API 클라이언트 인스턴스 */
export const apiClient = new ApiClient();

// ===== 편의 함수들 =====

/**
 * 성능 모니터링과 함께 API 호출
 */
export const withPerformanceMonitoring = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const responseTime = Date.now() - startTime;
    
    // 성공 로깅
    console.log(`✅ ${endpoint}: ${responseTime}ms`);
    
    return result;
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    // 에러 로깅
    await logApiError(error, endpoint, responseTime);
    console.error(`❌ ${endpoint}: ${responseTime}ms - ${error.message}`);
    
    throw error;
  }
};

export default apiClient;