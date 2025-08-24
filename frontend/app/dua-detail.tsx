import React from 'react';
import { View, StyleSheet, ScrollView, Share, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/src/components/shared/ThemedText';
import { ClipboardTextButton } from '@/src/components/shared/ClipboardTextButton';
import { ThemedView } from '@/src/components/shared/ThemedView';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '../src/constants/theme';
import { DUA_SECTIONS, DuaItem } from '../src/data/dua';
import { useTranslation } from '@/src/i18n';

export default function DuaDetailScreen() {
  const params = useLocalSearchParams();
  const duaId = params.id as string;
  const { settings } = useSettings();
  const { t } = useTranslation();
  const isDarkMode = settings?.appearance?.theme === 'dark' || false;
  const theme = isDarkMode ? darkTheme : lightTheme;
  const language = settings?.appearance?.language || 'en';

  // Find the dua by id
  let dua = null;
  for (const section of DUA_SECTIONS) {
    for (const cat of section.categories) {
      dua = cat.items.find((item: DuaItem) => item.id === duaId) || dua;
    }
  }
  if (!dua) {
    return <ThemedView><ThemedText>{t('duaNotFound')}</ThemedText></ThemedView>;
  }

  // Get localized transliteration and translation based on user's language
  const transliteration = dua.transliteration?.[language as keyof typeof dua.transliteration] || dua.transliteration?.en || '';
  const translation = dua.translation?.[language as keyof typeof dua.translation] || dua.translation?.en || '';

  const fullText = [dua.arabic, transliteration, translation].filter(Boolean).join('\n\n');

  const onShare = async () => {
    try {
      await Share.share({
        message: `${t(dua.titleKey)}\n\n${fullText}`,
      });
    } catch {}
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.title}>{t(dua.titleKey)}</ThemedText>
        <View style={styles.actions}>
          <ClipboardTextButton text={fullText} />
          <TouchableOpacity
            style={[
              styles.shareButton,
              {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
            onPress={onShare}
          >
            <ThemedText style={[styles.shareText, { color: theme.text.inverse }]}>{t('share')}</ThemedText>
          </TouchableOpacity>
        </View>
        {dua.arabic && (
          <ThemedText style={styles.arabic} numberOfLines={0} adjustsFontSizeToFit minimumFontScale={0.5}>
            {dua.arabic}
          </ThemedText>
        )}
        {transliteration && <ThemedText style={styles.transliteration}>{transliteration}</ThemedText>}
        {translation && <ThemedText style={styles.translation}>{translation}</ThemedText>}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  content: { paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  arabic: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    lineHeight: 40,
    flexWrap: 'wrap',
    alignSelf: 'center',
    width: '100%',
  },
  transliteration: { fontSize: 16, fontStyle: 'italic', marginBottom: 12, color: '#666' },
  translation: { fontSize: 16, color: '#333' },
  actions: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  shareButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  shareText: { fontSize: 14, fontWeight: '600' },
});
