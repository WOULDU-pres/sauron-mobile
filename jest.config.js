module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/e2e/setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|@unimodules|unimodules|expo-.*|@expo-google-fonts/.*|react-native-vector-icons|react-native-reanimated|@react-navigation/.*|react-native-safe-area-context|react-native-screens|lucide-react-native|react-native-css-interop|nativewind|@rn-primitives/.*|class-variance-authority)/)",
  ],
  testMatch: [
    "**/__tests__/**/*.(js|jsx|ts|tsx)",
    "**/?(*.)+(spec|test).(js|jsx|ts|tsx)",
  ],
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "~/lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "html"],
  testEnvironment: "node",
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/$1",
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  testTimeout: 30000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  fakeTimers: {
    enableGlobally: false,
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
