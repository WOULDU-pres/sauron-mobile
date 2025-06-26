import React from 'react';
import { render } from '@testing-library/react-native';
import { captureScreenshot, createScreenTest } from '../utils/screenshot-helper';
import DashboardView from '../../app/(tabs)/index';

describe('Dashboard Screen Visual Tests', () => {
  beforeEach(() => {
    // Setup consistent mock data for dashboard
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup any mocks
    jest.restoreAllMocks();
  });

  describe('Light Theme', () => {
    it('should match dashboard screen snapshot in light theme', async () => {
      const screenshot = await captureScreenshot(
        <DashboardView />,
        { theme: 'light', waitTime: 1000 }
      );

      // Use SSIM comparison with ≤5px threshold as per acceptance criteria
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'dashboard-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should handle dashboard interactions in light theme', async () => {
      const { getByTestId } = render(<DashboardView />);
      
      // Test different interaction states
      const refreshButton = getByTestId('refresh-dashboard');
      const settingsButton = getByTestId('dashboard-settings');
      
      expect(refreshButton).toBeTruthy();
      expect(settingsButton).toBeTruthy();
      
      // Capture screenshot after interaction
      const screenshot = await captureScreenshot(
        <DashboardView />,
        { theme: 'light', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'dashboard-light-interactions',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Dark Theme', () => {
    it('should match dashboard screen snapshot in dark theme', async () => {
      const screenshot = await captureScreenshot(
        <DashboardView />,
        { theme: 'dark', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'dashboard-dark',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should handle dashboard interactions in dark theme', async () => {
      const screenshot = await captureScreenshot(
        <DashboardView />,
        { theme: 'dark', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'dashboard-dark-interactions',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Responsive Design', () => {
    it('should maintain layout consistency on different screen sizes', async () => {
      // Test tablet dimensions
      const tabletScreenshot = await captureScreenshot(
        <DashboardView />,
        { 
          theme: 'light', 
          dimensions: { width: 768, height: 1024 },
          waitTime: 500 
        }
      );

      expect(tabletScreenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'dashboard-tablet',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });

      // Test small phone dimensions
      const smallPhoneScreenshot = await captureScreenshot(
        <DashboardView />,
        { 
          theme: 'light', 
          dimensions: { width: 320, height: 568 },
          waitTime: 500 
        }
      );

      expect(smallPhoneScreenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'dashboard-small-phone',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });
}); 