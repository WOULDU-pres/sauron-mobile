/**
 * shadcn 대응 React Native 유틸리티 함수들
 * 웹의 cn() 함수와 스타일 유틸리티를 React Native 환경에 맞게 구현
 */

import { clsx, type ClassValue } from 'clsx';
import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { tokens, getTokens, type DesignTokens } from './tokens';

// ===== 타입 정의 =====
export type StyleValue = ViewStyle | TextStyle | ImageStyle;
export type StyleArray = (StyleValue | undefined | null | false)[];

/**
 * shadcn의 cn() 함수 React Native 버전
 * clsx를 사용하여 조건부 스타일 클래스 결합
 * React Native에서는 tailwind-merge 대신 NativeWind 호환 방식 사용
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * React Native StyleSheet 병합 유틸리티
 * 여러 스타일 객체를 안전하게 병합
 */
export function mergeStyles<T extends StyleValue>(...styles: (T | undefined | null | false)[]): T {
  return Object.assign({}, ...styles.filter(Boolean)) as T;
}

/**
 * 조건부 스타일 적용 유틸리티
 * 조건에 따라 스타일을 선택적으로 적용
 */
export function conditionalStyle(
  condition: boolean,
  trueStyle: StyleValue,
  falseStyle?: StyleValue
): StyleValue | undefined {
  return condition ? trueStyle : falseStyle;
}

/**
 * variant 기반 스타일 선택 유틸리티
 * shadcn 컴포넌트의 variant prop을 위한 스타일 매핑
 */
export function getVariantStyle<T extends string>(
  variant: T,
  variants: Record<T, StyleValue>
): StyleValue {
  return variants[variant] || {};
}

/**
 * size 기반 스타일 선택 유틸리티
 * shadcn 컴포넌트의 size prop을 위한 스타일 매핑
 */
export function getSizeStyle<T extends string>(
  size: T,
  sizes: Record<T, StyleValue>
): StyleValue {
  return sizes[size] || {};
}

/**
 * 그림자 스타일 생성 유틸리티
 * 디자인 토큰의 shadow를 React Native 스타일로 변환
 */
export function createShadowStyle(shadowKey: keyof DesignTokens['shadow']) {
  const shadowToken = tokens.shadow[shadowKey];
  return {
    shadowColor: shadowToken.shadowColor,
    shadowOffset: shadowToken.shadowOffset,
    shadowOpacity: shadowToken.shadowOpacity,
    shadowRadius: shadowToken.shadowRadius,
    elevation: shadowToken.elevation,
  };
}

/**
 * 테마별 컬러 접근 유틸리티
 * 현재 테마(라이트/다크)에 따른 컬러 반환
 */
export function getColor(
  colorKey: keyof DesignTokens['colors'],
  isDark: boolean = false
): string {
  const themeTokens = getTokens(isDark);
  return themeTokens.colors[colorKey];
}

/**
 * 반응형 스타일 유틸리티
 * 화면 크기에 따른 스타일 조정 (미래 확장성을 위해)
 */
export function responsiveStyle(
  baseStyle: StyleValue,
  tabletStyle?: StyleValue,
  desktopStyle?: StyleValue
): StyleValue {
  // 현재는 모바일 우선이므로 baseStyle만 반환
  // 추후 태블릿/데스크톱 지원 시 확장 가능
  return baseStyle;
}

/**
 * 투명도 조정 유틸리티
 * hex 컬러에 투명도를 추가
 */
export function addOpacity(color: string, opacity: number): string {
  // hex 컬러 형식인지 확인
  if (!color.startsWith('#')) {
    return color;
  }
  
  // opacity를 0-1에서 0-255로 변환
  const alpha = Math.round(opacity * 255);
  const hex = alpha.toString(16).padStart(2, '0');
  
  // 3자리 hex (#RGB)인 경우 6자리로 확장
  if (color.length === 4) {
    const r = color[1];
    const g = color[2];
    const b = color[3];
    return `#${r}${r}${g}${g}${b}${b}${hex}`;
  }
  
  // 6자리 hex (#RRGGBB)인 경우 알파 추가
  if (color.length === 7) {
    return `${color}${hex}`;
  }
  
  return color;
}

/**
 * 플랫폼별 스타일 적용 유틸리티
 * iOS/Android 차이점을 고려한 스타일 선택
 */
export function platformStyle(
  iosStyle: StyleValue,
  androidStyle: StyleValue,
  platform: 'ios' | 'android' = 'ios'
): StyleValue {
  return platform === 'ios' ? iosStyle : androidStyle;
}

/**
 * 텍스트 스타일 생성 유틸리티
 * 디자인 토큰을 사용한 일관된 텍스트 스타일
 */
export function createTextStyle(
  fontSize: keyof DesignTokens['typography']['fontSize'],
  fontWeight: keyof DesignTokens['typography']['fontWeight'] = 'normal',
  color: keyof DesignTokens['colors'] = 'foreground',
  isDark: boolean = false
): TextStyle {
  const themeTokens = getTokens(isDark);
  
  return {
    fontSize: themeTokens.typography.fontSize[fontSize],
    fontWeight: themeTokens.typography.fontWeight[fontWeight],
    color: themeTokens.colors[color],
    fontFamily: themeTokens.typography.fontFamily.default,
  };
}

/**
 * 테마 인식 텍스트 스타일 생성 유틸리티
 * 폰트 스케일과 테마가 자동으로 적용됨
 */
export function createThemedTextStyle(
  fontSize: keyof DesignTokens['typography']['fontSize'],
  fontWeight: keyof DesignTokens['typography']['fontWeight'] = 'normal',
  color: keyof DesignTokens['colors'] = 'foreground',
  tokens: DesignTokens,
  fontScale: number = 1.0
): TextStyle {
  return {
    fontSize: Math.round(tokens.typography.fontSize[fontSize] * fontScale),
    fontWeight: tokens.typography.fontWeight[fontWeight],
    color: tokens.colors[color],
    fontFamily: tokens.typography.fontFamily.default,
  };
}

/**
 * 컨테이너 스타일 생성 유틸리티
 * 일관된 레이아웃을 위한 기본 컨테이너 스타일
 */
export function createContainerStyle(
  padding: keyof DesignTokens['spacing'] | 'none' = 'md',
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined = undefined,
  backgroundColor: keyof DesignTokens['colors'] | undefined = undefined,
  borderRadius: keyof DesignTokens['borderRadius'] = 'md',
  isDark: boolean = false
): ViewStyle {
  const themeTokens = getTokens(isDark);
  
  const style: ViewStyle = {
    flex: 1,
  };

  // padding 처리
  if (padding !== 'none') {
    style.padding = themeTokens.spacing[padding as keyof DesignTokens['spacing']];
  }

  // justifyContent 처리
  if (justifyContent) {
    style.justifyContent = justifyContent;
  }

  // backgroundColor 처리
  if (backgroundColor) {
    style.backgroundColor = themeTokens.colors[backgroundColor];
  }

  // borderRadius 처리 (padding이 있을 때만)
  if (padding !== 'none') {
    style.borderRadius = themeTokens.borderRadius[borderRadius];
  }
  
  return style;
}

/**
 * 버튼 스타일 생성 유틸리티
 * shadcn Button 컴포넌트를 위한 기본 스타일 세트
 */
export function createButtonStyle(
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default',
  size: 'default' | 'sm' | 'xs' | 'lg' | 'icon' = 'default',
  isDark: boolean = false
): ViewStyle {
  const themeTokens = getTokens(isDark);
  
  // 기본 스타일
  const baseStyle: ViewStyle = {
    borderRadius: themeTokens.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  };
  
  // variant별 스타일
  const variantStyles: Record<typeof variant, ViewStyle> = {
    default: {
      backgroundColor: themeTokens.colors.primary,
    },
    destructive: {
      backgroundColor: themeTokens.colors.destructive,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: themeTokens.colors.border,
    },
    secondary: {
      backgroundColor: themeTokens.colors.secondary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    link: {
      backgroundColor: 'transparent',
    },
  };
  
  // size별 스타일 - xs 사이즈 추가
  const sizeStyles: Record<typeof size, ViewStyle> = {
    default: {
      paddingHorizontal: themeTokens.spacing.lg,
      paddingVertical: themeTokens.spacing.sm,
      minHeight: 40,
    },
    sm: {
      paddingHorizontal: themeTokens.spacing.md,
      paddingVertical: themeTokens.spacing.xs,
      minHeight: 32,
    },
    xs: {
      paddingHorizontal: themeTokens.spacing.sm,
      paddingVertical: 2,
      minHeight: 24,
    },
    lg: {
      paddingHorizontal: themeTokens.spacing.xl,
      paddingVertical: themeTokens.spacing.md,
      minHeight: 48,
    },
    icon: {
      width: 40,
      height: 40,
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
  };
  
  return mergeStyles(baseStyle, variantStyles[variant], sizeStyles[size]);
}

/**
 * 입력 필드 스타일 생성 유틸리티
 * shadcn Input 컴포넌트를 위한 기본 스타일 세트
 */
export function createInputStyle(
  variant: 'default' | 'destructive' = 'default',
  isDark: boolean = false
): TextStyle {
  const themeTokens = getTokens(isDark);
  
  const baseStyle: TextStyle = {
    borderRadius: themeTokens.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: themeTokens.spacing.md,
    paddingVertical: themeTokens.spacing.sm,
    minHeight: 40,
    fontSize: themeTokens.typography.fontSize.sm,
    color: themeTokens.colors.foreground,
  };
  
  const variantStyles: Record<typeof variant, TextStyle> = {
    default: {
      borderColor: themeTokens.colors.border,
      backgroundColor: themeTokens.colors.background,
    },
    destructive: {
      borderColor: themeTokens.colors.destructive,
      backgroundColor: themeTokens.colors.background,
    },
  };
  
  return mergeStyles(baseStyle, variantStyles[variant]) as TextStyle;
}

/**
 * 디버그용 스타일 출력 유틸리티
 * 개발 환경에서 스타일 확인을 위한 함수
 */
export function debugStyle(styleName: string, style: StyleValue): StyleValue {
  if (__DEV__) {
    console.log(`[Style Debug] ${styleName}:`, style);
  }
  return style;
}

// ===== 자주 사용되는 스타일 프리셋 =====
export const commonStyles = {
  // 플렉스 레이아웃
  flexCenter: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  flexRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  flexColumn: {
    flexDirection: 'column' as const,
  },
  
  // 포지셔닝
  absoluteFill: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // 텍스트 정렬
  textCenter: {
    textAlign: 'center' as const,
  },
  textLeft: {
    textAlign: 'left' as const,
  },
  textRight: {
    textAlign: 'right' as const,
  },
  
  // 기본 여백
  marginVertical: {
    marginVertical: tokens.spacing.md,
  },
  marginHorizontal: {
    marginHorizontal: tokens.spacing.md,
  },
  paddingVertical: {
    paddingVertical: tokens.spacing.md,
  },
  paddingHorizontal: {
    paddingHorizontal: tokens.spacing.md,
  },
}; 