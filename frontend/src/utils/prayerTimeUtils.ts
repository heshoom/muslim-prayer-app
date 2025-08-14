import { PrayerTimes } from '../types/prayerTimes';

export type NextPrayerInfo = {
  name: string;
  time: string;
  remainingTime: {
    hours: number;
    minutes: number;
  };
  progress: number;
};

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const parseTime = (timeStr: string): Date => {
  const today = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
};

export const getNextPrayer = (prayerTimes: PrayerTimes): NextPrayerInfo => {
  const now = new Date();
  const prayers = PRAYER_ORDER.map(name => ({
    name,
    time: parseTime(prayerTimes[name as keyof PrayerTimes]),
  }));

  // Find the next prayer
  const nextPrayer = prayers.find(prayer => prayer.time > now) || prayers[0];
  const currentPrayer = prayers[Math.max(0, prayers.indexOf(prayers.find(prayer => prayer.time > now) || prayers[0]) - 1)];

  // Calculate remaining time
  const diffMs = nextPrayer.time.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  // Calculate progress
  const intervalMs = nextPrayer.time.getTime() - currentPrayer.time.getTime();
  const elapsedMs = now.getTime() - currentPrayer.time.getTime();
  const progress = Math.min(100, Math.max(0, (elapsedMs / intervalMs) * 100));

  return {
    name: nextPrayer.name,
    time: nextPrayer.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    remainingTime: {
      hours: diffHours,
      minutes: diffMinutes,
    },
    progress,
  };
};
