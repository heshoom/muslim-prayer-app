import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { ThemedText } from '../shared/ThemedText';
import { ThemedView } from '../shared/ThemedView';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';
import * as Location from 'expo-location';
import { DeviceMotion } from 'expo-sensors';
import { CompassBase } from './CompassBase';

const MECCA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206
};

export const QiblaCompass = () => {
  const { isDarkMode } = useSettings();
  const { t } = useTranslation();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(true);

  // Check if running on mobile device
  const isMobileDevice = Platform.OS === 'ios' || Platform.OS === 'android';

  useEffect(() => {
    if (!isMobileDevice) {
      setErrorMsg(t('qiblaRequiresMobile') || 'The Qibla compass requires a mobile device with motion sensors. Please use this feature on your phone or tablet.');
      return;
    }
    
    let mounted = true;
    
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg(t('locationPermissionDenied') || 'Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        if (!mounted) return;
        
        setLocation(location);

        // Calculate Qibla direction
        const qiblaAngle = calculateQiblaDirection(
          location.coords.latitude,
          location.coords.longitude
        );
        setQiblaAngle(qiblaAngle);
        setIsCalibrating(false);

        // Start compass updates
        if (Platform.OS === 'ios') {
          DeviceMotion.setUpdateInterval(100);
          const subscription = DeviceMotion.addListener(data => {
            if (data.rotation && mounted) {
              // Better heading calculation for iOS
              const heading = Math.atan2(data.rotation.beta, data.rotation.alpha) * (180 / Math.PI);
              setHeading((heading + 360) % 360);
            }
          });

          return () => {
            mounted = false;
            subscription.remove();
          };
        } else {
          // For Android
          const subscription = await Location.watchHeadingAsync(data => {
            if (mounted) {
              setHeading(data.trueHeading || data.magHeading);
            }
          });

          return () => {
            mounted = false;
            subscription.remove();
          };
        }
      } catch (error: any) {
        if (mounted) {
          setErrorMsg(t('compassError') || 'Error accessing compass: ' + (error.message || 'Unknown error'));
        }
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, [isMobileDevice, t]);

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
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
        <ThemedText style={[styles.error, { color: theme.error }]}>{errorMsg}</ThemedText>
      </ThemedView>
    );
  }

  if (isCalibrating) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
        <ThemedText style={[styles.calibrating, { color: theme.text.primary }]}>
          {t('calibratingCompass') || 'Calibrating compass...'}
        </ThemedText>
      </ThemedView>
    );
  }

  // Calculate the relative angle between current heading and Qibla direction
  const relativeQiblaAngle = (qiblaAngle - heading + 360) % 360;

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.compassContainer}>
        <View style={styles.compass}>
          <CompassBase theme={theme} />
          
          {/* Qibla direction indicator */}
          <View 
            style={[
              styles.qiblaPointer, 
              { 
                transform: [{ rotate: `${relativeQiblaAngle}deg` }]
              }
            ]} 
          >
            {/* Arrow pointing to Qibla */}
            <View style={[styles.qiblaArrowHead, { borderBottomColor: theme.primary }]} />
            <View style={[styles.qiblaLine, { backgroundColor: theme.primary }]} />
          </View>
          
          {/* Center dot */}
          <View style={[styles.centerDot, { backgroundColor: theme.primary }]} />
        </View>
      </View>
      
      <ThemedView style={[styles.infoContainer, { backgroundColor: theme.surface }]}>
        <ThemedText style={[styles.heading, { color: theme.text.primary }]}>
          {t('currentHeading') || 'Heading'}: {Math.round(heading)}°
        </ThemedText>
        <ThemedText style={[styles.qiblaDirection, { color: theme.primary }]}>
          {t('qiblaAngle') || 'Qibla'}: {Math.round(qiblaAngle)}°
        </ThemedText>
      </ThemedView>
      
      <ThemedText style={[styles.instructions, { color: theme.text.secondary }]}>
        {t('qiblaInstructions') || 'Hold your phone flat and rotate until the green arrow points up to find Qibla direction'}
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
  qiblaPointer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: '45%',
    marginTop: '-22.5%', // Half of height to center the rotation point
    marginLeft: -3,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  qiblaArrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 2,
  },
  qiblaLine: {
    width: 6,
    height: '70%',
    borderRadius: 3,
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: '50%',
    left: '50%',
    marginTop: -6,
    marginLeft: -6,
    zIndex: 3,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
  },
  heading: {
    fontSize: 16,
    fontWeight: '500',
  },
  qiblaDirection: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calibrating: {
    fontSize: 18,
    textAlign: 'center',
  },
  instructions: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    textAlign: 'center',
    fontSize: 16,
    marginHorizontal: 20,
  },
});
