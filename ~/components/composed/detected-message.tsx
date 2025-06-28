/**
 * DetectedMessage 통합 컴포넌트
 * 웹의 MessageItem과 모바일의 MessageItemComponent를 통합한 컴포넌트
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card, CardContent } from '~/components/primitives/card';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle, createButtonStyle } from '@/~/lib/utils';
import { getMessageTypeColor, commonStyles, Tag } from '~/components/utils/common';
import { InteractionHaptics } from '@/~/lib/haptics';
import type { DetectedMessage } from '~/types/detection-log';

// ===== 컴포넌트 Props 정의 =====
export interface DetectedMessageItemProps {
  message: DetectedMessage;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress?: () => void;
  onToggleSelect?: () => void;
  onAcknowledge?: () => void;
  onIgnore?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface DetectedMessageListProps {
  messages: DetectedMessage[];
  selectedIds?: Set<number>;
  isSelectionMode?: boolean;
  onMessagePress?: (message: DetectedMessage) => void;
  onToggleSelect?: (id: number) => void;
  onAcknowledge?: (id: number) => void;
  onIgnore?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
  emptyMessage?: string;
}

// ===== DetectedMessage 개별 아이템 컴포넌트 =====
export const DetectedMessageItem: React.FC<DetectedMessageItemProps> = ({
  message,
  isSelected = false,
  isSelectionMode = false,
  onPress,
  onToggleSelect,
  onAcknowledge,
  onIgnore,
  showActions = true,
  compact = false,
}) => {
  const typeColor = getMessageTypeColor(message.type);
  
  const handlePress = () => {
    InteractionHaptics.buttonPress();
    if (isSelectionMode && onToggleSelect) {
      onToggleSelect();
    } else if (onPress) {
      onPress();
    }
  };

  const handleAcknowledgePress = () => {
    InteractionHaptics.loadSuccess();
    onAcknowledge?.();
  };

  const handleIgnorePress = () => {
    InteractionHaptics.buttonPressDestructive();
    onIgnore?.();
  };

  return (
    <Pressable 
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${message.type} 메시지: ${message.content.slice(0, 50)}${message.content.length > 50 ? '...' : ''}`}
      accessibilityHint={isSelectionMode ? "탭하여 선택/해제" : "탭하여 메시지 상세보기"}
      accessibilityState={{ selected: isSelected }}
    >
      <Card 
        style={{
          borderLeftWidth: 4,
          borderLeftColor: typeColor,
          backgroundColor: isSelected ? colors.accent : colors.card,
          marginBottom: compact ? spacing.xs : spacing.sm,
        }}
      >
        <CardContent style={{ padding: compact ? spacing.sm : spacing.md }}>
          {/* Header: Type Badge & Timestamp */}
          <View style={[commonStyles.rowSpaceBetween, { marginBottom: spacing.xs }]}>
            <Tag 
              label={message.type} 
              backgroundColor={typeColor}
              color={colors.background}
            />
            {message.timestamp && (
              <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
                {message.timestamp}
              </Text>
            )}
          </View>
          
          {/* Message Content */}
          <Text 
            style={[
              createTextStyle('sm', 'normal', 'foreground'), 
              { marginBottom: spacing.xs }
            ]}
            numberOfLines={compact ? 2 : undefined}
          >
            {message.content}
          </Text>
          
          {/* Author & Chatroom Info */}
          <View style={commonStyles.rowSpaceBetween}>
            <View style={{ flex: 1 }}>
              {message.author && (
                <Text style={createTextStyle('xs', 'medium', 'foreground')}>
                  {message.author}
                </Text>
              )}
              {message.chatroom && (
                <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
                  {message.chatroom}
                </Text>
              )}
            </View>
            
            {/* Confidence Score */}
            {message.confidence !== undefined && (
              <View style={{ alignItems: 'flex-end', marginLeft: spacing.sm }}>
                <Text style={createTextStyle('xs', 'normal', 'mutedForeground')}>
                  신뢰도
                </Text>
                <Text style={createTextStyle('sm', 'semibold', 'foreground')}>
                  {message.confidence.toFixed(1)}%
                </Text>
              </View>
            )}
            
            {/* Action Buttons */}
            {!isSelectionMode && showActions && (
              <View style={{ flexDirection: 'row', gap: spacing.xs, marginLeft: spacing.sm }}>
                <Pressable
                  style={createButtonStyle('outline', 'sm')}
                  onPress={handleAcknowledgePress}
                  accessibilityRole="button"
                  accessibilityLabel="메시지 확인 완료"
                >
                  <Text style={createTextStyle('xs', 'medium', 'foreground')}>
                    확인
                  </Text>
                </Pressable>
                <Pressable
                  style={createButtonStyle('destructive', 'sm')}
                  onPress={handleIgnorePress}
                  accessibilityRole="button"
                  accessibilityLabel="메시지 무시"
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

// ===== DetectedMessage 리스트 컴포넌트 =====
export const DetectedMessageList: React.FC<DetectedMessageListProps> = ({
  messages,
  selectedIds = new Set(),
  isSelectionMode = false,
  onMessagePress,
  onToggleSelect,
  onAcknowledge,
  onIgnore,
  showActions = true,
  compact = false,
  emptyMessage = "표시할 메시지가 없습니다.",
}) => {
  if (messages.length === 0) {
    return (
      <View style={{ 
        padding: spacing.xl, 
        alignItems: 'center' 
      }}>
        <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: compact ? spacing.xs : spacing.sm }}>
      {messages.map((message) => (
        <DetectedMessageItem
          key={message.id}
          message={message}
          isSelected={selectedIds.has(message.id)}
          isSelectionMode={isSelectionMode}
          onPress={() => onMessagePress?.(message)}
          onToggleSelect={() => onToggleSelect?.(message.id)}
          onAcknowledge={() => onAcknowledge?.(message.id)}
          onIgnore={() => onIgnore?.(message.id)}
          showActions={showActions}
          compact={compact}
        />
      ))}
    </View>
  );
};

// ===== 기본 Export =====
export default DetectedMessageItem; 