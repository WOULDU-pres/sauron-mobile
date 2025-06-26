/**
 * 피드백 폼 상태 관리 훅
 * 피드백 타입, 제목, 내용 입력 및 제출 상태 관리
 */

import { useState, useCallback } from 'react';

export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

export interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  content: string;
}

export interface FeedbackFormState {
  // 폼 데이터
  data: FeedbackFormData;
  
  // 상태
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  
  // 유효성 검사
  errors: {
    title?: string;
    content?: string;
  };
}

export interface UseFeedbackFormReturn {
  state: FeedbackFormState;
  
  // 데이터 업데이트
  updateType: (type: FeedbackType) => void;
  updateTitle: (title: string) => void;
  updateContent: (content: string) => void;
  
  // 폼 제어
  submitForm: () => Promise<void>;
  resetForm: () => void;
  clearError: () => void;
  
  // 유효성 검사
  isValid: boolean;
}

const initialData: FeedbackFormData = {
  type: 'bug',
  title: '',
  content: '',
};

const initialState: FeedbackFormState = {
  data: initialData,
  isSubmitting: false,
  isSuccess: false,
  error: null,
  errors: {},
};

export const useFeedbackForm = (): UseFeedbackFormReturn => {
  const [state, setState] = useState<FeedbackFormState>(initialState);

  // 타입 업데이트
  const updateType = useCallback((type: FeedbackType) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, type },
      error: null,
    }));
  }, []);

  // 제목 업데이트
  const updateTitle = useCallback((title: string) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, title },
      errors: { ...prev.errors, title: undefined },
      error: null,
    }));
  }, []);

  // 내용 업데이트
  const updateContent = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, content },
      errors: { ...prev.errors, content: undefined },
      error: null,
    }));
  }, []);

  // 유효성 검사
  const validateForm = useCallback((data: FeedbackFormData) => {
    const errors: { title?: string; content?: string } = {};

    if (!data.title.trim()) {
      errors.title = '제목을 입력해주세요.';
    } else if (data.title.trim().length < 5) {
      errors.title = '제목을 5자 이상 입력해주세요.';
    } else if (data.title.trim().length > 100) {
      errors.title = '제목은 100자 이하로 입력해주세요.';
    }

    if (!data.content.trim()) {
      errors.content = '내용을 입력해주세요.';
    } else if (data.content.trim().length < 10) {
      errors.content = '내용을 10자 이상 입력해주세요.';
    } else if (data.content.trim().length > 1000) {
      errors.content = '내용은 1000자 이하로 입력해주세요.';
    }

    return errors;
  }, []);

  // 폼 제출
  const submitForm = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null,
      errors: {},
    }));

    try {
      // 유효성 검사
      const errors = validateForm(state.data);
      if (Object.keys(errors).length > 0) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          errors,
        }));
        return;
      }

      // 모의 API 호출 (1-2초 지연)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // 10% 확률로 실패 시뮬레이션
      if (Math.random() < 0.1) {
        throw new Error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        isSuccess: true,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      }));
    }
  }, [state.data, validateForm]);

  // 폼 리셋
  const resetForm = useCallback(() => {
    setState(initialState);
  }, []);

  // 에러 클리어
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // 유효성 검사 결과
  const isValid = state.data.title.trim().length >= 5 && 
                  state.data.content.trim().length >= 10;

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