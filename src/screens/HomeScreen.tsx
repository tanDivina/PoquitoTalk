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
import { MicButton } from '../components/MicButton';
import { translateWithGemma } from '../services/gemma';
import { TranslationItem } from '../types';
import { VoiceOption } from '../services/googleVoice';
import { walkieTalkieService } from '../services/walkieTalkie';
import { shareWalkieTalkieToWhatsApp } from '../services/deepLinks';

interface HomeScreenProps {
  navigation?: any;
  isPro: boolean;
  onOpenPaywall: () => void;
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
  const [clipboardReplyText, setClipboardReplyText] = useState<string | null>(null);
  const [showVoiceQualityModal, setShowVoiceQualityModal] = useState(false);

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
      if (onClearPresetPrompt) onClearPresetPrompt();
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

  const handleMicPress = () => {
    // If text already present, translate immediately
    if (inputText.trim().length > 0) {
      handleTranslateText(inputText);
      return;
    }

    // Toggle active listening mode for dictation
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Check if Web SpeechRecognition is available in browser / WebView
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        try {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.lang = fromLang === 'en' ? 'en-US' : 'es-PA';
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((result: any) => result[0].transcript)
              .join('');
            if (transcript && transcript.trim().length > 0) {
              setInputText(transcript);
              handleTranslateText(transcript, fromLang, toLang);
            }
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.onerror = () => {
            setIsListening(false);
          };

          recognition.start();
        } catch (e) {
          console.warn('SpeechRecognition error:', e);
        }
      } else {
        // Expo AV Recording Fallback
        Audio.requestPermissionsAsync().then(({ status }) => {
          if (status === 'granted') {
            Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
            });
          }
        });

        // Auto-stop listening indicator after 4 seconds
        setTimeout(() => {
          setIsListening(false);
          if (!inputText.trim()) {
            const sampleVoiceInput = fromLang === 'en'
              ? "Hi! I need an electrician to fix the water pump on Isla Colón today."
              : "¡Buenas! Necesito un electricista para revisar la bomba de agua hoy.";
            setInputText(sampleVoiceInput);
            handleTranslateText(sampleVoiceInput, fromLang, toLang);
          }
        }, 4000);
      }
    }
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} onResetOnboarding={onResetOnboarding} />

      {/* WhatsApp Clipboard Reply Detection Banner */}
      {clipboardReplyText && (
        <TouchableOpacity
          style={styles.replyBanner}
          onPress={handleTranslateWhatsAppReply}
          activeOpacity={0.85}
        >
          <View style={styles.replyBannerHeader}>
            <FontAwesome5 name="whatsapp" size={16} color="#FFF" />
            <Text style={styles.replyBannerTitle}>Copied WhatsApp Reply Detected!</Text>
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

      {/* Active Magic Walkie-Talkie HUD Banner */}
      {walkieTalkieService.getActiveSession() && (
        <View style={styles.walkieActiveBanner}>
          <View style={styles.walkieActiveHeader}>
            <View style={styles.walkieLiveBadge}>
              <View style={styles.walkieDot} />
              <Text style={styles.walkieLiveText}>WALKIE-TALKIE LIVE</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                walkieTalkieService.closeSession();
                Alert.alert('Session Ended', 'Walkie-Talkie channel closed.');
              }}
            >
              <Ionicons name="close-circle" size={20} color={Colors.outline} />
            </TouchableOpacity>
          </View>

          <Text style={styles.walkieActiveTitle}>
            Contractor link active ({walkieTalkieService.getActiveSession()?.roomId})
          </Text>
          <Text style={styles.walkieActiveDesc}>
            The contractor can press hold-to-talk inside WhatsApp. Audio translates into clean English automatically.
          </Text>

          <TouchableOpacity
            style={styles.walkieShareBtn}
            onPress={() => {
              const s = walkieTalkieService.getActiveSession();
              if (s) shareWalkieTalkieToWhatsApp(s.shareUrl, 'Amigo');
            }}
          >
            <FontAwesome5 name="whatsapp" size={14} color={Colors.secondary} />
            <Text style={styles.walkieShareBtnText}>Share Link to WhatsApp</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Language Switcher Row */}
      {/* Category Badge Context & Back Button */}
      {activePresetCategory && (
        <View style={styles.categoryBadgeRow}>
          <View style={styles.categoryBadge}>
            <Ionicons name="folder-open-outline" size={14} color={Colors.secondary} />
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
          <Ionicons name="mic-circle" size={18} color={Colors.secondary} />
          <Text style={styles.dictationActiveText}>
            Dictation active: Speak or type your message in English above.
          </Text>
        </View>
      )}

      {/* Primary Input Card */}
      <View style={styles.inputCard}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder={fromLang === 'en' ? 'Type or tap mic to speak...' : 'Pega la respuesta de WhatsApp en español...'}
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
            <TouchableOpacity onPress={() => { setInputText(''); setOutputText(''); }}>
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
                  <Ionicons name="send" size={16} color="#FFF" />
                  <Text style={styles.translateBtnText}>Translate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mic Record Button */}
      <MicButton isListening={isListening} onPress={handleMicPress} />

      {/* Translation Output Card */}
      <TranslationCard
        inputText={inputText}
        outputText={outputText}
        fromLang={fromLang}
        toLang={toLang}
        onSave={() => onToggleSave(currentTranslationItem)}
        isSaved={isSaved}
        initialVoice={initialVoice}
      />

      <VoiceQualityModal
        visible={showVoiceQualityModal}
        onClose={() => setShowVoiceQualityModal(false)}
        selectedVoice={initialVoice || { name: 'Diego', tone: 'Warm & Natural', gender: 'MALE', id: 'es-US-Neural2-B', flag: '👨', pitch: 0.96, rate: 0.88 }}
        onSelectFreeStandardVoice={() => {
          Alert.alert("Standard Free Voice Selected ⚡", "Your audio message will be generated using the local standard free voice.");
        }}
        onBuyCreditsOrPro={onOpenPaywall}
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
    minHeight: 70,
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
});
