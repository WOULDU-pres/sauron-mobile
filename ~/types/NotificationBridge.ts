/**
 * NotificationBridge TypeScript Interface
 * Android NotificationListenerService와 React Native 간 통신을 위한 타입 정의
 */

/**
 * 카카오톡 알림 데이터 타입
 */
export interface NotificationData {
  /** 고유 ID */
  id: string;
  /** 패키지명 (com.kakao.talk) */
  packageName: string;
  /** 알림 제목 (비식별화 처리됨) */
  title: string;
  /** 메시지 내용 (비식별화 처리됨) */
  message: string;
  /** 부가 텍스트 */
  subText: string;
  /** 타임스탬프 (milliseconds) */
  timestamp: number;
  /** 포맷된 시간 문자열 */
  formattedTime: string;
  /** 공지/이벤트 메시지 여부 */
  isAnnouncement: boolean;
  /** 채팅방 이름 (비식별화 처리됨) */
  roomName: string;
}

/**
 * NotificationBridge 모듈 인터페이스
 */
export interface NotificationBridgeInterface {
  /**
   * NotificationListener 권한 확인
   * @returns Promise<boolean> 권한 활성화 여부
   */
  checkNotificationPermission(): Promise<boolean>;

  /**
   * NotificationListener 설정 화면 열기
   * @returns Promise<boolean> 성공 여부
   */
  openNotificationSettings(): Promise<boolean>;

  /**
   * 감시 대상 채팅방 설정
   * @param rooms 감시할 채팅방 이름 배열
   * @returns Promise<boolean> 설정 성공 여부
   */
  setWatchedRooms(rooms: string[]): Promise<boolean>;

  /**
   * 감시 대상 채팅방 조회
   * @returns Promise<string[]> 설정된 채팅방 목록
   */
  getWatchedRooms(): Promise<string[]>;

  /**
   * NotificationListener 서비스 시작
   * @returns Promise<boolean> 시작 성공 여부
   */
  startNotificationListener(): Promise<boolean>;

  /**
   * 로컬에 저장된 알림 데이터 조회
   * @returns Promise<NotificationData[]> 저장된 알림 목록
   */
  getStoredNotifications(): Promise<NotificationData[]>;

  /**
   * 로컬 저장된 알림 데이터 삭제
   * @returns Promise<boolean> 삭제 성공 여부
   */
  clearStoredNotifications(): Promise<boolean>;

  /**
   * 상수 객체
   */
  getConstants(): {
    EVENT_NOTIFICATION_RECEIVED: string;
  };
}

/**
 * NotificationBridge 이벤트 타입
 */
export interface NotificationBridgeEvents {
  /**
   * 새로운 알림 수신 이벤트
   */
  NotificationReceived: (data: NotificationData) => void;
}

/**
 * React Native 모듈 선언
 */
declare module 'react-native' {
  interface NativeModulesStatic {
    NotificationBridge: NotificationBridgeInterface;
  }
}

/**
 * NotificationBridge 에러 타입
 */
export interface NotificationBridgeError {
  code: string;
  message: string;
  userInfo?: any;
}

/**
 * 알림 필터 설정 타입
 */
export interface NotificationFilter {
  /** 감시 대상 채팅방 키워드 */
  watchedKeywords: string[];
  /** 공지/이벤트 키워드 */
  announcementKeywords: string[];
  /** 제외할 키워드 */
  excludeKeywords: string[];
  /** 활성화 여부 */
  enabled: boolean;
}

/**
 * 서비스 상태 타입
 */
export interface NotificationServiceStatus {
  /** 권한 활성화 여부 */
  permissionGranted: boolean;
  /** 서비스 실행 여부 */
  serviceRunning: boolean;
  /** 마지막 활동 시간 */
  lastActivity: number;
  /** 처리된 알림 수 */
  processedCount: number;
} 