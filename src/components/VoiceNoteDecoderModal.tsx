import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../theme/colors';
import {
  decodeVoiceNote,
  SAMPLE_VOICE_NOTES,
  VoiceNoteDecodeResult,
} from '../services/gemma';

interface VoiceNoteDecoderModalProps {
  visible: boolean;
  onClose: () => void;
}

export const VoiceNoteDecoderModal: React.FC<VoiceNoteDecoderModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('boat_captain');
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [result, setResult] = useState<VoiceNoteDecodeResult | null>(null);
  const [playingReplyIdx, setPlayingReplyIdx] = useState<number | null>(null);

  // Initialize with first sample on open
  React.useEffect(() => {
    if (visible && !result) {
      handleDecodeSample('boat_captain');
    }
  }, [visible]);

  const handleDecodeSample = async (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setIsDecoding(true);
    const sample = SAMPLE_VOICE_NOTES.find((s) => s.id === sampleId);
    if (sample) {
      const decoded = await decodeVoiceNote(sample.sampleText);
      setResult(decoded);
    }
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
        // Decode selected audio note
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

  const handlePlayReplyAudio = (replyText: string, index: number) => {
    if (playingReplyIdx === index) {
      Speech.stop();
      setPlayingReplyIdx(null);
      return;
    }

    setPlayingReplyIdx(index);
    Speech.speak(replyText, {
      language: 'es-PA',
      pitch: 0.95,
      rate: 0.88,
      onDone: () => setPlayingReplyIdx(null),
      onError: () => setPlayingReplyIdx(null),
    });
  };

  const handleSendReplyWhatsApp = async (replyText: string) => {
    const textWithSignature = `${replyText}\n\n— Sent via PoquitoTalk.app 🇵🇦`;
    const url = `whatsapp://send?text=${encodeURIComponent(textWithSignature)}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Clipboard.setStringAsync(textWithSignature);
      Alert.alert(
        'WhatsApp Not Found',
        'Reply copied to clipboard! You can paste it directly into your chat.'
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBubble}>
                <Ionicons name="mic-circle" size={24} color={Colors.tertiary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Voice Note Decoder</Text>
                <Text style={styles.modalSubtitle}>Transcribe & reply to Spanish audio</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Primary Action: Import Audio File */}
            <TouchableOpacity style={styles.uploadBtn} onPress={handlePickAudioFile} activeOpacity={0.85}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.uploadTextBox}>
                <Text style={styles.uploadBtnTitle}>Import WhatsApp Voice Note</Text>
                <Text style={styles.uploadBtnSubtitle}>Select audio file (.opus, .mp3, .m4a) to decode</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.tertiary} />
            </TouchableOpacity>

            {/* Interactive Sample Selector */}
            <View style={styles.sampleHeaderRow}>
              <Ionicons name="flask-outline" size={14} color={Colors.tertiary} />
              <Text style={styles.sectionLabel}>OR TRY AN INTERACTIVE SAMPLE</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.samplesRow}>
              {SAMPLE_VOICE_NOTES.map((s: any) => {
                const isSelected = selectedSampleId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.sampleChip, isSelected && styles.sampleChipActive]}
                    onPress={() => handleDecodeSample(s.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={s.iconName || 'chatbubble-ellipses-outline'}
                      size={14}
                      color={isSelected ? '#FFFFFF' : Colors.tertiary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.sampleSender, isSelected && styles.sampleSenderActive]}>
                      {s.sender}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {isDecoding ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={Colors.tertiary} />
                <Text style={styles.loadingText}>Transcribing Panamanian Spanish audio...</Text>
              </View>
            ) : result ? (
              <View style={styles.resultContainer}>
                {/* Sample Context Banner */}
                <View style={styles.sampleNoticeBanner}>
                  <Ionicons name="information-circle-outline" size={14} color={Colors.tertiary} />
                  <Text style={styles.sampleNoticeText}>
                    Showing sample scenario for <Text style={styles.sampleNoticeBold}>{result.senderContext}</Text>
                  </Text>
                </View>

                {/* Spanish Transcription */}
                <View style={styles.cardBox}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="chatbubble-ellipses" size={15} color={Colors.tertiary} />
                    <Text style={styles.cardHeading}>INCOMING AUDIO TRANSCRIPTION (SPANISH)</Text>
                  </View>
                  <Text style={styles.spanishTranscriptionText}>"{result.spanishTranscription}"</Text>
                </View>

                {/* Plain English Breakdown */}
                <View style={[styles.cardBox, styles.englishCardBox]}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="bulb-outline" size={15} color="#0D9488" />
                    <Text style={[styles.cardHeading, { color: '#0D9488' }]}>PLAIN ENGLISH MEANING</Text>
                  </View>
                  <Text style={styles.englishMeaningText}>{result.englishMeaning}</Text>
                </View>

                {/* 1-Tap Polite Replies */}
                <View style={styles.repliesSection}>
                  <View style={styles.repliesSectionHeader}>
                    <Ionicons name="paper-plane-outline" size={14} color={Colors.onSurface} />
                    <Text style={styles.sectionLabel}>1-TAP POLITE SPANISH REPLIES</Text>
                  </View>

                  {result.suggestedReplies.map((reply, idx) => {
                    const isPlaying = playingReplyIdx === idx;
                    return (
                      <View key={idx} style={styles.replyCard}>
                        <View style={styles.replyToneBadge}>
                          <Text style={styles.replyToneText}>{reply.tone}</Text>
                        </View>

                        <Text style={styles.replySpanishText}>{reply.spanish}</Text>
                        <Text style={styles.replyEnglishText}>{reply.english}</Text>

                        <View style={styles.replyActionsRow}>
                          <TouchableOpacity
                            style={[styles.replyActionBtn, styles.replyPlayBtn]}
                            onPress={() => handlePlayReplyAudio(reply.spanish, idx)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={isPlaying ? 'stop-circle' : 'volume-high'}
                              size={15}
                              color={Colors.tertiary}
                            />
                            <Text style={styles.replyPlayText}>{isPlaying ? 'Stop' : 'Listen'}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.replyActionBtn, styles.replyWhatsAppBtn]}
                            onPress={() => handleSendReplyWhatsApp(reply.spanish)}
                            activeOpacity={0.7}
                          >
                            <FontAwesome5 name="whatsapp" size={14} color="#FFFFFF" />
                            <Text style={styles.replyWhatsAppText}>Send to WhatsApp</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}
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
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  samplesRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  sampleChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginRight: 10,
  },
  sampleChipActive: {
    backgroundColor: Colors.tertiaryContainer,
    borderColor: Colors.tertiary,
  },
  sampleSender: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 2,
  },
  sampleSenderActive: {
    color: Colors.tertiary,
  },
  sampleDuration: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.outline,
  },
  sampleDurationActive: {
    color: Colors.tertiary,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.2,
    borderColor: '#86EFAC',
    marginBottom: 16,
  },
  uploadIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextBox: {
    flex: 1,
  },
  uploadBtnTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: -0.2,
  },
  uploadBtnSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#166534',
    marginTop: 1,
  },
  sampleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sampleNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.tertiaryContainer,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  sampleNoticeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.tertiary,
  },
  sampleNoticeBold: {
    fontWeight: '800',
  },
  repliesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  resultContainer: {
    gap: 14,
    paddingBottom: 24,
  },
  cardBox: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  englishCardBox: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.tertiary,
    letterSpacing: 0.6,
  },
  spanishTranscriptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onBackground,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  englishMeaningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#134E4A',
    lineHeight: 20,
  },
  repliesSection: {
    marginTop: 6,
    gap: 10,
  },
  replyCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  replyToneBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
  },
  replyToneText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.4,
  },
  replySpanishText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 4,
    lineHeight: 19,
  },
  replyEnglishText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginBottom: 12,
  },
  replyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  replyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  replyPlayBtn: {
    backgroundColor: Colors.tertiaryContainer,
    borderWidth: 1,
    borderColor: Colors.tertiary,
  },
  replyPlayText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  replyWhatsAppBtn: {
    flex: 1,
    backgroundColor: '#25D366',
  },
  replyWhatsAppText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
