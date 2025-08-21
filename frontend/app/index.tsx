import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSettings } from '../src/contexts/SettingsContext';
import { View, ActivityIndicator } from 'react-native';
import { ThemedView } from '../src/components/shared/ThemedView';
import { ThemedText } from '../src/components/shared/ThemedText';
import { lightTheme, darkTheme } from '../src/constants/theme';

export default function IndexScreen() {
  const router = useRouter();
  const { settings, isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (settings && !hasNavigated) {
      console.log('Index: Settings loaded, onboarding completed:', settings.onboarding?.completed);
      console.log('Index: Full settings object:', JSON.stringify(settings, null, 2));
      
      setHasNavigated(true);
      
      if (settings.onboarding?.completed) {
        console.log('Index: Redirecting to main app');
        router.replace('/(tabs)');
      } else {
        console.log('Index: Redirecting to welcome screen');
        router.replace('/welcome');
      }
    }
  }, [settings, router, hasNavigated]);

  // Show loading screen while determining route
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText style={{ marginTop: 16, color: theme.text.secondary }}>
        Initializing app...
      </ThemedText>
      <ThemedText style={{ marginTop: 8, color: theme.text.secondary, fontSize: 12 }}>
        {settings ? `Onboarding: ${settings.onboarding?.completed ? 'Complete' : 'Incomplete'}` : 'Loading settings...'}
      </ThemedText>
    </ThemedView>
  );
}
