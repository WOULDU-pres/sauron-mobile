/**
 * useDetectedMessageLog - DetectedMessageLogBox를 위한 커스텀 훅
 * 다양한 타입의 데이터를 LogBoxItem 형태로 변환하고 관리
 */

import { useMemo, useCallback } from 'react';
import type { 
  LogBoxItem, 
  MessageLogBoxItem, 
  AnnouncementLogBoxItem, 
  ChatroomLogBoxItem 
} from '~/components/composed/detected-message-log-box';
import type { DetectedMessage, AnnouncementRequest } from '~/types/detection-log';

// ===== 타입 정의 =====
export interface DashboardChatroom {
  name: string;
  members: number;
  lastActivity: string;
  status: string;
}

export interface UseDetectedMessageLogOptions {
  maxItems?: number;
  compact?: boolean;
  showActions?: boolean;
}

export interface UseDetectedMessageLogReturn {
  // 변환된 데이터
  convertMessagesToLogBoxItems: (messages: DetectedMessage[]) => MessageLogBoxItem[];
  convertAnnouncementsToLogBoxItems: (announcements: AnnouncementRequest[]) => AnnouncementLogBoxItem[];
  convertChatroomsToLogBoxItems: (chatrooms: DashboardChatroom[]) => ChatroomLogBoxItem[];
  
  // 유틸리티 함수들
  filterLogBoxItems: (items: LogBoxItem[], searchQuery?: string) => LogBoxItem[];
  sortLogBoxItems: (items: LogBoxItem[], sortBy?: 'newest' | 'oldest' | 'type') => LogBoxItem[];
  
  // 액션 핸들러들
  handleItemPress: (item: LogBoxItem, onItemPress?: (item: LogBoxItem) => void) => void;
  handleActionPress: (item: LogBoxItem, action: string, onActionPress?: (item: LogBoxItem, action: string) => void) => void;
}

// ===== 메인 훅 =====
export const useDetectedMessageLog = (
  options: UseDetectedMessageLogOptions = {}
): UseDetectedMessageLogReturn => {
  
  // ===== 데이터 변환 함수들 =====
  const convertMessagesToLogBoxItems = useCallback((messages: DetectedMessage[]): MessageLogBoxItem[] => {
    return messages.map((message): MessageLogBoxItem => ({
      id: message.id,
      type: 'message',
      messageType: message.type,
      content: message.content,
      room: message.chatroom || '알 수 없음',
      timestamp: message.timestamp,
      author: message.author,
      confidence: message.confidence,
    }));
  }, []);

  const convertAnnouncementsToLogBoxItems = useCallback((announcements: AnnouncementRequest[]): AnnouncementLogBoxItem[] => {
    return announcements.map((announcement): AnnouncementLogBoxItem => ({
      id: announcement.id,
      type: 'announcement',
      title: announcement.title,
      content: announcement.content,
      room: announcement.room || '전체',
      status: announcement.status,
      timestamp: announcement.timestamp,
    }));
  }, []);

  const convertChatroomsToLogBoxItems = useCallback((chatrooms: DashboardChatroom[]): ChatroomLogBoxItem[] => {
    return chatrooms.map((chatroom, index): ChatroomLogBoxItem => ({
      id: `chatroom-${index}`,
      type: 'chatroom',
      name: chatroom.name,
      members: chatroom.members,
      lastActivity: chatroom.lastActivity,
      status: chatroom.status,
    }));
  }, []);

  // ===== 유틸리티 함수들 =====
  const filterLogBoxItems = useCallback((items: LogBoxItem[], searchQuery?: string): LogBoxItem[] => {
    if (!searchQuery || searchQuery.trim() === '') {
      return items;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return items.filter((item) => {
      switch (item.type) {
        case 'message':
          return item.content.toLowerCase().includes(query) ||
                 item.room.toLowerCase().includes(query) ||
                 item.messageType.toLowerCase().includes(query) ||
                 (item.author && item.author.toLowerCase().includes(query));
        
        case 'announcement':
          return item.content.toLowerCase().includes(query) ||
                 item.room.toLowerCase().includes(query) ||
                 (item.title && item.title.toLowerCase().includes(query));
        
        case 'chatroom':
          return item.name.toLowerCase().includes(query) ||
                 item.status.toLowerCase().includes(query);
        
        default:
          return false;
      }
    });
  }, []);

  const sortLogBoxItems = useCallback((items: LogBoxItem[], sortBy: 'newest' | 'oldest' | 'type' = 'newest'): LogBoxItem[] => {
    const sortedItems = [...items];
    
    switch (sortBy) {
      case 'newest':
        return sortedItems.sort((a, b) => {
          // 타입별 우선순위: message > announcement > chatroom
          const typeOrder = { message: 0, announcement: 1, chatroom: 2 };
          const aOrder = typeOrder[a.type];
          const bOrder = typeOrder[b.type];
          
          if (aOrder !== bOrder) {
            return aOrder - bOrder;
          }
          
          // 같은 타입이면 ID 역순 (최신 먼저)
          const aId = typeof a.id === 'string' ? parseInt(a.id.replace(/\D/g, '')) || 0 : a.id;
          const bId = typeof b.id === 'string' ? parseInt(b.id.replace(/\D/g, '')) || 0 : b.id;
          return bId - aId;
        });
      
      case 'oldest':
        return sortedItems.sort((a, b) => {
          const aId = typeof a.id === 'string' ? parseInt(a.id.replace(/\D/g, '')) || 0 : a.id;
          const bId = typeof b.id === 'string' ? parseInt(b.id.replace(/\D/g, '')) || 0 : b.id;
          return aId - bId;
        });
      
      case 'type':
        return sortedItems.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
          }
          const aId = typeof a.id === 'string' ? parseInt(a.id.replace(/\D/g, '')) || 0 : a.id;
          const bId = typeof b.id === 'string' ? parseInt(b.id.replace(/\D/g, '')) || 0 : b.id;
          return bId - aId;
        });
      
      default:
        return sortedItems;
    }
  }, []);

  // ===== 액션 핸들러들 =====
  const handleItemPress = useCallback((item: LogBoxItem, onItemPress?: (item: LogBoxItem) => void) => {
    console.log(`[useDetectedMessageLog] Item pressed:`, { type: item.type, id: item.id });
    onItemPress?.(item);
  }, []);

  const handleActionPress = useCallback((
    item: LogBoxItem, 
    action: string, 
    onActionPress?: (item: LogBoxItem, action: string) => void
  ) => {
    console.log(`[useDetectedMessageLog] Action pressed:`, { 
      type: item.type, 
      id: item.id, 
      action 
    });
    onActionPress?.(item, action);
  }, []);

  // ===== 반환값 =====
  return {
    convertMessagesToLogBoxItems,
    convertAnnouncementsToLogBoxItems,
    convertChatroomsToLogBoxItems,
    filterLogBoxItems,
    sortLogBoxItems,
    handleItemPress,
    handleActionPress,
  };
};

export default useDetectedMessageLog; 