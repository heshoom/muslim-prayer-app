import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsProvider, useSettings } from '@/src/contexts/SettingsContext';
import { NotificationProvider } from '@/src/contexts/NotificationContext';
import { PrayerTimesProvider } from '@/src/contexts/PrayerTimesContext';

function RootLayoutNav() {
  const { isDarkMode, settings } = useSettings() as any;
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  const initial = settings?.onboarding?.completed ? '(tabs)' : 'welcome';

  return (
    <SafeAreaProvider>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName={initial}>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <NotificationProvider>
        <PrayerTimesProvider>
          <RootLayoutNav />
        </PrayerTimesProvider>
      </NotificationProvider>
    </SettingsProvider>
  );
}
