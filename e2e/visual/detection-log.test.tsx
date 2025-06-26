import React from 'react';
import { render } from '@testing-library/react-native';
import { captureScreenshot } from '../utils/screenshot-helper';
import DetectionLogView from '../../app/(tabs)/detection-log';

describe('Detection Log Screen Visual Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Light Theme', () => {
    it('should match detection log screen snapshot in light theme', async () => {
      const screenshot = await captureScreenshot(
        <DetectionLogView />,
        { theme: 'light', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'detection-log-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should handle detection log interactions in light theme', async () => {
      const { getByTestId } = render(<DetectionLogView />);
      
      // Test detection log specific interactions
      const clearLogButton = getByTestId('clear-log');
      const exportLogButton = getByTestId('export-log');
      
      expect(clearLogButton).toBeTruthy();
      expect(exportLogButton).toBeTruthy();
      
      const screenshot = await captureScreenshot(
        <DetectionLogView />,
        { theme: 'light', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'detection-log-light-interactions',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Dark Theme', () => {
    it('should match detection log screen snapshot in dark theme', async () => {
      const screenshot = await captureScreenshot(
        <DetectionLogView />,
        { theme: 'dark', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'detection-log-dark',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should handle detection log interactions in dark theme', async () => {
      const screenshot = await captureScreenshot(
        <DetectionLogView />,
        { theme: 'dark', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'detection-log-dark-interactions',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Responsive Design', () => {
    it('should maintain layout consistency on different screen sizes', async () => {
      // Test tablet dimensions for detection log
      const tabletScreenshot = await captureScreenshot(
        <DetectionLogView />,
        { 
          theme: 'light', 
          dimensions: { width: 768, height: 1024 },
          waitTime: 500 
        }
      );

      expect(tabletScreenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'detection-log-tablet',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Scrollable Content', () => {
    it('should handle scrollable log content correctly', async () => {
      // Test with simulated scroll content
      const screenshot = await captureScreenshot(
        <DetectionLogView />,
        { 
          theme: 'light', 
          waitTime: 1000 // Extra time for list rendering
        }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'detection-log-scrollable',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });
}); 