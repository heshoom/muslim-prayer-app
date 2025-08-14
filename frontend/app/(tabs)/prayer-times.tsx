import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import { PrayerCard } from '@/src/components/shared/PrayerCard';
import { PrayerTimes } from '@/src/types/prayerTimes';
import { prayerTimesApi } from '@/src/services/prayerTimesApi';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Muslim Prayer Times</Text>
          <Text style={styles.subtitle}>Enter a city or use your location</Text>
        </View>

        <View style={styles.searchForm}>
          <TextInput
            style={styles.input}
            placeholder="Enter city name..."
            placeholderTextColor="#999"
            value={inputCity}
            onChangeText={setInputCity}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.locationButton} onPress={handleGeoLocation}>
          <Text style={styles.locationButtonText}>Use My Location</Text>
        </TouchableOpacity>

        <View style={styles.mainContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#2980b9" />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : prayerTimes ? (
            <View style={styles.prayerTimesContainer}>
              <Text style={styles.locationHeader}>Prayer Times for {city}</Text>
              <Text style={styles.dateHeader}>{date}</Text>
              <View style={styles.grid}>
                <PrayerCard name="Fajr" time={prayerTimes.Fajr} />
                <PrayerCard name="Dhuhr" time={prayerTimes.Dhuhr} />
                <PrayerCard name="Asr" time={prayerTimes.Asr} />
                <PrayerCard name="Maghrib" time={prayerTimes.Maghrib} />
                <PrayerCard name="Isha" time={prayerTimes.Isha} />
                <PrayerCard name="Sunrise" time={prayerTimes.Sunrise} />
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
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
    color: '#2980b9',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  searchForm: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#dce4ec',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333'
  },
  searchButton: {
    height: 50,
    backgroundColor: '#2980b9',
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
    backgroundColor: '#fff',
    borderColor: '#2980b9',
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  locationButtonText: {
    color: '#2980b9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fbeaea',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4a1a1',
  },
  errorText: {
    color: '#c0392b',
    fontSize: 16,
    textAlign: 'center',
  },
  prayerTimesContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 5,
    textTransform: 'capitalize',
    color: '#2c3e50',
  },
  dateHeader: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
