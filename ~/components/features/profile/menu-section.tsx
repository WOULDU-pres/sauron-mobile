/**
 * MenuSection - 재사용 가능한 메뉴 섹션 컴포넌트
 * profile.tsx에서 추출하여 재사용성 확보
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MenuItemComponent, type MenuItem } from './menu-item';
import { spacing } from '@/~/lib/tokens';
import { createTextStyle } from '@/~/lib/utils';

// ===== 타입 정의 =====
export interface MenuSectionProps {
  title?: string;
  items: MenuItem[];
  isDestructive?: boolean;
  showChevron?: boolean;
}

// ===== MenuSection =====
export const MenuSection: React.FC<MenuSectionProps> = ({ 
  title, 
  items, 
  isDestructive = false,
  showChevron = true
}) => {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {title && (
        <Text style={[
          createTextStyle('sm', 'semibold', 'mutedForeground'),
          { marginBottom: spacing.sm, paddingHorizontal: spacing.xs }
        ]}>
          {title}
        </Text>
      )}
      <View style={{ gap: spacing.sm }}>
        {items.map(item => (
          <MenuItemComponent 
            key={item.id} 
            item={item} 
            isDestructive={isDestructive}
            showChevron={showChevron}
          />
        ))}
      </View>
    </View>
  );
}; 