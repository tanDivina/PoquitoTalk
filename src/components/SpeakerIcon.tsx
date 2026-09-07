import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SpeakerIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Crisp, solid-filled vector SVG Speaker / Audio icon.
 * Features a solid speaker chassis and clean curved acoustic waves.
 * Adheres strictly to Rule 5: Crisp Vector SVGs only — no cartoonish emojis/icons.
 */
export const SpeakerIcon: React.FC<SpeakerIconProps> = ({
  size = 18,
  color = '#0F172A',
  style,
}) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        {/* Solid Speaker Body */}
        <Path
          d="M11.25 3.653a1.25 1.25 0 00-1.428.188L5.437 8H2.5A1.5 1.5 0 001 9.5v5A1.5 1.5 0 002.5 16h2.937l4.385 4.159A1.25 1.25 0 0012 19.25V4.75a1.25 1.25 0 00-.75-1.097z"
          fill={color}
        />
        {/* Sound Waves */}
        <Path
          d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};
