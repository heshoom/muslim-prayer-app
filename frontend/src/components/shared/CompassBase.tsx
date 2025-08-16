import React from 'react';
import Svg, { Circle, Line, G, Text } from 'react-native-svg';

interface CompassBaseProps {
  theme?: any;
}

export const CompassBase: React.FC<CompassBaseProps> = ({ theme }) => {
  const strokeColor = theme?.primary || '#2980b9';
  const textColor = theme?.text?.primary || '#2980b9';
  const secondaryColor = theme?.text?.secondary || '#7f8c8d';
  
  return (
    <Svg width="300" height="300" viewBox="0 0 300 300">
      {/* Outer circles with better styling */}
      <Circle cx="150" cy="150" r="148" stroke={strokeColor} strokeWidth="4" fill="none" opacity="0.8" />
      <Circle cx="150" cy="150" r="135" stroke={strokeColor} strokeWidth="2" fill="none" opacity="0.4" />
      <Circle cx="150" cy="150" r="120" stroke={secondaryColor} strokeWidth="1" fill="none" opacity="0.2" />
      
      {/* Cardinal directions with enhanced styling */}
      <G>
        <Line x1="150" y1="8" x2="150" y2="30" stroke={strokeColor} strokeWidth="4" />
        <Text x="150" y="50" textAnchor="middle" fill={textColor} fontSize="24" fontWeight="bold">N</Text>
      </G>
      <G>
        <Line x1="150" y1="270" x2="150" y2="292" stroke={strokeColor} strokeWidth="4" />
        <Text x="150" y="260" textAnchor="middle" fill={textColor} fontSize="24" fontWeight="bold">S</Text>
      </G>
      <G>
        <Line x1="270" y1="150" x2="292" y2="150" stroke={strokeColor} strokeWidth="4" />
        <Text x="260" y="158" textAnchor="end" fill={textColor} fontSize="24" fontWeight="bold">E</Text>
      </G>
      <G>
        <Line x1="8" y1="150" x2="30" y2="150" stroke={strokeColor} strokeWidth="4" />
        <Text x="40" y="158" textAnchor="start" fill={textColor} fontSize="24" fontWeight="bold">W</Text>
      </G>
      
      {/* Degree markers with improved visibility */}
      {Array.from({ length: 72 }).map((_, i) => {
        const angle = (i * 5 * Math.PI) / 180;
        const isMain = i % 18 === 0; // Every 90 degrees
        const isMajor = i % 6 === 0; // Every 30 degrees
        const isMinor = i % 2 === 0; // Every 10 degrees
        
        let length = 8;
        let strokeWidth = 1;
        let opacity = 0.3;
        
        if (isMain) {
          length = 25;
          strokeWidth = 3;
          opacity = 1;
        } else if (isMajor) {
          length = 18;
          strokeWidth = 2;
          opacity = 0.7;
        } else if (isMinor) {
          length = 12;
          strokeWidth = 1.5;
          opacity = 0.5;
        }
        
        const outerRadius = 135;
        const innerRadius = outerRadius - length;
        
        return (
          <Line
            key={i}
            x1={150 + Math.sin(angle) * innerRadius}
            y1={150 - Math.cos(angle) * innerRadius}
            x2={150 + Math.sin(angle) * outerRadius}
            y2={150 - Math.cos(angle) * outerRadius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        );
      })}
      
      {/* Degree numbers for major directions */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((degree, index) => {
        const angle = (degree * Math.PI) / 180;
        const radius = 110;
        const x = 150 + Math.sin(angle) * radius;
        const y = 150 - Math.cos(angle) * radius + 6; // Offset for text centering
        
        return (
          <Text
            key={degree}
            x={x}
            y={y}
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="14"
            fontWeight="500"
          >
            {degree}°
          </Text>
        );
      })}
    </Svg>
  );
};
