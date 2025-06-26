/**
 * 감지로그 화면 - React Native 버전
 * 웹의 DetectionLogView 구조를 React Native로 이식
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import { SearchInput } from '~/components/ui/input';
import { Card, CardContent } from '~/components/ui/card';
import { colors, spacing } from '~/lib/tokens';
import { createTextStyle, createContainerStyle, createButtonStyle, createShadowStyle } from '~/lib/utils';
import { getMessageTypeColor, commonStyles, EmptyState, Tag } from '~/components/ui/common';

// ===== 데이터 타입 정의 =====
interface MessageItem {
  id: number;
  type: '광고' | '도배' | '분쟁' | '정상';
  content: string;
  timestamp: string;
  author: string;
  chatroom: string;
  isSelected?: boolean;
}

interface AnnouncementRequest {
  id: number;
  title: string;
  content: string;
  timestamp: string;
  status: '대기' | '승인' | '거부';
}

// ===== 모의 데이터 =====
const mockMessages: MessageItem[] = [
  {
    id: 1,
    type: '광고',
    content: '특가 할인! 지금 주문하면 50% 할인해드립니다!',
    timestamp: '2024-01-15 14:30',
    author: '사용자123',
    chatroom: '일반채팅방',
  },
  {
    id: 2,
    type: '도배',
    content: '안녕하세요 안녕하세요 안녕하세요 안녕하세요',
    timestamp: '2024-01-15 14:25',
    author: '사용자456',
    chatroom: '자유채팅방',
  },
  {
    id: 3,
    type: '분쟁',
    content: '이 사람이 욕을 했어요! 신고합니다!',
    timestamp: '2024-01-15 14:20',
    author: '사용자789',
    chatroom: '일반채팅방',
  },
  {
    id: 4,
    type: '정상',
    content: '오늘 날씨가 정말 좋네요!',
    timestamp: '2024-01-15 14:15',
    author: '사용자101',
    chatroom: '날씨방',
  },
];

const mockAnnouncements: AnnouncementRequest[] = [
  {
    id: 1,
    title: '시스템 점검 공지',
    content: '내일 오후 2시부터 4시까지 시스템 점검이 있을 예정입니다.',
    timestamp: '2024-01-15 10:00',
    status: '대기',
  },
  {
    id: 2,
    title: '새 기능 업데이트',
    content: '새로운 채팅 기능이 추가되었습니다.',
    timestamp: '2024-01-15 09:30',
    status: '승인',
  },
];

// ===== 메시지 아이템 컴포넌트 =====
const MessageItemComponent: React.FC<{
  item: MessageItem;
  isSelected: boolean;
  isSelectionMode: boolean;
  onPress: () => void;
  onToggleSelect: () => void;
  onAcknowledge: () => void;
  onIgnore: () => void;
}> = ({ item, isSelected, isSelectionMode, onPress, onToggleSelect, onAcknowledge, onIgnore }) => {
  const typeColor = getMessageTypeColor(item.type);
  
  return (
    <Pressable 
      onPress={isSelectionMode ? onToggleSelect : onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.type} 메시지: ${item.content.slice(0, 50)}${item.content.length > 50 ? '...' : ''}`}
      accessibilityHint={isSelectionMode ? "탭하여 선택/해제" : "탭하여 메시지 상세보기"}
      accessibilityState={{ selected: isSelected }}
    >
      <Card 
        style={{
          borderLeftWidth: 4,
          borderLeftColor: typeColor,
          backgroundColor: isSelected ? colors.accent : colors.card,
        }}
      >
        <CardContent style={{ padding: spacing.md }}>
          <View style={[commonStyles.rowSpaceBetween, { marginBottom: spacing.xs }]}>
            <Tag 
              label={item.type} 
              backgroundColor={typeColor}
              color={colors.background}
            />
            <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
              {item.timestamp}
            </Text>
          </View>
          
          <Text style={[createTextStyle('sm', 'normal', 'foreground'), { marginBottom: spacing.xs }]}>
            {item.content}
          </Text>
          
          <View style={commonStyles.rowSpaceBetween}>
            <View>
              <Text style={createTextStyle('xs', 'medium', 'foreground')}>
                {item.author}
              </Text>
              <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
                {item.chatroom}
              </Text>
            </View>
            
            {!isSelectionMode && (
              <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                <Pressable
                  style={createButtonStyle('outline', 'sm')}
                  onPress={onAcknowledge}
                >
                  <Text style={createTextStyle('xs', 'medium', 'foreground')}>
                    확인
                  </Text>
                </Pressable>
                <Pressable
                  style={createButtonStyle('destructive', 'sm')}
                  onPress={onIgnore}
                >
                  <Text style={createTextStyle('xs', 'medium', 'destructiveForeground')}>
                    무시
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
};

// ===== 공지 요청 아이템 컴포넌트 =====
const AnnouncementItemComponent: React.FC<{ item: AnnouncementRequest }> = ({ item }) => {
  const getStatusColor = (status: AnnouncementRequest['status']) => {
    switch (status) {
      case '대기': return colors.customOrange;
      case '승인': return colors.customGreen;
      case '거부': return colors.customRed;
      default: return colors.muted;
    }
  };

  return (
    <Card>
      <CardContent style={{ padding: spacing.md }}>
        <View style={[commonStyles.rowSpaceBetween, { marginBottom: spacing.xs }]}>
          <Text style={createTextStyle('sm', 'semibold', 'foreground')}>
            {item.title}
          </Text>
          <Tag 
            label={item.status}
            backgroundColor={getStatusColor(item.status)}
            color={colors.background}
          />
        </View>
        
        <Text style={[createTextStyle('sm', 'normal', 'foreground'), { marginBottom: spacing.xs }]}>
          {item.content}
        </Text>
        
        <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
          {item.timestamp}
        </Text>
      </CardContent>
    </Card>
  );
};

// EmptyState는 이제 ~/components/ui/common에서 import

// ===== 메인 감지로그 화면 컴포넌트 =====
export default function DetectionLogScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('전체');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<MessageItem[]>(mockMessages);
  const [announcements] = useState<AnnouncementRequest[]>(mockAnnouncements);

  const filterTypes = ['전체', '공지 요청', '광고', '도배', '분쟁', '정상'];
  const isSelectionMode = selectedIds.size > 0;

  // 새로고침 핸들러
  const handleRefresh = async () => {
    setIsLoading(true);
    // 모의 새로고침 - 실제로는 API 호출
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // 검색 및 필터링된 데이터
  const filteredData = React.useMemo(() => {
    let filteredMessages = messages;
    let filteredAnnouncements = announcements;

    // 검색 필터링
    if (searchQuery) {
      filteredMessages = messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      filteredAnnouncements = announcements.filter(ann =>
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 타입 필터링
    if (activeFilter !== '전체') {
      if (activeFilter === '공지 요청') {
        filteredMessages = [];
      } else {
        filteredMessages = filteredMessages.filter(msg => msg.type === activeFilter);
        filteredAnnouncements = [];
      }
    }

    return { filteredMessages, filteredAnnouncements };
  }, [messages, announcements, searchQuery, activeFilter]);

  // 선택 토글
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 메시지 액션
  const handleAcknowledge = (id: number) => {
    Alert.alert('확인', `메시지 #${id}를 확인 완료 처리하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { 
        text: '확인', 
        onPress: () => {
          setMessages(prev => prev.filter(msg => msg.id !== id));
        }
      },
    ]);
  };

  const handleIgnore = (id: number) => {
    Alert.alert('무시', `메시지 #${id}를 무시하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { 
        text: '무시', 
        style: 'destructive',
        onPress: () => {
          setMessages(prev => prev.filter(msg => msg.id !== id));
        }
      },
    ]);
  };

  // 배치 액션
  const handleBatchAcknowledge = () => {
    Alert.alert('일괄 확인', `${selectedIds.size}개의 메시지를 확인 완료 처리하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { 
        text: '확인', 
        onPress: () => {
          setMessages(prev => prev.filter(msg => !selectedIds.has(msg.id)));
          setSelectedIds(new Set());
        }
      },
    ]);
  };

  const handleBatchIgnore = () => {
    Alert.alert('일괄 무시', `${selectedIds.size}개의 메시지를 무시하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { 
        text: '무시', 
        style: 'destructive',
        onPress: () => {
          setMessages(prev => prev.filter(msg => !selectedIds.has(msg.id)));
          setSelectedIds(new Set());
        }
      },
    ]);
  };

  const containerStyle = createContainerStyle('md', undefined, 'background');
  const { filteredMessages, filteredAnnouncements } = filteredData;
  const isEmpty = filteredMessages.length === 0 && filteredAnnouncements.length === 0;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[containerStyle, { flex: 1 }]}>
        {/* 검색 영역 */}
        <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
          <SearchInput
            placeholder="로그 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          {/* 필터 버튼 */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm }}
          >
            {filterTypes.map(type => (
              <Pressable
                key={type}
                style={createButtonStyle(
                  activeFilter === type ? 'default' : 'outline',
                  'sm'
                )}
                onPress={() => setActiveFilter(type)}
                accessibilityRole="button"
                accessibilityLabel={`${type} 필터`}
                accessibilityHint="탭하여 이 유형의 메시지만 표시"
                accessibilityState={{ selected: activeFilter === type }}
              >
                <Text style={createTextStyle('sm', 'medium', 
                  activeFilter === type ? 'primaryForeground' : 'foreground'
                )}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* 콘텐츠 영역 */}
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
        >
          {isEmpty ? (
            <EmptyState 
              title="표시할 로그 없음" 
              description="현재 필터에 해당하는 로그가 없습니다." 
            />
          ) : (
            <>
              {/* 공지 요청 */}
              {filteredAnnouncements.length > 0 && (
                <View>
                  <Text style={[createTextStyle('lg', 'bold', 'foreground'), { marginBottom: spacing.md }]}>
                    공지 요청
                  </Text>
                  <View style={{ gap: spacing.sm }}>
                    {filteredAnnouncements.map(item => (
                      <AnnouncementItemComponent key={item.id} item={item} />
                    ))}
                  </View>
                </View>
              )}

              {/* 메시지 로그 */}
              {filteredMessages.length > 0 && (
                <View>
                  {activeFilter === '전체' && (
                    <Text style={[createTextStyle('lg', 'bold', 'foreground'), { marginBottom: spacing.md }]}>
                      감지된 메시지
                    </Text>
                  )}
                  <View style={{ gap: spacing.sm }}>
                    {filteredMessages.map(item => (
                      <MessageItemComponent
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.has(item.id)}
                        isSelectionMode={isSelectionMode}
                        onPress={() => {}}
                        onToggleSelect={() => toggleSelect(item.id)}
                        onAcknowledge={() => handleAcknowledge(item.id)}
                        onIgnore={() => handleIgnore(item.id)}
                      />
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* 배치 액션 바 */}
        {isSelectionMode && (
          <View style={{
            position: 'absolute',
            bottom: spacing.md,
            left: spacing.md,
            right: spacing.md,
            backgroundColor: colors.foreground,
            borderRadius: spacing.sm,
            padding: spacing.md,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            ...createShadowStyle('lg'),
          }}>
            <Text style={createTextStyle('sm', 'medium', 'background')}>
              {selectedIds.size}개 선택됨
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Pressable
                style={createButtonStyle('secondary', 'sm')}
                onPress={handleBatchAcknowledge}
                accessibilityRole="button"
                accessibilityLabel={`선택된 ${selectedIds.size}개 메시지 확인 완료`}
                accessibilityHint="탭하여 선택된 메시지들을 확인 완료 처리"
              >
                <Text style={createTextStyle('sm', 'medium', 'secondaryForeground')}>
                  확인 완료
                </Text>
              </Pressable>
              <Pressable
                style={createButtonStyle('destructive', 'sm')}
                onPress={handleBatchIgnore}
                accessibilityRole="button"
                accessibilityLabel={`선택된 ${selectedIds.size}개 메시지 무시`}
                accessibilityHint="탭하여 선택된 메시지들을 무시 처리"
              >
                <Text style={createTextStyle('sm', 'medium', 'destructiveForeground')}>
                  무시
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
} 