import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { WhatsAppIcon } from './WhatsAppIcon';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
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
import { RecipientDispatchModal } from './RecipientDispatchModal';
import { getPlaybackSpeed, getPreferredVoiceGender, setPreferredVoiceGender } from '../services/storage';
import { deductCreditForWalkieTalkie } from '../services/userService';

interface TranslationCardProps {
  inputText: string;
  outputText: string;
  fromLang: string;
  toLang: string;
  category?: string;
  onSave?: () => void;
  isSaved?: boolean;
  initialVoice?: VoiceOption;
  onSelectQuickPrompt?: (prompt: string, category?: string) => void;
  onStartWalkie?: (spanishText: string, englishText: string) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  showSponsor?: boolean;
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
  onStartWalkie,
  onPlayingChange,
  showSponsor = false,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(initialVoice || GOOGLE_SPANISH_VOICES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSharingVoice, setIsSharingVoice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchType, setDispatchType] = useState<'voice_note' | 'text'>('voice_note');
  const [preparedAudioUri, setPreparedAudioUri] = useState<string | null>(null);
  const contextualSponsor = showSponsor ? getMatchingProviderForCategory(category) : undefined;

  // Clean, high-quality translation output text directly
  const currentDisplayText = outputText;

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    (async () => {
      if (initialVoice) {
        setSelectedVoice(initialVoice);
      } else {
        const savedGender = await getPreferredVoiceGender();
        const voice = GOOGLE_SPANISH_VOICES.find((v) => v.gender === savedGender) || GOOGLE_SPANISH_VOICES[0];
        setSelectedVoice(voice);
      }
    })();
  }, [initialVoice]);

  const handleSelectVoiceGender = async (gender: 'MALE' | 'FEMALE') => {
    const voice = GOOGLE_SPANISH_VOICES.find((v) => v.gender === gender) || GOOGLE_SPANISH_VOICES[0];
    setSelectedVoice(voice);
    await setPreferredVoiceGender(gender);
  };

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

    const savedSpeed = await getPlaybackSpeed();
    const isMale = selectedVoice.gender === 'MALE';

    // 1. First Priority: Hyper-Realistic Studio Voice (ElevenLabs / Google)
    try {
      const fileUri = await generateGoogleGeminiAudio(currentDisplayText, isMale ? 'Male' : 'Female');
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
      console.warn('High-def voice playback error, falling back to device TTS:', e);
    }

    // 2. Native Speech with Explicit Male/Female Device Voice Resolution
    let speechText = currentDisplayText;
    const isQuestion = speechText.includes('?') || speechText.includes('¿');
    if (isQuestion && !speechText.startsWith('¿')) {
      speechText = `¿${speechText}`;
    }

    const basePitch = isMale ? 0.75 : 1.10;
    const finalPitch = isQuestion ? basePitch + 0.04 : basePitch;
    const rate = savedSpeed === '0.75x' ? 0.70 : 0.85;

    try {
      const availableVoices = await Speech.getAvailableVoicesAsync();
      const spanishVoices = availableVoices.filter((v) => v.language.toLowerCase().includes('es'));
      let targetVoice = undefined;

      if (isMale) {
        targetVoice = spanishVoices.find(
          (v) =>
            v.name.toLowerCase().includes('jorge') ||
            v.name.toLowerCase().includes('juan') ||
            v.name.toLowerCase().includes('diego') ||
            v.name.toLowerCase().includes('carlos') ||
            v.name.toLowerCase().includes('miguel') ||
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

      Speech.speak(speechText, {
        language: 'es-419',
        voice: targetVoice ? targetVoice.identifier : undefined,
        pitch: finalPitch,
        rate,
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch (err) {
      Speech.speak(speechText, {
        language: 'es-419',
        pitch: finalPitch,
        rate,
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(currentDisplayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsAppText = () => {
    setPreparedAudioUri(null);
    setDispatchType('text');
    setShowDispatchModal(true);
  };

  // Send AUDIO VOICE NOTE (.mp3 file) to WhatsApp with Recipient Selection
  const handleSendWhatsAppVoiceNote = async () => {
    try {
      setIsSharingVoice(true);
      const audioUri = await generateGoogleGeminiAudio(currentDisplayText, selectedVoice.id);
      setPreparedAudioUri(audioUri);
      setDispatchType('voice_note');
      setShowDispatchModal(true);
    } catch (error) {
      console.warn('Voice prep error:', error);
      setPreparedAudioUri(null);
      setDispatchType('voice_note');
      setShowDispatchModal(true);
    } finally {
      setIsSharingVoice(false);
    }
  };

  const handleStartWalkieTalkie = async () => {
    const deductRes = await deductCreditForWalkieTalkie('Translation Card');
    if (!deductRes.success) {
      Alert.alert(
        'Credits Needed',
        'You have used your free credits. Get the 50 Credits Pack ($4.99) or upgrade to the Annual Pass for unlimited Walkie-Talkie sessions!',
        [{ text: 'OK' }]
      );
      return;
    }
    const topicEs = outputText ? outputText.trim() : 'Consulta general';
    const topicEn = inputText ? inputText.trim() : 'General service inquiry';

    let initialAudioBase64 = '';
    if (topicEs) {
      try {
        const audioUri = preparedAudioUri || (await generateGoogleGeminiAudio(topicEs, selectedVoice.id));
        if (audioUri) {
          const rawB64 = await FileSystem.readAsStringAsync(audioUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          if (rawB64) {
            initialAudioBase64 = `data:audio/mp3;base64,${rawB64}`;
          }
        }
      } catch (audioErr) {
        console.warn('Initial audio generation fallback in TranslationCard:', audioErr);
      }
    }

    const session = walkieTalkieService.createSession(undefined, topicEn, topicEs, topicEn, initialAudioBase64);
    await shareWalkieTalkieToWhatsApp(session.shareUrl, 'Amigo', topicEs, topicEn);
    Alert.alert('Magic Walkie-Talkie Active', `Sent link to WhatsApp with your inquiry subject. The contractor can speak Spanish voice audio without installing an app!`);
  };

  const QUICK_SCENARIOS = [
    {
      id: 'water',
      icon: 'water-pump',
      title: 'Water Delivery Refill',
      prompt: 'Hi! Do you have a water tanker truck available to fill a 1,500 gallon reserve tank at my property today?',
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
      <View style={styles.compactPresetsContainer}>
        <View style={styles.compactHeaderRow}>
          <Text style={styles.compactHeading}>QUICK ISLAND SCENARIOS</Text>
          <Text style={styles.compactSwipeHint}>Swipe for more ➔</Text>
        </View>

        {/* Horizontal Scrolling Chips Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.compactScrollContent}
        >
          {QUICK_SCENARIOS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.compactChip}
              onPress={() => onSelectQuickPrompt && onSelectQuickPrompt(item.prompt, item.category)}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons name={item.icon as any} size={15} color={Colors.secondary} />
              <Text style={styles.compactChipText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          <Text style={styles.outputLabel}>PANAMANIAN SPANISH</Text>


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
            <WhatsAppIcon size={15} color="#059669" />
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
                <WhatsAppIcon size={15} color="#FFF" />
                <Text style={styles.dispatchVoiceBtnLabel}>Voice Note</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Walkie-Talkie 2-Way Live Channel Option */}
        {onStartWalkie && (
          <TouchableOpacity
            style={styles.walkieInlineBtn}
            onPress={() => onStartWalkie(currentDisplayText, inputText)}
            activeOpacity={0.85}
          >
            <Ionicons name="radio" size={15} color="#C2410C" />
            <Text style={styles.walkieInlineBtnText}>Talk 2-Way Live (Walkie Channel)</Text>
            <Ionicons name="arrow-forward" size={13} color="#C2410C" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        )}

        {/* Contextual Local Sponsor Ad */}
        {contextualSponsor && (
          <View style={styles.contextualAdSection}>
            <Text style={styles.contextualAdHeader}>RELEVANT LOCAL SERVICE SPONSOR</Text>
            <DirectoryCard provider={contextualSponsor} translatedMessage={currentDisplayText} />
          </View>
        )}
      </View>

      {/* Recipient Dispatcher Modal */}
      <RecipientDispatchModal
        visible={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        audioUri={preparedAudioUri}
        spanishText={currentDisplayText}
        dispatchType={dispatchType}
        presetCategory={category}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  compactPresetsContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  compactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  compactHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7E766D',
    letterSpacing: 0.8,
  },
  compactSwipeHint: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
  },
  compactScrollContent: {
    gap: 8,
    paddingRight: 12,
  },
  compactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E4DE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  compactChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1B1C1A',
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
    marginBottom: 6,
  },
  outputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  voiceGenderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 2,
    gap: 2,
  },
  voiceGenderBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  voiceGenderBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  voiceGenderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  voiceGenderBtnTextActive: {
    color: Colors.secondary,
    fontWeight: '800',
  },
  voiceAndSpeedGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rateToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rateToggleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  rateToggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  rateToggleBtnTextActive: {
    color: '#047857',
    fontWeight: '800',
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
  walkieFlowIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  walkieFlowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  walkieFlowPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  howItWorksGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
    marginBottom: 10,
    width: '100%',
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideStepNumberCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideStepNumber: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  guideStepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
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
    paddingHorizontal: 10,
    borderRadius: 14,
    overflow: 'visible',
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
    paddingHorizontal: 10,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'visible',
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
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFDBCD',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  walkieInlineBtnText: {
    color: '#C2410C',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
