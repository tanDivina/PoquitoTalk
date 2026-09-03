import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { PoquitoSearchingMascot, MascotMood } from './PoquitoSearchingMascot';
import { revenueCat } from '../services/revenuecat';

interface RestorePurchasesModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenPaywall?: () => void;
}

const SEARCH_STATUS_MESSAGES = [
  'Checking under the dock in Bocas Town... 🏝️',
  'Asking Captain Jim for previous receipts... 🚤',
  'Peeking inside the coconut shell... 🥥',
  'Consulting with Apple App Store / Google Play... 📱',
];

export const RestorePurchasesModal: React.FC<RestorePurchasesModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onOpenPaywall,
}) => {
  const [mood, setMood] = useState<MascotMood>('searching');
  const [statusIndex, setStatusIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Run the restore check with animated comedic timing
  const startRestoreProcess = async () => {
    setMood('searching');
    setIsSearching(true);
    setStatusIndex(0);

    // Minimum animation time to let Poquito wiggle and look around
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2400));
    const restorePromise = revenueCat.restorePurchases();

    try {
      const [_, restored] = await Promise.all([minDelay, restorePromise]);
      if (restored) {
        setMood('success');
      } else {
        setMood('sad');
      }
    } catch (e) {
      setMood('sad');
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger when modal opens
  useEffect(() => {
    if (visible) {
      startRestoreProcess();
    } else {
      setMood('searching');
      setIsSearching(false);
    }
  }, [visible]);

  // Cycle status message ticker during search
  useEffect(() => {
    if (!isSearching) return;

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      setStatusIndex((prev) => (prev + 1) % SEARCH_STATUS_MESSAGES.length);
    }, 1100);

    return () => clearInterval(interval);
  }, [isSearching]);

  const handleSupportPress = () => {
    Linking.openURL('mailto:support@hero-apps.com?subject=PoquitoTalk%20Purchase%20Restore%20Help');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar with Dismiss and Close (Exact Paywall style) */}
          <View style={styles.topBar}>
            <View
              style={[
                styles.statusBadge,
                mood === 'sad' && styles.statusBadgeSad,
                mood === 'success' && styles.statusBadgeSuccess,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  mood === 'sad' && styles.statusBadgeTextSad,
                  mood === 'success' && styles.statusBadgeTextSuccess,
                ]}
              >
                {mood === 'searching' && 'SEARCHING APP STORE'}
                {mood === 'sad' && 'NO SUBSCRIPTION FOUND'}
                {mood === 'success' && 'RESTORE COMPLETE'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={18} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Canonical Mascot Box */}
          <View style={styles.mascotContainer}>
            <PoquitoSearchingMascot size={130} mood={mood} />
          </View>

          {/* Dynamic Content by Mood */}
          {mood === 'searching' && (
            <View style={styles.contentSection}>
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                Looking for Past Passes...
              </Text>
              <Animated.Text style={[styles.statusTickerText, { opacity: fadeAnim }]}>
                {SEARCH_STATUS_MESSAGES[statusIndex]}
              </Animated.Text>

              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#964824" />
                <Text style={styles.loadingText}>Syncing store receipts</Text>
              </View>
            </View>
          )}

          {mood === 'sad' && (
            <View style={styles.contentSection}>
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                ¡Nada en el Nido!
              </Text>
              <Text style={styles.subtitle}>
                Poquito looked everywhere, but couldn't find an active pass or credits linked to this store account.
              </Text>

              {/* Action Buttons (Exact Paywall button styling) */}
              <View style={styles.buttonStack}>
                <TouchableOpacity
                  style={styles.subscribeBtn}
                  onPress={startRestoreProcess}
                  activeOpacity={0.85}
                >
                  <View style={styles.ctaRow}>
                    <Ionicons name="refresh" size={16} color="#FFF" />
                    <Text style={styles.subscribeBtnText}>Search Again</Text>
                  </View>
                </TouchableOpacity>

                {onOpenPaywall && (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                      onClose();
                      onOpenPaywall();
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={styles.ctaRow}>
                      <Ionicons name="sparkles-outline" size={15} color="#964824" />
                      <Text style={styles.secondaryBtnText}>Start 7-Day Free Trial</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.supportLinkRow}
                  onPress={handleSupportPress}
                  activeOpacity={0.7}
                >
                  <Ionicons name="mail-outline" size={13} color="#4A3E33" style={{ marginRight: 4 }} />
                  <Text style={styles.supportLinkText}>Contact Support Desk (Dorien)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mood === 'success' && (
            <View style={styles.contentSection}>
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                ¡Qué xopa! You're In! 🌴
              </Text>
              <Text style={styles.subtitle}>
                Your <Text style={{ color: Colors.onBackground, fontWeight: '700' }}>Poquito</Text><Text style={{ color: Colors.secondary, fontWeight: '700' }}>Talk</Text> subscription is active. Natural voice notes and island Spanish are ready to go!
              </Text>

              <TouchableOpacity
                style={[styles.subscribeBtn, { backgroundColor: '#059669', shadowColor: '#059669' }]}
                onPress={() => {
                  if (onSuccess) onSuccess();
                  onClose();
                }}
                activeOpacity={0.85}
              >
                <View style={styles.ctaRow}>
                  <Text style={styles.subscribeBtnText}>¡Vámonos! Back to Island Spanish</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Reassurance text */}
          <Text style={styles.reassuranceText}>
            Secure instant checkout processed via App Store / Google Play
          </Text>

          {/* Exact Standard Legal Links Footer (Matching PaywallModal) */}
          <View style={styles.legalFooterRow}>
            <TouchableOpacity onPress={startRestoreProcess} activeOpacity={0.6}>
              <Text style={styles.legalLinkText}>Restore</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/terms.html')}
              activeOpacity={0.6}
            >
              <Text style={styles.legalLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/privacy.html')}
              activeOpacity={0.6}
            >
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FAF8F5', // Warm light container matching PaywallModal
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 22,
    gap: 7,
    borderTopWidth: 1,
    borderColor: '#EDE8E1',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 20,
    paddingVertical: 3.5,
    paddingHorizontal: 10,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#964824',
    letterSpacing: 0.5,
  },
  statusBadgeSad: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusBadgeTextSad: {
    color: '#DC2626',
  },
  statusBadgeSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBadgeTextSuccess: {
    color: '#059669',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3EFE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    height: 135,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  contentSection: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A130E',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#4A3E33',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 10,
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  statusTickerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#964824',
    textAlign: 'center',
    minHeight: 20,
    marginVertical: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 11.5,
    color: '#4A3E33',
    fontWeight: '600',
  },
  buttonStack: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  subscribeBtn: {
    width: '100%',
    backgroundColor: '#964824',
    borderRadius: 18,
    paddingVertical: 12.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#964824',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subscribeBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFF',
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#E8E1D7',
    borderRadius: 18,
    paddingVertical: 11.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#964824',
  },
  supportLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  supportLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A3E33',
    textDecorationLine: 'underline',
  },
  reassuranceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A130E',
    textAlign: 'center',
    marginTop: 4,
  },
  legalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 2,
  },
  legalLinkText: {
    fontSize: 10,
    color: '#1A130E',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 10,
    color: '#1A130E',
    fontWeight: '700',
  },
});
