import React, { createContext, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useSettings } from './SettingsContext';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type NotificationContextType = {
  schedulePrayerNotifications: (prayerTimes: any) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('prayer-times', {
        name: 'Prayer Times',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2980b9',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
  };

  const schedulePrayerNotifications = async (prayerTimes: any) => {
    if (!settings.notifications.enabled) return;

    // Cancel existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const today = new Date();

    for (const prayer of prayers) {
      const prayerTime = prayerTimes[prayer];
      if (!prayerTime) continue;

      const [hours, minutes] = prayerTime.split(':').map(Number);
      const prayerDate = new Date(today);
      prayerDate.setHours(hours, minutes, 0, 0);

      // Skip if prayer time has passed today
      if (prayerDate < new Date()) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      // Schedule main prayer notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayer} Prayer Time`,
          body: `It's time for ${prayer} prayer`,
          sound: settings.notifications.adhan ? 'adhan.wav' : true, // true = default system sound
          vibrate: settings.notifications.vibrate ? [0, 250, 250, 250] : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: prayerDate.getHours(),
          minute: prayerDate.getMinutes(),
          repeats: true,
        },
      });

      // Schedule pre-prayer reminder if enabled
      if (settings.notifications.prePrayer) {
        const reminderDate = new Date(prayerDate);
        reminderDate.setMinutes(reminderDate.getMinutes() - settings.notifications.prePrayerTime);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${prayer} Prayer Reminder`,
            body: `${prayer} prayer is in ${settings.notifications.prePrayerTime} minutes`,
            sound: true, // Default system sound for reminders
            vibrate: settings.notifications.vibrate ? [0, 150, 150, 150] : undefined,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: reminderDate.getHours(),
            minute: reminderDate.getMinutes(),
            repeats: true,
          },
        });
      }
    }
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return (
    <NotificationContext.Provider value={{ schedulePrayerNotifications, cancelAllNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
