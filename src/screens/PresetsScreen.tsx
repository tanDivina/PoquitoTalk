import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { SERVICE_PRESETS, getCategoryPastelTheme } from '../services/presets';
import { generateGoogleGeminiAudio, playGoogleAudioFile, GOOGLE_SPANISH_VOICES } from '../services/googleVoice';
import { PresetPhrase } from '../types';
import { shareVoiceNoteToWhatsApp, sendTextToWhatsApp } from '../services/sharing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCENARIO_CARD_WIDTH = Math.min(SCREEN_WIDTH - 64, 320);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PresetsScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onOpenSaved?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
  onSelectPhrasePrompt: (phraseText: string, categoryTitle?: string) => void;
}

export const PresetsScreen: React.FC<PresetsScreenProps> = ({
  isPro,
  onOpenPaywall,
  onOpenSaved,
  onOpenSettings,
  savedCount = 0,
  onSelectPhrasePrompt,
}) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const quickBarRef = React.useRef<ScrollView>(null);

  // Single active expanded card ID (starts clean and collapsed)
  const [activeCardId, setActiveCardId] = useState<string>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
      const paramPreset = new URLSearchParams(window.location.search).get('preset');
      if (paramPreset) return paramPreset;
    }
    return '';
  });
  const [playingPhraseId, setPlayingPhraseId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [sharingAudioId, setSharingAudioId] = useState<string | null>(null);

  const handleSelectCard = (id: string, shouldScroll: boolean = false) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    const nextId = activeCardId === id ? '' : id;
    setActiveCardId(nextId);

    if (nextId !== '') {
      const index = SERVICE_PRESETS.findIndex((p) => p.id === nextId);
      if (index >= 0) {
        // Scroll horizontal quick jump bar to keep active pill visible
        quickBarRef.current?.scrollTo({ x: Math.max(0, index * 105 - 60), animated: true });

        // Scroll the selected card directly to the top of the viewport under pinned header
        if (shouldScroll) {
          const targetY = index * 48;
          scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
        }
      }
    }
  };

  // Vertical scroll listener: Automatically and smoothly opens category cards as user scrolls
  const handleVerticalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    // Calibrated 48px step matches physical collapsed card height (~66px - 18px margin overlap)
    const cardStep = 48;
    const computedIndex = Math.max(
      0,
      Math.min(SERVICE_PRESETS.length - 1, Math.floor(Math.max(0, scrollY + 24) / cardStep))
    );

    const targetPreset = SERVICE_PRESETS[computedIndex];
    if (targetPreset && targetPreset.id !== activeCardId) {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setActiveCardId(targetPreset.id);
      quickBarRef.current?.scrollTo({ x: Math.max(0, computedIndex * 105 - 60), animated: true });
    }
  };

  const getPhraseSpanish = (phrase: PresetPhrase): string => {
    return phrase.output;
  };

  // Play audio for phrase (ElevenLabs Voice or Speech fallback)
  const handlePlayPhraseAudio = async (phrase: PresetPhrase) => {
    const textToSpeak = getPhraseSpanish(phrase);
    const phraseKey = phrase.id || phrase.title;

    if (playingPhraseId === phraseKey) {
      try {
        Speech.stop();
      } catch (e) {}
      setPlayingPhraseId(null);
      return;
    }

    // Stop any existing sound
    try {
      Speech.stop();
    } catch (e) {}

    setLoadingAudioId(phraseKey);

    try {
      // 1. Try ElevenLabs / Google Audio
      const fileUri = await generateGoogleGeminiAudio(textToSpeak, 'Male');
      setLoadingAudioId(null);

      if (fileUri) {
        setPlayingPhraseId(phraseKey);
        await playGoogleAudioFile(fileUri);
        setPlayingPhraseId(null);
        return;
      }
    } catch (e) {
      setLoadingAudioId(null);
    }

    // 2. Fallback to Device Speech
    setPlayingPhraseId(phraseKey);
    Speech.speak(textToSpeak, {
      language: 'es-US',
      pitch: 0.96,
      rate: 0.82,
      onDone: () => setPlayingPhraseId(null),
      onError: () => setPlayingPhraseId(null),
    });
  };

  // Send Text to WhatsApp
  const handleSendWhatsAppText = async (phrase: PresetPhrase) => {
    const spanish = getPhraseSpanish(phrase);
    await sendTextToWhatsApp(spanish);
  };

  // Send Voice Note to WhatsApp
  const handleSendWhatsAppVoiceNote = async (phrase: PresetPhrase) => {
    const spanish = getPhraseSpanish(phrase);
    const phraseKey = phrase.id || phrase.title;
    try {
      setSharingAudioId(phraseKey);
      const audioUri = await generateGoogleGeminiAudio(spanish, 'Male');
      if (audioUri) {
        await shareVoiceNoteToWhatsApp(audioUri, 'Contact', spanish);
      } else {
        await sendTextToWhatsApp(spanish);
      }
    } catch (error) {
      await sendTextToWhatsApp(spanish);
    } finally {
      setSharingAudioId(null);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        isPro={isPro}
        onOpenPaywall={onOpenPaywall}
        onOpenSaved={onOpenSaved}
        savedCount={savedCount}
        onOpenSettings={onOpenSettings}
      />

      {/* Permanently Pinned Top Category Bar */}
      <View style={styles.pinnedHeaderSection}>
        <View style={styles.pinnedTopRow}>
          <Text style={styles.pinnedTitle}>Service Templates 🇵🇦</Text>
          <View style={styles.templateBadge}>
            <Ionicons name="sparkles" size={12} color={Colors.tertiary} style={{ marginRight: 4 }} />
            <Text style={styles.templateBadgeText}>Panama Spanish</Text>
          </View>
        </View>

        {/* Permanently Pinned Horizontal Category Jump Bar */}
        <ScrollView
          ref={quickBarRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickCategoryBar}
          contentContainerStyle={styles.quickCategoryContent}
        >
          {SERVICE_PRESETS.map((preset) => {
            const isSelected = activeCardId === preset.id;
            const theme = getCategoryPastelTheme(preset.id);
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? theme.badgeBg : theme.bg,
                    borderColor: isSelected ? theme.accent : theme.border,
                    borderWidth: isSelected ? 1.5 : 1,
                  },
                ]}
                onPress={() => handleSelectCard(preset.id, true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={preset.icon as any}
                  size={14}
                  color="#0F172A"
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: '#0F172A',
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {preset.category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category Decks with Horizontal Scenario Carousel */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 800 }]}
        showsVerticalScrollIndicator={true}
        onScroll={handleVerticalScroll}
        scrollEventThrottle={16}
      >
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
                  marginTop: index > 0 ? -18 : 0, // Fanned overlapping playing card deck
                  zIndex: isExpanded ? 100 : SERVICE_PRESETS.length - index,
                  elevation: isExpanded ? 8 : SERVICE_PRESETS.length - index,
                },
              ]}
            >
              {/* Card Header Row */}
              <TouchableOpacity
                style={styles.cardHeaderRow}
                onPress={() => handleSelectCard(preset.id, true)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.badgeBg }]}>
                  <MaterialCommunityIcons
                    name={preset.icon as any}
                    size={22}
                    color="#0F172A"
                  />
                </View>

                <View style={styles.headerInfo}>
                  <Text style={styles.cardTitle}>{preset.title}</Text>
                  <Text style={styles.cardCategorySubtitle} numberOfLines={1}>
                    {preset.phrases.length} phrase templates
                  </Text>
                </View>

                <View style={[styles.toggleCircle, { backgroundColor: theme.badgeBg }]}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#0F172A"
                  />
                </View>
              </TouchableOpacity>

              {/* Expanded Phrase Content with Horizontal Scenario Carousel */}
              {isExpanded && (
                <View style={styles.cardBody}>
                  <View style={styles.carouselHeaderRow}>
                    <Text style={styles.description}>{preset.description}</Text>
                    {preset.phrases.length > 1 && (
                      <View style={[styles.swipeHintBadge, { backgroundColor: theme.badgeBg }]}>
                        <Text style={[styles.swipeHintText, { color: theme.accent }]}>
                          {preset.phrases.length} Scenarios • Swipe →
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Horizontal Swipeable Scenario Deck */}
                  <ScrollView
                    horizontal
                    pagingEnabled={false}
                    snapToInterval={SCENARIO_CARD_WIDTH + 12}
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalCarouselContainer}
                  >
                    {preset.phrases.map((phrase, idx) => {
                      const phraseKey = phrase.id || phrase.title;
                      const isPlayingThis = playingPhraseId === phraseKey;
                      const isLoadingThis = loadingAudioId === phraseKey;
                      const isSharingThis = sharingAudioId === phraseKey;
                      const currentSpanish = getPhraseSpanish(phrase);

                      return (
                        <View
                          key={idx}
                          style={[
                            styles.phraseCard,
                            {
                              width: SCENARIO_CARD_WIDTH,
                              backgroundColor: theme.chipBg,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <View style={styles.phraseHeader}>
                            <View style={styles.scenarioIndexBadge}>
                              <Text style={styles.scenarioIndexText}>
                                {idx + 1} of {preset.phrases.length}
                              </Text>
                            </View>
                            <Text style={styles.phraseTitle} numberOfLines={1}>
                              {phrase.title}
                            </Text>
                          </View>

                          <Text style={styles.englishInputText} numberOfLines={2}>
                            {phrase.input}
                          </Text>

                          {/* Panamanian Spanish Box */}
                          <View
                            style={[
                              styles.spanishContainer,
                              { backgroundColor: '#FAF9F6', borderColor: '#E5E2DA' },
                            ]}
                          >
                            <View style={styles.spanishBadge}>
                              <Text style={styles.spanishBadgeText}>
                                PANAMA SPANISH 🇵🇦
                              </Text>
                            </View>
                            <Text style={styles.spanishText}>{currentSpanish}</Text>
                          </View>

                          {/* Action Buttons Row */}
                          <View style={styles.actionRow}>
                            {/* 1. Speaker Symbol ONLY */}
                            <TouchableOpacity
                              style={[
                                styles.speakerOnlyBtn,
                                { borderColor: theme.border, backgroundColor: '#FAF9F6' },
                              ]}
                              onPress={() => handlePlayPhraseAudio(phrase)}
                              activeOpacity={0.7}
                            >
                              {isLoadingThis ? (
                                <ActivityIndicator size="small" color={theme.accent} />
                              ) : (
                                <Ionicons
                                  name={isPlayingThis ? 'stop-circle' : 'volume-high'}
                                  size={18}
                                  color={theme.accent}
                                />
                              )}
                            </TouchableOpacity>

                            {/* 2. Send Text to WhatsApp */}
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.textWhatsappBtn]}
                              onPress={() => handleSendWhatsAppText(phrase)}
                              activeOpacity={0.7}
                            >
                              <FontAwesome5 name="whatsapp" size={13} color="#047857" />
                              <Text style={styles.textWhatsappBtnLabel}>Text</Text>
                            </TouchableOpacity>

                            {/* 3. Send Voice Note to WhatsApp */}
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.voiceWhatsappBtn]}
                              onPress={() => handleSendWhatsAppVoiceNote(phrase)}
                              disabled={isSharingThis}
                              activeOpacity={0.7}
                            >
                              {isSharingThis ? (
                                <ActivityIndicator size="small" color="#FFF" />
                              ) : (
                                <>
                                  <FontAwesome5 name="whatsapp" size={13} color="#FFFFFF" />
                                  <Text style={styles.voiceWhatsappBtnLabel}>Voice</Text>
                                </>
                              )}
                            </TouchableOpacity>

                            {/* 4. Customize in Translate */}
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.editBtn, { borderColor: theme.border }]}
                              onPress={() => onSelectPhrasePrompt(phrase.input, preset.title)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="create-outline" size={14} color={Colors.onSurfaceVariant} />
                              <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pinnedHeaderSection: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 20,
  },
  pinnedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pinnedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  templateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B5E20',
  },
  quickCategoryBar: {
    marginTop: 2,
    marginBottom: 2,
  },
  quickCategoryContent: {
    paddingRight: 16,
    gap: 6,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 800,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stackedDeckList: {
    paddingHorizontal: 16,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  cardCategorySubtitle: {
    fontSize: 11.5,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '500',
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
  carouselHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  description: {
    fontSize: 12.5,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    flex: 1,
  },
  swipeHintBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  swipeHintText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  horizontalCarouselContainer: {
    gap: 12,
    paddingVertical: 4,
    paddingRight: 16,
  },
  phraseCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  phraseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  scenarioIndexBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  scenarioIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  phraseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  englishInputText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 8,
  },
  spanishContainer: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  spanishBadge: {
    marginBottom: 4,
  },
  spanishBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  spanishText: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
    lineHeight: 19,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakerOnlyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 10,
  },
  textWhatsappBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.2,
    borderColor: '#A7F3D0',
    flex: 1,
  },
  textWhatsappBtnLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#047857',
  },
  voiceWhatsappBtn: {
    backgroundColor: '#059669',
    flex: 1.1,
  },
  voiceWhatsappBtnLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  editBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    flex: 0.85,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  editBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
});
