import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { AnimatedParrotMascot } from './AnimatedParrotMascot';
import { revenueCat } from '../services/revenuecat';
import { setProSubscriber } from '../services/userService';

export type PaywallTier = 'ANNUAL_TRIAL' | 'MONTHLY' | 'TRAVEL_PASS' | 'CREDITS';

export interface SoftPaywallSuccessDetails {
  tier: PaywallTier;
  packageName: string;
  isTrial: boolean;
}

interface SoftOnboardingPaywallProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (details?: SoftPaywallSuccessDetails) => void;
  userName?: string;
  mascotStyle?: 'walkie' | 'dance' | 'vector';
}

export const SoftOnboardingPaywall: React.FC<SoftOnboardingPaywallProps> = ({
  visible,
  onClose,
  onSuccess,
  userName = 'Friend',
  mascotStyle: propMascotStyle,
}) => {
  const [selectedTier, setSelectedTier] = useState<PaywallTier>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const t = new URLSearchParams(window.location.search).get('tier');
      if (t === 'MONTHLY' || t === 'TRAVEL_PASS' || t === 'CREDITS') return t;
    }
    return 'ANNUAL_TRIAL';
  });
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const openLegal = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  // Read mascotStyle from query params on web
  const mascotStyle =
    propMascotStyle ||
    (Platform.OS === 'web' && typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('mascot') as any) || 'walkie'
      : 'walkie');

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await setProSubscriber(true);
      await revenueCat.purchaseProPackage();
      
      const packageNames: Record<PaywallTier, string> = {
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
    } catch (error) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Purchase Note: Could not complete transaction at this time.');
      } else {
        Alert.alert('Purchase Note', 'Could not complete subscription at this time.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const restored = await revenueCat.restorePurchases();
      if (restored) {
        await setProSubscriber(true);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Purchases Restored: Your PoquitoTalk subscription is active.');
          onSuccess();
          onClose();
        } else {
          Alert.alert('Purchases Restored', 'Your PoquitoTalk subscription is active.', [
            {
              text: 'Continue',
              onPress: () => {
                onSuccess();
                onClose();
              },
            },
          ]);
        }
      } else {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Restore Note: No prior active subscription found for this account.');
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

  const topPadding = Math.max(insets.top + 6, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 36);
  const bottomPadding = Math.max(insets.bottom + 8, 18);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} presentationStyle="overFullScreen">
      {/* Seamless Warm Background - No enclosing outer white box */}
      <View style={[styles.safeArea, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        
        {/* TOP BAR: Clean Dismiss Button on Right */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.closeCircle} onPress={onClose} activeOpacity={0.7} accessibilityLabel="Close paywall and continue free">
            <Ionicons name="close" size={18} color="#6B5E51" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.mascotWrapper}>
            <Image
              source={require('../assets/poquito_talk_58_73_160.webp')}
              style={styles.bigMascotImg}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.mainTitle} adjustsFontSizeToFit numberOfLines={1}>
            Get Things Done Stress-Free 🇵🇦
          </Text>
          
          <View style={styles.locationTagRow}>
            <Text style={styles.locationTagText}>ZERO LANGUAGE BARRIERS</Text>
          </View>
        </View>

        <View style={styles.featureGridContainer}>
          <View style={styles.featureGrid}>
            <View style={styles.gridItem}>
              <View style={[styles.gridIconDisc, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <WhatsAppIcon size={16} color="#059669" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.gridText} numberOfLines={1}>Voice on WhatsApp</Text>
                <Text style={styles.gridSubText} numberOfLines={1}>Locals prefer voice notes</Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <View style={[styles.gridIconDisc, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
                <Ionicons name="construct" size={15} color="#964824" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.gridText} numberOfLines={1}>Fast Island Repairs</Text>
                <Text style={styles.gridSubText} numberOfLines={1}>Boats, water & A/C</Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <View style={[styles.gridIconDisc, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                <Ionicons name="heart" size={15} color="#0284C7" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.gridText} numberOfLines={1}>Real Island Spanish</Text>
                <Text style={styles.gridSubText} numberOfLines={1}>Warm, respectful & local</Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <View style={[styles.gridIconDisc, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}>
                <Ionicons name="radio" size={15} color="#7C3AED" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.gridText} numberOfLines={1}>2-Way Live Audio</Text>
                <Text style={styles.gridSubText} numberOfLines={1}>Talk live, no app needed</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.plansContainer}>
          <TouchableOpacity
            style={[styles.planCard, selectedTier === 'ANNUAL_TRIAL' && styles.planCardSelected]}
            onPress={() => setSelectedTier('ANNUAL_TRIAL')}
            activeOpacity={0.85}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueBadgeText}>BEST VALUE • 7 DAYS FREE</Text>
            </View>

            <View style={styles.planCardContent}>
              <View style={[styles.radioCircle, selectedTier === 'ANNUAL_TRIAL' && styles.radioCircleActive]}>
                {selectedTier === 'ANNUAL_TRIAL' && <View style={styles.radioInnerDot} />}
              </View>

              <View style={styles.planInfo}>
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

          <TouchableOpacity
            style={[styles.planCard, selectedTier === 'MONTHLY' && styles.planCardSelected]}
            onPress={() => setSelectedTier('MONTHLY')}
            activeOpacity={0.85}
          >
            <View style={styles.planCardContent}>
              <View style={[styles.radioCircle, selectedTier === 'MONTHLY' && styles.radioCircleActive]}>
                {selectedTier === 'MONTHLY' && <View style={styles.radioInnerDot} />}
              </View>

              <View style={styles.planInfo}>
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

          <TouchableOpacity
            style={[styles.planCard, selectedTier === 'TRAVEL_PASS' && styles.planCardSelected]}
            onPress={() => setSelectedTier('TRAVEL_PASS')}
            activeOpacity={0.85}
          >
            <View style={styles.islandTripBadge}>
              <Text style={styles.islandTripBadgeText}>FOR ISLAND TRIPS</Text>
            </View>

            <View style={styles.planCardContent}>
              <View style={[styles.radioCircle, selectedTier === 'TRAVEL_PASS' && styles.radioCircleActive]}>
                {selectedTier === 'TRAVEL_PASS' && <View style={styles.radioInnerDot} />}
              </View>

              <View style={styles.planInfo}>
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

          <TouchableOpacity
            style={[styles.planCard, selectedTier === 'CREDITS' && styles.planCardSelected]}
            onPress={() => setSelectedTier('CREDITS')}
            activeOpacity={0.85}
          >
            <View style={styles.planCardContent}>
              <View style={[styles.radioCircle, selectedTier === 'CREDITS' && styles.radioCircleActive]}>
                {selectedTier === 'CREDITS' && <View style={styles.radioInnerDot} />}
              </View>

              <View style={styles.planInfo}>
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

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.mainCtaButton}
            onPress={handleSubscribe}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.ctaContentRow}>
                <Text style={styles.mainCtaText}>
                  {selectedTier === 'ANNUAL_TRIAL' && 'Start 7-Day Free Trial'}
                  {selectedTier === 'MONTHLY' && 'Get Monthly Pass ($9.99/mo)'}
                  {selectedTier === 'TRAVEL_PASS' && 'Get 7-Day Travel Pass ($4.99)'}
                  {selectedTier === 'CREDITS' && 'Get 50 Poquito Credits ($4.99)'}
                </Text>
                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.freeForeverBtn}>
            <Text style={styles.freeForeverText}>Try it first</Text>
          </TouchableOpacity>

          <View style={styles.minimalLegalRow}>
            <Text style={styles.legalNoticeText}>Cancel anytime in Settings</Text>
            <Text style={styles.legalBullet}>•</Text>
            <TouchableOpacity onPress={handleRestore}>
              <Text style={styles.legalLink}>Restore</Text>
            </TouchableOpacity>
            <Text style={styles.legalBullet}>•</Text>
            <TouchableOpacity onPress={() => openLegal('https://poquitotalk.hero-apps.com/terms')}>
              <Text style={styles.legalLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.legalBullet}>•</Text>
            <TouchableOpacity onPress={() => openLegal('https://poquitotalk.hero-apps.com/privacy')}>
              <Text style={styles.legalLink}>Privacy</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAF8F5', // Seamless Warm Cream Canvas
    paddingHorizontal: 18,
    justifyContent: 'space-between',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  trialTopBadge: {
    backgroundColor: '#D5E8D1',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  trialTopBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.4,
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E1D7',
  },
  skipPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1A130E',
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    shadowColor: '#964824',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none', outline: 'none' } as any : {}),
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 88,
  },
  bigMascotImg: {
    width: 88,
    height: 88,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A130E', // Crisp Jet Black / Dark Charcoal
    textAlign: 'center',
    marginTop: 1,
  },
  locationTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 1,
  },
  locationTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#964824',
  },
  tagDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#964824',
    opacity: 0.5,
  },
  mainSubtitle: {
    fontSize: 11.5,
    color: '#4A3E33', // Solid readable charcoal
    textAlign: 'center',
    marginTop: 1,
    paddingHorizontal: 6,
  },
  featureGridContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 8.5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E8E1D7',
    shadowColor: '#964824',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 7,
  },
  gridItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 2,
  },
  gridIconDisc: {
    width: 29,
    height: 29,
    borderRadius: 9,
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
    fontSize: 10.8,
    fontWeight: '800',
    color: '#1A130E', // Crisp jet black
  },
  gridSubText: {
    fontSize: 9,
    lineHeight: 11.5,
    fontWeight: '500',
    color: '#4A3E33',
    marginTop: 0.5,
  },
  plansContainer: {
    width: '100%',
    gap: 6.5,
  },
  planCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: '#E8E1D7',
    position: 'relative',
    shadowColor: '#964824',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  planCardSelected: {
    borderColor: '#964824',
    backgroundColor: '#FFF9F6',
    borderWidth: 2,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#964824',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  bestValueBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.4,
  },
  islandTripBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  islandTripBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.4,
  },
  planCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  radioCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
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
  planInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A130E',
  },
  planSubtitle: {
    fontSize: 9.8,
    color: '#4A3E33',
    marginTop: 0.5,
    fontWeight: '500',
  },
  planSubtitleMuted: {
    fontSize: 9.8,
    color: '#64748B',
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
    fontSize: 14.5,
    fontWeight: '900',
    color: '#1A130E',
  },
  pricePeriod: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4A3E33',
  },
  priceSubText: {
    fontSize: 8.8,
    fontWeight: '700',
    color: '#059669',
    marginTop: 0.5,
  },
  priceSubTextEmerald: {
    fontSize: 8.8,
    fontWeight: '700',
    color: '#059669',
    marginTop: 0.5,
  },
  priceSubTextMuted: {
    fontSize: 8.8,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 0.5,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  mainCtaButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 14.5,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'nowrap',
  },
  mainCtaText: {
    fontSize: 15.8,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.2,
  },
  freeForeverBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  freeForeverText: {
    fontSize: 10.8,
    fontWeight: '700',
    color: '#964824',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  minimalLegalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 0.5,
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
    color: '#CFC5BB',
  },
});
