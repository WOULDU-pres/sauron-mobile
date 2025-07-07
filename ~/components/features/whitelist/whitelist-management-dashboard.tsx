import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { Card } from "~/components/primitives/card";
import { Badge } from "~/components/primitives/badge";
import { Switch } from "~/components/primitives/switch";
import { Button } from "~/components/primitives/button";
import { CommonIcon } from "~/components/utils/CommonIcon";
import {
  useWhitelistManagement,
  useWhitelistSummary,
} from "~/hooks/useWhitelistManagement";
import type {
  WhitelistWord,
  WhitelistWordType,
  WhitelistSearchParams,
} from "~/types/whitelist";

/**
 * 화이트리스트 관리 대시보드 컴포넌트
 */
export const WhitelistManagementDashboard: React.FC = () => {
  const {
    whitelists,
    loading,
    error,
    fetchWhitelists,
    deleteWhitelist,
    toggleWhitelistStatus,
    clearError,
  } = useWhitelistManagement();

  const { summary } = useWhitelistSummary();

  // 검색 및 필터 상태
  const [searchParams, setSearchParams] = useState<WhitelistSearchParams>({
    page: 0,
    size: 20,
    sort: "priority",
    direction: "desc",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWhitelist, setEditingWhitelist] =
    useState<WhitelistWord | null>(null);

  /**
   * 검색 파라미터 업데이트
   */
  const updateSearchParams = (newParams: Partial<WhitelistSearchParams>) => {
    const updated = { ...searchParams, ...newParams, page: 0 }; // 검색 시 첫 페이지로
    setSearchParams(updated);
    fetchWhitelists(updated);
  };

  /**
   * 페이지 변경
   */
  const changePage = (newPage: number) => {
    const updated = { ...searchParams, page: newPage };
    setSearchParams(updated);
    fetchWhitelists(updated);
  };

  /**
   * 화이트리스트 삭제 확인
   */
  const handleDeleteWhitelist = (whitelist: WhitelistWord) => {
    Alert.alert(
      "화이트리스트 삭제",
      `"${whitelist.word}" 항목을 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWhitelist(whitelist.id);
              Alert.alert("성공", "화이트리스트가 삭제되었습니다.");
            } catch (error) {
              Alert.alert("오류", "삭제 중 오류가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  /**
   * 활성화 상태 토글
   */
  const handleToggleStatus = async (whitelist: WhitelistWord) => {
    try {
      await toggleWhitelistStatus(whitelist.id, !whitelist.isActive);
    } catch (error) {
      Alert.alert("오류", "상태 변경 중 오류가 발생했습니다.");
    }
  };

  /**
   * 단어 타입 배지 색상
   */
  const getWordTypeBadgeVariant = (type: WhitelistWordType) => {
    switch (type) {
      case "GENERAL":
        return "default";
      case "SENDER":
        return "secondary";
      case "CONTENT_PATTERN":
        return "destructive";
      default:
        return "outline";
    }
  };

  /**
   * 단어 타입 텍스트
   */
  const getWordTypeText = (type: WhitelistWordType) => {
    switch (type) {
      case "GENERAL":
        return "일반";
      case "SENDER":
        return "발신자";
      case "CONTENT_PATTERN":
        return "패턴";
      default:
        return type;
    }
  };

  /**
   * 현재 목록
   */
  const currentWhitelists = whitelists?.content || [];

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-2xl font-bold text-gray-900">
            화이트리스트 관리
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            예외 단어 및 패턴을 관리합니다
          </Text>
        </View>
        <Button
          onPress={() => setShowCreateModal(true)}
          variant="default"
          size="sm"
          className="flex-row items-center"
        >
          <CommonIcon name="plus" size={16} color="white" />
          <Text className="text-white font-medium ml-1">추가</Text>
        </Button>
      </View>

      {/* 통계 카드 */}
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Card className="flex-1 min-w-[140px] p-4">
          <Text className="text-2xl font-bold text-blue-600">
            {summary.total}
          </Text>
          <Text className="text-sm text-gray-600">전체</Text>
        </Card>
        <Card className="flex-1 min-w-[140px] p-4">
          <Text className="text-2xl font-bold text-green-600">
            {summary.active}
          </Text>
          <Text className="text-sm text-gray-600">활성화</Text>
        </Card>
        <Card className="flex-1 min-w-[140px] p-4">
          <Text className="text-2xl font-bold text-gray-600">
            {summary.inactive}
          </Text>
          <Text className="text-sm text-gray-600">비활성화</Text>
        </Card>
        <Card className="flex-1 min-w-[140px] p-4">
          <Text className="text-2xl font-bold text-purple-600">
            {summary.recentlyUsed}
          </Text>
          <Text className="text-sm text-gray-600">최근 사용</Text>
        </Card>
      </View>

      {/* 검색 및 필터 */}
      <Card className="p-4 mb-4">
        <Text className="text-lg font-semibold mb-3">검색 및 필터</Text>

        {/* 검색어 입력 */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-gray-700 mb-1">
            단어 검색
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            placeholder="검색할 단어를 입력하세요"
            value={searchParams.word || ""}
            onChangeText={(text) =>
              updateSearchParams({ word: text || undefined })
            }
          />
        </View>

        {/* 타입 필터 */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            단어 타입
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              { value: undefined, label: "전체" },
              { value: "GENERAL" as WhitelistWordType, label: "일반" },
              { value: "SENDER" as WhitelistWordType, label: "발신자" },
              { value: "CONTENT_PATTERN" as WhitelistWordType, label: "패턴" },
            ].map((option) => (
              <Pressable
                key={option.label}
                onPress={() => updateSearchParams({ wordType: option.value })}
                className={`px-3 py-1 rounded-full border ${
                  searchParams.wordType === option.value
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm ${
                    searchParams.wordType === option.value
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 활성화 상태 필터 */}
        <View className="mb-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            활성화 상태
          </Text>
          <View className="flex-row gap-4">
            {[
              { value: undefined, label: "전체" },
              { value: true, label: "활성화" },
              { value: false, label: "비활성화" },
            ].map((option) => (
              <Pressable
                key={option.label}
                onPress={() => updateSearchParams({ isActive: option.value })}
                className={`px-3 py-1 rounded-full border ${
                  searchParams.isActive === option.value
                    ? "bg-green-500 border-green-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm ${
                    searchParams.isActive === option.value
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>

      {/* 에러 메시지 */}
      {error && (
        <Card className="p-4 mb-4 bg-red-50 border-red-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <CommonIcon name="x-circle" size={16} color="red" />
              <Text className="text-red-700 ml-2 flex-1">{error}</Text>
            </View>
            <Pressable onPress={clearError}>
              <CommonIcon name="x" size={16} color="red" />
            </Pressable>
          </View>
        </Card>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <Card className="p-8">
          <View className="items-center">
            <Text className="text-gray-600">로딩 중...</Text>
          </View>
        </Card>
      )}

      {/* 화이트리스트 목록 */}
      {!loading && currentWhitelists.length === 0 ? (
        <Card className="p-8">
          <View className="items-center">
            <CommonIcon name="list" size={48} color="gray" />
            <Text className="text-gray-600 text-lg mt-4">
              화이트리스트가 없습니다
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              새 화이트리스트를 추가해보세요
            </Text>
          </View>
        </Card>
      ) : (
        <View className="space-y-3">
          {currentWhitelists.map((whitelist) => (
            <Card key={whitelist.id} className="p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  {/* 단어 및 타입 */}
                  <View className="flex-row items-center mb-2">
                    <Text className="text-lg font-semibold text-gray-900 mr-2">
                      {whitelist.word}
                    </Text>
                    <Badge
                      variant={getWordTypeBadgeVariant(whitelist.wordType)}
                    >
                      {getWordTypeText(whitelist.wordType)}
                    </Badge>
                    {whitelist.isRegex && (
                      <Badge variant="outline" className="ml-1">
                        정규식
                      </Badge>
                    )}
                    {whitelist.isCaseSensitive && (
                      <Badge variant="outline" className="ml-1">
                        대소문자
                      </Badge>
                    )}
                  </View>

                  {/* 설명 */}
                  {whitelist.description && (
                    <Text className="text-gray-600 mb-2">
                      {whitelist.description}
                    </Text>
                  )}

                  {/* 메타 정보 */}
                  <View className="flex-row items-center space-x-4">
                    <Text className="text-xs text-gray-500">
                      우선순위: {whitelist.priority}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      사용 횟수: {whitelist.usageCount}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      생성자: {whitelist.createdBy}
                    </Text>
                  </View>
                </View>

                {/* 액션 버튼 */}
                <View className="flex-row items-center space-x-2 ml-4">
                  {/* 활성화/비활성화 스위치 */}
                  <Switch
                    checked={whitelist.isActive}
                    onCheckedChange={() => handleToggleStatus(whitelist)}
                  />

                  {/* 편집 버튼 */}
                  <Pressable
                    onPress={() => setEditingWhitelist(whitelist)}
                    className="p-2 rounded-lg bg-blue-50"
                  >
                    <CommonIcon name="edit" size={16} color="blue" />
                  </Pressable>

                  {/* 삭제 버튼 */}
                  <Pressable
                    onPress={() => handleDeleteWhitelist(whitelist)}
                    className="p-2 rounded-lg bg-red-50"
                  >
                    <CommonIcon name="trash" size={16} color="red" />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* 페이지네이션 */}
      {whitelists && whitelists.totalPages > 1 && (
        <Card className="p-4 mt-4">
          <View className="flex-row items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onPress={() => changePage(searchParams.page! - 1)}
              disabled={whitelists.first}
            >
              이전
            </Button>

            <Text className="text-gray-600">
              {whitelists.number + 1} / {whitelists.totalPages}
            </Text>

            <Button
              variant="outline"
              size="sm"
              onPress={() => changePage(searchParams.page! + 1)}
              disabled={whitelists.last}
            >
              다음
            </Button>
          </View>
        </Card>
      )}

      {/* 생성/편집 모달 (향후 구현) */}
      {(showCreateModal || editingWhitelist) && (
        <Text className="text-center text-gray-500 p-4">
          생성/편집 모달 구현 예정
        </Text>
      )}
    </ScrollView>
  );
};
