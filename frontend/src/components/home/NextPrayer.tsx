import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import { usePrayerTimes } from '../../contexts/PrayerTimesContext';
import { useSettings } from '../../contexts/SettingsContext';
import { darkTheme, lightTheme } from '../../constants/theme';
import { useTranslation } from '@/src/i18n';
import { formatTime as formatTimeUtil } from '@/src/utils/timeUtils';

interface Prayer {
  name: string;
  time: string;
  timeInMinutes?: number;
  isTomorrow?: boolean;
}

export default function NextPrayer() {
  const { prayerTimes, location, loading, error } = usePrayerTimes();
  const { isDarkMode, settings } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t, isRTL } = useTranslation();

  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const [nextPrayerData, setNextPrayerData] = useState<any>(null);
  const progressAnim = new Animated.Value(0);

  const formatTime = (time: string) => formatTimeUtil(time, settings.appearance.timeFormat);

  const getNextPrayerWithProgress = () => {
    if (!prayerTimes) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

    const prayers = [
      { name: 'Fajr', time: prayerTimes.Fajr },
      { name: 'Dhuhr', time: prayerTimes.Dhuhr },
      { name: 'Asr', time: prayerTimes.Asr },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isha', time: prayerTimes.Isha },
    ];

    let currentPrayer = null;
    let nextPrayer = null;

    for (let i = 0; i < prayers.length; i++) {
      const prayer = prayers[i];
      try {
        if (!prayer.time || typeof prayer.time !== 'string') continue;
        
        const clean = (prayer.time || '').toString().replace(/[^\d:]/g, '').trim();
        const timeParts = clean.split(':');
        if (timeParts.length < 2) continue;
        
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes)) continue;
        
        const prayerTime = hours * 60 + minutes;
        
        if (prayerTime > currentTime) {
          nextPrayer = { ...prayer, timeInMinutes: prayerTime };
          if (i > 0) {
            const prevClean = (prayers[i - 1].time || '').toString().replace(/[^\d:]/g, '').trim();
            const prevTimeParts = prevClean.split(':');
            if (prevTimeParts.length >= 2) {
              const prevHours = parseInt(prevTimeParts[0], 10);
              const prevMinutes = parseInt(prevTimeParts[1], 10);
              if (!isNaN(prevHours) && !isNaN(prevMinutes)) {
                currentPrayer = { ...prayers[i - 1], timeInMinutes: prevHours * 60 + prevMinutes };
              }
            }
          }
          break;
        }
      } catch (error) {
        console.warn('Error parsing prayer time:', prayer, error);
        continue;
      }
    }

    // If no prayer found for today, next is Fajr tomorrow
    if (!nextPrayer) {
      // Parse first prayer time
      const firstPrayerClean = (prayers[0].time || '').toString().replace(/[^\d:]/g, '').trim();
      const firstTimeParts = firstPrayerClean.split(':');
      const firstPrayerTime = firstTimeParts.length >= 2 ? 
        parseInt(firstTimeParts[0], 10) * 60 + parseInt(firstTimeParts[1], 10) : 0;
      
      nextPrayer = { ...prayers[0], timeInMinutes: firstPrayerTime, isTomorrow: true };
      
      // Parse last prayer time
      const lastPrayerClean = (prayers[prayers.length - 1].time || '').toString().replace(/[^\d:]/g, '').trim();
      const lastTimeParts = lastPrayerClean.split(':');
      const lastPrayerTime = lastTimeParts.length >= 2 ? 
        parseInt(lastTimeParts[0], 10) * 60 + parseInt(lastTimeParts[1], 10) : 0;
      
      currentPrayer = { ...prayers[prayers.length - 1], timeInMinutes: lastPrayerTime };
    }

    return { nextPrayer, currentPrayer };
  };

  const updateCountdown = () => {
    const prayerData = getNextPrayerWithProgress();
    if (!prayerData || !prayerData.nextPrayer) return;

    const { nextPrayer, currentPrayer } = prayerData;
    setNextPrayerData(nextPrayer);

    try {
      const clean = (nextPrayer.time || '').toString().replace(/[^\d:]/g, '').trim();
      const timeParts = clean.split(':');
      if (timeParts.length < 2) return;
      
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) return;
      
      const now = new Date();
      const prayer = new Date();
      prayer.setHours(hours, minutes, 0, 0);

      // If prayer time has passed, it's tomorrow
      if (prayer <= now) {
        prayer.setDate(prayer.getDate() + 1);
      }

      const diff = prayer.getTime() - now.getTime();
      const totalSeconds = Math.floor(diff / 1000);
      
      if (totalSeconds <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        setProgress(100);
        return;
      }

      const hoursLeft = Math.floor(totalSeconds / 3600);
      const minutesLeft = Math.floor((totalSeconds % 3600) / 60);
      const secondsLeft = totalSeconds % 60;

      setCountdown({
        hours: hoursLeft,
        minutes: minutesLeft,
        seconds: secondsLeft
      });

      // Calculate progress
      if (currentPrayer) {
        const currentPrayerTime = new Date();
        const currentClean = (currentPrayer.time || '').toString().replace(/[^\d:]/g, '').trim();
        const currentTimeParts = currentClean.split(':');
        
        if (currentTimeParts.length >= 2) {
          const currentHours = parseInt(currentTimeParts[0], 10);
          const currentMinutes = parseInt(currentTimeParts[1], 10);
          
          if (!isNaN(currentHours) && !isNaN(currentMinutes)) {
            currentPrayerTime.setHours(currentHours, currentMinutes, 0, 0);
            
            // If current prayer was yesterday (for Isha -> Fajr transition)
            if ('isTomorrow' in nextPrayer && nextPrayer.isTomorrow && currentPrayerTime > prayer) {
              currentPrayerTime.setDate(currentPrayerTime.getDate() - 1);
            }
            
            const totalInterval = prayer.getTime() - currentPrayerTime.getTime();
            const elapsed = now.getTime() - currentPrayerTime.getTime();
            
            if (totalInterval > 0) {
              const progressPercent = Math.min(100, Math.max(0, (elapsed / totalInterval) * 100));
              setProgress(progressPercent);
              
              // Animate progress bar
              Animated.timing(progressAnim, {
                toValue: progressPercent / 100,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }
          }
        }
      } else {
        // No current prayer, set progress to 0
        setProgress(0);
        progressAnim.setValue(0);
      }
    } catch (error) {
      console.warn('Error updating countdown:', error);
    }
  };

  // Update countdown every second
  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const getPrayerIcon = (prayerName: string) => {
    const name = prayerName.toLowerCase();
    switch (name) {
      case 'fajr': return 'sun';
      case 'dhuhr': return 'sun';
      case 'asr': return 'cloud-sun';
      case 'maghrib': return 'moon';
      case 'isha': return 'star';
      default: return 'clock';
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

  const nextPrayerResult = getNextPrayerWithProgress();
  if (!nextPrayerResult || !nextPrayerResult.nextPrayer) {
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

  const nextPrayer = nextPrayerResult.nextPrayer;

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

      {/* Countdown Display */}
      <View style={styles.countdownContainer}>
        <ThemedText style={[styles.countdownText, { color: theme.text.primary }]}>
          {String(countdown.hours).padStart(2, '0')}:
          {String(countdown.minutes).padStart(2, '0')}:
          {String(countdown.seconds).padStart(2, '0')}
        </ThemedText>
        
        {/* Progress Bar */}
        <View style={[styles.progressBarContainer, { backgroundColor: theme.text.secondary + '20' }]}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { 
                backgroundColor: theme.primary,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]} 
          />
        </View>
      </View>

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
    minHeight: 200,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  prayerInfo: {
    alignItems: 'center',
    marginBottom: 15,
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
  countdownContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingVertical: 10,
  },
  countdownText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    lineHeight: 36,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});
