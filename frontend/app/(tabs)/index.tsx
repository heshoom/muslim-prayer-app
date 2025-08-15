import React from "react";
import { StyleSheet, ScrollView, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NextPrayer } from "@/src/components/home/NextPrayer";
import { DailyContent } from "@/src/components/home/DailyContent";
import { QuickActions } from "@/src/components/home/QuickActions";
import { ThemedText } from "@/src/components/shared/ThemedText";
import { ThemedView } from "@/src/components/shared/ThemedView";
import moment from "moment-hijri";
import { useSettings } from "@/src/contexts/SettingsContext";
import { darkTheme, lightTheme } from "@/src/constants/theme";

export default function HomeScreen() {
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Use moment-hijri for proper Hijri date formatting
  const hijriMoment = moment();
  
  // Get Hijri date components
  const hijriDay = hijriMoment.iDate();
  const hijriMonth = hijriMoment.iMonth(); // 0-based index
  const hijriYear = hijriMoment.iYear();
  
  // English transliteration of Hijri months
  const hijriMonthsEn = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ];
  
  const formattedHijriDate = `${hijriDay} ${hijriMonthsEn[hijriMonth]} ${hijriYear}`;

  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  // Calculate bottom padding to avoid tab bar overlap
  const bottomPadding = Platform.OS === "ios" ? 100 : 80; // Increased for iOS

  return (
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
