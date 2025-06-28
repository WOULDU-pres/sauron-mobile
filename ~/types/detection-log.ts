/**
 * 감지로그 관련 공통 타입 정의
 * 웹과 모바일 간의 일관성을 위한 통합 인터페이스
 */

export interface DetectedMessage {
  id: number;
  type: '광고' | '도배' | '분쟁' | '정상';
  content: string;
  timestamp: string;
  author: string;
  chatroom: string;
  confidence?: number;
  reason?: string;
  aiReason?: string;
  isSelected?: boolean;
}

export interface AnnouncementRequest {
  id: number;
  title: string;
  content: string;
  timestamp: string;
  status: '대기' | '승인' | '거부';
  room?: string;
}

export interface DetectionLogFilters {
  searchQuery: string;
  activeFilter: string;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export interface DetectionLogState {
  messages: DetectedMessage[];
  announcements: AnnouncementRequest[];
  selectedIds: Set<number>;
  isLoading: boolean;
  filters: DetectionLogFilters;
}

export type MessageType = DetectedMessage['type'];
export type AnnouncementStatus = AnnouncementRequest['status']; 