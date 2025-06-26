/**
 * shadcn 대응 React Native Button 컴포넌트
 * @rn-primitives 기반으로 디자인 토큰과 유틸리티 연동
 */

import React from 'react';
import { 
  Pressable, 
  Text, 
  ActivityIndicator, 
  type PressableProps, 
  type ViewStyle,
  type TextStyle 
} from 'react-native';
import { 
  createButtonStyle, 
  createTextStyle, 
  mergeStyles, 
  cn 
} from '../../lib/utils';
import { colors, spacing } from '../../lib/tokens';

// ===== 타입 정의 =====
export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  /**
   * 버튼 스타일 변형
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  /**
   * 버튼 크기
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  
  /**
   * 버튼 텍스트 (children 대신 사용 가능)
   */
  title?: string;
  
  /**
   * 버튼 내용
   */
  children?: React.ReactNode;
  
  /**
   * 로딩 상태
   */
  loading?: boolean;
  
  /**
   * 비활성화 상태
   */
  disabled?: boolean;
  
  /**
   * 커스텀 스타일 클래스 (NativeWind 호환)
   */
  className?: string;
  
  /**
   * 커스텀 스타일 객체
   */
  style?: ViewStyle;
  
  /**
   * 텍스트 커스텀 스타일
   */
  textStyle?: TextStyle;
  
  /**
   * 다크 테마 사용 여부
   */
  isDark?: boolean;
}

// ===== 메모이즈된 버튼 컴포넌트 =====
export const Button = React.memo<ButtonProps>(({
  variant = 'default',
  size = 'default',
  title,
  children,
  loading = false,
  disabled = false,
  className,
  style,
  textStyle,
  isDark = false,
  ...props
}) => {
  // 버튼 기본 스타일 생성
  const buttonStyle = createButtonStyle(variant, size, isDark);
  
  // 텍스트 스타일 생성
  const getTextColor = (): keyof typeof colors => {
    switch (variant) {
      case 'default':
        return 'primaryForeground';
      case 'destructive':
        return 'destructiveForeground';
      case 'outline':
      case 'ghost':
      case 'link':
        return 'foreground';
      case 'secondary':
        return 'secondaryForeground';
      default:
        return 'foreground';
    }
  };
  
  const defaultTextStyle = createTextStyle(
    size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base',
    'medium',
    getTextColor(),
    isDark
  );
  
  // 비활성화 상태 스타일
  const disabledStyle: ViewStyle = disabled || loading ? {
    opacity: 0.5,
  } : {};
  
  // 최종 스타일 병합
  const finalStyle = mergeStyles<ViewStyle>(
    buttonStyle,
    disabledStyle,
    style
  );
  
  const finalTextStyle = mergeStyles<TextStyle>(
    defaultTextStyle,
    textStyle
  );
  
  // 버튼 내용 렌더링
  const renderContent = (): React.ReactNode => {
    if (loading) {
      return (
        <>
          <ActivityIndicator 
            size="small" 
            color={finalTextStyle.color} 
            style={{ marginRight: title || children ? spacing.xs : 0 }}
          />
          {(title || children) && (
            <Text style={finalTextStyle}>
              {title || children}
            </Text>
          )}
        </>
      );
    }
    
    if (title) {
      return <Text style={finalTextStyle}>{title}</Text>;
    }
    
    if (typeof children === 'string') {
      return <Text style={finalTextStyle}>{children}</Text>;
    }
    
    return children;
  };
  
  return (
    <Pressable
      style={({ pressed }) => [
        finalStyle,
        // 눌림 효과
        pressed && variant !== 'link' && {
          opacity: 0.8,
          transform: [{ scale: 0.98 }],
        },
      ]}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      className={cn(className)}
      {...props}
    >
      {renderContent()}
    </Pressable>
  );
});

Button.displayName = 'Button';

// ===== 버튼 변형 컴포넌트들 =====

/**
 * 주요 액션용 기본 버튼
 */
export const PrimaryButton = React.memo<Omit<ButtonProps, 'variant'>>((props) => (
  <Button variant="default" {...props} />
));

/**
 * 파괴적 액션용 버튼
 */
export const DestructiveButton = React.memo<Omit<ButtonProps, 'variant'>>((props) => (
  <Button variant="destructive" {...props} />
));

/**
 * 보조 액션용 버튼
 */
export const SecondaryButton = React.memo<Omit<ButtonProps, 'variant'>>((props) => (
  <Button variant="secondary" {...props} />
));

/**
 * 아웃라인 버튼
 */
export const OutlineButton = React.memo<Omit<ButtonProps, 'variant'>>((props) => (
  <Button variant="outline" {...props} />
));

/**
 * 고스트 버튼 (배경 없음)
 */
export const GhostButton = React.memo<Omit<ButtonProps, 'variant'>>((props) => (
  <Button variant="ghost" {...props} />
));

/**
 * 링크 스타일 버튼
 */
export const LinkButton = React.memo<Omit<ButtonProps, 'variant'>>((props) => (
  <Button variant="link" {...props} />
));

/**
 * 아이콘 전용 버튼
 */
export const IconButton = React.memo<Omit<ButtonProps, 'size'>>((props) => (
  <Button size="icon" {...props} />
));

// ===== 기본 내보내기 =====
export default Button;
