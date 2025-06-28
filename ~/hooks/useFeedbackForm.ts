/**
 * @fileoverview 피드백 폼 관리 훅
 * 
 * 피드백 폼의 상태 관리, 유효성 검사, 제출 처리를 담당합니다.
 * 사용자가 피드백을 입력하고 전송할 수 있는 완전한 폼 기능을 제공합니다.
 * 
 * @features
 * - 피드백 타입 선택 (버그 신고, 기능 요청, 개선 제안, 기타)
 * - 제목 및 내용 입력 필드 관리
 * - 실시간 유효성 검사
 * - 폼 제출 및 리셋 기능
 * - 로딩 및 에러 상태 관리
 * 
 * @author Sauron Mobile Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useCallback, useMemo } from 'react';

// ===== 타입 정의 =====

/**
 * 피드백 타입 열거형
 */
export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

/**
 * 피드백 폼 데이터 인터페이스
 */
export interface FeedbackFormData {
  /** 피드백 타입 */
  type: FeedbackType | null;
  /** 피드백 제목 */
  title: string;
  /** 피드백 내용 */
  content: string;
}

/**
 * 피드백 폼 필드별 에러 메시지
 */
export interface FeedbackFormErrors {
  /** 타입 선택 에러 */
  type?: string;
  /** 제목 입력 에러 */
  title?: string;
  /** 내용 입력 에러 */
  content?: string;
}

/**
 * 피드백 폼 상태 인터페이스
 */
export interface FeedbackFormState {
  /** 폼 데이터 */
  data: FeedbackFormData;
  /** 필드별 에러 메시지 */
  errors: FeedbackFormErrors;
  /** 제출 중 여부 */
  isSubmitting: boolean;
  /** 제출 성공 여부 */
  isSuccess: boolean;
  /** 전역 에러 메시지 */
  error: string | null;
}

/**
 * useFeedbackForm 훅 반환 타입
 */
export interface UseFeedbackFormReturn {
  /** 폼 상태 */
  state: FeedbackFormState;
  /** 피드백 타입 업데이트 */
  updateType: (type: FeedbackType) => void;
  /** 제목 업데이트 */
  updateTitle: (title: string) => void;
  /** 내용 업데이트 */
  updateContent: (content: string) => void;
  /** 폼 제출 */
  submitForm: () => Promise<void>;
  /** 폼 리셋 */
  resetForm: () => void;
  /** 에러 클리어 */
  clearError: () => void;
  /** 폼 유효성 검사 통과 여부 */
  isValid: boolean;
}

// ===== 상수 정의 =====

/** 제목 길이 제한 */
const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 100;

/** 내용 길이 제한 */
const CONTENT_MIN_LENGTH = 10;
const CONTENT_MAX_LENGTH = 1000;

/** 초기 폼 데이터 */
const INITIAL_FORM_DATA: FeedbackFormData = {
  type: null,
  title: '',
  content: '',
};

/** 초기 폼 상태 */
const INITIAL_FORM_STATE: FeedbackFormState = {
  data: INITIAL_FORM_DATA,
  errors: {},
  isSubmitting: false,
  isSuccess: false,
  error: null,
};

// ===== 유틸리티 함수들 =====

/**
 * 피드백 타입 유효성 검사
 */
const validateType = (type: FeedbackType | null): string | undefined => {
  if (!type) {
    return '피드백 유형을 선택해주세요.';
  }
  return undefined;
};

/**
 * 제목 유효성 검사
 */
const validateTitle = (title: string): string | undefined => {
  if (!title.trim()) {
    return '제목을 입력해주세요.';
  }
  if (title.trim().length < TITLE_MIN_LENGTH) {
    return `제목은 최소 ${TITLE_MIN_LENGTH}자 이상 입력해주세요.`;
  }
  if (title.length > TITLE_MAX_LENGTH) {
    return `제목은 최대 ${TITLE_MAX_LENGTH}자까지 입력 가능합니다.`;
  }
  return undefined;
};

/**
 * 내용 유효성 검사
 */
const validateContent = (content: string): string | undefined => {
  if (!content.trim()) {
    return '내용을 입력해주세요.';
  }
  if (content.trim().length < CONTENT_MIN_LENGTH) {
    return `내용은 최소 ${CONTENT_MIN_LENGTH}자 이상 입력해주세요.`;
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    return `내용은 최대 ${CONTENT_MAX_LENGTH}자까지 입력 가능합니다.`;
  }
  return undefined;
};

/**
 * 전체 폼 유효성 검사
 */
const validateForm = (data: FeedbackFormData): FeedbackFormErrors => {
  const errors: FeedbackFormErrors = {};
  
  const typeError = validateType(data.type);
  if (typeError) errors.type = typeError;
  
  const titleError = validateTitle(data.title);
  if (titleError) errors.title = titleError;
  
  const contentError = validateContent(data.content);
  if (contentError) errors.content = contentError;
  
  return errors;
};

/**
 * 피드백 제출 시뮬레이션 (실제로는 API 호출)
 */
const submitFeedback = async (data: FeedbackFormData): Promise<void> => {
  // 실제 구현에서는 API 호출을 여기에 작성
  // 현재는 UI 이식 목적이므로 시뮬레이션만 구현
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 랜덤하게 성공/실패 시뮬레이션 (90% 성공률)
      if (Math.random() > 0.1) {
        console.log('피드백 제출 성공:', data);
        resolve();
      } else {
        reject(new Error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
      }
    }, 1500); // 1.5초 지연으로 제출 시뮬레이션
  });
};

// ===== 메인 훅 =====

/**
 * 피드백 폼을 관리하는 훅
 * 
 * 피드백 타입 선택, 제목/내용 입력, 유효성 검사, 제출 처리 등
 * 피드백 폼에 필요한 모든 기능을 제공합니다.
 * 
 * @returns 피드백 폼 상태와 관련 함수들
 */
export const useFeedbackForm = (): UseFeedbackFormReturn => {
  // ===== 상태 관리 =====
  
  const [state, setState] = useState<FeedbackFormState>(INITIAL_FORM_STATE);
  
  // ===== 폼 데이터 업데이트 함수들 =====
  
  /**
   * 피드백 타입을 업데이트합니다.
   */
  const updateType = useCallback((type: FeedbackType) => {
    setState(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        type,
      },
      errors: {
        ...prevState.errors,
        type: undefined, // 타입 선택 시 에러 클리어
      },
    }));
  }, []);
  
  /**
   * 제목을 업데이트합니다.
   */
  const updateTitle = useCallback((title: string) => {
    setState(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        title,
      },
      errors: {
        ...prevState.errors,
        title: undefined, // 입력 시 에러 클리어
      },
    }));
  }, []);
  
  /**
   * 내용을 업데이트합니다.
   */
  const updateContent = useCallback((content: string) => {
    setState(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        content,
      },
      errors: {
        ...prevState.errors,
        content: undefined, // 입력 시 에러 클리어
      },
    }));
  }, []);
  
  // ===== 폼 액션 함수들 =====
  
  /**
   * 폼을 제출합니다.
   */
  const submitForm = useCallback(async () => {
    // 제출 중 상태로 설정
    setState(prevState => ({
      ...prevState,
      isSubmitting: true,
      error: null,
      isSuccess: false,
    }));
    
    try {
      // 유효성 검사
      const validationErrors = validateForm(state.data);
      
      if (Object.keys(validationErrors).length > 0) {
        setState(prevState => ({
          ...prevState,
          errors: validationErrors,
          isSubmitting: false,
        }));
        return;
      }
      
      // 피드백 제출
      await submitFeedback(state.data);
      
      // 제출 성공
      setState(prevState => ({
        ...prevState,
        isSubmitting: false,
        isSuccess: true,
        errors: {},
      }));
      
    } catch (error) {
      // 제출 실패
      const errorMessage = error instanceof Error 
        ? error.message 
        : '알 수 없는 오류가 발생했습니다.';
      
      setState(prevState => ({
        ...prevState,
        isSubmitting: false,
        isSuccess: false,
        error: errorMessage,
      }));
    }
  }, [state.data]);
  
  /**
   * 폼을 초기 상태로 리셋합니다.
   */
  const resetForm = useCallback(() => {
    setState(INITIAL_FORM_STATE);
  }, []);
  
  /**
   * 전역 에러를 클리어합니다.
   */
  const clearError = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      error: null,
    }));
  }, []);
  
  // ===== 계산된 값들 =====
  
  /**
   * 폼이 유효한지 확인합니다.
   */
  const isValid = useMemo(() => {
    const errors = validateForm(state.data);
    return Object.keys(errors).length === 0;
  }, [state.data]);
  
  // ===== 반환 =====
  
  return {
    state,
    updateType,
    updateTitle,
    updateContent,
    submitForm,
    resetForm,
    clearError,
    isValid,
  };
};

// ===== 기본 내보내기 =====
export default useFeedbackForm; 