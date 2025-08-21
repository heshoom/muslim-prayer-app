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
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Gear teeth */}
        <Path
          d="M12 1L13.09 8.26L20 4L16.74 10.91L24 12L16.74 13.09L20 20L13.09 16.74L12 24L10.91 16.74L4 20L7.26 13.09L0 12L7.26 10.91L4 4L10.91 7.26L12 1Z"
          fill={color}
        />
        
        {/* Center circle (hole) */}
        <Circle 
          cx="12" 
          cy="12" 
          r="4" 
          fill={color === '#FFFFFF' || color === 'white' ? '#000000' : '#FFFFFF'}
        />
        
        {/* Inner gear detail */}
        <Circle 
          cx="12" 
          cy="12" 
          r="2.5" 
          fill={color}
        />
        
        {/* Center hole */}
        <Circle 
          cx="12" 
          cy="12" 
          r="1" 
          fill={color === '#FFFFFF' || color === 'white' ? '#000000' : '#FFFFFF'}
        />
      </Svg>
    </View>
  );
};
