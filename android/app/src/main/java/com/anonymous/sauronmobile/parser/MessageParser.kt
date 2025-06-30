package com.anonymous.sauronmobile.parser

import android.app.Notification
import android.os.Bundle
import android.util.Log
import com.anonymous.sauronmobile.security.CryptoUtils
import com.anonymous.sauronmobile.security.PrivacyUtils
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

/**
 * 카카오톡 알림 메시지 고도화 파서
 */
class MessageParser {
    
    companion object {
        private const val TAG = "MessageParser"
        private const val KAKAO_PACKAGE_NAME = "com.kakao.talk"
    }

    /**
     * 알림 데이터 파싱
     */
    fun parseNotification(
        extras: Bundle,
        packageName: String,
        timestamp: Long
    ): JSONObject? {
        
        if (packageName != KAKAO_PACKAGE_NAME) {
            Log.d(TAG, "Skipping non-KakaoTalk notification: $packageName")
            return null
        }
        
        return try {
            val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
            val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: text
            
            // 비식별화 처리
            val titleResult = PrivacyUtils.anonymizeText(title)
            val textResult = PrivacyUtils.anonymizeText(bigText)
            
            // JSON 데이터 생성
            JSONObject().apply {
                put("id", CryptoUtils.generateSecureId())
                put("packageName", packageName)
                put("title", titleResult.processedText)
                put("message", textResult.processedText)
                put("timestamp", timestamp)
                put("formattedTime", SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date(timestamp)))
                put("hasPersonalInfo", titleResult.hasPersonalInfo || textResult.hasPersonalInfo)
                put("privacyTypes", (titleResult.detectedTypes + textResult.detectedTypes).distinct().joinToString(","))
                put("isAnnouncement", isAnnouncementMessage(bigText))
                put("roomName", extractRoomName(title))
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to parse notification", e)
            null
        }
    }

    /**
     * 공지 메시지 탐지
     */
    private fun isAnnouncementMessage(message: String): Boolean {
        val lowerMessage = message.lowercase()
        val keywords = setOf("공지", "공고", "알림", "이벤트", "안내")
        return keywords.any { keyword ->
            lowerMessage.contains(keyword)
        }
    }

    /**
     * 방 이름 추출
     */
    private fun extractRoomName(title: String): String {
        return when {
            title.contains(":") -> title.split(":")[0].trim()
            title.contains("에서") -> title.replace("에서", "").trim()
            else -> title.trim()
        }
    }
}
