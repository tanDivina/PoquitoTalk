import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { WhatsAppIcon } from './WhatsAppIcon';
import { setHasSeenPaidOnboarding } from '../services/userService';

export interface PaidUserOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onStartAction?: () => void;
  planName?: string;
  isTrial?: boolean;
}

export const PaidUserOnboardingModal: React.FC<PaidUserOnboardingModalProps> = ({
  visible,
  onClose,
  onStartAction,
  planName = 'Annual Explorer Pass',
  isTrial = true,
}) => {
  const handlePrimaryAction = async () => {
    await setHasSeenPaidOnboarding(true);
    onClose();
    if (onStartAction) {
      onStartAction();
    }
  };

  const handleDismiss = async () => {
    await setHasSeenPaidOnboarding(true);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Subtle Warm Top Accent Bar */}
          <View style={styles.accentBar} />

          {/* Close button in top-right */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleDismiss}
            activeOpacity={0.7}
            accessibilityLabel="Close onboarding"
          >
            <Ionicons name="close" size={18} color="#6B5E51" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Victory Parrot Mascot */}
            <View style={styles.mascotContainer}>
              <Image
                source={require('../assets/poquito_victory_jump_256.webp')}
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>

            {/* Trial / Plan Confirmation Badge */}
            <View style={styles.planBadge}>
              <Ionicons name="checkmark-circle" size={15} color="#059669" />
              <Text style={styles.planBadgeText} numberOfLines={1}>
                {planName}
              </Text>
            </View>

            {/* Modal Title (<= 20 chars) */}
            <Text style={styles.title} numberOfLines={1}>
              Pro Unlocked! 🇵🇦
            </Text>

            {/* Modal Subtitle (<= 60 chars) */}
            <Text style={styles.subtitle} numberOfLines={2}>
              Here are your 3 new island superpowers ready to use.
            </Text>

            {/* Reassurance Box (Trial Transparency & Peace of Mind) */}
            {isTrial && (
              <View style={styles.trialNoticeBox}>
                <Ionicons name="shield-checkmark-outline" size={15} color="#059669" />
                <Text style={styles.trialNoticeText}>
                  7 days free • Cancel anytime in Store Settings
                </Text>
              </View>
            )}

            {/* The 3 Superpowers List */}
            <View style={styles.benefitsList}>
              {/* Feature 1: Unlimited WhatsApp Voice Notes */}
              <View style={styles.benefitItem}>
                <View style={[styles.iconDisc, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <WhatsAppIcon size={18} color="#059669" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Unlimited Voice Notes</Text>
                  <Text style={styles.benefitDesc}>
                    Send natural Panamanian Spanish audio into your WhatsApp chats.
                  </Text>
                </View>
              </View>

              {/* Feature 2: 2-Way Walkie-Talkie */}
              <View style={styles.benefitItem}>
                <View style={[styles.iconDisc, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                  <Ionicons name="radio" size={17} color="#0284C7" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>2-Way Walkie-Talkie</Text>
                  <Text style={styles.benefitDesc}>
                    Live audio rooms via link. Contractors speak without any app!
                  </Text>
                </View>
              </View>

              {/* Feature 3: Signature-Free & Bill Scanner */}
              <View style={styles.benefitItem}>
                <View style={[styles.iconDisc, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
                  <Ionicons name="sparkles" size={17} color="#964824" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Clean Signature-Free</Text>
                  <Text style={styles.benefitDesc}>
                    Toggle off app signatures and scan Spanish power & water bills.
                  </Text>
                </View>
              </View>
            </View>

            {/* Primary Action Button (<= 15 chars) */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handlePrimaryAction}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Try Voice Note</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Secondary Action CTA (<= 15 chars) */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>Explore App</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: '#FAF8F5',
    borderRadius: 28,
    width: '100%',
    maxWidth: 420,
    maxHeight: '92%',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E8E1D7',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  accentBar: {
    height: 5,
    backgroundColor: '#059669',
    width: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  mascotContainer: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mascotImage: {
    width: 86,
    height: 86,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
    marginBottom: 10,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1208',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C4E3A',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 12,
    maxWidth: 320,
  },
  trialNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0D8',
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 14,
  },
  trialNoticeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  benefitsList: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EFEAE2',
    padding: 14,
    gap: 12,
    marginBottom: 18,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconDisc: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1A1208',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B5E51',
    lineHeight: 16,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#059669', // Unique high-converting emerald action color
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A7A68',
  },
});
