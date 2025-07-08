/**
 * 화이트리스트 관련 타입 정의
 */

// Import shared types
import type { 
  WhitelistItem,
  WhitelistRequest,
  BaseFilter,
  PaginatedResponse,
  ID,
  Timestamp
} from '@shared/types';

// Mobile-specific whitelist word interface extends shared WhitelistItem
export interface WhitelistWord extends WhitelistItem {
  // Additional mobile-specific fields
  usageCount: number;
  lastUsedAt?: string;
}

export type WhitelistWordType = "GENERAL" | "SENDER" | "CONTENT_PATTERN";

// Use shared WhitelistRequest types
export interface CreateWhitelistRequest extends WhitelistRequest {
  // Mobile-specific create request fields if any
}

export interface UpdateWhitelistRequest extends Partial<WhitelistRequest> {
  // Mobile-specific update request fields if any
}

export interface WhitelistStatistics {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  byType: Record<WhitelistWordType, number>;
  recentlyUsed: number;
  topUsed: WhitelistWord[];
}

// Use shared BaseFilter for search parameters
export interface WhitelistSearchParams extends BaseFilter {
  word?: string;
  wordType?: WhitelistWordType;
  isActive?: boolean;
}

// Use shared PaginatedResponse for paginated results
export interface WhitelistPage extends PaginatedResponse<WhitelistWord> {
  // Mobile-specific page fields if any
}
