/**
 * @fileoverview 대시보드 화면 - React Native 버전
 * 
 * 웹의 DashboardView 구조를 React Native로 이식한 메인 대시보드 화면입니다.
 * DetectedMessageLogBox 컴포넌트를 통합하여 일관된 UI를 제공합니다.
 * 
 * @features
 * - 실시간 모니터링 상태 표시
 * - 공지 요청 관리
 * - 감시 중인 채팅방 관리
 * - 최근 감지된 메시지 조회
 * - 반응형 UI 및 다크/라이트 테마 지원
 * 
 * @accessibility 이 화면은 스크린 리더 및 보조 기술을 완전히 지원합니다.
 * 
 * @author Sauron Mobile Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Megaphone, Repeat, Annoyed, ShieldCheck } from 'lucide-react-native';
import { Card, CardContent } from '~/components/primitives/card';
import { SummaryCard } from '~/components/features/dashboard/SummaryCard';
import { WatchedChatRoomsModal, type ChatroomStatus } from '~/components/features/dashboard/watched-chatrooms-modal';
import { useWatchedChatRooms } from '~/hooks/useWatchedChatRooms';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle, createContainerStyle } from '@/~/lib/utils';
import { DetectedMessageLogBox, type LogBoxItem } from '~/components/composed/detected-message-log-box';
import { useDetectedMessageLog, type DashboardChatroom } from '~/hooks/useDetectedMessageLog';
import { useToast } from '~/hooks/useToast';
import type { DetectedMessage, AnnouncementRequest } from '~/types/detection-log';

// ===== 상수 정의 =====

/** 초기 로딩 화면 표시 시간 (ms) */
const LOADING_TIMEOUT = 1500;

/** 에러 상태 자동 클리어 시간 (ms) */
const ERROR_CLEAR_TIMEOUT = 5000;

/** 대시보드 요약 카드 데이터 */
const summaryData = [
  { 
    icon: Megaphone, 
    title: '광고', 
    count: 14, 
    color: colors.customRed 
  },
  { 
    icon: Repeat, 
    title: '도배', 
    count: 8, 
    color: colors.customOrange 
  },
  { 
    icon: Annoyed, 
    title: '분쟁/욕설', 
    count: 5, 
    color: colors.customPurple 
  },
  { 
    icon: ShieldCheck, 
    title: '정상 처리', 
    count: 231, 
    color: colors.customGreen 
  },
];

// ===== 타입 정의 =====

// ===== 상수 정의 (더미 데이터) =====

// 대시보드용 더미 데이터 - 감지로그 탭의 데이터와 동일한 구조 사용
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
];

// ===== 스타일 정의 =====

/**
 * 대시보드 화면 전용 스타일시트
 * 디자인 토큰을 기반으로 일관된 스타일을 제공합니다.
 */
const styles = StyleSheet.create({
  // 레이아웃 스타일
  /** 메인 화면 컨테이너 */
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  /** 로딩 화면 컨테이너 */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  /** 헤더 영역 컨테이너 */
  headerContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  /** 메인 콘텐츠 컨테이너 */
  contentContainer: {
    padding: spacing.md,
  },
  /** 각 섹션 간 간격 조정용 컨테이너 */
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  
  // 카드 스타일
  /** 요약 카드 그리드 컨테이너 */
  summaryCardsContainer: {
    marginBottom: spacing.xl,
  },
  /** 요약 카드 그리드 */
  summaryCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  /** 요약 카드 개별 아이템 */
  summaryCardItem: {
    flex: 1,
    minWidth: '45%', // 2열 그리드를 위한 최소 너비
  },
  
  // 텍스트 스타일
  /** 헤더 제목 텍스트 */
  headerTitle: {
    ...createTextStyle('2xl', 'bold', 'foreground'),
  },
  /** 로딩 상태 안내 텍스트 */
  loadingText: {
    ...createTextStyle('base', 'medium', 'mutedForeground'),
    marginTop: spacing.md,
  },

  
  // 알림 스타일

});

// ===== 유틸리티 함수들 =====

/**
 * 채팅방 이름을 기반으로 고유 ID를 생성합니다.
 * 
 * @param name - 채팅방 이름
 * @returns 생성된 채팅방 ID (예: "chatroom-general-chat")
 */
const generateChatroomId = (name: string): string => 
  `chatroom-${name.replace(/\s+/g, '-').toLowerCase()}`;

/**
 * 랜덤한 채팅방 이름을 생성합니다.
 * 
 * @returns 생성된 채팅방 이름
 */
const generateRandomChatroomName = (): string => {
  const prefixes = ['개발', '일반', '취미', '게임', '스터디', '프로젝트'];
  const suffixes = ['톡방', '채팅', '모임', '그룹', '커뮤니티', '클럽'];
  const numbers = Math.floor(Math.random() * 1000);
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${suffix} ${numbers}`;
};

// ===== 커스텀 훅들 =====

/**
 * 대시보드에 표시될 데이터들을 관리하는 커스텀 훅
 * 
 * @param showError - 에러 알림 표시 함수
 * @returns 대시보드 데이터와 관련 함수들
 */
const useDashboardData = (showError: (title: string, message?: string) => void) => {
  // 감시 중인 채팅방 데이터 관리
  const {
    chatrooms: watchedChatrooms,
    isLoading: chatroomsLoading,
    error: chatroomsError,
    hasChanges,
    updateChatroomStatus,
    removeChatroom,
    clearError,
  } = useWatchedChatRooms({
    // 감시 중인 채팅방 더미 데이터
    initialChatrooms: [
      {
        name: '일반 채팅방',
        members: 1247,
        lastActivity: '5분 전',
        status: '활성',
      },
      {
        name: '투자 정보방',
        members: 892,
        lastActivity: '2시간 전',
        status: '활성',
      },
      {
        name: '자유수다방',
        members: 634,
        lastActivity: '15분 전',
        status: '비활성',
      },
    ],
    onSuccess: (message, action) => {
      console.log(`Success: ${action} - ${message}`);
    },
    onError: (error, context) => {
      console.error(`Error in ${context}:`, error);
      showError('오류가 발생했습니다', context);
    },
  });

  // 감지된 메시지 데이터 변환 함수들
  const {
    convertMessagesToLogBoxItems,
    convertAnnouncementsToLogBoxItems,
    convertChatroomsToLogBoxItems,
  } = useDetectedMessageLog({ compact: true });

  // 채팅방 에러 상태 자동 정리
  useEffect(() => {
    if (chatroomsError) {
      showError('채팅방 데이터 오류', '채팅방 데이터를 불러오는 중 오류가 발생했습니다');
      const timer = setTimeout(() => {
        clearError();
      }, ERROR_CLEAR_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [chatroomsError, clearError, showError]);

  // 데이터 변환 최적화 - 의존성이 변경될 때만 재계산
  const messageLogBoxItems = useMemo(() => 
    convertMessagesToLogBoxItems(MOCK_MESSAGES), 
    [convertMessagesToLogBoxItems]
  );

  const announcementLogBoxItems = useMemo(() => 
    convertAnnouncementsToLogBoxItems(MOCK_ANNOUNCEMENTS),
    [convertAnnouncementsToLogBoxItems]
  );

  const chatroomLogBoxItems = useMemo(() => 
    convertChatroomsToLogBoxItems(
      watchedChatrooms.map(room => ({
        name: room.name,
        members: room.members,
        lastActivity: room.lastActivity,
        status: room.status,
      }))
    ),
    [watchedChatrooms, convertChatroomsToLogBoxItems]
  );

  return {
    watchedChatrooms,
    chatroomsLoading,
    chatroomsError,
    hasChanges,
    updateChatroomStatus,
    removeChatroom,
    messageLogBoxItems,
    announcementLogBoxItems,
    chatroomLogBoxItems,
  };
};

/**
 * 대시보드 화면의 사용자 인터랙션을 처리하는 커스텀 훅
 * 
 * @param watchedChatrooms - 감시 중인 채팅방 목록
 * @param updateChatroomStatus - 채팅방 상태 업데이트 함수
 * @param removeChatroom - 채팅방 제거 함수
 * @param showSuccess - 성공 알림 표시 함수
 * @param showError - 오류 알림 표시 함수
 * @param showInfo - 정보 알림 표시 함수
 * @returns 이벤트 핸들러들과 모달 상태
 */
const useDashboardHandlers = (
  watchedChatrooms: any[],
  updateChatroomStatus: (id: string, status: ChatroomStatus) => Promise<boolean>,
  removeChatroom: (id: string) => Promise<boolean>,
  showSuccess: (title: string, message?: string) => void,
  showError: (title: string, message?: string) => void,
  showInfo: (title: string, message?: string) => void
) => {
  // 채팅방 관리 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChatroom, setSelectedChatroom] = useState<DashboardChatroom | undefined>(undefined);

  // LogBox 아이템별 클릭 핸들러들
  
  /**
   * 메시지 아이템 클릭 처리
   */
  const handleMessagePress = useCallback((item: LogBoxItem) => {
    if (item.type !== 'message') return;
    
    showInfo(`${item.messageType} 메시지 상세 정보를 확인합니다`, 'info');
    // TODO: 실제 메시지 상세 화면으로 이동 구현 필요
  }, [showInfo]);

  /**
   * 공지사항 아이템 클릭 처리
   */
  const handleAnnouncementPress = useCallback((item: LogBoxItem) => {
    if (item.type !== 'announcement') return;

    showInfo('공지사항을 확인했습니다', 'info');
    // TODO: 실제 공지사항 상세 화면으로 이동 구현 필요
  }, [showInfo]);

  /**
   * 채팅방 아이템 클릭 처리 - 관리 모달을 열어 상세 설정 가능
   */
  const handleChatroomPress = useCallback((item: LogBoxItem) => {
    if (item.type !== 'chatroom') return;

    // 클릭된 채팅방의 전체 정보를 찾아서 모달에 전달
    const chatroom = watchedChatrooms.find(room => room.name === item.name);
    if (chatroom) {
      // 원본 객체를 그대로 사용하여 불필요한 리렌더링 방지
      setSelectedChatroom(chatroom);
      setModalVisible(true);
    } else {
      showInfo('요청하신 채팅방 정보를 찾을 수 없습니다', 'info');
    }
  }, [watchedChatrooms, showInfo]);

  /**
   * 채팅방 추가 버튼 클릭 처리
   * 랜덤 채팅방 이름을 생성하여 감시 목록에 추가합니다.
   */
  const handleAddChatroom = useCallback(async () => {
    const newChatroomName = generateRandomChatroomName();
    const newStatus: ChatroomStatus = {
      id: generateChatroomId(newChatroomName),
      isActive: true,
      isMarkedForRemoval: false,
    };
    
    const success = await updateChatroomStatus(newStatus.id, newStatus);
    if (success) {
      showSuccess('채팅방 추가됨', `${newChatroomName} 채팅방이 감시 목록에 추가되었습니다.`);
    } else {
      showError('채팅방 추가 실패', '채팅방 추가 중 오류가 발생했습니다.');
    }
  }, [updateChatroomStatus, showSuccess, showError]);

  /**
   * LogBox 아이템 타입에 따른 적절한 핸들러 호출
   */
  const handleLogBoxItemPress = useCallback((item: LogBoxItem) => {
    switch (item.type) {
      case 'message':
        handleMessagePress(item);
        break;
      case 'announcement':
        handleAnnouncementPress(item);
        break;
      case 'chatroom':
        handleChatroomPress(item);
        break;
    }
  }, [handleMessagePress, handleAnnouncementPress, handleChatroomPress]);

  // 채팅방 관리 모달 이벤트 핸들러들
  
  /**
   * 모달 닫기 처리
   */
  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedChatroom(undefined);
  }, []);

  /**
   * 모달에서 저장 버튼 클릭 시 처리
   * 
   * @param status - 새로운 채팅방 상태
   */
  const handleModalSave = useCallback(async (status: ChatroomStatus) => {
    const success = await updateChatroomStatus(status.id, status);
    if (success) {
      showSuccess('설정 저장됨', '채팅방 설정이 성공적으로 저장되었습니다.');
    } else {
      showError('설정 저장 실패', '설정 저장 중 오류가 발생했습니다.');
    }
    handleModalClose();
  }, [updateChatroomStatus, showSuccess, showError]);

  /**
   * 모달에서 제거 버튼 클릭 시 처리
   * 
   * @param chatroomName - 제거할 채팅방 이름
   */
  const handleModalRemove = useCallback(async (chatroomName: string) => {
    const chatroomId = generateChatroomId(chatroomName);
    const success = await removeChatroom(chatroomId);
    if (success) {
      showSuccess('채팅방 제거됨', `${chatroomName} 채팅방이 감시 목록에서 제거되었습니다.`);
    } else {
      showError('제거 실패', '채팅방 제거 중 오류가 발생했습니다.');
    }
    handleModalClose();
  }, [removeChatroom, showSuccess, showError]);

  return {
    modalVisible,
    selectedChatroom,
    handleLogBoxItemPress,
    handleAddChatroom,
    handleModalClose,
    handleModalSave,
    handleModalRemove,
  };
};

// ===== 하위 컴포넌트들 =====

/**
 * 앱 초기 로딩 시 표시되는 화면 컴포넌트
 */
const LoadingScreen: React.FC = () => (
  <SafeAreaView 
    style={styles.screenContainer}
    accessibilityLabel="대시보드 화면"
  >
    <View 
      style={styles.loadingContainer}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator 
        size="large" 
        color={colors.primary}
        accessibilityLabel="데이터 로딩 중"
      />
      <Text 
        style={styles.loadingText}
        accessibilityLabel="대시보드 데이터를 불러오고 있습니다. 잠시만 기다려 주세요"
        accessibilityRole="text"
      >
        로딩 중...
      </Text>
    </View>
  </SafeAreaView>
);

/**
 * 대시보드 상단 헤더 컴포넌트
 */
const DashboardHeader: React.FC = () => (
  <View style={styles.headerContainer}>
    <Text 
      style={styles.headerTitle}
      accessibilityRole="header"
      accessibilityLabel="오늘의 대시보드"
    >
      Today
    </Text>
  </View>
);

/**
 * 대시보드 요약 카드들을 표시하는 그리드 컴포넌트
 */
const SummaryCardsGrid: React.FC = () => (
  <View style={styles.summaryCardsContainer}>
    <View 
      style={styles.summaryCardsGrid}
      accessible
      accessibilityLabel="대시보드 요약 통계 카드들"
    >
      {summaryData.map((item, index) => (
        <View 
          key={item.title} 
          style={styles.summaryCardItem}
          accessible
        >
          <SummaryCard
            icon={item.icon}
            title={item.title}
            value={item.count}
            color={item.color}
          />
        </View>
      ))}
    </View>
  </View>
);

/**
 * 대시보드의 주요 섹션들을 렌더링하는 컴포넌트
 */
interface DashboardSectionsProps {
  /** 공지 요청 목록 */
  announcementLogBoxItems: LogBoxItem[];
  /** 감시 중인 채팅방 목록 */
  chatroomLogBoxItems: LogBoxItem[];
  /** 최근 감지된 메시지 목록 */
  messageLogBoxItems: LogBoxItem[];
  /** 아이템 클릭 핸들러 */
  onItemPress: (item: LogBoxItem) => void;
  /** 새 채팅방 추가 핸들러 */
  onAddChatroom: () => void;
}

const DashboardSections: React.FC<DashboardSectionsProps> = ({
  announcementLogBoxItems,
  chatroomLogBoxItems,
  messageLogBoxItems,
  onItemPress,
  onAddChatroom,
}) => (
  <View 
    accessible
    accessibilityRole="tablist"
    accessibilityLabel="대시보드 섹션들"
  >
    {/* 공지 요청 섹션 */}
    <View style={styles.sectionContainer}>
      <DetectedMessageLogBox
        title="공지 요청"
        items={announcementLogBoxItems}
        maxItems={3}
        compact={true}
        onItemPress={onItemPress}
        emptyMessage="현재 공지 요청이 없습니다."
        accessibilityLabel={`공지 요청 목록, 총 ${announcementLogBoxItems.length}개 항목`}
      />
    </View>

    {/* 감시 중인 채팅방 섹션 */}
    <View style={styles.sectionContainer}>
      <DetectedMessageLogBox
        title="감시 중인 채팅방"
        items={chatroomLogBoxItems}
        maxItems={3}
        compact={true}
        onItemPress={onItemPress}
        addButtonProps={{
          label: '새 채팅방 추가',
          onPress: onAddChatroom,
        }}
        emptyMessage="현재 감시 중인 채팅방이 없습니다."
        accessibilityLabel={`감시 중인 채팅방 목록, 총 ${chatroomLogBoxItems.length}개 항목`}
      />
    </View>

    {/* 최근 감지된 메시지 섹션 */}
    <View style={styles.sectionContainer}>
      <DetectedMessageLogBox
        title="최근 감지된 메시지"
        items={messageLogBoxItems}
        maxItems={3}
        compact={true}
        onItemPress={onItemPress}
        emptyMessage="최근 감지된 메시지가 없습니다."
        accessibilityLabel={`최근 감지된 메시지 목록, 총 ${messageLogBoxItems.length}개 항목`}
      />
    </View>
  </View>
);

// ===== 메인 대시보드 화면 컴포넌트 =====

/**
 * 사우론 모바일 앱의 메인 대시보드 화면
 * 
 * 이 컴포넌트는 다음과 같은 기능을 제공합니다:
 * - 실시간 모니터링 상태 표시
 * - 공지 요청 목록 조회
 * - 감시 중인 채팅방 관리
 * - 최근 감지된 메시지 조회
 * - 각종 상호작용 및 알림 처리
 * 
 * @returns JSX.Element
 */
export default function DashboardScreen() {
  // 초기 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  
  // 커스텀 훅들을 통한 기능 분리
  const { showSuccess, showError, showInfo } = useToast();
  
  const {
    watchedChatrooms,
    updateChatroomStatus,
    removeChatroom,
    messageLogBoxItems,
    announcementLogBoxItems,
    chatroomLogBoxItems,
  } = useDashboardData(showError);

  const {
    modalVisible,
    selectedChatroom,
    handleLogBoxItemPress,
    handleAddChatroom,
    handleModalClose,
    handleModalSave,
    handleModalRemove,
  } = useDashboardHandlers(watchedChatrooms, updateChatroomStatus, removeChatroom, showSuccess, showError, showInfo);

  // 초기 로딩 화면 표시 시간 제어
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_TIMEOUT);
    return () => clearTimeout(timer);
  }, []);

  // 로딩 중일 때는 로딩 화면 표시
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 메인 대시보드 화면 렌더링
  return (
    <SafeAreaView 
      style={styles.screenContainer}
      accessibilityLabel="사우론 대시보드 메인 화면"
    >
      {/* 상단 헤더 */}
      <DashboardHeader />

      {/* 스크롤 가능한 메인 콘텐츠 영역 */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        accessibilityLabel="대시보드 메인 콘텐츠 영역"
        showsVerticalScrollIndicator={true}
        accessible={true}
      >
        {/* 대시보드 요약 카드 그리드 */}
        <SummaryCardsGrid />
        
        {/* 각종 데이터 섹션들 */}
        <DashboardSections
          announcementLogBoxItems={announcementLogBoxItems}
          chatroomLogBoxItems={chatroomLogBoxItems}
          messageLogBoxItems={messageLogBoxItems}
          onItemPress={handleLogBoxItemPress}
          onAddChatroom={handleAddChatroom}
        />
      </ScrollView>

      {/* 채팅방 관리 모달 */}
      <WatchedChatRoomsModal
        visible={modalVisible}
        onClose={handleModalClose}
        chatroom={selectedChatroom}
        onSave={handleModalSave}
        onRemove={handleModalRemove}
        accessibilityLabel="감시 중인 채팅방 관리 모달 대화상자"
      />
    </SafeAreaView>
  );
}
