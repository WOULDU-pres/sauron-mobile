import React from 'react';
import { 
  View, 
  Text, 
  Pressable,
  StyleSheet, 
  ScrollView, 
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Copy, AlertTriangle } from 'lucide-react-native';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle, createButtonStyle } from '@/~/lib/utils';
import { Card, CardContent } from '~/components/primitives/card';
import { Tag } from '~/components/utils/common';
import { InteractionHaptics } from '@/~/lib/haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Modal Types
export interface BaseModalProps {
  onClose: () => void;
}

export interface MessageDetailModalProps extends BaseModalProps {
  isVisible: boolean;
  message: {
    id: number;
    type: '광고' | '도배' | '분쟁' | '정상';
    content: string;
    timestamp: string;
    author: string;
    chatroom: string;
    aiReason?: string;
    confidence?: number;
  } | null;
  onAcknowledge: (id: number) => void;
  onIgnore: (id: number) => void;
}

export interface ChatroomSettingsModalProps extends BaseModalProps {
  isVisible: boolean;
  chatroom: {
    id: string;
    name: string;
    isFiltered: boolean;
    alertLevel: 'low' | 'medium' | 'high';
    keywords: string[];
  };
  onUpdateSettings: (settings: any) => void;
}

// Enhanced Modal Container
const ModalContainer: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  visible: boolean;
}> = ({ children, onClose, title, size = 'md', visible }) => {
  const insets = useSafeAreaInsets();
  
  const getModalWidth = () => {
    switch (size) {
      case 'sm': return screenWidth * 0.8;
      case 'md': return screenWidth * 0.9;
      case 'lg': return screenWidth * 0.95;
      case 'xl': return screenWidth * 0.98;
      default: return screenWidth * 0.9;
    }
  };

  const getModalHeight = () => {
    switch (size) {
      case 'sm': return screenHeight * 0.4;
      case 'md': return screenHeight * 0.6;
      case 'lg': return screenHeight * 0.8;
      case 'xl': return screenHeight * 0.9;
      default: return screenHeight * 0.6;
    }
  };

  const handleBackdropPress = () => {
    InteractionHaptics.cancel();
    onClose();
  };

  const handleClosePress = () => {
    InteractionHaptics.buttonPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <Pressable 
        style={styles.overlay}
        onPress={handleBackdropPress}
        accessibilityRole="button"
        accessibilityLabel="모달 닫기"
        accessibilityHint="모달 바깥 영역을 터치하면 모달이 닫힙니다"
      >
        <Pressable 
          style={[
            styles.modal,
            {
              width: getModalWidth(),
              maxHeight: getModalHeight(),
              marginTop: insets.top + 20,
              marginBottom: insets.bottom + 20,
            }
          ]}
          onPress={(e) => e.stopPropagation()} // 모달 내부 터치 시 닫기 방지
        >
          {/* Modal Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              style={styles.closeButton}
              onPress={handleClosePress}
              accessibilityLabel="닫기"
              accessibilityRole="button"
              accessibilityHint="모달을 닫습니다"
            >
              <X size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
          
          {/* Modal Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
            accessibilityLabel="모달 내용"
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// AI Reason Component
const AiReasonComponent: React.FC<{
  reason: string;
  confidence: number;
}> = ({ reason, confidence }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return colors.customGreen;
    if (confidence >= 60) return colors.customOrange;
    return colors.customRed;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return '높음';
    if (confidence >= 60) return '보통';
    return '낮음';
  };

  return (
    <Card style={{ marginTop: spacing.md }}>
      <CardContent style={{ padding: spacing.md }}>
        <View style={styles.aiHeader}>
          <View style={styles.aiTitleContainer}>
            <AlertTriangle size={18} color={colors.primary} />
            <Text style={styles.aiTitle}>AI 분석 결과</Text>
          </View>
          <Tag 
            label={`신뢰도: ${getConfidenceText(confidence)}`}
            backgroundColor={getConfidenceColor(confidence)}
            color={colors.background}
          />
        </View>
        
        <Text style={styles.aiReason}>{reason}</Text>
        
        <View style={styles.confidenceBar}>
          <View style={styles.confidenceBarBackground}>
            <View 
              style={[
                styles.confidenceBarFill,
                { 
                  width: `${confidence}%`,
                  backgroundColor: getConfidenceColor(confidence)
                }
              ]} 
            />
          </View>
          <Text style={styles.confidenceText}>{confidence}%</Text>
        </View>
      </CardContent>
    </Card>
  );
};

// Message Detail Modal
export const MessageDetailModal: React.FC<MessageDetailModalProps> = ({
  isVisible,
  message,
  onClose,
  onAcknowledge,
  onIgnore,
}) => {
  if (!message) return null;

  const handleCopyPress = () => {
    InteractionHaptics.buttonPress();
    // 복사 로직은 여기에 구현
    console.log('복사:', message.content);
  };

  const handleAcknowledgePress = () => {
    InteractionHaptics.buttonPressImportant();
    onAcknowledge(message.id);
    onClose();
  };

  const handleIgnorePress = () => {
    InteractionHaptics.buttonPressDestructive();
    onIgnore(message.id);
    onClose();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '광고': return colors.primary;
      case '도배': return colors.customOrange;
      case '분쟁': return colors.customRed;
      case '정상': return colors.customGreen;
      default: return colors.muted;
    }
  };

  return (
    <ModalContainer
      visible={isVisible}
      onClose={onClose}
      title="메시지 상세"
      size="lg"
    >
      <View style={styles.messageDetail}>
        {/* Message Header */}
        <View style={styles.messageHeader}>
          <Tag 
            label={message.type} 
            backgroundColor={getTypeColor(message.type)}
            color={colors.background}
          />
          <Text style={styles.timestamp}>
            {message.timestamp}
          </Text>
        </View>

        {/* Message Info Grid */}
        <View style={styles.messageInfo}>
          <View>
            <Text style={styles.infoLabel}>작성자</Text>
            <Text style={styles.infoValue}>{message.author}</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>채팅방</Text>
            <Text style={styles.infoValue}>{message.chatroom}</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>신뢰도</Text>
            <Text style={styles.infoValue}>{message.confidence?.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Message Content */}
        <View style={styles.messageContentContainer}>
          <View style={styles.messageContentHeader}>
            <Text style={createTextStyle('sm', 'semibold', 'foreground')}>
              메시지 내용
            </Text>
            <Pressable 
              style={styles.copyButton}
              onPress={handleCopyPress}
              accessibilityLabel="메시지 복사"
              accessibilityRole="button"
            >
              <Copy size={16} color={colors.mutedForeground} />
              <Text style={styles.copyText}>복사</Text>
            </Pressable>
          </View>
          
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>
              {message.content}
            </Text>
          </View>
        </View>

        {/* AI Analysis */}
        {message.aiReason && (
          <View style={styles.messageContentContainer}>
            <View style={styles.messageContentHeader}>
              <AlertTriangle size={16} color={colors.customOrange} />
              <Text style={[createTextStyle('sm', 'semibold', 'foreground'), { marginLeft: spacing.xs }]}>
                AI 분석 결과
              </Text>
            </View>
            
            <View style={[styles.messageContent, { borderLeftColor: colors.customOrange }]}>
              <Text style={styles.messageText}>
                {message.aiReason}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, styles.ignoreButton]}
            onPress={handleIgnorePress}
            accessibilityRole="button"
            accessibilityLabel="메시지 무시"
            accessibilityHint="이 메시지를 무시하고 모달을 닫습니다"
          >
            <Text style={styles.ignoreButtonText}>무시</Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, styles.acknowledgeButton]}
            onPress={handleAcknowledgePress}
            accessibilityRole="button"
            accessibilityLabel="메시지 확인 완료"
            accessibilityHint="이 메시지를 확인 완료 처리하고 모달을 닫습니다"
          >
            <Text style={styles.acknowledgeButtonText}>확인 완료</Text>
          </Pressable>
        </View>
      </View>
    </ModalContainer>
  );
};

// Chatroom Settings Modal
export const ChatroomSettingsModal: React.FC<ChatroomSettingsModalProps> = ({
  isVisible,
  chatroom,
  onClose,
  onUpdateSettings,
}) => {
  const [isFiltered, setIsFiltered] = React.useState(chatroom.isFiltered);
  const [alertLevel, setAlertLevel] = React.useState(chatroom.alertLevel);

  if (!isVisible) {
    return null;
  }

  const handleSave = () => {
    onUpdateSettings({
      ...chatroom,
      isFiltered,
      alertLevel,
    });
    onClose();
  };

  const alertLevels = [
    { value: 'low', label: '낮음', color: colors.customGreen },
    { value: 'medium', label: '보통', color: colors.customOrange },
    { value: 'high', label: '높음', color: colors.customRed },
  ] as const;

  return (
    <ModalContainer 
      title="채팅방 설정" 
      onClose={onClose}
      size="md"
      visible={isVisible}
    >
      <View style={styles.settingsContainer}>
        {/* Chatroom Info */}
        <View style={styles.chatroomInfo}>
          <Text style={styles.chatroomName}>{chatroom.name}</Text>
          <Text style={styles.chatroomId}>ID: {chatroom.id}</Text>
        </View>

        {/* Filter Toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>필터링 활성화</Text>
            <Pressable
              style={[
                styles.toggle,
                isFiltered ? styles.toggleActive : styles.toggleInactive
              ]}
              onPress={() => setIsFiltered(!isFiltered)}
            >
              <View style={[
                styles.toggleKnob,
                isFiltered ? styles.toggleKnobActive : styles.toggleKnobInactive
              ]} />
            </Pressable>
          </View>
          <Text style={styles.settingDescription}>
            이 채팅방에서 메시지 필터링을 사용합니다
          </Text>
        </View>

        {/* Alert Level */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>알람 레벨</Text>
          <Text style={styles.settingDescription}>
            위험 메시지 감지 시 알람 강도를 설정합니다
          </Text>
          <View style={styles.alertLevels}>
            {alertLevels.map((level) => (
              <Pressable
                key={level.value}
                style={[
                  styles.alertLevelButton,
                  alertLevel === level.value && styles.alertLevelButtonActive
                ]}
                onPress={() => setAlertLevel(level.value)}
              >
                <View 
                  style={[
                    styles.alertLevelIndicator,
                    { backgroundColor: level.color }
                  ]} 
                />
                <Text style={[
                  styles.alertLevelText,
                  alertLevel === level.value && styles.alertLevelTextActive
                ]}>
                  {level.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Keywords */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>필터링 키워드</Text>
          <Text style={styles.settingDescription}>
            현재 {chatroom.keywords.length}개의 키워드가 설정되어 있습니다
          </Text>
          <View style={styles.keywords}>
            {chatroom.keywords.map((keyword, index) => (
              <Tag 
                key={index}
                label={keyword}
                backgroundColor={colors.muted}
                color={colors.mutedForeground}
              />
            ))}
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>설정 저장</Text>
        </Pressable>
      </View>
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  messageDetail: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  messageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  messageContentContainer: {
    gap: spacing.sm,
  },
  messageContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  copyText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  messageContent: {
    backgroundColor: colors.muted,
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.foreground,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aiTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  aiReason: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  confidenceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  confidenceBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.mutedForeground,
    minWidth: 32,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  ignoreButton: {
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  acknowledgeButton: {
    backgroundColor: colors.primary,
  },
  ignoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  acknowledgeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primaryForeground,
  },
  settingsContainer: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  chatroomInfo: {
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatroomName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  chatroomId: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  settingItem: {
    gap: spacing.sm,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleInactive: {
    backgroundColor: colors.muted,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  toggleKnobInactive: {
    alignSelf: 'flex-start',
  },
  alertLevels: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  alertLevelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  alertLevelButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.primary,
  },
  alertLevelIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  alertLevelText: {
    fontSize: 14,
    color: colors.foreground,
  },
  alertLevelTextActive: {
    fontWeight: '500',
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
}); 