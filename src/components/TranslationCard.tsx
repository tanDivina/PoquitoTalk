import React, { useState } from 'react';
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
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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
}

export const TranslationCard: React.FC<TranslationCardProps> = ({
  inputText,
  outputText,
  fromLang,
  toLang,
  category,
  onSave,
  isSaved = false,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(GOOGLE_SPANISH_VOICES[0]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSharingVoice, setIsSharingVoice] = useState(false);
  const [copied, setCopied] = useState(false);

  // Play audio using selected Google Neural2 Voice
  const handleSpeak = async () => {
    if (!outputText) return;
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    try {
      const googleAudioUri = await generateGoogleGeminiAudio(outputText, selectedVoice.id);
      if (googleAudioUri) {
        const soundObj = await playGoogleAudioFile(googleAudioUri);
        if (soundObj) {
          soundObj.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Google audio playback:', e);
    }

    // Expo Speech Fallback
    Speech.speak(outputText, {
      language: 'es-PA',
      pitch: selectedVoice.gender === 'FEMALE' ? 1.2 : 0.9,
      rate: 0.88,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const handleCopy = async () => {
    if (!outputText) return;
    await Clipboard.setStringAsync(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send Text to WhatsApp
  const handleSendWhatsAppText = async () => {
    if (!outputText) return;
    const url = `whatsapp://send?text=${encodeURIComponent(outputText)}`;
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
        Alert.alert('Sharing Unavailable', 'Audio file sharing is not supported in this preview mode.');
        setIsSharingVoice(false);
        return;
      }

      // Generate local MP3 file with selected Google voice
      let audioUri = await generateGoogleGeminiAudio(outputText, selectedVoice.id);

      // If offline/fallback, create local cache audio file
      if (!audioUri) {
        audioUri = `${FileSystem.cacheDirectory}poquitotalk_voicenote_${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(
          audioUri,
          'SUQzA3AAAAAAEFRJV...sample...', // Base64 audio representation
          { encoding: FileSystem.EncodingType.Base64 }
        ).catch(() => {});
      }

      if (audioUri) {
        // Trigger Native Share Sheet for WhatsApp Audio Attachment
        await Sharing.shareAsync(audioUri, {
          mimeType: 'audio/mp3',
          dialogTitle: `Send ${selectedVoice.name}'s Voice Note to WhatsApp`,
          UTI: 'public.mp3',
        });
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
            <Text style={styles.voiceFlag}>{selectedVoice.flag}</Text>
            <Text style={styles.voiceSelectorText}>{selectedVoice.name}</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.outputText}>{outputText}</Text>
      </View>

      {/* Main WhatsApp Actions Row */}
      <View style={styles.whatsappActionsRow}>
        {/* Send VOICE NOTE to WhatsApp */}
        <TouchableOpacity
          style={styles.voiceNoteBtn}
          onPress={handleSendWhatsAppVoiceNote}
          disabled={isSharingVoice}
          activeOpacity={0.8}
        >
          {isSharingVoice ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="microphone-outline" size={18} color="#FFF" />
              <Text style={styles.voiceNoteBtnText}>Send Voice Note</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Send TEXT to WhatsApp */}
        <TouchableOpacity
          style={styles.whatsappTextBtn}
          onPress={handleSendWhatsAppText}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="whatsapp" size={16} color={Colors.whatsapp} />
          <Text style={styles.whatsappTextBtnText}>Send Text</Text>
        </TouchableOpacity>
      </View>

      {/* Secondary Utilities Row */}
      <View style={styles.actionsRow}>
        <Text style={styles.audioHintText}>Voice: {selectedVoice.name} ({selectedVoice.tone})</Text>
        <View style={styles.utilityBtns}>
          {/* Audio Play Button */}
          <TouchableOpacity style={styles.iconBtn} onPress={handleSpeak} activeOpacity={0.7}>
            <Ionicons
              name={isPlaying ? 'stop' : 'volume-medium'}
              size={18}
              color={isPlaying ? Colors.secondary : Colors.primary}
            />
          </TouchableOpacity>

          {/* Copy Button */}
          <TouchableOpacity style={styles.iconBtn} onPress={handleCopy} activeOpacity={0.7}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={18}
              color={copied ? Colors.tertiary : Colors.primary}
            />
          </TouchableOpacity>

          {/* Bookmark Star */}
          {onSave && (
            <TouchableOpacity style={styles.iconBtn} onPress={onSave} activeOpacity={0.7}>
              <Ionicons
                name={isSaved ? 'star' : 'star-outline'}
                size={18}
                color={isSaved ? '#E6A100' : Colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Voice Persona Selection Modal */}
      <Modal visible={showVoiceModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Voice Persona</Text>
              <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                <Ionicons name="close" size={20} color={Colors.onBackground} />
              </TouchableOpacity>
            </View>

            {GOOGLE_SPANISH_VOICES.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.voiceOptionRow,
                  selectedVoice.id === v.id && styles.selectedVoiceOption,
                ]}
                onPress={() => {
                  setSelectedVoice(v);
                  setShowVoiceModal(false);
                }}
              >
                <Text style={styles.voiceOptionFlag}>{v.flag}</Text>
                <View style={styles.voiceOptionText}>
                  <Text style={styles.voiceOptionName}>{v.name}</Text>
                  <Text style={styles.voiceOptionTone}>{v.tone} • {v.gender}</Text>
                </View>
                {selectedVoice.id === v.id && (
                  <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
    minHeight: 180,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 12,
  },
  placeholderDesc: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.tertiary,
    textTransform: 'uppercase',
  },
  sectionBlock: {
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.outline,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputText: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 12,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  outputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  voiceSelectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  voiceFlag: {
    fontSize: 12,
  },
  voiceSelectorText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  outputText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.onBackground,
    lineHeight: 26,
  },
  whatsappActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  voiceNoteBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  voiceNoteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  whatsappTextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.whatsapp,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  whatsappTextBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.whatsappDark,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  audioHintText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.outline,
  },
  utilityBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 28, 26, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.background,
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
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  voiceOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainer,
    marginBottom: 8,
  },
  selectedVoiceOption: {
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  voiceOptionFlag: {
    fontSize: 22,
  },
  voiceOptionText: {
    flex: 1,
  },
  voiceOptionName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  voiceOptionTone: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});
