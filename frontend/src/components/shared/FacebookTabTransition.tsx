import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

// Context to track tab transitions
const TabTransitionContext = createContext<{
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  previousIndex: number;
}>({
  currentIndex: 0,
  setCurrentIndex: () => {},
  previousIndex: 0,
});

export const useTabTransition = () => useContext(TabTransitionContext);

interface TabTransitionProviderProps {
  children: React.ReactNode;
}

export function TabTransitionProvider({ children }: TabTransitionProviderProps) {
  const [currentIndex, setCurrentIndexState] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);

  const setCurrentIndex = (index: number) => {
    setPreviousIndex(currentIndex);
    setCurrentIndexState(index);
  };

  return (
    <TabTransitionContext.Provider value={{ currentIndex, setCurrentIndex, previousIndex }}>
      {children}
    </TabTransitionContext.Provider>
  );
}

interface FacebookTabTransitionProps {
  children: React.ReactNode;
  tabIndex: number;
  style?: any;
}

export default function FacebookTabTransition({ 
  children, 
  tabIndex, 
  style 
}: FacebookTabTransitionProps) {
  const { currentIndex, previousIndex } = useTabTransition();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  // Get route information to map route names to indices
  const route = useRoute();
  const routeToIndex: { [key: string]: number } = {
    'index': 0,
    'prayer-times': 1,
    'settings': 2,
  };

  const currentRouteIndex = routeToIndex[route.name] || 0;

  useEffect(() => {
    const difference = currentRouteIndex - previousIndex;
    const targetTranslateX = difference * screenWidth;

    // Facebook-style transition with proper direction
    if (Math.abs(difference) > 0) {
      // Start from the appropriate side
      translateX.value = targetTranslateX;
      opacity.value = 0.3;
      scale.value = 0.95;

      // Animate to center
      translateX.value = withSpring(0, {
        damping: 35,
        stiffness: 400,
        mass: 0.8,
        overshootClamping: false,
      });

      opacity.value = withSpring(1, {
        damping: 25,
        stiffness: 300,
      });

      scale.value = withSpring(1, {
        damping: 30,
        stiffness: 350,
      });
    }
  }, [currentRouteIndex, previousIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = currentRouteIndex === tabIndex;
    
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
      zIndex: isActive ? 1 : 0,
    };
  });

  return (
    <Animated.View 
      style={[
        { 
          flex: 1,
          position: currentRouteIndex === tabIndex ? 'relative' : 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }, 
        animatedStyle, 
        style
      ]}
      pointerEvents={currentRouteIndex === tabIndex ? 'auto' : 'none'}
    >
      {children}
    </Animated.View>
  );
}
