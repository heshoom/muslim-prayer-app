import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/src/components/shared/ThemedView';
import { ThemedText } from '@/src/components/shared/ThemedText';
import FacebookStyleTransition from '@/src/components/shared/FacebookStyleTransition';
import { useSettings } from '@/src/contexts/SettingsContext';
import { usePrayerTimes } from '@/src/contexts/PrayerTimesContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';
import { formatTime as formatTimeUtil } from '@/src/utils/timeUtils';
import moment from 'moment-hijri';

export default function PrayerTimesScreen() {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  const { prayerTimes, location, loading, error, refreshPrayerTimes } = usePrayerTimes();
  const { settings } = useSettings();
  const { t, isRTL, getHijriMonths } = useTranslation();

  const formatTime = (time: string) => formatTimeUtil(time, settings.appearance.timeFormat);

  const getCurrentDate = () => {
    const locale = settings.appearance.language || 'en';
    try {
      return new Date().toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Compute localized Hijri date (uses translation month names)
  const getHijriDate = () => {
    try {
      const hijri = moment();
      const day = hijri.iDate();
      const monthIdx = hijri.iMonth();
      const year = hijri.iYear();
      const months = getHijriMonths();
      const monthName = months[monthIdx] || months[0] || '';
      return `${day} ${monthName} ${year}`;
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <FacebookStyleTransition direction="left">
        <ThemedView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={[styles.loadingText, { color: theme.text.primary }]}>
              {t('loadingPrayerTimes')}
            </ThemedText>
          </View>
        </ThemedView>
      </FacebookStyleTransition>
    );
  }

  if (error) {
    return (
      <FacebookStyleTransition direction="left">
        <ThemedView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refreshPrayerTimes} />
            }
          >
            <View style={styles.errorContainer}>
              <ThemedText style={[styles.errorTitle, { color: theme.text.primary, textAlign: isRTL() ? 'right' : 'left' }]}>
                {t('unableToGetPrayerTimes')}
              </ThemedText>
              <ThemedText style={[styles.errorMessage, { color: theme.text.secondary }]}>
                {error}
              </ThemedText>
              <ThemedText style={[styles.refreshHint, { color: theme.text.secondary }]}>
                {t('refresh')}
              </ThemedText>
            </View>
          </ScrollView>
        </ThemedView>
      </FacebookStyleTransition>
    );
  }

  if (!prayerTimes) {
    return (
      <FacebookStyleTransition direction="left">
        <ThemedView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refreshPrayerTimes} />
            }
          >
            <View style={styles.errorContainer}>
              <ThemedText style={[styles.errorTitle, { color: theme.text.primary, textAlign: isRTL() ? 'right' : 'left' }]}>
                {t('unableToGetPrayerTimes')}
              </ThemedText>
              <ThemedText style={[styles.refreshHint, { color: theme.text.secondary }]}>
                {t('refresh')}
              </ThemedText>
            </View>
          </ScrollView>
        </ThemedView>
      </FacebookStyleTransition>
    );
  }

  const prayerNames = [
    { key: 'Fajr', name: 'Fajr', time: prayerTimes.Fajr },
    { key: 'Sunrise', name: 'Sunrise', time: prayerTimes.Sunrise },
    { key: 'Dhuhr', name: 'Dhuhr', time: prayerTimes.Dhuhr },
    { key: 'Asr', name: 'Asr', time: prayerTimes.Asr },
    { key: 'Maghrib', name: 'Maghrib', time: prayerTimes.Maghrib },
    { key: 'Isha', name: 'Isha', time: prayerTimes.Isha },
  ];

  return (
    <FacebookStyleTransition direction="left">
      <ThemedView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshPrayerTimes} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={[styles.title, { color: theme.primary }]}>
        {t('prayerTimes')}
            </ThemedText>
            <ThemedText style={[styles.date, { color: theme.text.primary, textAlign: isRTL() ? 'right' : 'center' }]}>
              {getCurrentDate()}
            </ThemedText>
            <ThemedText style={[styles.hijriDate, { color: theme.text.secondary, textAlign: isRTL() ? 'right' : 'center' }]}>
              {getHijriDate()}
            </ThemedText>
            <ThemedText style={[styles.location, { color: theme.text.secondary }]}>
              {location}
            </ThemedText>
          </View>

          {/* Prayer Times List */}
          <View style={[styles.prayerTimesContainer, { backgroundColor: theme.surface }]}>
            {prayerNames.map((prayer, index) => (
              <View 
                key={prayer.key} 
                style={[
                  styles.prayerRow,
                  index < prayerNames.length - 1 && { 
                    borderBottomColor: theme.border,
                    borderBottomWidth: 1 
                  }
                ]}
              >
                <ThemedText style={[styles.prayerName, { color: theme.text.primary }]}>
                  {(
                    () => {
                      const lower = prayer.name.toLowerCase();
                      if (lower === 'fajr') return t('fajr');
                      if (lower === 'sunrise') return t('sunrise');
                      if (lower === 'dhuhr') return t('dhuhr');
                      if (lower === 'asr') return t('asr');
                      if (lower === 'maghrib') return t('maghrib');
                      if (lower === 'isha') return t('isha');
                      return prayer.name;
                    }
                  )()}
                </ThemedText>
                <ThemedText style={[styles.prayerTime, { color: theme.primary }]}>
                  {formatTime(prayer.time)}
                </ThemedText>
              </View>
            ))}
          </View>

          <ThemedText style={[styles.refreshHint, { color: theme.text.secondary }]}>
            {t('refresh')}
          </ThemedText>
        </ScrollView>
      </ThemedView>
    </FacebookStyleTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    opacity: 0.6,
  },
  hijriDate: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
    marginBottom: 2,
  },
  prayerTimesContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: '500',
  },
  refreshHint: {
    textAlign: 'center',
    opacity: 0.5,
    fontSize: 12,
    marginTop: 10,
  },
});