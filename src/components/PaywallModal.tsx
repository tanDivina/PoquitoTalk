import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { GoogleSignInButton } from './GoogleSignInButton';
import { GreenParrotLogo } from './GreenParrotLogo';
import { revenueCat } from '../services/revenuecat';
import { getUserProfile } from '../services/userService';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export type PlanTier = 'CREDITS' | 'WEEKLY' | 'PRO_MONTHLY';

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PlanTier>('PRO_MONTHLY');

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const success = await revenueCat.purchaseProPackage();
      if (success) {
        Alert.alert('Welcome to PoquitoTalk Pro!', 'You now have full access to Premium voice notes and Walkie-Talkie.');
        onSuccess();
        onClose();
      }
    } catch (error) {
      Alert.alert('Purchase Error', 'Unable to complete transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteNeighbor = async () => {
    try {
      const profile = await getUserProfile();
      const refCode = profile.uid || 'usr_guest_bocas';
      const inviteUrl = `https://poquitotalk.hero-apps.com?ref=${encodeURIComponent(refCode)}`;
      
      // Fire-and-forget background analytics log
      fetch('https://poquitotalk.hero-apps.com/api/referral.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_invite',
          referrer_code: refCode,
          referrer_uid: profile.uid,
          channel: 'share_modal'
        })
      }).catch(() => {});

      await Share.share({
        message: '🌴 Hey! Try PoquitoTalk to translate WhatsApp voice notes with local Bocas plumbers, boat captains, and landlords: ' + inviteUrl,
        url: inviteUrl,
        title: 'PoquitoTalk Free Referral',
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={Colors.onBackground} />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header Logo */}
            <View style={styles.crownContainer}>
              <GreenParrotLogo size={52} />
            </View>

            {/* Single Line Clean Title */}
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
              Unlock Premium Voices
            </Text>
            <Text style={styles.subtitle}>
              Human-grade Spanish voice notes with natural Panamanian cadence.
            </Text>

            {/* Feature Highlights */}
            <View style={styles.featuresList}>
              <View style={styles.featureRow}>
                <Ionicons name="volume-high-outline" size={20} color={Colors.tertiary} />
                <Text style={styles.featureText}>
                  Natural Panamanian Premium Voices
                </Text>
              </View>

              <View style={styles.featureRow}>
                <Ionicons name="radio-outline" size={20} color={Colors.secondary} />
                <Text style={styles.featureText}>
                  2-Way Live Walkie-Talkie Web Links for Contractors
                </Text>
              </View>

              <View style={styles.featureRow}>
                <FontAwesome5 name="whatsapp" size={18} color={Colors.whatsapp} />
                <Text style={styles.featureText}>
                  1-Tap Voice Notes sent directly to WhatsApp
                </Text>
              </View>

              <View style={styles.featureRow}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.tertiary} />
                <Text style={styles.featureText}>
                  Zero Ads & Zero Sponsor Spotlights
                </Text>
              </View>
            </View>

            {/* Plan 1: Pro Monthly Membership ($12.99/mo) */}
            <TouchableOpacity
              style={[styles.pricingCard, selectedTier === 'PRO_MONTHLY' && styles.pricingCardSelected]}
              onPress={() => setSelectedTier('PRO_MONTHLY')}
              activeOpacity={0.8}
            >
              <View style={[styles.popularBadge, { backgroundColor: Colors.tertiary }]}>
                <Text style={styles.popularText}>BEST VALUE FOR RESIDENTS</Text>
              </View>
              <Text style={styles.planTitle}>Pro Monthly Membership</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>$12.99</Text>
                <Text style={styles.pricePeriod}>/ month</Text>
              </View>
              <Text style={styles.trialText}>
                300 Voice Notes + 65 Walkie Sessions / mo • For permanent Panama residents
              </Text>
            </TouchableOpacity>

            {/* Plan 2: Weekly Tourist Pass ($4.99/wk) */}
            <TouchableOpacity
              style={[styles.pricingCard, selectedTier === 'WEEKLY' && styles.pricingCardSelected]}
              onPress={() => setSelectedTier('WEEKLY')}
              activeOpacity={0.8}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>WEEKLY TOURIST PASS</Text>
              </View>
              <Text style={styles.planTitle}>7-Day Tourist Pass</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>$4.99</Text>
                <Text style={styles.pricePeriod}>/ 7 days</Text>
              </View>
              <Text style={styles.trialText}>
                100 Voice Notes + 25 Walkie Sessions / week • Ideal for island trips
              </Text>
            </TouchableOpacity>

            {/* Plan 3: 50 Credits Pack ($4.99 one-time) */}
            <TouchableOpacity
              style={[styles.pricingCard, selectedTier === 'CREDITS' && styles.pricingCardSelected]}
              onPress={() => setSelectedTier('CREDITS')}
              activeOpacity={0.8}
            >
              <Text style={styles.planTitle}>50 Poquito Credits Pack</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>$4.99</Text>
                <Text style={styles.pricePeriod}>one-time payment</Text>
              </View>
              <Text style={styles.trialText}>
                50 Voice Notes or 10 Walkie Sessions • Never expires
              </Text>
            </TouchableOpacity>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.subscribeBtn}
              onPress={handleSubscribe}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.subscribeBtnText}>
                  {selectedTier === 'PRO_MONTHLY' && 'Get Pro Monthly ($12.99 / mo)'}
                  {selectedTier === 'WEEKLY' && 'Get 7-Day Tourist Pass ($4.99 / wk)'}
                  {selectedTier === 'CREDITS' && 'Get 50 Poquito Credits ($4.99)'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Web Stripe Discount Callout */}
            <TouchableOpacity
              style={styles.webDiscountBox}
              onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/#pricing')}
              activeOpacity={0.8}
            >
              <View style={styles.webDiscountIconCircle}>
                <Ionicons name="globe-outline" size={17} color="#047857" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.webDiscountTitle}>Prefer paying on Web via Stripe?</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>25% OFF UNTIL SEPT 30</Text>
                  </View>
                </View>
                <Text style={styles.webDiscountSub}>Get 50 Credits for $3.74 on poquitotalk.hero-apps.com (Valid until Sept 30, 2026)</Text>
              </View>
              <Ionicons name="open-outline" size={16} color="#047857" />
            </TouchableOpacity>

            {/* Growth Loop: Invite a Neighbor */}
            <TouchableOpacity
              style={styles.referralCard}
              onPress={handleInviteNeighbor}
              activeOpacity={0.8}
            >
              <View style={styles.referralIconCircle}>
                <Ionicons name="gift-outline" size={20} color={Colors.tertiary} />
              </View>
              <View style={styles.referralTextContainer}>
                <Text style={styles.referralTitle}>Invite a Bocas Neighbor</Text>
                <Text style={styles.referralSub}>Get +5 Free Voice Notes when they try PoquitoTalk!</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.tertiary} />
            </TouchableOpacity>

            {/* In-App Store Secured Checkout Footer */}
            <Text style={styles.footerNote}>
              In-App purchases processed securely via Apple & Google Play • 1-Tap restore
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
    paddingHorizontal: 20,
    maxHeight: '92%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  crownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 12.5,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
    lineHeight: 17,
  },
  featuresList: {
    width: '100%',
    marginVertical: 16,
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  featureText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.onBackground,
    flexWrap: 'wrap',
  },
  pricingCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    position: 'relative',
    marginVertical: 8,
  },
  pricingCardSelected: {
    borderColor: Colors.tertiary,
    borderWidth: 2.5,
    backgroundColor: Colors.tertiaryContainer || '#F4FAFE',
  },
  popularBadge: {
    position: 'absolute',
    top: -11,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  pricePeriod: {
    fontSize: 12.5,
    color: Colors.onSurfaceVariant,
  },
  trialText: {
    fontSize: 11,
    color: Colors.tertiary,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  subscribeBtn: {
    width: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  subscribeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  webDiscountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F4FAF6',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  webDiscountIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  webDiscountTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
  },
  discountBadge: {
    backgroundColor: '#047857',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  webDiscountSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    fontWeight: '600',
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.tertiaryContainer,
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.tertiary,
  },
  referralIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  referralTextContainer: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  referralSub: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  footerNote: {
    fontSize: 10.5,
    color: Colors.outline,
    marginTop: 14,
    textAlign: 'center',
  },
});
