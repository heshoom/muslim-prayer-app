import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { fetchPrayerTimes } from './prayerTimesService';
import { setCachedPrayerTimes, getCachedPrayerTimes } from './prayerTimesCache';

const BACKGROUND_FETCH_TASK = 'PRAYER_TIMES_BACKGROUND_FETCH';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Background fetch task error:', error);
    return BackgroundFetch.Result.Failed;
  }

  try {
    console.log('Background fetch running...');

    // data may contain coordinates; fallback to null
    const { latitude, longitude } = (data && data.coords) || {};
    if (!latitude || !longitude) {
      console.warn('Background fetch: no coordinates provided');
      return BackgroundFetch.Result.NoData;
    }

    const dateStr = new Date().toISOString().slice(0,10);

    // We'll fetch a small set of common methods to keep cache fresh
    const methods = ['mwl','isna','egypt','makkah','karachi','turkey'];
    let anyFetched = false;
    for (const method of methods) {
      try {
        const cached = await getCachedPrayerTimes(latitude, longitude, dateStr, method);
        if (!cached) {
          const resp = await fetchPrayerTimes(latitude, longitude, method);
          await setCachedPrayerTimes(latitude, longitude, dateStr, method, resp);
          anyFetched = true;
        }
      } catch (err) {
        console.warn('Background fetch: error fetching method', method, err);
      }
    }

    return anyFetched ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
  } catch (err) {
    console.error('Background fetch failed:', err);
    return BackgroundFetch.Result.Failed;
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
