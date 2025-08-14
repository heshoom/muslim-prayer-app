import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { NextPrayer } from '@/src/components/home/NextPrayer';
import { DailyContent } from '@/src/components/home/DailyContent';
import { QuickActions } from '@/src/components/home/QuickActions';
import { ThemedText } from '@/src/components/shared/ThemedText';
import { ThemedView } from '@/src/components/shared/ThemedView';
import HijriDate from 'hijri-date';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';

export default function HomeScreen() {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const hijriDate = new HijriDate();
  const formattedHijriDate = hijriDate.format('d MMMM yyyy');

  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemedView style={styles.safeArea}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <ThemedText style={[styles.dateText, { color: theme.primary }]}>{formattedDate}</ThemedText>
          <ThemedText type="subtitle">{formattedHijriDate}</ThemedText>
        </View>

        {/* Next Prayer Section */}
        <NextPrayer />

        {/* Daily Content Section */}
        <DailyContent />

        {/* Quick Actions Grid */}
        <QuickActions />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  }
});
