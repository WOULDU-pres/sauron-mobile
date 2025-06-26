/**
 * 프로필 화면 - React Native 버전
 * 웹의 ProfileView 구조를 React Native로 이식
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { Card, CardContent } from '~/components/ui/card';
import { Switch } from '~/components/ui/switch';
import { colors, spacing } from '~/lib/tokens';
import { createTextStyle } from '~/lib/utils';
import { useTheme, useThemeColors } from '~/lib/theme-context';
import { InteractionHaptics } from '~/lib/haptics';
import { FeedbackButton } from '~/components/ui/feedback-button';

// ===== 데이터 타입 정의 =====
interface MenuItem {
  id: string;
  icon: string;
  text: string;
  onPress: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

// ===== 아이콘 컴포넌트 (Lucide 아이콘 대신 텍스트 사용) =====
const IconText: React.FC<{ name: string; size?: number; color?: string }> = ({ 
  name, 
  size = 20, 
  color = colors.mutedForeground 
}) => {
  const getIconText = (iconName: string) => {
    switch (iconName) {
      case 'User': return '👤';
      case 'Bell': return '🔔';
      case 'HelpCircle': return '❓';
      case 'LogOut': return '🚪';
      case 'ChevronRight': return '›';
      default: return '•';
    }
  };

  return (
    <Text style={{ 
      fontSize: size, 
      color,
      fontWeight: '500',
      textAlign: 'center',
      minWidth: size,
    }}>
      {getIconText(name)}
    </Text>
  );
};

// ===== 아바타 컴포넌트 =====
const Avatar: React.FC<{ 
  size: number; 
  imageUrl?: string; 
  fallbackText: string; 
}> = ({ size, imageUrl, fallbackText }) => {
  const [imageError, setImageError] = useState(false);

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.muted,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  };

  if (imageUrl && !imageError) {
    return (
      <View style={avatarStyle}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  return (
    <View style={avatarStyle}>
      <Text style={createTextStyle('xl', 'bold', 'mutedForeground')}>
        {fallbackText}
      </Text>
    </View>
  );
};

// ===== 메뉴 아이템 컴포넌트 =====
const MenuItemComponent: React.FC<{
  item: MenuItem;
  isDestructive?: boolean;
}> = ({ item, isDestructive = false }) => {
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
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            flex: 1 
          }}>
            <View style={{ marginRight: spacing.md }}>
              <IconText name={item.icon} color={iconColor} />
            </View>
            <Text style={createTextStyle('base', 'medium', textColor)}>
              {item.text}
            </Text>
          </View>
          <IconText name="ChevronRight" color={colors.mutedForeground} />
        </CardContent>
      </Card>
    </Pressable>
  );
};

// ===== 사용자 정보 섹션 컴포넌트 =====
const UserInfoSection: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  return (
    <View style={{
      alignItems: 'center',
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl * 1.5,
    }}>
      <Avatar 
        size={96}
        imageUrl={profile.avatarUrl}
        fallbackText={profile.name.charAt(0)}
      />
      
      <Text style={[
        createTextStyle('xl', 'bold', 'foreground'),
        { marginTop: spacing.md }
      ]}>
        {profile.name}
      </Text>
      
      <Text style={[
        createTextStyle('sm', 'normal', 'mutedForeground'),
        { marginTop: spacing.xs }
      ]}>
        {profile.email}
      </Text>
    </View>
  );
};

// ===== 메뉴 섹션 컴포넌트 =====
const MenuSection: React.FC<{ 
  title?: string; 
  items: MenuItem[]; 
  isDestructive?: boolean; 
}> = ({ title, items, isDestructive = false }) => {
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
          />
        ))}
      </View>
    </View>
  );
};

// ===== 테마 설정 컴포넌트 =====
const ThemeSettingsSection: React.FC = () => {
  const { themeMode, setThemeMode, isDark, toggleTheme } = useTheme();
  const themeColors = useThemeColors();

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '💻';
      default: return '🌟';
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
        테마 설정
      </Text>
      
      <Card>
        <CardContent style={{ padding: spacing.md }}>
          {/* 테마 모드 선택 */}
          <Pressable 
            onPress={handleThemeModePress}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: spacing.md 
            }}
            accessibilityRole="button"
            accessibilityLabel={`현재 테마: ${getThemeModeText()}`}
            accessibilityHint="탭하여 테마 모드 변경"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
          {themeMode !== 'system' && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              paddingTop: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: themeColors.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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

// ===== 접근성 설정 컴포넌트 =====
const AccessibilitySettingsSection: React.FC = () => {
  const { fontScale, setFontScale } = useTheme();
  const themeColors = useThemeColors();

  const fontSizeOptions = [
    { scale: 0.8, label: '작게' },
    { scale: 1.0, label: '보통' },
    { scale: 1.2, label: '크게' },
    { scale: 1.5, label: '매우 크게' },
  ];

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
        접근성
      </Text>
      
      <Card>
        <CardContent style={{ padding: spacing.md }}>
          <Pressable 
            onPress={handleFontSizePress}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}
            accessibilityRole="button"
            accessibilityLabel={`현재 글자 크기: ${getCurrentSizeLabel()}`}
            accessibilityHint="탭하여 글자 크기 변경"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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

// ===== 메인 프로필 화면 컴포넌트 =====
export default function ProfileScreen() {
  const themeColors = useThemeColors();
  
  const [userProfile] = useState<UserProfile>({
    name: '홍길동',
    email: 'hong@example.com',
    avatarUrl: undefined, // 실제 이미지 URL로 변경 가능
  });

  // 메뉴 아이템 정의
  const mainMenuItems: MenuItem[] = [
    {
      id: 'account-info',
      icon: 'User',
      text: '계정 정보',
      onPress: () => {
        InteractionHaptics.navigate();
        Alert.alert('계정 정보', '계정 정보 화면으로 이동합니다.');
      },
    },
    {
      id: 'notification-settings',
      icon: 'Bell',
      text: '알림 설정',
      onPress: () => {
        InteractionHaptics.navigate();
        Alert.alert('알림 설정', '알림 설정 화면으로 이동합니다.');
      },
    },
    {
      id: 'contact-us',
      icon: 'HelpCircle',
      text: '문의하기',
      onPress: () => {
        InteractionHaptics.navigate();
        Alert.alert('문의하기', '문의하기 화면으로 이동합니다.');
      },
    },
  ];

  const logoutMenuItem: MenuItem[] = [
    {
      id: 'logout',
      icon: 'LogOut',
      text: '로그아웃',
      onPress: () => {
        InteractionHaptics.buttonPressDestructive();
        Alert.alert(
          '로그아웃',
          '정말 로그아웃 하시겠습니까?',
          [
            { text: '취소', style: 'cancel', onPress: () => {
              InteractionHaptics.cancel();
            }},
            { 
              text: '로그아웃', 
              style: 'destructive',
              onPress: () => {
                InteractionHaptics.confirm();
                Alert.alert('로그아웃', '로그아웃되었습니다.');
              }
            },
          ]
        );
      },
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* 사용자 정보 섹션 */}
        <UserInfoSection profile={userProfile} />

        {/* 테마 설정 */}
        <ThemeSettingsSection />

        {/* 접근성 설정 */}
        <AccessibilitySettingsSection />

        {/* 메인 메뉴 */}
        <MenuSection title="계정" items={mainMenuItems} />

        {/* 피드백 섹션 */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[
            createTextStyle('sm', 'semibold', 'mutedForeground'),
            { marginBottom: spacing.sm, paddingHorizontal: spacing.xs }
          ]}>
            지원
          </Text>
          
          <Card>
            <CardContent style={{ padding: spacing.md }}>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 20, marginRight: spacing.md }}>
                    💬
                  </Text>
                  <View>
                    <Text style={createTextStyle('base', 'medium', 'foreground')}>
                      피드백 보내기
                    </Text>
                    <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
                      버그 신고, 기능 요청 등
                    </Text>
                  </View>
                </View>
                <FeedbackButton
                  title="보내기"
                  variant="outline"
                  size="sm"
                  onSubmitSuccess={() => {
                    Alert.alert('감사합니다', '소중한 피드백을 보내주셔서 감사합니다!');
                  }}
                />
              </View>
            </CardContent>
          </Card>
        </View>

        {/* 로그아웃 */}
        <MenuSection items={logoutMenuItem} isDestructive={true} />

        {/* 앱 정보 */}
        <View style={{
          alignItems: 'center',
          paddingTop: spacing.xl,
          paddingBottom: spacing.lg,
        }}>
          <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
            Sauron Mobile v1.0.0
          </Text>
          <Text style={[
            createTextStyle('xs', 'normal', 'mutedForeground'),
            { marginTop: spacing.xs }
          ]}>
            © 2024 Sauron Team
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 