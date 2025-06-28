import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { ThemeProvider, useTheme, createNavigationTheme } from '@/~/lib/theme-context';
import { ToastProvider } from '~/components/composed/toast';

// 내부 컴포넌트: 테마 컨텍스트 접근 가능
function RootLayoutInner() {
  const { isDark, tokens } = useTheme();
  const navigationTheme = createNavigationTheme(isDark, tokens);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <ToastProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ToastProvider>
    </NavigationThemeProvider>
  );
}

// 외부 컴포넌트: 테마 프로바이더 제공
export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
