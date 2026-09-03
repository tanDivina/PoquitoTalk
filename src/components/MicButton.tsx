import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { PoquitoAvatar, PoquitoState } from './PoquitoAvatar';

interface MicButtonProps {
  isListening: boolean;
  isTranslating?: boolean;
  isPlayingAudio?: boolean;
  onPress: () => void;
  label?: string;
  mode?: 'translator' | 'walkie';
}

export const MicButton: React.FC<MicButtonProps> = ({
  isListening,
  isTranslating = false,
  isPlayingAudio = false,
  onPress,
  label = 'TAP & SPEAK ENGLISH',
  mode = 'translator',
}) => {
  const isSpeaking = isTranslating || isPlayingAudio;

  // Determine avatar state:
  // In Translator mode: friendly conversational Poquito on perch (curious/idle, listening, talking)
  // In Walkie mode: radio walkie-talkie stance (talkie-standby, talkie-tx, talkie-rx)
  const mascotState: PoquitoState =
    mode === 'walkie'
      ? isListening
        ? 'talkie-tx'
        : isSpeaking
        ? 'talkie-rx'
        : 'talkie-standby'
      : isListening
      ? 'listening'
      : isSpeaking
      ? 'talking'
      : 'curious';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.mascotTouchContainer,
          isListening && styles.mascotTouchContainerActive,
          (isTranslating || isPlayingAudio) && styles.mascotTouchContainerTranslating,
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Poquito Mascot in Conversational or Walkie Stance */}
        <PoquitoAvatar state={mascotState} size={110} />

        {/* Docked PTT Capsule Pill */}
        <View
          style={[
            styles.pttPill,
            isListening && styles.pttPillRecording,
            isTranslating && styles.pttPillTranslating,
            isPlayingAudio && styles.pttPillSpeaking,
          ]}
        >
          {isTranslating ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : isPlayingAudio ? (
            <Ionicons
              name="volume-high"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
          ) : (
            <>
              <View style={[styles.ledDot, isListening && styles.ledDotRecording]} />
              <Ionicons
                name="mic"
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
            </>
          )}

          <Text style={styles.pttLabel}>
            {isListening
              ? 'RECORDING... TAP TO TRANSLATE'
              : isTranslating
              ? 'TRANSLATING...'
              : isPlayingAudio
              ? 'POQUITO IS SPEAKING...'
              : label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  mascotTouchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingBottom: 10,
  },
  mascotTouchContainerActive: {
    transform: [{ scale: 1.04 }],
  },
  mascotTouchContainerTranslating: {
    transform: [{ scale: 1.02 }],
  },
  glowHalo: {
    position: 'absolute',
    top: 6,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    zIndex: -1,
  },
  glowHaloRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    transform: [{ scale: 1.15 }],
  },
  glowHaloTranslating: {
    backgroundColor: 'rgba(37, 99, 235, 0.18)',
    transform: [{ scale: 1.08 }],
  },
  pttPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E402D',
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 100,
    marginTop: -8,
    borderWidth: 1.5,
    borderColor: '#25D366',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  pttPillRecording: {
    backgroundColor: '#DC2626',
    borderColor: '#FCA5A5',
    shadowColor: '#DC2626',
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  pttPillTranslating: {
    backgroundColor: '#2563EB',
    borderColor: '#93C5FD',
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
  },
  pttPillSpeaking: {
    backgroundColor: '#059669',
    borderColor: '#6EE7B7',
    shadowColor: '#059669',
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  ledDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#25D366',
    marginRight: 6,
  },
  ledDotRecording: {
    backgroundColor: '#FFFFFF',
  },
  pttLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(46, 64, 45, 0.04)',
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.1,
  },
});
