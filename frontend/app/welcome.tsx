import React, { useEffect, useState } from 'react';
import { Platform, Alert, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { useRouter } from 'expo-router';
import { useSettings } from '@/src/contexts/SettingsContext';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';

export default function Welcome() {
  const router = useRouter();
  const { settings, updateSettings, isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();
  const [locGranted, setLocGranted] = useState<boolean | null>(null);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    console.log('Welcome screen mounted, onboarding completed:', settings.onboarding?.completed);
    if (settings.onboarding?.completed) {
      console.log('Onboarding already completed, redirecting to home');
      router.replace('/(tabs)');
    }
  }, [settings.onboarding?.completed, router]);

  // Check current permission status on mount
  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    try {
      // Check location permission
      const locationStatus = await Location.getForegroundPermissionsAsync();
      setLocGranted(locationStatus.status === 'granted');

      // Check notification permission
      const notificationStatus = await Notifications.getPermissionsAsync();
      setNotifGranted(notificationStatus.status === 'granted');
    } catch (error) {
      console.warn('Error checking existing permissions:', error);
    }
  };

  const requestLocation = async () => {
    try {
      setBusy(true);
      console.log('Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocGranted(granted);
      
      if (!granted) {
        Alert.alert(
          t('locationPermissionDenied') || 'Location permission was denied',
          t('couldNotDetermineLocation') || 'We need your location to calculate accurate prayer times. You can enable this later in device settings.'
        );
      } else {
        console.log('Location permission granted');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'There was an error requesting location permission. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const notifCtx = useNotifications();

  const requestNotifications = async () => {
    try {
      setBusy(true);
      console.log('Requesting notification permission...');
      await notifCtx.requestPermissionsIfNeeded();
      const { status } = await Notifications.getPermissionsAsync();
      const granted = status === 'granted';
      setNotifGranted(granted);
      
      if (!granted) {
        Alert.alert(
          t('notificationsDisabled') || 'Notifications not enabled',
          t('enableNotificationsHint') || 'You can enable notifications later in Settings.'
        );
      } else {
        console.log('Notification permission granted');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Alert.alert('Error', 'There was an error requesting notification permission. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    try {
      setBusy(true);
      console.log('Completing onboarding...');
      // Ensure location permission is requested before completing onboarding
      if (locGranted !== true) {
        try {
          console.log('Location not granted yet — requesting before finishing onboarding');
          const { status } = await Location.requestForegroundPermissionsAsync();
          const granted = status === 'granted';
          setLocGranted(granted);
          if (!granted) {
            // If user denies, show guidance and do not mark onboarding as completed automatically
            Alert.alert(
              t('locationPermissionRequired') || 'Location permission is required to find nearby mosques',
              t('couldNotDetermineLocation') || 'This feature requires location access. You can enable it in Settings if you change your mind.'
            );
            console.log('User denied location permission at finish; keeping onboarding open');
            setBusy(false);
            return;
          }
        } catch (e) {
          console.warn('Error requesting location permission at finish:', e);
        }
      }

      // Mark onboarding as completed
      updateSettings('onboarding' as any, 'completed', true);

      // Schedule notifications if permissions were granted
      if (notifGranted) {
        try {
          await notifCtx.requestPermissionsIfNeeded();
        } catch (e) {
          console.warn('Error setting up notifications after onboarding:', e);
        }
      }

      console.log('Onboarding completed, navigating to home');
      router.replace('/(tabs)');
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'There was an error completing setup. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.hero}>
        <Image source={require('../assets/images/icon.png')} style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 12 }} />
        <Text style={[styles.title, { color: theme.primary }]}>Islamic Pro</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {t('muslimPrayerTimes') || 'Muslim Prayer Times'}
        </Text>
      </View>

  <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Allow Location</Text>
        <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>
          We use your location to calculate precise prayer times for your area.
        </Text>
        <TouchableOpacity 
          disabled={busy} 
          style={[
            styles.button, 
            { 
              backgroundColor: locGranted ? '#27ae60' : theme.primary,
              opacity: busy ? 0.6 : 1
            }
          ]} 
          onPress={requestLocation}
        >
          <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
    {busy && locGranted === null ? 'Requesting...' : locGranted ? '✓ Granted' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Enable Notifications</Text>
        <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>
          Get notified at prayer times so you never miss a prayer.
        </Text>
        <TouchableOpacity 
          disabled={busy} 
          style={[
            styles.button, 
            { 
              backgroundColor: notifGranted ? '#27ae60' : theme.primary,
              opacity: busy ? 0.6 : 1
            }
          ]} 
          onPress={requestNotifications}
        >
          <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
            {busy && notifGranted === null ? 'Requesting...' : notifGranted ? '✓ Granted' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        disabled={busy} 
        style={[
          styles.cta, 
          { 
            backgroundColor: theme.primary,
            opacity: busy ? 0.6 : 1
          }
        ]} 
        onPress={finish}
      >
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
          {busy ? 'Setting up...' : 'Next'}
        </Text>
      </TouchableOpacity>
      
      <Text style={[styles.skipText, { color: theme.text.secondary }]}>
        You can change these permissions later in Settings
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginVertical: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardDesc: { fontSize: 13, marginBottom: 10 },
  button: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  cta: { marginTop: 16, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  skipText: { textAlign: 'center', fontSize: 12, marginTop: 12 },
});
