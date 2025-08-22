import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * scheduleNotificationAt
 * ----------------------
 * Schedule a single one-time notification at a specific JS Date.
 * Useful for manual testing or wiring to a debug button.
 *
 * Returns the scheduled notification id (string) or throws on error.
 */
export async function scheduleNotificationAt(
  date: Date,
  title = 'Test Notification',
  body = 'This is a test notification',
  opts?: { sound?: boolean; vibrate?: boolean; data?: Record<string, any> }
): Promise<string> {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided to scheduleNotificationAt');
  }

  const now = new Date();
  if (date.getTime() <= now.getTime()) {
    throw new Error('Date must be in the future');
  }

  const sound = opts?.sound ? 'default' : undefined;
  const vibrate = opts?.vibrate ? [0, 500, 250, 500] : undefined;

  const trigger: any = { date };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      vibrate,
      interruptionLevel: Platform.OS === 'ios' ? 'timeSensitive' : undefined,
      priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.MAX : undefined,
      data: {
        ...(opts?.data || {}),
        scheduledAt: date.getTime(),
        manualTest: true,
      },
    },
    trigger,
  });

  return id;
}

async function fireTestNotification() {
  const t = new Date(Date.now() + 10000);
  await scheduleNotificationAt(t, 'Quick Test', 'Fires in 10s', { sound: true, vibrate: true });
}


// Example usage removed to avoid side-effects at module import. Call
// `scheduleNotificationAt(...)` from a debug button or an async handler.


/*
Usage examples (call from a debug screen or console):

import { scheduleNotificationAt } from '@/src/utils/manualNotification';

// one-time 10s test
const t = new Date(Date.now() + 10000);
await scheduleNotificationAt(t, 'Quick Test', "Fires in 10s", { sound: true, vibrate: true });

// schedule for specific time today/tomorrow
const tomorrow = new Date();
tomorrow.setHours(18, 0, 0, 0); // 6:00 PM
if (tomorrow <= new Date()) tomorrow.setDate(tomorrow.getDate() + 1);
await scheduleNotificationAt(tomorrow, 'Evening Test', 'Scheduled at 6pm', { sound: false });
*/
