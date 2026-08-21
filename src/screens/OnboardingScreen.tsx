import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { GOOGLE_SPANISH_VOICES, VoiceOption } from '../services/googleVoice';
import { playVoiceDemoSample, VOICE_DEMO_SAMPLES } from '../services/voiceDemos';
import { GreenParrotLogo } from '../components/GreenParrotLogo';
import { AnimatedParrotMascot } from '../components/AnimatedParrotMascot';

interface OnboardingScreenProps {
  onComplete: (userName: string, selectedVoice: VoiceOption) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(GOOGLE_SPANISH_VOICES[0]);

  const handleFinish = () => {
    onComplete(userName.trim() || 'Expat Friend', selectedVoice);
  };

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top + 16, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 44);

  return (
    <View style={[styles.safeArea, { paddingTop: topPadding }]}>
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
              <AnimatedParrotMascot size={72} isAnimating={true} showSpeechBubble={false} />
            </View>

            <Text style={styles.heroTitle}>Welcome to PoquitoTalk</Text>
            <Text style={styles.heroSubtitle}>
              Your friendly local messaging assistant for Bocas del Toro (Panama) 🇵🇦
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
                <Ionicons name="flash-outline" size={22} color={Colors.tertiary} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Authentic Local Phrasing</Text>
                  <Text style={styles.featureDesc}>
                    Polite Panamanian Spanish tailored for local service contacts and businesses.
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Set Up My Voice</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Name & Voice Setup */}
        {step === 2 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTag}>STEP 2 OF 3</Text>
            <Text style={styles.title}>Personalize Your Voice</Text>
            <Text style={styles.subtitle}>
              Choose your preferred voice for sending natural Spanish WhatsApp voice notes.
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

            {/* Voice Selection */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>CHOOSE VOICE</Text>
              <View style={styles.optionsRow}>
                {GOOGLE_SPANISH_VOICES.map((v) => {
                  const isSelected = selectedVoice.id === v.id || selectedVoice.gender === v.gender;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                      onPress={() => setSelectedVoice(v)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionSymbol, isSelected && styles.optionSymbolSelected]}>
                        {v.gender === 'MALE' ? '♂' : '♀'}
                      </Text>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {v.gender === 'MALE' ? 'Male' : 'Female'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
            <View style={styles.heroBadge}>
              <AnimatedParrotMascot
                size={84}
                isAnimating={true}
                isDancing={true}
                showSpeechBubble={true}
                customTip={`¡Wepa! ¡Todo listo, ${userName.trim() || 'amigo'}! 🇵🇦`}
              />
            </View>

            <Text style={styles.heroTitle}>You’re All Set, {userName.trim() || 'Friend'}!</Text>
            <Text style={styles.heroSubtitle}>
              Poquito is ready to turn your voice into natural Panamanian Spanish.
            </Text>

            {/* Cute Selected Voice Pill */}
            <View style={styles.voiceConfirmedPill}>
              <View style={styles.voiceGenderCircle}>
                <Text style={styles.voiceGenderSymbol}>
                  {selectedVoice.gender === 'MALE' ? '♂' : '♀'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.voiceConfirmedLabel}>VOICE READY</Text>
                <Text style={styles.voiceConfirmedValue}>
                  {selectedVoice.gender === 'MALE' ? 'Male Voice' : 'Female Voice'}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color={Colors.tertiary} />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Start Using PoquitoTalk</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
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
    backgroundColor: Colors.tertiary,
  },
  stepLine: {
    width: 32,
    height: 3,
    backgroundColor: Colors.surfaceContainerHighest,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.tertiary,
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
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
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
  optionSymbol: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.outline,
    marginBottom: 4,
  },
  optionSymbolSelected: {
    color: Colors.secondary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: Colors.secondary,
  },
  voiceResultCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  voiceResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voiceIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceResultInfo: {
    flex: 1,
  },
  voiceResultName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  voiceResultDesc: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  demoScenarioTitle: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
    fontStyle: 'italic',
  },
  listenDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  listenDemoBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
  },
  voiceConfirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  voiceGenderCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceGenderSymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.secondary,
  },
  voiceConfirmedLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.5,
  },
  voiceConfirmedValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 1,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 22,
    marginTop: 16,
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
