/**
 * 피드백 모달 컴포넌트
 * 피드백 폼을 감싸는 모달 UI
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal } from '~/components/composed/modal';
import { FeedbackForm } from '~/components/composed/feedback-form';
import { InteractionHaptics } from '@/~/lib/haptics';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const handleSubmitSuccess = () => {
    InteractionHaptics.loadSuccess();
    onSubmitSuccess?.();
    onClose();
  };

  const handleCancel = () => {
    InteractionHaptics.cancel();
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={true}
      title="피드백 보내기"
    >
      <View style={{ flex: 1, minHeight: 500 }}>
        <FeedbackForm
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
        />
      </View>
    </Modal>
  );
}; 