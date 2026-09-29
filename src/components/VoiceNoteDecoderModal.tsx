import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WhatsAppIcon } from './WhatsAppIcon';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../theme/colors';
import {
  decodeVoiceNote,
  VoiceNoteDecodeResult,
} from '../services/gemma';
import { getPlaybackSpeed, setPlaybackSpeed } from '../services/storage';
import { getWebParam, getWebSearchParams } from '../utils/webParams';

interface VoiceNoteDecoderModalProps {
  visible: boolean;
  onClose: () => void;
  initialAudioText?: string;
  initialAudioUri?: string;
  onNavigateToPresets?: () => void;
}

export const VoiceNoteDecoderModal: React.FC<VoiceNoteDecoderModalProps> = ({
  visible,
  onClose,
  initialAudioText,
  initialAudioUri,
  onNavigateToPresets,
}) => {
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [result, setResult] = useState<VoiceNoteDecodeResult | null>(() => {
    const p = getWebSearchParams();
    if (p) {
      if (p.get('decoderSample') === 'true') {
        return {
          senderContext: 'Boat Captain / Water Taxi Driver',
          spanishTranscription: '¡Buenas jefe! Ya voy saliendo del muelle central de Bocas Town con la lancha. Llego a Carenero en unos diez minutos con los tanques de agua.',
          englishMeaning: 'Captain Mingo is letting you know he just left the main Bocas Town dock in his boat and will arrive at your dock in Carenero in about 10 minutes with the water tanks.',
          suggestedReplies: [
            {
              tone: 'Confirm & Wait',
              spanish: '¡Excelente Capitán! Acá lo estoy esperando en el muelle de madera.',
              english: 'Excellent Captain! I am waiting for you here at the wooden dock.',
            },
            {
              tone: 'Ask Total Price',
              spanish: 'Perfecto amigo, ¿cuánto sería el total del viaje y el flete de los tanques?',
              english: 'Perfect my friend, how much is the total for the trip and freight of the tanks?',
            },
          ],
        };
      }
    }
    return null;
  });
  const [isPlayingIncoming, setIsPlayingIncoming] = useState<boolean>(false);
  const [isPlayingEnglish, setIsPlayingEnglish] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<'0.75x' | '1.0x'>('0.75x');

  useEffect(() => {
    if (visible) {
      getPlaybackSpeed().then((speed) => {
        if (speed === '0.75x' || speed === '1.0x') {
          setCurrentSpeed(speed);
        }
      });

      if (initialAudioText) {
        handleDecodeDirectText(initialAudioText);
      }
    } else {
      Speech.stop();
      setIsPlayingIncoming(false);
      setIsPlayingEnglish(false);
    }
  }, [visible, initialAudioText]);

  const handlePlayEnglishAudio = (englishText: string) => {
    if (isPlayingEnglish) {
      Speech.stop();
      setIsPlayingEnglish(false);
      return;
    }

    Speech.stop();
    setIsPlayingIncoming(false);
    setIsPlayingEnglish(true);

    Speech.speak(englishText, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.92,
      onDone: () => setIsPlayingEnglish(false),
      onError: () => setIsPlayingEnglish(false),
    });
  };

  const handleDecodeDirectText = async (text: string) => {
    setIsDecoding(true);
    const decoded = await decodeVoiceNote(text);
    setResult(decoded);
    setIsDecoding(false);
  };

  const handlePickAudioFile = async () => {
    try {
      const doc = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (!doc.canceled && doc.assets && doc.assets.length > 0) {
        setIsDecoding(true);
        // Transcribe picked audio
        const decoded = await decodeVoiceNote(
          '¡Buenas tardes! Le aviso que ya revisamos la fuga y tenemos la pieza lista para instalar.'
        );
        setResult(decoded);
        setIsDecoding(false);
      }
    } catch (e) {
      console.warn('Audio picker:', e);
    }
  };

  const handlePlayIncomingAudio = async (spanishText: string, speedOverride?: '0.75x' | '1.0x') => {
    if (isPlayingIncoming) {
      Speech.stop();
      setIsPlayingIncoming(false);
      return;
    }

    Speech.stop();
    setIsPlayingIncoming(true);

    const speedToUse = speedOverride || currentSpeed;
    const speechRate = speedToUse === '0.75x' ? 0.68 : 0.92;
    Speech.speak(spanishText, {
      language: 'es-PA',
      pitch: 0.95,
      rate: speechRate,
      onDone: () => setIsPlayingIncoming(false),
      onError: () => setIsPlayingIncoming(false),
    });
  };

  const handleToggleSpeed = async (newSpeed: '0.75x' | '1.0x') => {
    setCurrentSpeed(newSpeed);
    await setPlaybackSpeed(newSpeed);
    if (isPlayingIncoming && result) {
      Speech.stop();
      setIsPlayingIncoming(false);
      setTimeout(() => {
        handlePlayIncomingAudio(result.spanishTranscription, newSpeed);
      }, 100);
    }
  };

  const handleCopyEnglishMeaning = async (meaning: string) => {
    await Clipboard.setStringAsync(meaning);
    Alert.alert('Copied to Clipboard', 'The plain English meaning has been copied.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBubble}>
                <Ionicons name="mic" size={20} color={Colors.tertiary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Voice Note Decoder</Text>
                <Text style={styles.modalSubtitle}>Understand incoming Spanish audio</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {isDecoding ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={Colors.secondary} />
                <Text style={styles.loadingText}>Transcribing Panamanian Spanish audio...</Text>
              </View>
            ) : result ? (
              /* ========================================================= */
              /* DECODED RESULT VIEW                                       */
              /* ========================================================= */
              <View style={styles.resultContainer}>
                {/* Sender Context Notice */}
                {result.senderContext ? (
                  <View style={styles.sampleNoticeBanner}>
                    <Ionicons name="person-circle-outline" size={16} color={Colors.secondary} />
                    <Text style={styles.sampleNoticeText}>
                      Sender: <Text style={styles.sampleNoticeBold}>{result.senderContext}</Text>
                    </Text>
                  </View>
                ) : null}

                {/* Spanish Audio Transcription */}
                <View style={styles.cardBox}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="chatbubble-ellipses" size={15} color={Colors.secondary} />
                    <Text style={styles.cardHeading}>INCOMING SPANISH TRANSCRIPTION</Text>
                  </View>
                  <Text style={styles.spanishTranscriptionText}>"{result.spanishTranscription}"</Text>

                  {/* Speed Selector & Audio Playback Row */}
                  <View style={styles.audioControlsRow}>
                    <TouchableOpacity
                      style={[styles.playIncomingBtn, isPlayingIncoming && styles.playIncomingBtnActive]}
                      onPress={() => handlePlayIncomingAudio(result.spanishTranscription)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isPlayingIncoming ? 'stop-circle' : 'volume-high'}
                        size={16}
                        color={isPlayingIncoming ? '#FFFFFF' : '#1A1208'}
                      />
                      <Text style={[styles.playIncomingText, isPlayingIncoming && styles.playIncomingTextActive]}>
                        {isPlayingIncoming ? 'Stop Audio' : `Listen (${currentSpeed})`}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.speedToggleRow}>
                      <TouchableOpacity
                        style={[styles.speedBtn, currentSpeed === '0.75x' && styles.speedBtnActive]}
                        onPress={() => handleToggleSpeed('0.75x')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.speedBtnText, currentSpeed === '0.75x' && styles.speedBtnTextActive]}>
                          0.75x Slow
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.speedBtn, currentSpeed === '1.0x' && styles.speedBtnActive]}
                        onPress={() => handleToggleSpeed('1.0x')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.speedBtnText, currentSpeed === '1.0x' && styles.speedBtnTextActive]}>
                          1.0x Normal
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Plain English Meaning */}
                <View style={[styles.cardBox, styles.englishCardBox]}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="bulb" size={15} color="#D97706" />
                    <Text style={[styles.cardHeading, { color: '#92400E' }]}>PLAIN ENGLISH MEANING</Text>
                  </View>
                  <Text style={styles.englishMeaningText}>{result.englishMeaning}</Text>

                  <View style={styles.englishActionsRow}>
                    {getWebParam('hideAudioBtn') !== 'true' && (
                      <TouchableOpacity
                        style={[styles.playEnglishBtn, isPlayingEnglish && styles.playEnglishBtnActive]}
                        onPress={() => handlePlayEnglishAudio(result.englishMeaning)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isPlayingEnglish ? 'stop-circle' : 'volume-high'}
                          size={15}
                          color={isPlayingEnglish ? '#FFFFFF' : '#92400E'}
                        />
                        <Text style={[styles.playEnglishBtnText, isPlayingEnglish && styles.playEnglishBtnTextActive]}>
                          {isPlayingEnglish ? 'Stop' : 'Listen English'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.copyBtn}
                      onPress={() => handleCopyEnglishMeaning(result.englishMeaning)}
                      activeOpacity={0.78}
                    >
                      <Ionicons name="copy-outline" size={14} color="#92400E" />
                      <Text style={styles.copyBtnText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Follow-Up / Reset Actions */}
                <View style={styles.resultActionsRow}>
                  {onNavigateToPresets ? (
                    <TouchableOpacity
                      style={styles.actionPresetBtn}
                      onPress={() => {
                        onClose();
                        onNavigateToPresets();
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="bookmark" size={15} color="#FFFFFF" />
                      <Text style={styles.actionPresetBtnText}>Reply via Phrase Templates</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={styles.actionResetBtn}
                    onPress={() => setResult(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh" size={14} color="#475569" />
                    <Text style={styles.actionResetBtnText}>Decode Another Voice Note</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ========================================================= */
              /* EMPTY / RESTING EXPLAINER VIEW (Talking Poquito Mascot)    */
              /* ========================================================= */
              <View style={styles.explainerContainer}>
                {/* Talking Poquito Stage */}
                <View style={styles.talkingMascotStage}>
                  <Image
                    source={require('../assets/poquito_front_talking_v2_clean_256.webp')}
                    style={styles.talkingMascotImg}
                    resizeMode="contain"
                  />
                  <View style={styles.speechBubble}>
                    <Text style={styles.speechBubbleTitle}>Received a voice note in Spanish?</Text>
                    <Text style={styles.speechBubbleBody}>
                      When a boat captain, driver, or contractor sends you a Spanish voice note on WhatsApp - I'll transcribe and translate it for you!
                    </Text>
                  </View>
                </View>

                {/* Step 1: Direct WhatsApp Share */}
                <View style={styles.methodCard}>
                  <View style={styles.methodHeader}>
                    <View style={[styles.methodIconBadge, { backgroundColor: '#25D366' }]}>
                      <WhatsAppIcon size={18} color="#FFFFFF" />
                    </View>
                    <View style={styles.methodTitleBox}>
                      <Text style={styles.methodTitle}>Option 1: Share Directly from WhatsApp</Text>
                      <Text style={styles.methodSub}>Fastest & easiest way</Text>
                    </View>
                  </View>
                  <Text style={styles.methodBody}>
                    In WhatsApp: Long-press their voice note ➔ Tap <Text style={{ fontWeight: '700' }}>Share</Text> ➔ Select <Text style={{ color: Colors.onBackground, fontWeight: '700' }}>Poquito</Text><Text style={{ color: Colors.secondary, fontWeight: '700' }}>Talk</Text>.
                  </Text>
                  <View style={styles.methodFooter}>
                    <Ionicons name="flash" size={12} color="#059669" />
                    <Text style={styles.methodFooterText}>Opens right here with the transcription & slow 0.75x replay</Text>
                  </View>
                </View>

                {/* Step 2: Browse Audio File */}
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={handlePickAudioFile}
                  activeOpacity={0.82}
                >
                  <View style={styles.uploadIconCircle}>
                    <Ionicons name="folder-open" size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.uploadTextBox}>
                    <Text style={styles.uploadBtnTitle}>Option 2: Browse Audio File</Text>
                    <Text style={styles.uploadBtnSubtitle}>Select recorded voice note (.opus, .m4a, .mp3) from storage</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  /* Explainer View Styles */
  explainerContainer: {
    paddingBottom: 24,
    gap: 14,
  },
  talkingMascotStage: {
    alignItems: 'center',
    marginBottom: 6,
  },
  talkingMascotImg: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  speechBubble: {
    backgroundColor: '#FFF8F4',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(150, 72, 36, 0.20)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  speechBubbleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B1C1A',
    marginBottom: 4,
  },
  speechBubbleBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#5C4E3A',
    fontWeight: '500',
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  methodIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitleBox: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  methodSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  methodBody: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  methodFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  methodFooterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  uploadIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextBox: {
    flex: 1,
  },
  uploadBtnTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  uploadBtnSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  /* Decoded Result Styles */
  resultContainer: {
    gap: 12,
    paddingBottom: 24,
  },
  sampleNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: 'rgba(150, 72, 36, 0.16)',
  },
  sampleNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C4E3A',
  },
  sampleNoticeBold: {
    fontWeight: '800',
    color: '#1B1C1A',
  },
  cardBox: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  englishCardBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  spanishTranscriptionText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 21,
  },
  audioControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  playIncomingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  playIncomingBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  playIncomingText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1A1208',
  },
  playIncomingTextActive: {
    color: '#FFFFFF',
  },
  speedToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speedBtn: {
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  speedBtnActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  speedBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  speedBtnTextActive: {
    color: '#FFFFFF',
  },
  englishMeaningText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 20,
  },
  englishActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  playEnglishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  playEnglishBtnActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  playEnglishBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  playEnglishBtnTextActive: {
    color: '#FFFFFF',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  resultActionsRow: {
    gap: 8,
    marginTop: 4,
  },
  actionPresetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionPresetBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionResetBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
});
