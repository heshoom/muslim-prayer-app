import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import { prayerTimesApi } from '../../services/prayerTimesApi';
import { getNextPrayer, NextPrayerInfo } from '../../utils/prayerTimeUtils';
import * as Location from 'expo-location';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';

export const NextPrayer = () => {
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const { isDarkMode, settings } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setError(null);
        setLoading(true);

        let response;
        let locationName = '';
        
        // Use the same location method as the PrayerTimes screen
        if (settings.location.useGPS) {
          // Use GPS coordinates
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setError(t('locationPermissionDenied'));
            setLoading(false);
            return;
          }

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const { latitude, longitude } = location.coords;
          response = await prayerTimesApi.getPrayerTimesByCoordinates(latitude, longitude, settings);
          
          // Extract location name from API response
          if (response.code === 200 && response.data.meta && response.data.meta.timezone) {
            const timezone = response.data.meta.timezone;
            locationName = timezone.split('/')[1]?.replace(/_/g, ' ') || 'Your Location';
          } else {
            locationName = 'Your Location';
          }
        } else {
          // Use city name
          const city = settings.location.city || 'New York';
          response = await prayerTimesApi.getPrayerTimesByCity(city, settings);
          locationName = city;
        }
        
        setCurrentLocation(locationName);
        
        if (response.code === 200) {
          const nextPrayerInfo = getNextPrayer(response.data.timings, settings.appearance.timeFormat, locationName);
          setNextPrayer(nextPrayerInfo);
        } else {
          setError('Unable to fetch prayer times. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        setError('Unable to get prayer times. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
    // Update every minute and when settings change
    const interval = setInterval(fetchPrayerTimes, 60000);
    return () => clearInterval(interval);
  }, [settings.prayer.calculationMethod, settings.prayer.madhab, settings.appearance.timeFormat, settings.location.useGPS, settings.location.city]);

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
