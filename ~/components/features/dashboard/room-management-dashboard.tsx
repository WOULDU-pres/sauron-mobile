import React, { useState, useEffect } from "react";
import { View, ScrollView, RefreshControl, Pressable } from "react-native";
import { Card } from "../../primitives/card";
import { Badge } from "../../primitives/badge";
import { Button } from "../../primitives/button";
import { ThemedText } from "../../utils/ThemedText";
import { CommonIcon } from "~/components/utils/common-icon";
import { useWatchedChatRooms } from "../../../hooks/useWatchedChatRooms";
import { WatchedChatRoomsModal } from "./watched-chatrooms-modal";
import type { DashboardChatroom } from "~/hooks/useDetectedMessageLog";

interface RoomStats {
  total: number;
  active: number;
  inactive: number;
  recentActivity: number;
}

interface RoomManagementDashboardProps {
  className?: string;
  onRoomSelect?: (room: DashboardChatroom) => void;
}

export const RoomManagementDashboard: React.FC<
  RoomManagementDashboardProps
> = ({ className = "", onRoomSelect }) => {
  const {
    chatrooms,
    isLoading,
    error,
    refreshChatrooms,
    updateChatroom,
    removeChatroom,
  } = useWatchedChatRooms();

  const [selectedRoom, setSelectedRoom] = useState<DashboardChatroom | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 통계 계산
  const stats: RoomStats = React.useMemo(() => {
    const total = chatrooms.length;
    const active = chatrooms.filter((room) => room.status === "활성").length;
    const inactive = total - active;
    const recentActivity = chatrooms.filter(
      (room) =>
        room.lastActivity.includes("분 전") ||
        room.lastActivity.includes("시간 전")
    ).length;

    return { total, active, inactive, recentActivity };
  }, [chatrooms]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshChatrooms();
    } catch (error) {
      console.error("Failed to refresh chatrooms:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRoomPress = (room: DashboardChatroom) => {
    setSelectedRoom(room);
    setModalVisible(true);
    onRoomSelect?.(room);
  };

  const handleModalSave = async (status: any) => {
    if (selectedRoom) {
      try {
        await updateChatroom(selectedRoom.name, {
          status: status.isActive ? "활성" : "비활성",
        });
        setModalVisible(false);
        setSelectedRoom(null);
        // Refresh data after update
        refreshChatrooms();
      } catch (error) {
        console.error("Failed to update chatroom:", error);
      }
    }
  };

  const handleModalRemove = async (roomName: string) => {
    try {
      await removeChatroom(roomName);
      setModalVisible(false);
      setSelectedRoom(null);
      // Refresh data after removal
      refreshChatrooms();
    } catch (error) {
      console.error("Failed to remove chatroom:", error);
    }
  };

  const getStatusColor = (status: string) => {
    return status === "활성" ? "#10b981" : "#6b7280";
  };

  const getActivityIcon = (lastActivity: string) => {
    if (lastActivity.includes("분 전")) {
      return <CommonIcon name="zap" size={14} color="#10b981" />;
    } else if (lastActivity.includes("시간 전")) {
      return <CommonIcon name="bell" size={14} color="#f59e0b" />;
    } else {
      return <CommonIcon name="moon" size={14} color="#6b7280" />;
    }
  };

  return (
    <View className={`flex-1 ${className}`}>
      {/* 통계 카드 */}
      <View className="mb-4">
        <View className="flex-row space-x-3">
          <Card className="flex-1">
            <View className="p-3 items-center">
              <ThemedText className="text-2xl font-bold text-blue-600">
                {stats.total}
              </ThemedText>
              <ThemedText className="text-xs text-gray-500">전체 룸</ThemedText>
            </View>
          </Card>

          <Card className="flex-1">
            <View className="p-3 items-center">
              <ThemedText className="text-2xl font-bold text-green-600">
                {stats.active}
              </ThemedText>
              <ThemedText className="text-xs text-gray-500">활성</ThemedText>
            </View>
          </Card>

          <Card className="flex-1">
            <View className="p-3 items-center">
              <ThemedText className="text-2xl font-bold text-gray-600">
                {stats.inactive}
              </ThemedText>
              <ThemedText className="text-xs text-gray-500">비활성</ThemedText>
            </View>
          </Card>

          <Card className="flex-1">
            <View className="p-3 items-center">
              <ThemedText className="text-2xl font-bold text-orange-600">
                {stats.recentActivity}
              </ThemedText>
              <ThemedText className="text-xs text-gray-500">
                최근 활동
              </ThemedText>
            </View>
          </Card>
        </View>
      </View>

      {/* 룸 목록 */}
      <Card className="flex-1">
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText className="text-lg font-semibold">
              채팅방 관리 ({chatrooms.length})
            </ThemedText>

            <Button
              variant="outline"
              size="sm"
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <ThemedText className="text-xs">
                {refreshing ? "새로고침 중..." : "새로고침"}
              </ThemedText>
            </Button>
          </View>

          {error && (
            <View className="mb-4 p-3 bg-red-50 rounded-lg">
              <View className="flex-row items-center space-x-2">
                <CommonIcon name="x-circle" size={16} color="#ef4444" />
                <ThemedText className="text-red-700 text-sm flex-1">
                  오류: {error.message || "데이터를 불러올 수 없습니다."}
                </ThemedText>
              </View>
            </View>
          )}

          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {isLoading && chatrooms.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <CommonIcon name="lightbulb" size={48} color="#9ca3af" />
                <ThemedText className="text-gray-500 text-center mt-4">
                  채팅방 정보를 불러오는 중...
                </ThemedText>
              </View>
            ) : chatrooms.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <CommonIcon name="user" size={48} color="#9ca3af" />
                <ThemedText className="text-gray-500 text-center mt-4">
                  감시 중인 채팅방이 없습니다.
                </ThemedText>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleRefresh}
                  className="mt-3"
                >
                  <ThemedText className="text-xs">다시 시도</ThemedText>
                </Button>
              </View>
            ) : (
              <View className="space-y-3">
                {chatrooms.map((room, index) => (
                  <Pressable
                    key={`${room.name}-${index}`}
                    onPress={() => handleRoomPress(room)}
                  >
                    <Card
                      className="border-l-4"
                      style={{
                        borderLeftColor: getStatusColor(room.status),
                      }}
                    >
                      <View className="p-4">
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-1 mr-3">
                            <ThemedText className="font-medium text-base mb-1">
                              {room.name}
                            </ThemedText>
                            <View className="flex-row items-center space-x-4">
                              <View className="flex-row items-center space-x-1">
                                <CommonIcon
                                  name="user"
                                  size={12}
                                  color="#6b7280"
                                />
                                <ThemedText className="text-xs text-gray-500">
                                  {room.members.toLocaleString()}명
                                </ThemedText>
                              </View>
                              <View className="flex-row items-center space-x-1">
                                {getActivityIcon(room.lastActivity)}
                                <ThemedText className="text-xs text-gray-500">
                                  {room.lastActivity}
                                </ThemedText>
                              </View>
                            </View>
                          </View>

                          <View className="items-end space-y-2">
                            <Badge
                              variant={
                                room.status === "활성" ? "default" : "secondary"
                              }
                            >
                              <ThemedText className="text-xs font-medium">
                                {room.status}
                              </ThemedText>
                            </Badge>

                            <View className="flex-row items-center space-x-1">
                              <CommonIcon
                                name="chevron-right"
                                size={14}
                                color="#9ca3af"
                              />
                            </View>
                          </View>
                        </View>

                        {room.lastDetection && (
                          <View className="mt-2 p-2 bg-yellow-50 rounded">
                            <ThemedText className="text-xs text-yellow-700">
                              마지막 감지: {room.lastDetection}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </Card>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Card>

      {/* 룸 관리 모달 */}
      <WatchedChatRoomsModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedRoom(null);
        }}
        chatroom={selectedRoom}
        onSave={handleModalSave}
        onRemove={handleModalRemove}
      />
    </View>
  );
};
