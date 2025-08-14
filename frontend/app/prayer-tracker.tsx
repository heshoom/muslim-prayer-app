import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/src/components/shared/ThemedText';
import { ThemedView } from '@/src/components/shared/ThemedView';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';

type PrayerStatus = 'pending' | 'completed' | 'missed';

type PrayerTracking = {
  [key: string]: { // date in YYYY-MM-DD format
    fajr: PrayerStatus;
    dhuhr: PrayerStatus;
    asr: PrayerStatus;
    maghrib: PrayerStatus;
    isha: PrayerStatus;
  };
};

const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const prayerIcons = {
  fajr: 'sun',
  dhuhr: 'sun',
  asr: 'sun',
  maghrib: 'moon',
  isha: 'moon'
};

export default function PrayerTrackerScreen() {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();
  
  const [tracking, setTracking] = useState<PrayerTracking>({});
  const selectedDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadPrayerTracking();
  }, []);

  const loadPrayerTracking = async () => {
    try {
      const stored = await AsyncStorage.getItem('prayerTracking');
      if (stored) {
        setTracking(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading prayer tracking:', error);
    }
  };

  const savePrayerTracking = async (newTracking: PrayerTracking) => {
    try {
      await AsyncStorage.setItem('prayerTracking', JSON.stringify(newTracking));
      setTracking(newTracking);
    } catch (error) {
      console.error('Error saving prayer tracking:', error);
    }
  };

  const updatePrayerStatus = (prayer: string, status: PrayerStatus) => {
    const newTracking = { ...tracking };
    if (!newTracking[selectedDate]) {
      newTracking[selectedDate] = {
        fajr: 'pending',
        dhuhr: 'pending',
        asr: 'pending',
        maghrib: 'pending',
        isha: 'pending'
      };
    }
    newTracking[selectedDate][prayer as keyof typeof newTracking[string]] = status;
    savePrayerTracking(newTracking);
  };

  const getPrayerStatus = (prayer: string): PrayerStatus => {
    return tracking[selectedDate]?.[prayer as keyof typeof tracking[string]] || 'pending';
  };

  const getStatusColor = (status: PrayerStatus) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'missed': return '#F44336';
      default: return theme.text.secondary;
    }
  };

  const getStatusIcon = (status: PrayerStatus) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'missed': return 'times-circle';
      default: return 'circle';
    }
  };

  const handlePrayerPress = (prayer: string) => {
    const currentStatus = getPrayerStatus(prayer);
    const nextStatus: PrayerStatus = 
      currentStatus === 'pending' ? 'completed' :
      currentStatus === 'completed' ? 'missed' : 'pending';
    
    updatePrayerStatus(prayer, nextStatus);
  };

  const getTodayStats = () => {
    const todayData = tracking[selectedDate];
    if (!todayData) return { completed: 0, total: 5 };
    
    const completed = Object.values(todayData).filter(status => status === 'completed').length;
    return { completed, total: 5 };
  };

  const stats = getTodayStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ThemedView style={[styles.header, { backgroundColor: theme.surface }]}>
        <ThemedText style={[styles.title, { color: theme.primary }]}>
          {t('prayerTracker') || 'Prayer Tracker'}
        </ThemedText>
        <ThemedText style={[styles.date, { color: theme.text.secondary }]}>
          {new Date(selectedDate).toLocaleDateString()}
        </ThemedText>
        <View style={[styles.statsContainer, { backgroundColor: theme.primary }]}>
          <ThemedText style={[styles.statsText, { color: 'white' }]}>
            {stats.completed}/{stats.total} Completed
          </ThemedText>
        </View>
      </ThemedView>

      <View style={styles.prayersContainer}>
        {prayerNames.map((prayer) => {
          const status = getPrayerStatus(prayer);
          const statusColor = getStatusColor(status);
          
          return (
            <TouchableOpacity
              key={prayer}
              style={[styles.prayerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => handlePrayerPress(prayer)}
            >
              <View style={styles.prayerInfo}>
                <FontAwesome5 
                  name={prayerIcons[prayer]} 
                  size={24} 
                  color={theme.primary} 
                  style={styles.prayerIcon}
                />
                <ThemedText style={[styles.prayerName, { color: theme.text.primary }]}>
                  {t(prayer) || prayer.charAt(0).toUpperCase() + prayer.slice(1)}
                </ThemedText>
              </View>
              <FontAwesome5 
                name={getStatusIcon(status)} 
                size={24} 
                color={statusColor}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <ThemedView style={[styles.instructionsContainer, { backgroundColor: theme.surface }]}>
        <ThemedText style={[styles.instructionsTitle, { color: theme.text.primary }]}>
          How to use:
        </ThemedText>
        <ThemedText style={[styles.instructionsText, { color: theme.text.secondary }]}>
          • Tap once to mark as completed ✓
        </ThemedText>
        <ThemedText style={[styles.instructionsText, { color: theme.text.secondary }]}>
          • Tap twice to mark as missed ✗
        </ThemedText>
        <ThemedText style={[styles.instructionsText, { color: theme.text.secondary }]}>
          • Tap third time to reset ○
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    marginBottom: 12,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  prayersContainer: {
    flex: 1,
  },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    marginRight: 12,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  instructionsContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    marginBottom: 4,
  },
});
