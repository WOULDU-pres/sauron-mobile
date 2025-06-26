/**
 * shadcn 대응 React Native Card 컴포넌트
 * React Native View 기반으로 디자인 토큰과 유틸리티 연동
 */

import React from 'react';
import { 
  View, 
  Text,
  type ViewProps, 
  type ViewStyle,
  type TextStyle 
} from 'react-native';
import { 
  createContainerStyle, 
  createTextStyle, 
  createShadowStyle,
  mergeStyles, 
  cn 
} from '../../lib/utils';
import { colors, spacing, borderRadius } from '../../lib/tokens';

// ===== 타입 정의 =====
export interface CardProps extends Omit<ViewProps, 'style'> {
  /**
   * 카드 스타일 변형
   */
  variant?: 'default' | 'outline';
  
  /**
   * 그림자 크기
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * 패딩 크기
   */
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * 커스텀 스타일 클래스 (NativeWind 호환)
   */
  className?: string;
  
  /**
   * 커스텀 스타일 객체
   */
  style?: ViewStyle;
  
  /**
   * 다크 테마 사용 여부
   */
  isDark?: boolean;
}

export interface CardHeaderProps extends Omit<ViewProps, 'style'> {
  className?: string;
  style?: ViewStyle;
}

export interface CardTitleProps extends Omit<ViewProps, 'style'> {
  className?: string;
  style?: TextStyle;
  children: React.ReactNode;
  isDark?: boolean;
}

export interface CardDescriptionProps extends Omit<ViewProps, 'style'> {
  className?: string;
  style?: TextStyle;
  children: React.ReactNode;
  isDark?: boolean;
}

export interface CardContentProps extends Omit<ViewProps, 'style'> {
  className?: string;
  style?: ViewStyle;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface CardFooterProps extends Omit<ViewProps, 'style'> {
  className?: string;
  style?: ViewStyle;
}

// ===== 메인 Card 컴포넌트 =====
export const Card = React.memo<CardProps>(({
  variant = 'default',
  shadow = 'sm',
  padding = 'md',
  className,
  style,
  isDark = false,
  children,
  ...props
}) => {
  // 기본 컨테이너 스타일
  const baseStyle = createContainerStyle(
    padding as keyof typeof spacing,
    'card',
    'lg',
    isDark
  );
  
  // variant별 스타일
  const variantStyle: ViewStyle = variant === 'outline' ? {
    borderWidth: 1,
    borderColor: isDark ? colors.border : colors.border,
    backgroundColor: 'transparent',
  } : {};
  
  // 그림자 스타일
  const shadowStyle = shadow !== 'none' ? createShadowStyle(shadow) : {};
  
  // 최종 스타일 병합
  const finalStyle = mergeStyles<ViewStyle>(
    baseStyle,
    variantStyle,
    shadowStyle,
    style
  );
  
  return (
    <View 
      style={finalStyle}
      className={cn(className)}
      {...props}
    >
      {children}
    </View>
  );
});

Card.displayName = 'Card';

// ===== Card 서브 컴포넌트들 =====

/**
 * Card 헤더 영역
 */
export const CardHeader = React.memo<CardHeaderProps>(({
  className,
  style,
  children,
  ...props
}) => {
  const headerStyle: ViewStyle = {
    marginBottom: spacing.sm,
  };
  
  return (
    <View 
      style={mergeStyles<ViewStyle>(headerStyle, style)}
      className={cn(className)}
      {...props}
    >
      {children}
    </View>
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * Card 제목
 */
export const CardTitle = React.memo<CardTitleProps>(({
  className,
  style,
  children,
  isDark = false,
  ...props
}) => {
  const titleStyle = createTextStyle(
    'lg',
    'semibold',
    'foreground',
    isDark
  );
  
  return (
    <Text 
      style={mergeStyles<TextStyle>(titleStyle, style)}
      className={cn(className)}
      {...props}
    >
      {children}
    </Text>
  );
});

CardTitle.displayName = 'CardTitle';

/**
 * Card 설명
 */
export const CardDescription = React.memo<CardDescriptionProps>(({
  className,
  style,
  children,
  isDark = false,
  ...props
}) => {
  const descriptionStyle = createTextStyle(
    'sm',
    'normal',
    'mutedForeground',
    isDark
  );
  
  const containerStyle: ViewStyle = {
    marginTop: spacing.xs,
  };
  
  return (
    <View style={containerStyle}>
      <Text 
        style={mergeStyles<TextStyle>(descriptionStyle, style)}
        className={cn(className)}
        {...props}
      >
        {children}
      </Text>
    </View>
  );
});

CardDescription.displayName = 'CardDescription';

/**
 * Card 본문 내용
 */
export const CardContent = React.memo<CardContentProps>(({
  className,
  style,
  padding = 'none',
  children,
  ...props
}) => {
  const contentStyle: ViewStyle = {
    paddingTop: spacing[padding as keyof typeof spacing] || 0,
  };
  
  return (
    <View 
      style={mergeStyles<ViewStyle>(contentStyle, style)}
      className={cn(className)}
      {...props}
    >
      {children}
    </View>
  );
});

CardContent.displayName = 'CardContent';

/**
 * Card 푸터 영역
 */
export const CardFooter = React.memo<CardFooterProps>(({
  className,
  style,
  children,
  ...props
}) => {
  const footerStyle: ViewStyle = {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  };
  
  return (
    <View 
      style={mergeStyles<ViewStyle>(footerStyle, style)}
      className={cn(className)}
      {...props}
    >
      {children}
    </View>
  );
});

CardFooter.displayName = 'CardFooter';

// ===== Card 변형 컴포넌트들 =====

/**
 * 간단한 카드 (제목 + 내용)
 */
export interface SimpleCardProps extends CardProps {
  title: string;
  description?: string;
  content?: React.ReactNode;
}

export const SimpleCard = React.memo<SimpleCardProps>(({
  title,
  description,
  content,
  isDark = false,
  ...props
}) => (
  <Card isDark={isDark} {...props}>
    <CardHeader>
      <CardTitle isDark={isDark}>{title}</CardTitle>
      {description && (
        <CardDescription isDark={isDark}>{description}</CardDescription>
      )}
    </CardHeader>
    {content && (
      <CardContent>
        {content}
      </CardContent>
    )}
  </Card>
));

/**
 * 액션이 포함된 카드
 */
export interface ActionCardProps extends SimpleCardProps {
  actions?: React.ReactNode;
}

export const ActionCard = React.memo<ActionCardProps>(({
  title,
  description,
  content,
  actions,
  isDark = false,
  ...props
}) => (
  <Card isDark={isDark} {...props}>
    <CardHeader>
      <CardTitle isDark={isDark}>{title}</CardTitle>
      {description && (
        <CardDescription isDark={isDark}>{description}</CardDescription>
      )}
    </CardHeader>
    {content && (
      <CardContent>
        {content}
      </CardContent>
    )}
    {actions && (
      <CardFooter>
        {actions}
      </CardFooter>
    )}
  </Card>
));

// ===== 기본 내보내기 =====
export default Card;
