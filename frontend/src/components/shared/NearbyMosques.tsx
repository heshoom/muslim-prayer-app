import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';
import { prayerTimesApi } from '@/src/services/prayerTimesApi';
import * as Location from 'expo-location';

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

interface Mosque {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now: boolean;
  };
  formatted_phone_number?: string;
  website?: string;
}

export const NearbyMosques = () => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    findNearbyMosques();
  }, []);

  const findNearbyMosques = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(t('locationPermissionRequired') || 'Location permission is required to find nearby mosques');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);

      // Temporarily disabled - requires paid Google Places API
      // const data = await prayerTimesApi.getNearbyMosques(
      //   location.coords.latitude,
      //   location.coords.longitude,
      //   5000 // 5km radius
      // );

      // if (data.status === 'OK' && data.results) {
      //   setMosques(data.results);
      // } else {
      //   setError(t('errorFindingMosques') || 'No mosques found in your area');
      // }
      
      // For now, show a message that the feature is temporarily disabled
      setError('Nearby mosques feature is temporarily disabled. We\'re working on a free alternative to Google Places API.');
    } catch (err) {
      setError('Nearby mosques feature is temporarily disabled. We\'re working on a free alternative to Google Places API.');
      console.error('Error finding mosques:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const showNavigationOptions = (mosque: Mosque) => {
    const { lat, lng } = mosque.geometry.location;
    const label = encodeURIComponent(mosque.name);
    
    Alert.alert(
      t('chooseNavigationApp') || 'Choose Navigation App',
      t('selectAppForDirections') || 'Select an app for directions',
      [
        {
          text: 'Apple Maps',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL(`maps://app?q=${lat},${lng}&ll=${lat},${lng}&label=${label}`);
            } else {
              Linking.openURL(`geo:${lat},${lng}?q=${lat},${lng}(${label})`);
            }
          }
        },
        {
          text: 'Google Maps',
          onPress: () => {
            const url = Platform.OS === 'ios' 
              ? `comgooglemaps://?q=${lat},${lng}&center=${lat},${lng}&zoom=14&views=traffic`
              : `google.navigation:q=${lat},${lng}&mode=d`;
            
            Linking.canOpenURL(url).then(supported => {
              if (supported) {
                Linking.openURL(url);
              } else {
                // Fallback to web version
                Linking.openURL(`https://maps.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=14`);
              }
            });
          }
        },
        {
          text: 'Waze',
          onPress: () => {
            const wazeUrl = `waze://?ll=${lat},${lng}&navigate=yes&zoom=17`;
            
            Linking.canOpenURL(wazeUrl).then(supported => {
              if (supported) {
                Linking.openURL(wazeUrl);
              } else {
                // Fallback to web version
                Linking.openURL(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes&zoom=17`);
              }
            });
          }
        },
        {
          text: t('cancel') || 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const callMosque = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openWebsite = (website: string) => {
    Linking.openURL(website);
  };

  const renderMosque = ({ item }: { item: Mosque }) => {
    // Calculate distance if user location is available
    const distance = userLocation 
      ? calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          item.geometry.location.lat,
          item.geometry.location.lng
        )
      : null;

    return (
      <ThemedView style={[styles.mosqueCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.mosqueHeader}>
          <View style={styles.mosqueInfo}>
            <ThemedText style={[styles.mosqueName, { color: theme.text.primary }]}>
              {item.name}
            </ThemedText>
            <ThemedText style={[styles.mosqueAddress, { color: theme.text.secondary }]}>
              {item.vicinity || item.formatted_address || 'Address not available'}
            </ThemedText>
            {distance && (
              <ThemedText style={[styles.mosqueDistance, { color: theme.primary }]}>
                {distance.toFixed(1)} {t('milesAway') || 'miles away'}
              </ThemedText>
            )}
            {item.rating && (
              <View style={styles.ratingContainer}>
                <FontAwesome5 name="star" size={14} color="#ffd700" solid />
                <ThemedText style={[styles.rating, { color: theme.text.secondary }]}>
                  {item.rating.toFixed(1)} ({item.user_ratings_total || 0} reviews)
                </ThemedText>
              </View>
            )}
            {item.opening_hours && (
              <ThemedText style={[
                styles.openStatus, 
                { color: item.opening_hours.open_now ? theme.success : theme.error }
              ]}>
                {item.opening_hours.open_now ? t('openNow') || 'Open now' : t('closed') || 'Closed'}
              </ThemedText>
            )}
          </View>
          <FontAwesome5 name="mosque" size={32} color={theme.primary} />
        </View>
        
        <View style={styles.mosqueActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => showNavigationOptions(item)}
          >
            <FontAwesome5 name="directions" size={16} color="white" />
            <ThemedText style={styles.actionText}>{t('directions') || 'Directions'}</ThemedText>
          </TouchableOpacity>
          
          {item.formatted_phone_number && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.secondary }]}
              onPress={() => callMosque(item.formatted_phone_number!)}
            >
              <FontAwesome5 name="phone" size={16} color="white" />
              <ThemedText style={styles.actionText}>{t('call') || 'Call'}</ThemedText>
            </TouchableOpacity>
          )}
          
          {item.website && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.tint }]}
              onPress={() => openWebsite(item.website!)}
            >
              <FontAwesome5 name="globe" size={16} color="white" />
              <ThemedText style={styles.actionText}>{t('website') || 'Website'}</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
        <ThemedText style={[styles.loading, { color: theme.text.primary }]}>
          {t('findingMosques') || 'Finding nearby mosques...'}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
        <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={findNearbyMosques}
        >
          <ThemedText style={styles.retryText}>{t('retry') || 'Retry'}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedView style={[styles.header, { backgroundColor: theme.surface }]}>
        <ThemedText style={[styles.title, { color: theme.text.primary }]}>
          {t('nearbyMosques') || 'Nearby Mosques'}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.text.secondary }]}>
          {`${t('found') || 'Found'} ${mosques.length} ${t('mosquesNearby') || 'mosques nearby'}`}
        </ThemedText>
      </ThemedView>
      
      <FlatList
        data={mosques}
        renderItem={renderMosque}
        keyExtractor={(item) => item.place_id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  mosqueCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mosqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mosqueInfo: {
    flex: 1,
    marginRight: 12,
  },
  mosqueName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mosqueAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  mosqueDistance: {
    fontSize: 14,
    fontWeight: '600',
  },
  mosqueActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  openStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  loading: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
  },
  error: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
