import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { GoogleSignInButton } from './GoogleSignInButton';
import { GreenParrotLogo } from './GreenParrotLogo';
import { FeedbackModal } from './FeedbackModal';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  isPro: boolean;
  onOpenPaywall: () => void;
  onResetOnboarding?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  isPro,
  onOpenPaywall,
  onResetOnboarding,
}) => {
  const [feedbackVisible, setFeedbackVisible] = useState(false);

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
                <Text style={styles.modalTitle}>Settings & Account</Text>
                <Text style={styles.modalSubtitle}>Sync account & app preferences</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Google Account Sign-In Card */}
            <View style={styles.card}>
              <GoogleSignInButton />
            </View>

            {/* Studio Credits Card */}
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.iconCircle, { backgroundColor: 'transparent' }]}>
                  <GreenParrotLogo size={42} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Natural Voice Notes</Text>
                  <Text style={styles.cardSubtitle}>
                    {isPro ? 'Pro Member (Unlimited Voice Notes)' : '5 Free Welcome Voice Notes Active'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  onClose();
                  onOpenPaywall();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>
                  {isPro ? 'Manage Membership' : 'Get 50 Poquito Credits ($4.99)'}
                </Text>
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

            {/* Intake Reset Card */}
            {onResetOnboarding && (
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.linkRow}
                  onPress={() => {
                    onClose();
                    onResetOnboarding();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-circle-outline" size={20} color={Colors.secondary} />
                  <Text style={styles.linkLabel}>Re-run First-Time Intake Flow (Onboarding)</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
                </TouchableOpacity>
              </View>
            )}

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
                onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/privacy.html')}
              >
                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
                <Text style={styles.linkLabel}>Privacy Policy & Data Security</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
              </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>PoquitoTalk v1.5.0 • Bocas del Toro (Panama) 🇵🇦</Text>
          </ScrollView>

          {/* Feedback Modal */}
          <FeedbackModal
            visible={feedbackVisible}
            onClose={() => setFeedbackVisible(false)}
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
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.outline,
    marginVertical: 12,
  },
});
