import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/useColorScheme';
import { OnboardingProvider, useOnboarding } from '../src/contexts/OnboardingContext';

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2980b9" />
    </View>
  );
}

function RootLayoutNav() {
  const { isOnboardingCompleted, isLoading } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();



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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <OnboardingProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </OnboardingProvider>
    </ThemeProvider>
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
