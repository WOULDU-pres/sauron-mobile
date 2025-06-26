import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '~/lib/theme-context';

export type ThemeMode = 'light' | 'dark';
export type ScreenSize = 'phone' | 'tablet' | 'small';

export interface ScreenDimensions {
  width: number;
  height: number;
}

export const SCREEN_DIMENSIONS: Record<ScreenSize, ScreenDimensions> = {
  phone: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  small: { width: 320, height: 568 },
};

/**
 * Setup demo mode for consistent screenshots
 */
export const setupDemoMode = () => {
  const mockDate = new Date('2024-01-15T10:30:00.000Z');
  global.Date = jest.fn(() => mockDate) as any;
  global.Date.now = jest.fn(() => mockDate.getTime());
  global.Date.UTC = Date.UTC;
  global.Date.parse = Date.parse;
  
  global.Math.random = jest.fn(() => 0.5);
  global.performance.now = jest.fn(() => 1000);
};

/**
 * Theme wrapper component for testing
 */
interface ThemeWrapperProps {
  children: React.ReactNode;
  theme: ThemeMode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children, theme }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

/**
 * Render component with theme wrapper
 */
export const renderWithTheme = (
  component: React.ReactElement,
  theme: ThemeMode = 'light'
) => {
  return render(
    <ThemeWrapper theme={theme}>
      {component}
    </ThemeWrapper>
  );
};

/**
 * Wait for animations and async operations to complete
 */
export const waitForAnimations = async (duration: number = 500) => {
  await new Promise(resolve => setTimeout(resolve, duration));
};

/**
 * Capture screenshot with consistent timing
 */
export const captureScreenshot = async (
  component: React.ReactElement,
  options: {
    theme?: ThemeMode;
    screenSize?: ScreenSize;
    waitTime?: number;
  } = {}
) => {
  const { theme = 'light', waitTime = 500 } = options;
  
  setupDemoMode();
  
  const result = renderWithTheme(component, theme);
  
  await waitForAnimations(waitTime);
  
  return result;
}; 