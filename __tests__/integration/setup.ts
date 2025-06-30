/**
 * Integration Test Setup
 * Minimal setup to avoid React Native conflicts
 */

import '@testing-library/jest-native/extend-expect';

// Mock React Native CSS Interop first to avoid color scheme errors
jest.mock('react-native-css-interop', () => ({
  colorScheme: {
    getColorScheme: jest.fn(() => 'light'),
    setColorScheme: jest.fn(),
    addColorSchemeListener: jest.fn(),
    removeColorSchemeListener: jest.fn(),
  },
}));

// Mock React Native components and modules that aren't needed for integration tests
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    currentState: 'active',
  },
  NativeModules: {},
  Platform: {
    OS: 'android',
    Version: 30,
  },
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  },
}));

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: jest.fn((component) => component),
  useColorScheme: jest.fn(() => ({ colorScheme: 'light' })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Enhanced Axios mocking with interceptors
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
  defaults: {
    headers: {
      common: {},
    },
  },
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
  defaults: {
    headers: {
      common: {},
    },
  },
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    appOwnership: 'standalone',
    platform: {
      android: {
        versionCode: 1,
      },
    },
  },
}));

// Setup global objects
global.console = {
  ...console,
  // Suppress console logs during tests unless needed
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock performance object
global.performance = {
  now: jest.fn(() => Date.now()),
} as any;

// Define React Native global variables
(global as any).__DEV__ = true;

// Mock window.matchMedia for CSS color scheme queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});