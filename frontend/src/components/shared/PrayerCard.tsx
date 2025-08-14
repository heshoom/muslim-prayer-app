import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';

// Function to convert 24-hour time to 12-hour AM/PM format
export const convertTo12Hour = (time: string): string => {
  if (!time) return '';
  let [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 0 -> 12 and 13-23 -> 1-11
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

type PrayerCardProps = {
  name: string;
  time: string;
};

export const PrayerCard = ({ name, time }: PrayerCardProps) => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

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
        {convertTo12Hour(time)}
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
