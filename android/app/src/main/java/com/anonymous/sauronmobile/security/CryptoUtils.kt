package com.anonymous.sauronmobile.security

import android.content.Context
import android.content.SharedPreferences
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import java.security.KeyStore
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * AES-256-GCM 암호화 유틸리티
 * Android Keystore를 활용한 안전한 키 관리 및 암호화 처리
 */
object CryptoUtils {
    
    private const val TAG = "CryptoUtils"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val KEY_ALIAS = "SauronNotificationKey"
    private const val GCM_IV_LENGTH = 12
    private const val GCM_TAG_LENGTH = 16
    
    private var keyStore: KeyStore? = null
    private var secretKey: SecretKey? = null

    /**
     * 암호화 모듈 초기화
     */
    fun initialize(context: Context): Boolean {
        return try {
            keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
            keyStore?.load(null)
            
            // 키가 없으면 생성
            if (!keyStore?.containsAlias(KEY_ALIAS)!!) {
                generateSecretKey()
            }
            
            loadSecretKey()
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize crypto utils", e)
            false
        }
    }

    /**
     * 문자열 암호화
     */
    fun encrypt(plainText: String): String? {
        return try {
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, secretKey)
            
            val iv = cipher.iv
            val encryptedData = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))
            
            // IV + 암호화된 데이터를 Base64로 인코딩
            val combined = iv + encryptedData
            Base64.encodeToString(combined, Base64.DEFAULT)
            
        } catch (e: Exception) {
            Log.e(TAG, "Encryption failed", e)
            null
        }
    }

    /**
     * 문자열 복호화
     */
    fun decrypt(encryptedText: String): String? {
        return try {
            val combined = Base64.decode(encryptedText, Base64.DEFAULT)
            
            // IV와 암호화된 데이터 분리
            val iv = combined.sliceArray(0 until GCM_IV_LENGTH)
            val encryptedData = combined.sliceArray(GCM_IV_LENGTH until combined.size)
            
            val cipher = Cipher.getInstance(TRANSFORMATION)
            val spec = GCMParameterSpec(GCM_TAG_LENGTH * 8, iv)
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
            
            val decryptedData = cipher.doFinal(encryptedData)
            String(decryptedData, Charsets.UTF_8)
            
        } catch (e: Exception) {
            Log.e(TAG, "Decryption failed", e)
            null
        }
    }

    /**
     * 데이터 해시 생성 (일관성 검증용)
     */
    fun generateHash(data: String): String {
        return try {
            val digest = java.security.MessageDigest.getInstance("SHA-256")
            val hash = digest.digest(data.toByteArray(Charsets.UTF_8))
            Base64.encodeToString(hash, Base64.DEFAULT).trim()
        } catch (e: Exception) {
            Log.e(TAG, "Hash generation failed", e)
            ""
        }
    }

    /**
     * 보안 랜덤 ID 생성
     */
    fun generateSecureId(): String {
        val random = SecureRandom()
        val bytes = ByteArray(16)
        random.nextBytes(bytes)
        return Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_WRAP)
    }

    /**
     * Android Keystore에서 SecretKey 생성
     */
    private fun generateSecretKey() {
        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
        val keyGenParameterSpec = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .build()

        keyGenerator.init(keyGenParameterSpec)
        keyGenerator.generateKey()
    }

    /**
     * Android Keystore에서 SecretKey 로드
     */
    private fun loadSecretKey() {
        secretKey = keyStore?.getKey(KEY_ALIAS, null) as SecretKey?
    }

    /**
     * 키 존재 여부 확인
     */
    fun isKeyAvailable(): Boolean {
        return secretKey != null
    }

    /**
     * 암호화 가능 여부 확인
     */
    fun canEncrypt(): Boolean {
        return try {
            isKeyAvailable() && encrypt("test") != null
        } catch (e: Exception) {
            false
        }
    }
} 