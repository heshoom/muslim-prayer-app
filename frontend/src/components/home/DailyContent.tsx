import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import { quranApi } from '../../services/quranApi';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';
import { getHadithOfTheDay } from '@/src/services/hadithService';

export const DailyContent = () => {
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hadith, setHadith] = useState<any>(null);

  const { isDarkMode, settings } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const data = await quranApi.getDailyVerse(settings.appearance.language);
        setVerse(data);
      } catch (error) {
        console.error('Failed to load verse:', error);
        setError('Failed to load verse of the day');
      } finally {
        setLoading(false);
      }
    };

    fetchVerse();
    // load hadith of the day synchronously
    try {
      const h = getHadithOfTheDay(new Date(), settings.appearance.language);
      setHadith(h);
    } catch (e) {
      console.error('Failed to load hadith of the day', e);
    }
  }, [settings.appearance.language]);

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
        <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.verseContainer}>
        <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>{t('verseOfTheDay')}</ThemedText>
        
        {/* Always show the Arabic text */}
        <ThemedText style={[styles.arabicText, { color: theme.text.primary }]}>{verse?.text}</ThemedText>
        
        {/* Only show translation if language is NOT Arabic and translation exists */}
        {settings.appearance.language !== 'ar' && verse?.translation && (
          <ThemedText style={[styles.verseText, { color: theme.text.primary }]}>{verse.translation}</ThemedText>
        )}
        
        <ThemedText style={[styles.verseReference, { color: theme.text.secondary }]}>
          Surah {verse?.surah.englishName} {verse?.surah.number}:{verse?.numberInSurah}
        </ThemedText>
      </View>
      
      <View style={[styles.hadithContainer, { borderTopColor: theme.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>{t('hadithOfTheDay')}</ThemedText>
        {hadith ? (
          <>
            <ThemedText style={[styles.hadithText, { color: theme.text.primary }]}>“{hadith.arabic}”</ThemedText>
            {hadith.localizedText && (
              <ThemedText style={[styles.hadithText, { color: theme.text.primary }]}>{hadith.localizedText}</ThemedText>
            )}
            {hadith.reference && (
              <ThemedText style={[styles.verseReference, { color: theme.text.secondary }]}>{hadith.reference}</ThemedText>
            )}
          </>
        ) : (
          <ThemedText style={[styles.hadithText, { color: theme.text.primary }]}>&ldquo;{t('defaultHadithText')}&rdquo;</ThemedText>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  verseContainer: {
    marginBottom: 20,
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 36,
    marginBottom: 12,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'ArialHebrew' : 'sans-serif',
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  verseReference: {
    fontSize: 14,
  },
  hadithContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
  },
  hadithText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  hadithReference: {
    fontSize: 14,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
  },
});
