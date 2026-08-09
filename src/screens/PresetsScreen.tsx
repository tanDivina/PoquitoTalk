import React, { useState } from 'react';
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
  // Single active expanded card ID (defaults to empty string so all cards start closed for a clean look)
  const [activeCardId, setActiveCardId] = useState<string>('');

  const handleSelectCard = (id: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setActiveCardId((prevId) => (prevId === id ? '' : id));
  };

  // Scroll listener: Calm, jitter-free scroll-driven card opening
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    // If at top of screen (scrollY < 20), keep all cards closed for clean look
    if (scrollY < 20) {
      if (activeCardId !== '') {
        setActiveCardId('');
      }
      return;
    }

    // Calibrated 50px scroll step for relaxed, smooth card transitions
    const cardStep = 50;
    const computedIndex = Math.max(
      0,
      Math.min(SERVICE_PRESETS.length - 1, Math.floor((scrollY - 10) / cardStep))
    );

    const targetPreset = SERVICE_PRESETS[computedIndex];
    if (targetPreset && targetPreset.id !== activeCardId) {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setActiveCardId(targetPreset.id);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      onScroll={handleScroll}
      scrollEventThrottle={48}
    >
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} />

      <View style={styles.titleSection}>
        <View style={styles.versionBadge}>
          <Ionicons name="sparkles" size={12} color={Colors.tertiary} />
          <Text style={styles.versionText}>v1.1.7 • CALIBRATED STACK SCROLLING ✨</Text>
        </View>
        <Text style={styles.title}>Service Preset Templates</Text>
        <Text style={styles.subtitle}>
          Scroll up/down or tap any card in the deck to reveal Panamanian Spanish phrase templates 🇵🇦.
        </Text>

        {/* Quick Horizontal Category Jump Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickCategoryBar}>
          {SERVICE_PRESETS.map((preset) => {
            const isSelected = activeCardId === preset.id;
            const theme = getCategoryPastelTheme(preset.id);
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.categoryPill,
                  { backgroundColor: isSelected ? theme.accent : theme.bg, borderColor: theme.border },
                ]}
                onPress={() => handleSelectCard(preset.id)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={preset.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : theme.accent}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isSelected ? '#FFFFFF' : theme.accent },
                  ]}
                >
                  {preset.category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Playing Cards Fanned Overlapping Stacked Deck */}
      <View style={styles.stackedDeckList}>
        {SERVICE_PRESETS.map((preset, index) => {
          const isExpanded = activeCardId === preset.id;
          const theme = getCategoryPastelTheme(preset.id);

          return (
            <View
              key={preset.id}
              style={[
                styles.stackedCard,
                {
                  backgroundColor: theme.bg,
                  borderColor: isExpanded ? theme.accent : theme.border,
                  borderWidth: isExpanded ? 2.5 : 1.5,
                  marginTop: index > 0 ? -18 : 0, // Physical playing cards overlap
                  zIndex: isExpanded ? 100 : SERVICE_PRESETS.length - index,
                  elevation: isExpanded ? 8 : SERVICE_PRESETS.length - index,
                },
              ]}
            >
              {/* Single Title Header Row */}
              <TouchableOpacity
                style={styles.cardHeaderRow}
                onPress={() => handleSelectCard(preset.id)}
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
                  <Text style={styles.cardTitle}>{preset.title}</Text>
                </View>

                <View style={[styles.toggleCircle, { backgroundColor: theme.badgeBg }]}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={theme.accent}
                  />
                </View>
              </TouchableOpacity>

              {/* Expanded Phrasebook Content */}
              {isExpanded && (
                <View style={styles.cardBody}>
                  <Text style={styles.description}>{preset.description}</Text>

                  {/* Phrases List */}
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
    paddingBottom: 350, // Ample scroll space for full 11-card scrolling
  },
  titleSection: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.tertiaryContainer,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.tertiary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 18,
  },
  quickCategoryBar: {
    marginTop: 12,
    marginBottom: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stackedDeckList: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  stackedCard: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#000000',
  },
  toggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    marginTop: 12,
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
    fontWeight: '700',
    color: '#000000',
  },
});
