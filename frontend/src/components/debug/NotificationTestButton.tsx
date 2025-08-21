import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { prayerNotificationService } from '../../services/prayerNotificationService';

export const NotificationTestButton: React.FC = () => {
  const testNotification = async () => {
    try {
      await prayerNotificationService.testNotification();
      Alert.alert('Success', 'Test notification scheduled for 10 seconds from now');
    } catch (error) {
      Alert.alert('Error', `Failed to schedule test notification: ${error}`);
    }
  };

  const getNotificationSummary = async () => {
    try {
      const summary = await prayerNotificationService.getScheduledNotificationsSummary();
      Alert.alert('Notification Summary', summary);
    } catch (error) {
      Alert.alert('Error', `Failed to get notification summary: ${error}`);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await prayerNotificationService.cancelAllNotifications();
      Alert.alert('Success', 'All notifications cancelled');
    } catch (error) {
      Alert.alert('Error', `Failed to cancel notifications: ${error}`);
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
