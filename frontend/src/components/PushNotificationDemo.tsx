import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { usePrayerTimes } from '@/src/contexts/PrayerTimesContext';
import { useTranslation } from '@/src/i18n';
import { prayerNotificationService } from '@/src/services/prayerNotificationService';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});



async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}


function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    console.log('Resolved projectId for push registration:', projectId);
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log('Expo push token:', pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function PushNotificationDemo() {
  const { t } = useTranslation();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  // Call hooks unconditionally to preserve hook order
  const { prayerTimes } = usePrayerTimes();
  // Don't call useNotifications() here because this component may be rendered
  // outside the NotificationProvider in some debug flows; use the direct
  // service API as a safe fallback.
  const notificationsCtx = null;

  useEffect(() => {
  // Do NOT auto-register on mount to avoid prompting when Settings is opened.
  // Registration should be triggered explicitly (for example, during onboarding).

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>{t('pushTokenLabel') || 'Your Expo push token:'} {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>{t('notificationTitleLabel') || 'Title:'} {notification && notification.request.content.title} </Text>
        <Text>{t('notificationBodyLabel') || 'Body:'} {notification && notification.request.content.body}</Text>
        <Text>{t('notificationDataLabel') || 'Data:'} {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title={t('pressToSendNotification') || 'Press to Send Notification'}
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
      <View style={{ height: 12 }} />
      <Button
        title={t('registerForPush') || 'Register for Push (device token)'}
        onPress={async () => {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            setExpoPushToken(token);
            Alert.alert(t('pushToken') || 'Push token', token);
          }
        }}
      />
      <View style={{ height: 8 }} />
      <Button
        title={t('schedulePrayerNow') || 'Schedule Prayer Notifications Now'}
        onPress={async () => {
          try {
            // Use context helper if present (not present in some debug render flows).
            if (prayerTimes) {
              try {
                // If notification context is available elsewhere it will handle scheduling.
                // Here we call the service directly to be safe in debug flows.
                await prayerNotificationService.scheduleDailyNotifications(prayerTimes, 'DebugLocation', { enabled: true, adhan: true, athanSound: 'default', vibrate: true, prePrayer: true, prePrayerTime: 10 });
                Alert.alert(t('scheduled') || 'Scheduled', t('prayerNotificationsScheduled') || 'Prayer notifications scheduled');
              } catch (err) {
                console.error(err);
                Alert.alert('Error', String(err));
              }
            } else {
              Alert.alert(t('noPrayerTimes') || 'No prayer times', t('noPrayerTimesDesc') || 'Unable to find prayer times in context');
            }
          } catch (err) {
            console.error(err);
            Alert.alert(t('error') || 'Error', String(err));
          }
        }}
      />
      <View style={{ height: 8 }} />
      <Button
        title={t('testLocalNotification10s') || 'Test Local Notification (10s)'}
        onPress={async () => {
          try {
            // service debug helper may not exist in trimmed build
            if (prayerNotificationService && (prayerNotificationService as any).testNotification) {
              await (prayerNotificationService as any).testNotification();
              Alert.alert(t('test') || 'Test', t('testNotificationScheduled') || 'Test notification scheduled');
            } else {
              // fallback: use manual schedule helper
              const { scheduleNotificationAt } = await import('@/src/utils/manualNotification');
              const tDate = new Date(Date.now() + 10000);
              await scheduleNotificationAt(tDate, t('quickTest') || 'Quick Test', t('firesIn10s') || 'Fires in 10s', { sound: true, vibrate: true });
              Alert.alert(t('test') || 'Test', t('testNotificationScheduled') || 'Test notification scheduled');
            }
          } catch (err) {
            console.error(err);
            Alert.alert(t('error') || 'Error', String(err));
          }
        }}
      />
      <View style={{ height: 8 }} />
      <Button
        title={t('getScheduledNotificationsSummary') || 'Get Scheduled Notifications Summary'}
        onPress={async () => {
          try {
            if (prayerNotificationService && (prayerNotificationService as any).getScheduledNotificationsSummary) {
              const summary = await (prayerNotificationService as any).getScheduledNotificationsSummary();
              Alert.alert(t('summary') || 'Summary', summary);
            } else {
              const scheduled = await (await import('expo-notifications')).getAllScheduledNotificationsAsync();
              Alert.alert(t('summary') || 'Summary', JSON.stringify(scheduled, null, 2).slice(0, 1000));
            }
          } catch (err) {
            console.error(err);
            Alert.alert(t('error') || 'Error', String(err));
          }
        }}
      />
      <View style={{ height: 8 }} />
      <Button
        title={t('cancelAllScheduled') || 'Cancel All Scheduled Notifications'}
        onPress={async () => {
          try {
            await prayerNotificationService.cancelAllNotifications();
            Alert.alert(t('cancelled') || 'Cancelled', t('allScheduledCancelled') || 'All scheduled notifications cancelled');
          } catch (err) {
            console.error(err);
            Alert.alert(t('error') || 'Error', String(err));
          }
        }}
      />
    </View>
  );
}
