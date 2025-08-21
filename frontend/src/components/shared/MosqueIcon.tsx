import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface MosqueIconProps {
  size?: number;
  color?: string;
}

export const MosqueIcon: React.FC<MosqueIconProps> = ({ 
  size = 24, 
  color = '#000' 
}) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Main building base */}
        <Path
          d="M3 21h18v-9H3v9z"
          fill={color}
        />
        
        {/* Central dome */}
        <Path
          d="M7 12c0-2.8 2.2-5 5-5s5 2.2 5 5H7z"
          fill={color}
        />
        
        {/* Left minaret */}
        <Path
          d="M1 21h3V8c0-0.5 0.5-1 1-1s1 0.5 1 1v13h1V5c0-1.7-1.3-3-3-3s-3 1.3-3 3v16z"
          fill={color}
        />
        
        {/* Right minaret */}
        <Path
          d="M17 21h1V8c0-0.5 0.5-1 1-1s1 0.5 1 1v13h3V5c0-1.7-1.3-3-3-3s-3 1.3-3 3v16z"
          fill={color}
        />
        
        {/* Crescent moon on dome */}
        <Path
          d="M12 4c-0.5 0-1 0.3-1.2 0.7-0.1 0.2 0 0.4 0.2 0.5C11.3 5.4 11.6 5.7 11.6 6c0 0.3-0.3 0.6-0.6 0.6-0.2 0-0.3 0.2-0.2 0.4C11 7.3 11.5 7.5 12 7.5c0.8 0 1.5-0.7 1.5-1.5S12.8 4.5 12 4.5z"
          fill={color}
        />
        
        {/* Arch doorway */}
        <Path
          d="M9 21v-5c0-1.7 1.3-3 3-3s3 1.3 3 3v5"
          fill="none"
          stroke={color === '#FFFFFF' || color === 'white' ? '#000000' : '#FFFFFF'}
          strokeWidth="1.5"
        />
        
        {/* Small decorative elements on dome */}
        <Circle cx="9" cy="10" r="0.5" fill={color} />
        <Circle cx="15" cy="10" r="0.5" fill={color} />
      </Svg>
    </View>
  );
};
