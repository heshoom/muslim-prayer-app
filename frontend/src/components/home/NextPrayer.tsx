import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import { getNextPrayer, NextPrayerInfo } from '../../utils/prayerTimeUtils';
import { useSettings } from '@/src/contexts/SettingsContext';
import { usePrayerTimes } from '@/src/contexts/PrayerTimesContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';

export const NextPrayer = () => {
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const { isDarkMode, settings } = useSettings();
  const { prayerTimes, loading, error, currentLocation } = usePrayerTimes();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();

  // Calculate next prayer when prayer times change
  useEffect(() => {
    if (prayerTimes && currentLocation) {
      try {
        const nextPrayerInfo = getNextPrayer(prayerTimes, settings.appearance.timeFormat, currentLocation);
        setNextPrayer(nextPrayerInfo);
      } catch (error) {
        console.error('Error calculating next prayer:', error);
        setNextPrayer(null);
      }
    } else {
      setNextPrayer(null);
    }
  }, [prayerTimes, currentLocation, settings.appearance.timeFormat]);

  // Update countdown every minute
  useEffect(() => {
    if (!prayerTimes || !currentLocation) return;

    const interval = setInterval(() => {
      try {
        const nextPrayerInfo = getNextPrayer(prayerTimes, settings.appearance.timeFormat, currentLocation);
        setNextPrayer(nextPrayerInfo);
      } catch (error) {
        console.error('Error updating next prayer countdown:', error);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [prayerTimes, currentLocation, settings.appearance.timeFormat]);

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
        <ThemedText style={{ color: theme.text.primary }}>{t('loadingPrayerTimes')}</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
        <ThemedText style={{ color: theme.error, textAlign: 'center' }}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (!nextPrayer) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
        <ThemedText style={{ color: theme.text.primary }}>{t('unableToDetermineNextPrayer')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.content}>
        <ThemedText style={[styles.label, { color: theme.text.secondary }]}>{t('nextPrayer')}</ThemedText>
        <ThemedText style={[styles.prayerName, { color: theme.primary }]}>
          {t(nextPrayer.name.toLowerCase())} at {nextPrayer.location}
        </ThemedText>
        <ThemedText style={[styles.time, { color: theme.text.primary }]}>{nextPrayer.time}</ThemedText>
        <ThemedText style={[styles.countdown, { color: theme.text.secondary }]}>
          in {nextPrayer.remainingTime.hours} hours {nextPrayer.remainingTime.minutes} minutes
        </ThemedText>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View style={[styles.progress, { width: `${nextPrayer.progress}%`, backgroundColor: theme.primary }]} />
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  prayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  time: {
    fontSize: 20,
    marginBottom: 4,
  },
  countdown: {
    fontSize: 16,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
});
