import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import { usePrayerTimes } from '../../contexts/PrayerTimesContext';
import { useSettings } from '../../contexts/SettingsContext';
import { darkTheme, lightTheme } from '../../constants/theme';
import { useTranslation } from '@/src/i18n';
import { formatTime as formatTimeUtil } from '@/src/utils/timeUtils';

export default function NextPrayer() {
  const { prayerTimes, location, loading, error } = usePrayerTimes();
  const { isDarkMode, settings } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t, isRTL } = useTranslation();

  const formatTime = (time: string) => formatTimeUtil(time, settings.appearance.timeFormat);

  const getNextPrayer = () => {
    if (!prayerTimes) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers = [
      { name: 'Fajr', time: prayerTimes.Fajr },
      { name: 'Dhuhr', time: prayerTimes.Dhuhr },
      { name: 'Asr', time: prayerTimes.Asr },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isha', time: prayerTimes.Isha },
    ];

    for (const prayer of prayers) {
      try {
        if (!prayer.time || typeof prayer.time !== 'string') {
          continue;
        }
        
  const clean = (prayer.time || '').toString().replace(/[^\d:]/g, '').trim();
  const timeParts = clean.split(':');
        if (timeParts.length < 2) {
          continue;
        }
        
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes)) {
          continue;
        }
        
        const prayerTime = hours * 60 + minutes;
        
        if (prayerTime > currentTime) {
          return prayer;
        }
      } catch (error) {
        console.warn('Error parsing prayer time:', prayer, error);
        continue;
      }
    }

    // If no prayer found for today, return Fajr (next day)
    return prayers[0];
  };

  const getTimeUntilNextPrayer = (prayerTime: string) => {
    try {
      if (!prayerTime || typeof prayerTime !== 'string') {
        return '';
      }
      
      const timeParts = prayerTime.trim().split(':');
      if (timeParts.length < 2) {
        return '';
      }
      
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return '';
      }
      
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
      console.warn('Error calculating time until prayer:', prayerTime, error);
      return '';
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}> 
        <ThemedText style={[styles.title, { color: theme.text.primary, textAlign: isRTL() ? 'right' : 'left' }]}> 
          {t('nextPrayer')} 
        </ThemedText> 
        <ThemedText style={[styles.loading, { color: theme.text.secondary }]}> 
          {t('loadingPrayerTimes')} 
        </ThemedText> 
      </ThemedView>
    );
  }

  if (error || !prayerTimes) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}> 
        <ThemedText style={[styles.title, { color: theme.text.primary, textAlign: isRTL() ? 'right' : 'left' }]}> 
          {t('nextPrayer')} 
        </ThemedText> 
        <ThemedText style={[styles.error, { color: theme.text.secondary }]}> 
          {t('unableToGetPrayerTimes')} 
        </ThemedText> 
      </ThemedView>
    );
  }

  const nextPrayer = getNextPrayer();
  if (!nextPrayer) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}> 
        <ThemedText style={[styles.title, { color: theme.text.primary, textAlign: isRTL() ? 'right' : 'left' }]}> 
          {t('nextPrayer')} 
        </ThemedText> 
        <ThemedText style={[styles.error, { color: theme.text.secondary }]}> 
          {t('unableToGetPrayerTimes')} 
        </ThemedText> 
      </ThemedView>
    );
  }

  const timeUntil = getTimeUntilNextPrayer(nextPrayer.time);

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}> 
      <ThemedText style={[styles.title, { color: theme.text.primary, textAlign: isRTL() ? 'right' : 'left' }]}> 
        {t('nextPrayer')} 
      </ThemedText> 
      
      <View style={styles.prayerInfo}>
        <ThemedText style={[styles.prayerName, { color: theme.primary }]}> 
          {(() => {
            const lower = nextPrayer.name.toLowerCase();
            if (lower === 'fajr') return t('fajr');
            if (lower === 'sunrise') return t('sunrise');
            if (lower === 'dhuhr') return t('dhuhr');
            if (lower === 'asr') return t('asr');
            if (lower === 'maghrib') return t('maghrib');
            if (lower === 'isha') return t('isha');
            return nextPrayer.name;
          })()} 
        </ThemedText> 
        <ThemedText style={[styles.prayerTime, { color: theme.text.primary }]}>
          {formatTime(nextPrayer.time)}
        </ThemedText>
      </View>

      {timeUntil && (
        <ThemedText style={[styles.timeUntil, { color: theme.text.secondary }]}> 
          {timeUntil} 
        </ThemedText> 
      )}

  <ThemedText style={[styles.location, { color: theme.text.secondary, textAlign: isRTL() ? 'right' : 'center' }]}> 
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
