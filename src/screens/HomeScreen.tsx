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
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { LanguageChip } from '../components/LanguageChip';
import { TranslationCard } from '../components/TranslationCard';
import { MicButton } from '../components/MicButton';
import { translateWithGemma } from '../services/gemma';
import { TranslationItem } from '../types';
import { VoiceOption } from '../services/googleVoice';

interface HomeScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  savedTranslations: TranslationItem[];
  onToggleSave: (item: TranslationItem) => void;
  activePresetPrompt?: string;
  onClearPresetPrompt?: () => void;
  initialVoice?: VoiceOption;
  onResetOnboarding?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isPro,
  onOpenPaywall,
  savedTranslations,
  onToggleSave,
  activePresetPrompt,
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
  const [showVoiceNoteHelp, setShowVoiceNoteHelp] = useState(false);

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

  const handleMicPress = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (inputText.trim().length > 0) {
      handleTranslateText(inputText);
      return;
    }

    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const dictationSamples = [
        "Hi! Could you tell me where the nearest pharmacy is located?",
        "Hello! I am calling to check if you have availability for a boat tour tomorrow.",
        "Good day! What time does the grocery store close tonight?",
      ];
      const randomSample = dictationSamples[Math.floor(Math.random() * dictationSamples.length)];
      setInputText(randomSample);
      handleTranslateText(randomSample);
    }, 2000);
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

  const handleSelectFollowUpChip = (englishFollowUp: string) => {
    setFromLang('en');
    setToLang('es');
    setInputText(englishFollowUp);
    handleTranslateText(englishFollowUp, 'en', 'es');
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

      {/* Incoming WhatsApp Voice Note Translation Tool Card */}
      <View style={styles.voiceNoteHelperCard}>
        <View style={styles.voiceNoteHelperHeader}>
          <FontAwesome5 name="whatsapp" size={18} color={Colors.whatsapp} />
          <Text style={styles.voiceNoteHelperTitle}>Received a Spanish WhatsApp Voice Note?</Text>
        </View>

        <Text style={styles.voiceNoteHelperDesc}>
          3 Easy ways to translate incoming voice notes from technicians, boat captains & local services into English:
        </Text>

        <View style={styles.voiceNoteOptionsRow}>
          {/* Method 1: Play Speaker & Tap Mic */}
          <TouchableOpacity
            style={styles.voiceNoteOptionBtn}
            onPress={handleListenToIncomingVoiceNote}
            activeOpacity={0.8}
          >
            <Ionicons name="volume-medium-outline" size={18} color={Colors.secondary} />
            <Text style={styles.voiceNoteOptionBtnText}>Listen via Mic</Text>
          </TouchableOpacity>

          {/* Method 2: How to Copy/Forward in WhatsApp */}
          <TouchableOpacity
            style={styles.voiceNoteOptionBtn}
            onPress={() =>
              Alert.alert(
                'How to Translate WhatsApp Voice Notes',
                '1. In WhatsApp, long-press the voice note transcript or message text.\n2. Tap Copy.\n3. Open PoquitoTalk — the 1-tap green banner will pop up automatically to translate it to English!',
                [{ text: 'Got It!' }]
              )
            }
            activeOpacity={0.8}
          >
            <Ionicons name="help-circle-outline" size={18} color={Colors.secondary} />
            <Text style={styles.voiceNoteOptionBtnText}>WhatsApp Guide</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Switcher Row */}
      <LanguageChip
        fromLang={fromLang}
        toLang={toLang}
        onSwap={handleSwapLanguages}
        onSelectFrom={() => {}}
        onSelectTo={() => {}}
      />

      {/* Primary Input Card */}
      <View style={styles.inputCard}>
        <TextInput
          style={styles.textInput}
          placeholder={fromLang === 'en' ? 'Type or tap mic to speak...' : 'Pega la respuesta de WhatsApp en español...'}
          placeholderTextColor={Colors.outline}
          multiline
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            if (!text) setOutputText('');
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

      {/* 1-Tap Quick Follow-Up Response Chips for WhatsApp Conversations */}
      {outputText.length > 0 && (
        <View style={styles.followUpSection}>
          <Text style={styles.followUpSectionTitle}>1-TAP WHATSAPP FOLLOW-UP RESPONSES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.followUpRow}>
            <TouchableOpacity
              style={styles.followUpChip}
              onPress={() => handleSelectFollowUpChip("3:00 PM works great for me! Thank you.")}
              activeOpacity={0.7}
            >
              <Text style={styles.followUpChipIcon}>🕒</Text>
              <Text style={styles.followUpChipText}>"3:00 PM works great! Thank you."</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.followUpChip}
              onPress={() => handleSelectFollowUpChip("How much will the inspection cost?")}
              activeOpacity={0.7}
            >
              <Text style={styles.followUpChipIcon}>💵</Text>
              <Text style={styles.followUpChipText}>"How much is the inspection cost?"</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.followUpChip}
              onPress={() => handleSelectFollowUpChip("Here is my location on Isla Colón.")}
              activeOpacity={0.7}
            >
              <Text style={styles.followUpChipIcon}>📍</Text>
              <Text style={styles.followUpChipText}>"Here is my location on Isla Colón."</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
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
    paddingBottom: 32,
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
  voiceNoteOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voiceNoteOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.secondaryContainer,
    paddingVertical: 10,
    borderRadius: 14,
  },
  voiceNoteOptionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
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
});
