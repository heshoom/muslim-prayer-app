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

const parseTime = (timeStr: string | undefined, date: Date = new Date()): Date => {
  if (!timeStr) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }
  const clean = timeStr.toString().replace(/[^0-9:]/g, '');
  const parts = clean.split(':').map(Number);
  const hours = Number.isFinite(parts[0]) ? parts[0] : 0;
  const minutes = Number.isFinite(parts[1]) ? parts[1] : 0;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
};

export const getNextPrayer = (
  prayerTimes: PrayerTimes,
  timeFormat: '12h' | '24h' = '12h',
  location: string = ''
): NextPrayerInfo => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const todayPrayers = PRAYER_ORDER.map((name) => {
    const original = (prayerTimes[name as keyof PrayerTimes] as string) || '00:00';
    return {
      name,
      time: parseTime(original, today),
      originalTime: original,
    };
  });

  let nextPrayer = todayPrayers.find((prayer) => prayer.time > now);
  let isNextDay = false;

  if (!nextPrayer) {
    const fajrOriginal = (prayerTimes.Fajr as string) || '00:00';
    nextPrayer = {
      name: 'Fajr',
      time: parseTime(fajrOriginal, tomorrow),
      originalTime: fajrOriginal,
    };
    isNextDay = true;
  }

  let currentPrayer: { name: string; time: Date; originalTime: string } | undefined;
  if (isNextDay) {
    currentPrayer = todayPrayers[todayPrayers.length - 1];
  } else {
    const nextIndex = todayPrayers.findIndex((p) => p.name === nextPrayer!.name);
    if (nextIndex === 0) {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const ishaOriginal = (prayerTimes.Isha as string) || '00:00';
      currentPrayer = {
        name: 'Isha',
        time: parseTime(ishaOriginal, yesterday),
        originalTime: ishaOriginal,
      };
    } else {
      currentPrayer = todayPrayers[nextIndex - 1];
    }
  }

  const diffMs = nextPrayer.time.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const remainingHours = Math.max(0, diffHours);
  const remainingMinutes = Math.max(0, diffMinutes);

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
    time: formatTime(nextPrayer.originalTime, timeFormat),
    location: location,
    remainingTime: {
      hours: remainingHours,
      minutes: remainingMinutes,
    },
    progress,
  };
};
