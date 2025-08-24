import React, { useState } from 'react';
import FacebookStyleTransition from '@/src/components/shared/FacebookStyleTransition';
import { StyleSheet, View, FlatList, Share, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/src/components/shared/ThemedText';
import { ThemedView } from '@/src/components/shared/ThemedView';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardTextButton } from '@/src/components/shared/ClipboardTextButton';
import { router, useLocalSearchParams } from 'expo-router';
import { DUA_SECTIONS, DuaSection, DuaCategory, DuaItem } from '@/src/data/dua';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

export default function DuaScreen() {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // Track expanded categories by key
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const onShare = async (item: { title: string; text: string }) => {
    try {
      await Share.share({
        message: `${item.title}\n\n${item.text}`,
      });
    } catch {}
  };

  // Helper to render icon (replace with your icon component as needed)
  const renderIcon = (icon: string) => {
    // You can use a library like react-native-vector-icons or your own SVGs
    // For now, just render emoji as a placeholder
    const iconMap: Record<string, string> = {
      bed: '🛏️',
      toilet: '🚽',
      water: '💧',
      mosque: '🕌',
      pray: '🧎',
      home: '🏠',
      tshirt: '👕',
      airplane: '✈️',
      utensils: '🍽️',
      beads: '🟣',
    };
    return <ThemedText style={styles.icon}>{iconMap[icon] || '❓'}</ThemedText>;
  };

  return (
    <FacebookStyleTransition direction="right">
      <ThemedView style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top + 10 }]}> 
        <FlatList
          data={DUA_SECTIONS}
          keyExtractor={(section) => section.key}
          contentContainerStyle={{ padding: 8, paddingBottom: insets.bottom + 80 }}
          renderItem={({ item: section }) => (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionHeader, { color: theme.primary }]}>{section.label}</ThemedText>
              {section.categories.map((cat) => {
                const isExpanded = expanded[cat.key];
                return (
                  <View key={cat.key}>
                    <TouchableOpacity
                      style={styles.categoryRow}
                      onPress={() => setExpanded((prev) => ({ ...prev, [cat.key]: !isExpanded }))}
                    >
                      <View style={styles.categoryIconLabel}>
                        {renderIcon(cat.icon)}
                        <ThemedText style={styles.categoryLabel}>{cat.label}</ThemedText>
                      </View>
                      <ThemedText style={styles.chevron}>{isExpanded ? '▲' : '▼'}</ThemedText>
                    </TouchableOpacity>
                    {isExpanded && cat.items.length > 0 && (
                      <View style={styles.duaList}>
                        {cat.items.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.duaOption}
                            onPress={() => router.push({ pathname: '/dua-detail', params: { id: item.id } })}
                          >
                            <ThemedText style={styles.duaOptionText}>{item.title}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        />
      </ThemedView>
    </FacebookStyleTransition>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: '700', marginLeft: 16, marginBottom: 8 },
  section: { marginBottom: 28 },
  sectionHeader: { fontSize: 18, fontWeight: '700', marginBottom: 10, marginLeft: 2 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', paddingHorizontal: 8 },
  categoryIconLabel: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 22, marginRight: 12 },
  categoryLabel: { fontSize: 16, fontWeight: '500' },
  chevron: { fontSize: 18, color: '#888' },
  duaList: { backgroundColor: '#fafafa', paddingBottom: 8 },
  card: { padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  duaOption: { padding: 16, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#f7f7f7' },
  duaOptionText: { fontSize: 16, color: '#333' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  note: { fontSize: 14, fontWeight: '500', color: '#888', marginBottom: 4 },
  arabic: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  text: { fontSize: 14, color: '#555', marginBottom: 2 },
  actions: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  shareButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, marginLeft: 8 },
  shareText: { fontSize: 14, fontWeight: '600' },
});
