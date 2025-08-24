import React from 'react';
import FacebookStyleTransition from '../src/components/shared/FacebookStyleTransition';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../src/components/shared/ThemedView';
import { QiblaCompassSimple } from '../src/components/shared/QiblaCompassSimple';
import { useSettings } from '../src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '../src/constants/theme';

export default function QiblaScreen() {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <FacebookStyleTransition direction="right">
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <ThemedView style={styles.content}>
          <QiblaCompassSimple />
        </ThemedView>
      </SafeAreaView>
    </FacebookStyleTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  // Removed placeholder styles
});
