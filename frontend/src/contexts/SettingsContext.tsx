import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useColorScheme } from "react-native";

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
    theme: "light" | "dark" | "system";
    language: string;
    timeFormat: "12h" | "24h";
    showHijriDates: boolean;
  };
  prayer: {
    calculationMethod: string;
    madhab: "shafi" | "hanafi";
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
  athanSound: "madinah",
    vibrate: true,
    prePrayer: false,
    prePrayerTime: 15,
  },
  appearance: {
    theme: "system",
    language: "en",
    timeFormat: "12h",
    showHijriDates: true,
  },
  prayer: {
    calculationMethod: "auto",
    madhab: "shafi",
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
    city: "New York",
    country: "US",
  },
};

type SettingsContextType = {
  settings: SettingsType;
  updateSettings: (
    category: keyof SettingsType,
    key: string,
    value: any
  ) => void;
  isDarkMode: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("userSettings");
      let parsed: SettingsType | null = null;

      if (savedSettings) {
        try {
          parsed = JSON.parse(savedSettings) as SettingsType;
        } catch (parseError) {
          console.warn(
            "Error parsing saved settings, using defaults:",
            parseError
          );
          parsed = null;
        }
      }

      // If this is a fresh install (no saved settings), ensure onboarding is set to false
      if (!parsed) {
        parsed = { ...defaultSettings };
        parsed.onboarding = { completed: false };
        console.log("Fresh install detected, setting onboarding to incomplete");
      } else {
        // For existing installations, ensure onboarding exists in the settings
        if (!parsed.onboarding) {
          parsed.onboarding = { completed: false };
          console.log("Missing onboarding setting, setting to incomplete");
        }
      }

      // Build change detection - only reset onboarding if it was previously completed
      // This prevents interference with fresh installs
      try {
        const BUILD_KEY = "app:lastBuildId";
        const currentBuild = String(
          Constants?.expoConfig?.version ||
            (Constants as any)?.nativeBuildVersion ||
            "1.0.0"
        );
        const previousBuild = await AsyncStorage.getItem(BUILD_KEY);

        // Only reset onboarding if:
        // 1. We have a previous build recorded (not a fresh install)
        // 2. The build version actually changed
        // 3. Onboarding was previously completed
        if (
          previousBuild &&
          previousBuild !== currentBuild &&
          parsed.onboarding?.completed
        ) {
          console.log(
            `Build changed from ${previousBuild} to ${currentBuild}, resetting onboarding`
          );
          parsed.onboarding = { completed: false };
        }

        await AsyncStorage.setItem(BUILD_KEY, currentBuild);
      } catch (e) {
        console.warn("Error while checking build id for onboarding reset:", e);
      }

      // Always persist the settings to ensure consistency
      await AsyncStorage.setItem("userSettings", JSON.stringify(parsed));
      setSettings(parsed);
      console.log("Loaded settings on startup:", {
        onboarding: parsed.onboarding,
        hasLocation: !!parsed.location,
        hasNotifications: !!parsed.notifications,
      });
    } catch (error) {
      console.error("Error loading settings:", error);
      // Fallback to default settings if everything fails
      const fallbackSettings = { ...defaultSettings };
      fallbackSettings.onboarding = { completed: false };
      setSettings(fallbackSettings);
    }
  };

  const saveSettings = async (newSettings: SettingsType) => {
    try {
      await AsyncStorage.setItem("userSettings", JSON.stringify(newSettings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const updateSettings = (
    category: keyof SettingsType,
    key: string,
    value: any
  ) => {
    setSettings((prev) => {
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

  const isDarkMode =
    settings.appearance.theme === "system"
      ? systemColorScheme === "dark"
      : settings.appearance.theme === "dark";

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isDarkMode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
