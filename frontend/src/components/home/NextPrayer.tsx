import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import { prayerTimesApi } from '../../services/prayerTimesApi';
import { getNextPrayer, NextPrayerInfo } from '../../utils/prayerTimeUtils';
import * as Location from 'expo-location';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';

export const NextPrayer = () => {
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          const response = await prayerTimesApi.getPrayerTimesByCoordinates(latitude, longitude);
          
          if (response.code === 200) {
            const nextPrayerInfo = getNextPrayer(response.data.timings);
            setNextPrayer(nextPrayerInfo);
          }
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
    // Update every minute
    const interval = setInterval(fetchPrayerTimes, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !nextPrayer) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading prayer times...</ThemedText>
      </ThemedView>
    );
  }

  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.content}>
        <ThemedText style={[styles.label, { color: theme.text.secondary }]}>Next Prayer</ThemedText>
        <ThemedText style={[styles.prayerName, { color: theme.primary }]}>{nextPrayer.name}</ThemedText>
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
