import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { Path, Circle, Rect, G, Line, Ellipse } from 'react-native-svg';

export type PoquitoState =
  | 'idle'
  | 'sleepy'
  | 'pensive'
  | 'listening'
  | 'fluff'
  | 'talking'
  | 'curious'
  | 'sway'
  | 'talkie-standby'
  | 'talkie-tx'
  | 'talkie-rx';

interface PoquitoAvatarProps {
  state?: PoquitoState;
  size?: number;
}

export const PoquitoAvatar: React.FC<PoquitoAvatarProps> = ({
  state = 'talkie-standby',
  size = 140,
}) => {
  const breatheAnim = useRef(new Animated.Value(0)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const pupilAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const eyeScaleYAnim = useRef(new Animated.Value(1)).current;
  const beakAnim = useRef(new Animated.Value(0)).current;
  const armRaiseAnim = useRef(new Animated.Value(0)).current;
  const antennaVibrateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset base transforms
    breatheAnim.setValue(0);
    tiltAnim.setValue(0);
    pupilAnim.setValue({ x: 0, y: 0 });
    beakAnim.setValue(0);
    armRaiseAnim.setValue(0);
    antennaVibrateAnim.setValue(0);

    let loop: Animated.CompositeAnimation | null = null;

    switch (state) {
      case 'talkie-standby':
      case 'sleepy':
        Animated.spring(eyeScaleYAnim, { toValue: 0.35, useNativeDriver: true }).start();
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(breatheAnim, {
              toValue: 0.5,
              duration: 2250,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(breatheAnim, {
              toValue: 0,
              duration: 2250,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'idle':
        Animated.spring(eyeScaleYAnim, { toValue: 1, useNativeDriver: true }).start();
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(breatheAnim, {
              toValue: 1,
              duration: 1400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(breatheAnim, {
              toValue: 0,
              duration: 1400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'pensive':
        Animated.spring(eyeScaleYAnim, { toValue: 1, useNativeDriver: true }).start();
        Animated.parallel([
          Animated.spring(tiltAnim, { toValue: 13, useNativeDriver: true }),
          Animated.timing(pupilAnim, {
            toValue: { x: 2.5, y: -3 },
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'listening':
        Animated.spring(eyeScaleYAnim, { toValue: 1.08, useNativeDriver: true }).start();
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(tiltAnim, {
              toValue: -5,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(tiltAnim, {
              toValue: -2,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'talkie-rx':
        Animated.spring(eyeScaleYAnim, { toValue: 1.08, useNativeDriver: true }).start();
        loop = Animated.parallel([
          Animated.loop(
            Animated.sequence([
              Animated.timing(tiltAnim, {
                toValue: -5,
                duration: 900,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(tiltAnim, {
                toValue: -2,
                duration: 900,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(antennaVibrateAnim, {
                toValue: 1,
                duration: 280,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(antennaVibrateAnim, {
                toValue: -1,
                duration: 280,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ])
          ),
        ]);
        break;

      case 'fluff':
        Animated.spring(eyeScaleYAnim, { toValue: 1, useNativeDriver: true }).start();
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.5,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'curious':
        Animated.spring(eyeScaleYAnim, { toValue: 1, useNativeDriver: true }).start();
        Animated.parallel([
          Animated.spring(tiltAnim, { toValue: 8, useNativeDriver: true }),
          Animated.spring(pupilAnim, {
            toValue: { x: 2, y: -1 },
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'talkie-tx':
      case 'talking':
        Animated.spring(eyeScaleYAnim, { toValue: 1, useNativeDriver: true }).start();
        loop = Animated.parallel([
          Animated.loop(
            Animated.sequence([
              Animated.timing(beakAnim, {
                toValue: 5,
                duration: 160,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
              Animated.timing(beakAnim, {
                toValue: 0,
                duration: 160,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(armRaiseAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(armRaiseAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ])
          ),
        ]);
        break;

      case 'sway':
        Animated.spring(eyeScaleYAnim, { toValue: 1, useNativeDriver: true }).start();
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(tiltAnim, {
              toValue: -8,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(tiltAnim, {
              toValue: 8,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
    }

    if (loop) loop.start();

    return () => {
      if (loop) loop.stop();
    };
  }, [state]);

  const isTalkie = state.startsWith('talkie-');
  const isFront = state === 'talking' || state === 'sway';
  const ledColor = state === 'talkie-tx' ? '#EF4444' : '#25D366';
  const waveColor = state === 'talkie-tx' ? '#F59E0B' : '#25D366';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [
            {
              rotate: tiltAnim.interpolate({
                inputRange: [-15, 15],
                outputRange: ['-15deg', '15deg'],
              }),
            },
            {
              scaleY: breatheAnim.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [1, 1.02, 1.07],
              }),
            },
          ],
        }}
      >
        {isTalkie ? (
          <Svg viewBox="0 0 180 180" width={size} height={size} fill="none">
            {/* Wooden Perch */}
            <Path d="M 30 152 Q 80 148 135 152" stroke="#B45309" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Claws */}
            <Path d="M 52 142 C 50 149 52 156 56 156 M 60 142 C 58 149 60 156 64 156 M 74 142 C 72 149 74 156 78 156 M 82 142 C 80 149 82 156 86 156" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />
            {/* Body & Anchored Crown Group */}
            <G id="talkie-body-group">
              <Path d="M 40 142 C 30 124 28 104 32 82 C 36 54 54 30 78 30 C 98 30 108 48 106 68 C 103 90 104 118 98 134 C 88 150 62 154 40 142 Z" fill="#10B981" stroke="#047857" strokeWidth="4.5" strokeLinejoin="round" />
              <Path d="M 63 31.4 C 59 24 55 19 49 18" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <Path d="M 73 29.8 C 69 23 65 19 59 17" stroke="#047857" strokeWidth="3" strokeLinecap="round" fill="none" />
            </G>
            {/* Head */}
            <Circle cx="82" cy="54" r="9" fill="#FFF" stroke="#047857" strokeWidth="2.5" />
            <Circle cx="80.5" cy="54" r="4.5" fill="#0F172A" />
            <Circle cx="78.5" cy="52" r="1.8" fill="#FFF" />
            {/* Beak */}
            <Path d="M 96 48 C 112 48 120 62 106 74 C 101 77 94 73 95 67 C 97 61 94 52 96 48 Z" fill="#F59E0B" stroke="#047857" strokeWidth="3.5" strokeLinejoin="round" />
            <Path d="M 96 68 C 102 70 104 74 98 75 C 95 75 94 71 96 68 Z" fill="#D97706" stroke="#047857" strokeWidth="1.8" strokeLinejoin="round" />
            {/* Walkie-Talkie Rig */}
            <G id="talkie-radio-group" transform="translate(-4, 0)">
              {/* Unified Antenna Unit */}
              <G id="talkie-antenna-group">
                <Path d="M 129 45 L 129 70" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
                <Circle cx="129" cy="43" r="3.5" fill="#F59E0B" />
              </G>
              <Rect x="116" y="70" width="28" height="46" rx="6" fill="#1E293B" stroke="#047857" strokeWidth="2.5" />
              <Line x1="122" y1="90" x2="138" y2="90" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
              <Line x1="122" y1="96" x2="138" y2="96" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
              <Line x1="122" y1="102" x2="138" y2="102" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
              {/* Right-side PTT */}
              <Rect x="143" y="76" width="4.5" height="14" rx="2.2" fill={ledColor} />
              {/* Proportionate LED with Bezel */}
              <Circle cx="125" cy="78" r="3.8" fill="#0F172A" />
              <Circle cx="125" cy="78" r="2.8" fill={ledColor} />
              <Rect x="120" y="65" width="7" height="6" rx="1.5" fill="#475569" />
              {/* Audio Waves */}
              {state !== 'talkie-standby' && (
                <G>
                  <Path d="M 135 38 A 10 10 0 0 1 145 48" fill="none" stroke={waveColor} strokeWidth="3" strokeLinecap="round" />
                  <Path d="M 139 32 A 16 16 0 0 1 153 46" fill="none" stroke={waveColor} strokeWidth="3" strokeLinecap="round" />
                  <Path d="M 143 26 A 22 22 0 0 1 161 44" fill="none" stroke={waveColor} strokeWidth="2.5" strokeLinecap="round" opacity={0.75} />
                </G>
              )}
            </G>
            {/* Petite Slender Cyan Wing Gripping Radio */}
            <Path
              d="M 44 94 C 48 80 60 76 72 84 C 84 92 98 94 112 96 C 116 98 116 103 110 105 C 97 108 82 124 60 126 C 49 120 42 108 44 94 Z"
              fill="#06B6D4"
              stroke="#047857"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </Svg>
        ) : isFront ? (
          <Svg viewBox="0 0 160 160" width={size} height={size} fill="none">
            {/* Wooden Perch */}
            <Path d="M 30 138 Q 80 134 130 138" stroke="#B45309" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Claws */}
            <Path d="M 62 127 C 60 133 62 139 66 139 M 70 127 C 68 133 70 139 74 139" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
            <Path d="M 86 127 C 84 133 86 139 90 139 M 94 127 C 92 133 94 139 98 139" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
            {/* Front Body & Crown Feathers */}
            <G id="front-body">
              <Path d="M 80 18 C 96 18 108 30 112 50 C 116 72 118 100 110 118 C 104 130 96 132 80 132 C 64 132 56 130 50 118 C 42 100 44 72 48 50 C 52 30 64 18 80 18 Z" fill="#10B981" stroke="#047857" strokeWidth="4.5" strokeLinejoin="round" />
              <Ellipse cx="80" cy="100" rx="18" ry="22" fill="#34D399" opacity={0.4} />
              {/* Front Crown Feathers */}
              <Path d="M 77 18.5 C 73 12 68 9 63 8" stroke="#047857" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <Path d="M 83 18.5 C 87 12 92 9 97 8" stroke="#047857" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            </G>
            <Path d="M 48 68 C 38 74 34 90 38 104 C 40 110 46 112 50 108 C 48 96 47 80 48 68 Z" fill="#06B6D4" stroke="#047857" strokeWidth="3" strokeLinejoin="round" />
            <Path d="M 112 68 C 122 74 126 90 122 104 C 120 110 114 112 110 108 C 112 96 113 80 112 68 Z" fill="#06B6D4" stroke="#047857" strokeWidth="3" strokeLinejoin="round" />
            <Circle cx="67" cy="56" r="9" fill="#FFF" stroke="#047857" strokeWidth="2.5" />
            <Circle cx="69" cy="56" r="4.5" fill="#0F172A" />
            <Circle cx="67" cy="54" r="1.8" fill="#FFF" />
            <Circle cx="93" cy="56" r="9" fill="#FFF" stroke="#047857" strokeWidth="2.5" />
            <Circle cx="95" cy="56" r="4.5" fill="#0F172A" />
            <Circle cx="93" cy="54" r="1.8" fill="#FFF" />
            <Path d="M 74 72 C 76 81 84 81 86 72 L 83 75 C 81 77 79 77 77 75 Z" fill="#D97706" stroke="#047857" strokeWidth="2" strokeLinejoin="round" />
            <Path d="M 72 65 C 74 61 86 61 88 65 L 83 76 C 82 78 78 78 77 76 Z" fill="#F59E0B" stroke="#047857" strokeWidth="3" strokeLinejoin="round" />
          </Svg>
        ) : (
          <Svg viewBox="0 0 160 160" width={size} height={size} fill="none">
            {/* Wooden Perch */}
            <Path d="M 30 135 Q 70 132 115 135" stroke="#B45309" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Claws */}
            <Path d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />
            {/* Body & Anchored Crown Group */}
            <G id="side-body-group">
              <Path d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z" fill="#10B981" stroke="#047857" strokeWidth="4.5" strokeLinejoin="round" />
              <Path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <Path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" strokeWidth="3" strokeLinecap="round" fill="none" />
            </G>
            {/* Sleek Proportionate Wing */}
            <Path
              d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z"
              fill="#06B6D4"
              stroke="#047857"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Eye (Scalable for wake-up / closed eye) */}
            <Circle cx="76" cy="42" r="9" fill="#FFF" stroke="#047857" strokeWidth="2.5" />
            <Circle cx="74.5" cy="42" r="4.5" fill="#0F172A" />
            <Circle cx="72.5" cy="40" r="1.8" fill="#FFF" />
            {/* Beak */}
            <Path d="M 90 36 C 106 36 114 50 100 62 C 95 65 88 61 89 55 C 91 49 88 40 90 36 Z" fill="#F59E0B" stroke="#047857" strokeWidth="3.5" strokeLinejoin="round" />
            <Path d="M 90 56 C 96 58 98 62 92 63 C 89 63 88 59 90 56 Z" fill="#D97706" stroke="#047857" strokeWidth="1.8" strokeLinejoin="round" />
          </Svg>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
