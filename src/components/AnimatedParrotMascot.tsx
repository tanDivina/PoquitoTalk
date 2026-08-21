import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  Vibration,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Colors } from '../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const PANAMA_QUICK_TIPS = [
  '¡Qué xopa! En Bocas siempre saluda con "¡Buenas!" antes de pedir algo.',
  '¿Sabías? "El pavo" es el ayudante que cobra el pasaje en la chiva o bus.',
  'Consejo: Para el camión cisterna, di "tanque de reserva de agua".',
  '¡Tranquilo! Tu nota de voz suena 100% natural y respetuosa.',
  '¿Sin luz? Busca el número NIS en la esquina superior del recibo de Naturgy.',
  'En Bocas, los capitanes de lancha usan WhatsApp para coordinar traslados.',
];

interface AnimatedParrotMascotProps {
  size?: number;
  isAnimating?: boolean;
  isDancing?: boolean;
  showSpeechBubble?: boolean;
  bubblePlacement?: 'auto' | 'top' | 'bottom' | 'inline';
  customTip?: string;
  onPress?: () => void;
}

export const AnimatedParrotMascot: React.FC<AnimatedParrotMascotProps> = ({
  size = 56,
  isAnimating = true,
  isDancing = false,
  showSpeechBubble = false,
  bubblePlacement = 'auto',
  customTip,
  onPress,
}) => {
  const { width: screenWidth } = useWindowDimensions();

  // 1. Gentle Floating Bob / Upbeat Happy Dance & Soundwave Radiating Animations
  const bobAnim = useRef(new Animated.Value(0)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  // Soundwave Stagger Values
  const wave1 = useRef(new Animated.Value(0.2)).current;
  const wave2 = useRef(new Animated.Value(0.2)).current;
  const wave3 = useRef(new Animated.Value(0.2)).current;

  const [activeTip, setActiveTip] = useState<string>(
    customTip || PANAMA_QUICK_TIPS[0]
  );
  const [bubbleVisible, setBubbleVisible] = useState<boolean>(showSpeechBubble);

  // Update tip when prop changes
  useEffect(() => {
    if (customTip) {
      setActiveTip(customTip);
    }
  }, [customTip]);

  // Sync bubble visibility prop
  useEffect(() => {
    setBubbleVisible(showSpeechBubble);
  }, [showSpeechBubble]);

  // Inject web keyframe animation styles on web for smooth soundwaves
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'poquito-mascot-web-animations';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          @keyframes webSoundwavePulse {
            0%, 100% { opacity: 0.2; transform: scale(0.96); }
            50% { opacity: 0.95; transform: scale(1.04); }
          }
          .web-mascot-wave-1 {
            transform-origin: 100px 95px;
            animation: webSoundwavePulse 1.8s ease-in-out infinite;
          }
          .web-mascot-wave-2 {
            transform-origin: 100px 95px;
            animation: webSoundwavePulse 1.8s ease-in-out infinite 0.2s;
          }
          .web-mascot-wave-3 {
            transform-origin: 100px 95px;
            animation: webSoundwavePulse 1.8s ease-in-out infinite 0.4s;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  // 1. Bobbing / Dancing Animation Loop
  useEffect(() => {
    if (!isAnimating) return;

    if (isDancing) {
      // Upbeat Happy Dance Groove (Bouncy tempo with tilt)
      const danceLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(bobAnim, {
              toValue: -7,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(bobAnim, {
              toValue: 3,
              duration: 240,
              useNativeDriver: true,
            }),
            Animated.timing(bobAnim, {
              toValue: -5,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.timing(bobAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(tiltAnim, {
              toValue: 1,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(tiltAnim, {
              toValue: -1,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(tiltAnim, {
              toValue: 0.5,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(tiltAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      danceLoop.start();
      return () => danceLoop.stop();
    } else {
      // Gentle Ambient Float
      const bobLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, {
            toValue: -3,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(bobAnim, {
            toValue: 3,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      );
      bobLoop.start();
      return () => bobLoop.stop();
    }
  }, [isAnimating, isDancing]);

  // 2. Radiating Soundwave Stagger Loop
  useEffect(() => {
    if (!isAnimating) return;

    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.sequence([
            Animated.timing(wave1, { toValue: 0.95, duration: 400, useNativeDriver: true }),
            Animated.timing(wave1, { toValue: 0.2, duration: 600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(200),
            Animated.timing(wave2, { toValue: 0.95, duration: 400, useNativeDriver: true }),
            Animated.timing(wave2, { toValue: 0.2, duration: 600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(wave3, { toValue: 0.95, duration: 400, useNativeDriver: true }),
            Animated.timing(wave3, { toValue: 0.2, duration: 600, useNativeDriver: true }),
          ]),
        ]),
        Animated.delay(600),
      ])
    );
    waveLoop.start();
    return () => waveLoop.stop();
  }, [isAnimating]);

  const handleParrotTap = () => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(20);
      } catch (e) {}
    }

    // Gentle spring bounce
    Animated.sequence([
      Animated.timing(pressScale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(pressScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
    ]).start();

    // Rotate tip
    const randomTip = PANAMA_QUICK_TIPS[Math.floor(Math.random() * PANAMA_QUICK_TIPS.length)];
    setActiveTip(randomTip);
    setBubbleVisible(true);

    if (onPress) {
      onPress();
    }
  };

  const isSmallMascot = size <= 42;
  const resolvedPlacement = bubblePlacement === 'auto'
    ? (isSmallMascot ? 'bottom' : 'top')
    : bubblePlacement;

  const bubbleMaxWidth = Math.min(screenWidth - 36, 280);

  return (
    <View style={styles.wrapper}>
      {/* Responsive Speech Bubble (Contained within screen boundaries) */}
      {bubbleVisible && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setBubbleVisible(false)}
          style={[
            styles.speechBubble,
            resolvedPlacement === 'bottom' && styles.speechBubbleBottom,
            resolvedPlacement === 'inline' && styles.speechBubbleInline,
            { maxWidth: bubbleMaxWidth },
          ]}
        >
          <Text style={styles.speechText} numberOfLines={4}>
            {activeTip}
          </Text>
          <View
            style={[
              styles.speechArrow,
              resolvedPlacement === 'bottom' && styles.speechArrowBottom,
            ]}
          />
        </TouchableOpacity>
      )}

      {/* Interactive Mascot Avatar */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handleParrotTap}
        style={styles.touchArea}
      >
        <Animated.View
          style={{
            transform: [
              { translateY: bobAnim },
              {
                rotate: tiltAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ['-5deg', '0deg', '5deg'],
                }),
              },
              { scale: pressScale },
            ],
          }}
        >
          <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
            {/* Outer WhatsApp Green Speech Bubble Outline */}
            <Path
              d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
              fill="none"
              stroke="#25D366"
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Canonical Studio Parrot Group (Centered within speech bubble) */}
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

              {/* 6. Staggered Radiating Soundwave Arcs */}
              <AnimatedPath
                d="M 112 43 A 11 11 0 0 1 112 60"
                fill="none"
                stroke="#F59E0B"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={wave1}
              />
              <AnimatedPath
                d="M 121 37 A 17 17 0 0 1 121 66"
                fill="none"
                stroke="#F59E0B"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={wave2}
              />
              <AnimatedPath
                d="M 130 31 A 23 23 0 0 1 130 72"
                fill="none"
                stroke="#F59E0B"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={wave3}
              />
            </G>
          </Svg>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 999,
  },
  touchArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubble: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 8,
    backgroundColor: '#F5F1EB',
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D5C3B5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 9999,
    alignSelf: 'center',
  },
  speechBubbleBottom: {
    bottom: undefined,
    top: '100%',
    marginTop: 8,
    marginBottom: 0,
  },
  speechBubbleInline: {
    position: 'relative',
    bottom: undefined,
    top: undefined,
    marginVertical: 6,
  },
  speechText: {
    color: '#4D463E',
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'center',
  },
  speechArrow: {
    position: 'absolute',
    bottom: -7,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#D5C3B5',
  },
  speechArrowBottom: {
    bottom: undefined,
    top: -7,
    borderTopWidth: 0,
    borderBottomWidth: 7,
    borderBottomColor: '#D5C3B5',
  },
});
