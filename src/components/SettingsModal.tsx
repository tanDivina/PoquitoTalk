import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Colors } from '../theme/colors';
import { GreenParrotLogo } from './GreenParrotLogo';
import { FeedbackModal } from './FeedbackModal';
import { RestorePurchasesModal } from './RestorePurchasesModal';
import {
  getPlaybackSpeed,
  setPlaybackSpeed,
  PlaybackSpeed,
  getIncludeAppSignature,
  setIncludeAppSignature,
  getPreferredVoiceGender,
  setPreferredVoiceGender,
  getUserPersona,
  setUserPersona,
} from '../services/storage';
import { getUserProfile } from '../services/userService';
import { UserPersona } from '../types';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  isPro: boolean;
  onOpenPaywall: () => void;
  onOpenRestore?: () => void;
  onResetOnboarding?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  isPro,
  onOpenPaywall,
  onOpenRestore,
  onResetOnboarding,
}) => {
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [restoreVisible, setRestoreVisible] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>('0.75x');
  const [includeSignature, setIncludeSignature] = useState(true);
  const [voiceGender, setVoiceGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [persona, setPersona] = useState<UserPersona>('expat');
  const [isPayingUser, setIsPayingUser] = useState(false);

  useEffect(() => {
    if (visible) {
      getPlaybackSpeed().then(setSpeed);
      getIncludeAppSignature().then(setIncludeSignature);
      getPreferredVoiceGender().then(setVoiceGender);
      getUserPersona().then(setPersona);
      getUserProfile().then((profile) => {
        setIsPayingUser(
          isPro ||
          profile.isProSubscriber ||
          (profile.creditsBalance && profile.creditsBalance > 0) ||
          false
        );
      });
    }
  }, [visible, isPro]);

  const handleToggleSignature = async (value: boolean) => {
    if (!isPayingUser && !value) {
      Alert.alert(
        'Automatic Signature Removal',
        'Paying members can automatically turn off the signature across all messages.\n\nFree tier tip: You can always manually delete the signature line inside WhatsApp before hitting send! Regardless, we deeply appreciate everyone helping spread the word about PoquitoTalk in our community. 🌴',
        [
          { text: 'Got It', style: 'cancel' },
          {
            text: 'View Plans',
            onPress: () => {
              onClose();
              onOpenPaywall();
            },
          },
        ]
      );
      return;
    }
    setIncludeSignature(value);
    await setIncludeAppSignature(value);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBubble}>
                <Ionicons name="settings" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Settings</Text>
                <Text style={styles.modalSubtitle}>Audio, voice & app preferences</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* Audio Playback Speed Preference */}
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="speedometer-outline" size={20} color={Colors.secondary} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Audio Playback Speed</Text>
                  <Text style={styles.cardSubtitle}>
                    Default pace for phrase pronunciations and voice notes.
                  </Text>
                </View>
              </View>

              <View style={styles.speedOptionsRow}>
                <TouchableOpacity
                  style={[styles.speedOptionBtn, speed === '0.75x' && styles.speedOptionBtnActive]}
                  onPress={async () => {
                    setSpeed('0.75x');
                    await setPlaybackSpeed('0.75x');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="play-back"
                    size={14}
                    color={speed === '0.75x' ? '#FFFFFF' : '#059669'}
                  />
                  <Text style={[styles.speedOptionText, speed === '0.75x' && styles.speedOptionTextActive]}>
                    0.75x Slow (Recommended)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.speedOptionBtn, speed === '1.0x' && styles.speedOptionBtnActive]}
                  onPress={async () => {
                    setSpeed('1.0x');
                    await setPlaybackSpeed('1.0x');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="play"
                    size={14}
                    color={speed === '1.0x' ? '#FFFFFF' : '#059669'}
                  />
                  <Text style={[styles.speedOptionText, speed === '1.0x' && styles.speedOptionTextActive]}>
                    1.0x Normal Speed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Preferred Voice Persona (Male / Female) */}
            {/* Preferred Voice Persona (Male / Female) */}
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="mic-outline" size={20} color="#2563EB" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Chosen Voice</Text>
                  <Text style={styles.cardSubtitle}>
                    Select your preferred Spanish voice for playback and voice notes.
                  </Text>
                </View>
              </View>

              <View style={styles.genderOptionsRow}>
                <TouchableOpacity
                  style={[styles.genderOptionBtn, voiceGender === 'MALE' && styles.genderOptionBtnActive]}
                  onPress={async () => {
                    setVoiceGender('MALE');
                    await setPreferredVoiceGender('MALE');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genderSymbol, voiceGender === 'MALE' && styles.genderSymbolActive]}>♂</Text>
                  <Text style={[styles.genderText, voiceGender === 'MALE' && styles.genderTextActive]}>
                    Diego (Male)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.genderOptionBtn, voiceGender === 'FEMALE' && styles.genderOptionBtnActive]}
                  onPress={async () => {
                    setVoiceGender('FEMALE');
                    await setPreferredVoiceGender('FEMALE');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genderSymbol, voiceGender === 'FEMALE' && styles.genderSymbolActive]}>♀</Text>
                  <Text style={[styles.genderText, voiceGender === 'FEMALE' && styles.genderTextActive]}>
                    Sofia (Female)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile Type Card */}
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="person-outline" size={20} color="#D97706" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Profile Type</Text>
                  <Text style={styles.cardSubtitle}>
                    Personalizes service templates and daily island phrases.
                  </Text>
                </View>
              </View>

              <View style={styles.personaOptionsCol}>
                <TouchableOpacity
                  style={[styles.personaOptionRow, persona === 'expat' && styles.personaOptionRowActive]}
                  onPress={async () => {
                    setPersona('expat');
                    await setUserPersona('expat');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.personaIconBox, persona === 'expat' && styles.personaIconBoxActive]}>
                    <Ionicons
                      name="home-outline"
                      size={18}
                      color={persona === 'expat' ? '#047857' : '#64748B'}
                    />
                  </View>
                  <View style={styles.personaTextCol}>
                    <Text style={[styles.personaRowTitle, persona === 'expat' && styles.personaRowTitleActive]}>
                      Expat / Resident
                    </Text>
                    <Text style={styles.personaRowSubtitle}>
                      Repairs, utilities, leases & island life
                    </Text>
                  </View>
                  {persona === 'expat' && (
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.personaOptionRow, persona === 'traveler' && styles.personaOptionRowActive]}
                  onPress={async () => {
                    setPersona('traveler');
                    await setUserPersona('traveler');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.personaIconBox, persona === 'traveler' && styles.personaIconBoxActive]}>
                    <Ionicons
                      name="airplane-outline"
                      size={18}
                      color={persona === 'traveler' ? '#047857' : '#64748B'}
                    />
                  </View>
                  <View style={styles.personaTextCol}>
                    <Text style={[styles.personaRowTitle, persona === 'traveler' && styles.personaRowTitleActive]}>
                      Traveler
                    </Text>
                    <Text style={styles.personaRowSubtitle}>
                      Island tours, water taxis & restaurants
                    </Text>
                  </View>
                  {persona === 'traveler' && (
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.personaOptionRow, persona === 'local' && styles.personaOptionRowActive]}
                  onPress={async () => {
                    setPersona('local');
                    await setUserPersona('local');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.personaIconBox, persona === 'local' && styles.personaIconBoxActive]}>
                    <Ionicons
                      name="briefcase-outline"
                      size={18}
                      color={persona === 'local' ? '#047857' : '#64748B'}
                    />
                  </View>
                  <View style={styles.personaTextCol}>
                    <Text style={[styles.personaRowTitle, persona === 'local' && styles.personaRowTitleActive]}>
                      Local Provider / Business
                    </Text>
                    <Text style={styles.personaRowSubtitle}>
                      Services, client quotes & appointments
                    </Text>
                  </View>
                  {persona === 'local' && (
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* WhatsApp App Signature Preference (Paying Users Feature) */}
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <WhatsAppIcon size={20} color="#25D366" />
                </View>
                <View style={styles.cardText}>
                  <View style={styles.titleWithBadgeRow}>
                    <Text style={styles.cardTitle}>WhatsApp Signature</Text>
                    {isPayingUser && (
                      <View style={styles.unlockedBadge}>
                        <Text style={styles.unlockedBadgeText}>UNLOCKED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardSubtitle}>
                    Adds a link to <Text style={{ color: Colors.onBackground, fontWeight: '700' }}>Poquito</Text><Text style={{ color: Colors.secondary, fontWeight: '700' }}>Talk</Text> at the end of your WhatsApp messages.
                  </Text>
                </View>
              </View>

              <View style={styles.signatureToggleRow}>
                <Text style={styles.signatureToggleLabel}>Include App Signature</Text>
                <Switch
                  value={includeSignature}
                  onValueChange={handleToggleSignature}
                  trackColor={{ false: '#CBD5E1', true: '#059669' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {includeSignature ? (
                <View style={styles.signaturePreviewBox}>
                  <Text style={styles.signaturePreviewLabel}>MESSAGE PREVIEW</Text>
                  <Text style={styles.signaturePreviewText}>- Enviado por la app PoquitoTalk 🇵🇦</Text>
                </View>
              ) : (
                <View style={styles.signatureCleanBox}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.signatureCleanText}>Clean mode active • No signature added</Text>
                </View>
              )}
            </View>

            {/* Membership & Subscription Card */}
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.iconCircle, { backgroundColor: 'transparent' }]}>
                  <GreenParrotLogo size={42} />
                </View>
                <View style={styles.cardText}>
                  <View style={styles.titleWithBadgeRow}>
                    <Text style={styles.cardTitle}>Membership & Credits</Text>
                    <View style={styles.cancelAnytimeBadge}>
                      <Text style={styles.cancelAnytimeText}>Cancel anytime</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSubtitle}>
                    {isPro
                      ? 'Pro Member • Unlimited Spanish voice notes'
                      : '5 Free Welcome Voice Notes • No commitment'}
                  </Text>
                </View>
              </View>

              {isPro ? (
                <TouchableOpacity
                  style={styles.manageSubBtn}
                  onPress={() => {
                    const url =
                      Platform.OS === 'ios'
                        ? 'https://apps.apple.com/account/subscriptions'
                        : 'https://play.google.com/store/account/subscriptions';
                    Linking.openURL(url).catch(() => {
                      Alert.alert(
                        'Manage Subscription',
                        'You can cancel or modify your PoquitoTalk subscription anytime directly in your Google Play Store or Apple ID Subscriptions settings.',
                        [{ text: 'OK' }]
                      );
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="card-outline" size={16} color="#059669" />
                  <Text style={styles.manageSubBtnText}>Manage or Cancel Subscription</Text>
                  <Ionicons name="open-outline" size={14} color="#059669" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    onClose();
                    onOpenPaywall();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>
                    Get Unlimited Voice Notes (Cancel anytime)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Restore Past Purchases Card */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => {
                  if (onOpenRestore) {
                    onOpenRestore();
                  } else {
                    setRestoreVisible(true);
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="receipt-outline" size={20} color={Colors.secondary} />
                <Text style={styles.linkLabel}>Restore Past Purchases</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
              </TouchableOpacity>
            </View>

            {/* Feedback Trigger Card */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => setFeedbackVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.secondary} />
                <Text style={styles.linkLabel}>Send Feedback & Feature Requests</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
              </TouchableOpacity>
            </View>

            {/* Support & Privacy */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => Linking.openURL('mailto:support@hero-apps.com')}
              >
                <Ionicons name="mail-outline" size={18} color={Colors.primary} />
                <Text style={styles.linkLabel}>Support Desk</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/terms.html')}
              >
                <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
                <Text style={styles.linkLabel}>Terms of Service</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/privacy.html')}
              >
                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
                <Text style={styles.linkLabel}>Privacy Policy & Data Security</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
              </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>
              <Text style={{ color: Colors.onBackground, fontWeight: '700' }}>Poquito</Text><Text style={{ color: Colors.secondary, fontWeight: '700' }}>Talk</Text> v1.5.2 • Bocas del Toro 🇵🇦
            </Text>
          </ScrollView>

          {/* Feedback Modal */}
          <FeedbackModal
            visible={feedbackVisible}
            onClose={() => setFeedbackVisible(false)}
          />

          {/* Animated Restore Modal */}
          <RestorePurchasesModal
            visible={restoreVisible}
            onClose={() => setRestoreVisible(false)}
            onOpenPaywall={() => {
              setRestoreVisible(false);
              onClose();
              onOpenPaywall();
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  linkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  speedOptionsRow: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 14,
  },
  speedOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  speedOptionBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  speedOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  speedOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  signatureToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  signatureToggleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  genderOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  genderOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
  },
  genderOptionBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  genderSymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  genderSymbolActive: {
    color: '#FFFFFF',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  genderTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unlockedBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  unlockedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  cancelAnytimeBadge: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cancelAnytimeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  manageSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    paddingVertical: 11,
    marginTop: 14,
  },
  manageSubBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#047857',
  },
  personaOptionsCol: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 14,
  },
  personaOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  personaOptionRowActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  personaIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaIconBoxActive: {
    backgroundColor: '#DCFCE7',
  },
  personaTextCol: {
    flex: 1,
  },
  personaRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  personaRowTitleActive: {
    fontWeight: '800',
    color: '#047857',
  },
  personaRowSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  signaturePreviewBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  signaturePreviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  signaturePreviewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    fontStyle: 'italic',
  },
  signatureCleanBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  signatureCleanText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  scrollContent: {
    paddingBottom: 48,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.outline,
    marginTop: 16,
    marginBottom: 20,
  },
});
