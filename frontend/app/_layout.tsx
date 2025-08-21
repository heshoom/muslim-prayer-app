import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsProvider, useSettings } from '../src/contexts/SettingsContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { PrayerTimesProvider } from '../src/contexts/PrayerTimesContext';
import { OnboardingProvider, useOnboarding } from '../src/contexts/OnboardingContext';
import { ensureAndroidPrayerChannel } from '../src/services/prayerNotificationService';

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2980b9" />
    </View>
  );
}

function RootLayoutNav() {
  const { isOnboardingCompleted, isLoading } = useOnboarding();
  const { isDarkMode } = useSettings() as any;
  const segments = useSegments();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Ensure Android notification channel is created at app startup
  useEffect(() => {
    ensureAndroidPrayerChannel();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inOnboardingGroup = segments[0] === 'onboarding';
    
    console.log('Onboarding Debug:', {
      isOnboardingCompleted,
      inOnboardingGroup,
      segments: segments[0],
      isLoading
    });

    if (!isOnboardingCompleted && !inOnboardingGroup) {
      // Redirect to onboarding if not completed
      console.log('Redirecting to onboarding');
      router.replace('/onboarding');
    } else if (isOnboardingCompleted && inOnboardingGroup) {
      // Redirect to main app if onboarding is completed
      console.log('Redirecting to main app');
      router.replace('/(tabs)');
    }
  }, [isOnboardingCompleted, segments, isLoading]);

  if (!loaded || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
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
      <NotificationProvider>
        <PrayerTimesProvider>
          <OnboardingProvider>
            <RootLayoutNav />
          </OnboardingProvider>
        </PrayerTimesProvider>
      </NotificationProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
});
