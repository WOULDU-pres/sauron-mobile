/**
 * ThemeSettingsSection - 재사용 가능한 테마 설정 섹션 컴포넌트
 * profile.tsx에서 추출하여 재사용성 확보
 */

import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Card, CardContent } from '~/components/primitives/card';
import { Switch } from '~/components/primitives/switch';
import { CommonIcon } from '~/components/utils/common-icon';
import { commonStyles } from '~/components/utils/common';
import { spacing } from '@/~/lib/tokens';
import { createTextStyle } from '@/~/lib/utils';
import { useTheme, useThemeColors } from '@/~/lib/theme-context';
import { InteractionHaptics } from '@/~/lib/haptics';

// ===== 타입 정의 =====
export interface ThemeSettingsSectionProps {
  title?: string;
  showQuickToggle?: boolean;
}

// ===== ThemeSettingsSection =====
export const ThemeSettingsSection: React.FC<ThemeSettingsSectionProps> = ({ 
  title = '테마 설정',
  showQuickToggle = true 
}) => {
  const { themeMode, setThemeMode, isDark, toggleTheme } = useTheme();
  const themeColors = useThemeColors();

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light': return <CommonIcon name="sun" size={16} color={themeColors.foreground} />;
      case 'dark': return <CommonIcon name="moon" size={16} color={themeColors.foreground} />;
      case 'system': return <CommonIcon name="monitor" size={16} color={themeColors.foreground} />;
      default: return <CommonIcon name="star" size={16} color={themeColors.foreground} />;
    }
  };

  const getThemeModeText = () => {
    switch (themeMode) {
      case 'light': return '라이트 모드';
      case 'dark': return '다크 모드';
      case 'system': return '시스템 설정';
      default: return '시스템 설정';
    }
  };

  const handleThemeModePress = () => {
    InteractionHaptics.buttonPress();
    Alert.alert(
      '테마 선택',
      '원하는 테마를 선택하세요',
      [
        { text: '라이트 모드', onPress: () => {
          InteractionHaptics.themeChange();
          setThemeMode('light');
        }},
        { text: '다크 모드', onPress: () => {
          InteractionHaptics.themeChange();
          setThemeMode('dark');
        }},
        { text: '시스템 설정', onPress: () => {
          InteractionHaptics.settingChange();
          setThemeMode('system');
        }},
        { text: '취소', style: 'cancel', onPress: () => {
          InteractionHaptics.cancel();
        }},
      ]
    );
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
          {/* 테마 모드 선택 */}
          <Pressable 
            onPress={handleThemeModePress}
            style={[
              commonStyles.rowSpaceBetween,
              { marginBottom: showQuickToggle && themeMode !== 'system' ? spacing.md : 0 }
            ]}
            accessibilityRole="button"
            accessibilityLabel={`현재 테마: ${getThemeModeText()}`}
            accessibilityHint="탭하여 테마 모드 변경"
          >
            <View style={[commonStyles.row, { flex: 1 }]}>
              <Text style={{ fontSize: 20, marginRight: spacing.md }}>
                {getThemeIcon()}
              </Text>
              <View>
                <Text style={createTextStyle('base', 'medium', 'foreground')}>
                  테마 모드
                </Text>
                <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
                  {getThemeModeText()}
                </Text>
              </View>
            </View>
            <Text style={{ color: themeColors.mutedForeground }}>›</Text>
          </Pressable>

          {/* 빠른 토글 (라이트/다크만) */}
          {showQuickToggle && themeMode !== 'system' && (
            <View style={[
              commonStyles.rowSpaceBetween,
              {
                paddingTop: spacing.sm,
                borderTopWidth: 1,
                borderTopColor: themeColors.border,
              }
            ]}>
              <View style={[commonStyles.row, { flex: 1 }]}>
                <Text style={{ fontSize: 20, marginRight: spacing.md }}>
                  {isDark ? '🌙' : '☀️'}
                </Text>
                <Text style={createTextStyle('base', 'medium', 'foreground')}>
                  빠른 토글
                </Text>
              </View>
              <Switch
                checked={isDark}
                onCheckedChange={() => {
                  InteractionHaptics.toggle();
                  toggleTheme();
                }}
                accessibilityLabel={`${isDark ? '다크' : '라이트'} 테마 토글`}
              />
            </View>
          )}
        </CardContent>
      </Card>
    </View>
  );
}; 