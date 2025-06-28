/**
 * useWatchedChatRooms - 감시 중인 채팅방 관리 커스텀 훅
 * 채팅방 활성/비활성 상태 관리, 제거, 저장/취소, 예외 처리 제공
 */

import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import type { DashboardChatroom } from './useDetectedMessageLog';
import type { ChatroomStatus } from '~/components/features/dashboard/watched-chatrooms-modal';

// ===== 타입 정의 =====
export interface WatchedChatroomState extends DashboardChatroom {
  /**
   * 채팅방 고유 ID
   */
  id: string;
  
  /**
   * 현재 활성화 상태
   */
  isActive: boolean;
  
  /**
   * 제거 대상 여부
   */
  isMarkedForRemoval: boolean;
  
  /**
   * 마지막 업데이트 시간
   */
  lastUpdated: Date;
}

export interface UseWatchedChatRoomsOptions {
  /**
   * 초기 채팅방 목록
   */
  initialChatrooms?: DashboardChatroom[];
  
  /**
   * 변경사항 자동 저장 여부
   */
  autoSave?: boolean;
  
  /**
   * 에러 처리 콜백
   */
  onError?: (error: Error, context: string) => void;
  
  /**
   * 성공 처리 콜백
   */
  onSuccess?: (message: string, action: string) => void;
}

export interface UseWatchedChatRoomsReturn {
  /**
   * 현재 채팅방 목록
   */
  chatrooms: WatchedChatroomState[];
  
  /**
   * 로딩 상태
   */
  isLoading: boolean;
  
  /**
   * 에러 상태
   */
  error: string | null;
  
  /**
   * 변경된 항목이 있는지 여부
   */
  hasChanges: boolean;
  
  /**
   * 채팅방 활성/비활성 토글
   */
  toggleChatroomStatus: (chatroomId: string) => Promise<boolean>;
  
  /**
   * 채팅방 제거 표시/해제
   */
  markForRemoval: (chatroomId: string, mark: boolean) => Promise<boolean>;
  
  /**
   * 채팅방 상태 업데이트
   */
  updateChatroomStatus: (chatroomId: string, status: Partial<ChatroomStatus>) => Promise<boolean>;
  
  /**
   * 변경사항 저장
   */
  saveChanges: () => Promise<boolean>;
  
  /**
   * 변경사항 취소 (원복)
   */
  cancelChanges: () => void;
  
  /**
   * 채팅방 완전 제거
   */
  removeChatroom: (chatroomId: string) => Promise<boolean>;
  
  /**
   * 새 채팅방 추가
   */
  addChatroom: (chatroom: DashboardChatroom) => Promise<boolean>;
  
  /**
   * 특정 채팅방 조회
   */
  getChatroom: (chatroomId: string) => WatchedChatroomState | undefined;
  
  /**
   * 전체 상태 초기화
   */
  reset: () => void;
  
  /**
   * 에러 상태 클리어
   */
  clearError: () => void;
}

// ===== 유틸리티 함수들 =====
/**
 * DashboardChatroom을 WatchedChatroomState로 변환
 */
const convertToWatchedState = (chatroom: DashboardChatroom): WatchedChatroomState => ({
  ...chatroom,
  id: `chatroom-${chatroom.name.replace(/\s+/g, '-').toLowerCase()}`,
  isActive: chatroom.status === '활성',
  isMarkedForRemoval: false,
  lastUpdated: new Date(),
});

/**
 * 에러 메시지 생성
 */
const createErrorMessage = (action: string, error: unknown): string => {
  const baseMessage = `${action} 중 오류가 발생했습니다.`;
  if (error instanceof Error) {
    return `${baseMessage} (${error.message})`;
  }
  return `${baseMessage} 잠시 후 다시 시도해주세요.`;
};

/**
 * 안전한 비동기 작업 실행
 */
const safeAsyncOperation = async <T>(
  operation: () => Promise<T>,
  errorContext: string,
  onError?: (error: Error, context: string) => void
): Promise<{ success: boolean; data?: T; error?: Error }> => {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('알 수 없는 오류');
    onError?.(err, errorContext);
    return { success: false, error: err };
  }
};

// ===== 메인 훅 =====
export const useWatchedChatRooms = (
  options: UseWatchedChatRoomsOptions = {}
): UseWatchedChatRoomsReturn => {
  const {
    initialChatrooms = [],
    autoSave = false,
    onError,
    onSuccess,
  } = options;

  // ===== 상태 관리 =====
  const [chatrooms, setChatrooms] = useState<WatchedChatroomState[]>(() =>
    initialChatrooms.map(convertToWatchedState)
  );
  const [originalChatrooms, setOriginalChatrooms] = useState<WatchedChatroomState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== 계산된 값들 =====
  const hasChanges = JSON.stringify(chatrooms) !== JSON.stringify(originalChatrooms);

  // ===== 초기화 효과 =====
  useEffect(() => {
    const initialState = initialChatrooms.map(convertToWatchedState);
    setChatrooms(initialState);
    setOriginalChatrooms(initialState);
  }, [initialChatrooms]);

  // ===== 에러 처리 함수 =====
  const handleError = useCallback((error: Error, context: string) => {
    const errorMessage = createErrorMessage(context, error);
    setError(errorMessage);
    onError?.(error, context);
    
    // 사용자에게 에러 알림
    Alert.alert('오류', errorMessage, [{ text: '확인' }]);
  }, [onError]);

  // ===== 성공 처리 함수 =====
  const handleSuccess = useCallback((message: string, action: string) => {
    setError(null);
    onSuccess?.(message, action);
  }, [onSuccess]);

  // ===== 채팅방 찾기 =====
  const findChatroom = useCallback((chatroomId: string): WatchedChatroomState | undefined => {
    return chatrooms.find(room => room.id === chatroomId);
  }, [chatrooms]);

  // ===== 채팅방 상태 업데이트 =====
  const updateChatroomInState = useCallback((
    chatroomId: string,
    updater: (room: WatchedChatroomState) => WatchedChatroomState
  ): boolean => {
    const roomIndex = chatrooms.findIndex(room => room.id === chatroomId);
    if (roomIndex === -1) {
      return false;
    }

    setChatrooms(prev => {
      const newChatrooms = [...prev];
      newChatrooms[roomIndex] = updater(newChatrooms[roomIndex]);
      return newChatrooms;
    });
    return true;
  }, [chatrooms]);

  // ===== API 함수들 =====
  
  /**
   * 채팅방 활성/비활성 토글
   */
  const toggleChatroomStatus = useCallback(async (chatroomId: string): Promise<boolean> => {
    const result = await safeAsyncOperation(
      async () => {
        const chatroom = findChatroom(chatroomId);
        if (!chatroom) {
          throw new Error('채팅방을 찾을 수 없습니다.');
        }

        const success = updateChatroomInState(chatroomId, (room) => ({
          ...room,
          isActive: !room.isActive,
          status: room.isActive ? '비활성' : '활성',
          lastUpdated: new Date(),
        }));

        if (!success) {
          throw new Error('상태 업데이트에 실패했습니다.');
        }

        const newStatus = !chatroom.isActive ? '활성화' : '비활성화';
        handleSuccess(`${chatroom.name} 채팅방이 ${newStatus}되었습니다.`, 'toggle');
        
        return true;
      },
      '채팅방 상태 변경',
      handleError
    );

    return result.success;
  }, [findChatroom, updateChatroomInState, handleSuccess, handleError]);

  /**
   * 채팅방 제거 표시/해제
   */
  const markForRemoval = useCallback(async (chatroomId: string, mark: boolean): Promise<boolean> => {
    const result = await safeAsyncOperation(
      async () => {
        const chatroom = findChatroom(chatroomId);
        if (!chatroom) {
          throw new Error('채팅방을 찾을 수 없습니다.');
        }

        const success = updateChatroomInState(chatroomId, (room) => ({
          ...room,
          isMarkedForRemoval: mark,
          lastUpdated: new Date(),
        }));

        if (!success) {
          throw new Error('제거 표시 업데이트에 실패했습니다.');
        }

        const action = mark ? '제거 대상으로 표시' : '제거 표시 해제';
        handleSuccess(`${chatroom.name} 채팅방이 ${action}되었습니다.`, 'mark');
        
        return true;
      },
      '채팅방 제거 표시',
      handleError
    );

    return result.success;
  }, [findChatroom, updateChatroomInState, handleSuccess, handleError]);

  /**
   * 채팅방 상태 업데이트
   */
  const updateChatroomStatus = useCallback(async (
    chatroomId: string, 
    status: Partial<ChatroomStatus>
  ): Promise<boolean> => {
    const result = await safeAsyncOperation(
      async () => {
        const chatroom = findChatroom(chatroomId);
        if (!chatroom) {
          throw new Error('채팅방을 찾을 수 없습니다.');
        }

        const success = updateChatroomInState(chatroomId, (room) => ({
          ...room,
          isActive: status.isActive ?? room.isActive,
          status: (status.isActive ?? room.isActive) ? '활성' : '비활성',
          isMarkedForRemoval: status.isMarkedForRemoval ?? room.isMarkedForRemoval,
          lastUpdated: new Date(),
        }));

        if (!success) {
          throw new Error('상태 업데이트에 실패했습니다.');
        }

        handleSuccess(`${chatroom.name} 채팅방 설정이 업데이트되었습니다.`, 'update');
        
        return true;
      },
      '채팅방 상태 업데이트',
      handleError
    );

    return result.success;
  }, [findChatroom, updateChatroomInState, handleSuccess, handleError]);

  /**
   * 변경사항 저장
   */
  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (!hasChanges) {
      handleSuccess('저장할 변경사항이 없습니다.', 'save');
      return true;
    }

    setIsLoading(true);
    const result = await safeAsyncOperation(
      async () => {
        // 실제 저장 로직 (향후 API 연동 시 구현)
        await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
        
        // 제거 대상 채팅방들 필터링
        const activeChatrooms = chatrooms.filter(room => !room.isMarkedForRemoval);
        setChatrooms(activeChatrooms);
        setOriginalChatrooms(activeChatrooms);
        
        handleSuccess('변경사항이 저장되었습니다.', 'save');
        return true;
      },
      '변경사항 저장',
      handleError
    );

    setIsLoading(false);
    return result.success;
  }, [hasChanges, chatrooms, handleSuccess, handleError]);

  /**
   * 변경사항 취소
   */
  const cancelChanges = useCallback(() => {
    setChatrooms([...originalChatrooms]);
    setError(null);
    handleSuccess('변경사항이 취소되었습니다.', 'cancel');
  }, [originalChatrooms, handleSuccess]);

  /**
   * 채팅방 완전 제거
   */
  const removeChatroom = useCallback(async (chatroomId: string): Promise<boolean> => {
    const result = await safeAsyncOperation(
      async () => {
        const chatroom = findChatroom(chatroomId);
        if (!chatroom) {
          throw new Error('채팅방을 찾을 수 없습니다.');
        }

        setChatrooms(prev => prev.filter(room => room.id !== chatroomId));
        setOriginalChatrooms(prev => prev.filter(room => room.id !== chatroomId));
        
        handleSuccess(`${chatroom.name} 채팅방이 제거되었습니다.`, 'remove');
        return true;
      },
      '채팅방 제거',
      handleError
    );

    return result.success;
  }, [findChatroom, handleSuccess, handleError]);

  /**
   * 새 채팅방 추가
   */
  const addChatroom = useCallback(async (chatroom: DashboardChatroom): Promise<boolean> => {
    const result = await safeAsyncOperation(
      async () => {
        const newChatroom = convertToWatchedState(chatroom);
        
        // 중복 체크
        const exists = chatrooms.some(room => room.name === chatroom.name);
        if (exists) {
          throw new Error('이미 존재하는 채팅방입니다.');
        }

        setChatrooms(prev => [...prev, newChatroom]);
        setOriginalChatrooms(prev => [...prev, newChatroom]);
        
        handleSuccess(`${chatroom.name} 채팅방이 추가되었습니다.`, 'add');
        return true;
      },
      '채팅방 추가',
      handleError
    );

    return result.success;
  }, [chatrooms, handleSuccess, handleError]);

  /**
   * 특정 채팅방 조회
   */
  const getChatroom = useCallback((chatroomId: string): WatchedChatroomState | undefined => {
    return findChatroom(chatroomId);
  }, [findChatroom]);

  /**
   * 전체 상태 초기화
   */
  const reset = useCallback(() => {
    const initialState = initialChatrooms.map(convertToWatchedState);
    setChatrooms(initialState);
    setOriginalChatrooms(initialState);
    setError(null);
    setIsLoading(false);
    handleSuccess('상태가 초기화되었습니다.', 'reset');
  }, [initialChatrooms, handleSuccess]);

  /**
   * 에러 상태 클리어
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ===== 반환값 =====
  return {
    chatrooms,
    isLoading,
    error,
    hasChanges,
    toggleChatroomStatus,
    markForRemoval,
    updateChatroomStatus,
    saveChanges,
    cancelChanges,
    removeChatroom,
    addChatroom,
    getChatroom,
    reset,
    clearError,
  };
}; 