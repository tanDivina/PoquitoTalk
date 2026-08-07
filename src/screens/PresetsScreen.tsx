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
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { SERVICE_PRESETS, getCategoryPastelTheme } from '../services/presets';
import { sharePhrasebookToCommunity } from '../services/deepLinks';

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
  // Single active expanded card ID (defaults to Medical & Pharmacy)
  const [activeCardId, setActiveCardId] = useState<string>('medical_pharmacy');

  const handleToggleCard = (id: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setActiveCardId((prevId) => (prevId === id ? '' : id));
  };

  // Scroll listener: Bi-directional scroll-driven collapse & expansion (scrolling UP or DOWN)
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    // Calibrated scroll step threshold (~140px per category)
    const cardStep = 140;
    const computedIndex = Math.max(
      0,
      Math.min(SERVICE_PRESETS.length - 1, Math.floor((scrollY + 40) / cardStep))
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
      scrollEventThrottle={32}
    >
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} />

      <View style={styles.titleSection}>
        <View style={styles.versionBadge}>
          <Ionicons name="sparkles" size={12} color={Colors.tertiary} />
          <Text style={styles.versionText}>v1.1.2 • BI-DIRECTIONAL ACCORDION & SOLID FONTS ✨</Text>
        </View>
        <Text style={styles.title}>Service Preset Templates</Text>
        <Text style={styles.subtitle}>
          Scroll up/down or tap any category to reveal Panamanian Spanish phrase templates 🇵🇦.
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
                onPress={() => handleToggleCard(preset.id)}
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

      {/* Accordion Deck: Bi-directional Scroll & Tap Support */}
      <View style={styles.stackedDeckList}>
        {SERVICE_PRESETS.map((preset) => {
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
                },
              ]}
            >
              {/* Card Header Row */}
              <TouchableOpacity
                style={styles.cardHeaderRow}
                onPress={() => handleToggleCard(preset.id)}
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
                  <Text style={[styles.categoryLabel, { color: theme.accent, borderColor: theme.accent }]}>
                    {preset.category}
                  </Text>

                  {/* Guaranteed 100% Solid Black Title Font across all devices */}
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
    paddingBottom: 350, // Extended scroll space for smooth 11-category bi-directional scrolling
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
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 3,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000', // 100% Solid Black
    marginTop: 1,
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
    color: '#000000',
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
