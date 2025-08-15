import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type SettingsType = {
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
    calculationMethod: 'mwl',
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
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
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
