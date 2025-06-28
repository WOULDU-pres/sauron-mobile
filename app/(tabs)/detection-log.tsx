/**
 * 감지로그 화면 - React Native 버전
 * 웹의 DetectionLogView 구조를 React Native로 이식
 * useDetectedLog 커스텀 훅을 사용한 상태 관리
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SearchInput } from '~/components/primitives/input';
import { Card, CardContent } from '~/components/primitives/card';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle, createContainerStyle, createButtonStyle, createShadowStyle } from '@/~/lib/utils';
import { getMessageTypeColor, commonStyles, EmptyState, Tag } from '~/components/utils/common';
import { DatePickerWithRange, DateRange } from '~/components/composed/date-picker-with-range';
import { MessageDetailModal } from '~/components/composed/enhanced-modal';
import { showToast, presetToasts } from '~/components/composed/toast';
import { DetectedMessageList } from '~/components/composed/detected-message';
import { useDetectedLog } from '~/hooks/useDetectedLog';
import { useDetectedMessageModal } from '~/hooks/useDetectedMessageModal';
import { CommonIcon } from '~/components/utils/common-icon';
import type { DetectedMessage, AnnouncementRequest } from '~/types/detection-log';

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
        
        <View style={commonStyles.rowSpaceBetween}>
          <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
            {item.timestamp}
          </Text>
          {item.room && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CommonIcon name="map-pin" size={12} color={colors.mutedForeground} />
              <Text style={[createTextStyle('xs', 'normal', 'mutedForeground'), { marginLeft: 4 }]}>
                {item.room}
              </Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  );
};

// ===== 메인 감지로그 화면 컴포넌트 =====
export default function DetectionLogScreen() {
  // useDetectedLog 커스텀 훅 사용
  const {
    state,
    isLoading,
    error,
    filteredMessages,
    filteredAnnouncements,
    isEmpty,
    actions,
  } = useDetectedLog();

  // 모달 상태 관리 훅 사용
  const modalManager = useDetectedMessageModal({
    enableDebugLog: __DEV__,
    onModalOpen: (message) => {
      console.log('Modal opened for message:', message.id);
    },
    onModalClose: () => {
      console.log('Modal closed');
    },
  });

  const filterTypes = ['전체', '공지 요청', '광고', '도배', '분쟁', '정상'];
  const isSelectionMode = state.selectedIds.size > 0;

  // 메시지 상세 보기 (이제 modalManager에서 처리)
  const handleMessagePress = modalManager.handleMessagePress;

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (isSelectionMode) {
      actions.clearSelection();
    } else {
      actions.selectAll();
    }
  };

  // 에러 상태 처리
  if (error) {
    return (
      <SafeAreaView style={commonStyles.flex1}>
        <View style={[commonStyles.flex1, commonStyles.centerAll]}>
          <Text style={createTextStyle('lg', 'semibold', 'destructive')}>
            오류가 발생했습니다
          </Text>
          <Text style={[createTextStyle('sm', 'normal', 'mutedForeground'), { marginTop: spacing.sm }]}>
            {error}
          </Text>
                     <Pressable
             style={[createButtonStyle('default', 'default'), { marginTop: spacing.lg }]}
             onPress={actions.refreshData}
           >
             <Text style={createTextStyle('sm', 'medium', 'background')}>
               다시 시도
             </Text>
           </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.flex1}>
             {/* 헤더 영역 */}
       <View style={[createContainerStyle('sm'), createShadowStyle('sm')]}>
         <Text style={createTextStyle('xl', 'bold', 'foreground')}>
           감지로그
         </Text>
        
        {/* 검색 */}
        <View style={{ marginTop: spacing.sm }}>
          <SearchInput
            placeholder="메시지, 작성자, 채팅방 검색..."
            value={state.filters.searchQuery}
            onChangeText={(text) => actions.updateFilters({ searchQuery: text })}
          />
        </View>

        {/* 필터 탭 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.xs }}
          contentContainerStyle={{ paddingHorizontal: spacing.xs }}
        >
          {filterTypes.map((type) => (
            <Pressable
              key={type}
              style={[
                createButtonStyle(
                  state.filters.activeFilter === type ? 'default' : 'outline',
                  'xs'
                ),
                { marginRight: spacing.xs }
              ]}
              onPress={() => actions.updateFilters({ activeFilter: type })}
            >
              <Text style={createTextStyle(
                'xs',
                'medium',
                state.filters.activeFilter === type ? 'background' : 'foreground'
              )}>
                {type}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 선택 모드 컨트롤 */}
        {isSelectionMode && (
          <View style={[commonStyles.rowSpaceBetween, { marginTop: spacing.sm }]}>
            <Text style={createTextStyle('sm', 'medium', 'foreground')}>
              {state.selectedIds.size}개 선택됨
            </Text>
            <View style={commonStyles.row}>
              <Pressable
                style={[createButtonStyle('outline', 'xs'), { marginRight: spacing.xs }]}
                onPress={handleSelectAll}
              >
                <Text style={createTextStyle('xs', 'medium', 'foreground')}>
                  전체선택
                </Text>
              </Pressable>
              <Pressable
                style={[createButtonStyle('default', 'xs'), { marginRight: spacing.xs }]}
                onPress={actions.batchAcknowledge}
              >
                <Text style={createTextStyle('xs', 'medium', 'background')}>
                  일괄확인
                </Text>
              </Pressable>
              <Pressable
                style={createButtonStyle('destructive', 'xs')}
                onPress={actions.batchIgnore}
              >
                <Text style={createTextStyle('xs', 'medium', 'background')}>
                  일괄무시
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

             {/* 메인 콘텐츠 */}
       <ScrollView
         style={commonStyles.flex1}
         contentContainerStyle={createContainerStyle('sm')}
         refreshControl={
           <RefreshControl
             refreshing={isLoading}
             onRefresh={actions.refreshData}
             colors={[colors.primary]}
             tintColor={colors.primary}
           />
         }
       >
        {/* 빈 상태 */}
        {isEmpty && (
          <EmptyState
            title="감지된 메시지가 없습니다"
            description={
              state.filters.searchQuery || state.filters.activeFilter !== '전체'
                ? "필터 조건을 변경해보세요"
                : "모든 메시지가 정상 상태입니다"
            }
          />
        )}

        {/* 감지된 메시지 목록 */}
        {filteredMessages.length > 0 && (
          <DetectedMessageList
            messages={filteredMessages}
            selectedIds={state.selectedIds}
            onToggleSelect={actions.toggleMessageSelection}
            onMessagePress={handleMessagePress}
            onAcknowledge={actions.acknowledgeMessage}
            onIgnore={actions.ignoreMessage}
          />
        )}

        {/* 공지 요청 목록 */}
        {filteredAnnouncements.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={[createTextStyle('lg', 'semibold', 'foreground'), { marginBottom: spacing.md }]}>
              공지 요청
            </Text>
            {filteredAnnouncements.map((announcement) => (
              <View key={announcement.id} style={{ marginBottom: spacing.md }}>
                <AnnouncementItemComponent item={announcement} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

             {/* 메시지 상세 모달 */}
       <MessageDetailModal
         isVisible={modalManager.isVisible}
         message={modalManager.selectedMessage}
         onClose={modalManager.handleModalClose}
         onAcknowledge={(id) => {
           actions.acknowledgeMessage(id);
           modalManager.handleAcknowledge(id);
         }}
         onIgnore={(id) => {
           actions.ignoreMessage(id);
           modalManager.handleIgnore(id);
         }}
       />
    </SafeAreaView>
  );
} 