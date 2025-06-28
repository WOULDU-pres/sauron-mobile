/**
 * 피드백 버튼 컴포넌트
 * 피드백 모달을 여는 트리거 버튼
 */

import React, { useState } from 'react';
import { Button } from '~/components/primitives/button';
import { FeedbackModal } from '~/components/composed/feedback-modal';
import { InteractionHaptics } from '@/~/lib/haptics';

interface FeedbackButtonProps {
  /**
   * 버튼 텍스트
   */
  title?: string;
  
  /**
   * 버튼 변형
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  /**
   * 버튼 크기
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  
  /**
   * 피드백 제출 성공 콜백
   */
  onSubmitSuccess?: () => void;
  
  /**
   * 접근성 레이블
   */
  accessibilityLabel?: string;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  title = "피드백 보내기",
  variant = "outline",
  size = "default",
  onSubmitSuccess,
  accessibilityLabel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    InteractionHaptics.buttonPress();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    InteractionHaptics.cancel();
    setIsModalOpen(false);
  };

  const handleSubmitSuccess = () => {
    InteractionHaptics.loadSuccess();
    onSubmitSuccess?.();
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        title={title}
        onPress={handleOpenModal}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint="피드백 모달을 엽니다"
      />
      
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  );
}; 