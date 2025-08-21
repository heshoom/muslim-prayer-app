import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '../../src/components/layout/HapticTab';
import { MosqueIcon } from '../../src/components/shared/MosqueIcon';
import { ClockIcon } from '../../src/components/shared/ClockIcon';
import { SettingsIcon } from '../../src/components/shared/SettingsIcon';
import TabBarBackground from '../../src/components/shared/TabBarBackground';
import AnimatedTabBar from '../../src/components/shared/AnimatedTabBar';
import { darkTheme, lightTheme } from '../../src/constants/theme';
import { useSettings } from '../../src/contexts/SettingsContext';
import { useTranslation } from '../../src/i18n';

export default function TabLayout() {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          display: 'none', // Hide the default tab bar since we're using a custom one
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <MosqueIcon size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayer-times"
        options={{
          title: t('prayerTimes'),
          tabBarIcon: ({ color }) => <ClockIcon size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color }) => <SettingsIcon size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
