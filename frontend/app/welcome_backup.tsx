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
  Alert
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
  LOCATION: 2,
  PRAYER_SETTINGS: 3,
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
  { code: 'ms', label: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia' },
];

const CALCULATION_METHODS = [
  { key: 'ISNA', label: 'ISNA (Islamic Society of North America)' },
  { key: 'MWL', label: 'Muslim World League' },
  { key: 'Egyptian', label: 'Egyptian General Authority' },
  { key: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
];

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { settings, updateSettings, isDarkMode } = useSettings();
  
  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // State
  const [step, setStep] = useState<number>(STEPS.WELCOME);
  const [selectedLang, setSelectedLang] = useState<string>(
    settings?.appearance?.language || 'en'
  );
  const [locationGranted, setLocationGranted] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('ISNA');
  const [selectedMadhhab, setSelectedMadhhab] = useState<'shafi' | 'hanafi'>('shafi');
  const [notificationType, setNotificationType] = useState<'adhan' | 'short' | 'silent'>('adhan');
  const [selectedPrayers, setSelectedPrayers] = useState<string[]>(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(
    settings?.appearance?.theme || 'system'
  );
  const [tourStep, setTourStep] = useState<number>(0);
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  
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
    // Auto-select device language on mount
    // For now using English as default, can be enhanced later with proper localization
    const deviceLang = 'en';
    const supportedLang = COMMON_LANGUAGES.find(lang => lang.code === deviceLang);
    if (supportedLang && selectedLang !== supportedLang.code) {
      setSelectedLang(supportedLang.code);
    }
  }, []);

  // Step 1: Welcome Screen
  const renderWelcome = () => (
    <View style={styles.stepContent}>
      <View style={styles.hero}>
        <Text style={[styles.title, { color: theme.primary }]}>
          {t('assalamuAlaikum') || 'Assalamu Alaikum'} 👋
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary, marginTop: 8 }]}>
          {t('welcomeToIslamicPro') || 'Welcome to Islamic Pro'}
        </Text>
        <Text style={[styles.description, { color: theme.text.secondary, marginTop: 16 }]}>
          {t('comprehensiveIslamicCompanion') || 'Your comprehensive Islamic companion for prayer times, Qibla direction, and daily spiritual guidance.'}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: theme.primary }]} 
        onPress={() => animateToStep(STEPS.LANGUAGE)}
      >
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
          {t('getStarted') || 'Get Started'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Step 2: Language Selection
  const renderLanguage = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
        {t('choosePreferredLanguage') || 'Choose your preferred language'}
      </Text>
      <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 24 }]}>
        {t('autoDetectedLanguage') || "We've auto-detected your device language"}
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
              // Force immediate re-render to apply language changes
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
        onPress={() => animateToStep(STEPS.LOCATION)}
      >
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
          {t('continue') || 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Step 3: Location & Prayer Settings
  const renderLocation = () => (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.stepContent}>
        <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
          {t('locationAndPrayerCalculation') || 'Location & Prayer Calculation'}
        </Text>
        <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 24 }]}>
          {t('needLocationForPrayerTimes') || 'We need your location for accurate prayer times and Qibla direction'}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.locationButton, 
            { 
              backgroundColor: locationGranted ? theme.success : theme.primary,
              borderColor: locationGranted ? theme.success : theme.primary 
            }
          ]}
          onPress={async () => {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              setLocationGranted(status === 'granted');
            } catch (error) {
              Alert.alert(t('error') || 'Error', t('unableToAccessLocation') || 'Unable to access location');
            }
          }}
        >
          <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
            {locationGranted ? `✓ ${t('locationAccessGranted') || 'Location Access Granted'}` : t('enableLocationAccess') || 'Enable Location Access'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text.primary, marginTop: 32, marginBottom: 16 }]}>
          {t('prayerCalculationMethod') || 'Prayer Calculation Method'}
        </Text>
        
        {CALCULATION_METHODS.map(method => (
          <TouchableOpacity
            key={method.key}
            style={[
              styles.methodCard,
              { 
                backgroundColor: selectedMethod === method.key ? theme.primary : theme.surface,
                borderColor: selectedMethod === method.key ? theme.primary : theme.border 
              }
            ]}
            onPress={() => setSelectedMethod(method.key)}
          >
            <Text style={[
              styles.methodTitle,
              { color: selectedMethod === method.key ? theme.text.inverse : theme.text.primary }
            ]}>
              {method.key}
            </Text>
            <Text style={[
              styles.methodDescription,
              { color: selectedMethod === method.key ? theme.text.inverse : theme.text.secondary }
            ]}>
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.text.primary, marginTop: 24, marginBottom: 16 }]}>
          {t('madhhabAsrCalculation') || 'Madhhab (Asr Calculation)'}
        </Text>
        
        <View style={styles.madhhabContainer}>
          {['shafi', 'hanafi'].map(madhhab => (
            <TouchableOpacity
              key={madhhab}
              style={[
                styles.madhhabOption,
                { 
                  backgroundColor: selectedMadhhab === madhhab ? theme.primary : theme.surface,
                  borderColor: selectedMadhhab === madhhab ? theme.primary : theme.border 
                }
              ]}
              onPress={() => setSelectedMadhhab(madhhab as 'shafi' | 'hanafi')}
            >
              <Text style={[
                styles.madhhabText,
                { color: selectedMadhhab === madhhab ? theme.text.inverse : theme.text.primary }
              ]}>
                {madhhab.charAt(0).toUpperCase() + madhhab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 32, marginBottom: 40 }]} 
          onPress={() => animateToStep(STEPS.NOTIFICATIONS)}
        >
          <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
            {t('continue') || 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Step 4: Notification Preferences
  const renderNotifications = () => (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.stepContent}>
        <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
          {t('prayerReminders') || 'Prayer Reminders'}
        </Text>
        <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 24 }]}>
          {t('chooseReminderMethod') || 'Choose how you\'d like to be reminded of prayer times'}
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.text.primary, marginBottom: 16 }]}>
          {t('notificationType') || 'Notification Type'}
        </Text>
        
        {[
          { key: 'adhan', label: t('adhanFullCall') || 'Adhan (Full Call to Prayer)', icon: '🔊' },
          { key: 'short', label: t('shortReminder') || 'Short Reminder', icon: '🔔' },
          { key: 'silent', label: t('silentNotification') || 'Silent Notification', icon: '📱' }
        ].map(option => (
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
          {t('whichPrayers') || 'Which prayers?'}
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
            {t('continue') || 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Step 5: Appearance & Personalization
  const renderAppearance = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
        {t('appearancePersonalization') || 'Appearance & Personalization'}
      </Text>
      <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 24 }]}>
        {t('choosePreferredTheme') || 'Choose your preferred theme'}
      </Text>
      
      {[
        { key: 'light', label: t('lightMode') || 'Light Mode', icon: '☀️', desc: t('cleanBrightInterface') || 'Clean and bright interface' },
        { key: 'dark', label: t('darkMode') || 'Dark Mode', icon: '🌙', desc: t('easyOnEyes') || 'Easy on the eyes' },
        { key: 'system', label: t('matchSystem') || 'Match System', icon: '📱', desc: t('followDeviceSetting') || 'Follow device setting' }
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
            // Force immediate re-render to apply theme changes
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
          {t('continue') || 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Step 6: Quick Tour
  const renderTour = () => {
    const tourCards = [
      { 
        title: t('prayerTimes') || 'Prayer Times', 
        desc: t('accuratePrayerTimes') || 'Accurate prayer times based on your location and chosen calculation method', 
        icon: '⏰' 
      },
      { 
        title: t('qiblaCompass') || 'Qibla Compass', 
        desc: t('findDirection') || 'Find the direction to Mecca from anywhere in the world', 
        icon: '🧭' 
      },
      { 
        title: t('dailyQuranHadith') || 'Daily Quran & Hadith', 
        desc: t('dailyVersesAndSayings') || 'Daily verses and sayings to strengthen your faith', 
        icon: '📖' 
      },
    ];

    return (
      <View style={styles.stepContent}>
        <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
          {t('appTour') || 'App Tour'}
        </Text>
        <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 16 }]}>
          {t('discoverFeatures') || 'Discover what Islamic Pro can do for you'}
        </Text>
        <Text style={[styles.stepIndicator, { color: theme.text.secondary, marginBottom: 24 }]}>
          {tourStep + 1} {t('of') || 'of'} {tourCards.length}
        </Text>
        
        <View style={[styles.tourCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={styles.tourIcon}>{tourCards[tourStep].icon}</Text>
          <Text style={[styles.tourTitle, { color: theme.primary }]}>
            {tourCards[tourStep].title}
          </Text>
          <Text style={[styles.tourDescription, { color: theme.text.secondary }]}>
            {tourCards[tourStep].desc}
          </Text>
        </View>
        
        <View style={styles.tourNavigation}>
          <TouchableOpacity onPress={() => animateToStep(STEPS.FINISH)}>
            <Text style={[styles.skipText, { color: theme.text.secondary }]}>
              {t('skipTour') || 'Skip Tour'}
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
                    width: index === tourStep ? 20 : 8 
                  }
                ]}
              />
            ))}
          </View>
          
          {tourStep < tourCards.length - 1 ? (
            <TouchableOpacity onPress={() => setTourStep(tourStep + 1)}>
              <Text style={[styles.nextText, { color: theme.primary }]}>
                {t('next') || 'Next'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => animateToStep(STEPS.FINISH)}>
              <Text style={[styles.nextText, { color: theme.primary }]}>
                {t('finish') || 'Finish'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Step 7: Finish
  const renderFinish = () => (
    <View style={styles.stepContent}>
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={[styles.title, { color: theme.primary, marginBottom: 8 }]}>
          {t('allSet') || 'You\'re all set!'}
        </Text>
        <Text style={[styles.description, { color: theme.text.secondary, marginBottom: 32 }]}>
          {t('nextPrayerAt') || 'Your next prayer is Maghrib at 7:15 PM'}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: theme.primary }]} 
        onPress={handleFinish}
      >
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
          {t('goToHome') || 'Go to Home'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleFinish = async () => {
    // Save all settings
    updateSettings('appearance', 'language', selectedLang);
    updateSettings('prayer', 'calculationMethod', selectedMethod);
    updateSettings('prayer', 'madhab', selectedMadhhab);
    updateSettings('notifications', 'enabled', notificationType !== 'silent');
    updateSettings('notifications', 'adhan', notificationType === 'adhan');
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
    
    router.replace('/(tabs)');
  };

  const screens = [
    renderWelcome(),
    renderLanguage(),
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
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 300,
    marginBottom: 32
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
    maxWidth: 300
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
