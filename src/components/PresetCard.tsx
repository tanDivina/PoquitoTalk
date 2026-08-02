import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ServicePreset } from '../types';

interface PresetCardProps {
  preset: ServicePreset;
  onSelect: (preset: ServicePreset) => void;
  onSelectPhrase?: (phraseInput: string) => void;
}

export const PresetCard: React.FC<PresetCardProps> = ({ preset, onSelect, onSelectPhrase }) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => onSelect(preset)}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={preset.icon as any}
            size={24}
            color={Colors.secondary}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.category}>{preset.category}</Text>
          <Text style={styles.title}>{preset.title}</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.description}>{preset.description}</Text>

      <View style={styles.phrasesList}>
        {preset.phrases.map((phrase, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.phraseChip}
            onPress={() => onSelectPhrase && onSelectPhrase(phrase.input)}
            activeOpacity={0.7}
          >
            <Text style={styles.phraseText}>{phrase.title}</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.primary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  description: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 18,
  },
  phrasesList: {
    marginTop: 12,
    gap: 6,
  },
  phraseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  phraseText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onBackground,
  },
});
