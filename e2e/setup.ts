import { configureToMatchImageSnapshot } from "jest-image-snapshot";
import "react-native-gesture-handler/jestSetup";
import "@testing-library/jest-native/extend-expect";

// Configure jest-image-snapshot with SSIM algorithm for accurate visual comparison
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  comparisonMethod: "ssim",
  failureThreshold: 0.01,
  failureThresholdType: "percent",
  blur: 1,
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

// Date 모킹 수정
const mockDate = new Date("2024-01-15T10:30:00.000Z");
const originalDate = Date;

// 올바른 Date 모킹
const DateConstructor = jest
  .fn()
  .mockImplementation((date?: string | number | Date) => {
    if (date) {
      return new originalDate(date);
    }
    return mockDate;
  }) as any;

DateConstructor.now = jest.fn(() => mockDate.getTime());
DateConstructor.UTC = originalDate.UTC;
DateConstructor.parse = originalDate.parse;
Object.setPrototypeOf(DateConstructor, originalDate.prototype);

global.Date = DateConstructor;

// 테스트 타임아웃 설정
jest.setTimeout(30000);

// Global test setup - use Object.defineProperty to avoid read-only error
Object.defineProperty(process.env, "NODE_ENV", {
  value: "test",
  writable: true,
});
