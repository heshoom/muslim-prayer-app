import React, { useEffect, useState } from 'react';
import { Platform, Alert, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
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
    if (settings.onboarding?.completed) {
      router.replace('/');
    }
  }, [settings.onboarding?.completed]);

  const requestLocation = async () => {
    try {
      setBusy(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocGranted(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          t('locationPermissionDenied') || 'Location permission was denied',
          t('couldNotDetermineLocation') || 'We need your location to calculate accurate prayer times.'
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const requestNotifications = async () => {
    try {
      setBusy(true);
      const { status } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
        android: { allowAlert: true, allowBadge: true, allowSound: true },
      } as any);
      setNotifGranted(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          t('notificationsDisabled') || 'Notifications not enabled',
          t('enableNotificationsHint') || 'You can enable notifications later in Settings.'
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    updateSettings('onboarding' as any, 'completed', true);
  router.replace('/');
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
        <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>We use your location to calculate precise prayer times.</Text>
        <TouchableOpacity disabled={busy} style={[styles.button, { backgroundColor: locGranted ? '#27ae60' : theme.primary }]} onPress={requestLocation}>
          <Text style={[styles.buttonText, { color: theme.text.inverse }]}>{locGranted ? 'Granted' : 'Enable Location'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Enable Notifications</Text>
        <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>Get notified at prayer times (you can change sounds later).</Text>
        <TouchableOpacity disabled={busy} style={[styles.button, { backgroundColor: notifGranted ? '#27ae60' : theme.primary }]} onPress={requestNotifications}>
          <Text style={[styles.buttonText, { color: theme.text.inverse }]}>{notifGranted ? 'Granted' : 'Enable Notifications'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity disabled={busy} style={[styles.cta, { backgroundColor: theme.primary }]} onPress={finish}>
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Continue</Text>
      </TouchableOpacity>
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
});
