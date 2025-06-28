/**
 * 공통 UI 컴포넌트들
 * 여러 화면에서 재사용되는 컴포넌트와 유틸리티 함수들
 */

import React from 'react';
import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle } from '@/~/lib/utils';

// ===== 공통 유틸리티 함수들 =====

/**
 * 메시지 유형별 색상 반환
 */
export const getMessageTypeColor = (type: string): string => {
  switch (type) {
    case '광고': return colors.customRed;
    case '도배': return colors.customOrange;
    case '분쟁': return colors.customPurple;
    case '정상': return colors.customGreen;
    default: return colors.muted;
  }
};

/**
 * 공통 레이아웃 스타일들
 */
export const commonStyles = {
  flex1: {
    flex: 1,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowSpaceBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  rowStart: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  centerAll: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  centeredContent: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
};

// ===== 공통 컴포넌트들 =====

/**
 * 섹션 헤더 컴포넌트
 */
export interface SectionHeaderProps {
  title: string;
  style?: TextStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, style }) => (
  <Text 
    style={[
      createTextStyle('lg', 'bold', 'foreground'),
      { marginBottom: spacing.md, paddingHorizontal: spacing.xs },
      style
    ]}
    accessibilityRole="header"
  >
    {title}
  </Text>
);

/**
 * 빈 상태 컴포넌트
 */
export interface EmptyStateProps {
  title: string;
  description: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, style }) => (
  <View style={[
    {
      padding: spacing.xl,
      ...commonStyles.centeredContent,
    },
    style
  ]}>
    <Text style={[
      createTextStyle('lg', 'semibold', 'foreground'),
      { marginBottom: spacing.sm }
    ]}>
      {title}
    </Text>
    <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
      {description}
    </Text>
  </View>
);

/**
 * 차트 스켈레톤 컴포넌트
 */
export interface ChartSkeletonProps {
  height: number;
  title?: string;
  style?: ViewStyle;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ height, title, style }) => (
  <View style={[
    {
      height,
      backgroundColor: colors.muted,
      borderRadius: 8,
      padding: spacing.md,
      ...commonStyles.centeredContent,
    },
    style
  ]}>
    <Text style={createTextStyle('sm', 'medium', 'mutedForeground')}>
      {title || '차트 영역'}
    </Text>
    <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
      (추후 차트 라이브러리 연동)
    </Text>
  </View>
);

/**
 * 태그 컴포넌트
 */
export interface TagProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const Tag: React.FC<TagProps> = ({ 
  label, 
  color = colors.background, 
  backgroundColor = colors.primary,
  style 
}) => (
  <View style={[
    {
      backgroundColor,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: 12,
    },
    style
  ]}>
    <Text style={[createTextStyle('xs', 'medium'), { color }]}>
      {label}
    </Text>
  </View>
); 