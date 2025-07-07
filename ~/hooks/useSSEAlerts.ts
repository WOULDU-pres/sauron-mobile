import { useState, useEffect, useRef, useCallback } from "react";
import { SSEMessage, NotificationMessage } from "../../shared/types/api";

interface SSEAlert {
  id: string;
  type: string;
  severity: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  channel?: string;
  status?: string;
}

interface SSEConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  retryCount: number;
  lastEventTime: string | null;
}

interface UseSSEAlertsOptions {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  clientId?: string;
}

interface UseSSEAlertsReturn {
  alerts: SSEAlert[];
  connectionState: SSEConnectionState;
  connect: () => void;
  disconnect: () => void;
  clearAlerts: () => void;
  sendTestAlert: (message: string) => Promise<void>;
}

const DEFAULT_OPTIONS: Required<UseSSEAlertsOptions> = {
  baseUrl: "http://localhost:8080/v1/stream",
  timeout: 300000, // 5 minutes
  maxRetries: 5,
  retryDelay: 1000, // 1 second
  clientId: "mobile-dashboard",
};

/**
 * SSE 실시간 알림 수신을 위한 커스텀 훅
 * 자동 재연결, 에러 처리, 상태 관리를 포함합니다.
 */
export const useSSEAlerts = (
  options: UseSSEAlertsOptions = {}
): UseSSEAlertsReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const [alerts, setAlerts] = useState<SSEAlert[]>([]);
  const [connectionState, setConnectionState] = useState<SSEConnectionState>({
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    retryCount: 0,
    lastEventTime: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const updateConnectionState = useCallback(
    (updates: Partial<SSEConnectionState>) => {
      setConnectionState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const addAlert = useCallback(
    (alert: SSEAlert) => {
      setAlerts((prev) => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
      updateConnectionState({ lastEventTime: new Date().toISOString() });
    },
    [updateConnectionState]
  );

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= config.maxRetries) {
      updateConnectionState({
        isConnecting: false,
        connectionError: `Failed to connect after ${config.maxRetries} attempts`,
      });
      return;
    }

    const delay = config.retryDelay * Math.pow(2, reconnectAttemptsRef.current);
    console.log(
      `Scheduling reconnect attempt ${
        reconnectAttemptsRef.current + 1
      } in ${delay}ms`
    );

    retryTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [config.maxRetries, config.retryDelay]);

  const disconnect = useCallback(() => {
    console.log("Disconnecting from SSE stream");

    clearRetryTimeout();

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
    updateConnectionState({
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      retryCount: 0,
    });
  }, [clearRetryTimeout, updateConnectionState]);

  const connect = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    updateConnectionState({
      isConnecting: true,
      connectionError: null,
      retryCount: reconnectAttemptsRef.current,
    });

    try {
      const url = new URL("/alerts", config.baseUrl);
      url.searchParams.set("timeout", config.timeout.toString());
      url.searchParams.set("clientId", config.clientId);

      console.log(`Connecting to SSE stream: ${url.toString()}`);

      const eventSource = new EventSource(url.toString());
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connection established");
        reconnectAttemptsRef.current = 0;
        updateConnectionState({
          isConnected: true,
          isConnecting: false,
          connectionError: null,
          retryCount: 0,
        });
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SSEMessage<any>;
          console.log("Received SSE message:", data);

          if (data.event === "connection") {
            console.log("Connection confirmed:", data.data);
          }
        } catch (error) {
          console.warn("Failed to parse SSE message:", error);
        }
      };

      // Handle specific alert events
      eventSource.addEventListener("alert", (event) => {
        try {
          const alertData = JSON.parse(event.data) as SSEAlert;
          console.log("Received alert:", alertData);

          addAlert({
            ...alertData,
            severity: mapSeverity(alertData.severity || "info"),
          });
        } catch (error) {
          console.error("Failed to parse alert data:", error);
        }
      });

      // Handle connection events
      eventSource.addEventListener("connection", (event) => {
        try {
          const connectionData = JSON.parse(event.data);
          console.log("Connection status:", connectionData);
        } catch (error) {
          console.warn("Failed to parse connection data:", error);
        }
      });

      eventSource.onerror = (event) => {
        console.error("SSE connection error:", event);

        const errorMessage =
          eventSource.readyState === EventSource.CLOSED
            ? "Connection closed by server"
            : "Connection error occurred";

        updateConnectionState({
          isConnected: false,
          isConnecting: false,
          connectionError: errorMessage,
        });

        reconnectAttemptsRef.current++;
        scheduleReconnect();
      };
    } catch (error) {
      console.error("Failed to create SSE connection:", error);
      updateConnectionState({
        isConnecting: false,
        connectionError:
          error instanceof Error ? error.message : "Unknown connection error",
      });

      reconnectAttemptsRef.current++;
      scheduleReconnect();
    }
  }, [config, updateConnectionState, addAlert, scheduleReconnect]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const sendTestAlert = useCallback(
    async (message: string): Promise<void> => {
      try {
        const response = await fetch(`${config.baseUrl}/test`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ message }),
        });

        if (!response.ok) {
          throw new Error(`Test alert failed: ${response.statusText}`);
        }

        console.log("Test alert sent successfully");
      } catch (error) {
        console.error("Failed to send test alert:", error);
        throw error;
      }
    },
    [config.baseUrl]
  );

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRetryTimeout();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [clearRetryTimeout]);

  return {
    alerts,
    connectionState,
    connect,
    disconnect,
    clearAlerts,
    sendTestAlert,
  };
};

/**
 * Map backend severity to frontend severity type
 */
function mapSeverity(
  severity: string
): "info" | "warning" | "error" | "success" {
  switch (severity.toLowerCase()) {
    case "high":
    case "critical":
    case "error":
      return "error";
    case "medium":
    case "warning":
    case "warn":
      return "warning";
    case "low":
    case "info":
      return "info";
    case "success":
      return "success";
    default:
      return "info";
  }
}
