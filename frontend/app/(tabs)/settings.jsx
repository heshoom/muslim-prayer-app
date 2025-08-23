// Instantly fire a notification (immediate delivery)
const handleInstantNotification = async () => {
  try {
    console.log('[DEBUG] InstantNotification: Button pressed');
    const perms = await Notifications.requestPermissionsAsync();
    console.log('[DEBUG] InstantNotification: Permission status', perms.status);
    if (perms.status !== 'granted') {
      Alert.alert(t('permissionDenied') || 'Permission denied', t('allowNotifications') || 'Please allow notifications');
      console.log('[DEBUG] InstantNotification: Permission denied');
      return;
    }
    console.log('[DEBUG] InstantNotification: Scheduling notification for immediate delivery');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('instantNotificationTitle') || 'Instant Notification',
        body: t('instantNotificationBody') || 'This notification was fired instantly.',
        sound: true,
        vibrate: [0, 500, 250, 500],
      },
      trigger: null, // Immediate delivery
    });
    console.log('[DEBUG] InstantNotification: Notification scheduled');
  Alert.alert(t('fired') || 'Fired', t('instantNotificationSent') || 'An instant notification was sent.');
  } catch (error) {
  console.error('[DEBUG] InstantNotification: Failed to fire instant notification:', error);
  Alert.alert(t('error') || 'Error', t('failedToFireInstantNotification') || 'Failed to fire instant notification.');
  }
};
import React, { useState, useEffect } from "react";
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
  I18nManager,
  Linking,
  Modal,
  AppState,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { useSettings } from "@/src/contexts/SettingsContext";
import { usePrayerTimes } from "@/src/contexts/PrayerTimesContext";
import { useNotifications } from "@/src/contexts/NotificationContext";
import { lightTheme, darkTheme } from "@/src/constants/theme";
import { CustomPicker } from "@/src/components/shared/CustomPicker";
import FacebookStyleTransition from "@/src/components/shared/FacebookStyleTransition";
import { useTranslation } from "@/src/i18n";
import { clearPrayerTimesCache } from '@/src/services/prayerTimesCache';
import { scheduleNotificationAt } from '@/src/utils/manualNotification';
import * as Notifications from 'expo-notifications';

// Fire Test Notification button handler
const handleFireTestNotification = async () => {
  try {
    console.log('[DEBUG] FireTestNotification: Button pressed');
    const perms = await Notifications.requestPermissionsAsync();
    console.log('[DEBUG] FireTestNotification: Permission status', perms.status);
    if (perms.status !== 'granted') {
      Alert.alert(t('permissionDenied') || 'Permission denied', t('allowNotifications') || 'Please allow notifications');
      console.log('[DEBUG] FireTestNotification: Permission denied');
      return;
    }
  console.log('[DEBUG] FireTestNotification: Scheduling notification for 2s in the future');
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Scheduled Test Notification',
        body: 'This is a test notification from Islamic Pro.',
        sound: true,
        vibrate: [0, 500, 250, 500],
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(Date.now() + 5000), // 5 seconds from now
        repeats: false,
      },
    });
    console.log('[DEBUG] FireTestNotification: Notification scheduled, id=', id);
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('[DEBUG] FireTestNotification: All scheduled notifications', scheduled);
    } catch (e) {
      console.warn('[DEBUG] FireTestNotification: Could not list scheduled notifications', e);
    }
  Alert.alert(t('scheduled') || 'Scheduled', t('testNotificationScheduled') || 'A test notification will fire in 2 seconds.');
  } catch (error) {
    console.error('[DEBUG] FireTestNotification: Failed to schedule test notification:', error);
  Alert.alert(t('error') || 'Error', t('failedToScheduleTestNotification') || 'Failed to schedule test notification.');
  }
};

const Settings = () => {
  const { settings, updateSettings, isDarkMode } = useSettings();
  const { clearCache } = usePrayerTimes();
  const { testIosNotificationSound } = useNotifications();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useTranslation();

  const [showLocationTutorial, setShowLocationTutorial] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);

  // Check location permission status when component mounts
  useEffect(() => {
    checkLocationPermission();
  }, []);
const handleDumpScheduledNotifications = async () => {
  try {
    console.log('[DEBUG] DumpScheduled: Button pressed');
    const list = await Notifications.getAllScheduledNotificationsAsync();
    console.log('[DEBUG] DumpScheduled: fetched', list);
    setScheduledNotifications(list || []);
    setShowNotificationsModal(true);
    } catch (error) {
    console.error('[DEBUG] DumpScheduled: Failed to fetch scheduled notifications', error);
    Alert.alert(t('error') || 'Error', t('failedToLoadScheduledNotifications') || 'Failed to load scheduled notifications. See console for details.');
  }
};

  // Listen for app state changes to refresh permission status
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // App has come to the foreground, check permissions again
        checkLocationPermission();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermissionStatus(status);
      
      // If permission is now granted and GPS was supposed to be enabled, update the setting
      if (status === 'granted' && settings.location.useGPS && locationPermissionStatus === 'denied') {
        console.log('Location permission granted - updating GPS setting');
      }
    } catch (error) {
      console.warn('Error checking location permission:', error);
    }
  };

  const handleGPSToggle = async (value) => {
    if (value) {
      // User wants to enable GPS - check permission first
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        
        if (status === 'granted') {
          // Permission already granted, enable GPS
          updateSettings("location", "useGPS", value);
          setLocationPermissionStatus(status);
        } else if (status === 'undetermined') {
          // Ask for permission
          const { status: requestStatus } = await Location.requestForegroundPermissionsAsync();
          if (requestStatus === 'granted') {
            updateSettings("location", "useGPS", value);
            setLocationPermissionStatus(requestStatus);
          } else {
            // Permission denied - show tutorial
            setShowLocationTutorial(true);
            setLocationPermissionStatus(requestStatus);
          }
        } else {
          // Permission was denied previously - show tutorial
          setShowLocationTutorial(true);
          setLocationPermissionStatus(status);
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        Alert.alert(t('error') || 'Error', t('unableToCheckLocationPermissions') || 'Unable to check location permissions. Please try again.');
      }
    } else {
      // User wants to disable GPS
      updateSettings("location", "useGPS", value);
    }
  };

  const handleSave = () => {
    Alert.alert(t("settingsSaved"), t("preferencesUpdated"), [
      { text: t("ok") },
    ]);
  };

  const handleLanguageChange = (newLanguage) => {
    updateSettings("appearance", "language", newLanguage);
    // Force RTL layout update for Arabic and Urdu
    const shouldBeRTL = ["ar", "ur"].includes(newLanguage);
    I18nManager.forceRTL(shouldBeRTL);
  };

  const handleClearCache = () => {
    Alert.alert(
      t('clearCache') || 'Clear Cache',
      t('clearCacheDesc') || 'This will clear cached prayer times and related data. Are you sure?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('clear') || 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCache();
              // Also clear the dedicated prayer times cache
              try {
                await clearPrayerTimesCache();
              } catch (err) {
                console.warn('Error clearing prayerTimesCache:', err);
              }
              Alert.alert(t('success') || 'Success', t('cacheCleared') || 'Cache cleared successfully!');
            } catch (error) {
              Alert.alert(t('error') || 'Error', t('failedToClearCache') || 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  // DEBUG: Reset onboarding for testing (remove in production)
  const handleResetOnboarding = () => {
    Alert.alert(
      '🔄 Reset Onboarding (Debug)',
      'This will reset the onboarding flow and restart the app. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
              onPress: async () => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              await AsyncStorage.multiRemove(['userSettings', 'app:lastBuildId']);
              Alert.alert(t('success') || 'Success', t('onboardingResetReload') || 'Onboarding reset! Please reload the app to see the welcome screen.');
            } catch (error) {
              console.error('Error resetting onboarding:', error);
              Alert.alert(t('error') || 'Error', t('failedToResetOnboarding') || 'Failed to reset onboarding');
            }
          },
        },
      ]
    );
  };

  const handleClearPrayerCache = () => {
    Alert.alert(
      t('clearPrayerCache') || 'Clear Prayer Cache',
      t('clearPrayerCacheDesc') || 'This will clear all cached prayer times for your current location and date. Continue?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('clear') || 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearPrayerTimesCache();
              Alert.alert(t('success') || 'Success', t('prayerCacheCleared') || 'Prayer cache cleared successfully');
            } catch (error) {
              console.error('Error clearing prayer cache:', error);
              Alert.alert(t('error') || 'Error', t('failedToClearPrayerCache') || 'Failed to clear prayer cache');
            }
          }
        }
      ]
    );
  };

  const styles = getStyles(theme, isDarkMode, isRTL());

  return (
    <FacebookStyleTransition direction="left">
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("settings")}</Text>
        <Text style={styles.subtitle}>{t("customizePreferences")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Platform.OS === "ios" ? 60 : 60 },
        ]}
        bounces={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.settingsContainer}>
          {/* Notifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="bell" size={20} color="#2980b9" />
              <Text style={styles.sectionTitle}>{t("notifications")}</Text>
            </View>

                <View style={[styles.settingItem, styles.switchItem]}>
                  <View style={styles.settingHeader}>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>{t('prayerTimeNotifications')}</Text>
                      <Text style={styles.settingDescription}>{t('receivePrayerAlerts')}</Text>
                    </View>
                    <Switch
                      value={settings.notifications.enabled}
                      onValueChange={(value) =>
                        updateSettings("notifications", "enabled", value)
                      }
                      trackColor={{ false: "#dce4ec", true: "#2980b9" }}
                      thumbColor={
                        settings.notifications.enabled ? "#fff" : "#f4f3f4"
                      }
                    />
                  </View>
                </View>

            {settings.notifications.enabled && (
              <>
                <View style={[styles.settingItem, styles.switchItem]}>
                  <View style={styles.settingHeader}>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>{t('adhanSound')}</Text>
                      <Text style={styles.settingDescription}>{t('playAdhanAtPrayerTimes')}</Text>
                    </View>
                    <Switch
                      value={settings.notifications.adhan}
                      onValueChange={(value) =>
                        updateSettings("notifications", "adhan", value)
                      }
                      trackColor={{ false: "#dce4ec", true: "#2980b9" }}
                      thumbColor={
                        settings.notifications.adhan ? "#fff" : "#f4f3f4"
                      }
                    />
                  </View>
                  {settings.notifications.adhan && (
                    <View style={[styles.settingItem, styles.pickerItem]}>
                      <Text style={styles.settingTitle}>{t('adhanSound')}</Text>
                      <Text style={styles.settingDescription}>{t('chooseAthanRecitation')}</Text>
                      <CustomPicker
                        selectedValue={settings.notifications.athanSound}
                        onValueChange={(value) =>
                          updateSettings("notifications", "athanSound", value)
                        }
                        items={[
                          {
                            label: "Makkah (Abdul Rahman Al-Sudais)",
                            value: "makkah",
                          },
                          {
                            label: "Madinah (Ali Ahmed Mulla)",
                            value: "madinah",
                          },
                          {
                            label: "Egypt (Mahmoud Al-Husary)",
                            value: "egypt",
                          },
                          {
                            label: "Turkey (Hafez Mustafa Ozcan)",
                            value: "turkey",
                          },
                          { label: t('nasirAlQatami') || 'Nasir Al-Qatami', value: "nasiralqatami" },
                          { label: t('defaultSystemSound') || 'Default System Sound', value: "default" },
                        ]}
                        title={t('selectAthanSound')}
                        theme={theme}
                      />
                      
                      {Platform.OS === 'ios' && (
                        <TouchableOpacity
                          style={[
                            styles.testButton,
                            { backgroundColor: theme.primary },
                          ]}
                          onPress={async () => {
                            try {
                              console.log('[DEBUG] iOSTestNotification: Button pressed');
                              await testIosNotificationSound(settings.notifications.athanSound);
                              Alert.alert('Scheduled', 'iOS notification scheduled in ~10 seconds for sound test.');
                            } catch (err) {
                              console.error('[DEBUG] iOSTestNotification: Failed to schedule iOS test:', err);
                              Alert.alert('Error', 'Failed to schedule iOS notification test.');
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.testButtonText,
                              { color: theme.text.inverse },
                            ]}
                          >
                            {t('testIosNotificationSound')}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                <View style={[styles.settingItem, styles.switchItem]}>
                  <View style={styles.settingHeader}>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>{t("vibrate")}</Text>
                      <Text style={styles.settingDescription}>
                        {t("vibrateWithNotifications")}
                      </Text>
                    </View>
                    <Switch
                      value={settings.notifications.vibrate}
                      onValueChange={(value) =>
                        updateSettings("notifications", "vibrate", value)
                      }
                      trackColor={{ false: "#dce4ec", true: "#2980b9" }}
                      thumbColor={
                        settings.notifications.vibrate ? "#fff" : "#f4f3f4"
                      }
                    />
                  </View>
                </View>

                {/* Pre-prayer reminders */}
                <View style={[styles.settingItem, styles.switchItem]}>
                  <View style={styles.settingHeader}>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>{t('prePrayerReminder')}</Text>
                      <Text style={styles.settingDescription}>{t('prePrayerReminderDesc')}</Text>
                    </View>
                    <Switch
                      value={settings.notifications.prePrayer}
                      onValueChange={(value) =>
                        updateSettings("notifications", "prePrayer", value)
                      }
                      trackColor={{ false: "#dce4ec", true: "#2980b9" }}
                      thumbColor={
                        settings.notifications.prePrayer ? "#fff" : "#f4f3f4"
                      }
                    />
                  </View>
                </View>

                {settings.notifications.prePrayer && (
                  <View style={[styles.settingItem, styles.pickerItem]}>
                    <Text style={styles.settingTitle}>{t('reminderTimeBeforePrayer')}</Text>
                    <Text style={styles.settingDescription}>{t('reminderBeforeDescription')}</Text>
                    <CustomPicker
                      selectedValue={settings.notifications.prePrayerTime}
                      onValueChange={(value) =>
                        updateSettings("notifications", "prePrayerTime", value)
                      }
                      items={[
                        { label: '5 minutes', value: 5 },
                        { label: '10 minutes', value: 10 },
                        { label: '15 minutes', value: 15 },
                        { label: '30 minutes', value: 30 },
                      ]}
                      title={t('reminderOffset')}
                      theme={theme}
                    />
                  </View>
                )}
              </>
            )}
          </View>

          {/* Appearance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="paint-brush" size={20} color="#2980b9" />
              <Text style={styles.sectionTitle}>{t("appearance")}</Text>
            </View>

            <View style={[styles.settingItem, styles.pickerItem]}>
              <Text style={styles.settingTitle}>{t("theme")}</Text>
              <Text style={styles.settingDescription}>
                {t("choosePreferredAppearance")}
              </Text>
              <CustomPicker
                selectedValue={settings.appearance.theme}
                onValueChange={(value) =>
                  updateSettings("appearance", "theme", value)
                }
                items={[
                  { label: t("light"), value: "light" },
                  { label: t("dark"), value: "dark" },
                  { label: t("systemDefault"), value: "system" },
                ]}
                title={t("selectTheme")}
                theme={theme}
              />
            </View>

            <View style={[styles.settingItem, styles.pickerItem]}>
              <Text style={styles.settingTitle}>{t("language")}</Text>
              <Text style={styles.settingDescription}>
                {t("selectPreferredLanguage")}
              </Text>
              <CustomPicker
                selectedValue={settings.appearance.language}
                onValueChange={handleLanguageChange}
                items={[
                  { label: "English", value: "en" },
                  { label: "العربية", value: "ar" },
                  { label: "اردو", value: "ur" },
                  { label: "Türkçe", value: "tr" },
                ]}
                title={t("selectLanguage")}
                theme={theme}
              />
            </View>

            <View style={[styles.settingItem, styles.switchItem]}>
              <View style={styles.settingHeader}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t("showHijriDates")}</Text>
                  <Text style={styles.settingDescription}>
                    {t("displayIslamicCalendarDates")}
                  </Text>
                </View>
                <Switch
                  value={settings.appearance.showHijriDates}
                  onValueChange={(value) =>
                    updateSettings("appearance", "showHijriDates", value)
                  }
                  trackColor={{ false: "#dce4ec", true: "#2980b9" }}
                  thumbColor={
                    settings.appearance.showHijriDates ? "#fff" : "#f4f3f4"
                  }
                />
              </View>
            </View>

            <View style={[styles.settingItem, styles.pickerItem]}>
              <Text style={styles.settingTitle}>{t("timeFormat")}</Text>
              <Text style={styles.settingDescription}>
                {t("chooseTimeDisplay")}
              </Text>
              <CustomPicker
                selectedValue={settings.appearance.timeFormat}
                onValueChange={(value) =>
                  updateSettings("appearance", "timeFormat", value)
                }
                items={[
                  { label: t("24hour"), value: "24h" },
                  { label: t("12hour"), value: "12h" },
                ]}
                title={t("selectTimeFormat")}
                theme={theme}
              />
            </View>
          </View>

          {/* Prayer Calculation Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="calculator" size={20} color="#2980b9" />
              <Text style={styles.sectionTitle}>{t("prayerCalculations")}</Text>
            </View>

            <View style={[styles.settingItem, styles.pickerItem]}>
              <Text style={styles.settingTitle}>{t("calculationMethod")}</Text>
              <Text style={styles.settingDescription}>
                {t("methodForCalculating")}
              </Text>
              <CustomPicker
                selectedValue={settings.prayer.calculationMethod}
                onValueChange={(value) =>
                  updateSettings("prayer", "calculationMethod", value)
                }
                items={[
                  { label: 'Auto (Recommended for Region)', value: 'auto' },
                  { label: t("muslimWorldLeague"), value: "mwl" },
                  { label: t("isna"), value: "isna" },
                  { label: t("egyptianGeneralAuthority"), value: "egypt" },
                  { label: t("ummAlQura"), value: "makkah" },
                  { label: t("universityOfKarachi"), value: "karachi" },
                ]}
                title={t("selectCalculationMethod")}
                theme={theme}
              />
              {/* Clear prayer cache is handled by the main Clear Cache action in Support */}
            </View>

            <View style={[styles.settingItem, styles.pickerItem]}>
              <Text style={styles.settingTitle}>{t("madhab")}</Text>
              <Text style={styles.settingDescription}>
                {t("schoolOfThought")}
              </Text>
              <CustomPicker
                selectedValue={settings.prayer.madhab}
                onValueChange={(value) =>
                  updateSettings("prayer", "madhab", value)
                }
                items={[
                  { label: t("shafiMalikiHanbali"), value: "shafi" },
                  { label: t("hanafi"), value: "hanafi" },
                ]}
                title={t("selectMadhab")}
                theme={theme}
              />
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="map-marker-alt" size={20} color="#2980b9" />
              <Text style={styles.sectionTitle}>{t("location")}</Text>
            </View>

            <View style={[styles.settingItem, styles.switchItem]}>
              <View style={styles.settingHeader}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t("useGPSLocation")}</Text>
                  <Text style={styles.settingDescription}>
                    {t('getPrecisePrayerTimes')}
                  </Text>
                  {locationPermissionStatus === 'denied' && settings.location.useGPS && (
                    <Text style={[styles.permissionWarning, { color: '#e74c3c' }]}>
                      ⚠️ Location permission is required. Tap to learn how to enable it.
                    </Text>
                  )}
                </View>
                <Switch
                  value={settings.location.useGPS}
                  onValueChange={handleGPSToggle}
                  trackColor={{ false: "#dce4ec", true: "#2980b9" }}
                  thumbColor={settings.location.useGPS ? "#fff" : "#f4f3f4"}
                />
              </View>
              {locationPermissionStatus === 'denied' && settings.location.useGPS && (
                <TouchableOpacity
                  style={[styles.permissionButton, { backgroundColor: '#e74c3c' }]}
                  onPress={() => setShowLocationTutorial(true)}
                >
                  <FontAwesome5 name="exclamation-triangle" size={16} color="#fff" />
                  <Text style={[styles.permissionButtonText, { color: '#fff' }]}>
                    Enable Location in iOS Settings
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!settings.location.useGPS && (
              <View style={[styles.settingItem, styles.pickerItem]}>
                <Text style={styles.settingTitle}>{t("city")}</Text>
                  <Text style={styles.settingDescription}>
                    {t('selectYourCityForPrayerTimes')}
                  </Text>
                <CustomPicker
                  selectedValue={settings.location.city}
                  onValueChange={(value) =>
                    updateSettings("location", "city", value)
                  }
                  items={[
                    { label: "New York", value: "New York" },
                    { label: "Brooklyn", value: "Brooklyn" },
                    { label: "London", value: "London" },
                    { label: "Dubai", value: "Dubai" },
                    { label: "Istanbul", value: "Istanbul" },
                    { label: "Riyadh", value: "Riyadh" },
                    { label: "Cairo", value: "Cairo" },
                    { label: "Karachi", value: "Karachi" },
                    { label: "Jakarta", value: "Jakarta" },
                    { label: "Kuala Lumpur", value: "Kuala Lumpur" },
                    { label: "Dhaka", value: "Dhaka" },
                  ]}
                  title={t('selectCity') || 'Select City'}
                  theme={theme}
                />
              </View>
            )}
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="question-circle" size={20} color="#2980b9" />
              <Text style={styles.sectionTitle}>{t("support")}</Text>
            </View>

            <TouchableOpacity
              style={[styles.settingItem, styles.linkItem]}
              onPress={() => Linking.openURL("mailto:support@heshoom.com")}
            >
              <View style={styles.settingHeader}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t("contactSupport")}</Text>
                  <Text style={styles.settingDescription}>
                    Get help with the app or report issues
                  </Text>
                </View>
                <FontAwesome5 
                  name="external-link-alt" 
                  size={16} 
                  color={theme.text.secondary} 
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, styles.linkItem]}
              onPress={() => Linking.openURL("https://heshoom.com/islamic-pro/privacy")}
            >
              <View style={styles.settingHeader}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t("privacyPolicy")}</Text>
                  <Text style={styles.settingDescription}>
                    {t('readPrivacyPolicy')}
                  </Text>
                </View>
                <FontAwesome5 
                  name="external-link-alt" 
                  size={16} 
                  color={theme.text.secondary} 
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, styles.linkItem]}
              onPress={() => Linking.openURL("https://heshoom.com/islamic-pro/terms")}
            >
              <View style={styles.settingHeader}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t("termsOfService")}</Text>
                  <Text style={styles.settingDescription}>
                    {t('readTermsOfService')}
                  </Text>
                </View>
                <FontAwesome5 
                  name="external-link-alt" 
                  size={16} 
                  color={theme.text.secondary} 
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, styles.linkItem]}
              onPress={handleClearCache}
            >
              <View style={styles.settingHeader}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>{t('clearCache')}</Text>
                  <Text style={styles.settingDescription}>{t('clearCacheDesc')}</Text>
                </View>
                <FontAwesome5 
                  name="trash" 
                  size={16} 
                  color={theme.text.secondary} 
                />
              </View>
            </TouchableOpacity>

            {/* DEBUG: Reset Onboarding Button - Remove in production
            <TouchableOpacity
              style={[styles.settingItem, styles.linkItem]}
              onPress={handleResetOnboarding}
            >
              <View style={styles.settingHeader}>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: '#e74c3c' }]}>🔄 Reset Onboarding (Debug)</Text>
                  <Text style={styles.settingDescription}>
                    Reset app to show welcome screen again
                  </Text>
                </View>
                <FontAwesome5 
                  name="redo" 
                  size={16} 
                  color="#e74c3c" 
                />
              </View>
            </TouchableOpacity> */}

            <View style={[styles.settingItem, styles.infoItem]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t("appVersion")}</Text>
                <Text style={styles.settingDescription}>
                  {t('appVersionText') || 'Islamic Pro v1.0.0'}
                </Text>
              </View>
            </View>
          </View>

          {/* Push notification debug tools removed in this build */}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t("saveChanges")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Location Permission Tutorial Modal */}
      <Modal
        visible={showLocationTutorial}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationTutorial(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <FontAwesome5 name="map-marker-alt" size={24} color="#2980b9" />
              <Text style={[styles.modalTitle, { color: theme.text.primary }] }>
                {t('enableLocationAccess')}
              </Text>
            </View>
            
            <Text style={[styles.modalDescription, { color: theme.text.secondary }] }>
              {t('enableLocationDescription')}
            </Text>

            <View style={styles.stepsContainer}>
              <Text style={[styles.stepsTitle, { color: theme.text.primary }] }>
                {t('followTheseSteps')}
              </Text>
              
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: '#2980b9' }]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.text.secondary }] }>
                  {t('step1')}
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: '#2980b9' }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.text.secondary }] }>
                  {t('step2')}
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: '#2980b9' }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.text.secondary }] }>
                  {t('step3')}
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: '#2980b9' }]}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.text.secondary }] }>
                  {t('step4')}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.settingsButton, { backgroundColor: '#2980b9' }]}
                onPress={() => {
                  setShowLocationTutorial(false);
                  Linking.openSettings();
                }}
              >
                <FontAwesome5 name="cog" size={16} color="#fff" />
                <Text style={[styles.modalButtonText, { color: '#fff' }] }>
                  {t('openSettings')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.tryAgainButton, { backgroundColor: '#27ae60' }]}
                onPress={async () => {
                  await checkLocationPermission();
                  if (locationPermissionStatus === 'granted') {
                    setShowLocationTutorial(false);
                    updateSettings("location", "useGPS", true);
                    Alert.alert(t('success') || 'Success', t('locationEnabled') || 'Location access enabled successfully.');
                  } else {
                    Alert.alert(t('stillDenied') || 'Still Denied', t('enableLocationInSettings') || 'Please enable location access in Settings first.');
                  }
                }}
              >
                <FontAwesome5 name="sync-alt" size={16} color="#fff" />
                <Text style={[styles.modalButtonText, { color: '#fff' }] }>
                  {t('tryAgain')}
                </Text>
              </TouchableOpacity>
            </View>

              <TouchableOpacity
                style={[styles.laterButtonFull, { backgroundColor: theme.border, marginTop: 12 }]}
                onPress={() => {
                  setShowLocationTutorial(false);
                  // Turn off GPS toggle since permission is denied
                  updateSettings("location", "useGPS", false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.text.secondary }] }>
                  {t('maybeLater')}
                </Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
      {/* Scheduled Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 600 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>{t('scheduledNotifications')}</Text>
            </View>
            <ScrollView style={{ maxHeight: 400, marginBottom: 12 }}>
              {scheduledNotifications.length === 0 && (
                <Text style={{ color: theme.text.secondary }}>{t('noScheduledNotifications')}</Text>
              )}
              {scheduledNotifications.map((n, idx) => (
                <View key={n.identifier || idx} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                  <Text style={{ fontWeight: '600' }}>{n.content?.title || 'Untitled'}</Text>
                  <Text style={{ color: theme.text.secondary }}>{n.content?.body}</Text>
                  <Text style={{ color: theme.text.secondary, fontSize: 12 }}>{JSON.stringify(n.trigger || n.content?.data || {})}</Text>
                  <Text style={{ color: theme.text.secondary, fontSize: 12 }}>ID: {n.identifier}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.primary }]} onPress={() => setShowNotificationsModal(false)}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </FacebookStyleTransition>
  );
};

const getStyles = (theme, isDarkMode, isRTL = false) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    header: {
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.primary,
    },
    subtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginTop: 4,
    },
    settingsContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    section: {
      marginTop: 16,
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.border,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDarkMode ? theme.surface : theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary,
      marginLeft: 10,
    },
    settingItem: {
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === "ios" ? 8 : 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      minHeight: Platform.OS === "ios" ? 44 : 48,
    },
    switchItem: {
      paddingVertical: Platform.OS === "ios" ? 6 : 8,
    },
    settingHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: 28,
    },
    settingTextContainer: {
      flex: 1,
      paddingRight: 16,
    },
    settingTitle: {
      fontSize: 16,
      color: theme.text.primary,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 13,
      color: theme.text.secondary,
      lineHeight: 16,
    },
    pickerItem: {
      paddingVertical: Platform.OS === "ios" ? 8 : 8,
    },
    linkItem: {
      paddingVertical: Platform.OS === "ios" ? 12 : 14,
    },
    infoItem: {
      paddingVertical: Platform.OS === "ios" ? 12 : 14,
      backgroundColor: isDarkMode ? theme.background : theme.surface,
    },
    saveButton: {
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: Platform.OS === "ios" ? 40 : 20,
      backgroundColor: theme.primary,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      ...Platform.select({
        ios: {
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    saveButtonText: {
      color: theme.text.inverse,
      fontSize: 16,
      fontWeight: "600",
    },
    testButton: {
      marginTop: 12,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 6,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    testButtonText: {
      fontSize: 14,
      fontWeight: "500",
    },
    clearButton: {
      marginTop: 12,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 6,
    },
    clearButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    permissionWarning: {
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500',
    },
    permissionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      gap: 8,
    },
    permissionButtonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 12,
      padding: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    modalDescription: {
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 20,
    },
    stepsContainer: {
      marginBottom: 24,
    },
    stepsTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
    },
    step: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      gap: 12,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    stepNumberText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    stepText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    settingsButton: {
      // Specific styles for settings button
    },
    tryAgainButton: {
      // Specific styles for try again button  
    },
    laterButtonFull: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    modalButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default Settings;
