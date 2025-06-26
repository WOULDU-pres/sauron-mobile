import React from 'react';
import { render } from '@testing-library/react-native';
import { captureScreenshot } from '../utils/screenshot-helper';
import ReportsView from '../../app/(tabs)/reports';

describe('Reports Screen Visual Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Light Theme', () => {
    it('should match reports screen snapshot in light theme', async () => {
      const screenshot = await captureScreenshot(
        <ReportsView />,
        { theme: 'light', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'reports-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should handle reports interactions in light theme', async () => {
      const { getByTestId } = render(<ReportsView />);
      
      // Test reports-specific interactions
      const generateReportButton = getByTestId('generate-report');
      const filterButton = getByTestId('report-filter');
      
      expect(generateReportButton).toBeTruthy();
      expect(filterButton).toBeTruthy();
      
      const screenshot = await captureScreenshot(
        <ReportsView />,
        { theme: 'light', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'reports-light-interactions',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Dark Theme', () => {
    it('should match reports screen snapshot in dark theme', async () => {
      const screenshot = await captureScreenshot(
        <ReportsView />,
        { theme: 'dark', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'reports-dark',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should handle reports interactions in dark theme', async () => {
      const screenshot = await captureScreenshot(
        <ReportsView />,
        { theme: 'dark', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'reports-dark-interactions',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Responsive Design', () => {
    it('should maintain layout consistency on different screen sizes', async () => {
      // Test tablet dimensions for reports
      const tabletScreenshot = await captureScreenshot(
        <ReportsView />,
        { 
          theme: 'light', 
          dimensions: { width: 768, height: 1024 },
          waitTime: 500 
        }
      );

      expect(tabletScreenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'reports-tablet',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });
}); 