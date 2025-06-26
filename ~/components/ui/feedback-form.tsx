/**
 * 피드백 폼 컴포넌트
 * 피드백 타입 선택, 제목, 내용 입력을 위한 UI
 */

import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Input } from './input';
import { Textarea } from './textarea';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { useFeedbackForm, FeedbackType } from '../../lib/hooks/useFeedbackForm';
import { useThemeColors } from '../../lib/theme-context';
import { colors, spacing } from '../../lib/tokens';
import { createTextStyle } from '../../lib/utils';
import { InteractionHaptics } from '../../lib/haptics';

const FEEDBACK_TYPES: { value: FeedbackType; label: string; description: string; emoji: string }[] = [
  {
    value: 'bug',
    label: '버그 신고',
    description: '기능이 제대로 동작하지 않을 때',
    emoji: '🐛',
  },
  {
    value: 'feature',
    label: '기능 요청',
    description: '새로운 기능을 제안하고 싶을 때',
    emoji: '💡',
  },
  {
    value: 'improvement',
    label: '개선 제안',
    description: '기존 기능을 더 좋게 만들고 싶을 때',
    emoji: '⚡',
  },
  {
    value: 'other',
    label: '기타',
    description: '위에 해당하지 않는 피드백',
    emoji: '💬',
  },
];

interface FeedbackFormProps {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmitSuccess,
  onCancel,
}) => {
  const themeColors = useThemeColors();
  const {
    state,
    updateType,
    updateTitle,
    updateContent,
    submitForm,
    resetForm,
    clearError,
    isValid,
  } = useFeedbackForm();

  const handleSubmit = async () => {
    InteractionHaptics.formSubmit();
    
    try {
      await submitForm();
      
      if (state.isSuccess) {
        InteractionHaptics.loadSuccess();
        onSubmitSuccess?.();
        
        // 성공 알림
        Alert.alert(
          '피드백 전송 완료',
          '소중한 피드백을 보내주셔서 감사합니다. 검토 후 반영하도록 하겠습니다.',
          [{ text: '확인', onPress: () => resetForm() }]
        );
      }
    } catch (error) {
      InteractionHaptics.formError();
    }
  };

  const handleCancel = () => {
    InteractionHaptics.cancel();
    resetForm();
    onCancel?.();
  };

  const handleTypeSelect = (type: FeedbackType) => {
    InteractionHaptics.select();
    updateType(type);
  };

  const renderTypeSelector = () => (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[
        createTextStyle('sm', 'semibold', 'foreground'),
        { marginBottom: spacing.md }
      ]}>
        피드백 유형 *
      </Text>
      
      <View style={{ gap: spacing.sm }}>
        {FEEDBACK_TYPES.map((type) => (
          <Pressable
            key={type.value}
            onPress={() => handleTypeSelect(type.value)}
            accessibilityRole="radio"
            accessibilityLabel={`${type.label}: ${type.description}`}
            accessibilityState={{ selected: state.data.type === type.value }}
          >
            <Card style={{
              borderColor: state.data.type === type.value 
                ? themeColors.primary 
                : themeColors.border,
              borderWidth: state.data.type === type.value ? 2 : 1,
            }}>
              <CardContent style={{ 
                padding: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 20, marginRight: spacing.md }}>
                  {type.emoji}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={createTextStyle(
                    'base', 
                    'semibold', 
                    state.data.type === type.value ? 'primary' : 'foreground'
                  )}>
                    {type.label}
                  </Text>
                  <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
                    {type.description}
                  </Text>
                </View>
                {state.data.type === type.value && (
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: themeColors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ color: themeColors.primaryForeground, fontSize: 12 }}>
                      ✓
                    </Text>
                  </View>
                )}
              </CardContent>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderErrorAlert = () => {
    if (!state.error) return null;

    return (
      <Card style={{ 
        backgroundColor: themeColors.destructive + '15',
        borderColor: themeColors.destructive,
        marginBottom: spacing.lg 
      }}>
        <CardContent style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 16, marginRight: spacing.sm }}>❌</Text>
            <View style={{ flex: 1 }}>
              <Text style={createTextStyle('sm', 'semibold', 'destructive')}>
                오류가 발생했습니다
              </Text>
              <Text style={createTextStyle('sm', 'normal', 'destructive')}>
                {state.error}
              </Text>
            </View>
            <Pressable onPress={clearError}>
              <Text style={createTextStyle('sm', 'normal', 'destructive')}>
                ✕
              </Text>
            </Pressable>
          </View>
        </CardContent>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 헤더 */}
      <CardHeader style={{ paddingBottom: spacing.md }}>
        <CardTitle>피드백 보내기</CardTitle>
        <Text style={createTextStyle('sm', 'normal', 'mutedForeground')}>
          더 나은 서비스를 위해 소중한 의견을 들려주세요
        </Text>
      </CardHeader>

      <CardContent style={{ flex: 1 }}>
        {/* 에러 알림 */}
        {renderErrorAlert()}

        {/* 피드백 유형 선택 */}
        {renderTypeSelector()}

        {/* 제목 입력 */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[
            createTextStyle('sm', 'semibold', 'foreground'),
            { marginBottom: spacing.sm }
          ]}>
            제목 *
          </Text>
          <Input
            value={state.data.title}
            onChangeText={updateTitle}
            placeholder="피드백 제목을 입력해주세요"
            error={state.errors.title}
            maxLength={100}
            accessibilityLabel="피드백 제목"
            accessibilityHint="5자 이상 100자 이하로 입력해주세요"
          />
          {state.errors.title && (
            <Text style={[
              createTextStyle('xs', 'normal', 'destructive'),
              { marginTop: spacing.xs }
            ]}>
              {state.errors.title}
            </Text>
          )}
        </View>

        {/* 내용 입력 */}
        <View style={{ marginBottom: spacing.lg, flex: 1 }}>
          <Text style={[
            createTextStyle('sm', 'semibold', 'foreground'),
            { marginBottom: spacing.sm }
          ]}>
            내용 *
          </Text>
          <Textarea
            value={state.data.content}
            onChangeText={updateContent}
            placeholder="피드백 내용을 자세히 작성해주세요"
            style={{ flex: 1, minHeight: 120 }}
            multiline
            numberOfLines={6}
            maxLength={1000}
            accessibilityLabel="피드백 내용"
            accessibilityHint="10자 이상 1000자 이하로 입력해주세요"
          />
          {state.errors.content && (
            <Text style={[
              createTextStyle('xs', 'normal', 'destructive'),
              { marginTop: spacing.xs }
            ]}>
              {state.errors.content}
            </Text>
          )}
          <Text style={[
            createTextStyle('xs', 'normal', 'mutedForeground'),
            { marginTop: spacing.xs, textAlign: 'right' }
          ]}>
            {state.data.content.length}/1000
          </Text>
        </View>

        {/* 버튼 영역 */}
        <View style={{ 
          flexDirection: 'row', 
          gap: spacing.md,
          paddingTop: spacing.md,
        }}>
          <Button
            variant="outline"
            size="default"
            title="취소"
            onPress={handleCancel}
            style={{ flex: 1 }}
            accessibilityLabel="피드백 취소"
          />
          <Button
            variant="default"
            size="default"
            title={state.isSubmitting ? "전송 중..." : "피드백 전송"}
            onPress={handleSubmit}
            disabled={!isValid || state.isSubmitting}
            loading={state.isSubmitting}
            style={{ flex: 1 }}
            accessibilityLabel="피드백 전송"
            accessibilityState={{ 
              disabled: !isValid || state.isSubmitting,
              busy: state.isSubmitting 
            }}
          />
        </View>
      </CardContent>
    </View>
  );
}; 