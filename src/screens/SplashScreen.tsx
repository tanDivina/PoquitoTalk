import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Colors } from '../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 1200,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const waveAnim = useRef(new Animated.Value(0.35)).current;
  const hasFinishedRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onFinish?.();
    });
    // Guaranteed hard fallback
    setTimeout(() => {
      onFinish?.();
    }, 300);
  }, [fadeAnim, onFinish]);

  useEffect(() => {
    // 1. Entrance Fade & Scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Gentle wave pulse using JS driver (SVG Path requires useNativeDriver: false)
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(waveAnim, {
          toValue: 0.35,
          duration: 400,
          useNativeDriver: false,
        }),
      ])
    );
    try {
      waveLoop.start();
    } catch (e) {
      console.warn('waveAnim error:', e);
    }

    // 3. Failsafe timer to finish splash
    const timer = setTimeout(() => {
      handleFinish();
    }, durationMs);

    return () => {
      clearTimeout(timer);
      waveLoop.stop();
    };
  }, [durationMs, handleFinish, fadeAnim, scaleAnim, waveAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleFinish}
        style={styles.touchArea}
      >
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
                {/* 1. Straightened Wooden Perch Branch (Level & balanced) */}
                <Path d="M 28 135 L 118 135" stroke="#B45309" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />

                {/* 2. Golden Parrot Claws */}
                <Path
                  d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138"
                  stroke="#F59E0B"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                />

                {/* 3. Body & Anchored Feathers */}
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

                {/* 4. Cyan Wing */}
                <Path
                  d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z"
                  fill="#06B6D4"
                  stroke="#047857"
                  strokeWidth={3.5}
                  strokeLinejoin="round"
                />

                {/* 5. Head, Big Eye & Golden Beak */}
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

                {/* 6. Soundwave Broadcast Arcs */}
                <AnimatedPath
                  d="M 110 43 A 11 11 0 0 1 110 60"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  opacity={waveAnim}
                />
                <AnimatedPath
                  d="M 120 37 A 17 17 0 0 1 120 66"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  opacity={waveAnim}
                />
                <AnimatedPath
                  d="M 130 31 A 23 23 0 0 1 130 72"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  opacity={waveAnim}
                />
              </G>
            </Svg>
          </View>

          {/* Brand Name - High-Contrast Two-Tone Identity */}
          <Text style={styles.brandTitle}>
            Poquito<Text style={styles.brandTitleTalk}>Talk</Text>
          </Text>

          {/* Location Tag */}
          <View style={styles.framelessTag}>
            <Text style={styles.framelessTagText}>BOCAS DEL TORO</Text>
            <View style={styles.tagDot} />
            <Text style={styles.framelessTagText}>PANAMÁ 🇵🇦</Text>
          </View>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Instant Spanish Voice Notes</Text>
            <Text style={styles.tagline}>for Bocas del Toro (Panama)</Text>
          </View>
        </Animated.View>

        {/* Footer / Brand Value Line */}
        <View style={styles.footerSection}>
          <Text style={styles.footerSubText}>Tap anywhere to start</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FBF9F5',
    zIndex: 9999,
  },
  touchArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  topSpacer: {
    height: 40,
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
    color: '#1B1C1A',
    letterSpacing: -0.6,
  },
  brandTitleTalk: {
    color: '#EA580C', // Vibrant Island Terracotta
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
    color: '#594F42',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerSection: {
    alignItems: 'center',
    gap: 12,
  },
  footerSubText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#8C8276',
    letterSpacing: 0.2,
  },
});
