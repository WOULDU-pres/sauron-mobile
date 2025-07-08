/**
 * API Configuration for Sauron Mobile
 * Manages server endpoints, timeouts, and authentication settings
 */

import { Platform } from 'react-native';
import { API_CONSTANTS, TIME_CONSTANTS } from '@shared/constants';

// Environment configuration
const getEnvironment = () => {
  // In production, these would come from environment variables or build config
  if (__DEV__) {
    return 'development';
  }
  return 'production';
};

const API_CONFIGS = {
  development: {
    BASE_URL: 'http://localhost:8080', // Spring Boot dev server
    TIMEOUT: 5000, // 5 seconds for development
  },
  production: {
    BASE_URL: 'https://api.sauron.example.com', // Replace with actual production URL
    TIMEOUT: 1000, // 1 second for production (requirement)
  },
} as const;

const environment = getEnvironment();
const config = API_CONFIGS[environment];

export const API_CONFIG = {
  // Base configuration
  BASE_URL: config.BASE_URL,
  TIMEOUT: config.TIMEOUT,
  
  // API endpoints - using shared constants
  ENDPOINTS: {
    MESSAGES: API_CONSTANTS.BASE_PATH + API_CONSTANTS.ENDPOINTS.MESSAGES,
    AUTH: {
      LOGIN: API_CONSTANTS.BASE_PATH + API_CONSTANTS.ENDPOINTS.AUTH + '/login',
      REFRESH: API_CONSTANTS.BASE_PATH + API_CONSTANTS.ENDPOINTS.AUTH + '/refresh',
      LOGOUT: API_CONSTANTS.BASE_PATH + API_CONSTANTS.ENDPOINTS.AUTH + '/logout',
    },
    HEALTH: API_CONSTANTS.ENDPOINTS.HEALTH,
    METRICS: API_CONSTANTS.ENDPOINTS.METRICS,
  },
  
  // HTTP configuration - using shared constants
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': `Sauron-Mobile/${Platform.OS}`,
    [API_CONSTANTS.HEADERS.X_CLIENT_VERSION]: '1.0.0',
  },
  
  // Retry configuration - using shared constants
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: TIME_CONSTANTS.MILLISECONDS.SECOND,
    MAX_DELAY: 5 * TIME_CONSTANTS.MILLISECONDS.SECOND,
    BACKOFF_FACTOR: 2,
  },
  
  // Network configuration
  NETWORK: {
    ENABLE_CACHE: true,
    ENABLE_RETRY: true,
    ENABLE_OFFLINE_QUEUE: true,
  },
  
  // JWT configuration - using shared constants
  JWT: {
    STORAGE_KEY: '@sauron_jwt_token',
    REFRESH_STORAGE_KEY: '@sauron_refresh_token',
    TOKEN_EXPIRE_MARGIN: TIME_CONSTANTS.MILLISECONDS.MINUTE,
  },
} as const;

// Type exports
export type Environment = keyof typeof API_CONFIGS;
export type ApiEndpoint = typeof API_CONFIG.ENDPOINTS.MESSAGES | 
                          typeof API_CONFIG.ENDPOINTS.AUTH.LOGIN |
                          typeof API_CONFIG.ENDPOINTS.AUTH.REFRESH |
                          typeof API_CONFIG.ENDPOINTS.AUTH.LOGOUT;

// Utility functions
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const isDevEnvironment = (): boolean => {
  return environment === 'development';
};

export const getRetryDelay = (attempt: number): number => {
  const delay = API_CONFIG.RETRY.INITIAL_DELAY * Math.pow(API_CONFIG.RETRY.BACKOFF_FACTOR, attempt - 1);
  return Math.min(delay, API_CONFIG.RETRY.MAX_DELAY);
};