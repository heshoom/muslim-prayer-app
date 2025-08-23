import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface CompassIconProps {
  size?: number;
  color?: string;
}

export const CompassIcon: React.FC<CompassIconProps> = ({
  size = 24,
  color = '#000'
}) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Outer ring */}
        <Circle cx="12" cy="12" r="10" fill={color} />

        {/* Inner face */}
        <Circle cx="12" cy="12" r="7.2" fill={color === '#FFFFFF' || color === 'white' ? '#000000' : '#FFFFFF'} />

        {/* Compass needle */}
        <Path
          d="M12 6 L15 12 L12 14 L9 12 Z"
          fill={color}
        />

        {/* North indicator */}
        <Path
          d="M12 3 L12 6"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <Circle cx="12" cy="12" r="1" fill={color} />
      </Svg>
    </View>
  );
};
