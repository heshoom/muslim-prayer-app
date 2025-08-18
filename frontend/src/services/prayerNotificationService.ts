import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerTimes } from './prayerTimesService';
import { athanAudioService } from './athanAudioService';

export interface NotificationSettings {
  enabled: boolean;
  adhan: boolean;
  athanSound: string;
  vibrate: boolean;
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
  cancelAllNotifications: () => Promise<void>;
}

class PrayerNotificationServiceImpl implements PrayerNotificationService {
  async setupNotifications(): Promise<boolean> {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowCriticalAlerts: true, // For prayer times
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
  try {
    if (!settings.enabled) {
      console.log('Notifications are disabled in settings');
      return;
    }

    // Build an idempotency key so we don't re-schedule on every reload
    const dayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const scheduleSignature = `${dayKey}|${location}|${settings.enabled}|${settings.adhan}|${settings.athanSound}|${settings.vibrate}|${prayerTimes.Fajr}|${prayerTimes.Dhuhr}|${prayerTimes.Asr}|${prayerTimes.Maghrib}|${prayerTimes.Isha}`;
    const STORAGE_KEY = 'prayerNotifications:lastScheduleSignature';
    const lastSignature = await AsyncStorage.getItem(STORAGE_KEY);

    if (lastSignature === scheduleSignature) {
      console.log('Prayer notifications already scheduled for today with same settings; skipping re-schedule.');
      return;
    }

    // Only cancel if something actually changed
    await this.cancelAllNotifications();

    // Setup notification channel for Android with custom settings
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('prayer-times', {
        name: 'Prayer Times',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: settings.vibrate ? [0, 500, 250, 500] : undefined,
        sound: this.getAthanSoundUri(settings.athanSound, settings.adhan) || 'default',
        enableLights: true,
        lightColor: '#2980b9',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true, // Bypass Do Not Disturb
      });
    }

    const prayers = [
      { name: 'Fajr', time: prayerTimes.Fajr },
      { name: 'Dhuhr', time: prayerTimes.Dhuhr },
      { name: 'Asr', time: prayerTimes.Asr },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isha', time: prayerTimes.Isha },
    ];

    const today = new Date();
    
    for (const prayer of prayers) {
      await this.schedulePrayerNotification(prayer.name, prayer.time, location, today, settings);
    }

    await AsyncStorage.setItem(STORAGE_KEY, scheduleSignature);
    console.log('All prayer notifications scheduled successfully');
  } catch (error) {
    console.error('Error scheduling prayer notifications:', error);
  }
}
  async stopCurrentSound(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        this.cleanup();
      } catch (error) {
        console.error('Error stopping current sound:', error);
      }
    }
  }

  private getAthanSoundUri(athanSound: string, adhanEnabled: boolean): string | undefined {
    if (!adhanEnabled || athanSound === 'default') {
      return 'default';
    }

    // For expo-notifications, we need to use local file paths
    // The audio files will be bundled with the app
    const athanFiles: { [key: string]: string } = {
      'makkah': 'makkah.mp3',
      'madinah': 'madinah.mp3', 
      'egypt': 'egypt.mp3',
      'turkey': 'turkey.mp3',
      'nasiralqatami': 'nasiralqatami.mp3',
    };

    // For custom sounds, we'll use the default system sound for now
    // Custom notification sounds require additional setup in native projects
    return athanFiles[athanSound] ? 'default' : 'default';
  }

  private async schedulePrayerNotification(
    prayerName: string,
    prayerTime: string,
    location: string,
    date: Date,
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
      
      const notificationDate = new Date(date);
      notificationDate.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (notificationDate <= new Date()) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      const soundUri = this.getAthanSoundUri(settings.athanSound, settings.adhan);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayerName} Prayer Time`,
          body: settings.adhan 
            ? `It's time for ${prayerName} prayer in ${location}. \ud83d\udd4c` 
            : `It's time for ${prayerName} prayer in ${location}`,
          sound: soundUri || 'default',
          vibrate: settings.vibrate ? [0, 500, 250, 500] : undefined,
          data: {
            prayerName,
            prayerTime,
            location,
            // Align with NotificationContext to centralize audio handling
            type: 'prayer-time',
            athanEnabled: settings.adhan,
            athanSound: settings.athanSound,
          },
        },
        trigger: {
          date: notificationDate,
          channelId: Platform.OS === 'android' ? 'prayer-times' : undefined,
        } as Notifications.NotificationTriggerInput,
      });

      console.log(`Scheduled ${prayerName} notification for ${notificationDate.toLocaleString()}, ID: ${notificationId}, Sound: ${soundUri || 'default'}`);
    } catch (error) {
      console.error(`Error scheduling ${prayerName} notification:`, error);
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
}

// Export singleton instance
export const prayerNotificationService: PrayerNotificationService = new PrayerNotificationServiceImpl();

// Helper function to get notification permissions status
export const getNotificationPermissionStatus = async (): Promise<string> => {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
};
