/**
 * useDetectedMessageModal - 감지 메시지 상세 모달 상태 관리 커스텀 훅
 * 
 * 감지 메시지 상세 모달의 열기/닫기 상태와 선택된 메시지를 관리하며,
 * 에러 상황에 대한 graceful handling을 제공합니다.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { DetectedMessage } from '~/types/detection-log';
import { showToast } from '~/components/composed/toast';
import { InteractionHaptics } from '@/~/lib/haptics';

// ===== 인터페이스 정의 =====
export interface UseDetectedMessageModalOptions {
  onModalOpen?: (message: DetectedMessage) => void;
  onModalClose?: () => void;
  onError?: (error: Error) => void;
  enableDebugLog?: boolean;
}

export interface UseDetectedMessageModalReturn {
  // 상태
  isVisible: boolean;
  selectedMessage: DetectedMessage | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  openModal: (message: DetectedMessage) => void;
  closeModal: () => void;
  clearError: () => void;
  
  // 모달 액션 헬퍼
  handleMessagePress: (message: DetectedMessage) => void;
  handleModalClose: () => void;
  handleAcknowledge: (id: number) => void;
  handleIgnore: (id: number) => void;
}

// ===== 에러 타입 정의 =====
class ModalError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ModalError';
  }
}

// ===== 유틸리티 함수들 =====
const validateMessage = (message: DetectedMessage): boolean => {
  if (!message || typeof message !== 'object') {
    return false;
  }
  
  const requiredFields = ['id', 'type', 'content', 'timestamp', 'author', 'chatroom'];
  return requiredFields.every(field => 
    message.hasOwnProperty(field) && message[field as keyof DetectedMessage] != null
  );
};

const logDebug = (enabled: boolean, message: string, data?: any) => {
  if (enabled && __DEV__) {
    console.log(`[useDetectedMessageModal] ${message}`, data || '');
  }
};

// ===== 메인 Hook =====
export const useDetectedMessageModal = (
  options: UseDetectedMessageModalOptions = {}
): UseDetectedMessageModalReturn => {
  const {
    onModalOpen,
    onModalClose,
    onError,
    enableDebugLog = false,
  } = options;

  // ===== 상태 정의 =====
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<DetectedMessage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 중복 열기 방지를 위한 ref (간소화)
  const lastOpenTimeRef = useRef<number>(0);

  // ===== 에러 처리 함수 =====
  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
    
    logDebug(enableDebugLog, 'Error occurred', { error: fullMessage, context });
    
    setError(fullMessage);
    setIsLoading(false);
    
    // 햅틱 피드백 추가
    InteractionHaptics.formError();
    
    // 사용자에게 토스트로 에러 알림
    showToast.error('오류 발생', fullMessage);
    
    // 옵션 콜백 호출
    if (onError) {
      const errorObj = error instanceof Error ? error : new ModalError(errorMessage, 'GENERAL_ERROR');
      onError(errorObj);
    }
  }, [enableDebugLog, onError]);

  // ===== 모달 열기 =====
  const openModal = useCallback((message: DetectedMessage) => {
    const now = Date.now();
    
    // 중복 호출 방지 (300ms 내 중복 호출 차단)
    if (now - lastOpenTimeRef.current < 300) {
      logDebug(enableDebugLog, 'Modal open request ignored due to throttling');
      return;
    }

    try {
      lastOpenTimeRef.current = now;
      setError(null);
      setIsLoading(true);

      // 메시지 유효성 검증
      if (!validateMessage(message)) {
        throw new ModalError('유효하지 않은 메시지 데이터입니다.', 'INVALID_MESSAGE');
      }

      logDebug(enableDebugLog, 'Opening modal for message', { id: message.id, type: message.type });

      // 햅틱 피드백 추가
      InteractionHaptics.buttonPress();

      // AI 분석 결과 보강 (기존 로직 유지)
      const enhancedMessage: DetectedMessage = {
        ...message,
        aiReason: message.reason || `이 메시지는 ${message.type} 유형으로 분류되었습니다.`,
        confidence: message.confidence,
      };

      setSelectedMessage(enhancedMessage);
      setIsVisible(true);
      setIsLoading(false);
      
      // 콜백 호출
      onModalOpen?.(enhancedMessage);
      
    } catch (error) {
      handleError(error as Error, '모달 열기');
    }
  }, [enableDebugLog, onModalOpen, handleError]);

  // ===== 모달 닫기 =====
  const closeModal = useCallback(() => {
    try {
      logDebug(enableDebugLog, 'Closing modal');

      // 햅틱 피드백 추가
      InteractionHaptics.cancel();

      setIsVisible(false);
      // 약간의 지연 후 메시지 클리어 (애니메이션을 위해)
      setTimeout(() => {
        setSelectedMessage(null);
        setError(null);
        setIsLoading(false);
      }, 150);
      
      // 콜백 호출
      onModalClose?.();
      
    } catch (error) {
      handleError(error as Error, '모달 닫기');
    }
  }, [enableDebugLog, onModalClose, handleError]);

  // ===== 에러 클리어 =====
  const clearError = useCallback(() => {
    setError(null);
    logDebug(enableDebugLog, 'Error cleared');
  }, [enableDebugLog]);

  // ===== 편의 메서드들 =====
  const handleMessagePress = useCallback((message: DetectedMessage) => {
    openModal(message);
  }, [openModal]);

  const handleModalClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleAcknowledge = useCallback((id: number) => {
    try {
      logDebug(enableDebugLog, 'Message acknowledged', { id });
      
      // 햅틱 피드백 추가
      InteractionHaptics.loadSuccess();
      
      if (selectedMessage && selectedMessage.id === id) {
        closeModal();
      }
      
      // 성공 토스트는 useDetectedLog에서 처리하므로 여기서는 생략
    } catch (error) {
      handleError(error as Error, '메시지 확인 처리');
    }
  }, [selectedMessage, closeModal, enableDebugLog, handleError]);

  const handleIgnore = useCallback((id: number) => {
    try {
      logDebug(enableDebugLog, 'Message ignored', { id });
      
      // 햅틱 피드백 추가
      InteractionHaptics.buttonPressDestructive();
      
      if (selectedMessage && selectedMessage.id === id) {
        closeModal();
      }
      
      // 성공 토스트는 useDetectedLog에서 처리하므로 여기서는 생략
    } catch (error) {
      handleError(error as Error, '메시지 무시 처리');
    }
  }, [selectedMessage, closeModal, enableDebugLog, handleError]);

  // ===== 정리 작업 =====
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 상태 정리
      lastOpenTimeRef.current = 0;
      logDebug(enableDebugLog, 'Hook cleanup completed');
    };
  }, [enableDebugLog]);

  // ===== 반환값 =====
  return {
    // 상태
    isVisible,
    selectedMessage,
    isLoading,
    error,
    
    // 액션
    openModal,
    closeModal,
    clearError,
    
    // 편의 메서드
    handleMessagePress,
    handleModalClose,
    handleAcknowledge,
    handleIgnore,
  };
};

// ===== 기본 내보내기 =====
export default useDetectedMessageModal; 