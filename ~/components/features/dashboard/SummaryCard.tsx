/**
 * SummaryCard - 대시보드 요약 카드 컴포넌트
 * 숫자 데이터와 아이콘을 포함한 간단한 요약 정보를 표시
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Card, CardContent } from '~/components/primitives/card';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle, createContainerStyle } from '@/~/lib/utils';
import type { LucideIcon } from 'lucide-react-native';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  color = colors.primary,
}) => {
  return (
    <Card style={createContainerStyle('none', undefined, undefined, 'lg')}>
      <CardContent style={{ padding: spacing.lg }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <View style={{ flex: 1 }}>
            <Text style={createTextStyle('xs', 'medium', 'mutedForeground')}>
              {title}
            </Text>
            <Text style={createTextStyle('2xl', 'bold', 'foreground')}>
              {value}
            </Text>
          </View>
          <View style={{
            backgroundColor: `${color}20`,
            borderRadius: 8,
            padding: spacing.sm,
          }}>
            <Icon size={20} color={color} />
          </View>
        </View>
      </CardContent>
    </Card>
  );
}; 