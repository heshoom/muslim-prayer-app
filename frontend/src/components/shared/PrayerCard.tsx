import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { formatTime } from '@/src/utils/timeUtils';

type PrayerCardProps = {
  name: string;
  time: string;
};

export const PrayerCard = ({ name, time }: PrayerCardProps) => {
  const { isDarkMode, settings } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const formattedTime = formatTime(time, settings.appearance.timeFormat);

  return (
    <ThemedView 
      style={[
        styles.prayerCard, 
        { 
          backgroundColor: theme.surface,
          borderLeftColor: theme.primary 
        }
      ]}
    >
      <ThemedText style={[styles.prayerName, { color: theme.text.primary }]}>
        {name}
      </ThemedText>
      <ThemedText style={[styles.prayerTime, { color: theme.text.secondary }]}>
        {formattedTime}
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  prayerCard: {
    width: '48%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  prayerTime: {
    fontSize: 22,
    fontWeight: '300',
    marginTop: 5,
  },
});
