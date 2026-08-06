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
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { revenueCat } from '../services/revenuecat';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'CREDITS' | 'SUBSCRIPTION'>('CREDITS');

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const success = await revenueCat.purchaseProPackage();
      if (success) {
        Alert.alert('Welcome to PoquitoTalk Pro!', 'You now have unlimited Gemma translations and WhatsApp sharing.');
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
      const inviteUrl = 'https://poquitotalk.hero-apps.com?ref=bocas_expat';
      await Share.share({
        message: '🌴 Hey! Try PoquitoTalk to translate WhatsApp voice notes with local Bocas plumbers, boat captains, and landlords: ' + inviteUrl,
        url: inviteUrl,
        title: 'PoquitoTalk Free Pro Referral',
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

          <ScrollView contentContainerStyle={styles.content}>
            {/* Header Badge */}
            <View style={styles.crownContainer}>
              <MaterialCommunityIcons name="crown" size={32} color={Colors.secondary} />
            </View>

            <Text style={styles.title}>Unlock Studio Quality Voices 🎙️</Text>
            <Text style={styles.subtitle}>
              Get human-grade ultra-realistic voice notes with warm Panamanian cadence.
            </Text>

            {/* Feature Highlights */}
            <View style={styles.featuresList}>
              <View style={styles.featureRow}>
                <Ionicons name="sparkles" size={20} color={Colors.secondary} />
                <Text style={styles.featureText}>Ultra-Realistic Studio Voices (Diego, Mateo, Sofia, Valeria)</Text>
              </View>
              <View style={styles.featureRow}>
                <FontAwesome5 name="whatsapp" size={18} color={Colors.whatsapp} />
                <Text style={styles.featureText}>1-Tap Voice Notes sent directly to WhatsApp</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.tertiary} />
                <Text style={styles.featureText}>Zero Ads & Zero Sponsor Spotlights</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="chatbubbles" size={20} color={Colors.primary} />
                <Text style={styles.featureText}>Unlimited 2-Way WhatsApp Conversation Threads</Text>
              </View>
            </View>

            {/* Tier 1: Starter 50 Credits Pack */}
            <TouchableOpacity
              style={[styles.pricingCard, selectedTier === 'CREDITS' && styles.pricingCardSelected]}
              onPress={() => setSelectedTier('CREDITS')}
              activeOpacity={0.8}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULAR ONE-TIME</Text>
              </View>
              <Text style={styles.planTitle}>Starter 50 Studio Credits</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>$4.99</Text>
                <Text style={styles.pricePeriod}>one-time payment</Text>
              </View>
              <Text style={styles.trialText}>50 Ultra-Realistic Studio Voice Notes • Never Expires</Text>
            </TouchableOpacity>

            {/* Tier 2: Monthly Pro Membership */}
            <TouchableOpacity
              style={[styles.pricingCard, selectedTier === 'SUBSCRIPTION' && styles.pricingCardSelected]}
              onPress={() => setSelectedTier('SUBSCRIPTION')}
              activeOpacity={0.8}
            >
              <View style={[styles.popularBadge, { backgroundColor: Colors.tertiary }]}>
                <Text style={styles.popularText}>BEST VALUE</Text>
              </View>
              <Text style={styles.planTitle}>Pro Monthly Membership</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>$9.99</Text>
                <Text style={styles.pricePeriod}>/ month</Text>
              </View>
              <Text style={styles.trialText}>Unlimited Studio Voice Notes + Zero Ads • Cancel Anytime</Text>
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
                  {selectedTier === 'CREDITS' ? 'Get 50 Studio Credits ($4.99)' : 'Subscribe to Pro ($9.99/mo)'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Growth Loop: Invite a Neighbor */}
            <TouchableOpacity
              style={styles.referralCard}
              onPress={handleInviteNeighbor}
              activeOpacity={0.8}
            >
              <View style={styles.referralIconCircle}>
                <Ionicons name="gift-outline" size={20} color={Colors.secondary} />
              </View>
              <View style={styles.referralTextContainer}>
                <Text style={styles.referralTitle}>Invite a Bocas Neighbor 🎁</Text>
                <Text style={styles.referralSub}>Get +5 Free Studio Credits when they download!</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.secondary} />
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Secured payments via RevenueCat, Apple App Store & Google Play
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '88%',
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  featuresList: {
    width: '100%',
    marginVertical: 18,
    gap: 10,
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
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  pricingCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  pricingCardSelected: {
    borderColor: Colors.secondary,
    borderWidth: 2.5,
    backgroundColor: Colors.secondaryContainer || '#F4FAFE',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 6,
  },
  priceAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  pricePeriod: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  trialText: {
    fontSize: 11,
    color: Colors.tertiary,
    fontWeight: '600',
    marginTop: 6,
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
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
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
    fontSize: 13,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  referralSub: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  footerNote: {
    fontSize: 10,
    color: Colors.outline,
    marginTop: 14,
  },
});
