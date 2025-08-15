import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrayerCard } from '@/src/components/shared/PrayerCard';
import { ThemedView } from '@/src/components/shared/ThemedView';
import { ThemedText } from '@/src/components/shared/ThemedText';
import { useSettings } from '@/src/contexts/SettingsContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { usePrayerTimes } from '@/src/contexts/PrayerTimesContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';
import { formatDate } from '@/src/utils/timeUtils';

export default function PrayerTimesScreen() {
  const { settings, updateSettings } = useSettings();
  const { schedulePrayerNotifications } = useNotifications();
  const { prayerTimes, loading, error, date, currentLocation, refreshPrayerTimes } = usePrayerTimes();
  const [inputCity, setInputCity] = useState(settings.location.city || 'New York');

  // Update input city when settings change
  useEffect(() => {
    setInputCity(settings.location.city || 'New York');
  }, [settings.location.city]);

  // Schedule notifications when prayer times are available
  useEffect(() => {
    if (prayerTimes && settings.notifications.enabled) {
      schedulePrayerNotifications(prayerTimes);
    }
  }, [prayerTimes, settings.notifications.enabled, schedulePrayerNotifications]);

  // Handler for the search button
  const handleSearch = () => {
    if (inputCity.trim() && inputCity.trim() !== settings.location.city) {
      updateSettings('location', 'city', inputCity.trim());
      updateSettings('location', 'useGPS', false);
    }
  };

  // Handler for GPS location
  const handleGeoLocation = () => {
    updateSettings('location', 'useGPS', true);
  };

  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <ThemedView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView 
        contentContainerStyle={[
          styles.container,
          { 
            paddingTop: insets.top + 10,
            paddingBottom: Platform.OS === 'ios' ? 100 : 80
          }
        ]}
      >
        <ThemedView style={styles.header}>
            <ThemedText style={[styles.title, { color: theme.primary, paddingTop: 20 }]}>{t('muslimPrayerTimes')}</ThemedText>
          <ThemedText type="subtitle">{t('enterCityOrLocation')}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.searchForm}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface,
              color: theme.text.primary,
              borderColor: theme.border
            }]}
            placeholder={t('searchCity')}
            placeholderTextColor={theme.text.secondary}
            value={inputCity}
            onChangeText={setInputCity}
          />
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: theme.primary }]} 
            onPress={handleSearch}
          >
            <ThemedText style={styles.buttonText}>{t('search')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <TouchableOpacity 
          style={[styles.locationButton, { 
            backgroundColor: theme.surface,
            borderColor: theme.primary 
          }]} 
          onPress={handleGeoLocation}
        >
          <ThemedText style={[styles.locationButtonText, { color: theme.primary }]}>
            {t('useMyLocation')}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.refreshButton, { 
            backgroundColor: theme.primary 
          }]} 
          onPress={refreshPrayerTimes}
          disabled={loading}
        >
          <ThemedText style={[styles.buttonText, { opacity: loading ? 0.6 : 1 }]}>
            {loading ? t('refreshing') || 'Refreshing...' : t('refresh') || 'Refresh'}
          </ThemedText>
        </TouchableOpacity>

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
                {formatDate(date, settings.appearance.showHijriDates)}
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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchForm: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButton: {
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  prayerTimesContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
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
    marginTop: 10,
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsStatus: {
    alignItems: 'center',
    marginBottom: 10,
  },
  settingsText: {
    fontSize: 12,
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
