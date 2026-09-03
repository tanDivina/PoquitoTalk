import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Colors } from '../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 1800,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Wave opacity pulse loops
  const wave1Anim = useRef(new Animated.Value(0.3)).current;
  const wave2Anim = useRef(new Animated.Value(0.3)).current;
  const wave3Anim = useRef(new Animated.Value(0.3)).current;

  // Loading dots loop
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 1. Entrance Fade & Scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Sequential Wave Pulsing Loop
    const createWaveLoop = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 350,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.25,
            duration: 450,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
        ])
      );
    };

    const wave1Loop = createWaveLoop(wave1Anim, 0);
    const wave2Loop = createWaveLoop(wave2Anim, 180);
    const wave3Loop = createWaveLoop(wave3Anim, 360);

    wave1Loop.start();
    wave2Loop.start();
    wave3Loop.start();

    // 3. Loading Dots Loop
    const createDotLoop = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const dot1Loop = createDotLoop(dot1Anim, 0);
    const dot2Loop = createDotLoop(dot2Anim, 150);
    const dot3Loop = createDotLoop(dot3Anim, 300);

    dot1Loop.start();
    dot2Loop.start();
    dot3Loop.start();

    // 4. Timer to finish splash
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, durationMs);

    return () => {
      clearTimeout(timer);
      wave1Loop.stop();
      wave2Loop.stop();
      wave3Loop.stop();
      dot1Loop.stop();
      dot2Loop.stop();
      dot3Loop.stop();
    };
  }, [durationMs, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.topSpacer} />

      {/* Main Center Content */}
      <Animated.View style={[styles.centerContent, { transform: [{ scale: scaleAnim }] }]}>
        {/* Transparent Poquito Mascot inside WhatsApp Speech Bubble */}
        <View style={styles.logoContainer}>
          <Svg width={170} height={170} viewBox="0 0 200 200" fill="none">
            {/* Outer WhatsApp Green Speech Bubble (Smooth Rounded Organic Arc) */}
            <Path
              d="M 100 20 C 142 20 176 54 176 96 C 176 138 142 172 100 172 C 88 172 74 169 62 163 C 48 175 30 182 28 182 C 28 182 34 166 36 150 C 28 135 24 116 24 96 C 24 54 58 20 100 20 Z"
              fill="none"
              stroke={Colors.whatsapp || '#25D366'}
              strokeWidth={11}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Perched Mascot Inside */}
            <G transform="translate(43, 39) scale(0.75)">
              {/* Wooden Branch */}
              <Path d="M 30 135 Q 70 132 115 135" stroke="#B45309" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />

              {/* Golden Parrot Claws */}
              <Path
                d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138"
                stroke="#F59E0B"
                strokeWidth={4.5}
                strokeLinecap="round"
              />

              {/* Body & Anchored Feathers */}
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

              {/* Cyan Wing */}
              <Path
                d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z"
                fill="#06B6D4"
                stroke="#047857"
                strokeWidth={3.5}
                strokeLinejoin="round"
              />

              {/* Head, Big Eye & Golden Beak */}
              <G id="head-group">
                <Circle cx={76} cy={42} r={9} fill="#FFFFFF" stroke="#047857" strokeWidth={2.5} />
                <Circle cx={74.5} cy={42} r={4.5} fill="#0F172A" />
                <Circle cx={72.5} cy={40} r={1.8} fill="#FFFFFF" />

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

              {/* Animated Soundwave Arcs */}
              <AnimatedPath
                d="M 112 43 A 11 11 0 0 1 112 60"
                fill="none"
                stroke="#F59E0B"
                strokeWidth={4.5}
                strokeLinecap="round"
                opacity={wave1Anim}
              />
              <AnimatedPath
                d="M 121 37 A 17 17 0 0 1 121 66"
                fill="none"
                stroke="#F59E0B"
                strokeWidth={4.5}
                strokeLinecap="round"
                opacity={wave2Anim}
              />
              <AnimatedPath
                d="M 130 31 A 23 23 0 0 1 130 72"
                fill="none"
                stroke="#F59E0B"
                strokeWidth={4.5}
                strokeLinecap="round"
                opacity={wave3Anim}
              />
            </G>
          </Svg>
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>
          Poquito<Text style={styles.brandTitleTalk}>Talk</Text>
        </Text>

        {/* Location Tag (Option 2: Frameless Clean Typography, No Box) */}
        <View style={styles.framelessTag}>
          <Text style={styles.framelessTagText}>BOCAS DEL TORO</Text>
          <View style={styles.tagDot} />
          <Text style={styles.framelessTagText}>PANAMÁ 🇵🇦</Text>
        </View>

        {/* Tagline with balanced 2-line layout (Never awkward word break) */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Instant Spanish Voice Notes</Text>
          <Text style={styles.tagline}>for Bocas del Toro (Panama)</Text>
        </View>
      </Animated.View>

      {/* Footer / Brand Value Line */}
      <View style={styles.footerSection}>
        <View style={styles.loadingDotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim, backgroundColor: Colors.secondary }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Anim, backgroundColor: Colors.whatsapp || '#25D366' }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Anim, backgroundColor: '#F59E0B' }]} />
        </View>
        <Text style={styles.footerSubText}>Speak naturally. Send in seconds.</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background, // Pure soft cream (#FBF9F5)
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 64 : 48,
    paddingHorizontal: 28,
    zIndex: 9999,
  },
  topSpacer: {
    height: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.onBackground,
    letterSpacing: -0.6,
  },
  brandTitleTalk: {
    color: Colors.secondary || '#964824',
  },
  framelessTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  framelessTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F604E',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant || '#594F42',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerSection: {
    alignItems: 'center',
    gap: 12,
  },
  loadingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerSubText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.outline || '#8C8276',
    letterSpacing: 0.2,
  },
});
