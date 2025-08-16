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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface FacebookStyleTransitionProps {
  children: React.ReactNode;
  style?: any;
  direction?: 'left' | 'right';
}

export default function FacebookStyleTransition({ 
  children, 
  style, 
  direction = 'right' 
}: FacebookStyleTransitionProps) {
  const translateX = useSharedValue(direction === 'right' ? screenWidth : -screenWidth);
  const opacity = useSharedValue(0);
  const navigation = useNavigation();

  // Listen to focus events for smooth transitions
  useFocusEffect(
    React.useCallback(() => {
      // Add subtle haptic feedback
      if (Platform.OS === 'ios') {
        runOnJS(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        })();
      }

      // Facebook-style slide animation
      translateX.value = withSpring(0, {
        damping: 35,
        stiffness: 400,
        mass: 0.7,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      });
      
      opacity.value = withTiming(1, {
        duration: 350,
      });

      return () => {
        // Slide out animation when leaving
        const exitDirection = direction === 'right' ? -screenWidth * 0.4 : screenWidth * 0.4;
        translateX.value = withSpring(exitDirection, {
          damping: 40,
          stiffness: 500,
          mass: 0.6,
        });
        opacity.value = withTiming(0.7, {
          duration: 200,
        });
      };
    }, [direction])
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          translateX: translateX.value,
        },
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
