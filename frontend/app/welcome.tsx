import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '@/src/contexts/SettingsContext';
import { useTranslation } from '@/src/i18n';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = {
  WELCOME: 0,
  LANGUAGE: 1,
  PERMISSIONS: 2,
  LOCATION: 3,
  NOTIFICATIONS: 4,
  APPEARANCE: 5,
  TOUR: 6,
  FINISH: 7,
};

const COMMON_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية' },
  { code: 'tr', label: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو' },
];

// Use settings codes to align with the app: 'auto' | 'isna' | 'mwl' | 'egypt' | 'makkah' | 'karachi'
const CALCULATION_METHODS = [
  { key: 'auto', label: 'Auto (Recommended for Region)' },
  { key: 'isna', label: 'ISNA (Islamic Society of North America)' },
  { key: 'mwl', label: 'Muslim World League' },
  { key: 'egypt', label: 'Egyptian General Authority' },
  { key: 'makkah', label: 'Umm Al-Qura University (Saudi)' },
  { key: 'karachi', label: 'University of Islamic Sciences, Karachi' },
];

const CITY_OPTIONS = [
  { city: 'New York', country: 'US' },
  { city: 'London', country: 'GB' },
  { city: 'Dubai', country: 'AE' },
  { city: 'Istanbul', country: 'TR' },
  { city: 'Riyadh', country: 'SA' },
  { city: 'Cairo', country: 'EG' },
  { city: 'Karachi', country: 'PK' },
];

const getDeviceLanguage = (): string => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale) return locale.split('-')[0];
  } catch {}
  return 'en';
};

const recommendMethodByCountry = (countryCodeOrName?: string): string => {
  if (!countryCodeOrName) return 'auto';
  const cc = countryCodeOrName.toUpperCase();
  // North America
  if (['US', 'CA', 'MX', 'UNITED STATES', 'CANADA', 'MEXICO'].includes(cc)) return 'isna';
  // Saudi Arabia
  if (['SA', 'SAU', 'SAUDI ARABIA'].includes(cc)) return 'makkah';
  // Egypt
  if (['EG', 'EGY', 'EGYPT'].includes(cc)) return 'egypt';
  // Turkey and many regions use MWL fine
  if (['TR', 'TUR', 'TURKEY', 'GB', 'UK', 'UNITED KINGDOM', 'AE', 'ARE', 'UAE'].includes(cc)) return 'mwl';
  return 'auto';
};

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  // Safe translation fallback helper so raw keys don't render in UI
  const tf = (key: string, fallback: string) => {
    const v = t(key);
    return !v || v === key ? fallback : v;
  };
  const { settings, updateSettings, isDarkMode } = useSettings();
  
  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // State
  const [step, setStep] = useState<number>(STEPS.WELCOME);
  const [selectedLang, setSelectedLang] = useState<string>(
    settings?.appearance?.language || getDeviceLanguage()
  );
  const [locationGranted, setLocationGranted] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('auto');
  const [selectedMadhhab, setSelectedMadhhab] = useState<'shafi' | 'hanafi'>('shafi');
  const [notificationType, setNotificationType] = useState<'adhan' | 'short' | 'silent'>('adhan');
  const [notificationsGranted, setNotificationsGranted] = useState<boolean>(false);
  const [selectedPrayers, setSelectedPrayers] = useState<string[]>(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(
    settings?.appearance?.theme || 'system'
  );
  const [tourStep, setTourStep] = useState<number>(0);
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<{ city: string; country: string } | null>(null);
  const [didAutoDetect, setDidAutoDetect] = useState<boolean>(false);
  
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Animation helper
  const animateToStep = (newStep: number) => {
    Animated.timing(slideAnim, {
      toValue: -newStep * SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setStep(newStep);
  };

  useEffect(() => {
    // Auto-select device language on mount if not set
    if (!settings?.appearance?.language) {
      const deviceLang = getDeviceLanguage();
      const supported = COMMON_LANGUAGES.find(l => l.code === deviceLang);
      if (supported && selectedLang !== supported.code) {
        setSelectedLang(supported.code);
      }
    }
  }, []);

  // Step 1: Welcome Screen
  const renderWelcome = () => (
    <View style={styles.stepContent}>
  <View style={styles.content}>
  <View style={styles.hero}>
        <Text style={[styles.title, { color: theme.primary }]}>
          {tf('assalamuAlaikum', 'Assalamu Alaikum 👋')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary, marginTop: 8 }]}>
          {tf('welcomeToIslamicPro', 'Welcome to Islamic Pro')}
        </Text>
        <Text style={[styles.description, { color: theme.text.secondary, marginTop: 16 }]}>
          {tf('onboardingIntro', 'Your comprehensive Islamic companion for prayer times, Qibla direction, and daily spiritual guidance.')}
        </Text>
  </View>
      
      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: theme.primary }]} 
        onPress={() => animateToStep(STEPS.LANGUAGE)}
      >
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
          {tf('getStarted', 'Get Started')}
        </Text>
      </TouchableOpacity>
  </View>
    </View>
  );

  // Step 2: Language Selection
  const renderLanguage = () => (
    <View style={styles.stepContent}>
      <View style={styles.content}>
      <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
        {tf('selectPreferredLanguage', 'Choose your preferred language')}
      </Text>
      <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 24 }]}>
        {tf('autoDetectedLanguage', "We've auto-detected your device language")}
      </Text>
      
      <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
        {COMMON_LANGUAGES.map(lang => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.optionCard, 
              { 
                backgroundColor: selectedLang === lang.code ? theme.primary : theme.surface,
                borderColor: selectedLang === lang.code ? theme.primary : theme.border 
              }
            ]}
            onPress={() => {
              setSelectedLang(lang.code);
              updateSettings('appearance', 'language', lang.code);
              // Force immediate re-render so translations update instantly
              setForceUpdate(prev => prev + 1);
            }}
          >
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionTitle, 
                { color: selectedLang === lang.code ? theme.text.inverse : theme.text.primary }
              ]}>
                {lang.nativeName}
              </Text>
              <Text style={[
                styles.optionSubtitle, 
                { color: selectedLang === lang.code ? theme.text.inverse : theme.text.secondary }
              ]}>
                {lang.label}
              </Text>
            </View>
            {selectedLang === lang.code && (
              <Text style={[styles.checkmark, { color: theme.text.inverse }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: theme.primary }]} 
        onPress={() => animateToStep(STEPS.PERMISSIONS)}
      >
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
      {tf('continue', 'Continue')}
        </Text>
      </TouchableOpacity>
    </View>
    </View>
  );
  // Step 3: Permissions Pre-prompt (Apple-friendly wording)
  const renderPermissions = () => (
    <View style={[styles.stepContent, styles.topAlignedStep]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}> 
          {tf('permissionsSetup', 'Let’s set things up')}
        </Text>
        <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 20 }]}> 
          {tf('permissionsSetupDesc', 'We’ll use these to provide accurate prayer times and timely reminders.')}
        </Text>

        {/* Location card */}
        <View style={[styles.permissionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconWrap, { backgroundColor: isDarkMode ? '#1f2937' : '#eef2ff' }]}>
              <Text style={styles.cardIcon}>📍</Text>
            </View>
            <View style={styles.cardTextCol}>
              <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
                {tf('locationAccessTitle', 'Location Access')}
              </Text>
              <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>
                {tf('locationNeededForAccuracy', 'We need your location for accurate prayer times and Qibla direction')}
              </Text>
            </View>
            <View style={styles.cardActionCol}>
              {locationGranted ? (
                <View style={[styles.pill, { backgroundColor: theme.success }]}>
                  <Text style={[styles.pillText, { color: theme.text.inverse }]}>{tf('granted', 'Granted')}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButtonSm, { backgroundColor: theme.primary }]}
                  onPress={async () => {
                    try {
                      const { status } = await Location.requestForegroundPermissionsAsync();
                      const granted = status === 'granted';
                      setLocationGranted(granted);
                    } catch (e) {
                      Alert.alert(tf('error', 'Error'), tf('unableToAccessLocation', 'Unable to access location'));
                    }
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: theme.text.inverse }]}>{tf('continue', 'Continue')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Notifications card */}
        <View style={[styles.permissionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconWrap, { backgroundColor: isDarkMode ? '#1f2937' : '#fff7ed' }]}>
              <Text style={styles.cardIcon}>🔔</Text>
            </View>
            <View style={styles.cardTextCol}>
              <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
                {tf('notificationsAccessTitle', 'Notifications')}
              </Text>
              <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>
                {tf('enableNotificationsDesc', 'Get notified at prayer times so you never miss a prayer.')}
              </Text>
            </View>
            <View style={styles.cardActionCol}>
              {notificationsGranted ? (
                <View style={[styles.pill, { backgroundColor: theme.success }]}>
                  <Text style={[styles.pillText, { color: theme.text.inverse }]}>{tf('granted', 'Granted')}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButtonSm, { backgroundColor: theme.primary }]}
                  onPress={async () => {
                    try {
                      const res = await Notifications.requestPermissionsAsync();
                      const granted = res.status === 'granted' || (res as any).granted === true;
                      setNotificationsGranted(granted);
                    } catch (e) {
                      console.warn('Notification permission error:', e);
                    }
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: theme.text.inverse }]}>{tf('continue', 'Continue')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 8 }]} 
          onPress={() => animateToStep(STEPS.LOCATION)}
        >
          <Text style={[styles.buttonText, { color: theme.text.inverse }]}> 
            {tf('next', 'Next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  // Step 3: Location & Prayer Settings
  const renderLocation = () => (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.stepContent}>
        <View style={styles.content}>
        <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
          {tf('locationAndPrayerCalculation', 'Location & Prayer Calculation')}
        </Text>
        <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 24 }]}>
          {tf('locationNeededForAccuracy', 'We need your location for accurate prayer times and Qibla direction')}
        </Text>

  {/* Location permission is now handled in the previous step. */}

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, marginTop: 8 }]}
          onPress={() => {
            setManualMode(!manualMode);
          }}
        >
          <Text style={[styles.buttonText, { color: theme.text.primary }]}>
            {manualMode ? tf('useGPSInstead', 'Use GPS instead') : tf('setCityManually', 'Set City Manually')}
          </Text>
        </TouchableOpacity>

        {manualMode && (
          <View style={{ width: '100%', marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary, marginBottom: 12 }]}>
              {tf('selectCity', 'Select City')}
            </Text>
            {CITY_OPTIONS.map((c) => (
              <TouchableOpacity
                key={`${c.city}-${c.country}`}
                style={[
                  styles.methodCard,
                  {
                    backgroundColor: selectedCity?.city === c.city ? theme.primary : theme.surface,
                    borderColor: selectedCity?.city === c.city ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => {
                  setSelectedCity(c);
                  const rec = recommendMethodByCountry(c.country);
                  setSelectedMethod(rec);
                  updateSettings('location', 'useGPS', false);
                  updateSettings('location', 'city', c.city);
                  updateSettings('location', 'country', c.country);
                }}
              >
                <Text style={[styles.methodTitle, { color: selectedCity?.city === c.city ? theme.text.inverse : theme.text.primary }]}>
                  {c.city}
                </Text>
                <Text style={[styles.methodDescription, { color: selectedCity?.city === c.city ? theme.text.inverse : theme.text.secondary }]}>
                  {c.country}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text.primary, marginTop: 24, marginBottom: 16 }]}>
          {tf('calculationMethod', 'Prayer Calculation Method')}
        </Text>

  {CALCULATION_METHODS.map((method) => (
          <TouchableOpacity
            key={method.key}
            style={[
              styles.methodCard,
              {
                backgroundColor: selectedMethod === method.key ? theme.primary : theme.surface,
                borderColor: selectedMethod === method.key ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setSelectedMethod(method.key)}
          >
            <Text
              style={[
                styles.methodTitle,
                { color: selectedMethod === method.key ? theme.text.inverse : theme.text.primary },
              ]}
            >
              {tf(`calcMethod.${method.key}`, method.label)}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.text.primary, marginTop: 24, marginBottom: 16 }]}>
          {tf('madhab', 'Madhhab (Asr Calculation)')}
        </Text>

        <View style={styles.madhhabContainer}>
          {['shafi', 'hanafi'].map((madhhab) => (
            <TouchableOpacity
              key={madhhab}
              style={[
                styles.madhhabOption,
                {
                  backgroundColor: selectedMadhhab === madhhab ? theme.primary : theme.surface,
                  borderColor: selectedMadhhab === madhhab ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setSelectedMadhhab(madhhab as 'shafi' | 'hanafi')}
            >
              <Text
                style={[
                  styles.madhhabText,
                  { color: selectedMadhhab === madhhab ? theme.text.inverse : theme.text.primary },
                ]}
              >
                {tf(`madhhab.${madhhab}`, madhhab.charAt(0).toUpperCase() + madhhab.slice(1))}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: theme.primary, marginTop: 32, marginBottom: 40 },
          ]}
          onPress={() => animateToStep(STEPS.NOTIFICATIONS)}
        >
          <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
      {tf('continue', 'Continue')}
          </Text>
        </TouchableOpacity>
    </View>
      </View>
    </ScrollView>
  );

  // Auto-detect location and recommend method upon entering the Location step if permission already granted
  useEffect(() => {
    const run = async () => {
      try {
        if (step === STEPS.LOCATION && locationGranted && !didAutoDetect) {
          const pos = await Location.getCurrentPositionAsync({});
          const places = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          const place = places?.[0];
          const iso = (place as any)?.isoCountryCode || place?.country || '';
          const rec = recommendMethodByCountry(iso);
          setSelectedMethod(rec);
          updateSettings('location', 'useGPS', true);
          if (place?.city) updateSettings('location', 'city', place.city);
          if (place?.country) updateSettings('location', 'country', place.country);
          setDidAutoDetect(true);
        }
      } catch (e) {
        console.warn('Auto-detect location failed:', e);
      }
    };
    run();
  }, [step, locationGranted]);

  // Step 4: Notification Preferences
  const renderNotifications = () => (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.stepContent}>
        <View style={styles.content}>
        <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
          {tf('prayerReminders', 'Prayer Reminders')}
        </Text>
        <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 24 }]}>
          {tf('chooseReminderMethod', "Choose how you'd like to be reminded of prayer times")}
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.text.primary, marginBottom: 16 }]}>
          {tf('notificationType', 'Notification Type')}
        </Text>
        
        {[
          { key: 'adhan', label: tf('adhanFullCall', 'Adhan (Full Call to Prayer)'), icon: '🔊' },
          { key: 'short', label: tf('shortReminder', 'Short Reminder'), icon: '🔔' },
          { key: 'silent', label: tf('silentNotification', 'Silent Notification'), icon: '📱' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optionCard,
              { 
                backgroundColor: notificationType === option.key ? theme.primary : theme.surface,
                borderColor: notificationType === option.key ? theme.primary : theme.border 
              }
            ]}
            onPress={() => setNotificationType(option.key as any)}
          >
            <View style={styles.optionContent}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>{option.icon}</Text>
              <Text style={[
                styles.optionTitle,
                { color: notificationType === option.key ? theme.text.inverse : theme.text.primary }
              ]}>
                {option.label}
              </Text>
            </View>
            {notificationType === option.key && (
              <Text style={[styles.checkmark, { color: theme.text.inverse }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.text.primary, marginTop: 24, marginBottom: 16 }]}>
          {tf('whichPrayers', 'Which prayers?')}
        </Text>
        
        <View style={styles.prayerGrid}>
          {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(prayer => (
            <TouchableOpacity
              key={prayer}
              style={[
                styles.prayerOption,
                { 
                  backgroundColor: selectedPrayers.includes(prayer) ? theme.primary : theme.surface,
                  borderColor: selectedPrayers.includes(prayer) ? theme.primary : theme.border 
                }
              ]}
              onPress={() => {
                if (selectedPrayers.includes(prayer)) {
                  setSelectedPrayers(selectedPrayers.filter(p => p !== prayer));
                } else {
                  setSelectedPrayers([...selectedPrayers, prayer]);
                }
              }}
            >
              <Text style={[
                styles.prayerText,
                { color: selectedPrayers.includes(prayer) ? theme.text.inverse : theme.text.primary }
              ]}>
                {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
              </Text>
              {selectedPrayers.includes(prayer) && (
                <Text style={[styles.checkmark, { color: theme.text.inverse, fontSize: 12 }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 32, marginBottom: 40 }]} 
          onPress={() => animateToStep(STEPS.APPEARANCE)}
        >
          <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
      {tf('continue', 'Continue')}
          </Text>
        </TouchableOpacity>
    </View>
      </View>
    </ScrollView>
  );

  // Step 5: Appearance & Personalization
  const renderAppearance = () => (
    <View style={styles.stepContent}>
      <View style={styles.content}>
      <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
    {tf('appearancePersonalization', 'Appearance & Personalization')}
      </Text>
      <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 24 }]}>
    {tf('choosePreferredTheme', 'Choose your preferred theme')}
      </Text>
      
      {[
    { key: 'light', label: tf('lightMode', 'Light Mode'), icon: '☀️', desc: tf('cleanBrightInterface', 'Clean and bright interface') },
    { key: 'dark', label: tf('darkMode', 'Dark Mode'), icon: '🌙', desc: tf('easyOnEyes', 'Easy on the eyes') },
    { key: 'system', label: tf('matchSystem', 'Match System'), icon: '📱', desc: tf('followDeviceSetting', 'Follow device setting') }
      ].map(option => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.optionCard,
            { 
              backgroundColor: selectedTheme === option.key ? theme.primary : theme.surface,
              borderColor: selectedTheme === option.key ? theme.primary : theme.border 
            }
          ]}
          onPress={() => {
            setSelectedTheme(option.key as any);
            updateSettings('appearance', 'theme', option.key);
      // Force immediate re-render to apply theme changes instantly
      setForceUpdate(prev => prev + 1);
          }}
        >
          <View style={styles.optionContent}>
            <Text style={{ fontSize: 20, marginRight: 12 }}>{option.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[
                styles.optionTitle,
                { color: selectedTheme === option.key ? theme.text.inverse : theme.text.primary }
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.optionSubtitle,
                { color: selectedTheme === option.key ? theme.text.inverse : theme.text.secondary }
              ]}>
                {option.desc}
              </Text>
            </View>
          </View>
          {selectedTheme === option.key && (
            <Text style={[styles.checkmark, { color: theme.text.inverse }]}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 32 }]} 
        onPress={() => animateToStep(STEPS.TOUR)}
      >
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
      {tf('continue', 'Continue')}
        </Text>
      </TouchableOpacity>
    </View>
    </View>
  );

  // Step 6: Quick Tour
  const renderTour = () => {
    const tourCards = [
      { key: 'prayerTimes', icon: '⏰',
        fallbackTitle: 'Prayer Times',
        fallbackDesc: 'Accurate prayer times based on your location and chosen calculation method' },
      { key: 'qiblaCompass', icon: '🧭',
        fallbackTitle: 'Qibla Compass',
        fallbackDesc: 'Find the direction to Mecca from anywhere in the world' },
      { key: 'dailyContent', icon: '📖',
        fallbackTitle: 'Daily Quran & Hadith',
        fallbackDesc: 'Daily verses and sayings to strengthen your faith' },
    ];

    return (
      <View style={styles.stepContent}>
        <View style={[styles.content, styles.tourLayout]}>
          <View>
            <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
              {tf('appTour', 'App Tour')}
            </Text>
            <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 16 }]}>
              {tf('discoverFeatures', 'Discover what Islamic Pro can do for you')}
            </Text>
            <Text style={[styles.stepIndicator, { color: theme.text.secondary, marginBottom: 24 }]}>
              {tourStep + 1} {tf('of', 'of')} {tourCards.length}
            </Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <View style={[styles.tourCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.tourIcon}>{tourCards[tourStep].icon}</Text>
              <Text style={[styles.tourTitle, { color: theme.primary }]}>
                {tf(`tour.${tourCards[tourStep].key}.title`, tourCards[tourStep].fallbackTitle)}
              </Text>
              <Text style={[styles.tourDescription, { color: theme.text.secondary }]}>
                {tf(`tour.${tourCards[tourStep].key}.desc`, tourCards[tourStep].fallbackDesc)}
              </Text>
            </View>
          </View>

          <View style={[styles.tourNavigation, { marginTop: 16 }]}>
            <TouchableOpacity onPress={() => animateToStep(STEPS.FINISH)}>
              <Text style={[styles.skipText, { color: theme.text.secondary }]}>
                {tf('skipTour', 'Skip Tour')}
              </Text>
            </TouchableOpacity>

            <View style={styles.tourDots}>
              {tourCards.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index === tourStep ? theme.primary : theme.border,
                      width: index === tourStep ? 20 : 8,
                    },
                  ]}
                />
              ))}
            </View>

            {tourStep < tourCards.length - 1 ? (
              <TouchableOpacity onPress={() => setTourStep(tourStep + 1)}>
                <Text style={[styles.nextText, { color: theme.primary }]}>
                  {tf('next', 'Next')}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => animateToStep(STEPS.FINISH)}>
                <Text style={[styles.nextText, { color: theme.primary }]}>
                  {tf('finish', 'Finish')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Step 7: Finish
  const renderFinish = () => (
    <View style={styles.stepContent}>
      <View style={styles.content}>
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
          {tf('allSet', "You're all set!")}
        </Text>
        <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 32 }]}>
          {tf('nextPrayerAt', 'Your next prayer is Maghrib at 7:15 PM')}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: theme.primary }]} 
        onPress={handleFinish}
      >
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
          {tf('goToHome', 'Go to Home')}
        </Text>
      </TouchableOpacity>
      </View>
    </View>
  );

  const handleFinish = async () => {
    // Save all settings
  updateSettings('appearance', 'language', selectedLang);
  updateSettings('prayer', 'calculationMethod', selectedMethod);
    updateSettings('prayer', 'madhab', selectedMadhhab);
    updateSettings('notifications', 'enabled', notificationType !== 'silent');
    updateSettings('notifications', 'adhan', notificationType === 'adhan');
  updateSettings('notifications', 'type', notificationType);
  updateSettings('notifications', 'prayers', selectedPrayers);
    updateSettings('appearance', 'theme', selectedTheme);
    updateSettings('onboarding', 'completed', true);
    
    // Request notification permissions if enabled
    if (notificationType !== 'silent') {
      try {
        await Notifications.requestPermissionsAsync();
      } catch (error) {
        console.warn('Failed to request notification permissions:', error);
      }
    }
    
    // Land them on the Home screen
    try {
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    }
  };

  const screens = [
    renderWelcome(),
    renderLanguage(),
  renderPermissions(),
    renderLocation(),
    renderNotifications(),
    renderAppearance(),
    renderTour(),
    renderFinish(),
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        key={forceUpdate}
        style={{
          flexDirection: 'row',
          width: SCREEN_WIDTH * screens.length,
          flex: 1,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {screens.map((screen, index) => (
          <View key={index} style={{ width: SCREEN_WIDTH, flex: 1 }}>
            {screen}
          </View>
        ))}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  topAlignedStep: {
    justifyContent: 'flex-start',
    paddingTop: 32,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  tourLayout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  stepContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 20, 
    fontWeight: '600',
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20
  },
  stepIndicator: {
    fontSize: 14,
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center'
  },
  optionsList: {
    width: '100%',
    maxHeight: 300
  },
  optionCard: { 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    width: '100%', 
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  permissionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    width: '100%',
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  cardActionCol: {
    marginLeft: 12,
  },
  actionButtonSm: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  optionSubtitle: {
    fontSize: 14,
    marginTop: 2
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  primaryButton: {
    marginTop: 16, 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 12, 
    alignItems: 'center',
    minWidth: 200
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  locationButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16
  },
  methodCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  methodDescription: {
    fontSize: 14
  },
  madhhabContainer: {
    flexDirection: 'row',
    gap: 12
  },
  madhhabOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  madhhabText: {
    fontSize: 16,
    fontWeight: '600'
  },
  prayerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center'
  },
  prayerOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4
  },
  prayerText: {
    fontSize: 14,
    fontWeight: '600'
  },
  tourCard: {
  padding: 28,
  borderRadius: 16,
  borderWidth: 1,
  alignItems: 'center',
  maxWidth: 360,
  width: '100%',
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
  },
  tourIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  tourTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center'
  },
  tourDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22
  },
  tourNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  width: '100%',
  maxWidth: 420,
  },
  tourDots: {
    flexDirection: 'row',
    gap: 8
  },
  dot: {
    height: 8,
    borderRadius: 4
  },
  skipText: {
    fontSize: 16
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600'
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16
  }
});
