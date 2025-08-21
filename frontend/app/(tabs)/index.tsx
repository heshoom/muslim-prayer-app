import React from "react";
import { StyleSheet, ScrollView, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DailyContent } from "../../src/components/home/DailyContent";
import { QuickActions } from "../../src/components/home/QuickActions";
import NextPrayer from "../../src/components/home/NextPrayer";
import { ThemedText } from "../../src/components/shared/ThemedText";
import { ThemedView } from "../../src/components/shared/ThemedView";
import FacebookStyleTransition from "../../src/components/shared/FacebookStyleTransition";
import moment from "moment-hijri";
import { useSettings } from "../../src/contexts/SettingsContext";
import { darkTheme, lightTheme } from "../../src/constants/theme";
import { useTranslation } from "../../src/i18n";

export default function HomeScreen() {
  const { isDarkMode, settings } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t, getHijriMonths } = useTranslation();
  const insets = useSafeAreaInsets();

  const date = new Date();
  const locale = settings.appearance.language || 'en';
  const formattedDate = (() => {
    try {
      return date.toLocaleDateString(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  })();

  // Use moment-hijri for proper Hijri date formatting
  const hijriMoment = moment();
  
  // Get Hijri date components
  const hijriDay = hijriMoment.iDate();
  const hijriMonth = hijriMoment.iMonth(); // 0-based index
  const hijriYear = hijriMoment.iYear();
  
  // Get localized Hijri month names from translations
  const hijriMonths = getHijriMonths();
  const formattedHijriDate = `${hijriDay} ${hijriMonths[hijriMonth]} ${hijriYear}`;

  // Calculate bottom padding to avoid tab bar overlap
  const bottomPadding = Platform.OS === "ios" ? (75 + insets.bottom) : (60 + 20);

  return (
    <FacebookStyleTransition direction="right">
      <ThemedView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: theme.background }]}
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingTop: insets.top + 10,
              paddingBottom: bottomPadding,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <ThemedText style={[styles.dateText, { color: theme.primary }]}>
              {formattedDate}
            </ThemedText>
            <ThemedText type="subtitle">{formattedHijriDate}</ThemedText>
          </View>

          {/* Next Prayer Section */}
          <NextPrayer />

          {/* Daily Content Section */}
          <DailyContent />

          {/* Quick Actions Grid */}
          <QuickActions />
        </ScrollView>
      </ThemedView>
    </FacebookStyleTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
});
