import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, G, Text } from 'react-native-svg';

export const CompassBase = () => (
  <Svg width="300" height="300" viewBox="0 0 300 300">
    {/* Outer circle */}
    <Circle cx="150" cy="150" r="145" stroke="#2980b9" strokeWidth="2" fill="none" />
    <Circle cx="150" cy="150" r="140" stroke="#2980b9" strokeWidth="1" fill="none" />
    
    {/* Compass markers */}
    <G>
      <Line x1="150" y1="10" x2="150" y2="30" stroke="#2980b9" strokeWidth="2" />
      <Text x="150" y="45" textAnchor="middle" fill="#2980b9" fontSize="20">N</Text>
    </G>
    <G>
      <Line x1="150" y1="270" x2="150" y2="290" stroke="#2980b9" strokeWidth="2" />
      <Text x="150" y="265" textAnchor="middle" fill="#2980b9" fontSize="20">S</Text>
    </G>
    <G>
      <Line x1="270" y1="150" x2="290" y2="150" stroke="#2980b9" strokeWidth="2" />
      <Text x="265" y="155" textAnchor="end" fill="#2980b9" fontSize="20">E</Text>
    </G>
    <G>
      <Line x1="10" y1="150" x2="30" y2="150" stroke="#2980b9" strokeWidth="2" />
      <Text x="35" y="155" textAnchor="start" fill="#2980b9" fontSize="20">W</Text>
    </G>
    
    {/* Degree markers */}
    {Array.from({ length: 72 }).map((_, i) => {
      const angle = (i * 5 * Math.PI) / 180;
      const isMain = i % 9 === 0;
      const length = isMain ? 15 : 10;
      const outerRadius = 140;
      const innerRadius = outerRadius - length;
      
      return (
        <Line
          key={i}
          x1={150 + Math.sin(angle) * innerRadius}
          y1={150 - Math.cos(angle) * innerRadius}
          x2={150 + Math.sin(angle) * outerRadius}
          y2={150 - Math.cos(angle) * outerRadius}
          stroke="#2980b9"
          strokeWidth={isMain ? 2 : 1}
        />
      );
    })}
  </Svg>
);
