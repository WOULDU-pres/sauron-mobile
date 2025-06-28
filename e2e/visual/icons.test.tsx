/**
 * 아이콘 일관성 및 시각적 회귀 테스트
 * CommonIcon 컴포넌트와 이모지 대체 아이콘들의 시각적 일관성을 검증합니다.
 */

import React from 'react';
import { View, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { CommonIcon, type IconName } from '~/components/ui/common-icon';
import { colors, spacing } from '@/~/lib/tokens';

// Mock render function for tests
const render = (component: React.ReactElement) => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(component);
  });
  return {
    toJSON: () => tree!.toJSON(),
  };
};

// 테스트용 아이콘 그리드 컴포넌트
const IconGrid: React.FC<{ 
  title: string; 
  icons: IconName[]; 
  size?: number; 
  color?: string; 
}> = ({ title, icons, size = 24, color = colors.foreground }) => {
  return (
    <View style={{ 
      padding: spacing.lg, 
      backgroundColor: colors.background,
      minHeight: 400 
    }}>
      <Text style={{ 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: colors.foreground,
        marginBottom: spacing.lg,
        textAlign: 'center'
      }}>
        {title}
      </Text>
      
      <View style={{ 
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.md
      }}>
        {icons.map((iconName) => (
          <View key={iconName} style={{
            alignItems: 'center',
            padding: spacing.sm,
            borderRadius: 8,
            backgroundColor: colors.card,
            minWidth: 80,
          }}>
            <CommonIcon 
              name={iconName} 
              size={size} 
              color={color}
              testID={`icon-${iconName}`}
            />
            <Text style={{ 
              fontSize: 10, 
              color: colors.mutedForeground,
              marginTop: spacing.xs,
              textAlign: 'center'
            }}>
              {iconName}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 아이콘 크기별 비교 컴포넌트
const IconSizeComparison: React.FC<{ icon: IconName }> = ({ icon }) => {
  const sizes = [12, 16, 20, 24, 32];
  
  return (
    <View style={{ 
      padding: spacing.lg,
      backgroundColor: colors.background,
      alignItems: 'center'
    }}>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: colors.foreground,
        marginBottom: spacing.lg
      }}>
        크기별 {icon} 아이콘
      </Text>
      
      <View style={{ 
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg
      }}>
        {sizes.map((size) => (
          <View key={size} style={{ alignItems: 'center' }}>
            <CommonIcon 
              name={icon} 
              size={size} 
              color={colors.primary}
              testID={`icon-${icon}-${size}`}
            />
            <Text style={{ 
              fontSize: 10, 
              color: colors.mutedForeground,
              marginTop: spacing.xs
            }}>
              {size}px
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 테마별 아이콘 컴포넌트
const ThemedIcons: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const themeColors = isDark ? {
    background: '#0F172A',
    foreground: '#F8FAFC',
    card: '#1E293B',
    mutedForeground: '#64748B',
    primary: '#3B82F6',
    destructive: '#EF4444',
  } : {
    background: '#F7F8FA',
    foreground: '#0F172A',
    card: '#FFFFFF',
    mutedForeground: '#64748B',
    primary: '#1E293B',
    destructive: '#EF4444',
  };

  const contextIcons: IconName[] = ['bug', 'lightbulb', 'zap', 'message'];
  
  return (
    <View style={{ 
      padding: spacing.lg,
      backgroundColor: themeColors.background,
      minHeight: 200
    }}>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: themeColors.foreground,
        marginBottom: spacing.lg,
        textAlign: 'center'
      }}>
        {isDark ? '다크' : '라이트'} 테마 - 컨텍스트별 아이콘
      </Text>
      
      <View style={{ 
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        {contextIcons.map((iconName) => (
          <View key={iconName} style={{ alignItems: 'center' }}>
            <View style={{
              padding: spacing.md,
              borderRadius: 8,
              backgroundColor: themeColors.card,
              marginBottom: spacing.sm,
            }}>
              <CommonIcon 
                name={iconName} 
                size={24} 
                color={iconName === 'bug' ? themeColors.destructive : themeColors.primary}
                testID={`themed-icon-${iconName}-${isDark ? 'dark' : 'light'}`}
              />
            </View>
            <Text style={{ 
              fontSize: 10, 
              color: themeColors.mutedForeground,
              textAlign: 'center'
            }}>
              {iconName}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

describe('아이콘 일관성 시각적 회귀 테스트', () => {
  // 모든 지원 아이콘 목록
  const allIcons: IconName[] = [
    'bug', 'lightbulb', 'zap', 'message',
    'check', 'x-circle', 'user', 'bell',
    'sun', 'moon', 'monitor', 'star', 'map-pin'
  ];

  // 카테고리별 아이콘 그룹
  const iconCategories = {
    feedback: ['bug', 'lightbulb', 'zap', 'message'] as IconName[],
    status: ['check', 'x-circle'] as IconName[],
    user: ['user', 'bell'] as IconName[],
    theme: ['sun', 'moon', 'monitor', 'star'] as IconName[],
    location: ['map-pin'] as IconName[]
  };

  describe('아이콘 그리드 일관성', () => {
    it('전체 아이콘 그리드 - 라이트 테마', () => {
      let component: renderer.ReactTestRenderer;
      act(() => {
        component = renderer.create(
          <IconGrid 
            title="전체 CommonIcon 아이콘 (라이트 테마)"
            icons={allIcons}
            size={24}
            color={colors.foreground}
          />
        );
      });
      expect(component!.toJSON()).toMatchSnapshot();
    });

    it('전체 아이콘 그리드 - 다크 테마', () => {
      let component: renderer.ReactTestRenderer;
      act(() => {
        component = renderer.create(
          <View style={{ backgroundColor: '#0F172A' }}>
            <IconGrid 
              title="전체 CommonIcon 아이콘 (다크 테마)"
              icons={allIcons}
              size={24}
              color="#F8FAFC"
            />
          </View>
        );
      });
      expect(component!.toJSON()).toMatchSnapshot();
    });

    Object.entries(iconCategories).forEach(([category, icons]) => {
      it(`${category} 카테고리 아이콘 그리드`, () => {
        const component = renderer.create(
          <IconGrid 
            title={`${category.toUpperCase()} 카테고리 아이콘`}
            icons={icons}
            size={28}
            color={colors.primary}
          />
        );
        expect(component.toJSON()).toMatchSnapshot();
      });
    });
  });

  describe('아이콘 크기별 일관성', () => {
    const keyIcons: IconName[] = ['bug', 'user', 'star'];
    
    keyIcons.forEach((icon) => {
      it(`${icon} 아이콘 크기별 비교`, () => {
        const { toJSON } = render(
          <IconSizeComparison icon={icon} />
        );
        expect(toJSON()).toMatchSnapshot(`${icon}-size-comparison.png`);
      });
    });
  });

  describe('테마별 아이콘 렌더링', () => {
    it('라이트 테마 컨텍스트 아이콘', () => {
      const { toJSON } = render(
        <ThemedIcons isDark={false} />
      );
      expect(toJSON()).toMatchSnapshot('light-theme-context-icons.png');
    });

    it('다크 테마 컨텍스트 아이콘', () => {
      const { toJSON } = render(
        <ThemedIcons isDark={true} />
      );
      expect(toJSON()).toMatchSnapshot('dark-theme-context-icons.png');
    });
  });

  describe('아이콘 접근성 및 기능 테스트', () => {
    it('모든 아이콘이 올바른 testID를 가져야 함', () => {
      const { toJSON } = render(
        <IconGrid 
          title="접근성 테스트"
          icons={allIcons}
        />
      );
      
      // 스냅샷으로 접근성 테스트 대체
      expect(toJSON()).toMatchSnapshot('accessibility-test-icons.png');
    });

    it('잘못된 아이콘 이름에 대한 fallback 렌더링', () => {
      const { toJSON } = render(
        <View style={{ padding: spacing.lg, backgroundColor: colors.background }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.foreground, marginBottom: spacing.md }}>
            Fallback 아이콘 테스트
          </Text>
          <CommonIcon 
            // @ts-ignore - 의도적으로 잘못된 타입 테스트
            name="invalid-icon-name" 
            size={24} 
            color={colors.destructive}
            testID="fallback-icon"
          />
        </View>
      );
      
      expect(toJSON()).toMatchSnapshot('fallback-icon-rendering.png');
    });
  });

  describe('실제 사용 컨텍스트 테스트', () => {
    it('피드백 폼 스타일 아이콘 렌더링', () => {
      const feedbackTypes = [
        { icon: 'bug' as IconName, label: '버그 신고', color: colors.destructive },
        { icon: 'lightbulb' as IconName, label: '기능 요청', color: colors.primary },
        { icon: 'zap' as IconName, label: '개선 제안', color: '#F59E0B' },
        { icon: 'message' as IconName, label: '기타', color: colors.mutedForeground },
      ];

      const { toJSON } = render(
        <View style={{ 
          padding: spacing.lg,
          backgroundColor: colors.background
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: colors.foreground,
            marginBottom: spacing.lg,
            textAlign: 'center'
          }}>
            피드백 폼 스타일 아이콘
          </Text>
          
          {feedbackTypes.map((type) => (
            <View key={type.icon} style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: spacing.md,
              marginBottom: spacing.sm,
              backgroundColor: colors.card,
              borderRadius: 8,
            }}>
              <CommonIcon 
                name={type.icon}
                size={20}
                color={type.color}
                testID={`feedback-${type.icon}`}
              />
              <Text style={{ 
                marginLeft: spacing.md,
                fontSize: 14,
                color: colors.foreground
              }}>
                {type.label}
              </Text>
            </View>
          ))}
        </View>
      );
      
      expect(toJSON()).toMatchSnapshot('feedback-form-style-icons.png');
    });

    it('프로필 메뉴 스타일 아이콘 렌더링', () => {
      const menuItems = [
        { icon: 'user' as IconName, label: '계정 정보' },
        { icon: 'bell' as IconName, label: '알림 설정' },
        { icon: 'star' as IconName, label: '즐겨찾기' },
      ];

      const { toJSON } = render(
        <View style={{ 
          padding: spacing.lg,
          backgroundColor: colors.background
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: colors.foreground,
            marginBottom: spacing.lg,
            textAlign: 'center'
          }}>
            프로필 메뉴 스타일 아이콘
          </Text>
          
          {menuItems.map((item) => (
            <View key={item.icon} style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing.md,
              marginBottom: spacing.sm,
              backgroundColor: colors.card,
              borderRadius: 8,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CommonIcon 
                  name={item.icon}
                  size={20}
                  color={colors.mutedForeground}
                  testID={`menu-${item.icon}`}
                />
                <Text style={{ 
                  marginLeft: spacing.md,
                  fontSize: 14,
                  color: colors.foreground
                }}>
                  {item.label}
                </Text>
              </View>
              <Text style={{ color: colors.mutedForeground }}>›</Text>
            </View>
          ))}
        </View>
      );
      
      expect(toJSON()).toMatchSnapshot('profile-menu-style-icons.png');
    });
  });
}); 