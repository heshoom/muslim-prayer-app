import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/src/components/shared/ThemedText';
import { ThemedView } from '@/src/components/shared/ThemedView';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';

type DhikrItem = {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  count: number;
  targetCount: number;
  reward: string;
};

const dailyDhikrList: DhikrItem[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللهِ',
    transliteration: 'Subhan Allah',
    translation: 'Glory be to Allah',
    count: 0,
    targetCount: 33,
    reward: 'Removes sins like leaves from a tree'
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ للهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    count: 0,
    targetCount: 33,
    reward: 'Fills the scales of good deeds'
  },
  {
    id: 'allahuakbar',
    arabic: 'اللهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    count: 0,
    targetCount: 34,
    reward: 'Fills what is between heaven and earth'
  },
  {
    id: 'lailahaillallah',
    arabic: 'لَا إِلٰهَ إِلَّا اللهُ',
    transliteration: 'La ilaha illa Allah',
    translation: 'There is no god but Allah',
    count: 0,
    targetCount: 100,
    reward: 'The best of remembrance'
  },
  {
    id: 'istighfar',
    arabic: 'أَسْتَغْفِرُ اللهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    count: 0,
    targetCount: 100,
    reward: 'Opens doors of mercy and sustenance'
  },
  {
    id: 'salawat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    transliteration: 'Allahumma salli \'ala Muhammad',
    translation: 'O Allah, send blessings upon Muhammad',
    count: 0,
    targetCount: 10,
    reward: 'Allah sends 10 blessings in return'
  }
];

export default function DailyDhikrScreen() {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();
  
  const [dhikrCounts, setDhikrCounts] = useState<{[key: string]: number}>({});
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrItem | null>(null);

  useEffect(() => {
    loadDhikrCounts();
  }, []);

  const loadDhikrCounts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = await AsyncStorage.getItem(`dhikrCounts_${today}`);
      if (stored) {
        setDhikrCounts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading dhikr counts:', error);
    }
  };

  const saveDhikrCounts = async (counts: {[key: string]: number}) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`dhikrCounts_${today}`, JSON.stringify(counts));
      setDhikrCounts(counts);
    } catch (error) {
      console.error('Error saving dhikr counts:', error);
    }
  };

  const incrementCount = (dhikrId: string) => {
    const currentCount = dhikrCounts[dhikrId] || 0;
    const dhikr = dailyDhikrList.find(d => d.id === dhikrId);
    if (dhikr && currentCount < dhikr.targetCount) {
      const newCounts = { ...dhikrCounts, [dhikrId]: currentCount + 1 };
      saveDhikrCounts(newCounts);
    }
  };

  const resetCount = (dhikrId: string) => {
    const newCounts = { ...dhikrCounts, [dhikrId]: 0 };
    saveDhikrCounts(newCounts);
  };

  const getTotalProgress = () => {
    const totalCompleted = dailyDhikrList.reduce((sum, dhikr) => {
      const count = dhikrCounts[dhikr.id] || 0;
      return sum + Math.min(count, dhikr.targetCount);
    }, 0);
    const totalTarget = dailyDhikrList.reduce((sum, dhikr) => sum + dhikr.targetCount, 0);
    return { completed: totalCompleted, total: totalTarget };
  };

  const progress = getTotalProgress();

  if (selectedDhikr) {
    const currentCount = dhikrCounts[selectedDhikr.id] || 0;
    const isCompleted = currentCount >= selectedDhikr.targetCount;
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.dhikrDetailContainer, { backgroundColor: theme.surface }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedDhikr(null)}
          >
            <FontAwesome5 name="arrow-left" size={20} color={theme.primary} />
          </TouchableOpacity>
          
          <View style={styles.dhikrDetailContent}>
            <ThemedText style={[styles.arabicText, { color: theme.text.primary }]}>
              {selectedDhikr.arabic}
            </ThemedText>
            <ThemedText style={[styles.transliterationText, { color: theme.primary }]}>
              {selectedDhikr.transliteration}
            </ThemedText>
            <ThemedText style={[styles.translationText, { color: theme.text.secondary }]}>
              {selectedDhikr.translation}
            </ThemedText>
            
            <View style={[styles.countContainer, { backgroundColor: theme.primary }]}>
              <ThemedText style={[styles.countText, { color: 'white' }]}>
                {currentCount} / {selectedDhikr.targetCount}
              </ThemedText>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: theme.border }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: isCompleted ? '#4CAF50' : theme.primary,
                      width: `${Math.min((currentCount / selectedDhikr.targetCount) * 100, 100)}%`
                    }
                  ]} 
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.tapButton, 
                { 
                  backgroundColor: isCompleted ? '#4CAF50' : theme.primary,
                  opacity: isCompleted ? 0.7 : 1
                }
              ]}
              onPress={() => !isCompleted && incrementCount(selectedDhikr.id)}
              disabled={isCompleted}
            >
              <FontAwesome5 
                name={isCompleted ? "check" : "hand-point-up"} 
                size={24} 
                color="white" 
              />
              <ThemedText style={[styles.tapButtonText, { color: 'white' }]}>
                {isCompleted ? 'Completed!' : 'Tap to Count'}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: theme.error }]}
              onPress={() => resetCount(selectedDhikr.id)}
            >
              <ThemedText style={[styles.resetButtonText, { color: theme.error }]}>
                Reset Counter
              </ThemedText>
            </TouchableOpacity>
            
            <ThemedView style={[styles.rewardContainer, { backgroundColor: theme.background }]}>
              <ThemedText style={[styles.rewardTitle, { color: theme.primary }]}>
                Reward:
              </ThemedText>
              <ThemedText style={[styles.rewardText, { color: theme.text.secondary }]}>
                {selectedDhikr.reward}
              </ThemedText>
            </ThemedView>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ThemedView style={[styles.header, { backgroundColor: theme.surface }]}>
        <ThemedText style={[styles.title, { color: theme.primary }]}>
          {t('dailyDhikr') || 'Daily Dhikr'}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.text.secondary }]}>
          Remembrance of Allah
        </ThemedText>
        <View style={[styles.totalProgressContainer, { backgroundColor: theme.primary }]}>
          <ThemedText style={[styles.totalProgressText, { color: 'white' }]}>
            {progress.completed}/{progress.total} Total
          </ThemedText>
        </View>
      </ThemedView>

      <ScrollView style={styles.dhikrList} showsVerticalScrollIndicator={false}>
        {dailyDhikrList.map((dhikr) => {
          const currentCount = dhikrCounts[dhikr.id] || 0;
          const isCompleted = currentCount >= dhikr.targetCount;
          const progressPercent = (currentCount / dhikr.targetCount) * 100;
          
          return (
            <TouchableOpacity
              key={dhikr.id}
              style={[
                styles.dhikrCard, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: theme.border,
                  borderLeftColor: isCompleted ? '#4CAF50' : theme.primary,
                  borderLeftWidth: 4
                }
              ]}
              onPress={() => setSelectedDhikr(dhikr)}
            >
              <View style={styles.dhikrCardContent}>
                <ThemedText style={[styles.dhikrArabic, { color: theme.text.primary }]}>
                  {dhikr.arabic}
                </ThemedText>
                <ThemedText style={[styles.dhikrTransliteration, { color: theme.primary }]}>
                  {dhikr.transliteration}
                </ThemedText>
                <ThemedText style={[styles.dhikrTranslation, { color: theme.text.secondary }]}>
                  {dhikr.translation}
                </ThemedText>
                
                <View style={styles.dhikrProgress}>
                  <View style={styles.dhikrProgressInfo}>
                    <ThemedText style={[styles.dhikrCount, { color: theme.text.primary }]}>
                      {currentCount}/{dhikr.targetCount}
                    </ThemedText>
                    {isCompleted && (
                      <FontAwesome5 name="check-circle" size={20} color="#4CAF50" />
                    )}
                  </View>
                  <View style={[styles.dhikrProgressBar, { backgroundColor: theme.border }]}>
                    <View 
                      style={[
                        styles.dhikrProgressFill, 
                        { 
                          backgroundColor: isCompleted ? '#4CAF50' : theme.primary,
                          width: `${Math.min(progressPercent, 100)}%`
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  totalProgressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  totalProgressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dhikrList: {
    flex: 1,
  },
  dhikrCard: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dhikrCardContent: {
    padding: 16,
  },
  dhikrArabic: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
  },
  dhikrTransliteration: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dhikrTranslation: {
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  dhikrProgress: {
    marginTop: 8,
  },
  dhikrProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dhikrCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  dhikrProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  dhikrProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Detail view styles
  dhikrDetailContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  dhikrDetailContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicText: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  transliterationText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  translationText: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  countContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  countText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
  },
  tapButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rewardContainer: {
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
