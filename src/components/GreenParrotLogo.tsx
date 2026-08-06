import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface GreenParrotLogoProps {
  size?: number;
}

export const GreenParrotLogo: React.FC<GreenParrotLogoProps> = ({ size = 42 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {/* Outer Speech Bubble (WhatsApp Green - Kept exactly as requested) */}
      <Path
        d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
        fill="none"
        stroke="#25D366"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Green Panamanian Parrot Head & Body (Smooth Rounded Head, No Ears) */}
      <Path
        d="M 62 152 C 55 138 52 122 55 105 C 58 78 72 55 92 55 C 108 55 116 70 114 85 C 112 102 114 128 110 142 C 102 155 82 160 62 152 Z"
        fill="#10B981"
        stroke="#047857"
        strokeWidth="4.5"
      />

      {/* Wing Curve (Cyan Accent) */}
      <Path
        d="M 58 112 C 62 98 76 92 86 108 C 92 122 86 145 70 148 C 62 140 57 126 58 112 Z"
        fill="#06B6D4"
        stroke="#047857"
        strokeWidth="3.5"
      />

      {/* Cute Big Eye */}
      <Circle cx="95" cy="74" r="8" fill="#FFFFFF" stroke="#047857" strokeWidth="2.5" />
      <Circle cx="93.5" cy="74" r="4" fill="#0F172A" />
      <Circle cx="92" cy="72" r="1.5" fill="#FFFFFF" />

      {/* Open Friendly Beak (Gold & Coral Inner Mouth) */}
      <Path
        d="M 110 70 C 124 70 130 82 118 94 C 113 98 106 94 108 88 C 110 82 108 74 110 70 Z"
        fill="#F59E0B"
        stroke="#047857"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <Path
        d="M 110 84 C 118 85 116 93 110 91 Z"
        fill="#EF4444"
      />

      {/* Audio Soundwave Arcs (Sized and padded so they NEVER touch the green circle border) */}
      <Path d="M 132 72 A 12 12 0 0 1 132 92" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />
      <Path d="M 143 64 A 20 20 0 0 1 143 100" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />
      <Path d="M 154 57 A 28 28 0 0 1 154 107" fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" opacity={0.8} />
    </Svg>
  );
};
