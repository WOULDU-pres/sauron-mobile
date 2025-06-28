/**
 * useDetectedLog - 감지로그 상태 관리 및 비즈니스 로직 커스텀 훅
 * 
 * 감지로그 화면의 모든 상태와 비즈니스 로직을 캡슐화하여
 * UI 컴포넌트와 로직을 완전히 분리합니다.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  DetectedMessage, 
  AnnouncementRequest, 
  DetectionLogFilters,
  DetectionLogState,
  MessageType 
} from '~/types/detection-log';
import { showToast, presetToasts } from '~/components/composed/toast';

// ===== 모의 데이터 =====
const MOCK_MESSAGES: DetectedMessage[] = [
  {
    id: 1,
    type: '광고',
    content: '특가 할인! 지금 주문하면 50% 할인해드립니다!',
    timestamp: '2024-01-15 14:30',
    author: '사용자123',
    chatroom: '일반채팅방',
    confidence: 92.5,
    reason: '광고성 키워드와 할인 문구가 포함되어 있습니다.',
  },
  {
    id: 2,
    type: '도배',
    content: '안녕하세요 안녕하세요 안녕하세요 안녕하세요',
    timestamp: '2024-01-15 14:25',
    author: '사용자456',
    chatroom: '자유채팅방',
    confidence: 87.1,
    reason: '동일한 문구의 반복적 사용이 감지되었습니다.',
  },
  {
    id: 3,
    type: '분쟁',
    content: '이 사람이 욕을 했어요! 신고합니다!',
    timestamp: '2024-01-15 14:20',
    author: '사용자789',
    chatroom: '일반채팅방',
    confidence: 78.9,
    reason: '공격적인 언어와 신고 의도가 감지되었습니다.',
  },
  {
    id: 4,
    type: '정상',
    content: '오늘 날씨가 정말 좋네요!',
    timestamp: '2024-01-15 14:15',
    author: '사용자101',
    chatroom: '날씨방',
    confidence: 95.8,
    reason: '일상적인 대화로 판단됩니다.',
  },
  {
    id: 5,
    type: '광고',
    content: '💰 100% 확실한 수익! 지금 바로 투자하세요! 📈',
    timestamp: '2024-01-15 14:10',
    author: '투자왕',
    chatroom: '투자방',
    confidence: 96.3,
    reason: '수익 보장 문구와 투자 유도 메시지가 감지되었습니다.',
  },
  {
    id: 6,
    type: '도배',
    content: 'ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ',
    timestamp: '2024-01-15 14:05',
    author: '웃음봇',
    chatroom: '유머방',
    confidence: 98.7,
    reason: '동일 문자의 과도한 반복 사용이 감지되었습니다.',
  },
  {
    id: 7,
    type: '분쟁',
    content: '그런 식으로 말하지 마세요. 기분이 매우 나쁩니다.',
    timestamp: '2024-01-15 14:00',
    author: '화난사람',
    chatroom: '토론방',
    confidence: 73.2,
    reason: '부정적 감정 표현과 갈등 상황이 감지되었습니다.',
  },
  {
    id: 8,
    type: '정상',
    content: '안녕하세요! 새로 가입했습니다. 잘 부탁드려요.',
    timestamp: '2024-01-15 13:55',
    author: '신규회원',
    chatroom: '환영방',
    confidence: 99.1,
    reason: '정상적인 인사 메시지로 판단됩니다.',
  },
  {
    id: 9,
    type: '광고',
    content: '[무료체험] 최고의 다이어트 비법! 지금 신청하세요!',
    timestamp: '2024-01-15 13:50',
    author: '다이어트매니저',
    chatroom: '건강방',
    confidence: 94.8,
    reason: '무료체험 유도와 광고성 문구가 포함되었습니다.',
  },
  {
    id: 10,
    type: '정상',
    content: '오늘 회의 시간이 몇 시인지 알려주세요.',
    timestamp: '2024-01-15 13:45',
    author: '직장인A',
    chatroom: '업무방',
    confidence: 98.5,
    reason: '정상적인 업무 문의로 판단됩니다.',
  },
];

const MOCK_ANNOUNCEMENTS: AnnouncementRequest[] = [
  {
    id: 1,
    title: '시스템 점검 공지',
    content: '내일 오후 2시부터 4시까지 시스템 점검이 있을 예정입니다.',
    timestamp: '2024-01-15 10:00',
    status: '대기',
    room: 'IT 개발자 모임',
  },
  {
    id: 2,
    title: '새 기능 업데이트',
    content: '새로운 채팅 기능이 추가되었습니다.',
    timestamp: '2024-01-15 09:30',
    status: '승인',
    room: '코인 투자방',
  },
  {
    id: 3,
    title: '주요 정책 변경 안내',
    content: '커뮤니티 운영 정책이 일부 변경됩니다. 자세한 내용은 공지사항을 확인해주세요.',
    timestamp: '2024-01-15 09:00',
    status: '대기',
    room: '전체공지방',
  },
  {
    id: 4,
    title: '이벤트 당첨자 발표',
    content: '1월 이벤트 당첨자가 발표되었습니다. 당첨자분들은 개인 메시지를 확인해주세요.',
    timestamp: '2024-01-15 08:30',
    status: '승인',
    room: '이벤트방',
  },
  {
    id: 5,
    title: '긴급 보안 업데이트',
    content: '보안 강화를 위한 긴급 업데이트가 적용됩니다. 모든 사용자는 재로그인해주세요.',
    timestamp: '2024-01-15 08:00',
    status: '거부',
    room: '보안팀',
  },
];

// ===== Hook 인터페이스 정의 =====
export interface UseDetectedLogReturn {
  // 상태
  state: DetectionLogState;
  isLoading: boolean;
  error: string | null;
  
  // 필터링된 데이터
  filteredMessages: DetectedMessage[];
  filteredAnnouncements: AnnouncementRequest[];
  isEmpty: boolean;
  
  // 액션
  actions: {
    refreshData: () => Promise<void>;
    updateFilters: (filters: Partial<DetectionLogFilters>) => void;
    toggleMessageSelection: (id: number) => void;
    clearSelection: () => void;
    selectAll: () => void;
    acknowledgeMessage: (id: number) => void;
    ignoreMessage: (id: number) => void;
    batchAcknowledge: () => void;
    batchIgnore: () => void;
  };
}

// ===== 유틸리티 함수들 =====
const filterMessages = (
  messages: DetectedMessage[], 
  filters: DetectionLogFilters
): DetectedMessage[] => {
  console.log('[useDetectedLog] Filtering messages:', {
    totalMessages: messages.length,
    activeFilter: filters.activeFilter,
    searchQuery: filters.searchQuery
  });

  return messages.filter((message) => {
    // 검색어 필터링
    const searchMatch = !filters.searchQuery || 
      message.content.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (message.author && message.author.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      (message.chatroom && message.chatroom.toLowerCase().includes(filters.searchQuery.toLowerCase()));
    
    // 타입 필터링
    const typeMatch = filters.activeFilter === '전체' || message.type === filters.activeFilter;
    
    console.log(`[useDetectedLog] Message ${message.id}: searchMatch=${searchMatch}, typeMatch=${typeMatch}, type=${message.type}`);
    
    return searchMatch && typeMatch;
  });
};

const filterAnnouncements = (
  announcements: AnnouncementRequest[], 
  filters: DetectionLogFilters
): AnnouncementRequest[] => {
  console.log('[useDetectedLog] Filtering announcements:', {
    totalAnnouncements: announcements.length,
    activeFilter: filters.activeFilter,
    searchQuery: filters.searchQuery
  });

  // 공지 요청은 '전체' 또는 '공지 요청' 필터일 때만 표시
  if (filters.activeFilter !== '전체' && filters.activeFilter !== '공지 요청') {
    return [];
  }

  return announcements.filter((announcement) => {
    const searchMatch = !filters.searchQuery || 
      announcement.content.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (announcement.title && announcement.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      (announcement.room && announcement.room.toLowerCase().includes(filters.searchQuery.toLowerCase()));
    
    return searchMatch;
  });
};

// ===== 메인 Hook =====
export const useDetectedLog = (): UseDetectedLogReturn => {
  // ===== 상태 정의 =====
  const [state, setState] = useState<DetectionLogState>({
    messages: MOCK_MESSAGES,
    announcements: MOCK_ANNOUNCEMENTS,
    selectedIds: new Set<number>(),
    isLoading: false,
    filters: {
      searchQuery: '',
      activeFilter: '전체',
      dateRange: undefined,
    },
  });
  
  const [error, setError] = useState<string | null>(null);

  // ===== 계산된 값들 =====
  const filteredMessages = useMemo(() => 
    filterMessages(state.messages, state.filters),
    [state.messages, state.filters]
  );
  
  const filteredAnnouncements = useMemo(() =>
    filterAnnouncements(state.announcements, state.filters),
    [state.announcements, state.filters]
  );
  
  const isEmpty = useMemo(() => 
    filteredMessages.length === 0 && filteredAnnouncements.length === 0,
    [filteredMessages.length, filteredAnnouncements.length]
  );

  // ===== 액션 함수들 =====
  const refreshData = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);
      
      // 모의 데이터 새로고침 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        messages: MOCK_MESSAGES,
        announcements: MOCK_ANNOUNCEMENTS,
      }));
      
      presetToasts.info.refreshed();
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<DetectionLogFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      selectedIds: new Set(), // 필터 변경 시 선택 초기화
    }));
  }, []);

  const toggleMessageSelection = useCallback((id: number) => {
    setState(prev => {
      const newSelectedIds = new Set(prev.selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return { ...prev, selectedIds: newSelectedIds };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedIds: new Set() }));
  }, []);

  const selectAll = useCallback(() => {
    const allIds = new Set(filteredMessages.map(msg => msg.id));
    setState(prev => ({ ...prev, selectedIds: allIds }));
  }, [filteredMessages]);

  const acknowledgeMessage = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== id),
      selectedIds: new Set([...prev.selectedIds].filter(selectedId => selectedId !== id)),
    }));
    showToast.success('메시지 확인 완료', `메시지 #${id}가 확인 완료 처리되었습니다.`);
  }, []);

  const ignoreMessage = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== id),
      selectedIds: new Set([...prev.selectedIds].filter(selectedId => selectedId !== id)),
    }));
    showToast.warning('메시지 무시됨', `메시지 #${id}가 무시 처리되었습니다.`);
  }, []);

  const batchAcknowledge = useCallback(() => {
    const count = state.selectedIds.size;
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => !prev.selectedIds.has(msg.id)),
      selectedIds: new Set(),
    }));
    showToast.success('일괄 확인 완료', `${count}개의 메시지가 확인 완료 처리되었습니다.`);
  }, [state.selectedIds]);

  const batchIgnore = useCallback(() => {
    const count = state.selectedIds.size;
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => !prev.selectedIds.has(msg.id)),
      selectedIds: new Set(),
    }));
    showToast.warning('일괄 무시됨', `${count}개의 메시지가 무시 처리되었습니다.`);
  }, [state.selectedIds]);

  // ===== 초기 데이터 로딩 =====
  useEffect(() => {
    refreshData();
  }, []);

  // ===== 반환값 =====
  return {
    state,
    isLoading: state.isLoading,
    error,
    filteredMessages,
    filteredAnnouncements,
    isEmpty,
    actions: {
      refreshData,
      updateFilters,
      toggleMessageSelection,
      clearSelection,
      selectAll,
      acknowledgeMessage,
      ignoreMessage,
      batchAcknowledge,
      batchIgnore,
    },
  };
}; 