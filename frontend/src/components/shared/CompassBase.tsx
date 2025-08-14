import React from 'react';
import Svg, { Circle, Line, G, Text } from 'react-native-svg';

interface CompassBaseProps {
  theme?: any;
}

export const CompassBase: React.FC<CompassBaseProps> = ({ theme }) => {
  const strokeColor = theme?.primary || '#2980b9';
  const textColor = theme?.text?.primary || '#2980b9';
  
  return (
    <Svg width="300" height="300" viewBox="0 0 300 300">
      {/* Outer circle */}
      <Circle cx="150" cy="150" r="145" stroke={strokeColor} strokeWidth="3" fill="none" />
      <Circle cx="150" cy="150" r="130" stroke={strokeColor} strokeWidth="1" fill="none" opacity="0.3" />
      
      {/* Compass markers */}
      <G>
        <Line x1="150" y1="10" x2="150" y2="35" stroke={strokeColor} strokeWidth="3" />
        <Text x="150" y="55" textAnchor="middle" fill={textColor} fontSize="22" fontWeight="bold">N</Text>
      </G>
      <G>
        <Line x1="150" y1="265" x2="150" y2="290" stroke={strokeColor} strokeWidth="3" />
        <Text x="150" y="250" textAnchor="middle" fill={textColor} fontSize="22" fontWeight="bold">S</Text>
      </G>
      <G>
        <Line x1="265" y1="150" x2="290" y2="150" stroke={strokeColor} strokeWidth="3" />
        <Text x="255" y="155" textAnchor="end" fill={textColor} fontSize="22" fontWeight="bold">E</Text>
      </G>
      <G>
        <Line x1="10" y1="150" x2="35" y2="150" stroke={strokeColor} strokeWidth="3" />
        <Text x="45" y="155" textAnchor="start" fill={textColor} fontSize="22" fontWeight="bold">W</Text>
      </G>
      
      {/* Degree markers */}
      {Array.from({ length: 72 }).map((_, i) => {
        const angle = (i * 5 * Math.PI) / 180;
        const isMain = i % 9 === 0;
        const length = isMain ? 20 : 12;
        const outerRadius = 130;
        const innerRadius = outerRadius - length;
        
        return (
          <Line
            key={i}
            x1={150 + Math.sin(angle) * innerRadius}
            y1={150 - Math.cos(angle) * innerRadius}
            x2={150 + Math.sin(angle) * outerRadius}
            y2={150 - Math.cos(angle) * outerRadius}
            stroke={strokeColor}
            strokeWidth={isMain ? 2 : 1}
            opacity={isMain ? 1 : 0.5}
          />
        );
      })}
    </Svg>
  );
};
