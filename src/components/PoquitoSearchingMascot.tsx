import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

export type MascotMood = 'searching' | 'sad' | 'success';

interface PoquitoSearchingMascotProps {
  size?: number;
  mood?: MascotMood;
}

/**
 * PoquitoSearchingMascot
 * 
 * Built strictly with the official Canonical Poquito vector model:
 * - Emerald Green Body (#10B981, #047857)
 * - Signature Cyan Wing (#06B6D4)
 * - Hooked Golden Beak (#F59E0B, #D97706)
 * - Two Rooted Crown Feathers
 * - Wooden Perch (#B45309) & Golden Claws (#F59E0B)
 * 
 * Animations:
 * - 'searching': Side-to-side leg wiggle (alternating claw weight shift) + expressive looking-around eye scan & head tilt.
 * - 'sad': Crest droop, sheepish downward eye glance, cyan wing droop, slight slouch.
 * - 'success': Joyful bouncy perch jump, fluttering cyan wing, radiating soundwaves!
 */
export const PoquitoSearchingMascot: React.FC<PoquitoSearchingMascotProps> = ({
  size = 140,
  mood = 'searching',
}) => {
  // Animation values
  const wiggleTilt = useRef(new Animated.Value(0)).current;      // Side-to-side body sway
  const wiggleX = useRef(new Animated.Value(0)).current;         // Left-right translation
  const wiggleY = useRef(new Animated.Value(0)).current;         // Bobbing / jumping
  const leftClawY = useRef(new Animated.Value(0)).current;       // Left foot step up/down
  const rightClawY = useRef(new Animated.Value(0)).current;      // Right foot step up/down
  
  const pupilX = useRef(new Animated.Value(0)).current;          // Eye looking Left / Right
  const pupilY = useRef(new Animated.Value(0)).current;          // Eye looking Up / Down
  const eyeBlink = useRef(new Animated.Value(1)).current;         // Eye open / blink scale
  const crestTilt = useRef(new Animated.Value(0)).current;       // Crown feather angle
  const wingTilt = useRef(new Animated.Value(0)).current;        // Wing flap / shrug
  const soundwaveOpacity = useRef(new Animated.Value(0)).current;// Soundwaves for success

  useEffect(() => {
    let bodyLoop: Animated.CompositeAnimation | null = null;
    let eyeLoop: Animated.CompositeAnimation | null = null;
    let waveLoop: Animated.CompositeAnimation | null = null;

    if (mood === 'searching') {
      soundwaveOpacity.setValue(0);

      // 1. Wiggling from leg to leg (alternating left/right foot weight shift)
      bodyLoop = Animated.loop(
        Animated.sequence([
          // Step on Left Foot (Tilt left, lift right claw)
          Animated.parallel([
            Animated.timing(wiggleTilt, { toValue: -6, duration: 280, useNativeDriver: true }),
            Animated.timing(wiggleX, { toValue: -2.5, duration: 280, useNativeDriver: true }),
            Animated.timing(wiggleY, { toValue: -2, duration: 280, useNativeDriver: true }),
            Animated.timing(leftClawY, { toValue: 1, duration: 280, useNativeDriver: true }),
            Animated.timing(rightClawY, { toValue: -3.5, duration: 280, useNativeDriver: true }),
            Animated.timing(crestTilt, { toValue: -3, duration: 280, useNativeDriver: true }),
            Animated.timing(wingTilt, { toValue: 2, duration: 280, useNativeDriver: true }),
          ]),
          // Pass center
          Animated.parallel([
            Animated.timing(wiggleTilt, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(wiggleX, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(wiggleY, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(leftClawY, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(rightClawY, { toValue: 0, duration: 160, useNativeDriver: true }),
          ]),
          // Step on Right Foot (Tilt right, lift left claw)
          Animated.parallel([
            Animated.timing(wiggleTilt, { toValue: 6, duration: 280, useNativeDriver: true }),
            Animated.timing(wiggleX, { toValue: 2.5, duration: 280, useNativeDriver: true }),
            Animated.timing(wiggleY, { toValue: -2, duration: 280, useNativeDriver: true }),
            Animated.timing(leftClawY, { toValue: -3.5, duration: 280, useNativeDriver: true }),
            Animated.timing(rightClawY, { toValue: 1, duration: 280, useNativeDriver: true }),
            Animated.timing(crestTilt, { toValue: 3, duration: 280, useNativeDriver: true }),
            Animated.timing(wingTilt, { toValue: -2, duration: 280, useNativeDriver: true }),
          ]),
          // Pass center
          Animated.parallel([
            Animated.timing(wiggleTilt, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(wiggleX, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(wiggleY, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(leftClawY, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(rightClawY, { toValue: 0, duration: 160, useNativeDriver: true }),
          ]),
        ])
      );

      // 2. Eye Look-Around Sequence: Left -> Center -> Right -> Up -> Center (Safely confined inside eyeball)
      eyeLoop = Animated.loop(
        Animated.sequence([
          // Look Left (Searching behind)
          Animated.parallel([
            Animated.timing(pupilX, { toValue: -2.2, duration: 250, useNativeDriver: true }),
            Animated.timing(pupilY, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]),
          Animated.delay(800),
          // Glance back center
          Animated.parallel([
            Animated.timing(pupilX, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(pupilY, { toValue: 0, duration: 180, useNativeDriver: true }),
          ]),
          Animated.delay(300),
          // Look Right (Searching forward)
          Animated.parallel([
            Animated.timing(pupilX, { toValue: 2.2, duration: 250, useNativeDriver: true }),
            Animated.timing(pupilY, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]),
          Animated.delay(800),
          // Glance Up inquisitively
          Animated.parallel([
            Animated.timing(pupilX, { toValue: 0.5, duration: 220, useNativeDriver: true }),
            Animated.timing(pupilY, { toValue: -1.8, duration: 220, useNativeDriver: true }),
          ]),
          Animated.delay(600),
          // Center pupil
          Animated.parallel([
            Animated.timing(pupilX, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(pupilY, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]),
          Animated.delay(800),
        ])
      );

      bodyLoop.start();
      eyeLoop.start();
    } else if (mood === 'sad') {
      soundwaveOpacity.setValue(0);

      // Sad State: Slump down, feathers flat, looking down sheepishly
      Animated.parallel([
        Animated.spring(wiggleTilt, { toValue: -3, friction: 6, useNativeDriver: true }),
        Animated.spring(wiggleX, { toValue: 0, friction: 6, useNativeDriver: true }),
        Animated.spring(wiggleY, { toValue: 4, friction: 6, useNativeDriver: true }),
        Animated.spring(leftClawY, { toValue: 0, friction: 6, useNativeDriver: true }),
        Animated.spring(rightClawY, { toValue: 0, friction: 6, useNativeDriver: true }),
        Animated.spring(pupilX, { toValue: 0.5, friction: 6, useNativeDriver: true }),
        Animated.spring(pupilY, { toValue: 3, friction: 6, useNativeDriver: true }), // Looking down
        Animated.spring(eyeBlink, { toValue: 0.7, friction: 6, useNativeDriver: true }), // Half-closed sad eye
        Animated.spring(crestTilt, { toValue: -15, friction: 5, useNativeDriver: true }), // Drooped crown feathers
        Animated.spring(wingTilt, { toValue: 6, friction: 6, useNativeDriver: true }), // Drooped wing
      ]).start();

      // Gentle sad breathing loop
      bodyLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(wiggleY, { toValue: 6, duration: 900, useNativeDriver: true }),
          Animated.timing(wiggleY, { toValue: 3.5, duration: 900, useNativeDriver: true }),
        ])
      );
      bodyLoop.start();
    } else if (mood === 'success') {
      // Victory State: Bouncy happy jump, wide sparkling eye, radiating soundwaves
      Animated.parallel([
        Animated.spring(pupilX, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.spring(pupilY, { toValue: -0.5, friction: 5, useNativeDriver: true }),
        Animated.spring(eyeBlink, { toValue: 1.15, friction: 5, useNativeDriver: true }),
        Animated.spring(crestTilt, { toValue: 5, friction: 5, useNativeDriver: true }),
      ]).start();

      bodyLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(wiggleY, { toValue: -12, duration: 180, useNativeDriver: true }),
            Animated.timing(wiggleTilt, { toValue: 4, duration: 180, useNativeDriver: true }),
            Animated.timing(wingTilt, { toValue: -10, duration: 180, useNativeDriver: true }),
            Animated.timing(leftClawY, { toValue: -4, duration: 180, useNativeDriver: true }),
            Animated.timing(rightClawY, { toValue: -4, duration: 180, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(wiggleY, { toValue: 1, duration: 160, useNativeDriver: true }),
            Animated.timing(wiggleTilt, { toValue: -3, duration: 160, useNativeDriver: true }),
            Animated.timing(wingTilt, { toValue: 3, duration: 160, useNativeDriver: true }),
            Animated.timing(leftClawY, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(rightClawY, { toValue: 0, duration: 160, useNativeDriver: true }),
          ]),
        ])
      );

      waveLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(soundwaveOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(soundwaveOpacity, { toValue: 0.2, duration: 350, useNativeDriver: true }),
        ])
      );

      bodyLoop.start();
      waveLoop.start();
    }

    return () => {
      if (bodyLoop) bodyLoop.stop();
      if (eyeLoop) eyeLoop.stop();
      if (waveLoop) waveLoop.stop();
    };
  }, [mood]);

  const tiltInterpolation = wiggleTilt.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  const crestInterpolation = crestTilt.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  const wingInterpolation = wingTilt.interpolate({
    inputRange: [-15, 15],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 1. Base Layer: Perch Branch */}
      <View style={StyleSheet.absoluteFill}>
        <Svg viewBox="0 0 160 160" width={size} height={size}>
          <Path
            d="M 22 135 Q 70 132 138 135"
            stroke="#B45309"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* 2. Left Claws (Animated stepping) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateY: leftClawY }] },
        ]}
      >
        <Svg viewBox="0 0 160 160" width={size} height={size}>
          <Path
            d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138"
            stroke="#F59E0B"
            strokeWidth={4.5}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* 3. Right Claws (Animated stepping) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateY: rightClawY }] },
        ]}
      >
        <Svg viewBox="0 0 160 160" width={size} height={size}>
          <Path
            d="M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138"
            stroke="#F59E0B"
            strokeWidth={4.5}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* 4. Animated Mascot Body Group */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              { translateX: wiggleX },
              { translateY: wiggleY },
              { rotate: tiltInterpolation },
            ],
          },
        ]}
      >
        {/* Layer 4A: Crown Feathers (Rotates / Droops on head) */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ rotate: crestInterpolation }] },
          ]}
        >
          <Svg viewBox="0 0 160 160" width={size} height={size}>
            <Path
              d="M 58 19.2 C 55 13 52 9 47 8"
              stroke="#047857"
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M 67 17.8 C 64 12 61 9 56 7"
              stroke="#047857"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Layer 4B: Emerald Body & Hooked Golden Beak */}
        <View style={StyleSheet.absoluteFill}>
          <Svg viewBox="0 0 160 160" width={size} height={size}>
            {/* Canonical Emerald Body */}
            <Path
              d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z"
              fill="#10B981"
              stroke="#047857"
              strokeWidth={4.5}
              strokeLinejoin="round"
            />

            {/* Eye White Base */}
            <Circle cx={76} cy={42} r={9} fill="#FFFFFF" stroke="#047857" strokeWidth={2.5} />

            {/* Canonical Hooked Golden Beak */}
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
          </Svg>

          {/* Expressive Looking-Around Pupil Anchored Strictly to Eyeball Socket */}
          <Animated.View
            style={{
              position: 'absolute',
              left: (76 - 9) * (size / 160),
              top: (42 - 9) * (size / 160),
              width: 18 * (size / 160),
              height: 18 * (size / 160),
              transform: [
                { translateX: pupilX },
                { translateY: pupilY },
              ],
            }}
            pointerEvents="none"
          >
            <Svg viewBox="0 0 18 18" width={18 * (size / 160)} height={18 * (size / 160)} fill="none">
              <Circle cx="7.5" cy="9" r="4.5" fill="#0F172A" />
              <Circle cx="5.5" cy="7" r="1.8" fill="#FFFFFF" />
            </Svg>
          </Animated.View>
        </View>

        {/* Layer 4C: Signature Cyan Wing (Flutters & Shrugs) */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ rotate: wingInterpolation }] },
          ]}
        >
          <Svg viewBox="0 0 160 160" width={size} height={size}>
            <Path
              d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z"
              fill="#06B6D4"
              stroke="#047857"
              strokeWidth={3.5}
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>

        {/* Layer 4E: Radiating Golden Soundwaves (Active on Success) */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: soundwaveOpacity },
          ]}
        >
          <Svg viewBox="0 0 160 160" width={size} height={size}>
            <Path d="M 112 43 A 11 11 0 0 1 112 60" fill="none" stroke="#F59E0B" strokeWidth={3.5} strokeLinecap="round" />
            <Path d="M 120 37 A 17 17 0 0 1 120 66" fill="none" stroke="#F59E0B" strokeWidth={3.5} strokeLinecap="round" />
            <Path d="M 128 31 A 23 23 0 0 1 128 72" fill="none" stroke="#F59E0B" strokeWidth={3.5} strokeLinecap="round" opacity={0.8} />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
  },
});
