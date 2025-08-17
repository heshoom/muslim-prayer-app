import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { prayerTimesApi } from '../services/prayerTimesApi';
import { autoUpdateCalculationMethod } from '../services/autoCalculationMethod';
import { PrayerTimes } from '../types/prayerTimes';
import { useSettings } from './SettingsContext';

interface PrayerTimesContextType {
  prayerTimes: PrayerTimes | null;
  loading: boolean;
  error: string | null;
  date: string;
  currentLocation: string;
  lastUpdated: Date | null;
  selectedDate: Date;
  refreshPrayerTimes: () => Promise<void>;
  clearCache: () => Promise<void>;
  goToPreviousDay: () => Promise<void>;
  goToNextDay: () => Promise<void>;
  goToToday: () => Promise<void>;
  isToday: boolean;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

interface CachedPrayerData {
  prayerTimes: PrayerTimes;
  date: string;
  location: string;
  timestamp: number;
  selectedDate: string; // Add selected date to cache key
  settings: {
    calculationMethod: string;
    madhab: string;
    useGPS: boolean;
    city: string;
  };
}

const CACHE_KEY = 'cachedPrayerTimes';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { settings, updateSettings } = useSettings();

  // Helper function to format date for API (DD-MM-YYYY)
  const formatDateForAPI = useCallback((date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  // Check if selected date is today
  const isToday = useMemo(() => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  }, [selectedDate]);

  // Generate a cache key based on current settings and location
  const generateCacheKey = useCallback((location: string, isGPS: boolean, selectedDate: Date) => {
    const dateStr = formatDateForAPI(selectedDate);
    const key = `${CACHE_KEY}_${location}_${isGPS}_${dateStr}_${settings.prayer.calculationMethod}_${settings.prayer.madhab}`;
    return key.replace(/\s+/g, '_').toLowerCase();
  }, [settings.prayer.calculationMethod, settings.prayer.madhab, formatDateForAPI]);

  // Check if cached data is still valid
  const isCacheValid = useCallback((cachedData: CachedPrayerData): boolean => {
    const now = Date.now();
    const isWithinCacheDuration = (now - cachedData.timestamp) < CACHE_DURATION;
    
    // Check if settings have changed
    const settingsMatch = 
      cachedData.settings.calculationMethod === settings.prayer.calculationMethod &&
      cachedData.settings.madhab === settings.prayer.madhab &&
      cachedData.settings.useGPS === settings.location.useGPS &&
      cachedData.settings.city === settings.location.city;

    return isWithinCacheDuration && settingsMatch;
  }, [settings]);

  // Load cached data
  const loadCachedData = useCallback(async (location: string, isGPS: boolean, selectedDate: Date): Promise<CachedPrayerData | null> => {
    try {
      const cacheKey = generateCacheKey(location, isGPS, selectedDate);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const parsedData: CachedPrayerData = JSON.parse(cached);
        
        if (isCacheValid(parsedData)) {
          console.log('Using cached prayer times for:', location, formatDateForAPI(selectedDate));
          return parsedData;
        } else {
          console.log('Cache expired or settings changed, removing old cache');
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Error loading cached prayer times:', error);
    }
    
    return null;
  }, [generateCacheKey, isCacheValid, formatDateForAPI]);

  // Save data to cache
  const saveCachedData = useCallback(async (
    prayerTimes: PrayerTimes,
    date: string,
    location: string,
    isGPS: boolean,
    selectedDate: Date
  ) => {
    try {
      const cacheKey = generateCacheKey(location, isGPS, selectedDate);
      const dataToCache: CachedPrayerData = {
        prayerTimes,
        date,
        location,
        timestamp: Date.now(),
        selectedDate: formatDateForAPI(selectedDate),
        settings: {
          calculationMethod: settings.prayer.calculationMethod,
          madhab: settings.prayer.madhab,
          useGPS: settings.location.useGPS,
          city: settings.location.city,
        },
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(dataToCache));
      console.log('Prayer times cached for:', location, formatDateForAPI(selectedDate));
    } catch (error) {
      console.error('Error saving prayer times to cache:', error);
    }
  }, [generateCacheKey, settings, formatDateForAPI]);

  // Fetch fresh prayer times from API
  const fetchFreshPrayerTimes = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      
      let response;
      let locationName = '';
      let isGPS = false;
      const dateStr = formatDateForAPI(selectedDate);

      if (settings.location.useGPS) {
        // Use GPS coordinates
        isGPS = true;
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission denied');
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const { latitude, longitude } = location.coords;
        
        // Auto-update calculation method based on location (only for today)
        if (isToday) {
          await autoUpdateCalculationMethod(
            { ...settings, location: { latitude, longitude } },
            updateSettings
          );
        }
        
        response = await prayerTimesApi.getPrayerTimesByCoordinates(latitude, longitude, settings, dateStr);
        
        // Extract location name from API response
        if (response.code === 200 && response.data.meta && response.data.meta.timezone) {
          const timezone = response.data.meta.timezone;
          locationName = timezone.split('/')[1]?.replace(/_/g, ' ') || 'Your Location';
        } else {
          locationName = 'Your Location';
        }
      } else {
        // Use city name
        locationName = settings.location.city || 'New York';
        response = await prayerTimesApi.getPrayerTimesByCity(locationName, settings, 'US', dateStr);
      }

      if (response.code === 200) {
        const times = response.data.timings;
        const dateStr = response.data.date.readable;
        
        setPrayerTimes(times);
        setDate(dateStr);
        setCurrentLocation(locationName);
        setLastUpdated(new Date());
        
        // Cache the data
        await saveCachedData(times, dateStr, locationName, isGPS, selectedDate);
        
        console.log('Fresh prayer times fetched for:', locationName, formatDateForAPI(selectedDate));
      } else {
        throw new Error('Invalid response from prayer times API');
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch prayer times');
    }
  }, [settings, saveCachedData, selectedDate, formatDateForAPI, isToday, updateSettings]);

  // Main function to get prayer times (checks cache first)
  const refreshPrayerTimes = useCallback(async (): Promise<void> => {
    console.log('Refreshing prayer times for date:', selectedDate.toDateString());
    setLoading(true);
    
    try {
      const locationName = settings.location.useGPS ? 'GPS_Location' : (settings.location.city || 'New York');
      const isGPS = settings.location.useGPS;
      
      // Try to load from cache first
      const cachedData = await loadCachedData(locationName, isGPS, selectedDate);
      
      if (cachedData) {
        // Use cached data
        console.log('Using cached data for', formatDateForAPI(selectedDate));
        setPrayerTimes(cachedData.prayerTimes);
        setDate(cachedData.date);
        setCurrentLocation(cachedData.location);
        setLastUpdated(new Date(cachedData.timestamp));
        setError(null);
        console.log('Loaded prayer times from cache for', formatDateForAPI(selectedDate));
      } else {
        // Fetch fresh data
        console.log('Fetching fresh data for', formatDateForAPI(selectedDate));
        await fetchFreshPrayerTimes();
      }
    } catch (error) {
      console.error('Error in refreshPrayerTimes:', error);
      setError('Unable to get prayer times. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [settings.location.useGPS, settings.location.city, loadCachedData, fetchFreshPrayerTimes, formatDateForAPI]);

  // Navigation methods
  const goToPreviousDay = useCallback(async (): Promise<void> => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    console.log('Going to previous day:', previousDay.toDateString());
    setSelectedDate(previousDay);
  }, [selectedDate]);

  const goToNextDay = useCallback(async (): Promise<void> => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    console.log('Going to next day:', nextDay.toDateString());
    setSelectedDate(nextDay);
  }, [selectedDate]);

  const goToToday = useCallback(async (): Promise<void> => {
    console.log('Going to today');
    setSelectedDate(new Date());
  }, []);

  // Clear all cached data
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('Prayer times cache cleared');
    } catch (error) {
      console.error('Error clearing prayer times cache:', error);
    }
  }, []);

  // Initial load and settings change handling
  useEffect(() => {
    refreshPrayerTimes();
  }, [
    settings.prayer.calculationMethod,
    settings.prayer.madhab,
    settings.location.useGPS,
    settings.location.city
  ]);

  // Handle date changes separately to avoid circular dependencies
  useEffect(() => {
    console.log('Selected date changed to:', selectedDate.toDateString());
    refreshPrayerTimes();
  }, [selectedDate]);

  // Set up periodic refresh (only if cache is getting old)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (lastUpdated) {
        const timeSinceUpdate = Date.now() - lastUpdated.getTime();
        // Only refresh if data is older than 1 hour
        if (timeSinceUpdate > 60 * 60 * 1000) {
          console.log('Auto-refreshing prayer times (cache getting old)');
          await fetchFreshPrayerTimes();
        }
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [lastUpdated, fetchFreshPrayerTimes]);

  const value: PrayerTimesContextType = {
    prayerTimes,
    loading,
    error,
    date,
    currentLocation,
    lastUpdated,
    selectedDate,
    refreshPrayerTimes,
    clearCache,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    isToday,
  };

  return (
    <PrayerTimesContext.Provider value={value}>
      {children}
    </PrayerTimesContext.Provider>
  );
};

export const usePrayerTimes = (): PrayerTimesContextType => {
  const context = useContext(PrayerTimesContext);
  if (!context) {
    throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
  }
  return context;
};
