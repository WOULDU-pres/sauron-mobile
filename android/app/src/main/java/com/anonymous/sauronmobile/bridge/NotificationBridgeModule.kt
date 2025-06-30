package com.anonymous.sauronmobile.bridge

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONObject

/**
 * NotificationListener React Native 브릿지 모듈
 * Native Android와 React Native 간 NotificationListener 데이터를 전달합니다.
 */
class NotificationBridgeModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val MODULE_NAME = "NotificationBridge"
        private const val EVENT_NOTIFICATION_RECEIVED = "NotificationReceived"
        private const val TAG = "NotificationBridgeModule"
        
        // 싱글톤 인스턴스 (서비스에서 접근하기 위해)
        @Volatile
        private var instance: NotificationBridgeModule? = null
        
        /**
         * 서비스에서 이벤트 전송을 위한 정적 메서드
         */
        fun sendNotificationEvent(data: JSONObject) {
            instance?.emitNotificationEvent(data)
        }
    }

    init {
        instance = this
    }

    override fun getName(): String = MODULE_NAME

    /**
     * React Native로 상수 전달
     */
    override fun getConstants(): MutableMap<String, Any> {
        return hashMapOf(
            "EVENT_NOTIFICATION_RECEIVED" to EVENT_NOTIFICATION_RECEIVED
        )
    }

    /**
     * NotificationListener 권한 확인
     */
    @ReactMethod
    fun checkNotificationPermission(promise: Promise) {
        try {
            val isEnabled = isNotificationServiceEnabled()
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", "Failed to check notification permission", e)
        }
    }

    /**
     * NotificationListener 설정 화면으로 이동
     */
    @ReactMethod
    fun openNotificationSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_OPEN_ERROR", "Failed to open notification settings", e)
        }
    }

    /**
     * 감시 대상 채팅방 설정 저장
     */
    @ReactMethod
    fun setWatchedRooms(rooms: ReadableArray, promise: Promise) {
        try {
            val roomList = mutableListOf<String>()
            for (i in 0 until rooms.size()) {
                rooms.getString(i)?.let { room ->
                    roomList.add(room)
                }
            }
            
            // SharedPreferences에 저장
            val sharedPref = reactContext.getSharedPreferences("notification_settings", Context.MODE_PRIVATE)
            val editor = sharedPref.edit()
            editor.putStringSet("watched_rooms", roomList.toSet())
            editor.apply()
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_SAVE_ERROR", "Failed to save watched rooms", e)
        }
    }

    /**
     * 감시 대상 채팅방 설정 조회
     */
    @ReactMethod
    fun getWatchedRooms(promise: Promise) {
        try {
            val sharedPref = reactContext.getSharedPreferences("notification_settings", Context.MODE_PRIVATE)
            val watchedRooms = sharedPref.getStringSet("watched_rooms", emptySet()) ?: emptySet()
            
            val array = Arguments.createArray()
            watchedRooms.forEach { room ->
                array.pushString(room)
            }
            
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("SETTINGS_LOAD_ERROR", "Failed to load watched rooms", e)
        }
    }

    /**
     * 서비스 시작
     */
    @ReactMethod
    fun startNotificationListener(promise: Promise) {
        try {
            if (!isNotificationServiceEnabled()) {
                promise.reject("PERMISSION_DENIED", "Notification listener permission not granted")
                return
            }
            
            // 서비스는 자동으로 시작되므로 권한만 확인
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_START_ERROR", "Failed to start notification listener", e)
        }
    }

    /**
     * 로컬에 저장된 알림 데이터 조회
     */
    @ReactMethod
    fun getStoredNotifications(promise: Promise) {
        try {
            val sharedPref = reactContext.getSharedPreferences("kakao_notifications", Context.MODE_PRIVATE)
            val allEntries = sharedPref.all
            
            val notifications = Arguments.createArray()
            allEntries.entries.forEach { entry ->
                if (entry.key.startsWith("notification_")) {
                    try {
                        val jsonData = JSONObject(entry.value as String)
                        val notificationMap = jsonObjectToWritableMap(jsonData)
                        notifications.pushMap(notificationMap)
                    } catch (e: Exception) {
                        // 잘못된 데이터는 무시
                    }
                }
            }
            
            promise.resolve(notifications)
        } catch (e: Exception) {
            promise.reject("DATA_LOAD_ERROR", "Failed to load stored notifications", e)
        }
    }

    /**
     * 로컬 저장된 알림 데이터 삭제
     */
    @ReactMethod
    fun clearStoredNotifications(promise: Promise) {
        try {
            val sharedPref = reactContext.getSharedPreferences("kakao_notifications", Context.MODE_PRIVATE)
            val editor = sharedPref.edit()
            
            val allEntries = sharedPref.all
            allEntries.keys.forEach { key ->
                if (key.startsWith("notification_")) {
                    editor.remove(key)
                }
            }
            
            editor.apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("DATA_CLEAR_ERROR", "Failed to clear stored notifications", e)
        }
    }

    /**
     * NotificationListener 서비스 활성화 여부 확인
     */
    private fun isNotificationServiceEnabled(): Boolean {
        val pkgName = reactContext.packageName
        val flat = Settings.Secure.getString(
            reactContext.contentResolver,
            Settings.Secure.ENABLED_NOTIFICATION_LISTENERS
        )
        
        if (!TextUtils.isEmpty(flat)) {
            val names = flat.split(":").toTypedArray()
            for (name in names) {
                val componentName = ComponentName.unflattenFromString(name)
                if (componentName != null) {
                    if (TextUtils.equals(pkgName, componentName.packageName)) {
                        return true
                    }
                }
            }
        }
        return false
    }

    /**
     * React Native로 알림 이벤트 전송
     */
    private fun emitNotificationEvent(data: JSONObject) {
        try {
            if (reactContext.hasActiveCatalystInstance()) {
                val params = jsonObjectToWritableMap(data)
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(EVENT_NOTIFICATION_RECEIVED, params)
            }
        } catch (e: Exception) {
            android.util.Log.e(TAG, "Failed to emit notification event", e)
        }
    }

    /**
     * JSONObject를 WritableMap으로 변환
     */
    private fun jsonObjectToWritableMap(jsonObject: JSONObject): WritableMap {
        val map = Arguments.createMap()
        
        try {
            val iterator = jsonObject.keys()
            while (iterator.hasNext()) {
                val key = iterator.next()
                val value = jsonObject.get(key)
                
                when (value) {
                    is String -> map.putString(key, value)
                    is Int -> map.putInt(key, value)
                    is Double -> map.putDouble(key, value)
                    is Boolean -> map.putBoolean(key, value)
                    is Long -> map.putDouble(key, value.toDouble())
                    else -> map.putString(key, value.toString())
                }
            }
        } catch (e: Exception) {
            android.util.Log.e(TAG, "Error converting JSONObject to WritableMap", e)
        }
        
        return map
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        instance = null
    }
} 