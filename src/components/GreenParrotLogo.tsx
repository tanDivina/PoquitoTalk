import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface GreenParrotLogoProps {
  size?: number;
}

export const GreenParrotLogo: React.FC<GreenParrotLogoProps> = ({ size = 42 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {/* Outer Speech Bubble (WhatsApp Green) */}
      <Path
        d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
        fill="none"
        stroke="#25D366"
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Canonical Studio Parrot Group (Scaled & centered within speech bubble with zero overlap) */}
      <G transform="translate(43, 39) scale(0.75)">
        {/* 1. Wooden Perch Branch */}
        <Path d="M 30 135 Q 70 132 115 135" stroke="#B45309" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />

        {/* 2. Golden Parrot Claws */}
        <Path
          d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138"
          stroke="#F59E0B"
          strokeWidth={4.5}
          strokeLinecap="round"
        />

        {/* 3. Body & Anchored 2 Crown Feathers (Zero Gap, seamless skull connection) */}
        <G id="body-group">
          <Path
            d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z"
            fill="#10B981"
            stroke="#047857"
            strokeWidth={4.5}
            strokeLinejoin="round"
          />
          {/* Two Feathers seamlessly rooted in head */}
          <Path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <Path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" strokeWidth={3} strokeLinecap="round" fill="none" />
        </G>

        {/* 4. Sleek Cyan Wing */}
        <Path
          d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z"
          fill="#06B6D4"
          stroke="#047857"
          strokeWidth={3.5}
          strokeLinejoin="round"
        />

        {/* 5. Head Group (Big Eye & Golden Beak) */}
        <G id="head-group">
          <Circle cx={76} cy={42} r={9} fill="#FFFFFF" stroke="#047857" strokeWidth={2.5} />
          <Circle cx={74.5} cy={42} r={4.5} fill="#0F172A" />
          <Circle cx={72.5} cy={40} r={1.8} fill="#FFFFFF" />

          {/* Golden Beak */}
          <Path
            d="M 90 36 C 106 36 114 50 100 62 C 95 65 88 61 89 55 C 91 49 88 40 90 36 Z"
            fill="#F59E0B"
            stroke="#047857"
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
          <Path
            d="M 90 56 C 96 58 98 62 92 63 C 89 63 88 59 90 56 Z"
            fill="#D97706"
            stroke="#047857"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </G>

        {/* 6. Compact Proportionate Soundwave Arcs (Generous breathing room) */}
        <Path d="M 112 43 A 11 11 0 0 1 112 60" fill="none" stroke="#F59E0B" strokeWidth={4} strokeLinecap="round" />
        <Path d="M 121 37 A 17 17 0 0 1 121 66" fill="none" stroke="#F59E0B" strokeWidth={4} strokeLinecap="round" />
        <Path d="M 130 31 A 23 23 0 0 1 130 72" fill="none" stroke="#F59E0B" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      </G>
    </Svg>
  );
};
