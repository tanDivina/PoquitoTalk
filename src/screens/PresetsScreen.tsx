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
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { SpeakerIcon } from '../components/SpeakerIcon';
import { SERVICE_PRESETS, getCategoryPastelTheme } from '../services/presets';
import { generateGoogleGeminiAudio, playGoogleAudioFile } from '../services/googleVoice';
import { resolvePresetAudioUri } from '../services/presetAudio';
import { PresetPhrase } from '../types';
import { shareVoiceNoteToWhatsApp, sendTextToWhatsApp } from '../services/sharing';
import { getPreferredVoiceGender } from '../services/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCENARIO_CARD_WIDTH = Math.min(SCREEN_WIDTH - 64, 320);



interface PresetsScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onOpenSaved?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
  savedTranslations?: any[];
  onToggleSave?: (item: any) => void;
  onSelectPhrasePrompt: (phraseText: string, categoryTitle?: string) => void;
}

export const PresetsScreen: React.FC<PresetsScreenProps> = ({
  isPro,
  onOpenPaywall,
  onOpenSaved,
  onOpenSettings,
  savedCount = 0,
  savedTranslations = [],
  onToggleSave,
  onSelectPhrasePrompt,
}) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const quickBarRef = React.useRef<ScrollView>(null);

  // Single active expanded card ID (defaults to empty string for clean resting stack above the fold)
  const [activeCardId, setActiveCardId] = useState<string>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('preset') || new URLSearchParams(window.location.search).get('deck');
      if (p) {
        if (p === 'water_taxi') return 'boat';
        return p;
      }
    }
    return '';
  });
  const [selectedSubPills, setSelectedSubPills] = useState<Record<string, string>>({});
  const [playingPhraseId, setPlayingPhraseId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [sharingAudioId, setSharingAudioId] = useState<string | null>(null);

  const handleSelectCard = (id: string, shouldScroll: boolean = true) => {
    if (Platform.OS === 'ios') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    const nextId = activeCardId === id ? '' : id;
    setActiveCardId(nextId);

    if (nextId !== '') {
      const index = SERVICE_PRESETS.findIndex((p) => p.id === nextId);
      if (index >= 0) {
        // Scroll horizontal quick jump bar to keep active pill visible
        quickBarRef.current?.scrollTo({ x: Math.max(0, index * 105 - 60), animated: true });

        // Scroll the selected card into view with its border sitting flush under pinned header (no previous card line visible)
        if (shouldScroll) {
          const targetY = index === 0 ? 0 : 18 + index * 52;
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
          }, 80);
        }
      }
    } else {
      quickBarRef.current?.scrollTo({ x: 0, animated: true });
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      (window as any).__expandPresetCard = (id: string) => handleSelectCard(id);
    }
  }, [activeCardId]);

  const getPhraseSpanish = (phrase: PresetPhrase): string => {
    return phrase.output || phrase.input;
  };

  // Play audio for phrase (Google Voice / ElevenLabs or Speech fallback)
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

    const preferredGender = await getPreferredVoiceGender();
    const isMale = preferredGender !== 'FEMALE';
    const personaName = isMale ? 'Male' : 'Female';

    try {
      const fileUri = await resolvePresetAudioUri(phrase.id, textToSpeak, personaName);
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

    // Fallback to Device Speech with persona awareness
    setPlayingPhraseId(phraseKey);
    let targetVoice = undefined;
    try {
      const availableVoices = await Speech.getAvailableVoicesAsync();
      const spanishVoices = availableVoices.filter((v) => v.language.toLowerCase().includes('es'));
      if (isMale) {
        targetVoice = spanishVoices.find(
          (v) =>
            v.name.toLowerCase().includes('jorge') ||
            v.name.toLowerCase().includes('juan') ||
            v.name.toLowerCase().includes('diego') ||
            v.name.toLowerCase().includes('carlos') ||
            v.name.toLowerCase().includes('male') ||
            v.identifier.toLowerCase().includes('jorge') ||
            v.identifier.toLowerCase().includes('juan') ||
            v.identifier.toLowerCase().includes('male')
        );
      } else {
        targetVoice = spanishVoices.find(
          (v) =>
            v.name.toLowerCase().includes('monica') ||
            v.name.toLowerCase().includes('paolina') ||
            v.name.toLowerCase().includes('sofia') ||
            v.name.toLowerCase().includes('lucia') ||
            v.name.toLowerCase().includes('female') ||
            v.identifier.toLowerCase().includes('female')
        );
      }
    } catch (e) {}

    Speech.speak(textToSpeak, {
      language: 'es-419',
      voice: targetVoice ? targetVoice.identifier : undefined,
      pitch: isMale ? 0.75 : 1.10,
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

  // Send Voice Note to WhatsApp as native MP3 audio file
  const handleSendWhatsAppVoiceNote = async (phrase: PresetPhrase) => {
    const spanish = getPhraseSpanish(phrase);
    const phraseKey = phrase.id || phrase.title;
    try {
      setSharingAudioId(phraseKey);
      const preferredGender = await getPreferredVoiceGender();
      const personaName = preferredGender === 'FEMALE' ? 'Female' : 'Male';
      let audioUri = await resolvePresetAudioUri(phrase.id, spanish, personaName);
      if (!audioUri) {
        audioUri = await generateGoogleGeminiAudio(spanish, personaName);
      }

      if (audioUri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(audioUri, {
          mimeType: 'audio/mp3',
          dialogTitle: 'Send Voice Note to WhatsApp',
          UTI: 'public.mp3',
        });
      } else if (audioUri) {
        await shareVoiceNoteToWhatsApp(audioUri, 'Contact', spanish);
      } else {
        await sendTextToWhatsApp(spanish);
      }
    } catch (error) {
      console.warn('Voice note share error:', error);
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
        onOpenSettings={onOpenSettings}
        savedCount={savedCount}
      />

      {/* Permanently Pinned Top Quick Category Bar */}
      <View style={styles.pinnedHeaderSection}>
        <View style={styles.pinnedTopRow}>
          <Text style={styles.pinnedTitle}>Service Preset Templates</Text>
          <View style={styles.templateBadge}>
            <Text style={styles.templateBadgeText}>Bocas Del Toro</Text>
          </View>
        </View>

        <ScrollView
          ref={quickBarRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled={true}
          nestedScrollEnabled={true}
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
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
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

      {/* Playing Cards Fanned Overlapping Stacked Deck */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 600 }]}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
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
                    marginTop: index > 0 ? -18 : 0, // Physical playing cards overlap
                    zIndex: isExpanded ? 50 : SERVICE_PRESETS.length - index,
                    elevation: isExpanded ? 4 : 1,
                  },
                ]}
              >
                {/* Single Title Header Row */}
                <TouchableOpacity
                  style={styles.cardHeaderRow}
                  onPress={() => handleSelectCard(preset.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 14, right: 14 }}
                >
                  <View style={[styles.iconContainer, { backgroundColor: theme.badgeBg }]}>
                    <MaterialCommunityIcons
                      name={preset.icon as any}
                      size={22}
                      color="#0F172A"
                    />
                  </View>

                  <View style={styles.headerInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                      {preset.title}
                    </Text>
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
                {isExpanded && (() => {
                  const activeSubId = selectedSubPills[preset.id] || 'all';
                  const filteredPhrases =
                    activeSubId === 'all'
                      ? preset.phrases
                      : preset.phrases.filter((p) => p.subCategory === activeSubId);

                  return (
                    <View style={styles.cardBody}>
                      <View style={styles.carouselHeaderRow}>
                        <Text style={styles.description}>{preset.description}</Text>
                        {filteredPhrases.length > 1 && (
                          <View style={[styles.swipeHintBadge, { backgroundColor: theme.badgeBg }]}>
                            <Text style={[styles.swipeHintText, { color: theme.accent }]}>
                              {filteredPhrases.length} Scenarios • Swipe →
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Internal Sub-Category Segmented Pills */}
                      {preset.subCategories && preset.subCategories.length > 0 && (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          nestedScrollEnabled={true}
                          directionalLockEnabled={true}
                          style={styles.subPillScrollView}
                          contentContainerStyle={styles.subPillContainer}
                        >
                          {preset.subCategories.map((sub) => {
                            const isSubActive = activeSubId === sub.id;
                            const count =
                              sub.id === 'all'
                                ? preset.phrases.length
                                : preset.phrases.filter((p) => p.subCategory === sub.id).length;

                            return (
                              <TouchableOpacity
                                key={sub.id}
                                style={[
                                  styles.subPill,
                                  {
                                    backgroundColor: isSubActive ? theme.badgeBg : '#FFFFFF',
                                    borderColor: isSubActive ? theme.accent : theme.border,
                                    borderWidth: isSubActive ? 1.5 : 1,
                                  },
                                ]}
                                onPress={() =>
                                  setSelectedSubPills((prev) => ({
                                    ...prev,
                                    [preset.id]: sub.id,
                                  }))
                                }
                                activeOpacity={0.7}
                              >
                                {sub.icon && (
                                  <MaterialCommunityIcons
                                    name={sub.icon as any}
                                    size={13}
                                    color="#0F172A"
                                  />
                                )}
                                <Text
                                  style={[
                                    styles.subPillText,
                                    {
                                      color: '#0F172A',
                                      fontWeight: isSubActive ? '800' : '600',
                                    },
                                  ]}
                                >
                                  {sub.label} ({count})
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      )}

                      {/* Horizontal Swipeable Scenario Deck */}
                      <ScrollView
                        horizontal
                        pagingEnabled={false}
                        snapToInterval={SCENARIO_CARD_WIDTH + 12}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        directionalLockEnabled={true}
                        contentContainerStyle={styles.horizontalCarouselContainer}
                      >
                        {filteredPhrases.map((phrase, idx) => {
                        const phraseKey = phrase.id || phrase.title;
                        const isPlayingThis = playingPhraseId === phraseKey;
                        const isLoadingThis = loadingAudioId === phraseKey;
                        const isSharingThis = sharingAudioId === phraseKey;
                        const currentSpanish = getPhraseSpanish(phrase);
                        const phraseItemId = phrase.id || `preset-${preset.id}-${idx}`;
                        const isSaved = (savedTranslations || []).some(
                          (s) =>
                            (s.id && (s.id === phraseItemId || s.id === phrase.id)) ||
                            (s.inputText === phrase.input && s.outputText === currentSpanish) ||
                            (s.inputText === phrase.input)
                        );

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
                                  {idx + 1} of {filteredPhrases.length}
                                </Text>
                              </View>
                              <Text style={styles.phraseTitle} numberOfLines={1}>
                                {phrase.title}
                              </Text>
                              {onToggleSave && (
                                <TouchableOpacity
                                  style={styles.starBookmarkBtn}
                                  onPress={() =>
                                    onToggleSave({
                                      id: phraseItemId,
                                      inputText: phrase.input,
                                      outputText: currentSpanish,
                                      category: preset.title,
                                      isSaved: true,
                                      timestamp: Date.now(),
                                    })
                                  }
                                  activeOpacity={0.7}
                                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                  accessibilityLabel={isSaved ? "Remove bookmark" : "Save bookmark"}
                                >
                                  <Ionicons
                                    name={isSaved ? "bookmark" : "bookmark-outline"}
                                    size={19}
                                    color={isSaved ? Colors.secondary : Colors.onSurfaceVariant}
                                  />
                                </TouchableOpacity>
                              )}
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
                              {/* Upper Row: SPANISH badge + Listen & Edit actions */}
                              <View style={styles.spanishHeaderRow}>
                                <View style={styles.spanishBadge}>
                                  <Text style={styles.spanishBadgeText}>SPANISH</Text>
                                </View>

                                <View style={styles.spanishUtilityActions}>
                                  {/* Speech / Listen Audio button */}
                                  <TouchableOpacity
                                    style={[
                                      styles.spanishPillBtn,
                                      {
                                        borderColor: isPlayingThis ? '#FCA5A5' : '#E2E8F0',
                                        backgroundColor: isPlayingThis ? '#FEE2E2' : '#FFFFFF',
                                      },
                                    ]}
                                    onPress={() => handlePlayPhraseAudio(phrase)}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                                    accessibilityLabel={isPlayingThis ? 'Stop audio' : 'Listen to Spanish audio'}
                                  >
                                    {isLoadingThis ? (
                                      <ActivityIndicator size="small" color={isPlayingThis ? '#BA1A1A' : theme.accent} />
                                    ) : isPlayingThis ? (
                                      <Ionicons
                                        name="stop-circle"
                                        size={13}
                                        color="#BA1A1A"
                                      />
                                    ) : (
                                      <SpeakerIcon
                                        size={13}
                                        color={theme.accent}
                                      />
                                    )}
                                    <Text
                                      style={[
                                        styles.spanishPillBtnText,
                                        { color: isPlayingThis ? '#BA1A1A' : theme.accent },
                                      ]}
                                    >
                                      {isPlayingThis ? 'Playing' : 'Listen'}
                                    </Text>
                                  </TouchableOpacity>

                                  {/* Edit / Customize in Translate */}
                                  <TouchableOpacity
                                    style={[styles.spanishPillBtn, styles.spanishEditBtn]}
                                    onPress={() => onSelectPhrasePrompt(phrase.input, preset.title)}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                                    accessibilityLabel="Customize phrase in Translate"
                                  >
                                    <Ionicons name="create-outline" size={13} color="#475569" />
                                    <Text style={[styles.spanishPillBtnText, { color: '#475569' }]}>Edit</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>

                              <Text style={styles.spanishText}>{currentSpanish}</Text>
                            </View>

                            {/* Action Buttons Row: Send Voice Note & Send Text */}
                            <View style={styles.actionRow}>
                              {/* 1. Send Voice Note to WhatsApp */}
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
                                    <WhatsAppIcon size={15} color="#FFFFFF" />
                                    <Text style={styles.voiceWhatsappBtnLabel} numberOfLines={1}>
                                      Send Voice Note
                                    </Text>
                                  </>
                                )}
                              </TouchableOpacity>

                              {/* 2. Send Text to WhatsApp */}
                              <TouchableOpacity
                                style={[styles.actionBtn, styles.textWhatsappBtn]}
                                onPress={() => handleSendWhatsAppText(phrase)}
                                activeOpacity={0.7}
                              >
                                <WhatsAppIcon size={15} color="#047857" />
                                <Text style={styles.textWhatsappBtnLabel} numberOfLines={1}>
                                  Send Text
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                      </ScrollView>
                    </View>
                  );
                })()}
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
    zIndex: 1000,
    elevation: 20,
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
    paddingBottom: 600,
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
  subPillScrollView: {
    marginBottom: 10,
    marginTop: 2,
  },
  subPillContainer: {
    gap: 8,
    paddingRight: 12,
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subPillText: {
    fontSize: 12,
    letterSpacing: -0.1,
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
  starBookmarkBtn: {
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  englishInputText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 8,
  },
  spanishContainer: {
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    marginBottom: 10,
  },
  spanishHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  spanishBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  spanishBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#475569',
  },
  spanishUtilityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spanishPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1.5,
    elevation: 1,
  },
  spanishEditBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  spanishPillBtnText: {
    fontSize: 11,
    fontWeight: '700',
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
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  voiceWhatsappBtn: {
    backgroundColor: '#059669',
    flex: 1.25,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceWhatsappBtnLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  textWhatsappBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.2,
    borderColor: '#A7F3D0',
    flex: 0.95,
  },
  textWhatsappBtnLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: -0.2,
  },
});
