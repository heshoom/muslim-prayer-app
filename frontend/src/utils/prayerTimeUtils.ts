import { PrayerTimes } from '../types/prayerTimes';
import { formatTime } from './timeUtils';

export type NextPrayerInfo = {
  name: string;
  time: string;
  location: string;
  remainingTime: {
    hours: number;
    minutes: number;
  };
  progress: number;
};

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const parseTime = (timeStr: string, date: Date = new Date()): Date => {
  // Remove any extra characters and handle 24-hour format
  const cleanTimeStr = timeStr.replace(/[^\d:]/g, '');
  const [hours, minutes] = cleanTimeStr.split(':').map(Number);
  
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
  return result;
};

export const getNextPrayer = (prayerTimes: PrayerTimes, timeFormat: '12h' | '24h' = '12h', location: string = ''): NextPrayerInfo => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // Parse today's prayer times
  const todayPrayers = PRAYER_ORDER.map(name => ({
    name,
    time: parseTime(prayerTimes[name as keyof PrayerTimes], today),
    originalTime: prayerTimes[name as keyof PrayerTimes], // Keep original time string
  }));

  // Find next prayer today
  let nextPrayer = todayPrayers.find(prayer => prayer.time > now);
  let isNextDay = false;

  // If no prayer left today, next prayer is Fajr tomorrow
  if (!nextPrayer) {
    nextPrayer = {
      name: 'Fajr',
      time: parseTime(prayerTimes.Fajr, tomorrow),
      originalTime: prayerTimes.Fajr,
    };
    isNextDay = true;
  }

  // Find current prayer (the last prayer that has passed)
  let currentPrayer;
  if (isNextDay) {
    // If next prayer is tomorrow, current prayer is Isha today
    currentPrayer = todayPrayers[todayPrayers.length - 1]; // Isha
  } else {
    const nextIndex = todayPrayers.findIndex(p => p.name === nextPrayer!.name);
    if (nextIndex === 0) {
      // If next prayer is Fajr, current prayer was Isha yesterday
      // For progress calculation, we'll use a reasonable interval
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      currentPrayer = {
        name: 'Isha',
        time: parseTime(prayerTimes.Isha, yesterday),
        originalTime: prayerTimes.Isha,
      };
    } else {
      currentPrayer = todayPrayers[nextIndex - 1];
    }
  }

  // Calculate remaining time
  const diffMs = nextPrayer.time.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  // Handle negative values (shouldn't happen but just in case)
  const remainingHours = Math.max(0, diffHours);
  const remainingMinutes = Math.max(0, diffMinutes);

  // Calculate progress
  let progress = 0;
  if (currentPrayer) {
    const intervalMs = nextPrayer.time.getTime() - currentPrayer.time.getTime();
    const elapsedMs = now.getTime() - currentPrayer.time.getTime();
    
    if (intervalMs > 0) {
      progress = Math.min(100, Math.max(0, (elapsedMs / intervalMs) * 100));
    }
  }

  return {
    name: nextPrayer.name,
    time: formatTime(nextPrayer.originalTime, timeFormat), // Use same formatting as PrayerCard
    location: location,
    remainingTime: {
      hours: remainingHours,
      minutes: remainingMinutes,
    },
    progress,
  };
};
