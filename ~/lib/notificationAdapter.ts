/**
 * NotificationBridge 데이터를 DetectedMessage 형태로 변환하는 어댑터
 */

import type { NotificationData } from '~/types/NotificationBridge';
import type { DetectedMessage, AnnouncementRequest } from '~/types/detection-log';

/**
 * NotificationData를 DetectedMessage로 변환
 */
export function convertNotificationToDetectedMessage(
  notificationData: NotificationData
): DetectedMessage {
  // 메시지 타입 추론 (AI 분석이 없으므로 키워드 기반으로 추론)
  const messageType = inferMessageType(notificationData);
  
  // 신뢰도 점수 계산 (단순 버전)
  const confidence = calculateConfidence(notificationData, messageType);
  
  // 탐지 이유 생성
  const reason = generateDetectionReason(notificationData, messageType);

  return {
    id: parseInt(notificationData.id.slice(-6), 16), // ID를 숫자로 변환
    type: messageType,
    content: notificationData.message,
    timestamp: notificationData.formattedTime,
    author: extractAuthorFromTitle(notificationData.title),
    chatroom: notificationData.roomName || '알 수 없음',
    confidence,
    reason,
    aiReason: `실시간 알림 분석: ${messageType} 패턴 탐지`,
    isSelected: false,
  };
}

/**
 * NotificationData를 AnnouncementRequest로 변환 (공지사항인 경우)
 */
export function convertNotificationToAnnouncement(
  notificationData: NotificationData
): AnnouncementRequest | null {
  if (!notificationData.isAnnouncement) {
    return null;
  }

  return {
    id: parseInt(notificationData.id.slice(-6), 16),
    title: '실시간 공지사항',
    content: notificationData.message,
    timestamp: notificationData.formattedTime,
    status: '대기',
    room: notificationData.roomName,
  };
}

/**
 * 메시지 타입 추론 (키워드 기반)
 */
function inferMessageType(notificationData: NotificationData): DetectedMessage['type'] {
  const message = notificationData.message.toLowerCase();
  const title = notificationData.title.toLowerCase();
  const combinedText = `${message} ${title}`;

  // 공지사항인 경우 정상으로 분류
  if (notificationData.isAnnouncement) {
    return '정상';
  }

  // 광고 패턴 체크
  const adKeywords = [
    '할인', '세일', '특가', '무료', '이벤트', '프로모션', 
    '구매', '주문', '투자', '수익', '돈', '💰', '📈',
    '지금', '바로', '즉시', '무료체험', '100%'
  ];
  
  if (adKeywords.some(keyword => combinedText.includes(keyword))) {
    return '광고';
  }

  // 도배 패턴 체크
  const repeatPattern = /(.)\1{4,}/; // 같은 문자 5개 이상 반복
  const shortRepeats = /^(.{1,10})\1{2,}$/.test(message); // 짧은 패턴 3회 이상 반복
  
  if (repeatPattern.test(message) || shortRepeats) {
    return '도배';
  }

  // 분쟁 패턴 체크
  const conflictKeywords = [
    '욕', '신고', '싫어', '화나', '짜증', '기분나쁘', 
    '그만', '멈춰', '안해', '하지마', '기분 나쁘'
  ];
  
  if (conflictKeywords.some(keyword => combinedText.includes(keyword))) {
    return '분쟁';
  }

  // 기본값: 정상
  return '정상';
}

/**
 * 신뢰도 점수 계산
 */
function calculateConfidence(
  notificationData: NotificationData, 
  messageType: DetectedMessage['type']
): number {
  let baseConfidence = 50;
  const message = notificationData.message.toLowerCase();

  switch (messageType) {
    case '광고':
      // 광고 키워드 개수에 따라 신뢰도 증가
      const adKeywords = ['할인', '무료', '투자', '수익', '💰'];
      const adMatches = adKeywords.filter(keyword => message.includes(keyword)).length;
      baseConfidence = Math.min(95, 60 + (adMatches * 15));
      break;
      
    case '도배':
      // 반복 패턴 강도에 따라 신뢰도 결정
      const repeatPattern = /(.)\1{10,}/.test(message);
      baseConfidence = repeatPattern ? 95 : 80;
      break;
      
    case '분쟁':
      // 감정적 표현의 강도
      const strongConflictWords = ['신고', '기분나쁘'];
      const hasStrongWords = strongConflictWords.some(word => message.includes(word));
      baseConfidence = hasStrongWords ? 85 : 70;
      break;
      
    case '정상':
      // 일반적인 대화 패턴
      const normalPatterns = ['안녕', '감사', '수고', '좋네요'];
      const hasNormalPattern = normalPatterns.some(pattern => message.includes(pattern));
      baseConfidence = hasNormalPattern ? 95 : 75;
      break;
  }

  // 메시지 길이 고려 (너무 짧거나 길면 신뢰도 감소)
  if (message.length < 5 || message.length > 200) {
    baseConfidence = Math.max(baseConfidence - 10, 30);
  }

  return Math.round(baseConfidence * 10) / 10; // 소수점 1자리
}

/**
 * 탐지 이유 생성
 */
function generateDetectionReason(
  notificationData: NotificationData, 
  messageType: DetectedMessage['type']
): string {
  switch (messageType) {
    case '광고':
      return '광고성 키워드와 홍보 문구가 감지되었습니다.';
    case '도배':
      return '동일한 문자나 패턴의 반복적 사용이 감지되었습니다.';
    case '분쟁':
      return '부정적 감정 표현이나 갈등 상황이 감지되었습니다.';
    case '정상':
      return notificationData.isAnnouncement 
        ? '공지사항으로 분류된 정상 메시지입니다.'
        : '일반적인 대화 패턴으로 판단됩니다.';
    default:
      return '알 수 없는 패턴입니다.';
  }
}

/**
 * 제목에서 작성자 추출
 */
function extractAuthorFromTitle(title: string): string {
  // "작성자명: 메시지" 패턴에서 작성자 추출
  if (title.includes(':')) {
    const author = title.split(':')[0].trim();
    return author || '알 수 없음';
  }
  
  // "작성자님" 패턴
  const nameMatch = title.match(/([가-힣a-zA-Z0-9]+)님/);
  if (nameMatch) {
    return nameMatch[1];
  }
  
  return '알 수 없음';
}

/**
 * 실시간 알림을 위한 배치 변환
 */
export function convertNotificationBatch(
  notifications: NotificationData[]
): {
  messages: DetectedMessage[];
  announcements: AnnouncementRequest[];
} {
  const messages: DetectedMessage[] = [];
  const announcements: AnnouncementRequest[] = [];

  notifications.forEach(notification => {
    // 공지사항 처리
    const announcement = convertNotificationToAnnouncement(notification);
    if (announcement) {
      announcements.push(announcement);
    }
    
    // 모든 알림을 메시지로도 처리
    const message = convertNotificationToDetectedMessage(notification);
    messages.push(message);
  });

  return {
    messages: messages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    announcements: announcements.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  };
}

/**
 * 알림 타입별 통계
 */
export function getNotificationStats(notifications: NotificationData[]): {
  total: number;
  byType: Record<DetectedMessage['type'], number>;
  announcements: number;
  lastUpdate: string;
} {
  const messages = notifications.map(convertNotificationToDetectedMessage);
  const byType = messages.reduce((acc, message) => {
    acc[message.type] = (acc[message.type] || 0) + 1;
    return acc;
  }, {} as Record<DetectedMessage['type'], number>);

  return {
    total: notifications.length,
    byType: {
      '광고': byType['광고'] || 0,
      '도배': byType['도배'] || 0,
      '분쟁': byType['분쟁'] || 0,
      '정상': byType['정상'] || 0,
    },
    announcements: notifications.filter(n => n.isAnnouncement).length,
    lastUpdate: notifications.length > 0 
      ? notifications[0].formattedTime 
      : new Date().toLocaleString()
  };
} 