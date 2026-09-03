import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors } from '../theme/colors';

interface WalkieTalkieIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  strokeWidth?: number;
}

/**
 * Crisp, monoline vector Walkie-Talkie transceiver icon.
 * Adheres strictly to Rule 5: Crisp Vector SVGs only — no cartoonish emojis/icons.
 */
export const WalkieTalkieIcon: React.FC<WalkieTalkieIconProps> = ({
  size = 20,
  color = '#1A1208',
  style,
  strokeWidth = 1.9,
}) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        {/* Antenna (elongated primary antenna, single antenna only) */}
        <Path
          d="M7.5 7V1.2"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Main Transceiver Chassis */}
        <Rect
          x="4.5"
          y="7"
          width="15"
          height="15"
          rx="3.5"
          stroke={color}
          strokeWidth={strokeWidth}
        />
        {/* Side PTT (Push-To-Talk) Key */}
        <Path
          d="M2.5 10.5V14"
          stroke={color}
          strokeWidth={strokeWidth + 0.3}
          strokeLinecap="round"
        />
        {/* Transceiver Screen */}
        <Rect
          x="7.5"
          y="9.5"
          width="9"
          height="3"
          rx="1"
          stroke={color}
          strokeWidth={strokeWidth - 0.3}
        />
        {/* Speaker Slits */}
        <Path
          d="M8.5 15.5H15.5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M9.5 18H14.5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};
