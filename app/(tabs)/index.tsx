/**
 * 대시보드 화면 - React Native 버전
 * 웹의 DashboardView 구조를 React Native로 이식
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Annoyed, Megaphone, Repeat, ShieldCheck, Plus } from 'lucide-react-native';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { colors, spacing } from '~/lib/tokens';
import { createTextStyle, createContainerStyle, addOpacity } from '~/lib/utils';
import { getMessageTypeColor, commonStyles, SectionHeader } from '~/components/ui/common';

// ===== 데이터 타입 정의 =====
interface SummaryData {
  icon: any;
  title: string;
  count: number;
  color: string;
}

interface MessageItem {
  id: number;
  type: string;
  room: string;
  content: string;
}

interface ChatroomItem {
  name: string;
  members: number;
  lastActivity: string;
  status: string;
}

interface AnnouncementRequest {
  room: string;
  content: string;
}

// ===== 모의 데이터 =====
const summaryData: SummaryData[] = [
  { icon: Megaphone, title: '광고', count: 14, color: colors.customRed },
  { icon: Repeat, title: '도배', count: 8, color: colors.customOrange },
  { icon: Annoyed, title: '분쟁/욕설', count: 5, color: colors.customPurple },
  { icon: ShieldCheck, title: '정상 처리', count: 231, color: colors.customGreen },
];

const messages: MessageItem[] = [
  { 
    id: 11, 
    type: '광고', 
    room: '주식 정보방', 
    content: '(광고) 절대 후회없는 최고의 선택! 지금 바로 확인하세요! https://example.com' 
  },
  { 
    id: 12, 
    type: '도배', 
    room: '자유로운 대화방', 
    content: 'ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ' 
  },
  { 
    id: 13, 
    type: '분쟁', 
    room: '게임 토론방', 
    content: '님 실력이 더 문제인듯... 그렇게밖에 못하시나요? 한심하네요 정말.' 
  },
  { 
    id: 14, 
    type: '광고', 
    room: '부동산 스터디', 
    content: '[Web발신] 100% 당첨! 지금 바로 확인! 지금 가입하면 5만원 즉시 지급! 조건없이 바로 드립니다!' 
  },
];

const chatrooms: ChatroomItem[] = [
  { name: 'IT 개발자 모임', members: 248, lastActivity: '방금 전', status: '활성' },
  { name: '부동산 정보방', members: 156, lastActivity: '3분 전', status: '활성' },
  { name: '게임 커뮤니티', members: 89, lastActivity: '1시간 전', status: '활성' },
  { name: '코인 투자방', members: 423, lastActivity: '5시간 전', status: '비활성' },
];

const announcementRequests: AnnouncementRequest[] = [
  { 
    room: 'IT 개발자 모임', 
    content: '중요 공지: 내일 정기 스터디는 취소되었습니다. 착오 없으시길 바랍니다.' 
  },
  { 
    room: '코인 투자방', 
    content: '필독! A코인 관련 긴급 업데이트 사항입니다. 모두 확인해주세요.' 
  },
];

// ===== 요약 카드 컴포넌트 =====
const SummaryCard: React.FC<SummaryData> = ({ icon: Icon, title, count, color }) => {
  return (
    <Card 
      style={{ 
        backgroundColor: color, 
        flex: 1,
        minHeight: 96,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${title} ${count}개`}
      accessibilityHint="탭하여 자세한 정보 보기"
    >
      <CardContent style={{ padding: spacing.sm, justifyContent: 'space-between', minHeight: 96 }}>
        <View style={[commonStyles.rowSpaceBetween, { alignItems: 'flex-start' }]}>
          <View style={{
            backgroundColor: addOpacity('#FFFFFF', 0.3),
            borderRadius: 20,
            padding: spacing.xs,
          }}>
            <Icon size={20} color="white" />
          </View>
        </View>
        <View style={{ marginTop: spacing.xs }}>
          <Text style={[createTextStyle('sm', 'semibold'), { color: 'white' }]}>
            {title}
          </Text>
          <Text style={[createTextStyle('2xl', 'bold'), { color: 'white' }]}>
            {count}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

// ===== 메시지 아이템 컴포넌트 =====
const MessageItemComponent: React.FC<{ 
  item: MessageItem; 
  onPress: () => void; 
}> = ({ item, onPress }) => {


  return (
    <Pressable 
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.type} 메시지: ${item.content}`}
      accessibilityHint="탭하여 메시지 상세보기"
    >
      <Card style={{ borderLeftWidth: 4, borderLeftColor: getMessageTypeColor(item.type) }}>
        <CardContent>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginBottom: spacing.xs 
          }}>
            <Text style={createTextStyle('xs', 'semibold', 'primary')}>
              {item.type}
            </Text>
            <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
              {item.room}
            </Text>
          </View>
          <Text 
            style={createTextStyle('sm', 'normal', 'foreground')} 
            numberOfLines={2}
            accessibilityLabel={`메시지 내용: ${item.content}`}
          >
            {item.content}
          </Text>
        </CardContent>
      </Card>
    </Pressable>
  );
};

// ===== 채팅방 아이템 컴포넌트 =====
const ChatroomItemComponent: React.FC<{ 
  item: ChatroomItem; 
  onPress: () => void; 
}> = ({ item, onPress }) => {
  const statusColor = item.status === '활성' ? colors.customGreen : colors.mutedForeground;

  return (
    <Pressable 
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`채팅방: ${item.name}, ${item.members}명, ${item.lastActivity}, ${item.status}`}
      accessibilityHint="탭하여 채팅방 관리"
    >
      <Card>
        <CardContent>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 4 
          }}>
            <Text style={createTextStyle('sm', 'semibold', 'foreground')}>
              {item.name}
            </Text>
            <Text style={[createTextStyle('xs', 'medium'), { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
          <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
            {item.members}명 • {item.lastActivity}
          </Text>
        </CardContent>
      </Card>
    </Pressable>
  );
};

// ===== 공지 요청 아이템 컴포넌트 =====
const AnnouncementItemComponent: React.FC<{ 
  item: AnnouncementRequest; 
  onPress: () => void; 
}> = ({ item, onPress }) => {
  return (
    <Pressable 
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`공지 요청: ${item.room}에서 ${item.content}`}
      accessibilityHint="탭하여 공지 승인 또는 거부"
    >
      <Card style={{ backgroundColor: addOpacity(colors.customYellow, 0.2), borderColor: colors.customYellow }}>
        <CardContent>
          <Text style={[createTextStyle('xs', 'semibold'), { color: colors.customYellow, marginBottom: 4 }]}>
            {item.room}
          </Text>
          <Text 
            style={[createTextStyle('sm', 'normal'), { color: colors.customYellow }]} 
            numberOfLines={2}
          >
            {item.content}
          </Text>
        </CardContent>
      </Card>
    </Pressable>
  );
};

// SectionHeader는 이제 ~/components/ui/common에서 import

// ===== 메인 대시보드 화면 컴포넌트 =====
export default function DashboardScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleMessagePress = (messageId: number) => {
    Alert.alert(
      '메시지 상세',
      `메시지 #${messageId}의 상세 정보를 확인하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => {
          Alert.alert('알림', '메시지 상세 화면으로 이동합니다.');
        }},
      ]
    );
  };

  const handleChatroomPress = (chatroomName: string) => {
    Alert.alert(
      '채팅방 입장',
      `"${chatroomName}" 채팅방에 입장하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '입장', onPress: () => {
          Alert.alert('알림', `${chatroomName} 채팅방에 입장했습니다.`);
        }},
      ]
    );
  };

  const handleAnnouncementPress = (announcement: AnnouncementRequest) => {
    Alert.alert(
      '공지사항',
      announcement.content,
      [
        { text: '확인' },
        { text: '상세보기', onPress: () => {
          Alert.alert('상세보기', '공지사항 상세 화면으로 이동합니다.');
        }},
      ]
    );
  };

  const handleAddChatroom = () => {
    Alert.alert(
      '새 채팅방',
      '새로운 채팅방을 생성하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '생성', onPress: () => {
          Alert.alert('성공', '새 채팅방이 생성되었습니다.');
        }},
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={createContainerStyle('none')}>
        <View style={createContainerStyle('md', 'center')}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text 
            style={[createTextStyle('base', 'medium', 'mutedForeground'), { marginTop: spacing.md }]}
            accessibilityLabel="대시보드 로딩 중"
          >
            로딩 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={createContainerStyle('none')}>
      {/* 헤더 */}
      <View style={{
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
      }}>
                 <Text 
           style={createTextStyle('2xl', 'bold', 'foreground')}
           accessibilityRole="header"
         >
           Today
         </Text>
      </View>

      {/* 메인 콘텐츠 */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.md }}
        accessibilityLabel="대시보드 메인 콘텐츠"
      >
        {/* 요약 카드 그리드 */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: spacing.md, 
          marginBottom: spacing.xl 
        }}>
          {summaryData.map((item) => (
            <SummaryCard key={item.title} {...item} />
          ))}
        </View>

        {/* 공지 요청 섹션 */}
        <View style={{ marginBottom: spacing.xl }}>
          <SectionHeader title="공지 요청" />
          <View style={{ gap: spacing.sm }}>
            {announcementRequests.map((item, index) => (
              <AnnouncementItemComponent 
                key={index} 
                item={item} 
                onPress={() => handleAnnouncementPress(item)}
              />
            ))}
          </View>
        </View>

        {/* 감시 중인 채팅방 섹션 */}
        <View style={{ marginBottom: spacing.xl }}>
          <SectionHeader title="감시 중인 채팅방" />
          <View style={{ gap: spacing.sm }}>
            {chatrooms.map((item, index) => (
              <ChatroomItemComponent 
                key={index} 
                item={item} 
                onPress={() => handleChatroomPress(item.name)}
              />
            ))}
            <Button
              variant="outline"
              size="lg"
              onPress={handleAddChatroom}
              style={{
                borderStyle: 'dashed',
                marginTop: spacing.xs,
              }}
              accessibilityLabel="새 채팅방 추가"
              accessibilityHint="탭하여 새로운 채팅방을 추가합니다"
            >
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: spacing.xs 
              }}>
                <Plus size={16} color={colors.mutedForeground} />
                <Text style={createTextStyle('sm', 'medium', 'mutedForeground')}>
                  채팅방 추가
                </Text>
              </View>
            </Button>
          </View>
        </View>

        {/* 최근 감지된 메시지 섹션 */}
        <View style={{ marginBottom: spacing.xl }}>
          <SectionHeader title="최근 감지된 메시지" />
          <View style={{ gap: spacing.sm }}>
            {messages.map((item) => (
              <MessageItemComponent 
                key={item.id} 
                item={item} 
                onPress={() => handleMessagePress(item.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
