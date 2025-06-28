/**
 * shadcn 대응 React Native Modal 컴포넌트
 * React Native Modal 기반으로 디자인 토큰과 유틸리티 연동
 */

import React from 'react';
import { 
  Modal as RNModal,
  View, 
  Text,
  Pressable,
  ScrollView,
  type ModalProps as RNModalProps,
  type ViewStyle,
  type TextStyle 
} from 'react-native';
import { 
  createContainerStyle, 
  createTextStyle, 
  createShadowStyle,
  createButtonStyle,
  mergeStyles, 
  cn,
  commonStyles
} from '@/~/lib/utils';
import { colors, spacing, borderRadius } from '@/~/lib/tokens';

// ===== 타입 정의 =====
export interface ModalProps extends Omit<RNModalProps, 'children'> {
  /**
   * 모달 표시 여부
   */
  visible: boolean;
  
  /**
   * 모달 닫기 콜백
   */
  onClose: () => void;
  
  /**
   * 모달 제목
   */
  title?: string;
  
  /**
   * 모달 설명
   */
  description?: string;
  
  /**
   * 모달 크기
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /**
   * 배경 터치로 닫기 여부
   */
  dismissOnBackdropPress?: boolean;
  
  /**
   * 뒤로가기 버튼으로 닫기 여부
   */
  dismissOnBackPress?: boolean;
  
  /**
   * 닫기 버튼 표시 여부
   */
  showCloseButton?: boolean;
  
  /**
   * 커스텀 스타일 클래스 (NativeWind 호환)
   */
  className?: string;
  
  /**
   * 커스텀 스타일 객체
   */
  style?: ViewStyle;
  
  /**
   * 다크 테마 사용 여부
   */
  isDark?: boolean;
  
  /**
   * 모달 내용
   */
  children: React.ReactNode;
}

export interface ModalHeaderProps {
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
  style?: ViewStyle;
  isDark?: boolean;
}

export interface ModalContentProps {
  className?: string;
  style?: ViewStyle;
  scrollable?: boolean;
  children: React.ReactNode;
}

export interface ModalFooterProps {
  className?: string;
  style?: ViewStyle;
  children: React.ReactNode;
}

// ===== 메인 Modal 컴포넌트 =====
export const Modal = React.memo<ModalProps>(({
  visible,
  onClose,
  title,
  description,
  size = 'md',
  dismissOnBackdropPress = true,
  dismissOnBackPress = true,
  showCloseButton = true,
  className,
  style,
  isDark = false,
  children,
  ...props
}) => {
  // 모달 크기별 스타일
  const getSizeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: isDark ? colors.card : colors.card,
      borderRadius: borderRadius.lg,
      maxHeight: '90%',
    };
    
    switch (size) {
      case 'sm':
        return { ...baseStyle, width: '80%', maxWidth: 300 };
      case 'md':
        return { ...baseStyle, width: '85%', maxWidth: 400 };
      case 'lg':
        return { ...baseStyle, width: '90%', maxWidth: 500 };
      case 'xl':
        return { ...baseStyle, width: '95%', maxWidth: 600 };
      case 'full':
        return { ...baseStyle, width: '100%', height: '100%', borderRadius: 0, maxHeight: '100%' };
      default:
        return { ...baseStyle, width: '85%', maxWidth: 400 };
    }
  };
  
  // 배경 스타일
  const backdropStyle: ViewStyle = {
    ...commonStyles.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    ...commonStyles.flexCenter,
  };
  
  // 모달 컨테이너 스타일
  const modalStyle = mergeStyles<ViewStyle>(
    getSizeStyle(),
    createShadowStyle('xl'),
    style
  );
  
  // 배경 터치 핸들러
  const handleBackdropPress = () => {
    if (dismissOnBackdropPress) {
      onClose();
    }
  };
  
  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={dismissOnBackPress ? onClose : undefined}
      {...props}
    >
      <Pressable 
        style={backdropStyle} 
        onPress={handleBackdropPress}
      >
        <Pressable 
          style={modalStyle}
          className={cn(className)}
          onPress={(e) => e.stopPropagation()} // 모달 내부 터치 시 닫기 방지
        >
          {/* 헤더 */}
          {(title || description || showCloseButton) && (
            <ModalHeader
              title={title}
              description={description}
              showCloseButton={showCloseButton}
              onClose={onClose}
              isDark={isDark}
            />
          )}
          
          {/* 내용 */}
          <ModalContent scrollable={size !== 'full'}>
            {children}
          </ModalContent>
        </Pressable>
      </Pressable>
    </RNModal>
  );
});

Modal.displayName = 'Modal';

// ===== Modal 서브 컴포넌트들 =====

/**
 * Modal 헤더
 */
export const ModalHeader = React.memo<ModalHeaderProps>(({
  title,
  description,
  showCloseButton = true,
  onClose,
  className,
  style,
  isDark = false,
}) => {
  const headerStyle: ViewStyle = {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.border : colors.border,
  };
  
  const titleStyle = createTextStyle('xl', 'semibold', 'foreground', isDark);
  const descriptionStyle = createTextStyle('sm', 'normal', 'mutedForeground', isDark);
  
  const closeButtonStyle = createButtonStyle('ghost', 'icon', isDark);
  
  return (
    <View style={mergeStyles<ViewStyle>(headerStyle, style)} className={cn(className)}>
      <View style={commonStyles.flexRow}>
        <View style={{ flex: 1 }}>
          {title && (
            <Text style={titleStyle}>{title}</Text>
          )}
          {description && (
            <Text style={[descriptionStyle, { marginTop: spacing.xs }]}>
              {description}
            </Text>
          )}
        </View>
        
        {showCloseButton && onClose && (
          <Pressable 
            style={[closeButtonStyle, { marginLeft: spacing.sm }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="모달 닫기"
          >
            <Text style={createTextStyle('lg', 'normal', 'foreground', isDark)}>×</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});

ModalHeader.displayName = 'ModalHeader';

/**
 * Modal 콘텐츠
 */
export const ModalContent = React.memo<ModalContentProps>(({
  className,
  style,
  scrollable = true,
  children,
}) => {
  const contentStyle: ViewStyle = {
    padding: spacing.lg,
    flex: 1,
  };
  
  const finalStyle = mergeStyles<ViewStyle>(contentStyle, style);
  
  if (scrollable) {
    return (
      <ScrollView 
        style={finalStyle}
        className={cn(className)}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }
  
  return (
    <View style={finalStyle} className={cn(className)}>
      {children}
    </View>
  );
});

ModalContent.displayName = 'ModalContent';

/**
 * Modal 푸터
 */
export const ModalFooter = React.memo<ModalFooterProps>(({
  className,
  style,
  children,
}) => {
  const footerStyle: ViewStyle = {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...commonStyles.flexRow,
    justifyContent: 'flex-end',
    gap: spacing.sm,
  };
  
  return (
    <View style={mergeStyles<ViewStyle>(footerStyle, style)} className={cn(className)}>
      {children}
    </View>
  );
});

ModalFooter.displayName = 'ModalFooter';

// ===== Modal 변형 컴포넌트들 =====

/**
 * 확인 다이얼로그
 */
export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
}

export const ConfirmModal = React.memo<ConfirmModalProps>(({
  title = '확인',
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  onClose,
  variant = 'default',
  isDark = false,
  ...props
}) => {
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  return (
    <Modal
      title={title}
      description={description}
      onClose={onClose}
      size="sm"
      isDark={isDark}
      {...props}
    >
      <ModalFooter>
        <Pressable 
          style={createButtonStyle('outline', 'default', isDark)}
          onPress={handleCancel}
        >
          <Text style={createTextStyle('base', 'medium', 'foreground', isDark)}>
            {cancelText}
          </Text>
        </Pressable>
        
        <Pressable 
          style={createButtonStyle(variant === 'destructive' ? 'destructive' : 'default', 'default', isDark)}
          onPress={handleConfirm}
        >
          <Text style={createTextStyle('base', 'medium', variant === 'destructive' ? 'destructiveForeground' : 'primaryForeground', isDark)}>
            {confirmText}
          </Text>
        </Pressable>
      </ModalFooter>
    </Modal>
  );
});

/**
 * 알림 다이얼로그
 */
export interface AlertModalProps extends Omit<ModalProps, 'children'> {
  confirmText?: string;
  onConfirm?: () => void;
}

export const AlertModal = React.memo<AlertModalProps>(({
  title = '알림',
  description,
  confirmText = '확인',
  onConfirm,
  onClose,
  isDark = false,
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };
  
  return (
    <Modal
      title={title}
      description={description}
      onClose={onClose}
      size="sm"
      isDark={isDark}
      showCloseButton={false}
      {...props}
    >
      <ModalFooter>
        <Pressable 
          style={createButtonStyle('default', 'default', isDark)}
          onPress={handleConfirm}
        >
          <Text style={createTextStyle('base', 'medium', 'primaryForeground', isDark)}>
            {confirmText}
          </Text>
        </Pressable>
      </ModalFooter>
    </Modal>
  );
});

// ===== 기본 내보내기 =====
export default Modal; 