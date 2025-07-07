import React from "react";
import { View, ScrollView, RefreshControl, Pressable } from "react-native";
import { Card } from "../../primitives/card";
import { Badge } from "../../primitives/badge";
import { ThemedText } from "../../utils/ThemedText";
import { CommonIcon } from "~/components/utils/common-icon";
import { useSSEAlerts } from "../../../hooks/useSSEAlerts";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface RealTimeAlertDisplayProps {
  onTestAlert?: () => void;
  className?: string;
}

export const RealTimeAlertDisplay: React.FC<RealTimeAlertDisplayProps> = ({
  onTestAlert,
  className = "",
}) => {
  const {
    alerts,
    connectionState,
    connect,
    disconnect,
    clearAlerts,
    sendTestAlert,
  } = useSSEAlerts();

  const getConnectionStatusColor = () => {
    if (connectionState.isConnected) return "bg-green-500";
    if (connectionState.isConnecting) return "bg-yellow-500";
    if (connectionState.connectionError) return "bg-red-500";
    return "bg-gray-500";
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

  const getSeverityBadgeVariant = (
    severity: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "success":
        return "default";
      default:
        return "outline";
    }
  };

  const handleTestAlert = async () => {
    try {
      await sendTestAlert("모바일 대시보드에서 테스트 알림입니다.");
      onTestAlert?.();
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
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <View
              className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}
            />
            <ThemedText className="font-medium">실시간 알림 스트림</ThemedText>
            <Badge variant="outline">{getConnectionStatusText()}</Badge>
          </View>

          <View className="flex-row space-x-2">
            {connectionState.isConnected && (
              <Badge
                variant="outline"
                onPress={handleTestAlert}
                className="cursor-pointer"
              >
                <CommonIcon name="Send" size={12} className="mr-1" />
                테스트
              </Badge>
            )}

            <Badge
              variant="outline"
              onPress={clearAlerts}
              className="cursor-pointer"
            >
              <CommonIcon name="Trash2" size={12} className="mr-1" />
              전체 삭제
            </Badge>
          </View>
        </View>

        {connectionState.connectionError && (
          <View className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <View className="flex-row items-center space-x-2">
              <CommonIcon
                name="AlertCircle"
                size={16}
                className="text-red-500"
              />
              <ThemedText className="text-red-700 dark:text-red-300 text-sm">
                연결 오류: {connectionState.connectionError}
              </ThemedText>
            </View>
            {connectionState.retryCount > 0 && (
              <ThemedText className="text-red-600 dark:text-red-400 text-xs mt-1">
                재시도 횟수: {connectionState.retryCount}
              </ThemedText>
            )}
          </View>
        )}

        {connectionState.lastEventTime && (
          <ThemedText className="text-gray-500 text-xs mt-2">
            마지막 이벤트:{" "}
            {formatDistanceToNow(new Date(connectionState.lastEventTime), {
              addSuffix: true,
              locale: ko,
            })}
          </ThemedText>
        )}
      </Card>

      {/* 알림 목록 */}
      <Card className="flex-1">
        <View className="flex-row items-center justify-between mb-4">
          <ThemedText className="text-lg font-semibold">
            실시간 알림 ({alerts.length})
          </ThemedText>

          {alerts.length > 0 && (
            <Badge variant="secondary">
              최근 {Math.min(alerts.length, 50)}개
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
              <CommonIcon
                name="Bell"
                size={48}
                className="text-gray-400 mb-4"
              />
              <ThemedText className="text-gray-500 text-center">
                {connectionState.isConnected
                  ? "실시간 알림을 대기 중입니다."
                  : "알림 서버에 연결되지 않았습니다."}
              </ThemedText>
              {!connectionState.isConnected &&
                !connectionState.isConnecting && (
                  <Badge
                    variant="outline"
                    onPress={handleRefresh}
                    className="mt-3 cursor-pointer"
                  >
                    <CommonIcon name="RefreshCw" size={12} className="mr-1" />
                    다시 연결
                  </Badge>
                )}
            </View>
          ) : (
            <View className="space-y-3">
              {alerts.map((alert, index) => (
                <Card
                  key={`${alert.id}-${index}`}
                  className="border-l-4 border-l-blue-500"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center space-x-2 mb-2">
                        {getSeverityIcon(alert.severity)}
                        <ThemedText className="font-medium">
                          {alert.title}
                        </ThemedText>
                        <Badge
                          variant={getSeverityBadgeVariant(alert.severity)}
                        >
                          {alert.type}
                        </Badge>
                      </View>

                      <ThemedText className="text-gray-700 dark:text-gray-300 mb-2">
                        {alert.message}
                      </ThemedText>

                      <View className="flex-row items-center space-x-4">
                        <View className="flex-row items-center space-x-1">
                          <CommonIcon
                            name="Clock"
                            size={12}
                            className="text-gray-500"
                          />
                          <ThemedText className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(alert.timestamp), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </ThemedText>
                        </View>

                        {alert.channel && (
                          <View className="flex-row items-center space-x-1">
                            <CommonIcon
                              name="Radio"
                              size={12}
                              className="text-gray-500"
                            />
                            <ThemedText className="text-xs text-gray-500">
                              {alert.channel}
                            </ThemedText>
                          </View>
                        )}

                        {alert.status && (
                          <Badge variant="outline" className="text-xs">
                            {alert.status}
                          </Badge>
                        )}
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </Card>
    </View>
  );
};
