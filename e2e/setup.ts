import { configureToMatchImageSnapshot } from "jest-image-snapshot";
import "react-native-gesture-handler/jestSetup";
import "@testing-library/jest-native/extend-expect";

// Configure jest-image-snapshot with SSIM algorithm for accurate visual comparison
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: {
    threshold: 0.01, // 1% per-pixel threshold for detailed comparison
  },
  failureThreshold: 0.005, // 0.5% overall difference threshold (≤5px equivalent)
  failureThresholdType: "percent",
  comparisonMethod: "ssim", // Use SSIM (Structural Similarity Index) for better accuracy
  blur: 1, // Slight blur to reduce noise
  allowSizeMismatch: false,
  storeReceivedOnFailure: true,
  customSnapshotsDir: "./e2e/visual/baselines",
  customDiffDir: "./e2e/visual/diffs",
  customReceivedDir: "./e2e/visual/received",
});

expect.extend({ toMatchImageSnapshot });

// Node.js 환경용 btoa/atob polyfill 추가
if (typeof global.btoa === "undefined") {
  global.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
}
if (typeof global.atob === "undefined") {
  global.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
}

// AsyncStorage 모킹
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// React Native 기본 컴포넌트 모킹
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: "ios",
      select: jest.fn((obj) => obj.ios),
    },
  };
});

// Date 모킹 수정
const mockDate = new Date("2024-01-15T10:30:00.000Z");
const originalDate = Date;

// 올바른 Date 모킹
global.Date = jest.fn().mockImplementation((date?: string | number | Date) => {
  if (date) {
    return new originalDate(date);
  }
  return mockDate;
}) as any;

global.Date.now = jest.fn(() => mockDate.getTime());
global.Date.UTC = originalDate.UTC;
global.Date.parse = originalDate.parse;
global.Date.prototype = originalDate.prototype;

// 테스트 타임아웃 설정
jest.setTimeout(30000);

// Global test setup
beforeEach(() => {
  // Reset date mocking for consistent timestamps
  const mockDate = new Date("2024-01-15T10:30:00.000Z");
  global.Date = jest.fn(() => mockDate) as any;
  global.Date.now = jest.fn(() => mockDate.getTime());
  global.Date.UTC = Date.UTC;
  global.Date.parse = Date.parse;

  // Mock Math.random for consistent randomization
  global.Math.random = jest.fn(() => 0.5);

  // Mock performance.now for consistent timing
  global.performance.now = jest.fn(() => 1000);
});

afterEach(() => {
  jest.restoreAllMocks();
});
