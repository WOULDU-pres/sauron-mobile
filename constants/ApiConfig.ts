/**
 * API Configuration for Sauron Mobile
 * Manages server endpoints, timeouts, and authentication settings
 */

import { Platform } from 'react-native';

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
  
  // API endpoints
  ENDPOINTS: {
    MESSAGES: '/v1/messages',
    AUTH: {
      LOGIN: '/v1/auth/login',
      REFRESH: '/v1/auth/refresh',
      LOGOUT: '/v1/auth/logout',
    },
  },
  
  // HTTP configuration
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': `Sauron-Mobile/${Platform.OS}`,
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000, // 1 second
    MAX_DELAY: 5000, // 5 seconds
    BACKOFF_FACTOR: 2, // Exponential backoff
  },
  
  // Network configuration
  NETWORK: {
    ENABLE_CACHE: true,
    ENABLE_RETRY: true,
    ENABLE_OFFLINE_QUEUE: true,
  },
  
  // JWT configuration
  JWT: {
    STORAGE_KEY: '@sauron_jwt_token',
    REFRESH_STORAGE_KEY: '@sauron_refresh_token',
    TOKEN_EXPIRE_MARGIN: 60000, // 1 minute before expiry
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