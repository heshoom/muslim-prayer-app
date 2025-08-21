import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerTimes } from './prayerTimesService';
import { athanAudioService } from './athanAudioService';

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
  getScheduledNotificationsSummary: () => Promise<string>;
  testNotification: () => Promise<void>;
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
      const prayers = [
        { name: 'Fajr', time: prayerTimes.Fajr },
        { name: 'Dhuhr', time: prayerTimes.Dhuhr },
        { name: 'Asr', time: prayerTimes.Asr },
        { name: 'Maghrib', time: prayerTimes.Maghrib },
        { name: 'Isha', time: prayerTimes.Isha },
      ];

      // Schedule both prayer notifications and pre-prayer reminders with future date guards
      for (const prayer of prayers) {
        // Schedule the main prayer notification
        await this.schedulePrayerNotificationWithFutureGuard(
          prayer.name, 
          prayer.time, 
          canonicalLocation, 
          settings
        );

        // Schedule pre-prayer reminder if enabled
        if (settings.prePrayer && settings.prePrayerTime > 0) {
          await this.schedulePrePrayerReminderWithFutureGuard(
            prayer.name, 
            prayer.time, 
            canonicalLocation, 
            settings
          );
        }
      }

      console.log('Daily prayer notifications and reminders scheduled successfully');
    } catch (error) {
      console.error('Error scheduling daily prayer notifications:', error);
    }
  }
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
      
      // SIMPLE LOGIC: Only schedule if prayer time is in the future
      if (notificationDate <= now) {
        console.log(`${prayerName} has already passed today, skipping notification`);
        return; // Don't schedule anything for past prayers
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

      // Schedule the notification
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
        trigger: {
          date: notificationDate,
        } as any,
      });

      console.log(`Scheduled ${prayerName} notification for ${notificationDate.toLocaleString()}, ID: ${notificationId}`);
    } catch (error) {
      console.error(`Error scheduling ${prayerName} notification:`, error);
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
      const hasPassedToday = notificationDate.getTime() <= now.getTime();
      
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

      // For prayer times that haven't passed today, use a one-time trigger for today
      // and schedule a separate repeating notification for future days
      let trigger: Notifications.NotificationTriggerInput;
      
      if (hasPassedToday) {
        // Prayer has passed today - use repeating calendar trigger starting tomorrow
        trigger = Platform.select({
          ios: ({
            hour: hours,
            minute: minutes,
            repeats: true,
          } as any),
          android: ({
            hour: hours,
            minute: minutes,
            repeats: true,
            channelId: 'prayer-times',
          } as any),
          default: ({
            hour: hours,
            minute: minutes,
            repeats: true,
          } as any),
        }) as any;
      } else {
        // Prayer hasn't passed today - use one-time trigger for today
        trigger = {
          date: notificationDate,
        } as any;
        
        // Also schedule a repeating notification for future days
        const repeatTrigger = Platform.select({
          ios: ({
            hour: hours,
            minute: minutes,
            repeats: true,
          } as any),
          android: ({
            hour: hours,
            minute: minutes,
            repeats: true,
            channelId: 'prayer-times',
          } as any),
          default: ({
            hour: hours,
            minute: minutes,
            repeats: true,
          } as any),
        }) as any;

        // Schedule the repeating notification with a different ID
        const repeatNotificationId = await Notifications.scheduleNotificationAsync({
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
              scheduledAt,
              scheduleSignature,
              isRepeating: true,
            },
          },
          trigger: repeatTrigger,
        });
        
        console.log(`Scheduled repeating ${prayerName} notification for future days, ID: ${repeatNotificationId}`);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayerName} Prayer Time`,
          body: settings.adhan 
            ? `It's time for ${prayerName} prayer in ${location}. \ud83d\udd4c` 
            : `It's time for ${prayerName} prayer in ${location}`,
          sound: soundUri,
          vibrate: settings.vibrate ? [0, 500, 250, 500] : undefined,
          // iOS: ensure immediate delivery (requires time-sensitive entitlement enabled)
          interruptionLevel: Platform.OS === 'ios' ? 'timeSensitive' : undefined,
          // Android: highest priority for heads-up
          priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.MAX : undefined,
          data: {
            prayerName,
            prayerTime,
            location,
            // Align with NotificationContext to centralize audio handling
            type: 'prayer-time',
            athanEnabled: settings.adhan,
            athanSound: settings.athanSound,
            scheduledAt,
            scheduleSignature,
            isRepeating: hasPassedToday,
          },
        },
        trigger,
      });

      if (hasPassedToday) {
        console.log(`Scheduled ${prayerName} repeating notification starting tomorrow, ID: ${notificationId}, Sound: ${soundUri}`);
      } else {
        console.log(`Scheduled ${prayerName} notification for today at ${notificationDate.toLocaleString()}, ID: ${notificationId}, Sound: ${soundUri}`);
      }
    } catch (error) {
      console.error(`Error scheduling ${prayerName} notification:`, error);
    }
  }

  private async schedulePrePrayerReminderWithFutureGuard(
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
        console.warn(`Skipping pre-prayer reminder for ${prayerName}: invalid time string "${prayerTime}" -> parsed "${clean}"`);
        return;
      }

      // Calculate reminder time (prayer time minus pre-prayer minutes)
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);
      
      const reminderDate = new Date(prayerDate.getTime() - (settings.prePrayerTime * 60 * 1000));
      const now = new Date();

      // SIMPLE LOGIC: Only schedule if reminder time is in the future
      if (reminderDate <= now) {
        console.log(`${prayerName} reminder has already passed today, skipping notification`);
        return; // Don't schedule anything for past reminders
      }

      console.log(`${prayerName} reminder is upcoming today, scheduling for: ${reminderDate.toLocaleString()}`);

      // Schedule the reminder notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 ${prayerName} Prayer Reminder`,
          body: `${prayerName} prayer is in ${settings.prePrayerTime} minutes. Prepare for prayer.`,
          sound: true,
          vibrate: settings.vibrate ? [0, 150, 150, 150] : undefined,
          interruptionLevel: Platform.OS === 'ios' ? 'timeSensitive' : undefined,
          priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.HIGH : undefined,
          data: {
            prayerName,
            prayerTime,
            location,
            type: 'pre-prayer-reminder',
            prePrayerTime: settings.prePrayerTime,
            scheduledAt: reminderDate.getTime(),
          },
        },
        trigger: {
          date: reminderDate,
        } as any,
      });

      console.log(`Scheduled ${prayerName} reminder notification for ${reminderDate.toLocaleString()}, ID: ${notificationId}`);
    } catch (error) {
      console.error(`Error scheduling ${prayerName} reminder notification:`, error);
    }
  }

  private async schedulePrePrayerReminder(
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
        console.warn(`Skipping pre-prayer reminder for ${prayerName}: invalid time string "${prayerTime}" -> parsed "${clean}"`);
        return;
      }

      // Calculate reminder time
      const reminderDate = new Date(date);
      reminderDate.setHours(hours, minutes, 0, 0);
      reminderDate.setMinutes(reminderDate.getMinutes() - settings.prePrayerTime);

      const now = new Date();
      const hasPassedToday = reminderDate.getTime() <= now.getTime();
      
      // If reminder time has passed today, schedule for tomorrow
      if (hasPassedToday) {
        reminderDate.setDate(reminderDate.getDate() + 1);
        console.log(`${prayerName} reminder has passed today, scheduling for tomorrow: ${reminderDate.toLocaleString()}`);
      } else {
        console.log(`${prayerName} reminder is upcoming today, scheduling for: ${reminderDate.toLocaleString()}`);
      }

      const scheduledAt = reminderDate.getTime();

      // For reminders that haven't passed today, use a one-time trigger for today
      // and schedule a separate repeating notification for future days
      let trigger: Notifications.NotificationTriggerInput;
      
      if (hasPassedToday) {
        // Reminder has passed today - use repeating calendar trigger starting tomorrow
        trigger = Platform.select({
          ios: ({
            hour: reminderDate.getHours(),
            minute: reminderDate.getMinutes(),
            repeats: true,
          } as any),
          android: ({
            hour: reminderDate.getHours(),
            minute: reminderDate.getMinutes(),
            repeats: true,
            channelId: 'prayer-times',
          } as any),
          default: ({
            hour: reminderDate.getHours(),
            minute: reminderDate.getMinutes(),
            repeats: true,
          } as any),
        }) as any;
      } else {
        // Reminder hasn't passed today - use one-time trigger for today
        trigger = {
          date: reminderDate,
        } as any;
        
        // Also schedule a repeating notification for future days
        const repeatTrigger = Platform.select({
          ios: ({
            hour: reminderDate.getHours(),
            minute: reminderDate.getMinutes(),
            repeats: true,
          } as any),
          android: ({
            hour: reminderDate.getHours(),
            minute: reminderDate.getMinutes(),
            repeats: true,
            channelId: 'prayer-times',
          } as any),
          default: ({
            hour: reminderDate.getHours(),
            minute: reminderDate.getMinutes(),
            repeats: true,
          } as any),
        }) as any;

        // Schedule the repeating notification with a different ID
        const repeatNotificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🔔 ${prayerName} Prayer Reminder`,
            body: `${prayerName} prayer is in ${settings.prePrayerTime} minutes. Prepare for prayer.`,
            sound: true,
            vibrate: settings.vibrate ? [0, 150, 150, 150] : undefined,
            interruptionLevel: Platform.OS === 'ios' ? 'timeSensitive' : undefined,
            priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.HIGH : undefined,
            data: {
              prayerName,
              prayerTime,
              location,
              type: 'pre-prayer-reminder',
              prePrayerTime: settings.prePrayerTime,
              scheduledAt,
              scheduleSignature,
              isRepeating: true,
            },
          },
          trigger: repeatTrigger,
        });
        
        console.log(`Scheduled repeating ${prayerName} reminder for future days, ID: ${repeatNotificationId}`);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 ${prayerName} Prayer Reminder`,
          body: `${prayerName} prayer is in ${settings.prePrayerTime} minutes. Prepare for prayer.`,
          sound: true,
          vibrate: settings.vibrate ? [0, 150, 150, 150] : undefined,
          // iOS: ensure immediate delivery
          interruptionLevel: Platform.OS === 'ios' ? 'timeSensitive' : undefined,
          // Android: high priority for heads-up
          priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.HIGH : undefined,
          data: {
            prayerName,
            prayerTime,
            location,
            type: 'pre-prayer-reminder',
            prePrayerTime: settings.prePrayerTime,
            scheduledAt,
            scheduleSignature,
            isRepeating: hasPassedToday,
          },
        },
        trigger,
      });

      if (hasPassedToday) {
        console.log(`Scheduled ${prayerName} reminder repeating notification starting tomorrow, ID: ${notificationId}`);
      } else {
        console.log(`Scheduled ${prayerName} reminder notification for today at ${reminderDate.toLocaleString()}, ID: ${notificationId}`);
      }
    } catch (error) {
      console.error(`Error scheduling ${prayerName} reminder notification:`, error);
    }
  }

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

  async getScheduledNotificationsSummary(): Promise<string> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      
      const prayerNotifications = scheduled.filter((n: any) => n.content?.data?.type === 'prayer-time');
      const reminderNotifications = scheduled.filter((n: any) => n.content?.data?.type === 'pre-prayer-reminder');
      
      const summary = [
        `📊 Notification Summary:`,
        `🕌 Prayer Time Notifications: ${prayerNotifications.length}`,
        `🔔 Pre-Prayer Reminders: ${reminderNotifications.length}`,
        `📋 Total Scheduled: ${scheduled.length}`,
        ``
      ];

      if (prayerNotifications.length > 0) {
        summary.push(`Prayer Times:`);
        prayerNotifications.forEach((n: any) => {
          const data = n.content?.data;
          const trigger = (n as any).trigger;
          const timeStr = trigger?.date ? new Date(trigger.date).toLocaleString() : 
                         trigger?.hour !== undefined ? `${trigger.hour}:${String(trigger.minute).padStart(2, '0')} daily` : 'Unknown';
          summary.push(`  • ${data?.prayerName}: ${timeStr}`);
        });
        summary.push(``);
      }

      if (reminderNotifications.length > 0) {
        summary.push(`Reminders:`);
        reminderNotifications.forEach((n: any) => {
          const data = n.content?.data;
          const trigger = (n as any).trigger;
          const timeStr = trigger?.date ? new Date(trigger.date).toLocaleString() : 
                         trigger?.hour !== undefined ? `${trigger.hour}:${String(trigger.minute).padStart(2, '0')} daily` : 'Unknown';
          summary.push(`  • ${data?.prayerName} (${data?.prePrayerTime}min before): ${timeStr}`);
        });
      }

      return summary.join('\n');
    } catch (error) {
      console.error('Error getting notifications summary:', error);
      return 'Error retrieving notification summary';
    }
  }

  // Test method to schedule a notification for 10 seconds from now
  async testNotification(): Promise<void> {
    try {
      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 10);
      
      // SIMPLE LOGIC: Ensure test time is in the future
      const now = new Date();
      if (testTime <= now) {
        testTime.setSeconds(now.getSeconds() + 10);
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: 'This is a test notification to verify the system is working.',
          sound: 'default',
          vibrate: [0, 500, 250, 500],
          data: {
            type: 'test',
            scheduledAt: Date.now(),
          },
        },
        trigger: {
          date: testTime,
        } as any,
      });
      
      console.log(`Test notification scheduled for ${testTime.toLocaleString()}, ID: ${notificationId}`);
    } catch (error) {
      console.error('Error scheduling test notification:', error);
    }
  }

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
