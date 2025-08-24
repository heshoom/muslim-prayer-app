import React, { createContext, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useSettings } from './SettingsContext';
import { useTranslation } from '@/src/i18n';
import { usePrayerTimes } from './PrayerTimesContext';
import { athanAudioService } from '../services/athanAudioService';
import { prayerNotificationService } from '../services/prayerNotificationService';
import { getIosNotificationSound, getDisplayName } from '../constants/athanSounds';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true, // Always play sound for notifications
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Get display name for athan type - now using centralized config
const getAthanDisplayName = (athanType: string) => {
  return getDisplayName(athanType as any);
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
  const { t } = useTranslation();
  const { prayerTimes } = usePrayerTimes();
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

  // Ensure the next day's notifications are scheduled at app launch (or when
  // prayerTimes/settings become available). If we detect that the last
  // scheduled day differs from today, clear existing scheduled notifications
  // (to remove yesterday's) and schedule today's prayers.
  useEffect(() => {
    (async () => {
      try {
        if (!prayerTimes || !settings) return;
        const todayKey = new Date().toISOString().slice(0, 10);
        const lastScheduledDay = await AsyncStorage.getItem('app:lastScheduledDay');
        if (lastScheduledDay === todayKey) {
          // Already scheduled for today
          return;
        }

        console.log('Detected new day or no schedules for today - clearing and scheduling daily prayers');

        // Clear any existing scheduled notifications (remove yesterday's)
        try {
          await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (e) {
          console.warn('Failed to cancel scheduled notifications during daily reschedule startup:', e);
        }

        // Schedule today's prayers
        const locationStr = settings.location?.city ? `${settings.location.city}` : 'Unknown';
        try {
          await prayerNotificationService.scheduleDailyNotifications(prayerTimes, locationStr, settings.notifications);
          await AsyncStorage.setItem('app:lastScheduledDay', todayKey);
          console.log('Scheduled daily prayer notifications at startup for', todayKey);
        } catch (err) {
          console.error('Error scheduling daily notifications at startup:', err);
        }
      } catch (e) {
        console.warn('Error in startup daily reschedule check:', e);
      }
    })();
  // Run this effect whenever prayerTimes or settings change
  }, [prayerTimes, settings]);

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

    // If this is the daily reschedule trigger, attempt to reschedule now
    if (data?.type === 'daily-reschedule') {
      try {
        if (!prayerTimes) {
          console.log('Daily-reschedule received but no prayerTimes available yet');
        } else {
          const locationStr = settings.location?.city ? `${settings.location.city}` : 'Unknown';
          await prayerNotificationService.rescheduleDailyIfNeeded(prayerTimes, locationStr, settings.notifications);
        }
      } catch (err) {
        console.warn('Error handling daily-reschedule trigger:', err);
      }
      return;
    }

    // Handle prayer time notifications with custom athan sounds.
    // Prefer the athan information embedded in the notification payload
    // (this is set at schedule time). Fall back to the current settings
    // if the payload doesn't include athan data.
    if (data?.type === 'prayer-time') {
      const athanEnabled = (typeof data?.athanEnabled !== 'undefined') ? data?.athanEnabled : settings.notifications.adhan;
      const athanToPlay = data?.athanSound || settings.notifications.athanSound;
      const nativeSound = notification.request?.content?.sound;
      if (!athanEnabled) {
        console.log('Athan disabled for this prayer notification, skipping playback');
      } else if (nativeSound) {
        // A native notification sound is present in the payload (e.g. bundled .aiff).
        // The OS will play that sound; avoid duplicating audio by not playing JS athan here.
        console.log('Native notification sound present, skipping JS athan playback to avoid double audio', { nativeSound });
      } else {
        await athanAudioService.playAthanSound(athanToPlay);
      }
    } else if (data?.type === 'test-athan') {
      const nativeSound = notification.request?.content?.sound;
      if (nativeSound) {
        console.log('Native test notification sound present, skipping JS athan playback', { nativeSound });
      } else {
        await athanAudioService.playAthanSound(data.athanType || settings.notifications.athanSound);
      }
    }

    // Developer debug flow: debug notifications are scheduled by Settings as two one-shots
    // (stage 1 at +2m and stage 2 at +4m). Keep handler lightweight here and avoid scheduling
    // duplicates. Log receipt for debugging.
    if (data?.type === 'debug-2min') {
      try {
        const stage = Number(data?.stage || 1);
        console.log('Debug-2min notification received (no-op in handler), stage=', stage, 'data=', data);
      } catch (err) {
        console.warn('Error handling debug-2min notification:', err);
      }
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
    // Delegate scheduling to the centralized service to avoid duplicate logic
    if (!settings.notifications.enabled) return;

    const location = settings.location?.city ? `${settings.location.city}` : 'Unknown';
    try {
      await prayerNotificationService.scheduleDailyNotifications(prayerTimes, location, settings.notifications);
    } catch (err) {
      console.error('Error delegating scheduleDailyNotifications:', err);
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
          title: t('athanSoundTestTitle') || '🎵 Athan Sound Test',
          body: (t('athanSoundTestBody') || 'Testing') + ` ${getAthanDisplayName(athanType)}`,
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

  // Schedules a local notification in ~15 seconds that uses the bundled iOS aiff
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
      // Use centralized configuration for iOS notification sounds
      const soundName = getIosNotificationSound(selected as any);

      const in15 = new Date(Date.now() + 15 * 1000);
      // Friendly notification body for users - use translations
      const athanDisplayNames: Record<string, string> = {
        makkah: t('makkahAthan'),
        madinah: t('madinahAthan'),
        egypt: t('egyptAthan'),
        turkey: t('turkeyAthan'),
        nasiralqatami: t('nasirAlQatamiAthan'),
        default: t('athan'),
      };
      const displayName = athanDisplayNames[selected] || t('athan');
      const friendlyBody = t('testNotificationForSound', { sound: displayName });
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('testNotificationScheduled'),
          body: friendlyBody,
          sound: Platform.OS === 'ios' ? soundName : true,
          interruptionLevel: Platform.OS === 'ios' ? 'timeSensitive' : undefined,
          data: { type: 'test-athan', athanType: selected },
        },
        trigger: Platform.select<any>({
          ios: { date: in15 },
          android: { seconds: 15 },
          default: { date: in15 },
        }),
      });
      console.log('Scheduled iOS custom sound test in 15 seconds');
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
