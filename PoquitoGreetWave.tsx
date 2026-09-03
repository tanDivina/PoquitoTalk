import React from 'react';

export interface PoquitoGreetWaveProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  speedSec?: number;
  interactive?: boolean;
}

export const PoquitoGreetWave: React.FC<PoquitoGreetWaveProps> = ({
  size = 160,
  className = '',
  style = {},
  speedSec = 1.08,
  interactive = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${interactive ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''} ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <style>{`
          @keyframes wingWaveLeft {
            0% { transform: rotate(0deg) translate(0px, 0px); }
            25% { transform: rotate(-18deg) translate(-2px, -3px); }
            65% { transform: rotate(-44deg) translate(-5px, -8px); }
            100% { transform: rotate(-58deg) translate(-7px, -12px); }
          }
          @keyframes wingWaveRight {
            0% { transform: rotate(0deg) translate(0px, 0px); }
            25% { transform: rotate(18deg) translate(2px, -3px); }
            65% { transform: rotate(44deg) translate(5px, -8px); }
            100% { transform: rotate(58deg) translate(7px, -12px); }
          }
          @keyframes bodyJoyBounce {
            0% { transform: translateY(0px) scale(1, 1); }
            35% { transform: translateY(2px) scale(1.02, 0.98); }
            75% { transform: translateY(-3px) scale(0.99, 1.01); }
            100% { transform: translateY(-4px) scale(1, 1.02); }
          }
          @keyframes crestWobble {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(-5deg); }
            100% { transform: rotate(6deg); }
          }
          @keyframes eyeBlink {
            0%, 92%, 100% { transform: scaleY(1); }
            96% { transform: scaleY(0.1); }
          }
          .anim-wing-l {
            transform-origin: 48px 68px;
            animation: wingWaveLeft ${speedSec}s ease-in-out infinite alternate;
          }
          .anim-wing-r {
            transform-origin: 112px 68px;
            animation: wingWaveRight ${speedSec}s ease-in-out infinite alternate;
          }
          .anim-body-grp {
            transform-origin: 80px 132px;
            animation: bodyJoyBounce ${speedSec}s ease-in-out infinite alternate;
          }
          .anim-crest-hair {
            transform-origin: 80px 18px;
            animation: crestWobble ${speedSec}s ease-in-out infinite alternate;
          }
          .anim-eye-blink {
            transform-origin: center;
            animation: eyeBlink 3.5s infinite;
          }
        `}</style>

        {/* 1. Wooden Perch */}
        <g id="front-perch">
          <path d="M 26 138 Q 80 134 134 138" stroke="#B45309" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* 2. Claws */}
        <g id="front-claws">
          <path d="M 62 127 C 60 133 62 139 66 139 M 70 127 C 68 133 70 139 74 139" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <path d="M 86 127 C 84 133 86 139 90 139 M 94 127 C 92 133 94 139 98 139" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Bouncing Mascot */}
        <g className="anim-body-grp">
          {/* 3. Body */}
          <path
            d="M 80 18 C 96 18 108 30 112 50 C 116 72 118 100 110 118 C 104 130 96 132 80 132 C 64 132 56 130 50 118 C 42 100 44 72 48 50 C 52 30 64 18 80 18 Z"
            fill="#10B981"
            stroke="#047857"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <ellipse cx="80" cy="100" rx="18" ry="22" fill="#34D399" opacity="0.4" />

          {/* Crest Feathers */}
          <g className="anim-crest-hair">
            <path d="M 77 18.5 C 73 12 68 9 63 8" stroke="#047857" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M 83 18.5 C 87 12 92 9 97 8" stroke="#047857" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          </g>

          {/* 4. Left Wing (Frame 5-17 Wave) */}
          <g className="anim-wing-l">
            <path
              d="M 48 68 C 34 72 26 86 30 102 C 32 108 40 110 46 106 C 47 94 47 80 48 68 Z"
              fill="#06B6D4"
              stroke="#047857"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M 36 86 C 33 94 36 102 42 104" stroke="#0891B2" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>

          {/* 5. Right Wing (Frame 5-17 Wave) */}
          <g className="anim-wing-r">
            <path
              d="M 112 68 C 126 72 134 86 130 102 C 128 108 120 110 114 106 C 113 94 113 80 112 68 Z"
              fill="#06B6D4"
              stroke="#047857"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M 124 86 C 127 94 124 102 118 104" stroke="#0891B2" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>

          {/* 6. Face */}
          <g id="front-head">
            <g id="left-eye">
              <circle cx="67" cy="56" r="9.5" fill="#FFFFFF" stroke="#047857" strokeWidth="2.5" />
              <circle cx="68.5" cy="56" r="4.8" fill="#0F172A" />
              <circle cx="66.5" cy="53.8" r="2" fill="#FFFFFF" />
            </g>

            <g id="right-eye">
              <circle cx="93" cy="56" r="9.5" fill="#FFFFFF" stroke="#047857" strokeWidth="2.5" />
              <circle cx="94.5" cy="56" r="4.8" fill="#0F172A" />
              <circle cx="92.5" cy="53.8" r="2" fill="#FFFFFF" />
            </g>

            {/* Beak */}
            <path d="M 74 72 C 76 81 84 81 86 72 L 83 75 C 81 77 79 77 77 75 Z" fill="#D97706" stroke="#047857" strokeWidth="2" strokeLinejoin="round" />
            <path
              d="M 72 65 C 74 61 86 61 88 65 L 83 76 C 82 78 78 78 77 76 Z"
              fill="#F59E0B"
              stroke="#047857"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default PoquitoGreetWave;
