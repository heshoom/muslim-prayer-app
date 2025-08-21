import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';

type QuickAction = {
  title: string;
  icon: string;
  onPress: () => void;
};

export const QuickActions = () => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();

  const actions: QuickAction[] = [
    { 
      title: t('qiblaDirection'), 
      icon: 'compass', 
      onPress: () => router.push('/qibla')
    },
    { 
      title: t('prayerTracker'), 
      icon: 'tasks', 
      onPress: () => router.push('/prayer-tracker')
    },
    // { 
    //   title: t('nearbyMosques'), 
    //   icon: 'mosque', 
    //   onPress: () => router.push('/mosques')
    // },
    { 
      title: t('dailyDhikr'), 
      icon: 'pray', 
      onPress: () => router.push('/daily-dhikr')
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
      <ThemedText style={[styles.title, { color: theme.primary }]}>{t('quickActions')}</ThemedText>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionItem}
            onPress={action.onPress}
          >
            <FontAwesome5 name={action.icon} size={24} color={theme.primary} style={styles.actionIcon} />
            <ThemedText style={[styles.actionTitle, { color: theme.text.primary }]}>{action.title}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionItem: {
    width: '50%',
    padding: 8,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  actionTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
