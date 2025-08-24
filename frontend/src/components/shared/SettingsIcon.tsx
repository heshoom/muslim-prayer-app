import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface SettingsIconProps {
  size?: number;
  color?: string;
}

export const SettingsIcon: React.FC<SettingsIconProps> = ({ 
  size = 24, 
  color = '#000' 
}) => {
  // Determine if we're in a light or dark context based on color
  const isLightColor = color === '#FFFFFF' || color === 'white' || color === '#a0a0a0';
  const isDarkColor = color === '#000000' || color === '#222' || color === '#2c3e50';
  
  // Use appropriate contrast colors
  const mainColor = color;
  const accentColor = isLightColor ? '#2c3e50' : '#ffffff';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Gear teeth */}
        <Path
          d="M12 1L13.09 8.26L20 4L16.74 10.91L24 12L16.74 13.09L20 20L13.09 16.74L12 24L10.91 16.74L4 20L7.26 13.09L0 12L7.26 10.91L4 4L10.91 7.26L12 1Z"
          fill={mainColor}
        />
        
        {/* Center circle (hole) */}
        <Circle 
          cx="12" 
          cy="12" 
          r="4" 
          fill={accentColor}
        />
        
        {/* Inner gear detail */}
        <Circle 
          cx="12" 
          cy="12" 
          r="2.5" 
          fill={mainColor}
        />
        
        {/* Center hole */}
        <Circle 
          cx="12" 
          cy="12" 
          r="1" 
          fill={accentColor}
        />
      </Svg>
    </View>
  );
};
