import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isPro,
  onOpenPaywall,
  savedTranslations,
  onToggleSave,
  activePresetPrompt,
  onClearPresetPrompt,
  initialVoice,
}) => {
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('es');
  const [inputText, setInputText] = useState(activePresetPrompt || '');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Sync active preset prompt if selected from Presets tab
  React.useEffect(() => {
    if (activePresetPrompt) {
      setInputText(activePresetPrompt);
      handleTranslate(activePresetPrompt);
      if (onClearPresetPrompt) onClearPresetPrompt();
    }
  }, [activePresetPrompt]);

  const handleSwapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    if (outputText) {
      const prevInput = inputText;
      setInputText(outputText);
      setOutputText(prevInput);
    }
  };

  const handleTranslate = async (textToTranslate?: string) => {
    const text = textToTranslate || inputText;
    if (!text.trim()) return;

    Keyboard.dismiss();
    setIsTranslating(true);

    try {
      const translated = await translateWithGemma(text, fromLang, toLang);
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

    // If user already typed custom text, translate that directly on mic press
    if (inputText.trim().length > 0) {
      handleTranslate(inputText);
      return;
    }

    // Dictation mode
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
      handleTranslate(randomSample);
    }, 2000);
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
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} />

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
          placeholder={fromLang === 'en' ? 'Type or tap mic to speak...' : 'Escribe o presiona el micrófono...'}
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
              onPress={() => handleTranslate()}
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
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
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
});
