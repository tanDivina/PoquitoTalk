import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { SERVICE_PRESETS, getCategoryPastelTheme } from '../services/presets';
import { ServicePreset } from '../types';
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
  // Track open cards (all open by default for effortless scrolling without jump bugs)
  const [collapsedMap, setCollapsedMap] = useState<{ [key: string]: boolean }>({});

  const toggleCollapse = (id: string) => {
    setCollapsedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
    >
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} />

      <View style={styles.titleSection}>
        <View style={styles.versionBadge}>
          <Ionicons name="sparkles" size={12} color={Colors.tertiary} />
          <Text style={styles.versionText}>v1.0.8 • 11 CATEGORIES & DIRECTORY</Text>
        </View>
        <Text style={styles.title}>Service Preset Templates</Text>
        <Text style={styles.subtitle}>
          Tap any phrase to instantly send polite Panamanian Spanish voice notes & messages 🇵🇦.
        </Text>
      </View>

      {/* Preset Category Cards List */}
      <View style={styles.list}>
        {SERVICE_PRESETS.map((preset) => {
          const isCollapsed = collapsedMap[preset.id] || false;
          const theme = getCategoryPastelTheme(preset.id);

          return (
            <View
              key={preset.id}
              style={[
                styles.presetCard,
                {
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Card Header Row */}
              <TouchableOpacity
                style={styles.cardHeaderRow}
                onPress={() => toggleCollapse(preset.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.badgeBg }]}>
                  <MaterialCommunityIcons
                    name={preset.icon as any}
                    size={24}
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
                    name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                    size={16}
                    color={theme.accent}
                  />
                </View>
              </TouchableOpacity>

              {!isCollapsed && (
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

                  {/* Share Phrasebook to Bocas Expat Groups */}
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
    paddingBottom: 60,
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
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  presetCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
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
    fontWeight: '800',
    color: '#111827', // Solid dark black text for 100% legibility
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
    color: '#111827',
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
