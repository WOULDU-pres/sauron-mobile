/**
 * 화이트리스트 관련 타입 정의
 */

export interface WhitelistWord {
  id: number;
  word: string;
  wordType: WhitelistWordType;
  description?: string;
  isRegex: boolean;
  isCaseSensitive: boolean;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  usageCount: number;
  lastUsedAt?: string;
}

export type WhitelistWordType = "GENERAL" | "SENDER" | "CONTENT_PATTERN";

export interface CreateWhitelistRequest {
  word: string;
  wordType?: WhitelistWordType;
  description?: string;
  isRegex?: boolean;
  isCaseSensitive?: boolean;
  priority?: number;
}

export interface UpdateWhitelistRequest {
  word?: string;
  wordType?: WhitelistWordType;
  description?: string;
  isRegex?: boolean;
  isCaseSensitive?: boolean;
  priority?: number;
  isActive?: boolean;
}

export interface WhitelistStatistics {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  byType: Record<WhitelistWordType, number>;
  recentlyUsed: number;
  topUsed: WhitelistWord[];
}

export interface WhitelistSearchParams {
  word?: string;
  wordType?: WhitelistWordType;
  isActive?: boolean;
  page?: number;
  size?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface WhitelistPage {
  content: WhitelistWord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}
