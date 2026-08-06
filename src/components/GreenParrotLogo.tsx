import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface GreenParrotLogoProps {
  size?: number;
}

export const GreenParrotLogo: React.FC<GreenParrotLogoProps> = ({ size = 42 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Defs>
        <LinearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#06B6D4" />
        </LinearGradient>
        <LinearGradient id="parrotGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#34D399" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
      </Defs>

      {/* Transparent Outer Speech Bubble Ring */}
      <Path
        d="M 100 15 A 80 80 0 1 0 162 148 L 175 180 L 142 165 A 80 80 0 0 0 100 15 Z"
        fill="none"
        stroke="url(#bubbleGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Green Panamanian Parrot Body */}
      <Path
        d="M 85 45 C 105 45 118 60 115 80 C 112 95 105 110 100 135 C 95 160 82 175 62 172 C 72 152 75 130 70 110 C 65 95 62 82 68 68 C 72 58 78 45 85 45 Z"
        fill="url(#parrotGrad)"
        stroke="#047857"
        strokeWidth="3"
      />

      {/* Parrot Crest */}
      <Path d="M 82 45 C 80 32 90 28 92 38 C 96 30 106 32 100 45 Z" fill="#34D399" />

      {/* Wing Layers (Green, Yellow, Red) */}
      <Path d="M 75 80 C 95 85 102 110 92 145 C 82 125 72 105 75 80 Z" fill="#059669" />
      <Path d="M 78 95 C 92 100 96 118 90 135 C 82 120 76 108 78 95 Z" fill="#FBBF24" />
      <Path d="M 80 110 C 90 115 92 125 88 135 C 82 125 78 118 80 110 Z" fill="#EF4444" />

      {/* Parrot Beak */}
      <Path d="M 112 65 C 128 65 132 78 120 86 C 114 83 110 75 112 65 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      <Path d="M 112 76 C 120 77 122 83 116 85 Z" fill="#B45309" />

      {/* Eye */}
      <Circle cx="100" cy="62" r="5" fill="#FFFFFF" />
      <Circle cx="101" cy="62" r="2.5" fill="#065F46" />

      {/* Audio Soundwaves emitting from Beak */}
      <Path d="M 135 60 A 20 20 0 0 1 135 90" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
      <Path d="M 148 50 A 35 35 0 0 1 148 100" fill="none" stroke="#34D399" strokeWidth="4.5" strokeLinecap="round" />
      <Path d="M 160 40 A 50 50 0 0 1 160 110" fill="none" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" opacity={0.8} />
    </Svg>
  );
};
