import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SUPPORTED_LANGUAGES } from '../services/gemma';

interface LanguageChipProps {
  fromLang: string;
  toLang: string;
  onSwap: () => void;
  onSelectFrom: () => void;
  onSelectTo: () => void;
}

export const LanguageChip: React.FC<LanguageChipProps> = ({
  fromLang,
  toLang,
  onSwap,
  onSelectFrom,
  onSelectTo,
}) => {
  const fromObj = SUPPORTED_LANGUAGES.find((l) => l.code === fromLang) || SUPPORTED_LANGUAGES[1];
  const toObj = SUPPORTED_LANGUAGES.find((l) => l.code === toLang) || SUPPORTED_LANGUAGES[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.chip} onPress={onSelectFrom} activeOpacity={0.7}>
        <Text style={styles.flag}>{fromObj.flag}</Text>
        <Text style={styles.langName}>{fromObj.name}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.swapButton} onPress={onSwap} activeOpacity={0.7}>
        <Ionicons name="swap-horizontal" size={18} color={Colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.chip, styles.chipTarget]} onPress={onSelectTo} activeOpacity={0.7}>
        <Text style={styles.flag}>{toObj.flag}</Text>
        <Text style={[styles.langName, styles.targetText]}>{toObj.name}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipTarget: {
    backgroundColor: Colors.secondaryContainer,
    borderColor: Colors.secondaryLight,
  },
  flag: {
    fontSize: 16,
  },
  langName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  targetText: {
    color: Colors.secondary,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
