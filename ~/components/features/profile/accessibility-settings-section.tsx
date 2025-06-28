/**
 * AccessibilitySettingsSection - 재사용 가능한 접근성 설정 섹션 컴포넌트
 * profile.tsx에서 추출하여 재사용성 확보
 */

import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Card, CardContent } from '~/components/primitives/card';
import { commonStyles } from '~/components/utils/common';
import { spacing } from '@/~/lib/tokens';
import { createTextStyle } from '@/~/lib/utils';
import { useTheme, useThemeColors } from '@/~/lib/theme-context';
import { InteractionHaptics } from '@/~/lib/haptics';

// ===== 타입 정의 =====
export interface FontSizeOption {
  scale: number;
  label: string;
}

export interface AccessibilitySettingsSectionProps {
  title?: string;
  fontSizeOptions?: FontSizeOption[];
}

// ===== 기본 글자 크기 옵션 =====
const defaultFontSizeOptions: FontSizeOption[] = [
  { scale: 0.8, label: '작게' },
  { scale: 1.0, label: '보통' },
  { scale: 1.2, label: '크게' },
  { scale: 1.5, label: '매우 크게' },
];

// ===== AccessibilitySettingsSection =====
export const AccessibilitySettingsSection: React.FC<AccessibilitySettingsSectionProps> = ({ 
  title = '접근성',
  fontSizeOptions = defaultFontSizeOptions 
}) => {
  const { fontScale, setFontScale } = useTheme();
  const themeColors = useThemeColors();

  const handleFontSizePress = () => {
    InteractionHaptics.buttonPress();
    Alert.alert(
      '글자 크기',
      '원하는 글자 크기를 선택하세요',
      [
        ...fontSizeOptions.map(option => ({
          text: `${option.label} (${Math.round(option.scale * 100)}%)`,
          onPress: () => {
            InteractionHaptics.settingChange();
            setFontScale(option.scale);
          },
        })),
        { text: '취소', style: 'cancel', onPress: () => {
          InteractionHaptics.cancel();
        }},
      ]
    );
  };

  const getCurrentSizeLabel = () => {
    const option = fontSizeOptions.find(opt => opt.scale === fontScale);
    return option ? option.label : `사용자 설정 (${Math.round(fontScale * 100)}%)`;
  };

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[
        createTextStyle('sm', 'semibold', 'mutedForeground'),
        { marginBottom: spacing.sm, paddingHorizontal: spacing.xs }
      ]}>
        {title}
      </Text>
      
      <Card>
        <CardContent style={{ padding: spacing.md }}>
          <Pressable 
            onPress={handleFontSizePress}
            style={commonStyles.rowSpaceBetween}
            accessibilityRole="button"
            accessibilityLabel={`현재 글자 크기: ${getCurrentSizeLabel()}`}
            accessibilityHint="탭하여 글자 크기 변경"
          >
            <View style={[commonStyles.row, { flex: 1 }]}>
              <Text style={{ fontSize: 20, marginRight: spacing.md }}>
                🔤
              </Text>
              <View>
                <Text style={createTextStyle('base', 'medium', 'foreground')}>
                  글자 크기
                </Text>
                <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
                  {getCurrentSizeLabel()}
                </Text>
              </View>
            </View>
            <Text style={{ color: themeColors.mutedForeground }}>›</Text>
          </Pressable>
        </CardContent>
      </Card>
    </View>
  );
}; 