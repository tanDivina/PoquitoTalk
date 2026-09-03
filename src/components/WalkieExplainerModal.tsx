import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from '../services/audioCompat';
import * as Speech from 'expo-speech';
import { WhatsAppIcon } from './WhatsAppIcon';
import { WalkieTalkieIcon } from './WalkieTalkieIcon';
import { Colors } from '../theme/colors';
import { PoquitoAvatar } from './PoquitoAvatar';
import { translateWithGemma } from '../services/gemma';
import { generateGoogleGeminiAudio } from '../services/googleVoice';

interface WalkieExplainerModalProps {
  visible: boolean;
  onClose: () => void;
  onLaunch: (topicEs?: string, topicEn?: string, audioBase64?: string) => void;
  initialTopicEs?: string;
  initialTopicEn?: string;
  selectedVoiceId?: string;
}

const QUICK_TOPICS = [
  { label: 'Plumbing & Water', es: '¡Buenas! Tengo una consulta sobre el agua y la plomería de mi casa. ¿Tiene disponibilidad para revisar?', en: 'Plumbing and water inquiry' },
  { label: 'A/C & Electric', es: '¡Buenas! El aire acondicionado no está enfriando bien. ¿Podría venir un técnico a revisarlo?', en: 'A/C and electrical repair' },
  { label: 'Water Taxi', es: '¡Buenas Capitán! ¿Tiene disponibilidad para un viaje en lancha hoy y cuánto saldría?', en: 'Water taxi and transport inquiry' },
  { label: 'Price & Schedule', es: '¡Buenas! Quisiera consultar sobre los precios y su disponibilidad esta semana.', en: 'Price and schedule inquiry' },
];

/**
 * WalkieExplainerModal
 * 
 * Clean 3-step explainer for the 2-Way Walkie-Talkie Channel.
 * Allows client to type or select an inquiry, preview authentic Spanish voice audio,
 * and launch the private 2-way live translation room.
 */
export const WalkieExplainerModal: React.FC<WalkieExplainerModalProps> = ({
  visible,
  onClose,
  onLaunch,
  initialTopicEs,
  initialTopicEn,
  selectedVoiceId,
}) => {
  const [topicEs, setTopicEs] = useState(initialTopicEs || '');
  const [topicEn, setTopicEn] = useState(initialTopicEn || '');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [cachedAudioB64, setCachedAudioB64] = useState<string>('');
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (visible) {
      const en = initialTopicEn || '';
      const es = initialTopicEs || '';
      setTopicEn(en);
      setTopicEs(es);
      setCachedAudioB64('');
      
      // Auto-translate if English is provided without Spanish
      if (en.trim().length > 0 && (!es || es === en)) {
        handleAutoTranslate(en);
      }
    } else {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      setIsPlayingAudio(false);
    }
  }, [visible, initialTopicEs, initialTopicEn]);

  const handleAutoTranslate = async (text: string) => {
    if (!text || !text.trim()) {
      setTopicEs('');
      setCachedAudioB64('');
      return;
    }
    setIsTranslating(true);
    try {
      const translated = await translateWithGemma(text.trim(), 'en', 'es');
      setTopicEs(translated);
      setCachedAudioB64('');
    } catch (e) {
      setTopicEs(text.trim());
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePreviewAudio = async () => {
    const textToSpeak = topicEs.trim() || topicEn.trim();
    if (!textToSpeak) return;

    if (isPlayingAudio) {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
      }
      Speech.stop();
      setIsPlayingAudio(false);
      return;
    }

    setIsGeneratingAudio(true);
    try {
      let b64 = cachedAudioB64;
      if (!b64) {
        try {
          const audioUri = await generateGoogleGeminiAudio(textToSpeak, selectedVoiceId || 'es-PA-Standard-A');
          if (audioUri) {
            const FileSystem = require('expo-file-system/legacy');
            const raw = await FileSystem.readAsStringAsync(audioUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            if (raw) {
              b64 = `data:audio/mp3;base64,${raw}`;
              setCachedAudioB64(b64);
            }
          }
        } catch (genErr) {
          console.warn('Preview audio generation fallback:', genErr);
        }
      }

      if (b64) {
        if (soundRef.current) {
          await soundRef.current.unloadAsync().catch(() => {});
        }
        const { sound } = await Audio.Sound.createAsync(
          { uri: b64 },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setIsPlayingAudio(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlayingAudio(false);
          }
        });
      } else {
        setIsPlayingAudio(true);
        Speech.speak(textToSpeak, {
          language: 'es-PA',
          rate: 0.95,
          onDone: () => setIsPlayingAudio(false),
          onError: () => setIsPlayingAudio(false),
        });
      }
    } catch (err) {
      console.warn('Audio preview error:', err);
      setIsPlayingAudio(false);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleLaunchChannel = async () => {
    let finalEs = topicEs.trim();
    let finalEn = topicEn.trim();

    if (!finalEs && finalEn) {
      try {
        finalEs = await translateWithGemma(finalEn, 'en', 'es');
      } catch (e) {
        finalEs = finalEn;
      }
    }

    let audioData = cachedAudioB64;
    if (!audioData && finalEs) {
      try {
        const audioUri = await generateGoogleGeminiAudio(finalEs, selectedVoiceId || 'es-PA-Standard-A');
        if (audioUri) {
          const FileSystem = require('expo-file-system/legacy');
          const raw = await FileSystem.readAsStringAsync(audioUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          if (raw) {
            audioData = `data:audio/mp3;base64,${raw}`;
          }
        }
      } catch (e) {
        console.warn('Launch audio gen fallback:', e);
      }
    }

    if (soundRef.current) {
      soundRef.current.stopAsync().catch(() => {});
    }
    Speech.stop();
    setIsPlayingAudio(false);

    onClose();
    onLaunch(finalEs, finalEn, audioData);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar with Dismiss and Close */}
          <View style={styles.topBar}>
            <View style={styles.topBadge}>
              <WalkieTalkieIcon size={14} color="#1A1208" />
              <Text style={styles.topBadgeText}>2-WAY WALKIE-TALKIE CHANNEL</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={18} color="#6B5E51" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Mascot Visual Stance */}
            <View style={styles.mascotBox}>
              <PoquitoAvatar state="talkie-standby" size={68} />
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>LIVE AUDIO TRANSLATOR</Text>
              </View>
            </View>

            {/* Value Proposition */}
            <Text style={styles.headline}>
              2-Way Voice Translation
            </Text>
            <Text style={styles.subheadline}>
              Speak English with local Spanish contractors with zero language barrier:
            </Text>

            {/* Subject / Opening Message Card */}
            <View style={styles.topicBox}>
              <View style={styles.topicHeaderRow}>
                <Ionicons name="bookmark" size={13} color="#C2410C" />
                <Text style={styles.topicLabel}>WHAT WOULD YOU LIKE TO ASK?</Text>
              </View>

              <TextInput
                style={styles.topicInput}
                placeholder="e.g. Can you inspect the water pump?"
                placeholderTextColor="#9C9082"
                value={topicEn}
                onChangeText={(text) => {
                  setTopicEn(text);
                  setCachedAudioB64('');
                }}
                onBlur={() => {
                  if (topicEn.trim().length > 0) {
                    handleAutoTranslate(topicEn);
                  }
                }}
              />

              {/* Quick Topic Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}>
                {QUICK_TOPICS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.chip,
                      topicEn === item.en && styles.chipActive
                    ]}
                    onPress={() => {
                      setTopicEn(item.en);
                      setTopicEs(item.es);
                      setCachedAudioB64('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.chipText,
                      topicEn === item.en && styles.chipTextActive
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Live Spanish Translation & Audio Preview Box */}
              {(topicEs.length > 0 || isTranslating) && (
                <View style={styles.spanishPreviewBox}>
                  <View style={styles.spanishPreviewHeader}>
                    <Ionicons name="volume-medium" size={13} color="#15803D" />
                    <Text style={styles.spanishPreviewTag}>SPANISH VOICE NOTE PREVIEW</Text>
                    {isTranslating && <ActivityIndicator size="small" color="#15803D" style={{ marginLeft: 6 }} />}
                  </View>

                  <Text style={styles.spanishPreviewText}>
                    "{topicEs}"
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.previewAudioBtn,
                      isPlayingAudio && styles.previewAudioBtnPlaying
                    ]}
                    onPress={handlePreviewAudio}
                    disabled={isGeneratingAudio || isTranslating}
                    activeOpacity={0.8}
                  >
                    {isGeneratingAudio ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons
                          name={isPlayingAudio ? 'pause' : 'play'}
                          size={13}
                          color="#FFFFFF"
                        />
                        <Text style={styles.previewAudioBtnText}>
                          {isPlayingAudio ? 'Pause Audio' : 'Preview Voice Note'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 3 Step Breakdown */}
            <View style={styles.stepsContainer}>
              {/* Step 1 */}
              <View style={styles.stepCard}>
                <View style={[styles.stepNumberCircle, { backgroundColor: '#25D366' }]}>
                  <WhatsAppIcon size={14} color="#FFF" />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>1. Share Private Link</Text>
                  <Text style={styles.stepDesc}>
                    Your contractor opens the channel in their browser. <Text style={{ fontWeight: '700', color: Colors.onBackground }}>They do not need to install an app.</Text>
                  </Text>
                </View>
              </View>

              {/* Step 2 */}
              <View style={styles.stepCard}>
                <View style={[styles.stepNumberCircle, { backgroundColor: Colors.secondary }]}>
                  <MaterialCommunityIcons name="microphone" size={15} color="#FFF" />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>2. Contractor Speaks Spanish</Text>
                  <Text style={styles.stepDesc}>
                    They tap Poquito in their browser to send natural Spanish voice notes.
                  </Text>
                </View>
              </View>

              {/* Step 3 */}
              <View style={styles.stepCard}>
                <View style={[styles.stepNumberCircle, { backgroundColor: Colors.tertiary }]}>
                  <Ionicons name="volume-high" size={15} color="#FFF" />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>3. You Hear & Read English</Text>
                  <Text style={styles.stepDesc}>
                    Poquito translates their Spanish voice into English right here in real time.
                  </Text>
                </View>
              </View>
            </View>

            {/* Trust Notice */}
            <View style={styles.noticeCard}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.emeraldDark} />
              <Text style={styles.noticeText}>
                No registration required for your contractor. Instant live sync on iPhone and Android.
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.launchBtn}
              onPress={handleLaunchChannel}
              activeOpacity={0.88}
            >
              <WalkieTalkieIcon size={16} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.launchBtnText}>Create 2-Way Channel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderColor: '#E8E1D7',
    maxHeight: '90%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFDBCD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FD9A6F',
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none', outline: 'none' } as any : {}),
  },
  scrollBody: {
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  mascotBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0EA',
    borderColor: '#FED7AA',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 17.5,
    fontWeight: '900',
    color: '#1B1C1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  subheadline: {
    fontSize: 12.5,
    color: '#6B5E51',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 17,
  },
  topicBox: {
    backgroundColor: '#FFF8F3',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  topicLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.5,
  },
  topicInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE6E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    fontWeight: '600',
    color: '#1B1C1A',
    marginBottom: 8,
  },
  chipsScroll: {
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 100,
  },
  chipActive: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FDBA74',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B5E51',
  },
  chipTextActive: {
    color: '#C2410C',
    fontWeight: '800',
  },
  spanishPreviewBox: {
    marginTop: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 10,
  },
  spanishPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  spanishPreviewTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
  },
  spanishPreviewText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14532D',
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  previewAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  previewAudioBtnPlaying: {
    backgroundColor: '#DC2626',
  },
  previewAudioBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepsContainer: {
    gap: 10,
    marginBottom: 14,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EAE6E0',
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1B1C1A',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#4D463E',
    lineHeight: 17,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F7EE',
    borderColor: '#D5E8D1',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  noticeText: {
    fontSize: 11.5,
    color: Colors.tertiary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EBE6DF',
    backgroundColor: '#FAF8F5',
    gap: 4,
  },
  launchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    paddingVertical: 13,
    borderRadius: 16,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  launchBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7E766D',
  },
});

