import React, { useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface PageTransitionProps {
  children: React.ReactNode;
  style?: any;
}

export default function PageTransition({ children, style }: PageTransitionProps) {
  const translateX = useSharedValue(screenWidth);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  // Animate in when screen becomes focused
  useFocusEffect(
    React.useCallback(() => {
      // Add subtle haptic feedback on screen entry
      if (Platform.OS === 'ios') {
        runOnJS(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        })();
      }

      // Animate in with iOS-like timing
      translateX.value = withSpring(0, {
        damping: 30,
        stiffness: 300,
        mass: 0.8,
      });
      
      opacity.value = withTiming(1, {
        duration: 400,
      });
      
      scale.value = withSpring(1, {
        damping: 25,
        stiffness: 300,
        mass: 0.9,
      });

      return () => {
        // Animate out (optional - for when leaving the screen)
        translateX.value = withSpring(-screenWidth * 0.3, {
          damping: 30,
          stiffness: 300,
          mass: 0.8,
        });
        opacity.value = withTiming(0, {
          duration: 250,
        });
        scale.value = withSpring(0.92, {
          damping: 25,
          stiffness: 300,
        });
      };
    }, [])
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
