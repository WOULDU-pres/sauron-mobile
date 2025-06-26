import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

// Configure jest-image-snapshot with SSIM algorithm for accurate visual comparison
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: {
    threshold: 0.01, // 1% per-pixel threshold for detailed comparison
  },
  failureThreshold: 0.005, // 0.5% overall difference threshold (≤5px equivalent)
  failureThresholdType: 'percent',
  comparisonMethod: 'ssim', // Use SSIM (Structural Similarity Index) for better accuracy
  blur: 1, // Slight blur to reduce noise
  allowSizeMismatch: false,
  storeReceivedOnFailure: true,
  customSnapshotsDir: './e2e/visual/baselines',
  customDiffDir: './e2e/visual/diffs',
  customReceivedDir: './e2e/visual/received',
});

expect.extend({ toMatchImageSnapshot });

// Global test setup
beforeEach(() => {
  // Reset date mocking for consistent timestamps
  const mockDate = new Date('2024-01-15T10:30:00.000Z');
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