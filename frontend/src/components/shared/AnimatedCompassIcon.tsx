import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, cancelAnimation, Easing } from 'react-native-reanimated';

interface AnimatedCompassIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const AnimatedCompassIcon: React.FC<AnimatedCompassIconProps> = ({
  size = 24,
  color = '#000',
  focused = false,
}) => {
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    if (focused) {
      // start continuous slow rotation
      rotate.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      // stop animation and reset
      cancelAnimation(rotate);
      rotate.value = withTiming(0, { duration: 250 });
    }
    return () => cancelAnimation(rotate);
  }, [focused, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotate.value % 360}deg`,
      },
    ],
  }));

  return (
    <AnimatedView style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill={color} />
        <Circle cx="12" cy="12" r="7.2" fill={color === '#FFFFFF' || color === 'white' ? '#000000' : '#FFFFFF'} />
        <Path d="M12 6 L15 12 L12 14 L9 12 Z" fill={color} />
        <Path d="M12 3 L12 6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <Circle cx="12" cy="12" r="1" fill={color} />
      </Svg>
    </AnimatedView>
  );
};

export default AnimatedCompassIcon;
