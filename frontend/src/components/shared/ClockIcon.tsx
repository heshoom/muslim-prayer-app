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
  // Determine if we're in a light or dark context based on color
  const isLightColor = color === '#FFFFFF' || color === 'white' || color === '#a0a0a0';
  const isDarkColor = color === '#000000' || color === '#222' || color === '#2c3e50';
  
  // Use appropriate contrast colors
  const outerColor = color;
  const innerColor = isLightColor ? '#2c3e50' : '#ffffff';
  const accentColor = isLightColor ? '#3498db' : '#2980b9';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Outer circle */}
        <Circle 
          cx="12" 
          cy="12" 
          r="10" 
          fill={outerColor}
        />
        
        {/* Inner circle (clock face) */}
        <Circle 
          cx="12" 
          cy="12" 
          r="8" 
          fill={innerColor}
        />
        
        {/* Hour markers */}
        <Circle cx="12" cy="4" r="0.8" fill={outerColor} />
        <Circle cx="18" cy="6" r="0.6" fill={outerColor} />
        <Circle cx="20" cy="12" r="0.8" fill={outerColor} />
        <Circle cx="18" cy="18" r="0.6" fill={outerColor} />
        <Circle cx="12" cy="20" r="0.8" fill={outerColor} />
        <Circle cx="6" cy="18" r="0.6" fill={outerColor} />
        <Circle cx="4" cy="12" r="0.8" fill={outerColor} />
        <Circle cx="6" cy="6" r="0.6" fill={outerColor} />
        
        {/* Clock hands */}
        {/* Hour hand (pointing to 2 - around prayer time) */}
        <Path
          d="M12 12L14.5 9.5"
          stroke={outerColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Minute hand (pointing to 12) */}
        <Path
          d="M12 12L12 6.5"
          stroke={outerColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Center dot */}
        <Circle cx="12" cy="12" r="1.5" fill={outerColor} />
      </Svg>
    </View>
  );
};
