import React, { createContext, useContext, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useSettings } from './SettingsContext';
import { athanAudioService } from '../services/athanAudioService';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // We'll handle custom sounds manually
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Get display name for athan type
const getAthanDisplayName = (athanType: string) => {
  switch (athanType) {
    case 'makkah': return 'Makkah (Sheikh Al-Sudais)';
    case 'madinah': return 'Madinah (Sheikh Ali Ahmed Mulla)';
    case 'egypt': return 'Egypt (Sheikh Mahmoud Al-Husary)';
    case 'turkey': return 'Turkey (Sheikh Hafez Mustafa Ozcan)';
    case 'nasiralqatami': return 'Nasir Al-Qatami';
    case 'default': return 'Default System Sound';
    default: return 'Unknown Athan';
  }
};

type NotificationContextType = {
  schedulePrayerNotifications: (prayerTimes: any) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  testAthanSound: (athanType: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listener for when notifications are received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      handleNotificationReceived(notification);
    });

    // Listener for when user taps notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const handleNotificationReceived = async (notification: any) => {
    const { data } = notification.request.content;
    
    // Handle prayer time notifications with custom athan sounds
    if (data?.type === 'prayer-time' && settings.notifications.adhan) {
      await athanAudioService.playAthanSound(settings.notifications.athanSound);
    } else if (data?.type === 'test-athan') {
      await athanAudioService.playAthanSound(data.athanType || settings.notifications.athanSound);
    }
  };

  const handleNotificationResponse = async (response: any) => {
    const { data } = response.notification.request.content;
    
    // Handle when user taps on notification
    if (data?.type === 'prayer-time' || data?.type === 'test-athan') {
      console.log('User tapped notification for:', data.prayer || 'test');
    }
  };

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
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    console.log('Notification permissions granted:', finalStatus);
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
          title: `🕌 ${prayer} Prayer Time`,
          body: `It's time for ${prayer} prayer. May Allah accept your prayers.`,
          sound: true, // Use default system sound, custom athan handled by listener
          vibrate: settings.notifications.vibrate ? [0, 250, 250, 250] : undefined,
          data: {
            prayer: prayer,
            type: 'prayer-time',
            athanType: settings.notifications.athanSound
          }
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
            title: `🔔 ${prayer} Prayer Reminder`,
            body: `${prayer} prayer is in ${settings.notifications.prePrayerTime} minutes. Prepare for prayer.`,
            sound: true, // Default system sound for reminders
            vibrate: settings.notifications.vibrate ? [0, 150, 150, 150] : undefined,
            data: {
              prayer: prayer,
              type: 'pre-prayer-reminder'
            }
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

  const testAthanSound = async (athanType: string) => {
    try {
      // Check notification permissions first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.log('Notification permissions not granted');
          return;
        }
      }

      console.log('Testing athan sound:', athanType);
      
      // Test the audio service directly
      await athanAudioService.testAthanSound(athanType);
      
      // Also send a test notification (without custom sound to avoid errors)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎵 Athan Sound Test',
          body: `Testing ${getAthanDisplayName(athanType)}`,
          sound: true, // Use default system sound for notification
          vibrate: settings.notifications.vibrate ? [0, 250, 250, 250] : undefined,
          data: {
            type: 'test-athan',
            athanType: athanType
          }
        },
        trigger: null // Immediate notification
      });
      
      console.log('Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ schedulePrayerNotifications, cancelAllNotifications, testAthanSound }}>
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
