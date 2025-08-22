import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerTimes } from './prayerTimesService';
import { athanAudioService } from './athanAudioService';

/**
 * Notification system overview
 * ----------------------------
 * This service centralizes all scheduling, cancellation and rescheduling logic
 * for prayer-time notifications. Key behaviours and flow:
 *
 * 1) Initialization / permissions
 *    - Call `setupNotifications()` to request OS notification permissions.
 *    - On Android we ensure a dedicated channel via `ensureAndroidPrayerChannel()`
 *      (high importance / heads-up, bypass DND where possible).
 *
 * 2) Daily scheduling (primary entrypoint)
 *    - `scheduleDailyNotifications(prayerTimes, location, settings)` is the
 *      main routine used to schedule notifications for the current day.
 *    - It implements a "clean slate" approach:
 *        a) Cancels all existing scheduled notifications.
 *        b) Computes a schedule signature (date + location + settings + times)
 *           and persists it under 'prayerNotifications:lastScheduleSignature'.
 *           If the signature matches the stored value for today, the call is
 *           a no-op (prevents duplicate scheduling during settings churn).
 *        c) Parses the five canonical prayer times and converts them to
 *           Date objects for today.
 *        d) Filters only upcoming times (future relative to now) and
 *           schedules those using `schedulePrayerNotificationWithFutureGuard()`.
 *    - The above guarantees we never re-schedule past-times for today and
 *      avoids backlog/double-delivery issues when settings change.
 *
 * 3) Per-prayer scheduling details
 *    - `schedulePrayerNotificationWithFutureGuard()` performs validation and
 *      only schedules a one-time notification for today if the time is still
 *      in the future.
 *    - `schedulePrayerNotification()` is the lower-level helper that can
 *      schedule either a one-time date trigger (for today) or a repeating
 *      calendar trigger (for future days). Behavior:
 *        - If the time has already passed today, a repeating calendar trigger
 *          is created (repeats daily starting tomorrow).
 *        - If the time is upcoming today, a one-time trigger is scheduled for
 *          today AND a separate repeating calendar notification is also
 *          scheduled for future days (so daily delivery continues).
 *    - Notification payload `data` contains metadata (prayerName, prayerTime,
 *      scheduledAt, scheduleSignature, isRepeating, type='prayer-time') which
 *      allows targeted cancellation and handling in `NotificationContext`.
 *
 * 4) Cancellation / targeted cleanup
 *    - Several helpers exist: `cancelAllNotifications()`,
 *      `cancelNotificationsByDate()`, `cancelNotificationsBySignature()`,
 *      and `cancelNotificationsByType()` to remove stale or undesired
 *      scheduled entries.
 *
 * 5) Daily reschedule guard
 *    - `rescheduleDailyIfNeeded(prayerTimes, location, settings)` is a
 *      lightweight guard that checks AsyncStorage key `app:lastScheduledDay`.
 *      If a new day is detected, it calls `scheduleDailyNotifications()` to
 *      refresh schedules. This method is intended to be invoked from an
 *      app-start hook or background task (no automatic OS job is relied on
 *      in this trimmed build).
 *
 * 6) Audio handling
 *    - The service sets `sound` and vibration hints on scheduled notifications
 *      but central audio playback (full athan playback) is handled by the
 *      app-level `NotificationContext` using `athanAudioService` to avoid
 *      double playback and keep notification handlers consolidated.
 *
 * Persistence keys of interest:
 *    - 'prayerNotifications:lastScheduleSignature' : last schedule signature
 *      for today (prevents duplicate schedules)
 *    - 'app:lastScheduledDay' : ISO date string of last day the app scheduled
 *      notifications (used by daily rescheduler guard)
 *
 * Notes / rationale:
 *  - We prefer a clean-cancel-and-reschedule pattern to avoid duplicate
 *    notifications when settings change or the user re-runs the scheduler.
 *  - Pre-prayer reminders and debug helpers were intentionally disabled in
 *    this build; the core five-prayer scheduling remains active.
 */

// Ensure Android notification channel is created at startup
export async function ensureAndroidPrayerChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync('prayer-times', {
      name: 'Prayer Times',
      importance: Notifications.AndroidImportance.HIGH, // heads-up notifications
      vibrationPattern: [0, 500, 250, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: 'default', // use a raw sound if you add one to android/res/raw
      bypassDnd: true,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
      },
    });
    console.log('Android prayer-times notification channel created/updated');
  } catch (error) {
    console.error('Error creating Android notification channel:', error);
  }
}

export interface NotificationSettings {
  enabled: boolean;
  adhan: boolean;
  athanSound: string;
  vibrate: boolean;
  prePrayer: boolean;
  prePrayerTime: number;
  timeFormat?: string; // '12h' or '24h'
}

// Note: The global notification handler is configured in NotificationContext.
// Avoid setting another handler here to prevent conflicts and double playback.

export interface PrayerNotificationService {
  setupNotifications: () => Promise<boolean>;
  scheduleAllPrayerNotifications: (
    prayerTimes: PrayerTimes, 
    location: string, 
    settings: NotificationSettings
  ) => Promise<void>;
  scheduleDailyNotifications: (
    prayerTimes: PrayerTimes, 
    location: string, 
    settings: NotificationSettings
  ) => Promise<void>;
  rescheduleDailyIfNeeded: (
    prayerTimes: PrayerTimes, 
    location: string, 
    settings: NotificationSettings
  ) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  // Debug helpers removed in this build
}

class PrayerNotificationServiceImpl implements PrayerNotificationService {
  // Cancel all notifications for a given date (by matching data.date)
  private async cancelNotificationsByDate(dateStr: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduled.filter((notification: any) => {
        const data = notification?.content?.data;
        return data?.date === dateStr;
      });
      for (const notification of toCancel) {
        if ((notification as any).identifier) {
          await Notifications.cancelScheduledNotificationAsync((notification as any).identifier);
        }
      }
      if (toCancel.length > 0) {
        console.log(`Cancelled ${toCancel.length} notifications for date: ${dateStr}`);
      }
    } catch (error) {
      console.error(`Error cancelling notifications for date ${dateStr}:`, error);
    }
  }

  private async cancelNotificationsBySignature(signature: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduled.filter((notification: any) => {
        const data = notification?.content?.data;
        return data?.scheduleSignature === signature;
      });
      for (const notification of toCancel) {
        if ((notification as any).identifier) {
          await Notifications.cancelScheduledNotificationAsync((notification as any).identifier);
        }
      }
      if (toCancel.length > 0) {
        console.log(`Cancelled ${toCancel.length} notifications with signature: ${signature}`);
      }
    } catch (error) {
      console.error(`Error cancelling notifications with signature ${signature}:`, error);
    }
  }
  async setupNotifications(): Promise<boolean> {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          // Don't request critical alerts; we use time-sensitive interruption level instead
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error setting up notifications:', error);
      return false;
    }
  }

  async scheduleAllPrayerNotifications(
    prayerTimes: PrayerTimes, 
    location: string, 
    settings: NotificationSettings
  ): Promise<void> {
    // Use the clean daily reschedule pattern instead
    await this.scheduleDailyNotifications(prayerTimes, location, settings);
  }

  async scheduleDailyNotifications(
    prayerTimes: PrayerTimes, 
    location: string, 
    settings: NotificationSettings
  ): Promise<void> {
    try {
      if (!settings.enabled) {
        console.log('Notifications are disabled in settings');
        await this.cancelAllNotifications(); // Clear all if disabled
        return;
      }

      // Ensure Android channel is created
      await ensureAndroidPrayerChannel();

      // Cancel ALL existing notifications before rescheduling (clean slate)
      await this.cancelAllNotifications();
      console.log('Cancelled all existing notifications for clean daily reschedule');

      const canonicalLocation = (typeof location === 'string' && location.length < 40) ? location : 'Unknown';
      // Build a schedule signature so we can avoid redundant reschedules during
      // settings churn (e.g. toggling pre-prayer). This prevents duplicate
      // scheduling that could lead to immediate/backlog deliveries.
      const todayKey = new Date().toISOString().slice(0, 10);
      const signature = `${todayKey}|${canonicalLocation}|${settings.enabled}|${settings.adhan}|${settings.athanSound}|${settings.vibrate}|${prayerTimes.Fajr}|${prayerTimes.Dhuhr}|${prayerTimes.Asr}|${prayerTimes.Maghrib}|${prayerTimes.Isha}|pre:${settings.prePrayer}|preMin:${settings.prePrayerTime}`;
      const SIG_KEY = 'prayerNotifications:lastScheduleSignature';
      try {
        const prev = await AsyncStorage.getItem(SIG_KEY);
        if (prev === signature) {
          console.log('Prayer notifications already scheduled for today with same signature; skipping reschedule.');
          return;
        }
      } catch (e) {
        // ignore storage errors and continue scheduling
      }
      const prayers = [
        { name: 'Fajr', time: prayerTimes.Fajr },
        { name: 'Dhuhr', time: prayerTimes.Dhuhr },
        { name: 'Asr', time: prayerTimes.Asr },
        { name: 'Maghrib', time: prayerTimes.Maghrib },
        { name: 'Isha', time: prayerTimes.Isha },
      ];

      // Convert to Date objects for today and filter only those still in the future
      const now = new Date();
      const today = new Date();
      const parsedPrayers = prayers.map(p => {
        const clean = (p.time || '').toString().replace(/[^0-9:]/g, '').trim();
        const parts = (clean || '').split(':').map(Number);
        const hr = Number.isFinite(parts[0]) ? parts[0] : NaN;
        const mn = Number.isFinite(parts[1]) ? parts[1] : 0;
        const dt = new Date(today);
        if (Number.isFinite(hr)) dt.setHours(hr, mn, 0, 0);
        return { ...p, date: dt };
      });

      // Schedule all five canonical prayers. For prayers that haven't passed
      // today we'll schedule a one-time notification for today and a repeating
      // notification for future days. For prayers that have already passed
      // today we'll schedule a repeating notification starting tomorrow.
      // Using the lower-level schedulePrayerNotification keeps this behaviour
      // consistent and avoids skipping any prayer entirely.
      for (const p of parsedPrayers) {
        try {
          await this.schedulePrayerNotification(
            p.name,
            p.time,
            canonicalLocation,
            new Date(),
            settings,
            signature
          );
        } catch (innerErr) {
          console.error(`Failed to schedule prayer ${p.name}:`, innerErr);
        }
      }

      // Schedule pre-prayer reminders if enabled
      if (settings.prePrayer) {
        for (const p of parsedPrayers) {
          try {
            await this.schedulePrePrayerReminderWithFutureGuard(
              p.name,
              p.time,
              canonicalLocation,
              settings.prePrayerTime,
              settings
            );
          } catch (innerErr) {
            console.error(`Failed to schedule pre-prayer reminder for ${p.name}:`, innerErr);
          }
        }
      }

      // Persist signature so repeated calls with identical state do nothing
      try {
        await AsyncStorage.setItem(SIG_KEY, signature);
        // Also mark the last scheduled day to prevent reschedules within the same day
        await AsyncStorage.setItem('app:lastScheduledDay', todayKey);
      } catch (e) {
        // best-effort
      }
      console.log('Daily prayer notifications and reminders scheduled successfully');
      // Also schedule a daily reschedule job so the app can refresh schedules
      // at a consistent time each day. This schedules a repeating notification
      // with type 'daily-reschedule' that the app listens for and responds to
      // by re-fetching/rescheduling prayer notifications. Best-effort only.
      try {
        await this.scheduleDailyRescheduleJob();
      } catch (e) {
        // best-effort
        console.warn('Failed to schedule daily reschedule job:', e);
      }
    } catch (error) {
      console.error('Error scheduling daily prayer notifications:', error);
    }
  }

  // Schedule a lightweight repeating notification used to trigger a daily
  // reschedule action. NotificationContext listens for data.type === 'daily-reschedule'
  // and runs the reschedule routine. We avoid scheduling duplicates using AsyncStorage.
  private async scheduleDailyRescheduleJob(): Promise<void> {
    try {
      const KEY = 'prayerNotifications:dailyRescheduleScheduled';
      const already = await AsyncStorage.getItem(KEY);
      if (already === '1') return;

      // Schedule at 00:05 local time (small grace after midnight)
      const now = new Date();
      const next = new Date(now);
      next.setHours(0, 5, 0, 0);
      if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
      const hour = next.getHours();
      const minute = next.getMinutes();

      const trigger = Platform.select({
        ios: ({ hour, minute, repeats: true } as any),
        android: ({ hour, minute, repeats: true, channelId: 'prayer-times' } as any),
        default: ({ hour, minute, repeats: true } as any),
      }) as any;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily reschedule',
          body: 'Refreshing daily prayer notification schedules',
          data: { type: 'daily-reschedule' },
        },
        trigger,
      });

      await AsyncStorage.setItem(KEY, '1');
      console.log('Scheduled daily reschedule job, ID:', id, 'trigger:', { hour, minute });
    } catch (error) {
      console.warn('Error scheduling daily reschedule job:', error);
    }
  }

  // scheduleDailyRescheduleJob removed — debug scheduling disabled
  // async scheduleDailyRescheduleJob(): Promise<void> {
  //   // removed
  // }
  async stopCurrentSound(): Promise<void> {
    try {
      await athanAudioService.stopCurrentSound();
    } catch (error) {
      console.error('Error stopping current sound via athanAudioService:', error);
    }
  }

  private getAthanSoundUri(athanSound: string, adhanEnabled: boolean): string | undefined {
    if (!adhanEnabled || athanSound === 'default') {
      return 'default';
    }

    // For expo-notifications, we need to use local file paths
    // The audio files will be bundled with the app
    const athanFiles: { [key: string]: string } = {
      // iOS expects bundled short aiff filenames that are included in the Xcode project
      // Android will still use default channel sound; full playback handled by app audio service
      'makkah': 'makkah_short.aiff',
      'madinah': 'madinah-03_short.aiff',
      'egypt': 'egypt_short.aiff',
      'turkey': 'turkey_short.aiff',
      'nasiralqatami': 'nasiralqatami_short.aiff',
    };

    // For custom sounds, we'll use the default system sound for now
    // Custom notification sounds require additional setup in native projects
    return athanFiles[athanSound] || 'default';
  }

  private async schedulePrayerNotificationWithFutureGuard(
    prayerName: string,
    prayerTime: string,
    location: string,
    settings: NotificationSettings
  ): Promise<void> {
    try {
      // Sanitize time string (handles values like "05:13 (EDT)" or "05:13:00")
      const clean = (prayerTime || '').toString().replace(/[^\d:]/g, '').trim();
      const parts = clean.split(':');
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);

      // Validate parsed values
      const isValid = Number.isFinite(hours) && Number.isFinite(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      if (!isValid) {
        console.warn(`Skipping scheduling for ${prayerName}: invalid time string "${prayerTime}" -> parsed "${clean}"`);
        return;
      }

      // Create notification date for today
      const notificationDate = new Date();
      notificationDate.setHours(hours, minutes, 0, 0);

      const now = new Date();
      
      // SIMPLE LOGIC: Only schedule if prayer time is in the future.
      // Use a small grace window to avoid scheduling times that are effectively now
      const GRACE_MS = 2000; // 2 seconds
      if (notificationDate.getTime() <= now.getTime() + GRACE_MS) {
        console.log(`${prayerName} has already passed (or within grace window) today, skipping notification`);
        return; // Don't schedule anything for past/near-immediate prayers
      }

      console.log(`${prayerName} is upcoming today, scheduling for: ${notificationDate.toLocaleString()}`);

      let soundUri: string | undefined = 'default';
      if (settings.adhan) {
        if (Platform.OS === 'ios') {
          soundUri = this.getAthanSoundUri(settings.athanSound, settings.adhan);
        } else if (Platform.OS === 'android') {
          soundUri = 'default';
        }
      }

      // Schedule the notification using a TIME_INTERVAL trigger (seconds from now)
      const seconds = Math.max(1, Math.ceil((notificationDate.getTime() - now.getTime()) / 1000));
      const trigger: any = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayerName} Prayer Time`,
          body: settings.adhan
            ? `It's time for ${prayerName} prayer in ${location}. 🕌`
            : `It's time for ${prayerName} prayer in ${location}`,
          sound: soundUri,
          vibrate: settings.vibrate ? [0, 500, 250, 500] : undefined,
          interruptionLevel: Platform.OS === 'ios' ? 'timeSensitive' : undefined,
          priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.MAX : undefined,
          data: {
            prayerName,
            prayerTime,
            location,
            type: 'prayer-time',
            athanEnabled: settings.adhan,
            athanSound: settings.athanSound,
            scheduledAt: notificationDate.getTime(),
          },
        },
        trigger,
      });

      console.log(`Scheduled ${prayerName} notification for ${notificationDate.toLocaleString()} (in ${seconds}s), ID: ${notificationId}`);
    } catch (error) {
      console.error(`Error scheduling ${prayerName} notification:`, error);
    }
  }

  private async schedulePrePrayerReminderWithFutureGuard(
    prayerName: string,
    prayerTime: string,
    location: string,
    minutesBefore: number,
    settings: NotificationSettings
  ): Promise<void> {
    try {
  // Sanitize time string
  const clean = (prayerTime || '').toString().replace(/[^\d:]/g, '').trim();
      const parts = clean.split(':');
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);

      const isValid = Number.isFinite(hours) && Number.isFinite(minutes);
      if (!isValid) {
        console.warn(`Skipping pre-prayer for ${prayerName}: invalid time string "${prayerTime}"`);
        return;
      }

      const notificationDate = new Date();
      notificationDate.setHours(hours, minutes, 0, 0);
      notificationDate.setMinutes(notificationDate.getMinutes() - Number(minutesBefore));

      const now = new Date();
      const GRACE_MS = 2000; // 2 seconds
      if (notificationDate.getTime() <= now.getTime() + GRACE_MS) {
        console.log(`Pre-prayer reminder for ${prayerName} would be in the past or within grace window, skipping`);
        return;
      }

      const contentTitle = `Reminder: ${prayerName} in ${minutesBefore} min`;
      // Format displayed time according to settings.timeFormat if provided
      let displayTime = prayerTime;
      try {
        const dt = new Date();
        dt.setHours(hours, minutes, 0, 0);
        if (settings.timeFormat === '12h') {
          // use locale time with AM/PM
          displayTime = dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        } else {
          // default to 24h
          displayTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
      } catch (e) {
        // fallback to raw prayerTime string
        displayTime = prayerTime;
      }
      const contentBody = `Upcoming ${prayerName} prayer in ${minutesBefore} minutes at ${displayTime}`;

      const seconds = Math.max(1, Math.ceil((notificationDate.getTime() - now.getTime()) / 1000));
      const trigger: any = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: contentTitle,
          body: contentBody,
          sound: false,
          vibrate: settings.vibrate ? [0, 250, 250] : undefined,
          data: {
            type: 'pre-prayer',
            prayerName,
            prayerTime,
            minutesBefore,
            location,
          },
        },
        trigger,
      });

      console.log(`Scheduled pre-prayer reminder for ${prayerName} at ${notificationDate.toLocaleString()}, ID: ${id}`);
    } catch (error) {
      console.error(`Error scheduling pre-prayer reminder for ${prayerName}:`, error);
    }
  }

  private async schedulePrayerNotification(
    prayerName: string,
    prayerTime: string,
    location: string,
    date: Date,
    settings: NotificationSettings,
    scheduleSignature?: string
  ): Promise<void> {
    try {
      // Sanitize time string (handles values like "05:13 (EDT)" or "05:13:00")
      const clean = (prayerTime || '').toString().replace(/[^\d:]/g, '').trim();
      const parts = clean.split(':');
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);

      // Validate parsed values
      const isValid = Number.isFinite(hours) && Number.isFinite(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      if (!isValid) {
        console.warn(`Skipping scheduling for ${prayerName}: invalid time string "${prayerTime}" -> parsed "${clean}"`);
        return;
      }
      

      const notificationDate = new Date(date);
      notificationDate.setHours(hours, minutes, 0, 0);

      const now = new Date();
  const GRACE_MS = 2000; // 2 seconds
  const hasPassedToday = notificationDate.getTime() <= now.getTime() + GRACE_MS;
      
      // If prayer time has passed today, schedule for tomorrow
      if (hasPassedToday) {
        notificationDate.setDate(notificationDate.getDate() + 1);
        console.log(`${prayerName} has passed today, scheduling for tomorrow: ${notificationDate.toLocaleString()}`);
      } else {
        console.log(`${prayerName} is upcoming today, scheduling for: ${notificationDate.toLocaleString()}`);
      }

      let soundUri: string | undefined = 'default';
      if (settings.adhan) {
        if (Platform.OS === 'ios') {
          // Use the short bundled aiff names
          soundUri = this.getAthanSoundUri(settings.athanSound, settings.adhan);
        } else if (Platform.OS === 'android') {
          // Android will use channel sound config; keep 'default' here
          soundUri = 'default';
        }
      }

      const scheduledAt = notificationDate.getTime();

      // Use a TIME_INTERVAL one-time trigger for today's/tomorrow's notification.
      const seconds = Math.max(1, Math.ceil((notificationDate.getTime() - now.getTime()) / 1000));
      const triggerTimeInterval: any = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayerName} Prayer Time`,
          body: settings.adhan
            ? `It's time for ${prayerName} prayer in ${location}. \ud83d\udd4c`
            : `It's time for ${prayerName} prayer in ${location}`,
          sound: soundUri,
          vibrate: settings.vibrate ? [0, 500, 250, 500] : undefined,
          interruptionLevel: Platform.OS === 'ios' ? 'timeSensitive' : undefined,
          priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.MAX : undefined,
          data: {
            prayerName,
            prayerTime,
            location,
            type: 'prayer-time',
            athanEnabled: settings.adhan,
            athanSound: settings.athanSound,
            scheduledAt,
            scheduleSignature,
            isRepeating: false,
          },
        },
        trigger: triggerTimeInterval,
      });

      console.log(`Scheduled ${prayerName} notification for ${notificationDate.toLocaleString()} (in ${seconds}s), ID: ${notificationId}, Sound: ${soundUri}`);
    } catch (error) {
      console.error(`Error scheduling ${prayerName} notification:`, error);
    }
  }

  // schedulePrePrayerReminderWithFutureGuard removed — pre-prayer reminders disabled in this build
  // private async schedulePrePrayerReminderWithFutureGuard(...) { /* removed */ }

  // schedulePrePrayerReminder removed — pre-prayer reminders disabled in this build
  // private async schedulePrePrayerReminder(...) { /* removed */ }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  private async cancelNotificationsByType(type: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduled.filter((notification: any) => {
        const data = notification?.content?.data;
        return data?.type === type;
      });

      console.log(`Cancelling ${toCancel.length} notifications of type: ${type}`);
      
      for (const notification of toCancel) {
        if ((notification as any).identifier) {
          await Notifications.cancelScheduledNotificationAsync((notification as any).identifier);
        }
      }
    } catch (error) {
      console.error(`Error cancelling notifications of type ${type}:`, error);
    }
  }

  // getScheduledNotificationsSummary removed — debug summary disabled
  // async getScheduledNotificationsSummary() { /* removed */ }

  // Test method to schedule a notification for 10 seconds from now
  // testNotification removed — debug test scheduling disabled
  // async testNotification() { /* removed */ }

  // Method to handle daily rescheduling at midnight (called from background tasks or app launch)
  async rescheduleDailyIfNeeded(
    prayerTimes: PrayerTimes, 
    location: string, 
    settings: NotificationSettings
  ): Promise<void> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const lastScheduledDay = await AsyncStorage.getItem('app:lastScheduledDay');
      
      if (lastScheduledDay !== today) {
        console.log('New day detected - rescheduling notifications');
        await this.scheduleDailyNotifications(prayerTimes, location, settings);
        await AsyncStorage.setItem('app:lastScheduledDay', today);
      }
    } catch (error) {
      console.error('Error in daily rescheduler:', error);
    }
  }
}

// Export singleton instance
export const prayerNotificationService: PrayerNotificationService = new PrayerNotificationServiceImpl();

// Helper function to get notification permissions status
export const getNotificationPermissionStatus = async (): Promise<string> => {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
};

// Example test usage removed: use the exported `schedulePrayerNotification(...)`
// helper above (it supports both one-time date triggers and calendar repeats).

