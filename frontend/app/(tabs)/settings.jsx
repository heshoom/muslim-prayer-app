import React from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSettings } from "@/src/contexts/SettingsContext";
import { useNotifications } from "@/src/contexts/NotificationContext";
import { usePrayerTimes } from "@/src/contexts/PrayerTimesContext";
import { lightTheme, darkTheme } from "@/src/constants/theme";
import { CustomPicker } from "@/src/components/shared/CustomPicker";
import FacebookStyleTransition from "@/src/components/shared/FacebookStyleTransition";
import { useTranslation } from "@/src/i18n";
import { clearPrayerTimesCache } from '@/src/services/prayerTimesCache';

const Settings = () => {
  const { settings, updateSettings, isDarkMode } = useSettings();
  const { testAthanSound } = useNotifications();
  const { clearCache } = usePrayerTimes();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useTranslation();

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
                      <Text style={styles.settingTitle}>
                        Prayer Time Notifications
                      </Text>
                      <Text style={styles.settingDescription}>
                        Get notifications for all prayer times
                      </Text>
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
                      <Text style={styles.settingTitle}>{t("adhanSound")}</Text>
                      <Text style={styles.settingDescription}>
                        {t("playAdhanAtPrayerTimes")}
                      </Text>
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
                      <Text style={styles.settingTitle}>Athan Sound</Text>
                      <Text style={styles.settingDescription}>
                        Choose your preferred athan recitation
                      </Text>
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
                          { label: "Nasir Al-Qatami", value: "nasiralqatami" },
                          { label: "Default System Sound", value: "default" },
                        ]}
                        title="Select Athan Sound"
                        theme={theme}
                      />
                      <TouchableOpacity
                        style={[
                          styles.testButton,
                          { backgroundColor: theme.primary },
                        ]}
                        onPress={async () => {
                          console.log(
                            "Test button pressed, athan type:",
                            settings.notifications.athanSound
                          );
                          try {
                            await testAthanSound(
                              settings.notifications.athanSound
                            );
                            Alert.alert(
                              "Test Notification Sent",
                              "Check your notification panel for the test athan sound.",
                              [{ text: "OK" }]
                            );
                          } catch (error) {
                            console.error("Error testing athan:", error);
                            Alert.alert(
                              "Test Failed",
                              "Unable to send test notification. Please check notification permissions.",
                              [{ text: "OK" }]
                            );
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.testButtonText,
                            { color: theme.text.inverse },
                          ]}
                        >
                          Test Athan Sound
                        </Text>
                      </TouchableOpacity>
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

                <View style={[styles.settingItem, styles.switchItem]}>
                  <View style={styles.settingHeader}>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>
                        {t("prePrayerReminder")}
                      </Text>
                      <Text style={styles.settingDescription}>
                        Get notified before prayer time
                      </Text>
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
                  {settings.notifications.prePrayer && (
                    <View style={[styles.settingItem, styles.pickerItem]}>
                      <Text style={styles.settingTitle}>Reminder Time</Text>
                      <Text style={styles.settingDescription}>
                        How early to be notified
                      </Text>
                      <CustomPicker
                        selectedValue={settings.notifications.prePrayerTime}
                        onValueChange={(value) =>
                          updateSettings(
                            "notifications",
                            "prePrayerTime",
                            value
                          )
                        }
                        items={[
                          { label: `5 ${t("minutesBefore")}`, value: 5 },
                          { label: `10 ${t("minutesBefore")}`, value: 10 },
                          { label: `15 ${t("minutesBefore")}`, value: 15 },
                          { label: `30 ${t("minutesBefore")}`, value: 30 },
                        ]}
                        title="Select Reminder Time"
                        theme={theme}
                      />
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
                    Get precise prayer times for your exact location
                  </Text>
                </View>
                <Switch
                  value={settings.location.useGPS}
                  onValueChange={(value) =>
                    updateSettings("location", "useGPS", value)
                  }
                  trackColor={{ false: "#dce4ec", true: "#2980b9" }}
                  thumbColor={settings.location.useGPS ? "#fff" : "#f4f3f4"}
                />
              </View>
            </View>

            {!settings.location.useGPS && (
              <View style={[styles.settingItem, styles.pickerItem]}>
                <Text style={styles.settingTitle}>{t("city")}</Text>
                <Text style={styles.settingDescription}>
                  Select your city for prayer times
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
                  title="Select City"
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
                    Read our privacy policy
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
                    Read our terms of service
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
                  <Text style={styles.settingTitle}>Clear Cache</Text>
                  <Text style={styles.settingDescription}>
                    Clear cached prayer times and refresh data
                  </Text>
                </View>
                <FontAwesome5 
                  name="trash" 
                  size={16} 
                  color={theme.text.secondary} 
                />
              </View>
            </TouchableOpacity>

            <View style={[styles.settingItem, styles.infoItem]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t("appVersion")}</Text>
                <Text style={styles.settingDescription}>
                  Islamic Pro v1.0.0
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t("saveChanges")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  });

export default Settings;
