/**
 * 프로필 화면 - React Native 버전
 * 웹의 ProfileView 구조를 React Native로 이식
 */

import React from 'react';
import {
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors } from '@/~/lib/tokens';
import { useThemeColors } from '@/~/lib/theme-context';
import { InteractionHaptics } from '@/~/lib/haptics';
import { FeedbackButton } from '~/components/composed/feedback-button';
import { CommonIcon } from '~/components/utils/common-icon';

// Profile 기능 전용 컴포넌트들 import
import { MenuSection } from '~/components/features/profile/menu-section';
import { UserInfoSection, type UserProfile } from '~/components/features/profile/user-info-section';
import { ThemeSettingsSection } from '~/components/features/profile/theme-settings-section';
import { AccessibilitySettingsSection } from '~/components/features/profile/accessibility-settings-section';
import { type MenuItem } from '~/components/features/profile/menu-item';

// ===== 메인 프로필 화면 컴포넌트 =====
export default function ProfileScreen() {
  const themeColors = useThemeColors();
  
  // ===== 사용자 프로필 데이터 =====
  const userProfile: UserProfile = {
    name: '홍길동',
    email: 'hong@example.com',
    avatarUrl: undefined, // 실제 앱에서는 사용자 이미지 URL
  };

  // ===== 메뉴 아이템 정의 =====
  const accountMenuItems: MenuItem[] = [
    {
      id: 'account-info',
      icon: 'user',
      text: '계정 정보',
      onPress: () => {
        InteractionHaptics.buttonPress();
        Alert.alert('계정 정보', '계정 정보 화면으로 이동합니다.');
      },
    },
    {
      id: 'notification-settings',
      icon: 'bell',
      text: '알림 설정',
      onPress: () => {
        InteractionHaptics.buttonPress();
        Alert.alert('알림 설정', '알림 설정 화면으로 이동합니다.');
      },
    },
    {
      id: 'help',
      icon: 'help-circle',
      text: '문의하기',
      onPress: () => {
        InteractionHaptics.buttonPress();
        Alert.alert('문의하기', '고객센터로 이동합니다.');
      },
    },
  ];

  const logoutMenuItem: MenuItem[] = [
    {
      id: 'logout',
      icon: 'log-out',
      text: '로그아웃',
      onPress: () => {
        InteractionHaptics.buttonPressDestructive();
        Alert.alert(
          '로그아웃',
          '정말로 로그아웃하시겠습니까?',
          [
            { text: '취소', style: 'cancel', onPress: () => {
              InteractionHaptics.cancel();
            }},
            { text: '로그아웃', style: 'destructive', onPress: () => {
              InteractionHaptics.loadSuccess();
              Alert.alert('로그아웃 완료', '로그아웃되었습니다.');
            }},
          ]
        );
      },
    },
  ];

  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: themeColors.background 
    }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 사용자 정보 섹션 */}
        <UserInfoSection profile={userProfile} />

        {/* 계정 관련 메뉴 */}
        <MenuSection items={accountMenuItems} />

        {/* 테마 설정 */}
        <ThemeSettingsSection />

        {/* 접근성 설정 */}
        <AccessibilitySettingsSection />

        {/* 로그아웃 */}
        <MenuSection items={logoutMenuItem} isDestructive={true} />

        {/* 피드백 버튼 */}
        <FeedbackButton />
      </ScrollView>
    </SafeAreaView>
  );
} 