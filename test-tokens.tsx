/**
 * 디자인 토큰 및 유틸리티 함수 테스트 파일
 * 구현된 토큰들이 정상적으로 import되고 작동하는지 검증
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { 
  tokens, 
  colors, 
  spacing, 
  typography, 
  borderRadius, 
  getTokens 
} from './~/lib/tokens';
import { 
  cn, 
  createTextStyle, 
  createContainerStyle, 
  createButtonStyle, 
  createShadowStyle, 
  addOpacity, 
  commonStyles 
} from './~/lib/utils';

export function TokenTestComponent() {
  // 라이트/다크 테마 토큰 테스트
  const lightTokens = getTokens(false);
  const darkTokens = getTokens(true);
  
  // 스타일 생성 테스트
  const titleStyle = createTextStyle('2xl', 'bold', 'foreground');
  const subtitleStyle = createTextStyle('lg', 'medium', 'mutedForeground');
  const containerStyle = createContainerStyle('lg', 'card', 'lg');
  const buttonStyle = createButtonStyle('default', 'default');
  const shadowStyle = createShadowStyle('md');
  
  console.log('✅ 디자인 토큰 테스트 결과:');
  console.log('- lightTokens.colors.background:', lightTokens.colors.background);
  console.log('- darkTokens.colors.background:', darkTokens.colors.background);
  console.log('- spacing.md:', spacing.md);
  console.log('- typography.fontSize.base:', typography.fontSize.base);
  console.log('- borderRadius.lg:', borderRadius.lg);
  
  console.log('✅ 유틸리티 함수 테스트 결과:');
  console.log('- titleStyle:', titleStyle);
  console.log('- containerStyle:', containerStyle);
  console.log('- buttonStyle:', buttonStyle);
  console.log('- shadowStyle:', shadowStyle);
  console.log('- addOpacity("#FF0000", 0.5):', addOpacity('#FF0000', 0.5));
  
  return (
    <View style={[containerStyle, shadowStyle, { margin: spacing.md }]}>
      <Text style={titleStyle}>디자인 토큰 테스트</Text>
      <Text style={subtitleStyle}>shadcn → React Native 매핑 검증</Text>
      
      <View style={{ marginTop: spacing.md }}>
        <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
          배경색: {colors.background}
        </Text>
        <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
          전경색: {colors.foreground}
        </Text>
        <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
          커스텀 퍼플: {colors.customPurple}
        </Text>
      </View>
      
      <View style={[commonStyles.flexRow, { marginTop: spacing.lg, gap: spacing.sm }]}>
        <Pressable style={createButtonStyle('default', 'sm')}>
          <Text style={createTextStyle('sm', 'medium', 'primaryForeground')}>
            기본 버튼
          </Text>
        </Pressable>
        
        <Pressable style={createButtonStyle('outline', 'sm')}>
          <Text style={createTextStyle('sm', 'medium', 'foreground')}>
            아웃라인 버튼
          </Text>
        </Pressable>
      </View>
      
      <View style={{ 
        marginTop: spacing.lg,
        padding: spacing.sm,
        backgroundColor: addOpacity(colors.customPurple, 0.1),
        borderRadius: borderRadius.md 
      }}>
        <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
          투명도 테스트: customPurple 10% 투명도
        </Text>
      </View>
    </View>
  );
}

export default TokenTestComponent; 