import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { PrayerTimes, PrayerTimesResponse, fetchPrayerTimes } from '../services/prayerTimesService';
import { getCachedPrayerTimes, setCachedPrayerTimes, clearPrayerTimesCache } from '../services/prayerTimesCache';
// background fetch is optional - guard import
let registerBackgroundFetchAsync: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bf = require('../services/backgroundFetchService');
  registerBackgroundFetchAsync = bf.registerBackgroundFetchAsync;
} catch (err) {
  console.log('Background fetch service not available:', (err && (err as any).message) || err);
}
import { locationValidationService } from '../services/locationValidationService';
import { prayerNotificationService, NotificationSettings } from '../services/prayerNotificationService';
import { useSettings } from './SettingsContext';

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [effectiveMethod, setEffectiveMethod] = useState<string | null>(null);
  const { settings } = useSettings();

  const getNotificationSettings = (): NotificationSettings => ({
    enabled: settings.notifications.enabled,
    adhan: settings.notifications.adhan,
    athanSound: settings.notifications.athanSound,
    vibrate: settings.notifications.vibrate,
  });

  const setupNotifications = async (times: PrayerTimes, loc: string) => {
    try {
      const notificationSettings = getNotificationSettings();
      
      if (!notificationSettings.enabled) {
        setNotificationsEnabled(false);
        return;
      }

      const permissionGranted = await prayerNotificationService.setupNotifications();
      if (permissionGranted) {
        await prayerNotificationService.scheduleAllPrayerNotifications(times, loc, notificationSettings);
        setNotificationsEnabled(true);
        console.log('Prayer notifications set up successfully with adhan sound:', notificationSettings.athanSound);
      } else {
        setNotificationsEnabled(false);
        console.warn('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
      setNotificationsEnabled(false);
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
      // store the effective method returned by the API (helps when user selected 'auto')
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
      
      // Only set up notifications on initial load, not on refresh
      if (isInitialLoad) {
        if (settings.notifications.enabled) {
          await setupNotifications(response.prayerTimes, response.location);
        }
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
    try {
      if (!prayerTimes) return;

      const notificationSettings = getNotificationSettings();

      if (notificationsEnabled) {
        await prayerNotificationService.cancelAllNotifications();
        setNotificationsEnabled(false);
        console.log('Prayer notifications disabled');
      } else {
        if (notificationSettings.enabled) {
          await setupNotifications(prayerTimes, location);
          console.log('Prayer notifications enabled with settings:', notificationSettings);
        } else {
          console.log('Notifications are disabled in settings');
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  // Re-setup notifications when settings change (but not on initial load)
  useEffect(() => {
    if (prayerTimes && location && !isInitialLoad) {
      console.log('Settings changed - updating prayer notifications');
      setupNotifications(prayerTimes, location);
    }
    // Intentionally exclude athanSound so changing the reciter doesn't cancel/reschedule all notifications
  }, [settings.notifications.enabled, settings.notifications.adhan, settings.notifications.vibrate]);

  // Load prayer times on mount
  useEffect(() => {
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
  }, []);

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
