import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { PrayerTimes, PrayerTimesResponse, fetchPrayerTimes } from '../services/prayerTimesService';
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

      // Fetch prayer times
      const response: PrayerTimesResponse = await fetchPrayerTimes(latitude, longitude);
      
      setPrayerTimes(response.prayerTimes);
      setLocation(response.location);
      
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
  }, [settings.notifications.enabled, settings.notifications.adhan, settings.notifications.athanSound, settings.notifications.vibrate]);

  // Load prayer times on mount
  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const value: PrayerTimesContextType = {
    prayerTimes,
    location,
    loading,
    error,
    refreshPrayerTimes,
    notificationsEnabled,
    toggleNotifications,
  };

  return (
    <PrayerTimesContext.Provider value={value}>
      {children}
    </PrayerTimesContext.Provider>
  );
};
