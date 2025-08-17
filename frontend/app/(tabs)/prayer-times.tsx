import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrayerCard } from '@/src/components/shared/PrayerCard';
import { ThemedView } from '@/src/components/shared/ThemedView';
import { ThemedText } from '@/src/components/shared/ThemedText';
import FacebookStyleTransition from '@/src/components/shared/FacebookStyleTransition';
import { useSettings } from '@/src/contexts/SettingsContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { usePrayerTimes } from '@/src/contexts/PrayerTimesContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';

export default function PrayerTimesScreen() {
  const { settings, updateSettings } = useSettings();
  const { schedulePrayerNotifications } = useNotifications();
  const { 
    prayerTimes, 
    loading, 
    error, 
    date, 
    currentLocation, 
    refreshPrayerTimes, 
    selectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    isToday
  } = usePrayerTimes();
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Format the selected date for display
  const formatSelectedDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  // Schedule notifications when prayer times are available
  useEffect(() => {
    if (prayerTimes && settings.notifications.enabled) {
      schedulePrayerNotifications(prayerTimes);
    }
  }, [prayerTimes, settings.notifications.enabled, schedulePrayerNotifications]);

  return (
    <FacebookStyleTransition direction="left">
      <ThemedView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView 
          contentContainerStyle={[
            styles.container,
            { 
              paddingTop: insets.top + 10,
              paddingBottom: Platform.OS === 'ios' ? (75 + insets.bottom) : (60 + 20)
            }
          ]}
        >
        <ThemedView style={styles.header}>
          <ThemedText style={[styles.title, { color: theme.primary, paddingTop: 20 }]}>{t('muslimPrayerTimes')}</ThemedText>
          
          {/* Date Navigation */}
          <View style={styles.dateNavigation}>
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: theme.surface }]}
              onPress={goToPreviousDay}
            >
              <Ionicons name="chevron-back" size={20} color={theme.primary} />
            </TouchableOpacity>
            
            <View style={styles.dateContainer}>
              <ThemedText type="subtitle" style={styles.dateText}>{formatSelectedDate(selectedDate)}</ThemedText>
              {!isToday && (
                <TouchableOpacity 
                  style={[styles.todayButton, { backgroundColor: theme.primary }]}
                  onPress={goToToday}
                >
                  <ThemedText style={[styles.todayButtonText, { color: theme.surface }]}>
                    {t('today')}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: theme.surface }]}
              onPress={goToNextDay}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </ThemedView>

        <ThemedView style={styles.mainContent}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : error ? (
            <ThemedView style={[styles.errorContainer, { borderColor: theme.error }]}>
              <ThemedText style={[styles.errorText, { color: theme.error }]}>{error}</ThemedText>
            </ThemedView>
          ) : prayerTimes ? (
            <ThemedView style={[styles.prayerTimesContainer, { backgroundColor: theme.surface }]}>
              <ThemedText type="title">{t('prayerTimes')} for {currentLocation}</ThemedText>
              <ThemedText type="subtitle">
                {date}
              </ThemedText>
              
              {/* Notification Status */}
              {settings.notifications.enabled && (
                <ThemedView style={styles.notificationStatus}>
                  <ThemedText style={[styles.notificationText, { color: theme.primary }]}>
                    🔔 {t('notificationsEnabled')}
                  </ThemedText>
                </ThemedView>
              )}
              
              {/* Settings Status */}
              <ThemedView style={styles.settingsStatus}>
                <ThemedText style={[styles.settingsText, { color: theme.text.secondary }]}>
                  Method: {settings.prayer.calculationMethod} | Madhab: {settings.prayer.madhab} | Format: {settings.appearance.timeFormat}
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.grid}>
                <PrayerCard name="Fajr" time={prayerTimes.Fajr} />
                <PrayerCard name="Dhuhr" time={prayerTimes.Dhuhr} />
                <PrayerCard name="Asr" time={prayerTimes.Asr} />
                <PrayerCard name="Maghrib" time={prayerTimes.Maghrib} />
                <PrayerCard name="Isha" time={prayerTimes.Isha} />
                <PrayerCard name="Sunrise" time={prayerTimes.Sunrise} />
              </ThemedView>
            </ThemedView>
          ) : null}
        </ThemedView>
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
    flexGrow: 1,
    padding: 16, // Reduced from 20
    paddingTop: Platform.OS === 'android' ? 36 : 16, // Reduced from 40:20
  },
  header: {
    alignItems: 'center',
    marginBottom: 16, // Reduced from 20
  },
  title: {
    fontSize: 24, // Reduced from 28
    fontWeight: 'bold',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContainer: {
    alignItems: 'center',
    minWidth: 180,
  },
  dateText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  todayButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 12, // Reduced from 15
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 15, // Reduced from 16
    textAlign: 'center',
  },
  prayerTimesContainer: {
    width: '100%',
    borderRadius: 10, // Reduced from 12
    padding: 16, // Reduced from 20
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  notificationStatus: {
    alignItems: 'center',
    marginTop: 8, // Reduced from 10
    marginBottom: 8, // Reduced from 10
  },
  notificationText: {
    fontSize: 13, // Reduced from 14
    fontWeight: '500',
  },
  settingsStatus: {
    alignItems: 'center',
    marginBottom: 8, // Reduced from 10
  },
  settingsText: {
    fontSize: 11, // Reduced from 12
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16, // Reduced from 20
  },
});
