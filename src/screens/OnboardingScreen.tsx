import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { GOOGLE_SPANISH_VOICES, VoiceOption } from '../services/googleVoice';

interface OnboardingScreenProps {
  onComplete: (userName: string, selectedVoice: VoiceOption) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'YOUNG' | 'MATURE'>('YOUNG');
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(GOOGLE_SPANISH_VOICES[0]);

  // Auto-pair voice based on gender & age preference
  const updateVoicePreference = (gender: 'MALE' | 'FEMALE', age: 'YOUNG' | 'MATURE') => {
    setSelectedGender(gender);
    setSelectedAgeGroup(age);

    if (gender === 'FEMALE') {
      if (age === 'YOUNG') {
        setSelectedVoice(GOOGLE_SPANISH_VOICES[2]); // Valeria (Young Studio)
      } else {
        setSelectedVoice(GOOGLE_SPANISH_VOICES[1]); // Sofia (Natural Female)
      }
    } else {
      if (age === 'YOUNG') {
        setSelectedVoice(GOOGLE_SPANISH_VOICES[0]); // Diego (Warm Male)
      } else {
        setSelectedVoice(GOOGLE_SPANISH_VOICES[3]); // Mateo (Mature Deep)
      }
    }
  };

  const handleFinish = () => {
    onComplete(userName.trim() || 'Expat Friend', selectedVoice);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Step Indicator Bar */}
        <View style={styles.stepBar}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
        </View>

        {/* STEP 1: Welcome & Concept Explanation */}
        {step === 1 && (
          <View style={styles.stepCard}>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="chat-processing-outline" size={42} color={Colors.secondary} />
            </View>

            <Text style={styles.heroTitle}>Welcome to PoquitoTalk</Text>
            <Text style={styles.heroSubtitle}>
              Your friendly local messaging assistant for Bocas del Toro & Panama 🇵🇦
            </Text>

            <View style={styles.featuresBox}>
              <View style={styles.featureItem}>
                <FontAwesome5 name="whatsapp" size={20} color={Colors.whatsapp} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>1-Tap WhatsApp Voice Notes</Text>
                  <Text style={styles.featureDesc}>
                    Translates your requests into natural Panamanian Spanish audio notes sent straight to WhatsApp.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="construct-outline" size={22} color={Colors.secondary} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Service & Repair Presets</Text>
                  <Text style={styles.featureDesc}>
                    Instant presets for A/C, plumbers, boat repairs, Starlink, doctors, and landlords.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="sparkles" size={22} color={Colors.tertiary} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Google Gemini AI Engine</Text>
                  <Text style={styles.featureDesc}>
                    Uses polite, authentic local phrasing that sounds natural to Panamanian service contacts.
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Set Up My Voice Persona</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Name & Voice Setup */}
        {step === 2 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTag}>STEP 2 OF 3</Text>
            <Text style={styles.title}>Personalize Your Voice Persona</Text>
            <Text style={styles.subtitle}>
              We’ll pair you with the best Google Neural2 Spanish voice for your WhatsApp audio notes.
            </Text>

            {/* Name Input */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>YOUR NAME OR NICKNAME</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Alex"
                placeholderTextColor={Colors.outline}
                value={userName}
                onChangeText={setUserName}
              />
            </View>

            {/* Gender Selection */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>PREFERRED VOICE GENDER</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[styles.optionChip, selectedGender === 'MALE' && styles.optionChipSelected]}
                  onPress={() => updateVoicePreference('MALE', selectedAgeGroup)}
                  activeOpacity={0.8}
                >
                  <FontAwesome5
                    name="male"
                    size={22}
                    color={selectedGender === 'MALE' ? Colors.secondary : Colors.outline}
                  />
                  <Text style={[styles.optionText, selectedGender === 'MALE' && styles.optionTextSelected]}>
                    Male Voice
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionChip, selectedGender === 'FEMALE' && styles.optionChipSelected]}
                  onPress={() => updateVoicePreference('FEMALE', selectedAgeGroup)}
                  activeOpacity={0.8}
                >
                  <FontAwesome5
                    name="female"
                    size={22}
                    color={selectedGender === 'FEMALE' ? Colors.secondary : Colors.outline}
                  />
                  <Text style={[styles.optionText, selectedGender === 'FEMALE' && styles.optionTextSelected]}>
                    Female Voice
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tone Selection */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>VOICE TONE / STYLE</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[styles.optionChip, selectedAgeGroup === 'YOUNG' && styles.optionChipSelected]}
                  onPress={() => updateVoicePreference(selectedGender, 'YOUNG')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="flash-outline"
                    size={22}
                    color={selectedAgeGroup === 'YOUNG' ? Colors.secondary : Colors.outline}
                  />
                  <Text style={[styles.optionText, selectedAgeGroup === 'YOUNG' && styles.optionTextSelected]}>
                    Casual & Energetic
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionChip, selectedAgeGroup === 'MATURE' && styles.optionChipSelected]}
                  onPress={() => updateVoicePreference(selectedGender, 'MATURE')}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="microphone-outline"
                    size={22}
                    color={selectedAgeGroup === 'MATURE' ? Colors.secondary : Colors.outline}
                  />
                  <Text style={[styles.optionText, selectedAgeGroup === 'MATURE' && styles.optionTextSelected]}>
                    Calm & Authoritative
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Selected Paired Voice Badge */}
            <View style={styles.voiceResultCard}>
              <Text style={styles.voiceResultTag}>PAIRED VOICE PERSONA</Text>
              <View style={styles.voiceResultHeader}>
                <Text style={styles.voiceResultFlag}>{selectedVoice.flag}</Text>
                <View style={styles.voiceResultInfo}>
                  <Text style={styles.voiceResultName}>{selectedVoice.name}</Text>
                  <Text style={styles.voiceResultDesc}>Google Neural2 • {selectedVoice.tone}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(3)} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Continue to Final Step</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: Ready & Confirmation */}
        {step === 3 && (
          <View style={styles.stepCard}>
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark-circle" size={54} color={Colors.tertiary} />
            </View>

            <Text style={styles.title}>You’re All Set, {userName || 'Friend'}!</Text>
            <Text style={styles.subtitle}>
              Your voice persona <Text style={styles.highlightText}>{selectedVoice.name} ({selectedVoice.flag})</Text> is locked in and ready for WhatsApp voice notes.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Target Location:</Text>
                <Text style={styles.summaryVal}>Bocas del Toro, Panamá 🇵🇦</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Default Language:</Text>
                <Text style={styles.summaryVal}>Español (Panamá)</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Paired Voice:</Text>
                <Text style={styles.summaryVal}>{selectedVoice.name} ({selectedVoice.gender})</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Start Using PoquitoTalk</Text>
              <Ionicons name="sparkles" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  stepDotActive: {
    backgroundColor: Colors.secondary,
  },
  stepLine: {
    width: 32,
    height: 3,
    backgroundColor: Colors.surfaceContainerHighest,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.secondary,
  },
  stepCard: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  checkBadge: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.onBackground,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  stepTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.tertiary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 18,
  },
  highlightText: {
    fontWeight: '700',
    color: Colors.secondary,
  },
  featuresBox: {
    marginTop: 24,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: Colors.surfaceContainer,
    padding: 14,
    borderRadius: 18,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
  fieldBlock: {
    marginTop: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.onBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainer,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  optionChipSelected: {
    backgroundColor: Colors.secondaryContainer,
    borderColor: Colors.secondary,
  },
  optionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: Colors.secondary,
  },
  voiceResultCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 18,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  voiceResultTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  voiceResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceResultFlag: {
    fontSize: 24,
  },
  voiceResultInfo: {
    flex: 1,
  },
  voiceResultName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  voiceResultDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 22,
    marginTop: 24,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
});
