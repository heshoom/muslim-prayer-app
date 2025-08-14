import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import * as Location from 'expo-location';
import { DeviceMotion } from 'expo-sensors';
import { CompassBase } from './CompassBase';

const MECCA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206
};

export const QiblaCompass = () => {
  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if running on mobile device
  const isMobileDevice = Platform.OS === 'ios' || Platform.OS === 'android';

  useEffect(() => {
    if (!isMobileDevice) {
      setErrorMsg('The Qibla compass requires a mobile device with motion sensors. Please use this feature on your phone or tablet.');
      return;
    }
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);

        // Calculate Qibla direction
        const qiblaAngle = calculateQiblaDirection(
          location.coords.latitude,
          location.coords.longitude
        );
        setQiblaAngle(qiblaAngle);

        // Start compass updates
        if (Platform.OS === 'ios') {
          DeviceMotion.setUpdateInterval(100);
          const subscription = DeviceMotion.addListener(data => {
            if (data.rotation) {
              const heading = -data.rotation.gamma * (180 / Math.PI);
              setHeading(heading);
            }
          });

          return () => {
            subscription.remove();
          };
        } else {
          // For Android
          const subscription = await Location.watchHeadingAsync(data => {
            setHeading(data.trueHeading);
          });

          return () => {
            subscription.remove();
          };
        }
      } catch (error: any) {
        setErrorMsg('Error accessing compass: ' + (error.message || 'Unknown error'));
      }
    })();
  }, []);

  const calculateQiblaDirection = (latitude: number, longitude: number) => {
    const lat1 = latitude * (Math.PI / 180);
    const lon1 = longitude * (Math.PI / 180);
    const lat2 = MECCA_COORDS.latitude * (Math.PI / 180);
    const lon2 = MECCA_COORDS.longitude * (Math.PI / 180);

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    let angle = Math.atan2(y, x);
    angle = angle * (180 / Math.PI);
    angle = (angle + 360) % 360;

    return angle;
  };

  if (errorMsg) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>{errorMsg}</ThemedText>
      </ThemedView>
    );
  }

  const rotationStyle = {
    transform: [{ rotate: `${heading}deg` }]
  };

  const qiblaStyle = {
    transform: [{ rotate: `${qiblaAngle}deg` }]
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.compassContainer}>
        <View style={[styles.compass, rotationStyle]}>
          <CompassBase />
          <View style={[styles.qiblaIndicator, qiblaStyle]} />
        </View>
      </View>
      <ThemedText style={styles.instructions}>
        Point your phone's top edge towards the arrow direction to find Qibla
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  compassContainer: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compass: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qiblaIndicator: {
    position: 'absolute',
    width: 4,
    height: '50%',
    backgroundColor: '#e74c3c',
    top: 0,
    left: '50%',
    marginLeft: -2,
    zIndex: 2,
  },
  instructions: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    fontSize: 16,
    marginHorizontal: 20,
  },
});
