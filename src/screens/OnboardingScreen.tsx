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
  Linking,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { SpeakerIcon } from '../components/SpeakerIcon';
import { Colors } from '../theme/colors';
import {
  GOOGLE_SPANISH_VOICES,
  VoiceOption,
  generateGoogleGeminiAudio,
  playGoogleAudioFile,
  stopAllAudioPlayback,
} from '../services/googleVoice';
import { AnimatedParrotMascot } from '../components/AnimatedParrotMascot';
import { SoftOnboardingPaywall } from '../components/SoftOnboardingPaywall';
import { UserPersona } from '../types';

export interface PersonaOption {
  id: UserPersona;
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  bgColor: string;
  borderColor: string;
  iconColor: string;
}

export const PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: 'expat',
    title: 'Expat',
    subtitle: 'Repairs, utilities & island life',
    iconName: 'home-outline',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
    iconColor: '#964824',
  },
  {
    id: 'traveler',
    title: 'Traveler',
    subtitle: 'Island trips, boats & water taxis',
    iconName: 'airplane-outline',
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    iconColor: '#0284C7',
  },
  {
    id: 'local',
    title: 'Local Resident',
    subtitle: 'Services, directory & clients',
    iconName: 'people-outline',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    iconColor: '#059669',
  },
];

interface OnboardingScreenProps {
  onComplete: (userName: string, selectedVoice: VoiceOption, persona: UserPersona) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const initialStep =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? parseInt(new URLSearchParams(window.location.search).get('step') || '1', 10)
      : 1;
  const initialName =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('name') || ''
      : '';

  const [step, setStep] = useState(initialStep);
  const [userName, setUserName] = useState(initialName);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(GOOGLE_SPANISH_VOICES[0]);
  const [persona, setPersona] = useState<UserPersona>('expat');
  const [previewingGender, setPreviewingGender] = useState<'MALE' | 'FEMALE' | null>(null);
  const [showSoftPaywall, setShowSoftPaywall] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('softPaywall') === 'true';
    }
    return false;
  });

  const handlePlayVoicePreview = async (gender: 'MALE' | 'FEMALE') => {
    try {
      if (previewingGender === gender) {
        setPreviewingGender(null);
        await stopAllAudioPlayback();
        return;
      }

      await stopAllAudioPlayback();
      setPreviewingGender(gender);

      const previewText = gender === 'MALE'
        ? '¡Buenas! Con Diego tu voz suena clara y natural en Bocas del Toro.'
        : '¡Buenas! Con Sofía tu voz suena clara y amigable en Bocas del Toro.';

      const voiceOpt = GOOGLE_SPANISH_VOICES.find((v) => v.gender === gender) || GOOGLE_SPANISH_VOICES[0];
      const audioUri = await generateGoogleGeminiAudio(previewText, gender === 'MALE' ? 'Male' : 'Female');

      if (audioUri) {
        const sound = await playGoogleAudioFile(audioUri, voiceOpt);
        if (sound) {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setPreviewingGender(null);
              sound.unloadAsync();
            }
          });
        }
      } else {
        setPreviewingGender(null);
      }
    } catch (e) {
      setPreviewingGender(null);
    }
  };

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top + 16, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 44);

  const handleFinish = () => {
    onComplete(userName.trim() || 'Expat Friend', selectedVoice, persona);
  };

  const selectedPersonaObj = PERSONA_OPTIONS.find((p) => p.id === persona) || PERSONA_OPTIONS[0];

  return (
    <View style={[styles.safeArea, { paddingTop: topPadding }]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* 100% Uniform Terracotta Step Bar */}
        <View style={styles.stepBar}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
        </View>

        {/* STEP 1: Welcome & Concept (Option C.1 Approved) */}
        {step === 1 && (
          <View style={styles.stepCard}>
            <View style={styles.heroBadge}>
              <Image
                source={require('../assets/poquito_greet_5_17_160.webp')}
                style={{ width: 80, height: 80 }}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.heroTitle}>
              Welcome to <Text style={{ color: Colors.onBackground }}>Poquito</Text><Text style={{ color: Colors.secondary }}>Talk</Text>
            </Text>

            {/* Frameless Location Tag */}
            <View style={styles.framelessTag}>
              <Text style={styles.framelessTagText}>BOCAS DEL TORO</Text>
              <View style={styles.tagDot} />
              <Text style={styles.framelessTagText}>PANAMÁ 🇵🇦</Text>
            </View>

            <Text style={styles.heroSubtitle}>
              Your local voice note assistant for daily island life & services
            </Text>

            {/* Highlighted Feature Items with Soft Pastel Discs */}
            <View style={styles.featuresBox}>
              <View style={styles.featureItem}>
                <View style={[styles.featIconDisc, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <WhatsAppIcon size={18} color="#059669" />
                </View>
                <View style={styles.featText}>
                  <Text style={[styles.featTag, { color: '#059669' }]}>1-TAP WHATSAPP</Text>
                  <Text style={styles.featTitle}>Voice Notes in Natural Spanish</Text>
                  <Text style={styles.featDesc}>
                    Speaks fluid Panamanian Spanish directly into your chats.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featIconDisc, { backgroundColor: '#FFF8F4', borderColor: '#FDE4D6' }]}>
                  <Ionicons name="call-outline" size={18} color="#964824" />
                </View>
                <View style={styles.featText}>
                  <Text style={[styles.featTag, { color: '#964824' }]}>ISLAND HELP</Text>
                  <Text style={styles.featTitle}>
                    Trusted Local Services,{' \n'}Boat Captains & Everyday Help
                  </Text>
                  <Text style={styles.featDesc}>
                    Direct WhatsApp contacts for water taxis, mechanics, doctors & island services.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featIconDisc, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                  <SpeakerIcon size={20} color="#0284C7" />
                </View>
                <View style={styles.featText}>
                  <Text style={[styles.featTag, { color: '#0284C7' }]}>AUTHENTIC DIALECT</Text>
                  <Text style={styles.featTitle}>Friendly & Polite Bocas Tone</Text>
                  <Text style={styles.featDesc}>
                    Natural local vocabulary so you're always understood.
                  </Text>
                </View>
              </View>
            </View>

            {/* Terracotta CTA Button */}
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Set Up My Voice</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>

            {/* Standard Compliance Footer */}
            <View style={styles.legalNoticeContainer}>
              <Text style={styles.legalNoticeText}>
                By continuing, you agree to our{' '}
                <Text
                  style={styles.legalNoticeLink}
                  onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/terms.html')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text
                  style={styles.legalNoticeLink}
                  onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/privacy.html')}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </View>
        )}

        {/* STEP 2: Profile & Neutral Voice Selection */}
        {step === 2 && (
          <View style={styles.stepCard}>
            <Text style={styles.title}>Personalize Profile</Text>
            <Text style={styles.subtitle}>
              Select how you'll use <Text style={{ color: Colors.onBackground }}>Poquito</Text><Text style={{ color: Colors.secondary }}>Talk</Text> in Bocas.
            </Text>

            {/* Persona Selection */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>HOW WILL YOU USE <Text style={{ color: Colors.onBackground }}>POQUITO</Text><Text style={{ color: Colors.secondary }}>TALK</Text>?</Text>
              <View style={styles.personaGrid}>
                {PERSONA_OPTIONS.map((opt) => {
                  const isSelected = persona === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.personaCard,
                        {
                          borderColor: isSelected ? opt.iconColor : opt.borderColor,
                          borderWidth: isSelected ? 2 : 1.5,
                          backgroundColor: isSelected ? opt.bgColor : '#FFFFFF',
                        },
                      ]}
                      onPress={() => setPersona(opt.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.featIconDisc,
                          {
                            backgroundColor: opt.bgColor,
                            borderColor: opt.borderColor,
                          },
                        ]}
                      >
                        <Ionicons name={opt.iconName} size={18} color={opt.iconColor} />
                      </View>
                      <View style={styles.personaContent}>
                        <Text style={styles.personaTitle}>{opt.title}</Text>
                        <Text style={styles.personaSubtitle}>{opt.subtitle}</Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? opt.iconColor : opt.borderColor,
                            backgroundColor: isSelected ? opt.iconColor : 'transparent',
                          },
                        ]}
                      >
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

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

            {/* Neutral Segmented Voice Toggle */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>PICK YOUR VOICE</Text>
              <View style={styles.voiceToggleBox}>
                {GOOGLE_SPANISH_VOICES.map((v) => {
                  const isSelected = selectedVoice.gender === v.gender;
                  const isPreviewing = previewingGender === v.gender;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.voiceTab, isSelected && styles.voiceTabActive]}
                      onPress={() => setSelectedVoice(v)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.voiceTabText, isSelected && styles.voiceTabTextActive]}>
                        {v.gender === 'MALE' ? '♂ Diego' : '♀ Sofia'}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.voicePreviewBtn,
                          isSelected && styles.voicePreviewBtnActive,
                          isPreviewing && styles.voicePreviewBtnPlaying,
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handlePlayVoicePreview(v.gender);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={`Preview ${v.name} voice`}
                      >
                        <Ionicons
                          name={isPreviewing ? 'stop-circle' : 'volume-high'}
                          size={15}
                          color={isPreviewing ? '#FFFFFF' : isSelected ? '#059669' : '#8C8276'}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(3)} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: Clean Minimal Summary with Studio Dancing Mascot in Lower Half */}
        {step === 3 && (
          <View style={styles.stepCard}>
            <Text style={styles.heroTitle}>
              You're All Set{userName.trim() ? `, ${userName.trim()}` : ''}!
            </Text>

            <Text style={styles.heroSubtitle}>
              <Text style={{ color: Colors.onBackground }}>Poquito</Text><Text style={{ color: Colors.secondary }}>Talk</Text> is ready for your daily island communication.
            </Text>

            {/* Clean Light Summary Rows */}
            <View style={styles.summaryBox}>
              {/* Profile Type Row */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <View
                    style={[
                      styles.featIconDisc,
                      {
                        backgroundColor: selectedPersonaObj.bgColor,
                        borderColor: selectedPersonaObj.borderColor,
                      },
                    ]}
                  >
                    <Ionicons
                      name={selectedPersonaObj.iconName}
                      size={18}
                      color={selectedPersonaObj.iconColor}
                    />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>PROFILE TYPE</Text>
                    <Text style={styles.summaryValue}>{selectedPersonaObj.title}</Text>
                  </View>
                </View>
                <Ionicons name="checkmark-circle" size={22} color="#059669" />
              </View>

              {/* Chosen Voice Row */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <View style={[styles.featIconDisc, { backgroundColor: '#F4F1EA', borderColor: '#E5E0D8' }]}>
                    <SpeakerIcon size={18} color="#1B1C1A" />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>CHOSEN VOICE</Text>
                    <Text style={styles.summaryValue}>
                      {selectedVoice.gender === 'MALE' ? 'Male Voice' : 'Female Voice'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="checkmark-circle" size={22} color="#059669" />
              </View>
            </View>

            {/* Lower Half: Studio Dancing & Celebrating Poquito */}
            <View style={styles.celebrationStage}>
              <Image
                source={require('../assets/poquito_victory_jump_256.webp')}
                style={styles.dancingMascotImage}
                resizeMode="contain"
              />
            </View>

            {/* Start Using PoquitoTalk Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setShowSoftPaywall(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Start Using PoquitoTalk</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Soft Onboarding Paywall with 7-Day Free Trial */}
      <SoftOnboardingPaywall
        visible={showSoftPaywall}
        userName={userName.trim() || 'Friend'}
        onClose={() => {
          setShowSoftPaywall(false);
          handleFinish();
        }}
        onSuccess={() => {
          setShowSoftPaywall(false);
          handleFinish();
        }}
      />
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
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E0D8',
  },
  stepDotActive: {
    backgroundColor: Colors.secondary,
  },
  stepLine: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E5E0D8',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.secondary,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EDE8E1',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  heroBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onBackground,
    textAlign: 'center',
  },
  framelessTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 4,
  },
  framelessTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F604E',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#6C6255',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  subtitle: {
    fontSize: 13,
    color: '#6C6255',
    marginTop: 4,
    lineHeight: 18,
  },
  featuresBox: {
    marginTop: 18,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBE5DC',
  },
  featIconDisc: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  featText: {
    flex: 1,
  },
  featTag: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  featTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  featDesc: {
    fontSize: 11.5,
    color: '#6C6255',
    marginTop: 1,
    lineHeight: 15,
  },
  fieldBlock: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8C8276',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  personaGrid: {
    gap: 10,
  },
  personaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EDE8E1',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  personaContent: {
    flex: 1,
  },
  personaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  personaSubtitle: {
    fontSize: 11.5,
    color: '#6C6255',
    marginTop: 2,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CFC5BB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#F4F1EA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.onBackground,
    borderWidth: 1,
    borderColor: '#E5E0D8',
  },
  voiceToggleBox: {
    flexDirection: 'row',
    backgroundColor: '#F4F1EA',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    gap: 4,
  },
  voiceTab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
  },
  voicePreviewBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePreviewBtnActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  voicePreviewBtnPlaying: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  voiceTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C6255',
  },
  voiceTabTextActive: {
    color: '#1B1C1A',
    fontWeight: '800',
  },
  summaryBox: {
    marginTop: 18,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAF8',
    padding: 13,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EAE5DE',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    flex: 1,
  },
  summaryLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8C8276',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B1C1A',
    marginTop: 2,
  },
  celebrationStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 4,
  },
  dancingMascotImage: {
    width: 140,
    height: 140,
  },
  celebrationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: -4,
  },
  celebrationTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.2,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 22,
    marginTop: 20,
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
  legalNoticeContainer: {
    marginTop: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  legalNoticeText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#1B1C1A',
    textAlign: 'center',
    lineHeight: 16,
  },
  legalNoticeLink: {
    color: '#1B1C1A',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
