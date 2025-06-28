/**
 * CommonIcon - 이모지를 lucide 아이콘으로 대체하기 위한 공통 컴포넌트
 * 
 * 사용법:
 * <CommonIcon name="bug" size={20} color={colors.primary} />
 */

import React from 'react';
import { View, Text } from 'react-native';
import { 
  Bug, 
  Lightbulb, 
  Zap, 
  MessageCircle, 
  CheckCircle, 
  XCircle,
  User,
  Bell,
  Sun,
  Moon,
  Monitor,
  Star,
  MapPin,
  ChevronRight,
  HelpCircle,
  LogOut,
  type LucideIcon 
} from 'lucide-react-native';
import { colors } from '@/~/lib/tokens';

// ===== 아이콘 매핑 타입 정의 =====
export type IconName = 
  | 'bug'           // 🐛 -> Bug
  | 'lightbulb'     // 💡 -> Lightbulb
  | 'zap'           // ⚡ -> Zap
  | 'message'       // 💬 -> MessageCircle
  | 'check'         // ✅ -> CheckCircle
  | 'x-circle'      // ❌ -> XCircle
  | 'user'          // 👤 -> User
  | 'bell'          // 🔔 -> Bell
  | 'sun'           // ☀️ -> Sun
  | 'moon'          // 🌙 -> Moon
  | 'monitor'       // 💻 -> Monitor
  | 'star'          // 🌟 -> Star
  | 'map-pin'       // 📍 -> MapPin
  | 'chevron-right' // ➡️ -> ChevronRight
  | 'help-circle'   // ❓ -> HelpCircle
  | 'log-out';      // 🚪 -> LogOut

// ===== 아이콘 매핑 테이블 =====
const iconMap: Record<IconName, LucideIcon> = {
  'bug': Bug,
  'lightbulb': Lightbulb,
  'zap': Zap,
  'message': MessageCircle,
  'check': CheckCircle,
  'x-circle': XCircle,
  'user': User,
  'bell': Bell,
  'sun': Sun,
  'moon': Moon,
  'monitor': Monitor,
  'star': Star,
  'map-pin': MapPin,
  'chevron-right': ChevronRight,
  'help-circle': HelpCircle,
  'log-out': LogOut,
};

// ===== CommonIcon Props 정의 =====
export interface CommonIconProps {
  /** 아이콘 이름 */
  name: IconName;
  /** 아이콘 크기 (기본값: 20) */
  size?: number;
  /** 아이콘 색상 (기본값: colors.mutedForeground) */
  color?: string;
  /** 접근성 레이블 */
  accessibilityLabel?: string;
  /** 테스트용 ID */
  testID?: string;
  /** 추가 스타일 속성 */
  style?: object;
}

// ===== 아이콘 접근성 레이블 매핑 =====
const accessibilityLabels: Record<IconName, string> = {
  'bug': '버그',
  'lightbulb': '아이디어',
  'zap': '개선',
  'message': '메시지',
  'check': '완료',
  'x-circle': '오류',
  'user': '사용자',
  'bell': '알림',
  'sun': '라이트 모드',
  'moon': '다크 모드',
  'monitor': '시스템 모드',
  'star': '즐겨찾기',
  'map-pin': '위치',
  'chevron-right': '오른쪽 화살표',
  'help-circle': '도움말',
  'log-out': '로그아웃',
};

// ===== CommonIcon 컴포넌트 =====
export const CommonIcon: React.FC<CommonIconProps> = ({
  name,
  size = 20,
  color = colors.mutedForeground,
  accessibilityLabel,
  testID,
  style,
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    // 매핑되지 않은 아이콘인 경우 fallback 처리
    console.warn(`CommonIcon: Unknown icon name "${name}"`);
    return (
      <View 
        style={[
          { 
            width: size, 
            height: size, 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: colors.muted,
            borderRadius: size / 4,
          },
          style
        ]}
        testID={testID}
      >
        <Text style={{ fontSize: size * 0.6, color }}>?</Text>
      </View>
    );
  }
  
  return (
    <IconComponent
      size={size}
      color={color}
      accessibilityLabel={accessibilityLabel || accessibilityLabels[name]}
      testID={testID}
      style={style}
    />
  );
};

// ===== 편의 훅: useCommonIcon =====
export const useCommonIcon = () => {
  const getIconComponent = (name: IconName, props?: Partial<CommonIconProps>) => {
    return <CommonIcon name={name} {...props} />;
  };
  
  const getAccessibilityLabel = (name: IconName) => {
    return accessibilityLabels[name];
  };
  
  const isValidIconName = (name: string): name is IconName => {
    return name in iconMap;
  };
  
  return {
    getIconComponent,
    getAccessibilityLabel,
    isValidIconName,
    availableIcons: Object.keys(iconMap) as IconName[],
  };
};

export default CommonIcon; 