/**
 * Message API Service for Sauron Mobile
 * Handles transmission of notification messages to the Spring Boot API server
 */

import httpClient, { ApiError } from './httpClient';
import { API_CONFIG } from '../../../constants/ApiConfig';
import type { NotificationData } from '~/types/NotificationBridge';

// Import shared utilities and constants
import { 
  StringUtils, 
  DateTimeUtils, 
  CryptoUtils,
  PerformanceUtils 
} from '@shared/utils';
import { 
  ERROR_CODES, 
  HTTP_STATUS,
  MESSAGE_CONSTANTS 
} from '@shared/constants';

// Request/Response types for API communication
export interface MessageTransmissionRequest {
  messageId: string;
  chatRoomId: string;
  chatRoomName: string;
  senderHash: string;
  content: string;
  timestamp: string;
  messageType?: keyof typeof MESSAGE_CONSTANTS.TYPES;
  metadata?: {
    deviceId?: string;
    appVersion?: string;
    originalTitle?: string;
  };
}

export interface MessageTransmissionResponse {
  success: boolean;
  messageId: string;
  transmissionId: string;
  analysisResult?: {
    detectedType: keyof typeof MESSAGE_CONSTANTS.TYPES;
    confidence: number;
    reason: string;
  };
  timestamp: string;
  processingTimeMs: number;
}

export interface TransmissionError extends ApiError {
  messageId?: string;
  retryable: boolean;
}

/**
 * Convert NotificationData to API request format
 */
export function convertNotificationToApiRequest(
  notification: NotificationData,
  deviceId?: string,
  appVersion?: string
): MessageTransmissionRequest {
  // Create anonymized sender hash
  const senderHash = createSenderHash(notification.title);
  
  // Extract chat room info
  const chatRoomName = notification.roomName || extractRoomFromTitle(notification.title);
  const chatRoomId = notification.packageName + ':' + chatRoomName;

  return {
    messageId: notification.id,
    chatRoomId,
    chatRoomName,
    senderHash,
    content: notification.message,
    timestamp: notification.formattedTime,
    messageType: notification.isAnnouncement ? MESSAGE_CONSTANTS.TYPES.ANNOUNCEMENT : MESSAGE_CONSTANTS.TYPES.NORMAL,
    metadata: {
      deviceId,
      appVersion,
      originalTitle: notification.title,
    },
  };
}

/**
 * Create anonymized hash for sender identification using shared utilities
 */
function createSenderHash(title: string): string {
  // Extract sender name from title (format: "SenderName: message" or "SenderName님")
  let senderName = 'unknown';
  
  if (title.includes(':')) {
    senderName = StringUtils.safeTrim(title.split(':')[0]);
  } else {
    const nameMatch = title.match(/([가-힣a-zA-Z0-9]+)님/);
    if (nameMatch) {
      senderName = nameMatch[1];
    }
  }
  
  // Use shared crypto utility for consistent hashing
  return CryptoUtils.simpleHash(senderName);
}

/**
 * Extract room name from notification title
 */
function extractRoomFromTitle(title: string): string {
  // This might need adjustment based on actual KakaoTalk notification format
  // For now, return a placeholder
  return 'unknown_room';
}

/**
 * Message transmission service class
 */
class MessageService {
  /**
   * Transmit a single message to the server
   */
  async transmitMessage(
    notification: NotificationData,
    options?: {
      deviceId?: string;
      appVersion?: string;
      timeout?: number;
    }
  ): Promise<MessageTransmissionResponse> {
    try {
      const request = convertNotificationToApiRequest(
        notification,
        options?.deviceId,
        options?.appVersion
      );

      const startTime = Date.now();
      
      const response = await httpClient.post<MessageTransmissionResponse>(
        API_CONFIG.ENDPOINTS.MESSAGES,
        request,
        {
          timeout: options?.timeout || API_CONFIG.TIMEOUT,
        }
      );

      // Validate response structure
      if (!response.success || !response.messageId) {
        throw this.createTransmissionError(
          ERROR_CODES.INVALID_FORMAT,
          'Server returned invalid response format',
          notification.id,
          false
        );
      }

      // Log successful transmission
      const processingTime = Date.now() - startTime;
      console.log(`Message ${notification.id} transmitted successfully in ${processingTime}ms`);

      return response;
    } catch (error) {
      // Convert and re-throw as TransmissionError
      throw this.handleTransmissionError(error, notification.id);
    }
  }

  /**
   * Transmit multiple messages in batch
   */
  async transmitMessageBatch(
    notifications: NotificationData[],
    options?: {
      deviceId?: string;
      appVersion?: string;
      concurrency?: number;
    }
  ): Promise<{
    successful: MessageTransmissionResponse[];
    failed: { notification: NotificationData; error: TransmissionError }[];
  }> {
    const concurrency = options?.concurrency || 3;
    const successful: MessageTransmissionResponse[] = [];
    const failed: { notification: NotificationData; error: TransmissionError }[] = [];

    // Process in batches to avoid overwhelming the server
    for (let i = 0; i < notifications.length; i += concurrency) {
      const batch = notifications.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async (notification) => {
        try {
          const result = await this.transmitMessage(notification, options);
          successful.push(result);
        } catch (error) {
          failed.push({
            notification,
            error: error as TransmissionError,
          });
        }
      });

      await Promise.allSettled(batchPromises);
    }

    return { successful, failed };
  }

  /**
   * Check server health and connectivity
   */
  async checkServerHealth(): Promise<boolean> {
    try {
      // Attempt a lightweight request to check server connectivity
      await httpClient.get('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      console.warn('Server health check failed:', error);
      return false;
    }
  }

  /**
   * Handle transmission errors and convert to standardized format
   */
  private handleTransmissionError(error: any, messageId: string): TransmissionError {
    if (error.code) {
      // Already an ApiError from httpClient
      return {
        ...error,
        messageId,
        retryable: this.isRetryableError(error),
      };
    }

    // Generic error
    return this.createTransmissionError(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      error.message || 'Unknown transmission error',
      messageId,
      false
    );
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: ApiError): boolean {
    // Network errors and server errors (5xx) are typically retryable
    // Authentication errors (401) and client errors (4xx) are typically not retryable
    const retryableCodes = [ERROR_CODES.SERVICE_UNAVAILABLE, ERROR_CODES.INTERNAL_SERVER_ERROR];
    const retryableStatusCodes = [
      HTTP_STATUS.INTERNAL_SERVER_ERROR, 
      HTTP_STATUS.BAD_GATEWAY, 
      HTTP_STATUS.SERVICE_UNAVAILABLE, 
      HTTP_STATUS.GATEWAY_TIMEOUT,
      408, // Request Timeout
      HTTP_STATUS.TOO_MANY_REQUESTS
    ];

    return (
      retryableCodes.includes(error.code) ||
      (typeof error.statusCode === 'number' && retryableStatusCodes.includes(error.statusCode))
    );
  }

  /**
   * Create standardized transmission error
   */
  private createTransmissionError(
    code: string,
    message: string,
    messageId: string,
    retryable: boolean,
    statusCode?: number,
    userInfo?: any
  ): TransmissionError {
    return {
      code,
      message,
      messageId,
      retryable,
      statusCode,
      userInfo,
    };
  }
}

// Export singleton instance
const messageService = new MessageService();
export default messageService;