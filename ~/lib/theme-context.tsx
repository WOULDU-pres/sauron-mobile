/**
 * 테마 컨텍스트 프로바이더
 * 커스텀 디자인 토큰과 React Navigation 테마를 통합
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTokens, DesignTokens } from './tokens';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  // 테마 상태
  themeMode: ThemeMode;
  isDark: boolean;
  tokens: DesignTokens;
  
  // 테마 제어
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  
  // 접근성 설정
  fontScale: number;
  setFontScale: (scale: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@sauron_theme_mode';
const FONT_SCALE_STORAGE_KEY = '@sauron_font_scale';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useNativeColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [fontScale, setFontScaleState] = useState(1.0);
  const [isLoaded, setIsLoaded] = useState(false);

  // 실제 테마 계산 (system 모드 고려)
  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  // 현재 테마에 맞는 토큰
  const tokens = getTokens(isDark);

  // 저장된 설정 로드
  useEffect(() => {
    loadStoredSettings();
  }, []);

  // 시스템 테마 변경 시 업데이트
  useEffect(() => {
    if (themeMode === 'system') {
      // 시스템 테마가 변경되면 자동으로 isDark 값이 업데이트됨
    }
  }, [systemColorScheme, themeMode]);

  const loadStoredSettings = async () => {
    try {
      const [storedTheme, storedFontScale] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(FONT_SCALE_STORAGE_KEY),
      ]);

      if (storedTheme) {
        setThemeModeState(storedTheme as ThemeMode);
      }

      if (storedFontScale) {
        setFontScaleState(parseFloat(storedFontScale));
      }
    } catch (error) {
      console.warn('Failed to load theme settings:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme mode:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const setFontScale = async (scale: number) => {
    try {
      // 0.8 ~ 1.5 범위로 제한
      const clampedScale = Math.min(Math.max(scale, 0.8), 1.5);
      setFontScaleState(clampedScale);
      await AsyncStorage.setItem(FONT_SCALE_STORAGE_KEY, clampedScale.toString());
    } catch (error) {
      console.warn('Failed to save font scale:', error);
    }
  };

  const contextValue: ThemeContextType = {
    themeMode,
    isDark,
    tokens,
    setThemeMode,
    toggleTheme,
    fontScale,
    setFontScale,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 편의 훅들
export const useThemeColors = () => {
  const { tokens } = useTheme();
  return tokens.colors;
};

export const useThemeSpacing = () => {
  const { tokens } = useTheme();
  return tokens.spacing;
};

export const useThemeTypography = () => {
  const { tokens, fontScale } = useTheme();
  
  // 폰트 스케일이 적용된 타이포그래피 반환
  const scaledTypography = {
    ...tokens.typography,
    fontSize: Object.entries(tokens.typography.fontSize).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: Math.round(value * fontScale),
      }),
      {} as typeof tokens.typography.fontSize
    ),
  };
  
  return scaledTypography;
};

// React Navigation 테마 생성 유틸리티
export const createNavigationTheme = (isDark: boolean, tokens: DesignTokens) => {
  return {
    dark: isDark,
    colors: {
      primary: tokens.colors.primary,
      background: tokens.colors.background,
      card: tokens.colors.card,
      text: tokens.colors.foreground,
      border: tokens.colors.border,
      notification: tokens.colors.destructive,
    },
    fonts: {
      regular: {
        fontFamily: tokens.typography.fontFamily.default,
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: tokens.typography.fontFamily.default,
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: tokens.typography.fontFamily.default,
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: tokens.typography.fontFamily.default,
        fontWeight: '700' as const,
      },
    },
  };
}; 