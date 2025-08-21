import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import { usePrayerTimes } from '../../contexts/PrayerTimesContext';
import { useSettings } from '../../contexts/SettingsContext';
import { darkTheme, lightTheme } from '../../constants/theme';

export default function NextPrayer() {
  const { prayerTimes, location, loading, error } = usePrayerTimes();
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return time;
    }
  };

  const getNextPrayer = () => {
    if (!prayerTimes) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', time: prayerTimes.Fajr },
      { name: 'Sunrise', time: prayerTimes.Sunrise },
      { name: 'Dhuhr', time: prayerTimes.Dhuhr },
      { name: 'Asr', time: prayerTimes.Asr },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isha', time: prayerTimes.Isha },
    ];

    // Filter out Sunrise as it's not a prayer time
    const prayerOnly = prayers.filter(p => p.name !== 'Sunrise');

    for (const prayer of prayerOnly) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      
      if (prayerTime > currentTime) {
        return prayer;
      }
    }

    // If no prayer found for today, return Fajr (next day)
    return prayerOnly[0];
  };

  const getTimeUntilNextPrayer = (prayerTime: string) => {
    try {
      const [hours, minutes] = prayerTime.split(':').map(Number);
      const now = new Date();
      const prayer = new Date();
      prayer.setHours(hours, minutes, 0, 0);

      // If prayer time has passed, it's tomorrow
      if (prayer <= now) {
        prayer.setDate(prayer.getDate() + 1);
      }

      const diff = prayer.getTime() - now.getTime();
      const totalMinutes = Math.floor(diff / (1000 * 60));
      const hoursUntil = Math.floor(totalMinutes / 60);
      const minutesUntil = totalMinutes % 60;

      if (hoursUntil > 0) {
        return `${hoursUntil}h ${minutesUntil}m`;
      } else {
        return `${minutesUntil}m`;
      }
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
        <ThemedText style={[styles.title, { color: theme.text.primary }]}>
          Next Prayer
        </ThemedText>
        <ThemedText style={[styles.loading, { color: theme.text.secondary }]}>
          Loading...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error || !prayerTimes) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
        <ThemedText style={[styles.title, { color: theme.text.primary }]}>
          Next Prayer
        </ThemedText>
        <ThemedText style={[styles.error, { color: theme.text.secondary }]}>
          Unable to load prayer times
        </ThemedText>
      </ThemedView>
    );
  }

  const nextPrayer = getNextPrayer();
  if (!nextPrayer) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
        <ThemedText style={[styles.title, { color: theme.text.primary }]}>
          Next Prayer
        </ThemedText>
        <ThemedText style={[styles.error, { color: theme.text.secondary }]}>
          No prayer times available
        </ThemedText>
      </ThemedView>
    );
  }

  const timeUntil = getTimeUntilNextPrayer(nextPrayer.time);

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
      <ThemedText style={[styles.title, { color: theme.text.primary }]}>
        Next Prayer
      </ThemedText>
      
      <View style={styles.prayerInfo}>
        <ThemedText style={[styles.prayerName, { color: theme.primary }]}>
          {nextPrayer.name}
        </ThemedText>
        <ThemedText style={[styles.prayerTime, { color: theme.text.primary }]}>
          {formatTime(nextPrayer.time)}
        </ThemedText>
      </View>

      {timeUntil && (
        <ThemedText style={[styles.timeUntil, { color: theme.text.secondary }]}>
          in {timeUntil}
        </ThemedText>
      )}

      <ThemedText style={[styles.location, { color: theme.text.secondary }]}>
        {location}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  prayerInfo: {
    alignItems: 'center',
    marginBottom: 5,
  },
  prayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  prayerTime: {
    fontSize: 20,
    fontWeight: '500',
  },
  timeUntil: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  location: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  loading: {
    textAlign: 'center',
    fontSize: 14,
  },
  error: {
    textAlign: 'center',
    fontSize: 14,
  },
});
