import React from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import { NavigationHelpers, ParamListBase, TabNavigationState } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

interface ScreenTransitionProps {
  children: React.ReactNode;
  index: number;
  focusedIndex: number;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  state: TabNavigationState<ParamListBase>;
}

export default function ScreenTransition({ 
  children, 
  index, 
  focusedIndex,
}: ScreenTransitionProps) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  // Calculate the translation based on the difference between current and focused index
  const targetTranslateX = (index - focusedIndex) * screenWidth;

  React.useEffect(() => {
    // Smooth slide transition
    translateX.value = withSpring(targetTranslateX, {
      damping: 20,
      stiffness: 200,
      mass: 1,
    });

    // Fade and scale effect for better visual feedback
    if (index === focusedIndex) {
      opacity.value = withSpring(1, { damping: 15, stiffness: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      opacity.value = withSpring(0.3, { damping: 15, stiffness: 200 });
      scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    }
  }, [focusedIndex, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: screenWidth,
        },
        animatedStyle,
      ]}
      pointerEvents={index === focusedIndex ? 'auto' : 'none'}
    >
      {children}
    </Animated.View>
  );
}
