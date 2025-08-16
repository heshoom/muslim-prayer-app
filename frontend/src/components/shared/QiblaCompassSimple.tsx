import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { darkTheme, lightTheme } from '../../constants/theme';
import { useTranslation } from '../../i18n';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Svg, { G, Line, Rect, Circle } from 'react-native-svg';
import { CompassBase } from './CompassBase';

const MECCA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206
};

// Small Kaaba icon drawn with SVG (no external asset needed)
const KaabaIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  // Draw a simple Kaaba: black body with golden band
  return (
    <G x={x - 14} y={y - 14}>
      {/* base cube */}
      <Rect x={0} y={4} width={28} height={20} rx={3} ry={3} fill="#111" />
      {/* golden kiswa band */}
      <Rect x={0} y={10} width={28} height={4} fill="#C9A227" />
      {/* top */}
      <Rect x={2} y={2} width={24} height={6} rx={2} ry={2} fill="#1a1a1a" />
    </G>
  );
};

export const QiblaCompassSimple = () => {
  const { isDarkMode } = useSettings();
  const { t } = useTranslation();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const [qiblaBearing, setQiblaBearing] = useState(0); // absolute bearing from North
  const [heading, setHeading] = useState<number | null>(null); // device heading from North
  const [headingAccuracy, setHeadingAccuracy] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const didHapticRef = useRef(false);

  // Check if running on mobile device
  const isMobileDevice = Platform.OS === 'ios' || Platform.OS === 'android';

  // Calculate Qibla direction from coordinates
  const calculateQiblaDirection = (latitude: number, longitude: number) => {
    const lat1 = latitude * (Math.PI / 180);
    const lon1 = longitude * (Math.PI / 180);
    const lat2 = MECCA_COORDS.latitude * (Math.PI / 180);
    const lon2 = MECCA_COORDS.longitude * (Math.PI / 180);

    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    bearing = (bearing + 360) % 360;
    
    return bearing; // in degrees from North (clockwise)
  };

  // Initialize location and heading
  useEffect(() => {
    if (!isMobileDevice) {
      setErrorMsg('The Qibla compass requires a mobile device');
      setIsLoading(false);
      return;
    }
    
    let headingSub: Location.LocationSubscription | null = null;

    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission was denied');
          setIsLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const qiblaAngle = calculateQiblaDirection(
          location.coords.latitude,
          location.coords.longitude
        );
        setQiblaBearing(qiblaAngle);

        // Watch heading (true heading when available)
        headingSub = await Location.watchHeadingAsync((h) => {
          const value = Number.isFinite(h.trueHeading) && h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          setHeading(value);
          setHeadingAccuracy(h.accuracy ?? null);
        });

        setIsLoading(false);

      } catch (error: any) {
        setErrorMsg('Error getting location: ' + (error.message || 'Unknown error'));
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (headingSub) headingSub.remove();
    };
  }, [isMobileDevice]);

  // Relative angle to rotate the Kaaba icon from the top (North at 0°)
  const relativeAngle = useMemo(() => {
    const head = heading ?? 0;
    return (qiblaBearing - head + 360) % 360;
  }, [qiblaBearing, heading]);

  // Haptic feedback when aligned within 5 degrees
  useEffect(() => {
    if (heading == null) return;
    const delta = Math.min(Math.abs(relativeAngle), 360 - Math.abs(relativeAngle));
    if (delta <= 5 && !didHapticRef.current) {
      didHapticRef.current = true;
      Haptics.selectionAsync();
      setTimeout(() => (didHapticRef.current = false), 1500);
    }
  }, [relativeAngle, heading]);

  if (errorMsg) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.error, { color: theme.error }]}>{errorMsg}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loading, { color: theme.text.primary }]}>
          Getting your location...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.compassContainer}>
        <CompassBase theme={theme} />
        {/* Overlay for pointer and Kaaba icon */}
        <Svg width={300} height={300} style={styles.overlaySvg}>
          {/* Pointer line from center towards Kaaba direction */}
          <G transform={`rotate(${relativeAngle}, 150, 150)`}>
            <Line x1={150} y1={150} x2={150} y2={40} stroke={theme.primary} strokeWidth={4} strokeLinecap="round" />
            {/* Kaaba icon at tip */}
            <KaabaIcon x={150} y={30} />
          </G>
          {/* Center dot */}
          <G>
            <Circle cx={150} cy={150} r={7} fill={theme.primary} />
          </G>
        </Svg>
      </View>

      <View style={[styles.infoContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.infoTitle, { color: theme.text.primary }]}>
          {t('qiblaDirection') || 'Qibla Direction'}
        </Text>
        <Text style={[styles.infoValue, { color: theme.primary }]}>
          {Math.round(qiblaBearing)}° {t('fromNorth') || 'from North'}
        </Text>
        {heading != null && (
          <Text style={[styles.subInfo, { color: theme.text.secondary }]}> 
            {t('yourHeading') || 'Your heading'}: {Math.round(heading)}°
          </Text>
        )}
        {headingAccuracy != null && headingAccuracy > 20 && (
          <Text style={[styles.tip, { color: theme.secondary }]}> 
            {t('calibrateCompass') || 'Move your phone in a figure-8 to calibrate the compass'}
          </Text>
        )}
      </View>

      <Text style={[styles.instructions, { color: theme.text.secondary }]}> 
        {t('alignKaabaTip') || "Turn until the Ka'bah icon points straight up to face Qibla"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loading: {
    fontSize: 18,
    textAlign: 'center',
  },
  error: {
    textAlign: 'center',
    fontSize: 16,
    marginHorizontal: 20,
    lineHeight: 24,
  },
  compassContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  overlaySvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  infoContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subInfo: {
    fontSize: 14,
    marginTop: 6,
  },
  tip: {
    marginTop: 8,
    fontSize: 13,
  },
  instructions: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
});
