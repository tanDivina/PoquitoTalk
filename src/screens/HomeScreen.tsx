import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { LanguageChip } from '../components/LanguageChip';
import { TranslationCard } from '../components/TranslationCard';
import { MicButton } from '../components/MicButton';
import { translateWithGemma } from '../services/gemma';
import { TranslationItem } from '../types';

interface HomeScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  savedTranslations: TranslationItem[];
  onToggleSave: (item: TranslationItem) => void;
  activePresetPrompt?: string;
  onClearPresetPrompt?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isPro,
  onOpenPaywall,
  savedTranslations,
  onToggleSave,
  activePresetPrompt,
  onClearPresetPrompt,
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
    const query = textToTranslate || inputText;
    if (!query.trim()) return;

    setIsTranslating(true);
    try {
      const result = await translateWithGemma(query, fromLang, toLang);
      setOutputText(result);
    } catch (error) {
      console.warn('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleMicPress = () => {
    if (isListening) {
      setIsListening(false);
      // Finished speaking trigger
      handleTranslate(inputText || 'Hi! My air conditioning unit is leaking water.');
    } else {
      setIsListening(true);
      // Simulate live speech recognition input
      setTimeout(() => {
        const sampleVoiceText = 'Hi! My air conditioning unit is leaking water inside the bedroom.';
        setInputText(sampleVoiceText);
        setIsListening(false);
        handleTranslate(sampleVoiceText);
      }, 2500);
    }
  };

  const currentItem: TranslationItem = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    fromLang,
    toLang,
    inputText,
    outputText,
  };

  const isSaved = savedTranslations.some((t) => t.inputText === inputText && t.outputText === outputText);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Header isPro={isPro} onOpenPaywall={onOpenPaywall} />

        <LanguageChip
          fromLang={fromLang}
          toLang={toLang}
          onSwap={handleSwapLanguages}
          onSelectFrom={() => {}}
          onSelectTo={() => {}}
        />

        {/* Translation Output Card */}
        <TranslationCard
          inputText={inputText}
          outputText={outputText}
          fromLang={fromLang}
          toLang={toLang}
          onSave={() => onToggleSave(currentItem)}
          isSaved={isSaved}
        />

        {/* Text Input Box */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type or speak a message for your contact..."
            placeholderTextColor={Colors.outline}
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.translateBtn, isTranslating && styles.translateBtnDisabled]}
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

        {/* Big Mic Button */}
        <MicButton
          isListening={isListening}
          onPress={handleMicPress}
          label="Tap & Speak Message"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  inputContainer: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  textInput: {
    fontSize: 15,
    color: Colors.onBackground,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 8,
  },
  translateBtnDisabled: {
    opacity: 0.7,
  },
  translateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
