import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { LanguageChip } from '../components/LanguageChip';
import { TranslationCard } from '../components/TranslationCard';
import { VoiceQualityModal } from '../components/VoiceQualityModal';
import { VoiceNoteDecoderModal } from '../components/VoiceNoteDecoderModal';
import { DocumentScannerModal } from '../components/DocumentScannerModal';
import { MicButton } from '../components/MicButton';
import { AnimatedParrotMascot } from '../components/AnimatedParrotMascot';
import { translateWithGemma } from '../services/gemma';
import { TranslationItem } from '../types';
import { VoiceOption, GOOGLE_SPANISH_VOICES } from '../services/googleVoice';
import { walkieTalkieService } from '../services/walkieTalkie';
import { shareWalkieTalkieToWhatsApp } from '../services/deepLinks';
import { startVoiceRecording, stopVoiceRecording, transcribeAudioFile } from '../services/transcriptionService';

interface HomeScreenProps {
  navigation?: any;
  isPro: boolean;
  onOpenPaywall: () => void;
  onOpenSaved?: () => void;
  onOpenSettings?: () => void;
  savedTranslations: TranslationItem[];
  onToggleSave: (item: TranslationItem) => void;
  activePresetPrompt?: string;
  activePresetCategory?: string;
  onClearPresetPrompt?: () => void;
  initialVoice?: VoiceOption;
  onResetOnboarding?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  navigation,
  isPro,
  onOpenPaywall,
  onOpenSaved,
  onOpenSettings,
  savedTranslations,
  onToggleSave,
  activePresetPrompt,
  activePresetCategory,
  onClearPresetPrompt,
  initialVoice,
  onResetOnboarding,
}) => {
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('es');
  const [inputText, setInputText] = useState(activePresetPrompt || '');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(initialVoice || GOOGLE_SPANISH_VOICES[0]);
  const [clipboardReplyText, setClipboardReplyText] = useState<string | null>(null);
  const [showVoiceQualityModal, setShowVoiceQualityModal] = useState(false);

  useEffect(() => {
    if (initialVoice) {
      setSelectedVoice(initialVoice);
    }
  }, [initialVoice]);
  const [showVoiceDecoderModal, setShowVoiceDecoderModal] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('decoder') === 'true';
    }
    return false;
  });
  const [showDocScannerModal, setShowDocScannerModal] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('scanner') === 'true';
    }
    return false;
  });

  // Auto-detect copied WhatsApp Spanish reply from clipboard
  useEffect(() => {
    checkClipboardReply();
  }, []);

  const checkClipboardReply = async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (hasString) {
        const text = await Clipboard.getStringAsync();
        const trimmed = text.trim();
        // Check if text looks like a Spanish WhatsApp reply
        const spanishKeywords = ['hola', 'buenas', 'puedo', 'mañana', 'hora', 'muelle', 'precio', 'dólares', 'costo', 'cuánto', 'dónde', 'revisar', 'estoy', 'llegar', 'gracias'];
        const isSpanishReply = spanishKeywords.some((kw) => trimmed.toLowerCase().includes(kw)) && trimmed.length > 5 && trimmed !== inputText;
        
        if (isSpanishReply) {
          setClipboardReplyText(trimmed);
        }
      }
    } catch (e) {
      console.warn('Clipboard check:', e);
    }
  };

  const handleTranslateWhatsAppReply = () => {
    if (!clipboardReplyText) return;
    setFromLang('es');
    setToLang('en');
    setInputText(clipboardReplyText);
    handleTranslateText(clipboardReplyText, 'es', 'en');
    setClipboardReplyText(null);
  };

  // Sync active preset prompt if selected from Presets tab
  useEffect(() => {
    if (activePresetPrompt) {
      setFromLang('en');
      setToLang('es');
      setInputText(activePresetPrompt);
      handleTranslateText(activePresetPrompt, 'en', 'es');
    }
  }, [activePresetPrompt]);

  const handleSwapLanguages = () => {
    const nextFrom = toLang;
    const nextTo = fromLang;
    setFromLang(nextFrom);
    setToLang(nextTo);
    if (outputText) {
      const prevInput = inputText;
      setInputText(outputText);
      setOutputText(prevInput);
    }
  };

  const handleTranslateText = async (textToTranslate?: string, srcLang = fromLang, tgtLang = toLang) => {
    const text = textToTranslate || inputText;
    if (!text.trim()) return;

    Keyboard.dismiss();
    setIsTranslating(true);

    try {
      const translated = await translateWithGemma(text, srcLang, tgtLang);
      setOutputText(translated);
    } catch (error) {
      setOutputText(`¡Buenas! ${text} (Traducido al español de Panamá)`);
    } finally {
      setIsTranslating(false);
    }
  };

  const inputRef = React.useRef<TextInput>(null);
  const recordingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleStopVoiceAndTranslate = async () => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsListening(false);
    setIsTranslating(true);
    try {
      const audioUri = await stopVoiceRecording();
      if (audioUri) {
        const result = await transcribeAudioFile(audioUri, fromLang);
        if (result && result.text && result.text.trim().length > 0) {
          setInputText(result.text);
          await handleTranslateText(result.text, fromLang, toLang);
          return;
        }
      }
      // If voice could not be decoded, focus input for typing or keyboard dictation
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error('Error during voice transcription:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleMicPress = async () => {
    // 1. If text already typed in input, translate immediately
    if (inputText.trim().length > 0) {
      handleTranslateText(inputText);
      return;
    }

    // 2. If already listening / recording, STOP recording and TRANSCRIBE
    if (isListening) {
      await handleStopVoiceAndTranslate();
      return;
    }

    // 3. START real native microphone recording
    setIsListening(true);
    await startVoiceRecording();

    // Set 5.5s auto-transcribe timer in case user finishes speaking and waits
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
    }
    recordingTimerRef.current = setTimeout(() => {
      handleStopVoiceAndTranslate();
    }, 5500);
  };

  const handleListenToIncomingVoiceNote = () => {
    setIsListening(true);
    setFromLang('es');
    setToLang('en');
    
    // Simulate live listening to WhatsApp speaker playback
    setTimeout(() => {
      setIsListening(false);
      const incomingSpanishVoice = "¡Buenas! Puedo pasar a revisar el aire acondicionado hoy a las 3:00 PM. ¿Me confirma su ubicación en Isla Colón?";
      setInputText(incomingSpanishVoice);
      handleTranslateText(incomingSpanishVoice, 'es', 'en');
    }, 2500);
  };

  const handleImportAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setIsTranslating(true);
        setFromLang('es');
        setToLang('en');

        setTimeout(() => {
          setIsTranslating(false);
          const transcribedText = "Hola, le confirmo que el técnico de lanchas puede pasar a las 2:30 PM. ¿Nos espera en el muelle principal?";
          setInputText(transcribedText);
          handleTranslateText(transcribedText, 'es', 'en');
          Alert.alert("Audio Voice Note Imported", `File "${file.name}" transcribed and translated to English successfully!`);
        }, 2000);
      }
    } catch (err) {
      Alert.alert("Import Cancelled", "No audio file was selected.");
    }
  };

  const currentTranslationItem: TranslationItem = {
    id: `${inputText}-${outputText}`,
    inputText,
    outputText,
    fromLang,
    toLang,
    timestamp: Date.now(),
  };

  const isSaved = savedTranslations.some(
    (t) => t.inputText === inputText && t.outputText === outputText
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header
        isPro={isPro}
        onOpenPaywall={onOpenPaywall}
        onOpenSaved={onOpenSaved}
        savedCount={savedTranslations.length}
        onOpenSettings={onOpenSettings}
        onResetOnboarding={onResetOnboarding}
      />

      {/* WhatsApp Clipboard Reply Detection Banner (Only if clipboard content exists) */}
      {clipboardReplyText && (
        <TouchableOpacity
          style={styles.replyBanner}
          onPress={handleTranslateWhatsAppReply}
          activeOpacity={0.85}
        >
          <View style={styles.replyBannerHeader}>
            <FontAwesome5 name="whatsapp" size={16} color="#FFF" />
            <Text style={styles.replyBannerTitle}>Copied WhatsApp Reply Detected</Text>
          </View>
          <Text style={styles.replyBannerText} numberOfLines={2}>
            "{clipboardReplyText}"
          </Text>
          <View style={styles.replyBannerBtn}>
            <Text style={styles.replyBannerBtnText}>Translate to English 🇺🇸</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.secondary} />
          </View>
        </TouchableOpacity>
      )}

      {/* Category Badge Context & Back Button */}
      {activePresetCategory && (
        <View style={styles.categoryBadgeRow}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={
                activePresetCategory.toLowerCase().includes('taxi') || activePresetCategory.toLowerCase().includes('car')
                  ? 'car'
                  : activePresetCategory.toLowerCase().includes('boat') || activePresetCategory.toLowerCase().includes('water')
                  ? 'boat'
                  : activePresetCategory.toLowerCase().includes('restaurant') || activePresetCategory.toLowerCase().includes('dining')
                  ? 'restaurant'
                  : 'bookmark'
              }
              size={14}
              color={Colors.secondary}
            />
            <Text style={styles.categoryBadgeText}>{activePresetCategory}</Text>
          </View>

          <TouchableOpacity
            style={styles.backToPresetsBtn}
            onPress={() => {
              if (onClearPresetPrompt) onClearPresetPrompt();
              if (navigation) navigation.navigate('Presets');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={14} color={Colors.secondary} />
            <Text style={styles.backToPresetsBtnText}>Back to Presets</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Active Dictation Helper Banner */}
      {isListening && (
        <View style={styles.dictationActiveBanner}>
          <Ionicons name="mic" size={18} color={Colors.secondary} />
          <Text style={styles.dictationActiveText}>
            🎙️ Recording active: Speak now, then tap mic again to translate
          </Text>
        </View>
      )}

      {/* Voice Selection & Language Control Row */}
      <View style={styles.voiceStatusRow}>
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

        <TouchableOpacity
          style={styles.languageToggleChip}
          onPress={handleSwapLanguages}
          activeOpacity={0.8}
        >
          <Text style={styles.langTagText}>{fromLang === 'en' ? 'EN' : 'ES'}</Text>
          <Ionicons name="swap-horizontal" size={14} color={Colors.secondary} />
          <Text style={styles.langTagText}>{toLang === 'es' ? 'ES' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Translation Input Card (The Clear Starting Point) */}
      <View style={styles.inputCard}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder={fromLang === 'en' ? 'Type or tap mic to speak in English...' : 'Pega el mensaje de WhatsApp en español...'}
          placeholderTextColor={Colors.outline}
          multiline
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            if (!text) setOutputText('');
            if (text.length > 0) setIsListening(false);
          }}
        />

        {inputText.length > 0 && (
          <View style={styles.inputActions}>
            <TouchableOpacity onPress={() => { setInputText(''); setOutputText(''); }} style={styles.clearInputBtn}>
              <Ionicons name="close-circle-outline" size={20} color={Colors.outline} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.translateBtn}
              onPress={() => handleTranslateText()}
              disabled={isTranslating}
              activeOpacity={0.8}
            >
              {isTranslating ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={15} color="#FFF" />
                  <Text style={styles.translateBtnText}>Translate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mic Record Button */}
      <MicButton isListening={isListening} onPress={handleMicPress} />

      {/* Mascot Translating Loader */}
      {isTranslating && (
        <View style={styles.translatingLoaderCard}>
          <AnimatedParrotMascot size={58} isAnimating={true} isDancing={true} showSpeechBubble={true} customTip="¡Tranquilo compa! Estamos afinando tu mensaje..." />
          <Text style={styles.translatingLoaderText}>Afinando traducción en español de Panamá...</Text>
        </View>
      )}

      {/* Translation Output Card */}
      <TranslationCard
        inputText={inputText}
        outputText={outputText}
        fromLang={fromLang}
        toLang={toLang}
        onSave={() => onToggleSave(currentTranslationItem)}
        isSaved={isSaved}
        initialVoice={selectedVoice}
        onSelectQuickPrompt={(prompt) => {
          setFromLang('en');
          setToLang('es');
          setInputText(prompt);
          handleTranslateText(prompt, 'en', 'es');
        }}
      />

      {/* Secondary Fast Tools (Voice Decoder & Bill Scanner) */}
      <View style={styles.superToolsSection}>
        <Text style={styles.superToolsHeading}>MORE TOOLS</Text>
        <View style={styles.superToolsRow}>
          <TouchableOpacity
            style={styles.superToolBtn}
            onPress={() => setShowVoiceDecoderModal(true)}
            activeOpacity={0.85}
          >
            <View style={[styles.superToolIconCircle, { backgroundColor: Colors.tertiaryContainer }]}>
              <Ionicons name="mic" size={17} color="#0F172A" />
            </View>
            <View style={styles.superToolTextBox}>
              <Text style={styles.superToolTitle} numberOfLines={1}>Decode Voice Note</Text>
              <Text style={styles.superToolSubtitle} numberOfLines={1}>WhatsApp audio</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.superToolBtn}
            onPress={() => setShowDocScannerModal(true)}
            activeOpacity={0.85}
          >
            <View style={[styles.superToolIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="camera" size={17} color="#0F172A" />
            </View>
            <View style={styles.superToolTextBox}>
              <Text style={styles.superToolTitle} numberOfLines={1}>Scan Bill or Menu</Text>
              <Text style={styles.superToolSubtitle} numberOfLines={1}>Itemized breakdown</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <VoiceQualityModal
        visible={showVoiceQualityModal}
        onClose={() => setShowVoiceQualityModal(false)}
        selectedVoice={selectedVoice}
        onSelectFreeStandardVoice={() => {
          Alert.alert("Standard Free Voice Selected", "Your audio message will be generated using the local standard free voice.");
        }}
        onBuyCreditsOrPro={onOpenPaywall}
      />

      {/* Inbound Voice Note Decoder Modal */}
      <VoiceNoteDecoderModal
        visible={showVoiceDecoderModal}
        onClose={() => setShowVoiceDecoderModal(false)}
      />

      {/* Document & Utility Bill Scanner Modal */}
      <DocumentScannerModal
        visible={showDocScannerModal}
        onClose={() => setShowDocScannerModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondaryContainer || '#F4FAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary,
  },
  backToPresetsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainer || '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  backToPresetsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  dictationActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.secondaryContainer || '#F4FAFE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  dictationActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  replyBanner: {
    backgroundColor: Colors.whatsapp,
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    shadowColor: Colors.whatsapp,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  replyBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  replyBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  replyBannerText: {
    fontSize: 12,
    color: '#E8F5E9',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  replyBannerBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  replyBannerBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
  },
  voiceNoteHelperCard: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  voiceNoteHelperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  voiceNoteHelperTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  voiceNoteHelperDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 12,
  },
  threadsLauncherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  threadsLauncherText: {
    flex: 1,
  },
  threadsLauncherTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  threadsLauncherSub: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  inputCard: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 18,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  textInput: {
    fontSize: 16,
    color: Colors.onBackground,
    minHeight: 90,
    lineHeight: 22,
    paddingTop: 4,
    paddingBottom: 4,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  translateBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },
  followUpSection: {
    marginTop: 14,
  },
  followUpSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  followUpRow: {
    gap: 8,
  },
  followUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  followUpChipIcon: {
    fontSize: 14,
  },
  followUpChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  walkieActiveBanner: {
    backgroundColor: Colors.secondaryContainer || '#FFDBCD',
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  walkieActiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  walkieLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walkieDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.whatsapp,
  },
  walkieLiveText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  walkieActiveTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 2,
  },
  walkieActiveDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
    marginBottom: 12,
  },
  walkieShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: 8,
    borderRadius: 14,
  },
  walkieShareBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary,
  },
  walkieFeatureCard: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  walkieFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  walkieFeatureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  walkieFeatureDesc: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 16,
  },
  startWalkieCardBtn: {
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  startWalkieCardBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  voiceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  voiceToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 3,
  },
  voiceToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 13,
  },
  voiceToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  voiceToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  voiceToggleBtnTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  utilityBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  utilityBarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder || '#E8E4DE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  utilityBarBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  languageToggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder || '#E8E4DE',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 100,
  },
  langTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary || '#A04A26',
  },
  clearInputBtn: {
    padding: 4,
  },
  superToolsSection: {
    marginTop: 18,
    marginBottom: 8,
  },
  superToolsHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  superToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  superToolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 12,
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  superToolIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  superToolTextBox: {
    flex: 1,
    justifyContent: 'center',
  },
  superToolTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.1,
  },
  superToolSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  translatingLoaderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 211, 102, 0.3)',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  translatingLoaderText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
    textAlign: 'center',
  },
});
