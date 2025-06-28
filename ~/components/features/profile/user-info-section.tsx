/**
 * UserInfoSection - 재사용 가능한 사용자 정보 섹션 컴포넌트
 * profile.tsx에서 추출하여 재사용성 확보
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/primitives/avatar';
import { commonStyles } from '~/components/utils/common';
import { spacing } from '@/~/lib/tokens';
import { createTextStyle } from '@/~/lib/utils';

// ===== 타입 정의 =====
export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface UserInfoSectionProps {
  profile: UserProfile;
  size?: 'sm' | 'md' | 'lg';
  showEmail?: boolean;
}

// ===== UserInfoSection =====
export const UserInfoSection: React.FC<UserInfoSectionProps> = ({ 
  profile, 
  size = 'lg',
  showEmail = true 
}) => {
  const getAvatarSize = () => {
    switch (size) {
      case 'sm': return 'w-12 h-12';
      case 'md': return 'w-16 h-16';
      case 'lg': return 'w-24 h-24';
      default: return 'w-24 h-24';
    }
  };

  const getNameTextStyle = () => {
    switch (size) {
      case 'sm': return createTextStyle('base', 'bold', 'foreground');
      case 'md': return createTextStyle('lg', 'bold', 'foreground');
      case 'lg': return createTextStyle('xl', 'bold', 'foreground');
      default: return createTextStyle('xl', 'bold', 'foreground');
    }
  };

  const getFallbackTextStyle = () => {
    switch (size) {
      case 'sm': return createTextStyle('sm', 'bold', 'mutedForeground');
      case 'md': return createTextStyle('base', 'bold', 'mutedForeground');
      case 'lg': return createTextStyle('xl', 'bold', 'mutedForeground');
      default: return createTextStyle('xl', 'bold', 'mutedForeground');
    }
  };

  return (
    <View style={[
      commonStyles.centeredContent,
      {
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl * 1.5,
      }
    ]}>
      <Avatar className={getAvatarSize()} alt={`${profile.name} 프로필`}>
        {profile.avatarUrl && (
          <AvatarImage source={{ uri: profile.avatarUrl }} />
        )}
        <AvatarFallback>
          <Text style={getFallbackTextStyle()}>
            {profile.name.charAt(0)}
          </Text>
        </AvatarFallback>
      </Avatar>
      
      <Text style={[
        getNameTextStyle(),
        { marginTop: spacing.md }
      ]}>
        {profile.name}
      </Text>
      
      {showEmail && (
        <Text style={[
          createTextStyle('sm', 'normal', 'mutedForeground'),
          { marginTop: spacing.xs }
        ]}>
          {profile.email}
        </Text>
      )}
    </View>
  );
}; 