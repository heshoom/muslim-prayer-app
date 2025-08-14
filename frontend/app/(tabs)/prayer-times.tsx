import { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import { PrayerCard } from '@/src/components/shared/PrayerCard';
import { PrayerTimes } from '@/src/types/prayerTimes';
import { prayerTimesApi } from '@/src/services/prayerTimesApi';
import { ThemedView } from '@/src/components/shared/ThemedView';
import { ThemedText } from '@/src/components/shared/ThemedText';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';

export default function PrayerTimesScreen() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [city, setCity] = useState('New York');
  const [inputCity, setInputCity] = useState('New York');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect for fetching prayer times by city name
  useEffect(() => {
    if (!city) {
      setLoading(false);
      return;
    }

    const fetchPrayerTimesByCity = async () => {
      setLoading(true);
      setError(null);
      setPrayerTimes(null);
      try {
        const data = await prayerTimesApi.getPrayerTimesByCity(city);
        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
          setDate(data.data.date.readable);
        } else {
          setError('City not found. Please try another city.');
          setPrayerTimes(null);
        }
      } catch (err) {
        setError('Could not fetch prayer times. Please check your connection.');
        setPrayerTimes(null);
      }
      setLoading(false);
    };

    fetchPrayerTimesByCity();
  }, [city]);

  // Handler for the search button
  const handleSearch = () => {
    if (inputCity.trim()) {
      setCity(inputCity);
    }
  };

  // Handler for the "Use My Location" button
  const handleGeoLocation = async () => {
    setLoading(true);
    setError(null);
    setPrayerTimes(null);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access location was denied.');
      setLoading(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const data = await prayerTimesApi.getPrayerTimesByCoordinates(latitude, longitude);

      if (data.code === 200) {
        setPrayerTimes(data.data.timings);
        setDate(data.data.date.readable);
        const timezone = data.data.meta.timezone;
        const locationName = timezone.split('/')[1].replace(/_/g, ' ');
        setCity(locationName);
        setInputCity(locationName);
      } else {
        setError('Could not determine prayer times for your location.');
      }
    } catch (err) {
      setError('Failed to get location or prayer times.');
    }
    setLoading(false);
  };

  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemedView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={[styles.title, { color: theme.primary }]}>Muslim Prayer Times</ThemedText>
          <ThemedText type="subtitle">Enter a city or use your location</ThemedText>
        </ThemedView>

        <ThemedView style={styles.searchForm}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface,
              color: theme.text.primary,
              borderColor: theme.border
            }]}
            placeholder="Enter city name..."
            placeholderTextColor={theme.text.secondary}
            value={inputCity}
            onChangeText={setInputCity}
          />
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: theme.primary }]} 
            onPress={handleSearch}
          >
            <ThemedText style={styles.buttonText}>Search</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <TouchableOpacity 
          style={[styles.locationButton, { 
            backgroundColor: theme.surface,
            borderColor: theme.primary 
          }]} 
          onPress={handleGeoLocation}
        >
          <ThemedText style={[styles.locationButtonText, { color: theme.primary }]}>
            Use My Location
          </ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.mainContent}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : error ? (
            <ThemedView style={[styles.errorContainer, { borderColor: theme.error }]}>
              <ThemedText style={[styles.errorText, { color: theme.error }]}>{error}</ThemedText>
            </ThemedView>
          ) : prayerTimes ? (
            <ThemedView style={[styles.prayerTimesContainer, { backgroundColor: theme.surface }]}>
              <ThemedText type="title">Prayer Times for {city}</ThemedText>
              <ThemedText type="subtitle">{date}</ThemedText>
              <ThemedView style={styles.grid}>
                <PrayerCard name="Fajr" time={prayerTimes.Fajr} />
                <PrayerCard name="Dhuhr" time={prayerTimes.Dhuhr} />
                <PrayerCard name="Asr" time={prayerTimes.Asr} />
                <PrayerCard name="Maghrib" time={prayerTimes.Maghrib} />
                <PrayerCard name="Isha" time={prayerTimes.Isha} />
                <PrayerCard name="Sunrise" time={prayerTimes.Sunrise} />
              </ThemedView>
            </ThemedView>
          ) : null}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchForm: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButton: {
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  prayerTimesContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
