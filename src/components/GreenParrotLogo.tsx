import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface GreenParrotLogoProps {
  size?: number;
}

export const GreenParrotLogo: React.FC<GreenParrotLogoProps> = ({ size = 42 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {/* Outer Speech Bubble (WhatsApp Green Gradient) */}
      <Path
        d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
        fill="none"
        stroke="#25D366"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Green Panamanian Parrot Head & Body */}
      <Path
        d="M 68 152 C 60 140 55 125 58 108 C 62 82 72 65 92 65 C 112 65 118 80 115 95 C 112 110 115 135 112 145 C 105 158 85 162 68 152 Z"
        fill="#10B981"
        stroke="#047857"
        strokeWidth="4"
      />

      {/* Parrot Back Head Tuft */}
      <Path d="M 75 66 C 66 60 62 64 68 74 M 72 70 C 65 72 65 78 72 82" fill="none" stroke="#047857" strokeWidth="4" strokeLinecap="round" />

      {/* Wing Curve (Cyan Accent) */}
      <Path
        d="M 62 115 C 65 100 78 95 88 112 C 95 125 88 148 72 150 C 65 142 60 130 62 115 Z"
        fill="#06B6D4"
        stroke="#047857"
        strokeWidth="3.5"
      />

      {/* Cute Big Eye */}
      <Circle cx="98" cy="85" r="9" fill="#FFFFFF" stroke="#047857" strokeWidth="2.5" />
      <Circle cx="96.5" cy="85" r="4.5" fill="#0F172A" />
      <Circle cx="95" cy="83" r="1.5" fill="#FFFFFF" />

      {/* Open Friendly Beak (Gold & Coral Inner Mouth) */}
      <Path
        d="M 112 80 C 128 80 135 94 122 106 C 116 112 108 108 110 100 C 112 92 110 84 112 80 Z"
        fill="#F59E0B"
        stroke="#047857"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <Path
        d="M 112 94 C 122 96 120 106 112 104 Z"
        fill="#EF4444"
      />

      {/* Audio Soundwave Arcs emitting from Beak */}
      <Path d="M 138 78 A 16 16 0 0 1 138 102" fill="none" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
      <Path d="M 152 68 A 28 28 0 0 1 152 112" fill="none" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
      <Path d="M 166 58 A 40 40 0 0 1 166 122" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" opacity={0.8} />
    </Svg>
  );
};
