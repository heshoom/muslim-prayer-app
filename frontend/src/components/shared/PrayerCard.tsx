import { StyleSheet, Text, View } from 'react-native';

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

export const PrayerCard = ({ name, time }: PrayerCardProps) => (
  <View style={styles.prayerCard}>
    <Text style={styles.prayerName}>{name}</Text>
    <Text style={styles.prayerTime}>{convertTo12Hour(time)}</Text>
  </View>
);

const styles = StyleSheet.create({
  prayerCard: {
    width: '48%',
    backgroundColor: '#f0f4f8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2980b9',
  },
  prayerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  prayerTime: {
    fontSize: 22,
    fontWeight: '300',
    marginTop: 5,
    color: '#34495e'
  },
});
