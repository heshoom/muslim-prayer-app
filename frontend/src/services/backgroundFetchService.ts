import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { fetchPrayerTimes } from './prayerTimesService';
import { setCachedPrayerTimes, getCachedPrayerTimes } from './prayerTimesCache';

const BACKGROUND_FETCH_TASK = 'PRAYER_TIMES_BACKGROUND_FETCH';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Background fetch task error:', error);
    // BackgroundFetch result codes: 0 = NewData, 1 = NoData, 2 = Failed
    return 2; // Failed
  }

  try {
    console.log('Background fetch running...');

    // data may contain coordinates; fallback to null
    const { latitude, longitude } = (data && data.coords) || {};
    if (!latitude || !longitude) {
      console.warn('Background fetch: no coordinates provided');
      return 1; // NoData
    }

    const dateStr = new Date().toISOString().slice(0,10);

    // We'll fetch a small set of common methods and both madhabs to keep cache fresh
    const methods = ['mwl','isna','egypt','makkah','karachi','turkey'];
    const schools: ('shafi' | 'hanafi')[] = ['shafi', 'hanafi'];
    let anyFetched = false;
    for (const method of methods) {
      for (const school of schools) {
        try {
          const cached = await getCachedPrayerTimes(latitude, longitude, dateStr, method, school);
          if (!cached) {
            const resp = await fetchPrayerTimes(latitude, longitude, method, school);
            await setCachedPrayerTimes(latitude, longitude, dateStr, method, school, resp);
            anyFetched = true;
          }
        } catch (err) {
          console.warn('Background fetch: error fetching', { method, school }, err);
        }
      }
    }

  return anyFetched ? 0 : 1; // NewData : NoData
  } catch (err) {
  console.error('Background fetch failed:', err);
  return 2; // Failed
  }
});

export const registerBackgroundFetchAsync = async (latitude?: number, longitude?: number) => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    console.log('BackgroundFetch status:', status);

    const minimumInterval = 15 * 60; // 15 minutes minimum
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval, // in seconds
      stopOnTerminate: false,
      startOnBoot: true,
      // pass coords in options.data if available
      ...(latitude && longitude ? { parameters: { coords: { latitude, longitude } } } : {}),
    });
    console.log('Background fetch registered');
  } catch (err) {
    console.error('Failed to register background fetch task:', err);
  }
};

export const unregisterBackgroundFetchAsync = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background fetch unregistered');
  } catch (err) {
    console.error('Failed to unregister background fetch task:', err);
  }
};
