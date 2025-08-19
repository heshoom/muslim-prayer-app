import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerTimesResponse } from './prayerTimesService';

const makeCacheKey = (latitude: number, longitude: number, date: string, method: string) => {
  // round coordinates to 4 decimal places to avoid tiny float mismatches
  const lat = latitude.toFixed(4);
  const lon = longitude.toFixed(4);
  return `prayerTimesCache:${lat}:${lon}:${date}:${method}`;
};

export const getCachedPrayerTimes = async (
  latitude: number,
  longitude: number,
  date: string,
  method: string,
): Promise<PrayerTimesResponse | null> => {
  try {
    const key = makeCacheKey(latitude, longitude, date, method);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PrayerTimesResponse;
  } catch (error) {
    console.warn('Error reading prayer times cache:', error);
    return null;
  }
};

export const setCachedPrayerTimes = async (
  latitude: number,
  longitude: number,
  date: string,
  method: string,
  payload: PrayerTimesResponse,
): Promise<void> => {
  try {
    const key = makeCacheKey(latitude, longitude, date, method);
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    console.warn('Error writing prayer times cache:', error);
  }
};

export const clearPrayerTimesCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter(k => k.startsWith('prayerTimesCache:'));
    if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
  } catch (error) {
    console.warn('Error clearing prayer times cache:', error);
  }
};

export default {
  getCachedPrayerTimes,
  setCachedPrayerTimes,
  clearPrayerTimesCache,
};
