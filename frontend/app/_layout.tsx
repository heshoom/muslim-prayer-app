import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { ensureAndroidPrayerChannel } from '@/src/services/prayerNotificationService';

import { SettingsProvider, useSettings } from '@/src/contexts/SettingsContext';
import { PrayerTimesProvider } from '@/src/contexts/PrayerTimesContext';
import { NotificationProvider } from '@/src/contexts/NotificationContext';


function RootLayoutNav() {
  const { isDarkMode, settings } = useSettings() as any;
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Ensure Android notification channel is created at app startup
    ensureAndroidPrayerChannel();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
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
      <PrayerTimesProvider>
        <NotificationProvider>
          <RootLayoutNav />
        </NotificationProvider>
      </PrayerTimesProvider>
    </SettingsProvider>
  );
}
