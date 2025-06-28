/**
 * @fileoverview Toast 알림 시스템 관리 훅
 * 
 * 기존 SimpleNotification과 react-native-toast-message를 통합하여
 * 일관된 Toast API를 제공합니다. Alert.alert 대체 기능도 포함합니다.
 * 
 * @features
 * - 간단한 Toast 메시지 (success, error, warning, info)
 * - 확인/취소 Dialog형 Toast
 * - 사전 정의된 메시지 presets
 * - 접근성 지원
 * 
 * @author Sauron Mobile Team
 * @version 1.0.0
 * @since 2024
 */

import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

// ===== 타입 정의 =====

/**
 * Toast 메시지 타입
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * 간단한 Toast 메시지 옵션
 */
export interface SimpleToastOptions {
  /** 메시지 제목 */
  title: string;
  /** 메시지 상세 내용 (선택사항) */
  message?: string;
  /** 표시 시간 (ms) */
  duration?: number;
  /** 위치 */
  position?: 'top' | 'bottom';
  /** 상단 오프셋 */
  topOffset?: number;
}

/**
 * Dialog형 Toast 옵션 (Alert.alert 대체)
 */
export interface DialogToastOptions {
  /** 대화상자 제목 */
  title: string;
  /** 대화상자 메시지 */
  message?: string;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 확인 콜백 */
  onConfirm?: () => void;
  /** 취소 콜백 */
  onCancel?: () => void;
  /** 대화상자 타입 */
  type?: 'info' | 'warning' | 'error';
}

/**
 * useToast 훅 반환 타입
 */
export interface UseToastReturn {
  /** 간단한 Toast 메시지 표시 */
  showToast: (type: ToastType, options: SimpleToastOptions) => void;
  /** 성공 Toast 표시 */
  showSuccess: (title: string, message?: string) => void;
  /** 오류 Toast 표시 */
  showError: (title: string, message?: string) => void;
  /** 경고 Toast 표시 */
  showWarning: (title: string, message?: string) => void;
  /** 정보 Toast 표시 */
  showInfo: (title: string, message?: string) => void;
  /** Dialog형 Toast 표시 (Alert 대체) */
  showDialog: (options: DialogToastOptions) => void;
  /** 모든 Toast 숨기기 */
  hideToast: () => void;
  /** 사전 정의된 메시지들 */
  presets: {
    success: {
      saved: () => void;
      deleted: () => void;
      copied: () => void;
      updated: () => void;
    };
    error: {
      networkError: () => void;
      saveError: () => void;
      loadError: () => void;
      validationError: (field: string) => void;
    };
    warning: {
      unsavedChanges: () => void;
      limitReached: (limit: string) => void;
      expiringSoon: () => void;
    };
    info: {
      loading: () => void;
      noData: () => void;
      refreshed: () => void;
    };
  };
}

// ===== 상수 정의 =====

/** 기본 Toast 표시 시간 (ms) */
const DEFAULT_DURATION = {
  success: 4000,
  error: 5000,
  warning: 4000,
  info: 3000,
} as const;

/** 기본 Toast 위치 */
const DEFAULT_POSITION = 'top' as const;

/** 기본 상단 오프셋 */
const DEFAULT_TOP_OFFSET = 60;

// ===== 메인 훅 =====

/**
 * Toast 알림 시스템을 관리하는 훅
 * 
 * 기존 useNotification 기능과 react-native-toast-message를 통합하여
 * 일관된 Toast API를 제공합니다.
 * 
 * @returns Toast 관련 함수들과 preset 메시지들
 */
export const useToast = (): UseToastReturn => {
  
  // ===== 기본 Toast 함수들 =====
  
  /**
   * 지정된 타입의 Toast를 표시합니다.
   */
  const showToast = useCallback((type: ToastType, options: SimpleToastOptions) => {
    const {
      title,
      message,
      duration = DEFAULT_DURATION[type],
      position = DEFAULT_POSITION,
      topOffset = DEFAULT_TOP_OFFSET,
    } = options;

    Toast.show({
      type,
      text1: title,
      text2: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      topOffset,
    });
  }, []);

  /**
   * 성공 Toast를 표시합니다.
   */
  const showSuccess = useCallback((title: string, message?: string) => {
    showToast('success', { title, message });
  }, [showToast]);

  /**
   * 오류 Toast를 표시합니다.
   */
  const showError = useCallback((title: string, message?: string) => {
    showToast('error', { title, message });
  }, [showToast]);

  /**
   * 경고 Toast를 표시합니다.
   */
  const showWarning = useCallback((title: string, message?: string) => {
    showToast('warning', { title, message });
  }, [showToast]);

  /**
   * 정보 Toast를 표시합니다.
   */
  const showInfo = useCallback((title: string, message?: string) => {
    showToast('info', { title, message });
  }, [showToast]);

  // ===== Dialog형 Toast (Alert 대체) =====
  
  /**
   * Dialog형 Toast를 표시합니다. (Alert.alert 대체)
   * 
   * 확인/취소 버튼이 있는 대화상자 형태의 Toast를 제공합니다.
   * 실제로는 연속된 Toast로 구현되어 네이티브스러운 UX를 제공합니다.
   */
  const showDialog = useCallback((options: DialogToastOptions) => {
    const {
      title,
      message,
      confirmText = '확인',
      cancelText = '취소',
      onConfirm,
      onCancel,
      type = 'info',
    } = options;

    // Dialog형 Toast 표시
    Toast.show({
      type: 'dialog' as any, // Dialog 타입 사용
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 8000, // 충분한 시간 제공
      autoHide: false, // 수동으로 숨김
      topOffset: DEFAULT_TOP_OFFSET,
      props: {
        showButtons: true,
        confirmText,
        cancelText,
        onConfirm: () => {
          Toast.hide();
          onConfirm?.();
        },
        onCancel: () => {
          Toast.hide();
          onCancel?.();
        },
      },
    });
  }, []);

  /**
   * 모든 Toast를 숨깁니다.
   */
  const hideToast = useCallback(() => {
    Toast.hide();
  }, []);

  // ===== 사전 정의된 메시지들 =====
  
  const presets = {
    success: {
      saved: useCallback(() => showSuccess('저장 완료', '변경사항이 성공적으로 저장되었습니다.'), [showSuccess]),
      deleted: useCallback(() => showSuccess('삭제 완료', '선택한 항목이 삭제되었습니다.'), [showSuccess]),
      copied: useCallback(() => showSuccess('복사 완료', '클립보드에 복사되었습니다.'), [showSuccess]),
      updated: useCallback(() => showSuccess('업데이트 완료', '정보가 성공적으로 업데이트되었습니다.'), [showSuccess]),
    },
    
    error: {
      networkError: useCallback(() => showError('네트워크 오류', '인터넷 연결을 확인해 주세요.'), [showError]),
      saveError: useCallback(() => showError('저장 실패', '저장 중 오류가 발생했습니다.'), [showError]),
      loadError: useCallback(() => showError('로딩 실패', '데이터를 불러올 수 없습니다.'), [showError]),
      validationError: useCallback((field: string) => showError('입력 오류', `${field}을(를) 올바르게 입력해 주세요.`), [showError]),
    },
    
    warning: {
      unsavedChanges: useCallback(() => showWarning('저장되지 않은 변경사항', '변경사항을 저장하지 않고 나가시겠습니까?'), [showWarning]),
      limitReached: useCallback((limit: string) => showWarning('제한 도달', `${limit} 제한에 도달했습니다.`), [showWarning]),
      expiringSoon: useCallback(() => showWarning('만료 예정', '세션이 곧 만료됩니다.'), [showWarning]),
    },
    
    info: {
      loading: useCallback(() => showInfo('로딩 중...', '잠시만 기다려 주세요.'), [showInfo]),
      noData: useCallback(() => showInfo('데이터 없음', '표시할 데이터가 없습니다.'), [showInfo]),
      refreshed: useCallback(() => showInfo('새로고침 완료', '최신 데이터를 불러왔습니다.'), [showInfo]),
    },
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showDialog,
    hideToast,
    presets,
  };
};

// ===== 유틸리티 함수들 =====

/**
 * Alert.alert을 Toast로 대체하는 유틸리티 함수
 * 
 * 기존 Alert.alert 호출을 최소한의 코드 변경으로 Toast로 전환할 수 있습니다.
 * 
 * @param title - 제목
 * @param message - 메시지 (선택사항)
 * @param buttons - 버튼 배열 (선택사항)
 * @param options - 추가 옵션 (선택사항)
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>,
  options?: { cancelable?: boolean }
) => {
  // 버튼이 없거나 1개인 경우 - 단순 알림
  if (!buttons || buttons.length <= 1) {
    const type = buttons?.[0]?.style === 'destructive' ? 'error' : 'info';
    Toast.show({
      type,
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: DEFAULT_TOP_OFFSET,
      onPress: buttons?.[0]?.onPress,
    });
    return;
  }

  // 2개 이상의 버튼 - Dialog형 Toast
  const confirmButton = buttons.find(btn => btn.style !== 'cancel') || buttons[0];
  const cancelButton = buttons.find(btn => btn.style === 'cancel') || buttons[1];

  Toast.show({
    type: confirmButton.style === 'destructive' ? 'warning' : 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 8000,
    autoHide: false,
    topOffset: DEFAULT_TOP_OFFSET,
    props: {
      showButtons: true,
      confirmText: confirmButton.text,
      cancelText: cancelButton?.text || '취소',
      onConfirm: () => {
        Toast.hide();
        confirmButton.onPress?.();
      },
      onCancel: () => {
        Toast.hide();
        cancelButton?.onPress?.();
      },
    },
  });
};

export default useToast; 