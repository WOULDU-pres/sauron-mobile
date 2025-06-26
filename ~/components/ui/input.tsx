/**
 * shadcn 대응 React Native Input 컴포넌트
 * React Native TextInput 기반으로 디자인 토큰과 유틸리티 연동
 */

import React from 'react';
import { 
  TextInput, 
  View,
  Text,
  type TextInputProps, 
  type ViewStyle,
  type TextStyle 
} from 'react-native';
import { 
  createInputStyle, 
  createTextStyle, 
  mergeStyles, 
  cn 
} from '../../lib/utils';
import { colors, spacing, borderRadius } from '../../lib/tokens';

// ===== 타입 정의 =====
export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * 입력 필드 스타일 변형
   */
  variant?: 'default' | 'destructive';
  
  /**
   * 라벨 텍스트
   */
  label?: string;
  
  /**
   * 에러 메시지
   */
  error?: string;
  
  /**
   * 도움말 텍스트
   */
  helperText?: string;
  
  /**
   * 필수 입력 여부
   */
  required?: boolean;
  
  /**
   * 비활성화 상태
   */
  disabled?: boolean;
  
  /**
   * 커스텀 스타일 클래스 (NativeWind 호환)
   */
  className?: string;
  
  /**
   * 커스텀 스타일 객체
   */
  style?: ViewStyle;
  
  /**
   * 입력 필드 커스텀 스타일
   */
  inputStyle?: TextStyle;
  
  /**
   * 컨테이너 스타일
   */
  containerStyle?: ViewStyle;
  
  /**
   * 다크 테마 사용 여부
   */
  isDark?: boolean;
}

// ===== 메모이즈된 입력 컴포넌트 =====
export const Input = React.memo<InputProps>(({
  variant = 'default',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  className,
  style,
  inputStyle,
  containerStyle,
  isDark = false,
  ...props
}) => {
  // 에러 상태에 따른 variant 조정
  const effectiveVariant = error ? 'destructive' : variant;
  
  // 입력 필드 스타일 생성
  const baseInputStyle = createInputStyle(effectiveVariant, isDark);
  
  // 비활성화 상태 스타일
  const disabledStyle: TextStyle = disabled ? {
    opacity: 0.5,
    backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
  } : {};
  
  // 최종 입력 필드 스타일
  const finalInputStyle = mergeStyles<TextStyle>(
    baseInputStyle,
    disabledStyle,
    inputStyle
  );
  
  // 라벨 스타일
  const labelStyle = createTextStyle(
    'sm',
    'medium',
    'foreground',
    isDark
  );
  
  // 에러 메시지 스타일
  const errorStyle = createTextStyle(
    'xs',
    'normal',
    'destructive',
    isDark
  );
  
  // 도움말 텍스트 스타일
  const helperStyle = createTextStyle(
    'xs',
    'normal',
    'mutedForeground',
    isDark
  );
  
  // 컨테이너 스타일
  const finalContainerStyle = mergeStyles<ViewStyle>(
    containerStyle
  );
  
  return (
    <View style={finalContainerStyle} className={cn(className)}>
      {/* 라벨 */}
      {label && (
        <Text style={[labelStyle, { marginBottom: spacing.xs }]}>
          {label}
          {required && (
            <Text style={{ color: colors.destructive }}> *</Text>
          )}
        </Text>
      )}
      
      {/* 입력 필드 */}
      <TextInput
        style={finalInputStyle}
        editable={!disabled}
        placeholderTextColor={isDark ? colors.mutedForeground : colors.mutedForeground}
        {...props}
      />
      
      {/* 에러 메시지 */}
      {error && (
        <Text style={[errorStyle, { marginTop: spacing.xs }]}>
          {error}
        </Text>
      )}
      
      {/* 도움말 텍스트 (에러가 없을 때만 표시) */}
      {!error && helperText && (
        <Text style={[helperStyle, { marginTop: spacing.xs }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

// ===== 입력 필드 변형 컴포넌트들 =====

/**
 * 검색용 입력 필드
 */
export const SearchInput = React.memo<Omit<InputProps, 'variant'>>((props) => (
  <Input 
    variant="default" 
    placeholder="검색..." 
    returnKeyType="search"
    {...props} 
  />
));

/**
 * 비밀번호 입력 필드
 */
export const PasswordInput = React.memo<Omit<InputProps, 'secureTextEntry'>>((props) => (
  <Input 
    secureTextEntry={true}
    placeholder="비밀번호를 입력하세요"
    autoCapitalize="none"
    autoCorrect={false}
    {...props} 
  />
));

/**
 * 이메일 입력 필드
 */
export const EmailInput = React.memo<Omit<InputProps, 'keyboardType' | 'autoCapitalize'>>((props) => (
  <Input 
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    placeholder="이메일을 입력하세요"
    {...props} 
  />
));

/**
 * 숫자 입력 필드
 */
export const NumberInput = React.memo<Omit<InputProps, 'keyboardType'>>((props) => (
  <Input 
    keyboardType="numeric"
    placeholder="숫자를 입력하세요"
    {...props} 
  />
));

/**
 * 전화번호 입력 필드
 */
export const PhoneInput = React.memo<Omit<InputProps, 'keyboardType'>>((props) => (
  <Input 
    keyboardType="phone-pad"
    placeholder="전화번호를 입력하세요"
    {...props} 
  />
));

/**
 * 멀티라인 텍스트 입력 필드
 */
export const TextArea = React.memo<Omit<InputProps, 'multiline' | 'numberOfLines'>>((props) => (
  <Input 
    multiline={true}
    numberOfLines={4}
    placeholder="내용을 입력하세요"
    inputStyle={{
      minHeight: 100,
      textAlignVertical: 'top',
      paddingTop: spacing.sm,
    }}
    {...props} 
  />
));

// ===== 기본 내보내기 =====
export default Input;
