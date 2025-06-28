/**
 * DetectedMessageLogBox - 범용 로그박스 컴포넌트
 * 대시보드의 다양한 섹션(감지된 메시지, 공지요청, 채팅방)에서 재사용 가능
 */

import React from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import { Card, CardContent } from '~/components/primitives/card';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle, createButtonStyle } from '@/~/lib/utils';
import { getMessageTypeColor, commonStyles, Tag, SectionHeader } from '~/components/utils/common';
import { InteractionHaptics } from '@/~/lib/haptics';

// ===== 타입 정의 =====
export type LogBoxItemType = 'message' | 'announcement' | 'chatroom';

export interface BaseLogBoxItem {
  id: number | string;
  type: LogBoxItemType;
}

export interface MessageLogBoxItem extends BaseLogBoxItem {
  type: 'message';
  messageType: string; // '광고', '도배', '분쟁', '정상'
  content: string;
  room: string;
  timestamp?: string;
  author?: string;
  confidence?: number;
}

export interface AnnouncementLogBoxItem extends BaseLogBoxItem {
  type: 'announcement';
  title?: string;
  content: string;
  room: string;
  status?: '대기' | '승인' | '거부';
  timestamp?: string;
}

export interface ChatroomLogBoxItem extends BaseLogBoxItem {
  type: 'chatroom';
  name: string;
  members: number;
  lastActivity: string;
  status: string;
}

export type LogBoxItem = MessageLogBoxItem | AnnouncementLogBoxItem | ChatroomLogBoxItem;

export interface DetectedMessageLogBoxProps {
  title: string;
  items: LogBoxItem[];
  maxItems?: number;
  showActions?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  onItemPress?: (item: LogBoxItem) => void;
  onActionPress?: (item: LogBoxItem, action: string) => void;
  showMore?: boolean;
  onShowMorePress?: () => void;
  addButtonProps?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// ===== 메인 DetectedMessageLogBox 컴포넌트 =====
export const DetectedMessageLogBox: React.FC<DetectedMessageLogBoxProps> = ({
  title,
  items,
  maxItems = 5,
  showActions = false,
  compact = false,
  emptyMessage = "표시할 항목이 없습니다.",
  onItemPress,
  onActionPress,
  showMore = false,
  onShowMorePress,
  addButtonProps,
  style,
  accessibilityLabel,
}) => {
  const displayItems = maxItems > 0 ? items.slice(0, maxItems) : items;
  const hasMoreItems = items.length > maxItems;

  const handleItemPress = (item: LogBoxItem) => {
    InteractionHaptics.buttonPress();
    onItemPress?.(item);
  };

  const handleActionPress = (item: LogBoxItem, action: string) => {
    InteractionHaptics.buttonPress();
    onActionPress?.(item, action);
  };

  const handleShowMorePress = () => {
    InteractionHaptics.buttonPress();
    onShowMorePress?.();
  };

  const handleAddButtonPress = () => {
    InteractionHaptics.buttonPressImportant();
    addButtonProps?.onPress();
  };

  const renderMessageItem = (item: MessageLogBoxItem) => {
    const typeColor = getMessageTypeColor(item.messageType);

    return (
      <Pressable 
        onPress={() => handleItemPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.messageType} 메시지: ${item.content}`}
        accessibilityHint="탭하여 메시지 상세보기"
      >
        <Card 
          style={{ 
            borderLeftWidth: 4, 
            borderLeftColor: typeColor,
            marginBottom: compact ? spacing.xs : spacing.sm,
          }}
        >
          <CardContent style={{ padding: compact ? spacing.sm : spacing.md }}>
            <View style={[commonStyles.rowSpaceBetween, { marginBottom: spacing.xs }]}>
              <Tag 
                label={item.messageType} 
                backgroundColor={typeColor}
                color={colors.background}
              />
              <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
                {item.room}
              </Text>
            </View>
            
            <Text 
              style={[
                createTextStyle('sm', 'normal', 'foreground'), 
                { marginBottom: compact ? 0 : spacing.xs }
              ]}
              numberOfLines={compact ? 2 : undefined}
            >
              {item.content}
            </Text>
            
            {!compact && item.author && (
              <Text style={createTextStyle('xs', 'medium', 'mutedForeground')}>
                {item.author}
              </Text>
            )}
          </CardContent>
        </Card>
      </Pressable>
    );
  };

  const renderAnnouncementItem = (item: AnnouncementLogBoxItem) => {
    const getStatusColor = (status?: string) => {
      switch (status) {
        case '승인': return colors.primary;
        case '거부': return colors.destructive;
        case '대기': return colors.accent;
        default: return colors.muted;
      }
    };

    return (
      <Pressable 
        onPress={() => handleItemPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`공지요청: ${item.content}`}
        accessibilityHint="탭하여 공지요청 상세보기"
      >
        <Card style={{ marginBottom: compact ? spacing.xs : spacing.sm }}>
          <CardContent style={{ padding: compact ? spacing.sm : spacing.md }}>
            <View style={[commonStyles.rowSpaceBetween, { marginBottom: spacing.xs }]}>
              <Text style={createTextStyle('xs', 'medium', 'foreground')}>
                {item.room}
              </Text>
              {item.status && (
                <Tag 
                  label={item.status} 
                  backgroundColor={getStatusColor(item.status)}
                  color={colors.background}
                />
              )}
            </View>
            
            <Text 
              style={createTextStyle('sm', 'normal', 'foreground')}
              numberOfLines={compact ? 2 : undefined}
            >
              {item.content}
            </Text>
          </CardContent>
        </Card>
      </Pressable>
    );
  };

  const renderChatroomItem = (item: ChatroomLogBoxItem) => {
    return (
      <Pressable 
        onPress={() => handleItemPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`채팅방: ${item.name}, 멤버 ${item.members}명`}
        accessibilityHint="탭하여 채팅방 입장"
      >
        <Card style={{ marginBottom: compact ? spacing.xs : spacing.sm }}>
          <CardContent style={{ padding: compact ? spacing.sm : spacing.md }}>
            <View style={[commonStyles.rowSpaceBetween, { marginBottom: spacing.xs }]}>
              <Text style={createTextStyle('sm', 'semibold', 'foreground')}>
                {item.name}
              </Text>
              <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
                {item.members}명
              </Text>
            </View>
            
            <View style={commonStyles.rowSpaceBetween}>
              <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
                마지막 활동: {item.lastActivity}
              </Text>
              <Tag 
                label={item.status} 
                backgroundColor={item.status === '활성' ? colors.primary : colors.muted}
                color={colors.background}
              />
            </View>
          </CardContent>
        </Card>
      </Pressable>
    );
  };

  const renderItem = (item: LogBoxItem) => {
    const key = `${item.type}-${item.id}`;
    
    switch (item.type) {
      case 'message':
        return <View key={key}>{renderMessageItem(item)}</View>;
      case 'announcement':
        return <View key={key}>{renderAnnouncementItem(item)}</View>;
      case 'chatroom':
        return <View key={key}>{renderChatroomItem(item)}</View>;
      default:
        return null;
    }
  };

  return (
    <View 
      style={[{ marginBottom: spacing.xl }, style]}
      accessibilityLabel={accessibilityLabel || `${title} 섹션`}
    >
      <SectionHeader title={title} />
      
      {displayItems.length === 0 ? (
        <View style={{ 
          padding: spacing.md, 
          alignItems: 'center',
          backgroundColor: colors.muted,
          borderRadius: spacing.sm,
        }}>
          <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
            {emptyMessage}
          </Text>
        </View>
      ) : (
        <View style={{ gap: compact ? spacing.xs : spacing.sm }}>
          {displayItems.map(renderItem)}
          
          {(hasMoreItems || showMore) && onShowMorePress && (
            <Pressable
              style={[
                createButtonStyle('ghost', 'default'),
                { marginTop: spacing.xs }
              ]}
              onPress={handleShowMorePress}
              accessibilityRole="button"
              accessibilityLabel="더 보기"
            >
              <Text style={createTextStyle('sm', 'medium', 'foreground')}>
                {hasMoreItems ? `+${items.length - maxItems}개 더 보기` : '더 보기'}
              </Text>
            </Pressable>
          )}
          
          {addButtonProps && (
            <Pressable
              style={[
                createButtonStyle('outline', 'lg'),
                {
                  borderStyle: 'dashed',
                  marginTop: spacing.xs,
                }
              ]}
              onPress={handleAddButtonPress}
              accessibilityRole="button"
              accessibilityLabel={addButtonProps.label}
            >
              <View style={[commonStyles.row, { gap: spacing.xs }]}>
                <Text style={createTextStyle('sm', 'medium', 'mutedForeground')}>
                  + {addButtonProps.label}
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

export default DetectedMessageLogBox; 