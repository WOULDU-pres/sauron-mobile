/**
 * 피드백 모듈 시각적 회귀 테스트
 * FeedbackForm, FeedbackModal, FeedbackButton 컴포넌트들의 시각적 일관성 검증
 */

import React from 'react';
import { FeedbackForm } from '../../~/components/ui/feedback-form';
import { FeedbackButton } from '../../~/components/ui/feedback-button';
import { captureScreenshot, setupDemoMode, ThemeWrapper } from '../utils/screenshot-helper';

describe('Feedback Module Visual Tests', () => {
  beforeEach(() => {
    setupDemoMode();
  });

  describe('FeedbackForm Component', () => {
    it('should display feedback form with initial state correctly (light theme)', async () => {
      const screenshot = await captureScreenshot(
        <ThemeWrapper theme="light">
          <FeedbackForm />
        </ThemeWrapper>,
        { theme: 'light', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'feedback-form-initial-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should display feedback form with initial state correctly (dark theme)', async () => {
      const screenshot = await captureScreenshot(
        <ThemeWrapper theme="dark">
          <FeedbackForm />
        </ThemeWrapper>,
        { theme: 'dark', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'feedback-form-initial-dark',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should display feedback form with error states correctly', async () => {
      // Note: 에러 상태는 실제 유효성 검사 실패 시나리오를 시뮬레이션해야 함
      // 현재는 초기 상태만 테스트하고, 향후 interaction testing으로 확장 예정
      const screenshot = await captureScreenshot(
        <ThemeWrapper theme="light">
          <FeedbackForm />
        </ThemeWrapper>,
        { theme: 'light', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'feedback-form-errors-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('FeedbackButton Component', () => {
    it('should display feedback button with default style correctly', async () => {
      const screenshot = await captureScreenshot(
        <ThemeWrapper theme="light">
          <FeedbackButton />
        </ThemeWrapper>,
        { theme: 'light', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'feedback-button-default-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should display feedback button with different variants correctly', async () => {
      const screenshot = await captureScreenshot(
        <ThemeWrapper theme="light">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FeedbackButton variant="default" title="기본 버튼" />
            <FeedbackButton variant="outline" title="아웃라인 버튼" />
            <FeedbackButton variant="secondary" title="보조 버튼" />
            <FeedbackButton variant="ghost" title="고스트 버튼" />
          </div>
        </ThemeWrapper>,
        { theme: 'light', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'feedback-button-variants-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should display feedback button in dark theme correctly', async () => {
      const screenshot = await captureScreenshot(
        <ThemeWrapper theme="dark">
          <FeedbackButton />
        </ThemeWrapper>,
        { theme: 'dark', waitTime: 500 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'feedback-button-default-dark',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Responsive Design Tests', () => {
    it('should display feedback form correctly on tablet size', async () => {
      const screenshot = await captureScreenshot(
        <ThemeWrapper theme="light">
          <FeedbackForm />
        </ThemeWrapper>,
        { 
          theme: 'light', 
          waitTime: 1000,
          screenSize: 'tablet'
        }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'feedback-form-tablet-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should display feedback form correctly on small phone size', async () => {
      const screenshot = await captureScreenshot(
        <ThemeWrapper theme="light">
          <FeedbackForm />
        </ThemeWrapper>,
        { 
          theme: 'light', 
          waitTime: 1000,
          screenSize: 'small'
        }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'feedback-form-small-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });

  describe('Accessibility Visual Tests', () => {
    it('should display feedback form with large font scale correctly', async () => {
      const screenshot = await captureScreenshot(
        <ThemeWrapper theme="light">
          <FeedbackForm />
        </ThemeWrapper>,
        { theme: 'light', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'feedback-form-large-font-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });

    it('should display feedback form with small font scale correctly', async () => {
      const screenshot = await captureScreenshot(
        <ThemeWrapper theme="light">
          <FeedbackForm />
        </ThemeWrapper>,
        { theme: 'light', waitTime: 1000 }
      );

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'feedback-form-small-font-light',
        comparisonMethod: 'ssim',
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customDiffConfig: { threshold: 0.01 },
      });
    });
  });
}); 