/**
 * MenuItemComponent - 재사용 가능한 메뉴 아이템 컴포넌트
 * profile.tsx에서 추출하여 재사용성 확보
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card, CardContent } from '~/components/primitives/card';
import { CommonIcon, type IconName } from '~/components/utils/common-icon';
import { commonStyles } from '~/components/utils/common';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle } from '@/~/lib/utils';

// ===== 타입 정의 =====
export interface MenuItem {
  id: string;
  icon: IconName;
  text: string;
  onPress: () => void;
}

export interface MenuItemProps {
  item: MenuItem;
  isDestructive?: boolean;
  showChevron?: boolean;
}

// ===== MenuItemComponent =====
export const MenuItemComponent: React.FC<MenuItemProps> = ({ 
  item, 
  isDestructive = false,
  showChevron = true 
}) => {
  const textColor = isDestructive ? 'destructive' : 'foreground';
  const iconColor = isDestructive ? colors.destructive : colors.mutedForeground;

  return (
    <Pressable 
      onPress={item.onPress}
      accessibilityRole="button"
      accessibilityLabel={item.text}
      accessibilityHint="탭하여 이 메뉴를 선택합니다"
    >
      <Card>
        <CardContent style={{
          ...commonStyles.rowSpaceBetween,
          padding: spacing.md
        }}>
          <View style={[commonStyles.row, { flex: 1 }]}>
            <View style={{ marginRight: spacing.md }}>
              <CommonIcon name={item.icon} color={iconColor} />
            </View>
            <Text style={createTextStyle('base', 'medium', textColor)}>
              {item.text}
            </Text>
          </View>
          {showChevron && (
            <CommonIcon name="chevron-right" color={colors.mutedForeground} />
          )}
        </CardContent>
      </Card>
    </Pressable>
  );
}; 