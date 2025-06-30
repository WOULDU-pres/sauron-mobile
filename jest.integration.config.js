module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/integration/setup.ts'],
  testMatch: ['**/__tests__/integration/**/*.(test|spec).(js|jsx|ts|tsx)'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  collectCoverageFrom: [
    '~/lib/**/*.{js,jsx,ts,tsx}',
    '~/hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testTimeout: 30000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@tanstack|zustand|axios)/)',
  ],
  // Avoid React Native preset conflicts
  preset: undefined,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/~/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
