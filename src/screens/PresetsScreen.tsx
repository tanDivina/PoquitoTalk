import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { SERVICE_PRESETS, getCategoryPastelTheme } from '../services/presets';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PresetsScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onSelectPhrasePrompt: (phraseText: string, categoryTitle?: string) => void;
}

export const PresetsScreen: React.FC<PresetsScreenProps> = ({
  isPro,
  onOpenPaywall,
  onSelectPhrasePrompt,
}) => {
  // Active expanded card index (starts at 0 - Medical & Pharmacy)
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const cardYPositions = useRef<{ [key: number]: number }>({});

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(index);
  };

  // Scroll listener: Dynamically tracks exact Y position of all 8 preset cards
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    // Calculate active card index smoothly
    let targetIndex = Math.max(
      0,
      Math.min(SERVICE_PRESETS.length - 1, Math.floor((scrollY + 80) / 140))
    );

    if (cardYPositions.current[1] && scrollY > 100) {
      for (let i = SERVICE_PRESETS.length - 1; i >= 0; i--) {
        const cardY = cardYPositions.current[i];
        if (cardY !== undefined && scrollY >= cardY - 240) {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex !== activeIndex) {
      setActiveIndex(targetIndex);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} />

      <View style={styles.titleSection}>
        <Text style={styles.title}>Service Preset Templates</Text>
        <Text style={styles.subtitle}>
          Scroll up or down to auto-reveal scenario phrases across all categories, or tap any card 🇵🇦.
        </Text>
      </View>

      {/* Accordion Deck Section */}
      <View style={styles.list}>
        {SERVICE_PRESETS.map((preset, index) => {
          const isExpanded = activeIndex === index;
          const theme = getCategoryPastelTheme(preset.id);

          return (
            <View
              key={preset.id}
              onLayout={(e) => {
                cardYPositions.current[index] = e.nativeEvent.layout.y;
              }}
              style={[
                styles.stackedCardContainer,
                {
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  marginTop: index > 0 ? -10 : 0,
                  zIndex: isExpanded ? 50 : SERVICE_PRESETS.length - index,
                },
              ]}
            >
              {/* Card Header Row */}
              <TouchableOpacity
                style={styles.stackedHeaderRow}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.badgeBg }]}>
                  <MaterialCommunityIcons
                    name={preset.icon as any}
                    size={22}
                    color={theme.accent}
                  />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={[styles.categoryLabel, { color: theme.accent }]}>
                    {preset.category}
                  </Text>
                  <Text style={styles.cardTitle}>{preset.title}</Text>
                </View>

                {/* Active Indicator Arrow */}
                <View style={[styles.toggleCircle, { backgroundColor: theme.badgeBg }]}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={theme.accent}
                  />
                </View>
              </TouchableOpacity>

              {/* Expanded Content View */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <Text style={styles.description}>{preset.description}</Text>

                  <View style={styles.phrasesList}>
                    {preset.phrases.map((phrase, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.phraseChip, { backgroundColor: theme.chipBg, borderColor: theme.border }]}
                        onPress={() => onSelectPhrasePrompt(phrase.input, preset.title)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.phraseText}>{phrase.title}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={16} color={theme.accent} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 60,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  stackedCardContainer: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  stackedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onBackground,
    marginTop: 2,
  },
  toggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedContent: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  description: {
    fontSize: 12.5,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 12,
  },
  phrasesList: {
    gap: 8,
  },
  phraseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
  },
  phraseText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onBackground,
  },
});
