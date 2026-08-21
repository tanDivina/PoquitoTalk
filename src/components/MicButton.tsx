import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface MicButtonProps {
  isListening: boolean;
  onPress: () => void;
  label?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  isListening,
  onPress,
  label = 'Tap & Speak',
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isListening && styles.buttonActive]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isListening ? 'mic' : 'mic-outline'}
          size={32}
          color={Colors.onSecondary}
        />
      </TouchableOpacity>
      <Text style={[styles.label, isListening && styles.labelActive]}>
        {isListening ? 'Listening... Tap to Translate' : label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonActive: {
    backgroundColor: Colors.secondaryLight,
    transform: [{ scale: 1.08 }],
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },
});
