/**
 * shadcn 대응 React Native 디자인 토큰
 * 웹 CSS 변수를 React Native StyleSheet 호환 토큰으로 변환
 */

// ===== 컬러 토큰 타입 정의 =====
export interface ColorTokens {
  // shadcn 기본 컬러 시스템
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  
  // 커스텀 컬러 (sauron 프로젝트 전용)
  customPurple: string;
  customOrange: string;
  customGreen: string;
  customRed: string;
  customYellow: string;
  customLightBg: string;
  customDarkText: string;
  customLightText: string;
}

// ===== 스페이싱 토큰 타입 정의 =====
export interface SpacingTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

// ===== 타이포그래피 토큰 타입 정의 =====
export interface TypographyTokens {
  fontFamily: {
    default: string;
    mono: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  };
  fontWeight: {
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

// ===== 보더 라디우스 토큰 타입 정의 =====
export interface BorderRadiusTokens {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  full: number;
}

// ===== 쉐도우 토큰 타입 정의 =====
export interface ShadowTokens {
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number; // Android
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  xl: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

// ===== 메인 디자인 토큰 인터페이스 =====
export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  borderRadius: BorderRadiusTokens;
  shadow: ShadowTokens;
}

// ===== 라이트 테마 토큰 정의 =====
export const lightTheme: DesignTokens = {
  colors: {
    // shadcn 기본 컬러 (웹 CSS 변수에서 변환)
    background: '#F7F8FA',         // --background: 220 20% 97%
    foreground: '#0F172A',         // --foreground: 222.2 84% 4.9%
    card: '#FFFFFF',               // --card: 0 0% 100%
    cardForeground: '#0F172A',     // --card-foreground: 222.2 84% 4.9%
    popover: '#FFFFFF',            // --popover: 0 0% 100%
    popoverForeground: '#0F172A',  // --popover-foreground: 222.2 84% 4.9%
    primary: '#1E293B',            // --primary: 222.2 47.4% 11.2%
    primaryForeground: '#F8FAFC',  // --primary-foreground: 210 40% 98%
    secondary: '#F1F5F9',          // --secondary: 210 40% 96.1%
    secondaryForeground: '#1E293B', // --secondary-foreground: 222.2 47.4% 11.2%
    muted: '#F1F5F9',              // --muted: 210 40% 96.1%
    mutedForeground: '#64748B',    // --muted-foreground: 215.4 16.3% 46.9%
    accent: '#F1F5F9',             // --accent: 210 40% 96.1%
    accentForeground: '#1E293B',   // --accent-foreground: 222.2 47.4% 11.2%
    destructive: '#EF4444',        // --destructive: 0 84.2% 60.2%
    destructiveForeground: '#F8FAFC', // --destructive-foreground: 210 40% 98%
    border: '#E2E8F0',             // --border: 214.3 31.8% 91.4%
    input: '#E2E8F0',              // --input: 214.3 31.8% 91.4%
    ring: '#0F172A',               // --ring: 222.2 84% 4.9%
    
    // sauron 프로젝트 커스텀 컬러
    customPurple: '#C4B5E8',
    customOrange: '#FAB491',
    customGreen: '#A8D5BA',
    customRed: '#F39091',
    customYellow: '#F59E0B',
    customLightBg: '#F7F8FA',
    customDarkText: '#333333',
    customLightText: '#888888',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 80,
  },
  
  typography: {
    fontFamily: {
      default: 'Inter', // React Native에서 Inter 폰트 사용
      mono: 'Courier New',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  borderRadius: {
    none: 0,
    sm: 4,    // --radius - 4px (웹 기준)
    md: 8,    // --radius - 2px (웹 기준)
    lg: 12,   // --radius (웹에서 0.5rem = 8px, 모바일에서 12px로 조정)
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },
  
  shadow: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 8,
    },
  },
};

// ===== 다크 테마 토큰 정의 =====
export const darkTheme: DesignTokens = {
  colors: {
    // shadcn 다크 모드 컬러
    background: '#0F172A',         // --background: 222.2 84% 4.9%
    foreground: '#F8FAFC',         // --foreground: 210 40% 98%
    card: '#0F172A',               // --card: 222.2 84% 4.9%
    cardForeground: '#F8FAFC',     // --card-foreground: 210 40% 98%
    popover: '#0F172A',            // --popover: 222.2 84% 4.9%
    popoverForeground: '#F8FAFC',  // --popover-foreground: 210 40% 98%
    primary: '#F8FAFC',            // --primary: 210 40% 98%
    primaryForeground: '#1E293B',  // --primary-foreground: 222.2 47.4% 11.2%
    secondary: '#334155',          // --secondary: 217.2 32.6% 17.5%
    secondaryForeground: '#F8FAFC', // --secondary-foreground: 210 40% 98%
    muted: '#334155',              // --muted: 217.2 32.6% 17.5%
    mutedForeground: '#94A3B8',    // --muted-foreground: 215 20.2% 65.1%
    accent: '#334155',             // --accent: 217.2 32.6% 17.5%
    accentForeground: '#F8FAFC',   // --accent-foreground: 210 40% 98%
    destructive: '#7F1D1D',        // --destructive: 0 62.8% 30.6%
    destructiveForeground: '#F8FAFC', // --destructive-foreground: 210 40% 98%
    border: '#334155',             // --border: 217.2 32.6% 17.5%
    input: '#334155',              // --input: 217.2 32.6% 17.5%
    ring: '#D4D4D8',               // --ring: 212.7 26.8% 83.9%
    
    // 다크 모드용 커스텀 컬러 (약간 어둡게 조정)
    customPurple: '#A78BFA',       // 라이트보다 약간 밝게
    customOrange: '#FB923C',       // 라이트보다 약간 밝게
    customGreen: '#6EE7B7',        // 라이트보다 약간 밝게
    customRed: '#FCA5A5',          // 라이트보다 약간 밝게
    customYellow: '#FBBF24',       // 다크 모드용 옐로우
    customLightBg: '#1E293B',      // 다크 배경으로 변경
    customDarkText: '#F8FAFC',     // 다크 모드에서는 밝은 텍스트
    customLightText: '#94A3B8',    // 다크 모드용 보조 텍스트
  },
  
  // 나머지 토큰은 라이트 테마와 동일
  spacing: lightTheme.spacing,
  typography: lightTheme.typography,
  borderRadius: lightTheme.borderRadius,
  shadow: {
    // 다크 모드에서는 그림자를 더 강하게
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.6,
      shadowRadius: 25,
      elevation: 8,
    },
  },
};

// ===== 기본 테마 설정 =====
export const tokens = lightTheme; // 기본값은 라이트 테마

// ===== 테마별 토큰 접근 유틸리티 =====
export const getTokens = (isDark: boolean = false): DesignTokens => {
  return isDark ? darkTheme : lightTheme;
};

// ===== 개별 토큰 접근 유틸리티 =====
export const { colors, spacing, typography, borderRadius, shadow } = tokens; 