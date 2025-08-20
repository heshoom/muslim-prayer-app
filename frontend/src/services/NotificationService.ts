import * as Notifications from "expo-notifications";
// TODO: Implement or export getPrayerTimesForDate from prayerTimesService
import { getPrayerTimesForDate } from "./prayerTimesService";

export default class NotificationService {
  static async clearAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async scheduleToday() {
    // Clear only today’s notifications
    await this.clearAll();

    const today = new Date();
    const prayerTimes = await getPrayerTimesForDate(today); // Example return: { fajr: Date, dhuhr: Date, asr: Date, maghrib: Date, isha: Date }

    for (const [name, time] of Object.entries(prayerTimes)) {
      if (time instanceof Date && time > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${name.toUpperCase()} Prayer`,
            body: `It's time for ${name} prayer.`,
            sound: true,
          },
          trigger: { date: time, type: "date" } as any,
        });
      }
    }
  }

  static async scheduleDailyJob() {
    // This schedules a job at midnight to refresh notifications
    await Notifications.cancelScheduledNotificationAsync("daily-reschedule");

    await Notifications.scheduleNotificationAsync({
      identifier: "daily-reschedule",
      content: { title: "Refresh Prayer Times" },
      trigger: {
        hour: 0,
        minute: 0,
        repeats: true,
      } as any,
    });
  }

  static async init() {
    // Called on app start
    await this.scheduleToday();
    await this.scheduleDailyJob();
  }
}
