import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
  
  return {
    ...config,
    name: isProduction ? 'Sauron Mobile' : 'Sauron Mobile (Dev)',
    slug: 'sauron-mobile',
    version: process.env.EXPO_VERSION || '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'sauronmobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    owner: process.env.EXPO_OWNER || 'sauron-team',
    runtimeVersion: {
      policy: 'appVersion'
    },
    updates: {
      url: process.env.EXPO_UPDATE_URL || 'https://u.expo.dev/your-project-id'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: isProduction 
        ? 'com.sauronteam.sauronmobile' 
        : 'com.sauronteam.sauronmobile.dev',
      buildNumber: process.env.EXPO_IOS_BUILD_NUMBER || '1'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      edgeToEdgeEnabled: true,
      package: isProduction 
        ? 'com.sauronteam.sauronmobile' 
        : 'com.sauronteam.sauronmobile.dev',
      versionCode: parseInt(process.env.EXPO_ANDROID_VERSION_CODE || '1'),
      permissions: ['NOTIFICATIONS', 'BIND_NOTIFICATION_LISTENER_SERVICE']
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        }
      ],
      [
        'expo-updates',
        {
          username: process.env.EXPO_OWNER || 'sauron-team'
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      apiBaseUrl,
      environment: isProduction ? 'production' : 'development',
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || 'your-project-id'
      }
    }
  };
};