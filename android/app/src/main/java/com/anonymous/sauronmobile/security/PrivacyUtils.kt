package com.anonymous.sauronmobile.security

import android.util.Log
import java.util.regex.Pattern

/**
 * 개인정보 보호를 위한 비식별화 처리 유틸리티
 * 다양한 패턴의 개인정보를 탐지하고 안전하게 마스킹 처리
 */
object PrivacyUtils {
    
    private const val TAG = "PrivacyUtils"
    
    // 정규식 패턴들
    private val phonePatterns = listOf(
        Pattern.compile("(\\d{3}[-.]?\\d{4}[-.]?\\d{4})"), // 010-1234-5678, 01012345678
        Pattern.compile("(\\d{2,3}[-.]?\\d{3,4}[-.]?\\d{4})"), // 02-123-4567, 031-1234-5678
        Pattern.compile("(\\+82[-.]?\\d{1,2}[-.]?\\d{3,4}[-.]?\\d{4})") // +82-10-1234-5678
    )
    
    private val emailPatterns = listOf(
        Pattern.compile("([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})"),
        Pattern.compile("([가-힣a-zA-Z0-9._%+-]+[@][가-힣a-zA-Z0-9.-]+[.][가-힣a-zA-Z]{2,})")
    )
    
    private val personalInfoPatterns = listOf(
        // 주민등록번호 패턴
        Pattern.compile("(\\d{6}[-.]?\\d{7})"),
        // 신용카드 번호 패턴
        Pattern.compile("(\\d{4}[-.]?\\d{4}[-.]?\\d{4}[-.]?\\d{4})"),
        // 계좌번호 패턴 (10-20자리)
        Pattern.compile("(\\d{10,20})"),
        // 이름 패턴 (한글 2-5자 + 님)
        Pattern.compile("([가-힣]{2,5}\\s*님)"),
        // 주소 패턴
        Pattern.compile("([가-힣0-9\\s]+[시도군구]\\s+[가-힣0-9\\s]+[동읍면리]\\s+[가-힣0-9\\s-]+)"),
        // IP 주소 패턴
        Pattern.compile("(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})")
    )
    
    private val sensitiveKeywords = setOf(
        "비밀번호", "password", "패스워드", "암호",
        "주민번호", "주민등록번호", "생년월일",
        "카드번호", "계좌번호", "통장번호",
        "집주소", "회사주소", "주소",
        "개인정보", "민감정보"
    )

    /**
     * 종합적인 비식별화 처리
     */
    fun anonymizeText(text: String): AnonymizationResult {
        if (text.isBlank()) {
            return AnonymizationResult(text, false, emptyList())
        }
        
        var processedText = text
        val detectedTypes = mutableListOf<String>()
        var hasPersonalInfo = false
        
        try {
            // 1. 전화번호 마스킹
            phonePatterns.forEach { pattern ->
                if (pattern.matcher(processedText).find()) {
                    processedText = pattern.matcher(processedText).replaceAll("***-****-****")
                    detectedTypes.add("PHONE")
                    hasPersonalInfo = true
                }
            }
            
            // 2. 이메일 마스킹
            emailPatterns.forEach { pattern ->
                if (pattern.matcher(processedText).find()) {
                    processedText = pattern.matcher(processedText).replaceAll("***@***.***")
                    detectedTypes.add("EMAIL")
                    hasPersonalInfo = true
                }
            }
            
            // 3. 기타 개인정보 마스킹
            personalInfoPatterns.forEach { pattern ->
                val matcher = pattern.matcher(processedText)
                if (matcher.find()) {
                    processedText = when {
                        // 주민등록번호
                        matcher.group().matches(Regex("\\d{6}[-.]?\\d{7}")) -> {
                            detectedTypes.add("SSN")
                            hasPersonalInfo = true
                            matcher.replaceAll("******-*******")
                        }
                        // 신용카드 번호
                        matcher.group().matches(Regex("\\d{4}[-.]?\\d{4}[-.]?\\d{4}[-.]?\\d{4}")) -> {
                            detectedTypes.add("CARD")
                            hasPersonalInfo = true
                            matcher.replaceAll("****-****-****-****")
                        }
                        // 계좌번호
                        matcher.group().matches(Regex("\\d{10,20}")) -> {
                            detectedTypes.add("ACCOUNT")
                            hasPersonalInfo = true
                            matcher.replaceAll("***********")
                        }
                        // 이름 패턴
                        matcher.group().contains("님") -> {
                            detectedTypes.add("NAME")
                            hasPersonalInfo = true
                            matcher.replaceAll("***님")
                        }
                        // IP 주소
                        matcher.group().matches(Regex("\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}")) -> {
                            detectedTypes.add("IP")
                            hasPersonalInfo = true
                            matcher.replaceAll("***.***.***.***")
                        }
                        else -> processedText
                    }
                }
            }
            
            // 4. 민감 키워드 확인
            val lowerText = processedText.lowercase()
            sensitiveKeywords.forEach { keyword ->
                if (lowerText.contains(keyword.lowercase())) {
                    detectedTypes.add("SENSITIVE_KEYWORD")
                    hasPersonalInfo = true
                    // 키워드 자체는 마스킹하지 않고 탐지만 표시
                }
            }
            
            // 5. 연속된 숫자 패턴 마스킹 (7자리 이상)
            val numberPattern = Pattern.compile("\\d{7,}")
            if (numberPattern.matcher(processedText).find()) {
                processedText = numberPattern.matcher(processedText).replaceAll("*******")
                detectedTypes.add("LONG_NUMBER")
                hasPersonalInfo = true
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error during anonymization", e)
        }
        
        return AnonymizationResult(processedText, hasPersonalInfo, detectedTypes.distinct())
    }

    /**
     * 특정 카테고리별 마스킹
     */
    fun maskByCategory(text: String, category: MaskingCategory): String {
        return when (category) {
            MaskingCategory.PHONE_ONLY -> maskPhones(text)
            MaskingCategory.EMAIL_ONLY -> maskEmails(text)
            MaskingCategory.NAME_ONLY -> maskNames(text)
            MaskingCategory.ALL_NUMBERS -> maskNumbers(text)
            MaskingCategory.CONSERVATIVE -> conservativeMasking(text)
            MaskingCategory.AGGRESSIVE -> aggressiveMasking(text)
        }
    }

    /**
     * 전화번호만 마스킹
     */
    private fun maskPhones(text: String): String {
        var result = text
        phonePatterns.forEach { pattern ->
            result = pattern.matcher(result).replaceAll("***-****-****")
        }
        return result
    }

    /**
     * 이메일만 마스킹
     */
    private fun maskEmails(text: String): String {
        var result = text
        emailPatterns.forEach { pattern ->
            result = pattern.matcher(result).replaceAll("***@***.***")
        }
        return result
    }

    /**
     * 이름만 마스킹
     */
    private fun maskNames(text: String): String {
        val namePattern = Pattern.compile("([가-힣]{2,5}\\s*님)")
        return namePattern.matcher(text).replaceAll("***님")
    }

    /**
     * 모든 숫자 마스킹
     */
    private fun maskNumbers(text: String): String {
        val numberPattern = Pattern.compile("\\d{4,}")
        return numberPattern.matcher(text).replaceAll("****")
    }

    /**
     * 보수적 마스킹 (명확한 개인정보만)
     */
    private fun conservativeMasking(text: String): String {
        var result = text
        result = maskPhones(result)
        result = maskEmails(result)
        
        // 주민등록번호
        val ssnPattern = Pattern.compile("\\d{6}[-.]?\\d{7}")
        result = ssnPattern.matcher(result).replaceAll("******-*******")
        
        return result
    }

    /**
     * 적극적 마스킹 (의심되는 모든 정보)
     */
    private fun aggressiveMasking(text: String): String {
        var result = anonymizeText(text).processedText
        
        // 추가: 3자리 이상 연속 숫자 마스킹
        val numberPattern = Pattern.compile("\\d{3,}")
        result = numberPattern.matcher(result).replaceAll("***")
        
        // 추가: 영문 이메일 형태 패턴 마스킹
        val emailLikePattern = Pattern.compile("[a-zA-Z0-9]{3,}@[a-zA-Z0-9]{3,}")
        result = emailLikePattern.matcher(result).replaceAll("***@***")
        
        return result
    }

    /**
     * 개인정보 포함 여부만 검사 (마스킹 없이)
     */
    fun containsPersonalInfo(text: String): PersonalInfoDetection {
        val detectedTypes = mutableListOf<String>()
        var riskLevel = RiskLevel.LOW
        
        // 전화번호 검사
        phonePatterns.forEach { pattern ->
            if (pattern.matcher(text).find()) {
                detectedTypes.add("PHONE")
                riskLevel = RiskLevel.HIGH
            }
        }
        
        // 이메일 검사
        emailPatterns.forEach { pattern ->
            if (pattern.matcher(text).find()) {
                detectedTypes.add("EMAIL")
                riskLevel = RiskLevel.MEDIUM
            }
        }
        
        // 기타 개인정보 검사
        personalInfoPatterns.forEach { pattern ->
            if (pattern.matcher(text).find()) {
                detectedTypes.add("PERSONAL_ID")
                riskLevel = RiskLevel.HIGH
            }
        }
        
        // 민감 키워드 검사
        val lowerText = text.lowercase()
        sensitiveKeywords.forEach { keyword ->
            if (lowerText.contains(keyword.lowercase())) {
                detectedTypes.add("SENSITIVE_KEYWORD")
                if (riskLevel == RiskLevel.LOW) riskLevel = RiskLevel.MEDIUM
            }
        }
        
        return PersonalInfoDetection(
            hasPersonalInfo = detectedTypes.isNotEmpty(),
            detectedTypes = detectedTypes.distinct(),
            riskLevel = riskLevel,
            confidence = calculateConfidence(detectedTypes.size)
        )
    }

    /**
     * 신뢰도 계산
     */
    private fun calculateConfidence(detectionCount: Int): Double {
        return when (detectionCount) {
            0 -> 1.0
            1 -> 0.8
            2 -> 0.9
            else -> 0.95
        }
    }

    /**
     * 비식별화 결과 데이터 클래스
     */
    data class AnonymizationResult(
        val processedText: String,
        val hasPersonalInfo: Boolean,
        val detectedTypes: List<String>
    )

    /**
     * 개인정보 탐지 결과 데이터 클래스
     */
    data class PersonalInfoDetection(
        val hasPersonalInfo: Boolean,
        val detectedTypes: List<String>,
        val riskLevel: RiskLevel,
        val confidence: Double
    )

    /**
     * 위험도 레벨
     */
    enum class RiskLevel {
        LOW, MEDIUM, HIGH
    }

    /**
     * 마스킹 카테고리
     */
    enum class MaskingCategory {
        PHONE_ONLY,
        EMAIL_ONLY,
        NAME_ONLY,
        ALL_NUMBERS,
        CONSERVATIVE,
        AGGRESSIVE
    }
} 