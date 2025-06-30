package com.anonymous.sauronmobile.notification

import android.app.Notification
import android.content.Context
import android.content.Intent
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import androidx.core.app.NotificationCompat
import com.anonymous.sauronmobile.bridge.NotificationBridgeModule
import com.anonymous.sauronmobile.parser.MessageParser
import com.anonymous.sauronmobile.security.CryptoUtils
import com.anonymous.sauronmobile.security.PrivacyUtils
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

/**
 * 카카오톡 NotificationListenerService
 * 카카오톡 오픈채팅 알림을 실시간으로 감지하고 처리합니다.
 */
class KakaoNotificationListenerService : NotificationListenerService() {

    companion object {
        private const val TAG = "KakaoNotificationListener"
        private const val KAKAO_PACKAGE_NAME = "com.kakao.talk"
        
        // 감시 대상 채팅방 설정 (추후 설정 가능하게 변경)
        private val WATCHED_ROOM_KEYWORDS = setOf(
            "오픈채팅",
            "단체방",
            "모임"
        )
        
        // 공지/이벤트 키워드
        private val ANNOUNCEMENT_KEYWORDS = setOf(
            "공지",
            "공고", 
            "알림",
            "이벤트",
            "안내"
        )
    }

    private lateinit var messageParser: MessageParser

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "KakaoNotificationListenerService created")
        
        // 암호화 모듈 초기화
        if (!CryptoUtils.initialize(this)) {
            Log.w(TAG, "Failed to initialize crypto utils")
        }
        
        // 메시지 파서 초기화
        messageParser = MessageParser()
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        
        sbn?.let { notification ->
            try {
                // 카카오톡 패키지만 필터링
                if (notification.packageName == KAKAO_PACKAGE_NAME) {
                    processKakaoNotification(notification)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error processing notification", e)
            }
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
        // 알림 제거 이벤트 처리 (필요시)
    }

    /**
     * 카카오톡 알림 데이터 처리 (고도화된 파서 사용)
     */
    private fun processKakaoNotification(sbn: StatusBarNotification) {
        val notification = sbn.notification
        val extras = notification.extras

        try {
            Log.d(TAG, "Processing notification from package: ${sbn.packageName}")

            // 고도화된 메시지 파서 사용
            val parsedData = messageParser.parseNotification(
                extras = extras,
                packageName = sbn.packageName,
                timestamp = sbn.postTime
            )

            if (parsedData != null) {
                // 감시 대상 방인지 확인
                if (isWatchedRoom(parsedData)) {
                    // React Native로 데이터 전달
                    sendToReactNative(parsedData)
                    
                    Log.i(TAG, "Processed watched room notification: ${parsedData.getString("roomName")}")
                } else {
                    Log.d(TAG, "Notification filtered out: not a watched room")
                }
            } else {
                Log.d(TAG, "Failed to parse notification or not a KakaoTalk notification")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error processing notification", e)
        }
    }

    /**
     * 감시 대상 방인지 확인 (JSON 데이터 기반)
     */
    private fun isWatchedRoom(parsedData: JSONObject): Boolean {
        return try {
            val roomName = parsedData.optString("roomName", "")
            val message = parsedData.optString("message", "")
            val title = parsedData.optString("title", "")
            
            val combinedText = "$roomName $message $title".lowercase()
            
            // 키워드 기반 필터링 (추후 설정 기반으로 변경)
            WATCHED_ROOM_KEYWORDS.any { keyword ->
                combinedText.contains(keyword.lowercase())
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking watched room", e)
            false
        }
    }

    // 기존 메서드들은 MessageParser와 보안 모듈로 대체됨

    /**
     * React Native로 데이터 전달 (고도화된 버전)
     */
    private fun sendToReactNative(data: JSONObject) {
        try {
            // 암호화 적용 (민감한 데이터 보호)
            val encryptedData = applyEncryption(data)
            
            // NotificationBridgeModule을 통해 React Native로 이벤트 전송
            NotificationBridgeModule.sendNotificationEvent(encryptedData)
            
            Log.d(TAG, "Sent notification data to React Native: ${data.getString("id")}")
            
            // 성공 시 개인정보 감사 로그
            if (data.optBoolean("hasPersonalInfo", false)) {
                Log.i(TAG, "Personal info detected and processed safely: ${data.optString("privacyTypes", "")}")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send data to React Native", e)
            
            // 백업: 로컬 저장 또는 재시도 로직
            saveNotificationLocally(data)
        }
    }

    /**
     * 민감한 데이터 암호화 적용
     */
    private fun applyEncryption(data: JSONObject): JSONObject {
        return try {
            if (!CryptoUtils.canEncrypt()) {
                Log.w(TAG, "Encryption not available, sending plain data")
                return data
            }

            val encryptedData = JSONObject(data.toString())
            
            // 개인정보가 포함된 경우 민감한 필드 암호화
            if (data.optBoolean("hasPersonalInfo", false)) {
                val fieldsToEncrypt = listOf("title", "message", "roomName")
                
                fieldsToEncrypt.forEach { field ->
                    val originalValue = data.optString(field, "")
                    if (originalValue.isNotEmpty()) {
                        val encryptedValue = CryptoUtils.encrypt(originalValue)
                        if (encryptedValue != null) {
                            encryptedData.put("encrypted_$field", encryptedValue)
                            encryptedData.put(field, "***ENCRYPTED***")
                        }
                    }
                }
                
                // 암호화 적용 표시
                encryptedData.put("encrypted", true)
                encryptedData.put("encryptionTimestamp", System.currentTimeMillis())
                
                Log.d(TAG, "Applied encryption to personal info fields")
            }
            
            encryptedData
            
        } catch (e: Exception) {
            Log.e(TAG, "Encryption failed, sending original data", e)
            data
        }
    }

    /**
     * 로컬 백업 저장 (React Native 전송 실패시)
     */
    private fun saveNotificationLocally(data: JSONObject) {
        try {
            val sharedPref = getSharedPreferences("kakao_notifications", Context.MODE_PRIVATE)
            val editor = sharedPref.edit()
            val key = "notification_${System.currentTimeMillis()}"
            editor.putString(key, data.toString())
            editor.apply()
            
            Log.d(TAG, "Saved notification locally: $key")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save notification locally", e)
        }
    }

    /**
     * 서비스 상태 확인
     */
    fun isNotificationAccessEnabled(): Boolean {
        return try {
            val enabledListeners = android.provider.Settings.Secure.getString(
                contentResolver, 
                "enabled_notification_listeners"
            )
            val packageName = packageName
            enabledListeners?.contains(packageName) == true
        } catch (e: Exception) {
            Log.e(TAG, "Error checking notification access", e)
            false
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "KakaoNotificationListenerService destroyed")
    }
} 