import { useState, useEffect, useCallback } from "react";
import type {
  WhitelistWord,
  CreateWhitelistRequest,
  UpdateWhitelistRequest,
  WhitelistStatistics,
  WhitelistSearchParams,
  WhitelistPage,
  WhitelistWordType,
} from "~/types/whitelist";

/**
 * 화이트리스트 관리를 위한 커스텀 훅
 */
export const useWhitelistManagement = () => {
  const [whitelists, setWhitelists] = useState<WhitelistPage | null>(null);
  const [statistics, setStatistics] = useState<WhitelistStatistics | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 기본 설정
  const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${
      process.env.EXPO_PUBLIC_JWT_TOKEN || "test-token"
    }`,
  });

  /**
   * 에러 핸들링 유틸리티
   */
  const handleError = useCallback((error: unknown, operation: string) => {
    console.error(`Failed to ${operation}:`, error);
    const message =
      error instanceof Error ? error.message : `Failed to ${operation}`;
    setError(message);
    throw new Error(message);
  }, []);

  /**
   * 화이트리스트 목록 조회 (페이징 및 검색)
   */
  const fetchWhitelists = useCallback(
    async (params: WhitelistSearchParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();

        // 검색 조건 설정
        if (params.word) searchParams.append("word", params.word);
        if (params.wordType) searchParams.append("wordType", params.wordType);
        if (params.isActive !== undefined)
          searchParams.append("isActive", params.isActive.toString());
        if (params.page !== undefined)
          searchParams.append("page", params.page.toString());
        if (params.size !== undefined)
          searchParams.append("size", params.size.toString());
        if (params.sort) searchParams.append("sort", params.sort);
        if (params.direction)
          searchParams.append("direction", params.direction);

        const response = await fetch(
          `${API_BASE}/v1/whitelist?${searchParams.toString()}`,
          { headers: getAuthHeaders() }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: WhitelistPage = await response.json();
        setWhitelists(data);
        return data;
      } catch (error) {
        handleError(error, "fetch whitelists");
      } finally {
        setLoading(false);
      }
    },
    [API_BASE, getAuthHeaders, handleError]
  );

  /**
   * 화이트리스트 단일 조회
   */
  const fetchWhitelist = useCallback(
    async (id: number): Promise<WhitelistWord> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/v1/whitelist/${id}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        handleError(error, "fetch whitelist");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [API_BASE, getAuthHeaders, handleError]
  );

  /**
   * 화이트리스트 생성
   */
  const createWhitelist = useCallback(
    async (request: CreateWhitelistRequest): Promise<WhitelistWord> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/v1/whitelist`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const created = await response.json();

        // 목록 새로고침
        await fetchWhitelists();
        await fetchStatistics();

        return created;
      } catch (error) {
        handleError(error, "create whitelist");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [API_BASE, getAuthHeaders, handleError, fetchWhitelists]
  );

  /**
   * 화이트리스트 수정
   */
  const updateWhitelist = useCallback(
    async (
      id: number,
      request: UpdateWhitelistRequest
    ): Promise<WhitelistWord> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/v1/whitelist/${id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const updated = await response.json();

        // 목록 새로고침
        await fetchWhitelists();
        await fetchStatistics();

        return updated;
      } catch (error) {
        handleError(error, "update whitelist");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [API_BASE, getAuthHeaders, handleError, fetchWhitelists]
  );

  /**
   * 화이트리스트 삭제
   */
  const deleteWhitelist = useCallback(
    async (id: number): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/v1/whitelist/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // 목록 새로고침
        await fetchWhitelists();
        await fetchStatistics();
      } catch (error) {
        handleError(error, "delete whitelist");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [API_BASE, getAuthHeaders, handleError, fetchWhitelists]
  );

  /**
   * 화이트리스트 통계 조회
   */
  const fetchStatistics =
    useCallback(async (): Promise<WhitelistStatistics> => {
      try {
        const response = await fetch(`${API_BASE}/v1/whitelist/statistics`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const stats = await response.json();
        setStatistics(stats);
        return stats;
      } catch (error) {
        handleError(error, "fetch statistics");
        throw error;
      }
    }, [API_BASE, getAuthHeaders, handleError]);

  /**
   * 활성화된 화이트리스트 목록 조회
   */
  const fetchActiveWhitelists = useCallback(async (): Promise<
    WhitelistWord[]
  > => {
    try {
      const response = await fetch(`${API_BASE}/v1/whitelist/active`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      handleError(error, "fetch active whitelists");
      throw error;
    }
  }, [API_BASE, getAuthHeaders, handleError]);

  /**
   * 화이트리스트 활성화/비활성화 토글
   */
  const toggleWhitelistStatus = useCallback(
    async (id: number, isActive: boolean): Promise<void> => {
      await updateWhitelist(id, { isActive });
    },
    [updateWhitelist]
  );

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchWhitelists(), fetchStatistics()]);
      } catch (error) {
        console.error("Failed to load initial whitelist data:", error);
      }
    };

    loadInitialData();
  }, []);

  return {
    // Data
    whitelists,
    statistics,
    loading,
    error,

    // Actions
    fetchWhitelists,
    fetchWhitelist,
    createWhitelist,
    updateWhitelist,
    deleteWhitelist,
    fetchStatistics,
    fetchActiveWhitelists,
    toggleWhitelistStatus,

    // Utils
    clearError: () => setError(null),
  };
};

/**
 * 화이트리스트 통계 요약을 위한 헬퍼 훅
 */
export const useWhitelistSummary = () => {
  const { statistics, fetchStatistics } = useWhitelistManagement();

  const summary = {
    total: statistics?.totalCount || 0,
    active: statistics?.activeCount || 0,
    inactive: statistics?.inactiveCount || 0,
    generalCount: statistics?.byType?.GENERAL || 0,
    senderCount: statistics?.byType?.SENDER || 0,
    patternCount: statistics?.byType?.CONTENT_PATTERN || 0,
    recentlyUsed: statistics?.recentlyUsed || 0,
  };

  return {
    summary,
    topUsed: statistics?.topUsed || [],
    refresh: fetchStatistics,
  };
};

/**
 * 화이트리스트 폼 관리를 위한 헬퍼 훅
 */
export const useWhitelistForm = () => {
  const [formData, setFormData] = useState<CreateWhitelistRequest>({
    word: "",
    wordType: "GENERAL",
    description: "",
    isRegex: false,
    isCaseSensitive: false,
    priority: 0,
  });

  const updateField = useCallback(
    <K extends keyof CreateWhitelistRequest>(
      field: K,
      value: CreateWhitelistRequest[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData({
      word: "",
      wordType: "GENERAL",
      description: "",
      isRegex: false,
      isCaseSensitive: false,
      priority: 0,
    });
  }, []);

  const isValid = formData.word.trim().length > 0;

  return {
    formData,
    updateField,
    resetForm,
    isValid,
  };
};
