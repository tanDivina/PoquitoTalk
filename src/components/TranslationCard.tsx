import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors } from '../theme/colors';
import {
  generateGoogleGeminiAudio,
  playGoogleAudioFile,
  GOOGLE_SPANISH_VOICES,
  VoiceOption,
} from '../services/googleVoice';

interface TranslationCardProps {
  inputText: string;
  outputText: string;
  fromLang: string;
  toLang: string;
  category?: string;
  onSave?: () => void;
  isSaved?: boolean;
  initialVoice?: VoiceOption;
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
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(initialVoice || GOOGLE_SPANISH_VOICES[0]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSharingVoice, setIsSharingVoice] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialVoice) {
      setSelectedVoice(initialVoice);
    }
  }, [initialVoice]);

  // Play audio using selected Google Neural2 Voice or Native TTS
  const handlePlayTTS = async () => {
    if (!outputText) return;

    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    try {
      // 1. Synthesize audio file via Google Speech API with SSML if API key available
      const fileUri = await generateGoogleGeminiAudio(outputText, selectedVoice.id);
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

    // 2. Native Expo Speech Fallback with distinct Male vs Female pitch & question intonation
    let speechText = outputText;
    const isQuestion = speechText.includes('?') || speechText.includes('¿');
    if (isQuestion && !speechText.startsWith('¿')) {
      speechText = `¿${speechText}`;
    }

    // Determine distinct base pitch per persona
    let basePitch = 1.0;
    if (selectedVoice.name === 'Diego') basePitch = 0.35;       // Deep Warm Male
    else if (selectedVoice.name === 'Mateo') basePitch = 0.20;  // Ultra-Deep Male
    else if (selectedVoice.name === 'Sofia') basePitch = 1.45;  // Clear Female
    else if (selectedVoice.name === 'Valeria') basePitch = 1.75;// Young High Female

    // Question pitch boost for sentence-ending intonation
    const finalPitch = isQuestion ? basePitch + 0.30 : basePitch;

    try {
      const availableVoices = await Speech.getAvailableVoicesAsync();
      const spanishVoices = availableVoices.filter((v) => v.language.startsWith('es'));

      let matchedVoice = undefined;
      if (selectedVoice.gender === 'MALE') {
        matchedVoice = spanishVoices.find(
          (v) =>
            v.identifier.toLowerCase().includes('juan') ||
            v.identifier.toLowerCase().includes('jorge') ||
            v.identifier.toLowerCase().includes('carlos') ||
            v.identifier.toLowerCase().includes('male') ||
            v.identifier.toLowerCase().includes('diego')
        );
      } else {
        matchedVoice = spanishVoices.find(
          (v) =>
            v.identifier.toLowerCase().includes('monica') ||
            v.identifier.toLowerCase().includes('paulina') ||
            v.identifier.toLowerCase().includes('female') ||
            v.identifier.toLowerCase().includes('sofia')
        );
      }

      Speech.speak(speechText, {
        language: 'es-PA',
        voice: matchedVoice?.identifier,
        pitch: Math.max(0.1, Math.min(finalPitch, 2.0)),
        rate: selectedVoice.rate || 0.88,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch (err) {
      Speech.speak(speechText, {
        language: 'es-PA',
        pitch: Math.max(0.1, Math.min(finalPitch, 2.0)),
        rate: selectedVoice.rate || 0.88,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;
    const textWithSignature = `${outputText}\n\n— Sent via PoquitoTalk.app 🇵🇦`;
    await Clipboard.setStringAsync(textWithSignature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send Text to WhatsApp
  const handleSendWhatsAppText = async () => {
    if (!outputText) return;
    const textWithSignature = `${outputText}\n\n— Sent via PoquitoTalk.app 🇵🇦`;
    const url = `whatsapp://send?text=${encodeURIComponent(textWithSignature)}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'WhatsApp Not Found',
        'Text copied to clipboard! You can paste it directly into your chat.',
        [{ text: 'OK', onPress: handleCopy }]
      );
    }
  };

  // Send AUDIO VOICE NOTE (.mp3 file) to WhatsApp
  const handleSendWhatsAppVoiceNote = async () => {
    if (!outputText) return;
    setIsSharingVoice(true);

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        handleSendWhatsAppText();
        setIsSharingVoice(false);
        return;
      }

      // Generate local MP3 file with selected Google voice
      let audioUri = await generateGoogleGeminiAudio(outputText, selectedVoice.id);

      if (audioUri) {
        // Trigger Native Share Sheet for WhatsApp Audio Attachment
        await Sharing.shareAsync(audioUri, {
          mimeType: 'audio/mp3',
          dialogTitle: `Send ${selectedVoice.name}'s Voice Note to WhatsApp`,
          UTI: 'public.mp3',
        });
      } else {
        handleSendWhatsAppText();
      }
    } catch (error) {
      handleSendWhatsAppText();
    } finally {
      setIsSharingVoice(false);
    }
  };

  if (!inputText && !outputText) {
    return (
      <View style={styles.placeholderCard}>
        <Ionicons name="chatbubbles-outline" size={32} color={Colors.outline} />
        <Text style={styles.placeholderTitle}>Say or type a message...</Text>
        <Text style={styles.placeholderDesc}>
          Tap the microphone or choose a service preset below for instant Panamanian Spanish WhatsApp voice notes & text.
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

      {/* Input Text Block */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>ORIGINAL ({fromLang.toUpperCase()})</Text>
        <Text style={styles.inputText}>{inputText}</Text>
      </View>

      <View style={styles.divider} />

      {/* Gemma Output Block */}
      <View style={styles.sectionBlock}>
        <View style={styles.outputHeader}>
          <Text style={styles.outputLabel}>ESPAÑOL PANAMÁ 🇵🇦</Text>
          
          {/* Voice Selector Badge */}
          <TouchableOpacity
            style={styles.voiceSelectorChip}
            onPress={() => setShowVoiceModal(true)}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name={selectedVoice.gender === 'MALE' ? 'male' : 'female'}
              size={12}
              color={Colors.secondary}
            />
            <Text style={styles.voiceSelectorText}>{selectedVoice.name}</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.outputText}>{outputText}</Text>
      </View>

      {/* Action Bar Container */}
      <View style={styles.actionsBarContainer}>
        {/* Row 1: Quick Utility Controls */}
        <View style={styles.topUtilityRow}>
          {/* Play Audio Button */}
          <TouchableOpacity
            style={[styles.actionBtn, isPlaying && styles.actionBtnActive]}
            onPress={handlePlayTTS}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? 'square' : 'volume-high'}
              size={16}
              color={isPlaying ? '#BA1A1A' : Colors.secondary}
            />
            <Text style={[styles.actionText, isPlaying && styles.actionTextActive]}>
              {isPlaying ? 'Stop' : 'Play Audio'}
            </Text>
          </TouchableOpacity>

          {/* Copy Button */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.7}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={16}
              color={copied ? Colors.tertiary : Colors.onSurfaceVariant}
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
                color={isSaved ? Colors.tertiary : Colors.onSurfaceVariant}
              />
              <Text style={[styles.actionText, isSaved && styles.actionTextSuccess]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Row 2: Prominent Full-Width Send Voice Note CTA */}
        <TouchableOpacity
          style={styles.fullWidthWhatsappBtn}
          onPress={handleSendWhatsAppVoiceNote}
          disabled={isSharingVoice}
          activeOpacity={0.8}
        >
          {isSharingVoice ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <FontAwesome5 name="whatsapp" size={18} color="#FFF" />
              <Text style={styles.fullWidthWhatsappBtnText}>Send Voice Note to WhatsApp</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Voice Persona Picker Modal */}
      <Modal
        visible={showVoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVoiceModal(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select WhatsApp Voice Persona</Text>
              <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                <Ionicons name="close" size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {GOOGLE_SPANISH_VOICES.map((v) => {
              const isSelected = selectedVoice.id === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.voiceOptionRow, isSelected && styles.voiceOptionRowSelected]}
                  onPress={() => {
                    setSelectedVoice(v);
                    setShowVoiceModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <FontAwesome5
                    name={v.gender === 'MALE' ? 'male' : 'female'}
                    size={20}
                    color={isSelected ? Colors.secondary : Colors.outline}
                  />
                  <View style={styles.voiceOptionInfo}>
                    <Text style={[styles.voiceOptionName, isSelected && styles.voiceOptionNameSelected]}>
                      {v.name}
                    </Text>
                    <Text style={styles.voiceOptionTone}>{v.tone}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark" size={18} color={Colors.secondary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
  voiceSelectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voiceSelectorText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  voiceOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 6,
    backgroundColor: Colors.surfaceContainer,
  },
  voiceOptionRowSelected: {
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  voiceOptionInfo: {
    flex: 1,
  },
  voiceOptionName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  voiceOptionNameSelected: {
    color: Colors.secondary,
  },
  voiceOptionTone: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
});
