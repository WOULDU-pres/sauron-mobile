/**
 * HTTP Client Service for Sauron Mobile
 * Provides authenticated HTTP communication with the Spring Boot API server
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildApiUrl, getRetryDelay } from '../../../constants/ApiConfig';

// Types for authentication
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
  userInfo?: any;
}

/**
 * HTTP Client class with JWT authentication and retry logic
 */
class HttpClient {
  private axiosInstance: AxiosInstance;
  private currentTokens: AuthTokens | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor for JWT token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getValidAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await this.handleAuthenticationFailure();
            return Promise.reject(this.createApiError('AUTH_FAILED', 'Authentication failed', 401));
          }
        }

        return Promise.reject(this.createApiErrorFromAxiosError(error));
      }
    );
  }

  /**
   * Get valid access token, refresh if needed
   */
  private async getValidAccessToken(): Promise<string | null> {
    if (!this.currentTokens) {
      this.currentTokens = await this.loadTokensFromStorage();
    }

    if (!this.currentTokens?.accessToken) {
      return null;
    }

    // Check if token is expired (with margin)
    if (this.currentTokens.expiresAt) {
      const now = Date.now();
      const expiryTime = this.currentTokens.expiresAt - API_CONFIG.JWT.TOKEN_EXPIRE_MARGIN;
      
      if (now >= expiryTime) {
        // Token expired, attempt refresh
        try {
          return await this.refreshAccessToken();
        } catch (error) {
          return null;
        }
      }
    }

    return this.currentTokens.accessToken;
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh operation
   */
  private async performTokenRefresh(): Promise<string> {
    if (!this.currentTokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH),
        { refreshToken: this.currentTokens.refreshToken },
        { timeout: API_CONFIG.TIMEOUT }
      );

      const { accessToken, refreshToken, expiresIn } = response.data;
      
      const newTokens: AuthTokens = {
        accessToken,
        refreshToken: refreshToken || this.currentTokens.refreshToken,
        expiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : undefined,
      };

      await this.saveTokensToStorage(newTokens);
      this.currentTokens = newTokens;

      return accessToken;
    } catch (error) {
      await this.clearTokensFromStorage();
      this.currentTokens = null;
      throw error;
    }
  }

  /**
   * Handle authentication failure - clear tokens and notify app
   */
  private async handleAuthenticationFailure(): Promise<void> {
    await this.clearTokensFromStorage();
    this.currentTokens = null;
    
    // TODO: Emit event for app-wide authentication failure handling
    // EventEmitter.emit('authenticationFailed');
  }

  /**
   * Load tokens from AsyncStorage
   */
  private async loadTokensFromStorage(): Promise<AuthTokens | null> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(API_CONFIG.JWT.STORAGE_KEY),
        AsyncStorage.getItem(API_CONFIG.JWT.REFRESH_STORAGE_KEY),
      ]);

      if (!accessToken) {
        return null;
      }

      return {
        accessToken,
        refreshToken: refreshToken || undefined,
      };
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      return null;
    }
  }

  /**
   * Save tokens to AsyncStorage
   */
  private async saveTokensToStorage(tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(API_CONFIG.JWT.STORAGE_KEY, tokens.accessToken),
        tokens.refreshToken ? 
          AsyncStorage.setItem(API_CONFIG.JWT.REFRESH_STORAGE_KEY, tokens.refreshToken) :
          AsyncStorage.removeItem(API_CONFIG.JWT.REFRESH_STORAGE_KEY),
      ]);
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  /**
   * Clear tokens from AsyncStorage
   */
  private async clearTokensFromStorage(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(API_CONFIG.JWT.STORAGE_KEY),
        AsyncStorage.removeItem(API_CONFIG.JWT.REFRESH_STORAGE_KEY),
      ]);
    } catch (error) {
      console.error('Failed to clear tokens from storage:', error);
    }
  }

  /**
   * Create standardized API error from Axios error
   */
  private createApiErrorFromAxiosError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data as any;
      return this.createApiError(
        errorData?.code || 'SERVER_ERROR',
        errorData?.message || error.message,
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // Network error
      return this.createApiError(
        'NETWORK_ERROR',
        'Network connection failed',
        0,
        error.request
      );
    } else {
      // Request setup error
      return this.createApiError(
        'REQUEST_ERROR',
        error.message,
        0,
        error
      );
    }
  }

  /**
   * Create standardized API error
   */
  private createApiError(code: string, message: string, statusCode?: number, userInfo?: any): ApiError {
    return {
      code,
      message,
      statusCode,
      userInfo,
    };
  }

  // Public methods

  /**
   * Set authentication tokens
   */
  public async setAuthTokens(tokens: AuthTokens): Promise<void> {
    this.currentTokens = tokens;
    await this.saveTokensToStorage(tokens);
  }

  /**
   * Clear authentication tokens
   */
  public async clearAuthTokens(): Promise<void> {
    await this.handleAuthenticationFailure();
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const token = await this.getValidAccessToken();
    return !!token;
  }

  /**
   * Make authenticated GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  /**
   * Make authenticated POST request
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  /**
   * Make authenticated PUT request
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  /**
   * Make authenticated DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }
}

// Singleton instance
const httpClient = new HttpClient();

export default httpClient;