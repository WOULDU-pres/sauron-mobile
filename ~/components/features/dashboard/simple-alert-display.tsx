import React from "react";
import { View, ScrollView, RefreshControl, Pressable } from "react-native";
import { Card } from "../../primitives/card";
import { Badge } from "../../primitives/badge";
import { ThemedText } from "../../utils/ThemedText";
import { CommonIcon } from "~/components/utils/common-icon";
import { useSSEAlerts } from "../../../hooks/useSSEAlerts";

interface SimpleAlertDisplayProps {
  className?: string;
}

export const SimpleAlertDisplay: React.FC<SimpleAlertDisplayProps> = ({
  className = "",
}) => {
  const { alerts, connectionState, connect, clearAlerts, sendTestAlert } =
    useSSEAlerts();

  const getConnectionStatusColor = () => {
    if (connectionState.isConnected) return "#10b981"; // green
    if (connectionState.isConnecting) return "#f59e0b"; // yellow
    if (connectionState.connectionError) return "#ef4444"; // red
    return "#6b7280"; // gray
  };

  const getConnectionStatusText = () => {
    if (connectionState.isConnected) return "연결됨";
    if (connectionState.isConnecting) return "연결 중...";
    if (connectionState.connectionError) return "연결 실패";
    return "연결 안됨";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <CommonIcon name="x-circle" size={16} color="#ef4444" />;
      case "warning":
        return <CommonIcon name="bell" size={16} color="#f59e0b" />;
      case "success":
        return <CommonIcon name="check" size={16} color="#10b981" />;
      default:
        return <CommonIcon name="bell" size={16} color="#3b82f6" />;
    }
  };

  const handleTestAlert = async () => {
    try {
      await sendTestAlert("모바일 대시보드에서 테스트 알림입니다.");
    } catch (error) {
      console.error("Failed to send test alert:", error);
    }
  };

  const handleRefresh = () => {
    if (!connectionState.isConnected && !connectionState.isConnecting) {
      connect();
    }
  };

  return (
    <View className={`flex-1 ${className}`}>
      {/* 연결 상태 헤더 */}
      <Card className="mb-4">
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center space-x-2">
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getConnectionStatusColor() }}
            />
            <ThemedText className="font-medium">실시간 알림 스트림</ThemedText>
            <Badge variant="outline">
              <ThemedText className="text-xs">
                {getConnectionStatusText()}
              </ThemedText>
            </Badge>
          </View>

          <View className="flex-row space-x-2">
            {connectionState.isConnected && (
              <Pressable onPress={handleTestAlert}>
                <Badge variant="outline">
                  <ThemedText className="text-xs">테스트</ThemedText>
                </Badge>
              </Pressable>
            )}

            <Pressable onPress={clearAlerts}>
              <Badge variant="outline">
                <ThemedText className="text-xs">전체 삭제</ThemedText>
              </Badge>
            </Pressable>
          </View>
        </View>

        {connectionState.connectionError && (
          <View className="mx-4 mb-4 p-3 bg-red-50 rounded-lg">
            <View className="flex-row items-center space-x-2">
              <CommonIcon name="x-circle" size={16} color="#ef4444" />
              <ThemedText className="text-red-700 text-sm">
                연결 오류: {connectionState.connectionError}
              </ThemedText>
            </View>
            {connectionState.retryCount > 0 && (
              <ThemedText className="text-red-600 text-xs mt-1">
                재시도 횟수: {connectionState.retryCount}
              </ThemedText>
            )}
          </View>
        )}
      </Card>

      {/* 알림 목록 */}
      <Card className="flex-1">
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText className="text-lg font-semibold">
              실시간 알림 ({alerts.length})
            </ThemedText>

            {alerts.length > 0 && (
              <Badge variant="secondary">
                <ThemedText className="text-xs">
                  최근 {Math.min(alerts.length, 50)}개
                </ThemedText>
              </Badge>
            )}
          </View>

          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={connectionState.isConnecting}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {alerts.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <CommonIcon name="bell" size={48} color="#9ca3af" />
                <ThemedText className="text-gray-500 text-center mt-4">
                  {connectionState.isConnected
                    ? "실시간 알림을 대기 중입니다."
                    : "알림 서버에 연결되지 않았습니다."}
                </ThemedText>
                {!connectionState.isConnected &&
                  !connectionState.isConnecting && (
                    <Pressable onPress={handleRefresh} className="mt-3">
                      <Badge variant="outline">
                        <ThemedText className="text-xs">다시 연결</ThemedText>
                      </Badge>
                    </Pressable>
                  )}
              </View>
            ) : (
              <View className="space-y-3">
                {alerts.map((alert, index) => (
                  <Card
                    key={`${alert.id}-${index}`}
                    className="border-l-4 border-l-blue-500"
                  >
                    <View className="p-3">
                      <View className="flex-row items-center space-x-2 mb-2">
                        {getSeverityIcon(alert.severity)}
                        <ThemedText className="font-medium flex-1">
                          {alert.title}
                        </ThemedText>
                        <Badge variant="outline">
                          <ThemedText className="text-xs">
                            {alert.type}
                          </ThemedText>
                        </Badge>
                      </View>

                      <ThemedText className="text-gray-700 mb-2">
                        {alert.message}
                      </ThemedText>

                      <View className="flex-row items-center space-x-4">
                        <ThemedText className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString("ko-KR")}
                        </ThemedText>

                        {alert.channel && (
                          <Badge variant="outline">
                            <ThemedText className="text-xs">
                              {alert.channel}
                            </ThemedText>
                          </Badge>
                        )}

                        {alert.status && (
                          <Badge variant="outline">
                            <ThemedText className="text-xs">
                              {alert.status}
                            </ThemedText>
                          </Badge>
                        )}
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Card>
    </View>
  );
};
