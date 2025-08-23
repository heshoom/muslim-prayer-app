import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { prayerNotificationService } from '../../services/prayerNotificationService';
import { useTranslation } from '@/src/i18n';

export const NotificationTestButton: React.FC = () => {
  const { t } = useTranslation();
  const testNotification = async () => {
    try {
      if ((prayerNotificationService as any).testNotification) {
        await (prayerNotificationService as any).testNotification();
      } else {
        const { scheduleNotificationAt } = await import('@/src/utils/manualNotification');
        const tDate = new Date(Date.now() + 10000);
        await scheduleNotificationAt(tDate, t('quickTest') || 'Quick Test', t('firesIn10s') || 'Fires in 10s', { sound: true, vibrate: true });
      }
      Alert.alert(t('success') || 'Success', t('testNotificationScheduled') || 'Test notification scheduled for 10 seconds from now');
    } catch (error) {
      Alert.alert(t('error') || 'Error', `${t('failedToScheduleTestNotification') || 'Failed to schedule test notification'}: ${error}`);
    }
  };

  const getNotificationSummary = async () => {
    const { t } = useTranslation();
    try {
      if ((prayerNotificationService as any).getScheduledNotificationsSummary) {
        const summary = await (prayerNotificationService as any).getScheduledNotificationsSummary();
        Alert.alert(t('notificationSummary') || 'Notification Summary', summary);
      } else {
        const scheduled = await (await import('expo-notifications')).getAllScheduledNotificationsAsync();
        Alert.alert(t('notificationSummary') || 'Notification Summary', JSON.stringify(scheduled, null, 2).slice(0, 1000));
      }
    } catch (error) {
      Alert.alert(t('error') || 'Error', `${t('failedToGetNotificationSummary') || 'Failed to get notification summary'}: ${error}`);
    }
  };

  const cancelAllNotifications = async () => {
    const { t } = useTranslation();
    try {
      await prayerNotificationService.cancelAllNotifications();
      Alert.alert(t('success') || 'Success', t('allNotificationsCancelled') || 'All notifications cancelled');
    } catch (error) {
      Alert.alert(t('error') || 'Error', `${t('failedToCancelNotifications') || 'Failed to cancel notifications'}: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Debug Tools</Text>
      
      <TouchableOpacity style={styles.button} onPress={testNotification}>
        <Text style={styles.buttonText}>🧪 Test Notification (10s)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={getNotificationSummary}>
        <Text style={styles.buttonText}>📊 Get Summary</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={cancelAllNotifications}>
        <Text style={styles.buttonText}>❌ Cancel All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2980b9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
