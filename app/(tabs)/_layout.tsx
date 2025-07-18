import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '~/components/utils/HapticTab';
import TabBarBackground from '~/components/utils/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { useTheme } from '@/~/lib/theme-context';
import { colors } from '@/~/lib/tokens';

// Lucide React Native compatible icons
import { LayoutGrid, BarChart2, FileText, User, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.customPurple,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '대시보드',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: '리포트',
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="detection-log"
        options={{
          title: '감지로그',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="operations"
        options={{
          title: '운영관리',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
