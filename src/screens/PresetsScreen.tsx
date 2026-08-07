import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { SERVICE_PRESETS, getCategoryPastelTheme } from '../services/presets';
import { sharePhrasebookToCommunity } from '../services/deepLinks';

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
  // Active expanded card index (auto-updates on scroll up/down or tap)
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleSelectCard = (index: number) => {
    setActiveIndex(index);
  };

  // Scroll listener: Dynamically opens active scrolled card as user scrolls UP or DOWN
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    // Card track scroll step (~160px per category card)
    const cardTrackStep = 160;
    const computedIndex = Math.max(
      0,
      Math.min(SERVICE_PRESETS.length - 1, Math.floor((scrollY + 80) / cardTrackStep))
    );

    if (computedIndex !== activeIndex) {
      setActiveIndex(computedIndex);
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
        <View style={styles.versionBadge}>
          <Ionicons name="sparkles" size={12} color={Colors.tertiary} />
          <Text style={styles.versionText}>v1.0.9 • SCROLL-DRIVEN CARD DECK ✨</Text>
        </View>
        <Text style={styles.title}>Service Preset Templates</Text>
        <Text style={styles.subtitle}>
          Scroll up or down to auto-reveal scenario phrases across all 11 categories 🇵🇦.
        </Text>

        {/* Quick Category Jump Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickCategoryBar}>
          {SERVICE_PRESETS.map((preset, idx) => {
            const isSelected = activeIndex === idx;
            const theme = getCategoryPastelTheme(preset.id);
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.categoryPill,
                  { backgroundColor: isSelected ? theme.accent : theme.bg, borderColor: theme.border },
                ]}
                onPress={() => handleSelectCard(idx)}
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
                  {preset.title.split('&')[0].trim()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Scroll-Driven Stacked Card Deck Section */}
      <View style={styles.stackedDeckList}>
        {SERVICE_PRESETS.map((preset, index) => {
          const isExpanded = activeIndex === index;
          const theme = getCategoryPastelTheme(preset.id);

          return (
            <View
              key={preset.id}
              style={[
                styles.stackedCard,
                {
                  backgroundColor: theme.bg,
                  borderColor: isExpanded ? theme.accent : theme.border,
                  borderWidth: isExpanded ? 2 : 1.5,
                },
              ]}
            >
              {/* Card Header Row */}
              <TouchableOpacity
                style={styles.cardHeaderRow}
                onPress={() => handleSelectCard(index)}
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

                <View style={[styles.toggleCircle, { backgroundColor: theme.badgeBg }]}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={theme.accent}
                  />
                </View>
              </TouchableOpacity>

              {/* Active Card Body (Phrasebook Chips) */}
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

                  {/* Share Phrasebook */}
                  <TouchableOpacity
                    style={[styles.sharePhrasebookBtn, { borderColor: theme.border }]}
                    onPress={() =>
                      sharePhrasebookToCommunity({
                        id: preset.id,
                        title: preset.title,
                        category: preset.category,
                        emoji: '🌴',
                        phraseCount: preset.phrases.length,
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <FontAwesome5 name="whatsapp" size={13} color={Colors.whatsapp} />
                    <Text style={styles.sharePhrasebookText}>Share to Bocas Expat Groups 🌴</Text>
                  </TouchableOpacity>
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
    paddingBottom: 80,
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
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  toggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
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
    fontWeight: '700',
    color: '#0F172A',
  },
  sharePhrasebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  sharePhrasebookText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.whatsapp,
  },
});
