import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View } from 'react-native';

import { SettingsProvider, useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';

function RootLayoutNav() {
  const { isDarkMode } = useSettings();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? darkTheme.background : lightTheme.background }}>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <RootLayoutNav />
    </SettingsProvider>
  );
}
