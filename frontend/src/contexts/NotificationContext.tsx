import React, { createContext, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
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
  testIosNotificationSound: (athanType?: string) => Promise<void>;
  requestPermissionsIfNeeded: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  // Record app start to ignore any legacy/stale deliveries right at boot
  const appStartMs = useRef<number>(Date.now());

  // On startup, clear any presented notifications and, on build change, clear scheduled ones
  useEffect(() => {
    (async () => {
      try {
        // Remove any already-presented notifications to avoid a visible backlog
        await Notifications.dismissAllNotificationsAsync();

        // Detect build changes and clear legacy schedules (common after reinstall/rebuild)
        const BUILD_KEY = 'app:lastBuildId';
        const currentBuild = String(
          (Constants as any)?.nativeBuildVersion || (Constants as any)?.expoConfig?.version || 'unknown'
        );
        const previousBuild = await AsyncStorage.getItem(BUILD_KEY);
        if (previousBuild && previousBuild !== currentBuild) {
          console.log('Build version changed. Clearing all scheduled notifications to avoid legacy bursts.');
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
        await AsyncStorage.setItem(BUILD_KEY, currentBuild);

  // Proactively cancel any scheduled notifications that are about to fire immediately
        try {
          const scheduled = await Notifications.getAllScheduledNotificationsAsync();
          const now = Date.now();
          for (const req of scheduled as any[]) {
            const trigger: any = (req as any).trigger;
            try {
              const next = await (Notifications as any).getNextTriggerDateAsync?.(trigger);
              if (typeof next === 'number' && next - now < 5000) {
                // Cancel to avoid burst on launch
                if ((req as any).identifier) {
                  await Notifications.cancelScheduledNotificationAsync((req as any).identifier);
                }
              }
            } catch (inner) {
              // Ignore errors per-request to be resilient
            }
          }
        } catch (listErr) {
          // Safe to ignore if listing isn't supported on platform
        }
        // Mark that startup notification cleanup has finished so other modules
        // (which may schedule notifications) can wait to avoid races.
        try {
          await AsyncStorage.setItem('app:notificationStartupDone', '1');
        } catch (e) {
          // best-effort
        }
      } catch (e) {
        console.warn('Startup notification cleanup encountered an issue:', e);
      }
    })();
  }, []);

  useEffect(() => {
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

    // Handle cold-start from notification
    (async () => {
      try {
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          console.log('App launched from notification:', lastResponse);
          await handleNotificationResponse(lastResponse);
        }
      } catch (err) {
        console.warn('Error checking last notification response on launch:', err);
      }
    })();

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
    // If the notification has a scheduledAt timestamp, ignore it if it's
    // significantly older than now. This avoids playing a backlog of athans
    // immediately when the app is opened and pending deliveries are delivered.
    const scheduledAt = data?.scheduledAt ? Number(data.scheduledAt) : undefined;
    const now = Date.now();
    const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    const STARTUP_GRACE_MS = 15 * 1000; // 15 seconds after app start

    // Suppress any notification deliveries that arrive immediately after app start.
    // Some OSes may flush or immediately deliver scheduled notifications when an
    // app is launched or freshly installed; suppressing for a short window prevents
    // the 'burst' behavior where many alarms play at once on first launch.
    if ((now - appStartMs.current) < STARTUP_GRACE_MS) {
      console.log('Ignoring notification during startup grace window to avoid burst', { now, appStart: appStartMs.current, scheduledAt });
      return;
    }

    if (scheduledAt && (now - scheduledAt) > STALE_THRESHOLD_MS) {
      console.log('Ignoring stale notification delivery (scheduledAt too old):', { scheduledAt, now });
      return;
    }

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
      // If the payload includes a full athan filename, play it using expo-av
      if (data?.fullAthan) {
        try {
          // Stop any currently playing sound and play full adhān through audio service
          await athanAudioService.forceStopSound();
          await athanAudioService.playFullAthan(data.fullAthan);
        } catch (err) {
          console.error('Error playing full athan on notification tap:', err);
        }
      }
    }
  };

  const registerForPushNotificationsAsync = async () => {
    // Android channel creation is now handled centrally in prayerNotificationService
    // No need to duplicate here

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

  // Expose a helper for other parts of the app (e.g. onboarding) to opt-in
  // to requesting notification permissions once the user has completed onboarding.
  const requestPermissionsIfNeeded = async () => {
    try {
      await registerForPushNotificationsAsync();
      // Mark startup done so any scheduling can proceed
      await AsyncStorage.setItem('app:notificationStartupDone', '1');
    } catch (e) {
      console.warn('Error requesting push permissions on demand:', e);
    }
  };

  const schedulePrayerNotifications = async (prayerTimes: any) => {
    if (!settings.notifications.enabled) return;

    // Cancel existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const today = new Date();
    const now = new Date();

    for (const prayer of prayers) {
      const prayerTime = prayerTimes[prayer];
      if (!prayerTime) continue;

      const [hours, minutes] = prayerTime.split(':').map(Number);
      const prayerDate = new Date(today);
      prayerDate.setHours(hours, minutes, 0, 0);

      const hasPassedToday = prayerDate.getTime() <= now.getTime();

      // If prayer time has passed today, schedule for tomorrow
      if (hasPassedToday) {
        prayerDate.setDate(prayerDate.getDate() + 1);
        console.log(`${prayer} has passed today, scheduling for tomorrow: ${prayerDate.toLocaleString()}`);
      } else {
        console.log(`${prayer} is upcoming today, scheduling for: ${prayerDate.toLocaleString()}`);
      }

      // Choose trigger type based on whether prayer has passed
      let mainTrigger: Notifications.NotificationTriggerInput;
      if (hasPassedToday) {
        // Use repeating trigger for prayers that have passed
        mainTrigger = {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          repeats: true,
        };
      } else {
        // Use one-time trigger for today, then schedule repeating for future
        mainTrigger = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: prayerDate,
        };
        
        // Also schedule repeating notification for future days
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🕌 ${prayer} Prayer Time`,
            body: `It's time for ${prayer} prayer. May Allah accept your prayers.`,
            sound: true,
            vibrate: settings.notifications.vibrate ? [0, 250, 250, 250] : undefined,
            data: {
              prayer: prayer,
              type: 'prayer-time',
              athanType: settings.notifications.athanSound,
              fullAthan: `${prayer.toLowerCase()}_full.m4a`,
              isRepeating: true,
            }
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        });
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
        athanType: settings.notifications.athanSound,
        // include a full athan filename so the app can play it when tapped
        fullAthan: `${prayer.toLowerCase()}_full.m4a`,
        isRepeating: hasPassedToday,
          }
        },
        trigger: mainTrigger,
      });

      // Schedule pre-prayer reminder if enabled
      if (settings.notifications.prePrayer) {
        const reminderDate = new Date(prayerDate);
        reminderDate.setMinutes(reminderDate.getMinutes() - settings.notifications.prePrayerTime);

        // Check if reminder time has also passed
        const reminderHasPassed = reminderDate.getTime() <= now.getTime();
        
        let reminderTrigger: Notifications.NotificationTriggerInput;
        if (reminderHasPassed) {
          // Reminder has passed - use repeating trigger for tomorrow
          reminderTrigger = {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: reminderDate.getHours(),
            minute: reminderDate.getMinutes(),
            repeats: true,
          };
        } else {
          // Reminder hasn't passed - use one-time trigger for today
          reminderTrigger = {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
          };
          
          // Also schedule repeating reminder for future days
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `🔔 ${prayer} Prayer Reminder`,
              body: `${prayer} prayer is in ${settings.notifications.prePrayerTime} minutes. Prepare for prayer.`,
              sound: true,
              vibrate: settings.notifications.vibrate ? [0, 150, 150, 150] : undefined,
              data: {
                prayer: prayer,
                type: 'pre-prayer-reminder',
                isRepeating: true,
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

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🔔 ${prayer} Prayer Reminder`,
            body: `${prayer} prayer is in ${settings.notifications.prePrayerTime} minutes. Prepare for prayer.`,
            sound: true, // Default system sound for reminders
            vibrate: settings.notifications.vibrate ? [0, 150, 150, 150] : undefined,
            data: {
              prayer: prayer,
              type: 'pre-prayer-reminder',
              isRepeating: reminderHasPassed,
            }
          },
          trigger: reminderTrigger,
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

  // Schedules a local notification in ~10 seconds that uses the bundled iOS aiff
  // This verifies that the OS can find and play the custom notification sound.
  const testIosNotificationSound = async (athanType?: string) => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const req = await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowBadge: true, allowSound: true },
        });
        if (req.status !== 'granted') {
          console.log('Notification permissions not granted');
          return;
        }
      }

      const selected = athanType || settings.notifications.athanSound;
      // Map to the bundled iOS short aiff filenames
      const iosMap: Record<string, string> = {
        makkah: 'makkah_short.aiff',
        madinah: 'madinah-03_short.aiff',
        egypt: 'egypt_short.aiff',
        turkey: 'turkey_short.aiff',
        nasiralqatami: 'nasiralqatami_short.aiff',
        default: 'default',
      };
      const soundName = iosMap[selected] || 'default';

      const in10 = new Date(Date.now() + 10 * 1000);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'iOS Custom Sound Test',
          body: `Playing ${selected} (${soundName}) via notification payload`,
          sound: Platform.OS === 'ios' ? soundName : true,
          interruptionLevel: Platform.OS === 'ios' ? 'timeSensitive' : undefined,
          data: { type: 'test-athan', athanType: selected },
        },
        trigger: Platform.select<any>({
          ios: { date: in10 },
          android: { seconds: 10 },
          default: { date: in10 },
        }),
      });
      console.log('Scheduled iOS custom sound test in 10 seconds');
    } catch (err) {
      console.error('Error scheduling iOS custom sound test:', err);
    }
  };

  return (
  <NotificationContext.Provider value={{ schedulePrayerNotifications, cancelAllNotifications, testAthanSound, testIosNotificationSound, requestPermissionsIfNeeded }}>
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
