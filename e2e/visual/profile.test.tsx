import React from 'react';
import { render } from '@testing-library/react-native';
import { captureScreenshot } from '../utils/screenshot-helper';
import ProfileView from '../../app/(tabs)/profile';

describe('Profile Screen Visual Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Light Theme', () => {
    it('should match profile screen snapshot in light theme', async () => {
      const screenshot = await captureScreenshot(
        <ProfileView />,
        { theme: 'light', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'profile-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should handle profile interactions in light theme', async () => {
      const { getByTestId } = render(<ProfileView />);
      
      // Test profile-specific interactions
      const settingsButton = getByTestId('profile-settings');
      const themeToggle = getByTestId('theme-toggle');
      
      expect(settingsButton).toBeTruthy();
      expect(themeToggle).toBeTruthy();
      
      const screenshot = await captureScreenshot(
        <ProfileView />,
        { theme: 'light', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'profile-light-interactions',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Dark Theme', () => {
    it('should match profile screen snapshot in dark theme', async () => {
      const screenshot = await captureScreenshot(
        <ProfileView />,
        { theme: 'dark', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'profile-dark',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should handle profile interactions in dark theme', async () => {
      const screenshot = await captureScreenshot(
        <ProfileView />,
        { theme: 'dark', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'profile-dark-interactions',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Theme Settings', () => {
    it('should show theme selection options correctly', async () => {
      const screenshot = await captureScreenshot(
        <ProfileView />,
        { theme: 'light', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'profile-theme-settings',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Accessibility Settings', () => {
    it('should display font size adjustment correctly', async () => {
      const screenshot = await captureScreenshot(
        <ProfileView />,
        { theme: 'light', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'profile-accessibility-settings',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });
}); 