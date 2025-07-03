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
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Megaphone, Repeat, Annoyed, ShieldCheck, Activity, Wifi, WifiOff } from 'lucide-react-native';
import { Card, CardContent } from '~/components/primitives/card';
import { SummaryCard } from '~/components/features/dashboard/SummaryCard';
import { WatchedChatRoomsModal, type ChatroomStatus } from '~/components/features/dashboard/watched-chatrooms-modal';
import { useWatchedChatRooms } from '~/hooks/useWatchedChatRooms';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle, createContainerStyle } from '@/~/lib/utils';
import { DetectedMessageLogBox, type LogBoxItem } from '~/components/composed/detected-message-log-box';
import { useDetectedMessageLog, type DashboardChatroom } from '~/hooks/useDetectedMessageLog';
import { useToast } from '~/hooks/useToast';
import { useDashboardApi } from '~/hooks/useDashboardApi';
import { usePerformanceMonitor } from '~/hooks/usePerformanceMonitor';
import { initializeErrorLogger } from '~/lib/errorLogger';
import PerformanceMonitorDashboard from '~/components/features/monitoring/PerformanceMonitorDashboard';
import type { DetectedMessage, AnnouncementRequest } from '~/types/detection-log';

// ===== 상수 정의 =====

/** 초기 로딩 화면 표시 시간 (ms) */
const LOADING_TIMEOUT = 1500;

/** 에러 상태 자동 클리어 시간 (ms) */
const ERROR_CLEAR_TIMEOUT = 5000;

/** 성능 모니터링 설정 */
const PERFORMANCE_MONITORING_ENABLED = __DEV__; // 개발 환경에서만 활성화

// ===== 타입 정의 =====

// API 데이터를 사용하므로 더미 데이터는 제거되었습니다.

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

  
  // 연결 상태 스타일
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.muted,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionText: {
    ...createTextStyle('xs', 'medium', 'mutedForeground'),
    marginLeft: spacing.xs,
  },
  serverIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  lastUpdatedText: {
    ...createTextStyle('xs', 'normal', 'mutedForeground'),
  },
  
  // 헤더 개선 스타일
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  performanceButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
});

// ===== 유틸리티 함수들 =====

// API 기반 대시보드로 전환하면서 기존 훅들은 제거되었습니다.

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

// ===== 메인 대시보드 화면 컴포넌트 =====

/**
 * 사우론 모바일 앱의 메인 대시보드 화면 (API 연동 버전)
 * 
 * 이 컴포넌트는 다음과 같은 기능을 제공합니다:
 * - 실시간 API 데이터 연동
 * - 성능 모니터링 및 에러 추적
 * - 풀투리프레시 지원
 * - 오프라인 대응
 * - 공지 요청 목록 조회
 * - 감시 중인 채팅방 관리
 * - 최근 감지된 메시지 조회
 * 
 * @returns JSX.Element
 */
export default function DashboardScreen() {
  // ===== 상태 관리 =====
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [performanceModalVisible, setPerformanceModalVisible] = useState(false);
  
  // ===== 커스텀 훅들 =====
  
  const { showSuccess, showError, showInfo } = useToast();
  
  // API 연동 훅
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    isOnline,
    isServerOnline,
    refresh,
    clearError,
    hasData,
    needsRefresh,
  } = useDashboardApi({
    refreshInterval: 30000, // 30초마다 자동 새로고침
    enableAutoRefresh: true,
    enableOfflineMode: true,
  });
  
  // 성능 모니터링 훅
  const {
    startMonitoring,
    stopMonitoring,
    isMonitoring,
  } = usePerformanceMonitor({
    responseTimeThreshold: 3000,
    errorRateThreshold: 15,
  });
  
  // 감지된 메시지 로그 변환
  const { convertMessagesToLogBoxItems, convertAnnouncementsToLogBoxItems } = useDetectedMessageLog({ compact: true });
  
  // 감시 중인 채팅방 관리
  const {
    chatrooms: watchedChatrooms,
    updateChatroomStatus,
    removeChatroom,
  } = useWatchedChatRooms({
    initialChatrooms: data.watchedChatrooms.map(room => ({
      name: room.name,
      members: room.members,
      lastActivity: room.lastActivity,
      status: room.status,
    })),
    onError: (error, context) => {
      showError('채팅방 관리 오류', context);
    },
  });
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChatroom, setSelectedChatroom] = useState<DashboardChatroom | undefined>(undefined);
  
  // ===== 초기화 =====
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 에러 로거 초기화
        await initializeErrorLogger();
        
        // 성능 모니터링 시작 (개발 환경에서만)
        if (PERFORMANCE_MONITORING_ENABLED) {
          startMonitoring();
        }
        
        // 초기 로딩 완료
        setTimeout(() => {
          setIsInitialLoading(false);
        }, LOADING_TIMEOUT);
        
      } catch (error: any) {
        showError('초기화 실패', '앱 초기화 중 오류가 발생했습니다.');
        setIsInitialLoading(false);
      }
    };
    
    initializeApp();
    
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, []);
  
  // ===== 에러 처리 =====
  
  useEffect(() => {
    if (error) {
      showError('데이터 로드 실패', error);
      
      // 자동 에러 클리어
      const timer = setTimeout(() => {
        clearError();
      }, ERROR_CLEAR_TIMEOUT);
      
      return () => clearTimeout(timer);
    }
  }, [error, showError, clearError]);
  
  // ===== 계산된 값들 =====
  
  // 요약 카드 데이터 (API 데이터 기반)
  const summaryData = useMemo(() => {
    if (!data.stats) {
      return [
        { icon: Megaphone, title: '광고', count: 0, color: colors.customRed },
        { icon: Repeat, title: '도배', count: 0, color: colors.customOrange },
        { icon: Annoyed, title: '분쟁/욕설', count: 0, color: colors.customPurple },
        { icon: ShieldCheck, title: '정상 처리', count: 0, color: colors.customGreen },
      ];
    }
    
    return [
      { 
        icon: Megaphone, 
        title: '광고', 
        count: data.stats.categories.advertisement, 
        color: colors.customRed 
      },
      { 
        icon: Repeat, 
        title: '도배', 
        count: data.stats.categories.spam, 
        color: colors.customOrange 
      },
      { 
        icon: Annoyed, 
        title: '분쟁/욕설', 
        count: data.stats.categories.abuse, 
        color: colors.customPurple 
      },
      { 
        icon: ShieldCheck, 
        title: '정상 처리', 
        count: data.stats.categories.normal, 
        color: colors.customGreen 
      },
    ];
  }, [data.stats]);
  
  // LogBox 아이템들 변환
  const messageLogBoxItems = useMemo(() => 
    convertMessagesToLogBoxItems(data.recentMessages), 
    [data.recentMessages, convertMessagesToLogBoxItems]
  );
  
  const announcementLogBoxItems = useMemo(() => 
    convertAnnouncementsToLogBoxItems(data.announcements),
    [data.announcements, convertAnnouncementsToLogBoxItems]
  );
  
  // ===== 이벤트 핸들러들 =====
  
  const handleLogBoxItemPress = useCallback((item: LogBoxItem) => {
    switch (item.type) {
      case 'message':
        showInfo(`${item.messageType} 메시지 상세정보`, 'info');
        break;
      case 'announcement':
        showInfo('공지사항을 확인했습니다', 'info');
        break;
      case 'chatroom':
        const chatroom = watchedChatrooms.find(room => room.name === item.name);
        if (chatroom) {
          setSelectedChatroom(chatroom);
          setModalVisible(true);
        }
        break;
    }
  }, [watchedChatrooms, showInfo]);
  
  const handleAddChatroom = useCallback(() => {
    showInfo('채팅방 추가 기능', '새로운 채팅방을 감시 목록에 추가합니다.');
  }, [showInfo]);
  
  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedChatroom(undefined);
  }, []);
  
  const handleModalSave = useCallback(async (status: ChatroomStatus) => {
    const success = await updateChatroomStatus(status.id, status);
    if (success) {
      showSuccess('설정 저장됨', '채팅방 설정이 성공적으로 저장되었습니다.');
    }
    handleModalClose();
  }, [updateChatroomStatus, showSuccess]);
  
  const handleModalRemove = useCallback(async (chatroomName: string) => {
    const success = await removeChatroom(chatroomName);
    if (success) {
      showSuccess('채팅방 제거됨', `${chatroomName} 채팅방이 제거되었습니다.`);
    }
    handleModalClose();
  }, [removeChatroom, showSuccess]);
  
  // ===== 렌더링 헬퍼 함수들 =====
  
  const renderConnectionStatus = () => (
    <View style={styles.connectionStatus}>
      <View style={styles.connectionIndicator}>
        {isOnline ? (
          <Wifi size={16} color={colors.customGreen} />
        ) : (
          <WifiOff size={16} color={colors.customRed} />
        )}
        <Text style={styles.connectionText}>
          {isOnline ? '온라인' : '오프라인'}
        </Text>
      </View>
      
      {isOnline && (
        <View style={styles.connectionIndicator}>
          <View 
            style={[
              styles.serverIndicator,
              { backgroundColor: isServerOnline ? colors.customGreen : colors.customRed }
            ]}
          />
          <Text style={styles.connectionText}>
            서버 {isServerOnline ? '연결됨' : '연결 안됨'}
          </Text>
        </View>
      )}
      
      {lastUpdated && (
        <Text style={styles.lastUpdatedText}>
          마지막 업데이트: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
  
  // ===== 조건부 렌더링 =====
  
  // 초기 로딩 화면
  if (isInitialLoading) {
    return <LoadingScreen />;
  }
  
  // 메인 대시보드 화면
  return (
    <SafeAreaView 
      style={styles.screenContainer}
      accessibilityLabel="사우론 대시보드 메인 화면"
    >
      {/* 상단 헤더 */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Today</Text>
          {PERFORMANCE_MONITORING_ENABLED && (
            <TouchableOpacity
              style={styles.performanceButton}
              onPress={() => setPerformanceModalVisible(true)}
            >
              <Activity size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        {renderConnectionStatus()}
      </View>

      {/* 스크롤 가능한 메인 콘텐츠 영역 */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        accessibilityLabel="대시보드 메인 콘텐츠 영역"
        showsVerticalScrollIndicator={true}
      >
        {/* 요약 카드 그리드 */}
        <View style={styles.summaryCardsContainer}>
          <View style={styles.summaryCardsGrid}>
            {summaryData.map((item, index) => (
              <View key={item.title} style={styles.summaryCardItem}>
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
        
        {/* 데이터 섹션들 */}
        <View style={styles.sectionContainer}>
          <DetectedMessageLogBox
            title="공지 요청"
            items={announcementLogBoxItems}
            maxItems={3}
            compact={true}
            onItemPress={handleLogBoxItemPress}
            emptyMessage="현재 공지 요청이 없습니다."
          />
        </View>

        <View style={styles.sectionContainer}>
          <DetectedMessageLogBox
            title="감시 중인 채팅방"
            items={data.watchedChatrooms.map(room => ({
              id: `chatroom-${room.name}`,
              type: 'chatroom' as const,
              name: room.name,
              subtitle: `${room.members}명 • ${room.lastActivity}`,
              status: room.status,
            }))}
            maxItems={3}
            compact={true}
            onItemPress={handleLogBoxItemPress}
            addButtonProps={{
              label: '새 채팅방 추가',
              onPress: handleAddChatroom,
            }}
            emptyMessage="현재 감시 중인 채팅방이 없습니다."
          />
        </View>

        <View style={styles.sectionContainer}>
          <DetectedMessageLogBox
            title="최근 감지된 메시지"
            items={messageLogBoxItems}
            maxItems={3}
            compact={true}
            onItemPress={handleLogBoxItemPress}
            emptyMessage="최근 감지된 메시지가 없습니다."
          />
        </View>
      </ScrollView>

      {/* 채팅방 관리 모달 */}
      <WatchedChatRoomsModal
        visible={modalVisible}
        onClose={handleModalClose}
        chatroom={selectedChatroom}
        onSave={handleModalSave}
        onRemove={handleModalRemove}
      />
      
      {/* 성능 모니터링 대시보드 */}
      {PERFORMANCE_MONITORING_ENABLED && (
        <PerformanceMonitorDashboard
          visible={performanceModalVisible}
          onClose={() => setPerformanceModalVisible(false)}
          isDeveloperMode={true}
        />
      )}
    </SafeAreaView>
  );
}
