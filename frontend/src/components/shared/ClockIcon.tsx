import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface ClockIconProps {
  size?: number;
  color?: string;
}

export const ClockIcon: React.FC<ClockIconProps> = ({ 
  size = 24, 
  color = '#000' 
}) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Outer circle */}
        <Circle 
          cx="12" 
          cy="12" 
          r="10" 
          fill={color}
        />
        
        {/* Inner circle (clock face) */}
        <Circle 
          cx="12" 
          cy="12" 
          r="8" 
          fill={color === '#FFFFFF' || color === 'white' ? '#000000' : '#FFFFFF'}
        />
        
        {/* Hour markers */}
        <Circle cx="12" cy="4" r="0.8" fill={color} />
        <Circle cx="18" cy="6" r="0.6" fill={color} />
        <Circle cx="20" cy="12" r="0.8" fill={color} />
        <Circle cx="18" cy="18" r="0.6" fill={color} />
        <Circle cx="12" cy="20" r="0.8" fill={color} />
        <Circle cx="6" cy="18" r="0.6" fill={color} />
        <Circle cx="4" cy="12" r="0.8" fill={color} />
        <Circle cx="6" cy="6" r="0.6" fill={color} />
        
        {/* Clock hands */}
        {/* Hour hand (pointing to 2 - around prayer time) */}
        <Path
          d="M12 12L14.5 9.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Minute hand (pointing to 12) */}
        <Path
          d="M12 12L12 6.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Center dot */}
        <Circle cx="12" cy="12" r="1.5" fill={color} />
      </Svg>
    </View>
  );
};
