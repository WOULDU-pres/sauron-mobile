module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts', '@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@unimodules|unimodules|expo-.*|@expo-google-fonts/.*|react-native-vector-icons|react-native-reanimated|@react-navigation/.*|react-native-safe-area-context|react-native-screens|lucide-react-native)/)',
  ],
  testMatch: ['**/__tests__/**/*.(js|jsx|ts|tsx)', '**/?(*.)+(spec|test).(js|jsx|ts|tsx)'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '~/lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/~/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testTimeout: 30000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
}; 