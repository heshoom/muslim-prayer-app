import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useColorScheme } from 'react-native';

export type SettingsType = {
  onboarding?: {
    completed: boolean;
  };
  notifications: {
    enabled: boolean;
    adhan: boolean;
    athanSound: string;
    vibrate: boolean;
    prePrayer: boolean;
    prePrayerTime: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timeFormat: '12h' | '24h';
    showHijriDates: boolean;
  };
  prayer: {
    calculationMethod: string;
    madhab: 'shafi' | 'hanafi';
    adjustments: {
      fajr: number;
      dhuhr: number;
      asr: number;
      maghrib: number;
      isha: number;
    };
  };
  location: {
    useGPS: boolean;
    city: string;
    country: string;
  };
};

const defaultSettings: SettingsType = {
  onboarding: {
    completed: false,
  },
  notifications: {
    enabled: true,
    adhan: true,
    athanSound: 'makkah',
    vibrate: true,
    prePrayer: false,
    prePrayerTime: 15,
  },
  appearance: {
    theme: 'system',
    language: 'en',
    timeFormat: '24h',
    showHijriDates: true,
  },
  prayer: {
    calculationMethod: 'auto',
    madhab: 'shafi',
    adjustments: {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    },
  },
  location: {
    useGPS: true,
    city: 'New York',
    country: 'US',
  },
};

type SettingsContextType = {
  settings: SettingsType;
  updateSettings: (category: keyof SettingsType, key: string, value: any) => void;
  isDarkMode: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      let parsed: SettingsType | null = null;
      if (savedSettings) {
        parsed = JSON.parse(savedSettings) as SettingsType;
      }

      // If the build changed since last run, force onboarding to show so users
      // see the welcome flow again (helps catch permissions and first-run flows).
      try {
        const BUILD_KEY = 'app:lastBuildId';
        const currentBuild = String((Constants as any)?.nativeBuildVersion || (Constants as any)?.expoConfig?.version || 'unknown');
        const previousBuild = await AsyncStorage.getItem(BUILD_KEY);
        if (!parsed || (previousBuild && previousBuild !== currentBuild)) {
          // fresh install or build changed -> ensure onboarding not marked complete
          if (!parsed) parsed = { ...defaultSettings };
          parsed.onboarding = { completed: false };
          await AsyncStorage.setItem(BUILD_KEY, currentBuild);
          // persist this sanitized settings object so startup is consistent
          await AsyncStorage.setItem('userSettings', JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn('Error while checking build id for onboarding reset:', e);
      }

      if (parsed) {
        setSettings(parsed);
        console.log('Loaded settings on startup:', parsed);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: SettingsType) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSettings = (category: keyof SettingsType, key: string, value: any) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  const isDarkMode = settings.appearance.theme === 'system' 
    ? systemColorScheme === 'dark'
    : settings.appearance.theme === 'dark';

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isDarkMode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
