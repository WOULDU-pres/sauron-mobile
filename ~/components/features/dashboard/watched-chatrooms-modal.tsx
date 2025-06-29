/**
 * WatchedChatRoomsModal - 감시 중인 채팅방 관리 모달
 * 채팅방 활성/비활성 설정, 제거, 저장/취소 기능 제공
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Trash2, CheckCircle, AlertCircle, Users } from 'lucide-react-native';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '~/components/composed/modal';
import { RadioGroup, RadioGroupItem } from '~/components/primitives/radio-group';
import { Card, CardContent } from '~/components/primitives/card';
import { Button } from '~/components/primitives/button';
import { colors, spacing } from '@/~/lib/tokens';
import { createTextStyle, createButtonStyle } from '@/~/lib/utils';
import { commonStyles, Tag } from '~/components/utils/common';
import { useToast } from '~/hooks/useToast';
import { InteractionHaptics } from '@/~/lib/haptics';
import type { DashboardChatroom } from '~/hooks/useDetectedMessageLog';

// ===== 타입 정의 =====
export interface ChatroomStatus {
  id: string;
  isActive: boolean;
  isMarkedForRemoval: boolean;
}

export interface WatchedChatRoomsModalProps {
  /**
   * 모달 표시 여부
   */
  visible: boolean;
  
  /**
   * 모달 닫기 콜백
   */
  onClose: () => void;
  
  /**
   * 선택된 채팅방 정보
   */
  chatroom?: DashboardChatroom;
  
  /**
   * 저장 완료 콜백
   */
  onSave?: (status: ChatroomStatus) => void;
  
  /**
   * 제거 완료 콜백
   */
  onRemove?: (chatroomName: string) => void;
  
  /**
   * 접근성 라벨
   */
  accessibilityLabel?: string;
}

// ===== 메인 컴포넌트 =====
export const WatchedChatRoomsModal: React.FC<WatchedChatRoomsModalProps> = ({
  visible,
  onClose,
  chatroom,
  onSave,
  onRemove,
  accessibilityLabel,
}) => {
  // 로컬 상태 - lazy initialization으로 초기값 설정
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive'>(() => 
    chatroom?.status === '활성' ? 'active' : 'inactive'
  );
  const [isMarkedForRemoval, setIsMarkedForRemoval] = useState(false);

  // chatroom이 변경될 때 상태 초기화
  // 객체 참조 대신 개별 속성을 체크하여 불필요한 리렌더링 방지
  useEffect(() => {
    if (chatroom) {
      setSelectedStatus(chatroom.status === '활성' ? 'active' : 'inactive');
      setIsMarkedForRemoval(false);
    }
  }, [chatroom?.name, chatroom?.status]);
  
  // Toast 훅 사용
  const { showDialog, showSuccess } = useToast();

  // 이벤트 핸들러들 - useCallback으로 최적화하여 함수 재생성 방지
  const handleStatusChange = useCallback((value: string) => {
    InteractionHaptics.select();
    setSelectedStatus(value as 'active' | 'inactive');
  }, []);

  const handleMarkForRemoval = useCallback(() => {
    InteractionHaptics.buttonPressDestructive();
    showDialog({
      title: '채팅방 제거',
      message: `"${chatroom?.name}" 채팅방을 감시 목록에서 제거하시겠습니까?`,
      confirmText: '제거',
      cancelText: '취소',
      type: 'warning',
      onConfirm: () => {
        InteractionHaptics.buttonPressDestructive();
        setIsMarkedForRemoval(true);
      },
    });
  }, [chatroom?.name, showDialog]);

  const handleUnmarkForRemoval = useCallback(() => {
    InteractionHaptics.cancel();
    setIsMarkedForRemoval(false);
  }, []);

  const handleSave = useCallback(() => {
    if (isMarkedForRemoval) {
      // 제거 처리
      InteractionHaptics.buttonPressDestructive();
      onRemove?.(chatroom?.name || '');
      showSuccess('완료', `${chatroom?.name} 채팅방이 감시 목록에서 제거되었습니다.`);
    } else {
      // 상태 업데이트 처리
      InteractionHaptics.loadSuccess();
      const status: ChatroomStatus = {
        id: `chatroom-${chatroom?.name}`,
        isActive: selectedStatus === 'active',
        isMarkedForRemoval: false,
      };
      onSave?.(status);
      showSuccess('완료', `${chatroom?.name} 채팅방 설정이 저장되었습니다.`);
    }
    onClose();
  }, [isMarkedForRemoval, selectedStatus, chatroom?.name, onSave, onRemove, onClose, showSuccess]);

  const handleCancel = useCallback(() => {
    InteractionHaptics.cancel();
    // 상태 초기화
    setSelectedStatus(chatroom?.status === '활성' ? 'active' : 'inactive');
    setIsMarkedForRemoval(false);
    onClose();
  }, [chatroom?.status, onClose]);

  // 채팅방이 없으면 모달 표시하지 않음
  if (!chatroom) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title="채팅방 관리"
      size="md"
      dismissOnBackdropPress={true}
      dismissOnBackPress={true}
    >
      <ModalContent>
        <View style={{ gap: spacing.lg }}>
          {/* 채팅방 정보 섹션 */}
          <Card style={{ 
            borderLeftWidth: 4, 
            borderLeftColor: isMarkedForRemoval ? colors.destructive : colors.primary 
          }}>
            <CardContent>
              <View style={[commonStyles.rowSpaceBetween, { marginBottom: spacing.sm }]}>
                <View style={commonStyles.row}>
                  <Users 
                    size={20} 
                    color={colors.primary} 
                    style={{ marginRight: spacing.sm }}
                  />
                  <Text style={createTextStyle('lg', 'semibold', 'foreground')}>
                    {chatroom.name}
                  </Text>
                </View>
                <Tag 
                  label={chatroom.status}
                  backgroundColor={chatroom.status === '활성' ? colors.primary : colors.muted}
                  color={colors.background}
                />
              </View>
              
              <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
                {chatroom.members.toLocaleString()}명 • {chatroom.lastActivity}
              </Text>
              
              {isMarkedForRemoval && (
                <View style={[
                  commonStyles.row, 
                  { 
                    marginTop: spacing.sm, 
                    padding: spacing.sm,
                    backgroundColor: colors.destructive + '20',
                    borderRadius: 6,
                  }
                ]}>
                  <AlertCircle size={16} color={colors.destructive} />
                  <Text style={[
                    createTextStyle('sm', 'medium', 'destructive'),
                    { marginLeft: spacing.xs }
                  ]}>
                    이 채팅방은 제거 대상으로 표시되었습니다.
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>

          {/* 제거 표시가 없을 때만 상태 설정 표시 */}
          {!isMarkedForRemoval && (
            <View>
              <Text style={[
                createTextStyle('base', 'semibold', 'foreground'),
                { marginBottom: spacing.md }
              ]}>
                감시 상태 설정
              </Text>
              
              <RadioGroup
                value={selectedStatus}
                onValueChange={handleStatusChange}
                accessibilityLabel="채팅방 감시 상태 선택"
              >
                <View style={{ gap: spacing.sm }}>
                  {/* 활성화 옵션 */}
                  <Card style={{
                    borderColor: selectedStatus === 'active' ? colors.primary : colors.border,
                    borderWidth: selectedStatus === 'active' ? 2 : 1,
                  }}>
                    <CardContent style={{ 
                      padding: spacing.md,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <RadioGroupItem 
                        value="active" 
                        accessibilityLabel="활성화: 이 채팅방을 적극적으로 감시합니다"
                        style={{ marginRight: spacing.md }}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={[commonStyles.row, { marginBottom: spacing.xs }]}>
                          <CheckCircle 
                            size={16} 
                            color={colors.primary}
                            style={{ marginRight: spacing.xs }}
                          />
                          <Text style={createTextStyle(
                            'base', 
                            'semibold', 
                            selectedStatus === 'active' ? 'primary' : 'foreground'
                          )}>
                            활성화
                          </Text>
                        </View>
                        <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
                          이 채팅방을 적극적으로 감시하여 부적절한 메시지를 탐지합니다.
                        </Text>
                      </View>
                    </CardContent>
                  </Card>

                  {/* 비활성화 옵션 */}
                  <Card style={{
                    borderColor: selectedStatus === 'inactive' ? colors.primary : colors.border,
                    borderWidth: selectedStatus === 'inactive' ? 2 : 1,
                  }}>
                    <CardContent style={{ 
                      padding: spacing.md,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <RadioGroupItem 
                        value="inactive" 
                        accessibilityLabel="비활성화: 감시를 일시 중단합니다"
                        style={{ marginRight: spacing.md }}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={[commonStyles.row, { marginBottom: spacing.xs }]}>
                          <AlertCircle 
                            size={16} 
                            color={colors.mutedForeground}
                            style={{ marginRight: spacing.xs }}
                          />
                          <Text style={createTextStyle(
                            'base', 
                            'semibold', 
                            selectedStatus === 'inactive' ? 'primary' : 'foreground'
                          )}>
                            비활성화
                          </Text>
                        </View>
                        <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
                          감시를 일시 중단합니다. 언제든지 다시 활성화할 수 있습니다.
                        </Text>
                      </View>
                    </CardContent>
                  </Card>
                </View>
              </RadioGroup>
            </View>
          )}

          {/* 위험 영역 - 제거 버튼 */}
          <View>
            <Text style={[
              createTextStyle('base', 'semibold', 'foreground'),
              { marginBottom: spacing.md }
            ]}>
              위험 영역
            </Text>
            
            <Card style={{ borderColor: colors.destructive, borderWidth: 1 }}>
              <CardContent style={{ padding: spacing.md }}>
                <View style={[commonStyles.rowSpaceBetween, { alignItems: 'flex-start' }]}>
                  <View style={{ flex: 1, marginRight: spacing.md }}>
                    <Text style={createTextStyle('base', 'semibold', 'foreground')}>
                      채팅방 제거
                    </Text>
                    <Text style={[
                      createTextStyle('sm', 'normal', 'mutedForeground'),
                      { marginTop: spacing.xs }
                    ]}>
                      이 채팅방을 감시 목록에서 완전히 제거합니다. 
                      이 작업은 되돌릴 수 없습니다.
                    </Text>
                  </View>
                  
                  {!isMarkedForRemoval ? (
                    <Pressable
                      style={[createButtonStyle('destructive', 'sm'), { minWidth: 80 }]}
                      onPress={handleMarkForRemoval}
                      accessibilityLabel="채팅방 제거"
                      accessibilityHint="이 채팅방을 감시 목록에서 제거합니다"
                    >
                      <View style={[commonStyles.row, { alignItems: 'center' }]}>
                        <Trash2 size={16} color={colors.destructiveForeground} />
                        <Text style={[
                          createTextStyle('sm', 'medium', 'destructiveForeground'),
                          { marginLeft: spacing.xs }
                        ]}>
                          제거
                        </Text>
                      </View>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={[createButtonStyle('outline', 'sm'), { minWidth: 80 }]}
                      onPress={handleUnmarkForRemoval}
                      accessibilityLabel="제거 취소"
                      accessibilityHint="채팅방 제거를 취소합니다"
                    >
                      <Text style={createTextStyle('sm', 'medium', 'foreground')}>
                        취소
                      </Text>
                    </Pressable>
                  )}
                </View>
              </CardContent>
            </Card>
          </View>
        </View>
      </ModalContent>

      <ModalFooter>
        <View style={[commonStyles.row, { gap: spacing.md }]}>
          <Pressable
            style={[createButtonStyle('outline', 'default'), { flex: 1 }]}
            onPress={handleCancel}
            accessibilityLabel="취소"
            accessibilityHint="변경사항을 저장하지 않고 모달을 닫습니다"
          >
            <Text style={createTextStyle('base', 'medium', 'foreground')}>
              취소
            </Text>
          </Pressable>
          
          <Pressable
            style={[
              createButtonStyle(isMarkedForRemoval ? 'destructive' : 'default', 'default'), 
              { flex: 1 }
            ]}
            onPress={handleSave}
            accessibilityLabel={isMarkedForRemoval ? "제거 확정" : "설정 저장"}
            accessibilityHint={isMarkedForRemoval ? "채팅방을 최종 제거합니다" : "현재 설정을 저장합니다"}
          >
            <Text style={createTextStyle(
              'base', 
              'medium', 
              isMarkedForRemoval ? 'destructiveForeground' : 'primaryForeground'
            )}>
              {isMarkedForRemoval ? '제거 확정' : '저장'}
            </Text>
          </Pressable>
        </View>
      </ModalFooter>
    </Modal>
  );
};

export default WatchedChatRoomsModal; 