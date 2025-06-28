import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Toast, { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react-native';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle, createButtonStyle, createContainerStyle } from '@/~/lib/utils';

// ===== Dialog 버튼이 있는 Toast 컴포넌트 =====

/**
 * Dialog형 Toast Props 인터페이스
 */
interface DialogToastProps extends BaseToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  props?: {
    showButtons?: boolean;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
}

/**
 * Dialog형 Toast 컴포넌트 (Alert.alert 대체)
 * 확인/취소 버튼이 포함된 Toast를 렌더링합니다.
 */
const DialogToast: React.FC<DialogToastProps> = (props) => {
  const { text1, text2, props: customProps, type } = props;
  const {
    showButtons,
    confirmText = '확인',
    cancelText = '취소',
    onConfirm,
    onCancel,
  } = customProps || {};

  // 아이콘 선택 (type에 따라)
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={20} color={colors.customOrange} />;
      case 'error':
        return <XCircle size={20} color={colors.customRed} />;
      default:
        return <Info size={20} color={colors.primary} />;
    }
  };

  return (
    <View 
      style={createContainerStyle('md', undefined, 'card', 'lg')}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`${text1}${text2 ? `, ${text2}` : ''}`}
      accessibilityLiveRegion="assertive"
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
      }}>
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing.sm,
        }}>
          {getIcon()}
        </View>
        <View style={{ flex: 1 }}>
          <Text 
            style={createTextStyle('base', 'semibold', 'foreground')}
            accessibilityRole="text"
            accessibilityLabel={text1}
          >
            {text1}
          </Text>
          {text2 && (
            <Text 
              style={createTextStyle('sm', 'normal', 'mutedForeground')}
              accessibilityRole="text"
              accessibilityLabel={text2}
            >
              {text2}
            </Text>
          )}
        </View>
      </View>
      
      {showButtons && (
        <View 
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: spacing.md,
            gap: spacing.sm,
          }}
          accessible
          accessibilityLabel="대화상자 버튼들"
        >
          {onCancel && (
            <TouchableOpacity
              style={createButtonStyle('outline', 'sm')}
              onPress={onCancel}
              accessible
              accessibilityRole="button"
              accessibilityLabel={cancelText}
              accessibilityHint="대화상자를 취소합니다"
            >
              <Text style={createTextStyle('sm', 'medium', 'foreground')}>{cancelText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={createButtonStyle('default', 'sm')}
            onPress={onConfirm}
            accessible
            accessibilityRole="button"
            accessibilityLabel={confirmText}
            accessibilityHint="작업을 확인합니다"
          >
            <Text style={createTextStyle('sm', 'medium', 'primaryForeground')}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ===== 기본 Toast Configuration =====
export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: 5,
        borderLeftColor: colors.customGreen,
        backgroundColor: colors.card,
        borderRadius: 8,
        marginHorizontal: spacing.md,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}
      text1Style={createTextStyle('sm', 'semibold', 'foreground')}
      text2Style={createTextStyle('xs', 'normal', 'mutedForeground')}
      renderLeadingIcon={() => (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: spacing.sm,
          marginRight: spacing.xs,
        }}>
          <CheckCircle size={20} color={colors.customGreen} />
        </View>
      )}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftWidth: 5,
        borderLeftColor: colors.customRed,
        backgroundColor: colors.card,
        borderRadius: 8,
        marginHorizontal: spacing.md,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}
      text1Style={createTextStyle('sm', 'semibold', 'foreground')}
      text2Style={createTextStyle('xs', 'normal', 'mutedForeground')}
      renderLeadingIcon={() => (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: spacing.sm,
          marginRight: spacing.xs,
        }}>
          <XCircle size={20} color={colors.customRed} />
        </View>
      )}
    />
  ),
  warning: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: 5,
        borderLeftColor: colors.customOrange,
        backgroundColor: colors.card,
        borderRadius: 8,
        marginHorizontal: spacing.md,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}
      text1Style={createTextStyle('sm', 'semibold', 'foreground')}
      text2Style={createTextStyle('xs', 'normal', 'mutedForeground')}
      renderLeadingIcon={() => (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: spacing.sm,
          marginRight: spacing.xs,
        }}>
          <AlertTriangle size={20} color={colors.customOrange} />
        </View>
      )}
    />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: 5,
        borderLeftColor: colors.primary,
        backgroundColor: colors.card,
        borderRadius: 8,
        marginHorizontal: spacing.md,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}
      text1Style={createTextStyle('sm', 'semibold', 'foreground')}
      text2Style={createTextStyle('xs', 'normal', 'mutedForeground')}
      renderLeadingIcon={() => (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: spacing.sm,
          marginRight: spacing.xs,
        }}>
          <Info size={20} color={colors.primary} />
        </View>
      )}
    />
  ),
  
  // Dialog형 Toast 추가 (Alert.alert 대체)
  dialog: (props: BaseToastProps) => <DialogToast {...props} />,
};

// Toast Provider Component (앱 루트에서 사용)
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={{ flex: 1 }}>
      {children}
      <Toast config={toastConfig} />
    </View>
  );
};

// 사용자 정의 Toast 컴포넌트들
export const CustomToast: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}> = ({ type, title, message, duration = 4000 }) => {
  React.useEffect(() => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
    });
  }, [type, title, message, duration]);

  return null;
}; 