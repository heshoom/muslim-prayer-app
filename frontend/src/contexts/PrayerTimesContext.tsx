import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { PrayerTimes, PrayerTimesResponse, fetchPrayerTimes } from '../services/prayerTimesService';
import { getCachedPrayerTimes, setCachedPrayerTimes, clearPrayerTimesCache } from '../services/prayerTimesCache';
import { locationValidationService } from '../services/locationValidationService';
import { useSettings } from './SettingsContext';
import { prayerNotificationService } from '../services/prayerNotificationService';
// background fetch is optional - guard import
let registerBackgroundFetchAsync: any = null;
try {
   
  const bf = require('../services/backgroundFetchService');
  registerBackgroundFetchAsync = bf.registerBackgroundFetchAsync;
} catch (err) {
  console.log('Background fetch service not available:', (err && (err as any).message) || err);
}

interface PrayerTimesContextType {
  prayerTimes: PrayerTimes | null;
  location: string;
  loading: boolean;
  error: string | null;
  refreshPrayerTimes: () => Promise<void>;
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<void>;
  effectiveMethod: string | null;
  clearCache: () => Promise<void>;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const usePrayerTimes = () => {
  const context = useContext(PrayerTimesContext);
  if (!context) {
    throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
  }
  return context;
};

interface PrayerTimesProviderProps {
  children: React.ReactNode;
}

export const PrayerTimesProvider = ({ children }: PrayerTimesProviderProps) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [location, setLocation] = useState<string>('Unknown Location');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Notifications removed: keep placeholder state for compatibility
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [effectiveMethod, setEffectiveMethod] = useState<string | null>(null);
  const { settings } = useSettings();

  const getNotificationSettings = () => ({
    enabled: settings.notifications.enabled,
    adhan: settings.notifications.adhan,
    athanSound: settings.notifications.athanSound,
    vibrate: settings.notifications.vibrate,
    prePrayer: settings.notifications.prePrayer,
    prePrayerTime: settings.notifications.prePrayerTime,
  timeFormat: settings.appearance.timeFormat,
  });

  const setupNotifications = async (times: PrayerTimes, loc: string) => {
    try {
      const notificationSettings = getNotificationSettings();
      const ok = await prayerNotificationService.setupNotifications();
      if (ok) {
        await prayerNotificationService.scheduleDailyNotifications(times, loc, notificationSettings);
        setNotificationsEnabled(true);
      } else {
        setNotificationsEnabled(false);
      }
    } catch (err) {
      setNotificationsEnabled(false);
      console.warn('Error setting up notifications:', err);
    }
  };

  const loadPrayerTimes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Getting location permission...');
      
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      console.log('Getting current location...');
      
      // Get current location
      const locationResult = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationResult.coords;

      console.log('Location obtained:', { latitude, longitude });

      // Build a date key (use local date string YYYY-MM-DD)
      const dateStr = new Date().toISOString().slice(0, 10);

      // Try to read from cache first
      const cached = await getCachedPrayerTimes(
        latitude,
        longitude,
        dateStr,
        settings.prayer.calculationMethod,
        settings.prayer.madhab,
      );
      let response: PrayerTimesResponse;
      if (cached) {
        console.log('Using cached prayer times for method:', settings.prayer.calculationMethod);
        response = cached;
      } else {
        // Fetch prayer times using calculation method from settings
        response = await fetchPrayerTimes(
          latitude,
          longitude,
          settings.prayer.calculationMethod,
          settings.prayer.madhab,
        );
        // Cache the response for quick switching
        try {
          await setCachedPrayerTimes(
            latitude,
            longitude,
            dateStr,
            settings.prayer.calculationMethod,
            settings.prayer.madhab,
            response,
          );
        } catch (e) {
          console.warn('Failed to cache prayer times:', e);
        }
      }

      setPrayerTimes(response.prayerTimes);
      setLocation(response.location);
      setEffectiveMethod(response.method || settings.prayer.calculationMethod);

      // Prefetch other common methods in background (non-blocking)
      (async () => {
        try {
          const otherMethods = ['mwl','isna','egypt','makkah','karachi','tehran','gulf','kuwait','qatar','turkey'];
          for (const m of otherMethods) {
            // prefetch for both schools to make madhab switches instant
            for (const school of ['shafi','hanafi'] as const) {
              if (m === settings.prayer.calculationMethod && school === settings.prayer.madhab) continue;
              const exists = await getCachedPrayerTimes(latitude, longitude, dateStr, m, school);
              if (!exists) {
                const fetched = await fetchPrayerTimes(latitude, longitude, m, school);
                await setCachedPrayerTimes(latitude, longitude, dateStr, m, school, fetched);
              }
            }
          }
        } catch (err) {
          // background prefetch errors are non-fatal
          console.warn('Background prefetch error:', err);
        }
      })();

      // Schedule notifications after loading prayer times. Do NOT auto-request
      // notification permissions during the onboarding flow — only schedule
      // when onboarding has been completed or when notifications are toggled
      // explicitly by the user. This prevents the notification prompt from
      // appearing immediately after granting location during onboarding.
      if (settings.notifications.enabled && settings.onboarding?.completed) {
        await setupNotifications(response.prayerTimes, response.location);
      }

      if (isInitialLoad && settings.onboarding?.completed) {
        setIsInitialLoad(false);
      }

      console.log('Prayer times loaded successfully for:', response.location);
    } catch (error) {
      console.error('Error loading prayer times:', error);
      setError(error instanceof Error ? error.message : 'Failed to load prayer times');
    } finally {
      setLoading(false);
    }
  };

  const refreshPrayerTimes = async () => {
    await loadPrayerTimes();
  };

  const clearCache = async () => {
    try {
      // Clear in-memory state
      setPrayerTimes(null);
      setLocation('Unknown Location');
      setEffectiveMethod(null);
      // Clear persisted prayer times cache
      await clearPrayerTimesCache();
      // Clear location validation service caches
      try {
        locationValidationService.clearCache();
      } catch (err) {
        console.warn('Error clearing locationValidationService cache:', err);
      }
      console.log('Caches cleared');
    } catch (error) {
      console.error('Error in clearCache:', error);
      throw error;
    }
  };

  const toggleNotifications = async () => {
    // Toggle notifications on/off and reschedule if needed
    if (!prayerTimes || !location) return;
    if (settings.notifications.enabled) {
      await setupNotifications(prayerTimes, location);
    } else {
      await prayerNotificationService.cancelAllNotifications();
      setNotificationsEnabled(false);
    }
  };

  // Only re-setup notifications if the canonical signature changes
  const lastNotifSignatureRef = useRef<string | null>(null);
  useEffect(() => {
    // Reschedule notifications if relevant settings change
    if (prayerTimes && location && !isInitialLoad) {
      if (settings.notifications.enabled) {
        setupNotifications(prayerTimes, location);
      } else {
        prayerNotificationService.cancelAllNotifications();
        setNotificationsEnabled(false);
      }
    }
  }, [settings.notifications.enabled, settings.notifications.adhan, settings.notifications.vibrate, settings.notifications.prePrayer, settings.notifications.prePrayerTime, location, prayerTimes, isInitialLoad]);

  // Load prayer times only after onboarding is completed (to avoid prompting
  // for location permissions before the user has a chance to opt in).
  useEffect(() => {
    if (!settings.onboarding?.completed) return;

    loadPrayerTimes();
    // attempt to register background fetch with approximate location obtained later when loadPrayerTimes runs
    (async () => {
      try {
        if (registerBackgroundFetchAsync) {
          // register without coords; service will skip if no coords provided
          await registerBackgroundFetchAsync();
        }
      } catch (err) {
        console.warn('Background fetch registration failed on mount:', err);
      }
    })();
  }, [settings.onboarding?.completed]);

  // Daily rescheduler - check if we need to reschedule notifications for a new day
  useEffect(() => {
    if (!settings.onboarding?.completed || !prayerTimes || !notificationsEnabled) return;

    const checkAndRescheduleDaily = async () => {
      try {
        const notificationSettings = getNotificationSettings();
        await prayerNotificationService.rescheduleDailyIfNeeded(prayerTimes, location, notificationSettings);
      } catch (error) {
        console.error('Error in daily rescheduler:', error);
      }
    };

    checkAndRescheduleDaily();
  }, [settings.onboarding?.completed, prayerTimes, notificationsEnabled, location]);

  // Re-fetch prayer times when prayer-related settings change (calculation method, madhab, adjustments)
  useEffect(() => {
    // Avoid refetch storm on initial load
    if (isInitialLoad) return;
    console.log('Prayer settings changed - refreshing prayer times');
    loadPrayerTimes();
  }, [settings.prayer.calculationMethod, settings.prayer.madhab, JSON.stringify(settings.prayer.adjustments)]);

  const value: PrayerTimesContextType = {
    prayerTimes,
    location,
    loading,
    error,
    refreshPrayerTimes,
    notificationsEnabled,
    toggleNotifications,
  effectiveMethod,
  clearCache,
  };

  return (
    <PrayerTimesContext.Provider value={value}>
      {children}
    </PrayerTimesContext.Provider>
  );
};
