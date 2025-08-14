import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSettings } from '@/src/contexts/SettingsContext';
import { lightTheme, darkTheme } from '@/src/constants/theme';

const Settings = () => {
  const { settings, updateSettings, isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleSave = () => {
    Alert.alert(
      'Settings Saved',
      'Your preferences have been updated.',
      [{ text: 'OK' }]
    );
  };

  const styles = getStyles(theme, isDarkMode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your app preferences</Text>
        </View>

        <View style={styles.settingsContainer}>
          {/* Notifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="bell" size={20} color="#2980b9" />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingTitle}>Enable Notifications</Text>
                <Switch
                  value={settings.notifications.enabled}
                  onValueChange={(value) => updateSettings('notifications', 'enabled', value)}
                  trackColor={{ false: '#dce4ec', true: '#2980b9' }}
                  thumbColor={settings.notifications.enabled ? '#fff' : '#f4f3f4'}
                />
              </View>
              <Text style={styles.settingDescription}>Receive prayer time alerts</Text>
            </View>

            {settings.notifications.enabled && (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingHeader}>
                    <Text style={styles.settingTitle}>Adhan Sound</Text>
                    <Switch
                      value={settings.notifications.adhan}
                      onValueChange={(value) => updateSettings('notifications', 'adhan', value)}
                      trackColor={{ false: '#dce4ec', true: '#2980b9' }}
                      thumbColor={settings.notifications.adhan ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingHeader}>
                    <Text style={styles.settingTitle}>Vibrate</Text>
                    <Switch
                      value={settings.notifications.vibrate}
                      onValueChange={(value) => updateSettings('notifications', 'vibrate', value)}
                      trackColor={{ false: '#dce4ec', true: '#2980b9' }}
                      thumbColor={settings.notifications.vibrate ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingHeader}>
                    <Text style={styles.settingTitle}>Pre-prayer Reminder</Text>
                    <Switch
                      value={settings.notifications.prePrayer}
                      onValueChange={(value) => updateSettings('notifications', 'prePrayer', value)}
                      trackColor={{ false: '#dce4ec', true: '#2980b9' }}
                      thumbColor={settings.notifications.prePrayer ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                  {settings.notifications.prePrayer && (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={settings.notifications.prePrayerTime}
                        onValueChange={(value) => updateSettings('notifications', 'prePrayerTime', value)}
                        style={styles.picker}
                      >
                        <Picker.Item label="5 minutes before" value={5} />
                        <Picker.Item label="10 minutes before" value={10} />
                        <Picker.Item label="15 minutes before" value={15} />
                        <Picker.Item label="30 minutes before" value={30} />
                      </Picker>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Appearance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="paint-brush" size={20} color="#2980b9" />
              <Text style={styles.sectionTitle}>Appearance</Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingTitle}>Theme</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={settings.appearance.theme}
                  onValueChange={(value) => updateSettings('appearance', 'theme', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Light" value="light" />
                  <Picker.Item label="Dark" value="dark" />
                  <Picker.Item label="System Default" value="system" />
                </Picker>
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingTitle}>Language</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={settings.appearance.language}
                  onValueChange={(value) => updateSettings('appearance', 'language', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="English" value="en" />
                  <Picker.Item label="العربية" value="ar" />
                  <Picker.Item label="اردو" value="ur" />
                  <Picker.Item label="Türkçe" value="tr" />
                </Picker>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingTitle}>Show Hijri Dates</Text>
                <Switch
                  value={settings.appearance.showHijriDates}
                  onValueChange={(value) => updateSettings('appearance', 'showHijriDates', value)}
                  trackColor={{ false: '#dce4ec', true: '#2980b9' }}
                  thumbColor={settings.appearance.showHijriDates ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingTitle}>Time Format</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={settings.appearance.timeFormat}
                  onValueChange={(value) => updateSettings('appearance', 'timeFormat', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="24-hour" value="24h" />
                  <Picker.Item label="12-hour" value="12h" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Prayer Calculation Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="calculator" size={20} color="#2980b9" />
              <Text style={styles.sectionTitle}>Prayer Calculations</Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingTitle}>Calculation Method</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={settings.prayer.calculationMethod}
                  onValueChange={(value) => updateSettings('prayer', 'calculationMethod', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Muslim World League" value="mwl" />
                  <Picker.Item label="Islamic Society of North America" value="isna" />
                  <Picker.Item label="Egyptian General Authority" value="egypt" />
                  <Picker.Item label="Umm Al-Qura University" value="makkah" />
                  <Picker.Item label="University of Islamic Sciences, Karachi" value="karachi" />
                </Picker>
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingTitle}>Madhab (Asr Calculation)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={settings.prayer.madhab}
                  onValueChange={(value) => updateSettings('prayer', 'madhab', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Shafi'i, Maliki, Hanbali" value="shafi" />
                  <Picker.Item label="Hanafi" value="hanafi" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="map-marker-alt" size={20} color="#2980b9" />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingTitle}>Use GPS Location</Text>
                <Switch
                  value={settings.location.useGPS}
                  onValueChange={(value) => updateSettings('location', 'useGPS', value)}
                  trackColor={{ false: '#dce4ec', true: '#2980b9' }}
                  thumbColor={settings.location.useGPS ? '#fff' : '#f4f3f4'}
                />
              </View>
              <Text style={styles.settingDescription}>Automatically detect location</Text>
            </View>

            {!settings.location.useGPS && (
              <>
                <View style={styles.settingItem}>
                  <Text style={styles.settingTitle}>City</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={settings.location.city}
                      onValueChange={(value) => updateSetting('location', 'city', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="New York" value="New York" />
                      <Picker.Item label="London" value="London" />
                      <Picker.Item label="Dubai" value="Dubai" />
                      <Picker.Item label="Istanbul" value="Istanbul" />
                    </Picker>
                  </View>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.primary,
  },
  subtitle: {
    fontSize: 16,
    color: theme.text.secondary,
    marginTop: 4,
  },
  settingsContainer: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 20,
    ...theme.card.shadow,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
    marginLeft: 10,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.text.secondary,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: isDarkMode ? theme.input : theme.surface,
    marginTop: 5,
  },
  picker: {
    height: 50,
    color: theme.text.primary,
  },
  saveButton: {
    backgroundColor: theme.primary,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: theme.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Settings;