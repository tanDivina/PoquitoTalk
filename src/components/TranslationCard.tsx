import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../theme/colors';
import {
  generateGoogleGeminiAudio,
  playGoogleAudioFile,
  stopAllAudioPlayback,
  GOOGLE_SPANISH_VOICES,
  VoiceOption,
} from '../services/googleVoice';
import { AnimatedParrotMascot } from './AnimatedParrotMascot';
import { DirectoryCard } from './DirectoryCard';
import { getMatchingProviderForCategory } from '../services/directory';
import { walkieTalkieService } from '../services/walkieTalkie';
import { shareWalkieTalkieToWhatsApp } from '../services/deepLinks';
import { shareVoiceNoteToWhatsApp, sendTextToWhatsApp } from '../services/sharing';

interface TranslationCardProps {
  inputText: string;
  outputText: string;
  fromLang: string;
  toLang: string;
  category?: string;
  onSave?: () => void;
  isSaved?: boolean;
  initialVoice?: VoiceOption;
  onSelectQuickPrompt?: (prompt: string, categoryTitle?: string) => void;
}

export const TranslationCard: React.FC<TranslationCardProps> = ({
  inputText,
  outputText,
  fromLang,
  toLang,
  category,
  onSave,
  isSaved = false,
  initialVoice,
  onSelectQuickPrompt,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(initialVoice || GOOGLE_SPANISH_VOICES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSharingVoice, setIsSharingVoice] = useState(false);
  const [copied, setCopied] = useState(false);
  const contextualSponsor = getMatchingProviderForCategory(category);

  // Clean, high-quality translation output text directly
  const currentDisplayText = outputText;

  useEffect(() => {
    if (initialVoice) {
      setSelectedVoice(initialVoice);
    }
  }, [initialVoice]);

  // Play audio using selected Voice Persona or Native TTS
  const handlePlayTTS = async () => {
    if (!currentDisplayText) return;

    if (isPlaying) {
      await stopAllAudioPlayback();
      setIsPlaying(false);
      return;
    }

    // Stop any existing sound globally
    await stopAllAudioPlayback();
    setIsPlaying(true);

    try {
      // 1. Synthesize audio file via Google Speech API with SSML if API key available
      const fileUri = await generateGoogleGeminiAudio(currentDisplayText, selectedVoice.id);
      if (fileUri) {
        const sound = await playGoogleAudioFile(fileUri, selectedVoice);
        if (sound) {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              sound.unloadAsync();
            }
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Google audio playback:', e);
    }

    // 2. Native Expo Speech Fallback
    let speechText = currentDisplayText;
    const isQuestion = speechText.includes('?') || speechText.includes('¿');
    if (isQuestion && !speechText.startsWith('¿')) {
      speechText = `¿${speechText}`;
    }

    const isMale = selectedVoice.gender === 'MALE';
    const basePitch = isMale ? 0.92 : 1.04;
    const finalPitch = isQuestion ? basePitch + 0.04 : basePitch;

    Speech.speak(speechText, {
      language: 'es-US',
      pitch: finalPitch,
      rate: 0.82, // Calm, natural conversational pace (not rushed)
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(currentDisplayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsAppText = async () => {
    await sendTextToWhatsApp(currentDisplayText);
  };

  // Send AUDIO VOICE NOTE (.mp3 file) to WhatsApp
  const handleSendWhatsAppVoiceNote = async () => {
    try {
      setIsSharingVoice(true);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        await handleSendWhatsAppText();
        setIsSharingVoice(false);
        return;
      }

      let audioUri = await generateGoogleGeminiAudio(currentDisplayText, selectedVoice.id);
      if (audioUri) {
        await shareVoiceNoteToWhatsApp(audioUri, 'Contact', currentDisplayText);
      } else {
        await handleSendWhatsAppText();
      }
    } catch (error) {
      await handleSendWhatsAppText();
    } finally {
      setIsSharingVoice(false);
    }
  };

  const handleStartWalkieTalkie = async () => {
    const session = walkieTalkieService.createSession();
    await shareWalkieTalkieToWhatsApp(session.shareUrl, 'Amigo');
    Alert.alert('Magic Walkie-Talkie Active!', `Sent link to WhatsApp. The contractor can speak Spanish voice audio without installing an app!`);
  };

  const QUICK_SCENARIOS = [
    {
      id: 'water',
      icon: 'water-pump',
      title: 'Water Delivery Refill',
      prompt: 'Hi! Do you have a water tanker truck available to fill a reserve cistern tank at my property today?',
      category: 'Water Delivery & Cisterns',
    },
    {
      id: 'ac',
      icon: 'snowflake',
      title: 'A/C Leaking Repair',
      prompt: 'Hello, the air conditioner in the main bedroom is leaking water and not cooling. Can someone inspect it today?',
      category: 'Air Conditioning (A/C)',
    },
    {
      id: 'boat',
      icon: 'ferry',
      title: 'Water Taxi to Old Bank',
      prompt: 'Hi Captain! Are you available to take two of us to Old Bank on Bastimentos tonight, and how much would it be for the two of us?',
      category: 'Water Taxi & Boats',
    },
    {
      id: 'power',
      icon: 'flash',
      title: 'Power Outage Check',
      prompt: 'Hi, is there a power outage or blackout affecting our sector in Bocas right now?',
      category: 'Power Outages & Generators',
    },
    {
      id: 'vet',
      icon: 'paw',
      title: 'Urgent Vet Consultation',
      prompt: 'Hello! My dog is showing signs of cane toad contact / fever. Is the vet clinic open right now?',
      category: 'Pet Care & Island Vet',
    },
    {
      id: 'taxi',
      icon: 'taxi',
      title: 'Taxi to Bluff Beach',
      prompt: 'Hi! Are you available for a land taxi ride to Playa Bluff from Bocas Town today?',
      category: 'Land Taxi & Drivers',
    },
  ];

  if (!inputText && !outputText) {
    return (
      <View style={styles.placeholderCard}>
        {/* Local Spanish Voice Notes Badge */}
        <View style={styles.dialectBadge}>
          <Text style={styles.dialectText}>Instant Spanish Voice Notes • Bocas del Toro</Text>
        </View>

        <Text style={styles.placeholderTitle}>Quick 1-Tap Island Scenarios</Text>
        <Text style={styles.placeholderDesc}>
          Tap any scenario below for instant Panamanian Spanish translations & voice notes:
        </Text>

        {/* Quick Island Scenario Chips Grid */}
        <View style={styles.quickGrid}>
          {QUICK_SCENARIOS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickChip}
              onPress={() => onSelectQuickPrompt && onSelectQuickPrompt(item.prompt, item.category)}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons name={item.icon as any} size={16} color="#0F172A" />
              <Text style={styles.quickChipText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2-Way Magic Walkie-Talkie CTA */}
        <TouchableOpacity
          style={styles.walkieBtn}
          onPress={handleStartWalkieTalkie}
          activeOpacity={0.8}
        >
          <Ionicons name="radio-outline" size={18} color="#FFF" />
          <Text style={styles.walkieBtnText}>Start 2-Way Walkie-Talkie Channel</Text>
        </TouchableOpacity>
        <Text style={styles.walkieSubtext}>
          Contractors speak Spanish via WhatsApp — audio translates into English automatically.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      )}

      <View style={styles.sectionBlock}>
        <View style={styles.outputHeader}>
          <Text style={styles.outputLabel}>SPANISH</Text>
          
          {/* Simple 2-Option Voice Toggle (♂ Male / ♀ Female) */}
          <View style={styles.voiceToggleRow}>
            {GOOGLE_SPANISH_VOICES.map((v) => {
              const isSelected = selectedVoice.id === v.id || selectedVoice.gender === v.gender;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.voiceToggleBtn, isSelected && styles.voiceToggleBtnActive]}
                  onPress={() => setSelectedVoice(v)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.voiceToggleBtnText, isSelected && styles.voiceToggleBtnTextActive]}>
                    {v.gender === 'MALE' ? '♂ Male' : '♀ Female'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.outputText}>{currentDisplayText}</Text>
      </View>

      {/* Action Bar Container */}
      <View style={styles.actionsBarContainer}>
        {/* Row 1: In-Person Speaker Audio, Copy, Save */}
        <View style={styles.topUtilityRow}>
          {/* In-Person Speaker Audio Playback (Icon Only) */}
          <TouchableOpacity
            style={[styles.speakerIconBtn, isPlaying && styles.actionBtnActive]}
            onPress={handlePlayTTS}
            activeOpacity={0.7}
            accessibilityLabel={isPlaying ? 'Stop Audio' : 'Play Speaker Audio'}
          >
            <Ionicons
              name={isPlaying ? 'stop-circle' : 'volume-high'}
              size={18}
              color={isPlaying ? '#BA1A1A' : '#0F172A'}
            />
          </TouchableOpacity>

          {/* Copy Button */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.7}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={16}
              color={copied ? '#059669' : '#0F172A'}
            />
            <Text style={[styles.actionText, copied && styles.actionTextSuccess]}>
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </TouchableOpacity>

          {/* Save Button */}
          {onSave && (
            <TouchableOpacity style={styles.actionBtn} onPress={onSave} activeOpacity={0.7}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={isSaved ? '#059669' : '#0F172A'}
              />
              <Text style={[styles.actionText, isSaved && styles.actionTextSuccess]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Row 2: Dual WhatsApp Dispatch Options (Text & Voice Note) */}
        <View style={styles.dualDispatchRow}>
          <TouchableOpacity
            style={styles.dispatchTextBtn}
            onPress={handleSendWhatsAppText}
            activeOpacity={0.85}
          >
            <FontAwesome5 name="whatsapp" size={15} color="#059669" />
            <Text style={styles.dispatchTextBtnLabel}>Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dispatchVoiceBtn}
            onPress={handleSendWhatsAppVoiceNote}
            disabled={isSharingVoice}
            activeOpacity={0.85}
          >
            {isSharingVoice ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <FontAwesome5 name="whatsapp" size={15} color="#FFF" />
                <Text style={styles.dispatchVoiceBtnLabel}>Voice Note</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Row 3: 2-Way Magic Walkie-Talkie Channel Trigger */}
        <TouchableOpacity
          style={styles.walkieInlineBtn}
          onPress={handleStartWalkieTalkie}
          activeOpacity={0.8}
        >
          <Ionicons name="radio" size={15} color="#2563EB" />
          <Text style={styles.walkieInlineBtnText}>Start 2-Way PoquitoTalkie Live Channel</Text>
        </TouchableOpacity>

        {/* Contextual Local Sponsor Ad */}
        {contextualSponsor && (
          <View style={styles.contextualAdSection}>
            <Text style={styles.contextualAdHeader}>RELEVANT LOCAL SERVICE SPONSOR</Text>
            <DirectoryCard provider={contextualSponsor} translatedMessage={currentDisplayText} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholderCard: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 8,
  },
  placeholderDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  sectionBlock: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputText: {
    fontSize: 15,
    color: Colors.onBackground,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainer,
    marginVertical: 12,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  outputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  voiceToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
  },
  voiceToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 11,
  },
  voiceToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  voiceToggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  voiceToggleBtnTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  outputText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.onBackground,
    lineHeight: 24,
  },
  actionsBarContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
    gap: 10,
  },
  topUtilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speakerIconBtn: {
    width: 44,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainer,
    paddingVertical: 10,
    borderRadius: 14,
  },
  actionBtnActive: {
    backgroundColor: '#FDE8E8',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  actionTextActive: {
    color: '#BA1A1A',
    fontWeight: '700',
  },
  actionTextSuccess: {
    color: Colors.tertiary,
    fontWeight: '700',
  },
  fullWidthWhatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.whatsapp,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: Colors.whatsapp,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  fullWidthWhatsappBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  contextualAdSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  contextualAdHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  walkieBtn: {
    marginTop: 14,
    backgroundColor: Colors.secondary || '#A04A26',
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  walkieBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13.5,
  },
  walkieSubtext: {
    fontSize: 11,
    color: Colors.outline,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  dialectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.tertiaryContainer || '#F6F0E6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    marginBottom: 6,
  },
  dialectFlag: {
    fontSize: 12,
  },
  dialectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5A4632',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    marginBottom: 4,
    justifyContent: 'center',
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainer || '#F5F5F5',
    borderWidth: 1,
    borderColor: Colors.cardBorder || '#E8E4DE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onBackground || '#222',
  },
  voiceOptionTone: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  toneSliderContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  toneMascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tonePillsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainer || '#F1ECE4',
    padding: 4,
    borderRadius: 20,
  },
  tonePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  tonePillActive: {
    backgroundColor: '#047857',
    borderColor: '#047857',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tonePillActiveFull: {
    backgroundColor: '#B45309',
    borderColor: '#B45309',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toneIcon: {
    fontSize: 12,
  },
  tonePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.onSurfaceVariant || '#64748B',
  },
  tonePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dualDispatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  dispatchTextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    paddingVertical: 12,
    borderRadius: 14,
  },
  dispatchTextBtnLabel: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '800',
  },
  dispatchVoiceBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  dispatchVoiceBtnLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  walkieInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  walkieInlineBtnText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
});
