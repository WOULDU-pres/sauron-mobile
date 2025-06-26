/**
 * 햅틱 피드백 유틸리티
 * 사용자 상호작용에 대한 촉각 피드백 제공
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * 햅틱 피드백 타입
 * 상호작용 종류에 따른 적절한 햅틱 강도
 */
export enum HapticFeedbackType {
  // 일반적인 상호작용
  LIGHT = 'light',           // 버튼 터치, 스위치 토글
  MEDIUM = 'medium',         // 선택, 확인
  HEAVY = 'heavy',           // 중요한 액션, 삭제
  
  // 특수한 상호작용
  SUCCESS = 'success',       // 성공적인 작업 완료
  WARNING = 'warning',       // 경고나 주의
  ERROR = 'error',          // 오류 발생
  
  // 선택적 피드백
  SELECTION = 'selection',   // 아이템 선택/해제
  REFRESH = 'refresh',       // 새로고침, 데이터 로드
}

/**
 * 햅틱 피드백 실행
 * @param type 햅틱 피드백 타입
 * @param enabled 햅틱 피드백 활성화 여부 (기본값: true)
 */
export async function triggerHaptic(
  type: HapticFeedbackType,
  enabled: boolean = true
): Promise<void> {
  // 햅틱 피드백이 비활성화된 경우 실행하지 않음
  if (!enabled) {
    return;
  }

  // iOS에서만 햅틱 피드백 지원
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    switch (type) {
      case HapticFeedbackType.LIGHT:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      
      case HapticFeedbackType.MEDIUM:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      
      case HapticFeedbackType.HEAVY:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      
      case HapticFeedbackType.SUCCESS:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      
      case HapticFeedbackType.WARNING:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      
      case HapticFeedbackType.ERROR:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      
      case HapticFeedbackType.SELECTION:
        await Haptics.selectionAsync();
        break;
      
      case HapticFeedbackType.REFRESH:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // 햅틱 피드백 실패 시 무시 (사용자 경험에 영향 없음)
    console.warn('Haptic feedback failed:', error);
  }
}

/**
 * 편의 함수들
 * 자주 사용되는 햅틱 피드백에 대한 단축 함수
 */

export const hapticLight = (enabled = true) => 
  triggerHaptic(HapticFeedbackType.LIGHT, enabled);

export const hapticMedium = (enabled = true) => 
  triggerHaptic(HapticFeedbackType.MEDIUM, enabled);

export const hapticHeavy = (enabled = true) => 
  triggerHaptic(HapticFeedbackType.HEAVY, enabled);

export const hapticSuccess = (enabled = true) => 
  triggerHaptic(HapticFeedbackType.SUCCESS, enabled);

export const hapticWarning = (enabled = true) => 
  triggerHaptic(HapticFeedbackType.WARNING, enabled);

export const hapticError = (enabled = true) => 
  triggerHaptic(HapticFeedbackType.ERROR, enabled);

export const hapticSelection = (enabled = true) => 
  triggerHaptic(HapticFeedbackType.SELECTION, enabled);

export const hapticRefresh = (enabled = true) => 
  triggerHaptic(HapticFeedbackType.REFRESH, enabled);

/**
 * 상호작용 타입별 햅틱 피드백 매핑
 * 다양한 UI 상호작용에 적절한 햅틱 피드백 제공
 */
export const InteractionHaptics = {
  // 버튼 및 터치 상호작용
  buttonPress: () => hapticLight(),
  buttonPressImportant: () => hapticMedium(),
  buttonPressDestructive: () => hapticHeavy(),
  
  // 선택 및 토글
  toggle: () => hapticSelection(),
  select: () => hapticSelection(),
  deselect: () => hapticLight(),
  
  // 테마 및 설정 변경
  themeChange: () => hapticMedium(),
  settingChange: () => hapticLight(),
  
  // 데이터 및 네트워크
  refresh: () => hapticRefresh(),
  loadSuccess: () => hapticSuccess(),
  loadError: () => hapticError(),
  
  // 네비게이션
  navigate: () => hapticLight(),
  goBack: () => hapticLight(),
  
  // 경고 및 확인
  confirm: () => hapticMedium(),
  cancel: () => hapticLight(),
  delete: () => hapticHeavy(),
  
  // 입력 및 편집
  textInput: () => hapticLight(),
  formSubmit: () => hapticSuccess(),
  formError: () => hapticError(),
} as const;

/**
 * 햅틱 설정 관리
 * 사용자가 햅틱 피드백 활성화/비활성화 설정
 */
export class HapticSettings {
  private static isEnabled = true;
  
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
  
  static getEnabled(): boolean {
    return this.isEnabled;
  }
  
  static async triggerIfEnabled(type: HapticFeedbackType): Promise<void> {
    await triggerHaptic(type, this.isEnabled);
  }
} 