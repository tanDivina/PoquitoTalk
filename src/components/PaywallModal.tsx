import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AnimatedParrotMascot } from './AnimatedParrotMascot';
import { revenueCat } from '../services/revenuecat';
import { getUserProfile, setProSubscriber } from '../services/userService';

export interface PurchaseSuccessDetails {
  tier: PlanTier;
  packageName: string;
  isTrial: boolean;
}

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (details?: PurchaseSuccessDetails) => void;
  onOpenRestore?: () => void;
}

export type PlanTier = 'ANNUAL_TRIAL' | 'MONTHLY' | 'TRAVEL_PASS' | 'CREDITS';

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onOpenRestore,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PlanTier>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const t = new URLSearchParams(window.location.search).get('tier');
      if (t === 'MONTHLY' || t === 'TRAVEL_PASS' || t === 'CREDITS') return t as PlanTier;
    }
    return 'ANNUAL_TRIAL';
  });

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await setProSubscriber(true);
      const success = await revenueCat.purchaseProPackage();
      if (success) {
        const packageNames: Record<PlanTier, string> = {
          ANNUAL_TRIAL: 'Annual Explorer Pass',
          MONTHLY: 'Monthly Resident Pass',
          TRAVEL_PASS: '7-Day Travel Pass',
          CREDITS: '50 Credits Pack',
        };
        onSuccess({
          tier: selectedTier,
          packageName: packageNames[selectedTier] || 'Annual Explorer Pass',
          isTrial: selectedTier === 'ANNUAL_TRIAL',
        });
        onClose();
      }
    } catch (error) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Purchase Note: Unable to complete transaction at this time.');
      } else {
        Alert.alert('Purchase Note', 'Unable to complete transaction at this time.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      if (onOpenRestore) {
        onClose();
        setTimeout(() => onOpenRestore(), 300);
        return;
      }
      const restored = await revenueCat.restorePurchases();
      if (restored) {
        await setProSubscriber(true);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Purchases Restored: Your PoquitoTalk subscription is active.');
        } else {
          Alert.alert('Purchases Restored', 'Your PoquitoTalk subscription is active.');
        }
        onSuccess();
        onClose();
      } else {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('No Subscription Found: No prior purchases found for this account.');
        } else {
          Alert.alert('No Subscription Found', 'No prior purchases were found for this account.');
        }
      }
    } catch (e) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Restore Error: Unable to reach the App Store.');
      } else {
        Alert.alert('Restore Error', 'Unable to reach the App Store.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar with Dismiss and Close */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7} accessibilityLabel="Close paywall and continue free">
              <Ionicons name="close" size={18} color="#6B5E51" />
            </TouchableOpacity>
          </View>

          {/* Header Mascot with Talking Loop */}
          <View style={styles.heroSection}>
            <Image
              source={require('../assets/poquito_talk_58_73_160.webp')}
              style={styles.mascotImg}
              resizeMode="contain"
            />
            <Text style={styles.title} adjustsFontSizeToFit numberOfLines={1}>
              Get Things Done Stress-Free 🇵🇦
            </Text>
            <View style={styles.locationTagRow}>
              <Text style={styles.locationTagText}>ZERO LANGUAGE BARRIERS</Text>
            </View>
          </View>

          {/* Compact 4-Plan Selector with Wide Dedicated Price Columns */}
          <View style={styles.plansContainer}>
            {/* Plan 1: Annual Explorer Pass */}
            <TouchableOpacity
              style={[styles.pricingCard, selectedTier === 'ANNUAL_TRIAL' && styles.pricingCardSelected]}
              onPress={() => setSelectedTier('ANNUAL_TRIAL')}
              activeOpacity={0.85}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>BEST VALUE • 7 DAYS FREE</Text>
              </View>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.radioCircle, selectedTier === 'ANNUAL_TRIAL' && styles.radioCircleActive]}>
                  {selectedTier === 'ANNUAL_TRIAL' && <View style={styles.radioInnerDot} />}
                </View>
                <View style={styles.planInfoColumn}>
                  <Text style={styles.planTitle}>Annual Explorer Pass</Text>
                  <Text style={styles.planSubtitle}>Unlimited Full Access</Text>
                </View>
                <View style={styles.priceColumn}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceAmount}>$3.33</Text>
                    <Text style={styles.pricePeriod}> / mo</Text>
                  </View>
                  <Text style={styles.priceSubText}>$39.99/yr • Save 66%</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Plan 2: Monthly Resident Pass */}
            <TouchableOpacity
              style={[styles.pricingCard, selectedTier === 'MONTHLY' && styles.pricingCardSelected]}
              onPress={() => setSelectedTier('MONTHLY')}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.radioCircle, selectedTier === 'MONTHLY' && styles.radioCircleActive]}>
                  {selectedTier === 'MONTHLY' && <View style={styles.radioInnerDot} />}
                </View>
                <View style={styles.planInfoColumn}>
                  <Text style={styles.planTitle}>Monthly Resident Pass</Text>
                  <Text style={styles.planSubtitle}>Full Access • Cancel anytime</Text>
                </View>
                <View style={styles.priceColumn}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceAmount}>$9.99</Text>
                    <Text style={styles.pricePeriod}> / mo</Text>
                  </View>
                  <Text style={styles.priceSubTextEmerald}>Billed monthly</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Plan 3: 7-Day Travel Pass */}
            <TouchableOpacity
              style={[styles.pricingCard, selectedTier === 'TRAVEL_PASS' && styles.pricingCardSelected]}
              onPress={() => setSelectedTier('TRAVEL_PASS')}
              activeOpacity={0.85}
            >
              <View style={[styles.popularBadge, { backgroundColor: '#059669' }]}>
                <Text style={styles.popularText}>FOR ISLAND TRIPS</Text>
              </View>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.radioCircle, selectedTier === 'TRAVEL_PASS' && styles.radioCircleActive]}>
                  {selectedTier === 'TRAVEL_PASS' && <View style={styles.radioInnerDot} />}
                </View>
                <View style={styles.planInfoColumn}>
                  <Text style={styles.planTitle}>7-Day Travel Pass</Text>
                  <Text style={styles.planSubtitle}>100 Voice Notes • 20 Live Sessions</Text>
                </View>
                <View style={styles.priceColumn}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceAmount}>$4.99</Text>
                    <Text style={styles.pricePeriod}> / 7 days</Text>
                  </View>
                  <Text style={styles.priceSubTextMuted}>Non-renewing</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Plan 4: 50 Poquito Credits Pack */}
            <TouchableOpacity
              style={[styles.pricingCard, selectedTier === 'CREDITS' && styles.pricingCardSelected]}
              onPress={() => setSelectedTier('CREDITS')}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.radioCircle, selectedTier === 'CREDITS' && styles.radioCircleActive]}>
                  {selectedTier === 'CREDITS' && <View style={styles.radioInnerDot} />}
                </View>
                <View style={styles.planInfoColumn}>
                  <Text style={styles.planTitle}>50 Credits Pack</Text>
                  <Text style={styles.planSubtitle}>50 Voice Notes • 10 Live Sessions</Text>
                </View>
                <View style={styles.priceColumn}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceAmount}>$4.99</Text>
                    <Text style={styles.pricePeriod}> once</Text>
                  </View>
                  <Text style={styles.priceSubTextEmerald}>Never expires</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.subscribeBtn}
            onPress={handleSubscribe}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={styles.ctaRow}>
                <Text style={styles.subscribeBtnText}>
                  {selectedTier === 'ANNUAL_TRIAL' && 'Start 7-Day Free Trial'}
                  {selectedTier === 'MONTHLY' && 'Get Monthly Pass ($9.99/mo)'}
                  {selectedTier === 'TRAVEL_PASS' && 'Get 7-Day Travel Pass ($4.99)'}
                  {selectedTier === 'CREDITS' && 'Get 50 Poquito Credits ($4.99)'}
                </Text>
                <Ionicons name="arrow-forward" size={17} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Clean Free Version Link */}
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.freeForeverBtn}>
            <Text style={styles.freeForeverText}>Try it first</Text>
          </TouchableOpacity>

          {/* Minimal Legal Row */}
          <View style={styles.minimalLegalRow}>
            <Text style={styles.legalNoticeText}>Cancel anytime in Settings</Text>
            <Text style={styles.legalBullet}>•</Text>
            <TouchableOpacity onPress={handleRestore}>
              <Text style={styles.legalLink}>Restore</Text>
            </TouchableOpacity>
            <Text style={styles.legalBullet}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/terms.html')}>
              <Text style={styles.legalLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.legalBullet}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/privacy.html')}>
              <Text style={styles.legalLink}>Privacy</Text>
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
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: '#E8E1D7',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 0,
  },
  trialTopBadge: {
    backgroundColor: '#D5E8D1',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  trialTopBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none', outline: 'none' } as any : {}),
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: -8,
    marginBottom: 16,
  },
  mascotImg: {
    width: 78,
    height: 78,
  },
  title: {
    fontSize: 18.5,
    fontWeight: '900',
    color: '#1A130E',
    textAlign: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#4A3E33',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  featureGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#E8E1D7',
    rowGap: 6.5,
  },
  gridItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 2,
  },
  gridIconDisc: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  benefitTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  gridText: {
    fontSize: 10.2,
    fontWeight: '800',
    color: '#1A130E',
  },
  gridSubText: {
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: '500',
    color: '#4A3E33',
    marginTop: 0.5,
  },
  plansContainer: {
    width: '100%',
    gap: 8,
  },
  pricingCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E8E1D7',
    position: 'relative',
  },
  pricingCardSelected: {
    borderColor: '#964824',
    borderWidth: 2,
    backgroundColor: '#FFF9F6',
  },
  popularBadge: {
    position: 'absolute',
    top: -7.5,
    right: 10,
    backgroundColor: '#964824',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  popularText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CFC5BB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#964824',
  },
  radioInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#964824',
  },
  planInfoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1A130E',
  },
  planSubtitle: {
    fontSize: 9.2,
    color: '#4A3E33',
    marginTop: 0.5,
    fontWeight: '500',
  },
  priceColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A130E',
  },
  pricePeriod: {
    fontSize: 9.2,
    fontWeight: '700',
    color: '#4A3E33',
  },
  priceSubText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#059669',
  },
  priceSubTextEmerald: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#059669',
  },
  priceSubTextMuted: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#64748B',
  },
  subscribeBtn: {
    width: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'nowrap',
  },
  subscribeBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.2,
  },
  freeForeverBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  freeForeverText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#964824',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  locationTagRow: {
    marginTop: 1,
    backgroundColor: 'rgba(150, 72, 36, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  locationTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#964824',
    letterSpacing: 0.6,
  },
  minimalLegalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  legalNoticeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#4A3E33',
  },
  legalLink: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4A3E33',
    textDecorationLine: 'underline',
  },
  legalBullet: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
});
