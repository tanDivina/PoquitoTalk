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

            <Text style={styles.title}>PoquitoTalk Pro</Text>
            <Text style={styles.subtitle}>
              Unlimited AI Translations for Everyday Services & Local Contacts
            </Text>

            {/* Feature Highlights */}
            <View style={styles.featuresList}>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.tertiary} />
                <Text style={styles.featureText}>Unlimited Gemma 2B AI Translations</Text>
              </View>
              <View style={styles.featureRow}>
                <FontAwesome5 name="whatsapp" size={18} color={Colors.whatsapp} />
                <Text style={styles.featureText}>1-Tap Instant WhatsApp & SMS Sharing</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="wifi-outline" size={20} color={Colors.secondary} />
                <Text style={styles.featureText}>Offline Translation Mode</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="star-outline" size={20} color={Colors.primary} />
                <Text style={styles.featureText}>All Service Presets (A/C, Boat, Starlink, Car)</Text>
              </View>
            </View>

            {/* Pricing Box */}
            <View style={styles.pricingCard}>
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>BEST VALUE</Text>
              </View>
              <Text style={styles.planTitle}>Annual Unlimited Access</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>$19.99</Text>
                <Text style={styles.pricePeriod}>/ year ($1.66/mo)</Text>
              </View>
              <Text style={styles.trialText}>Includes 7-Day Free Trial • Cancel Anytime</Text>
            </View>

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
                <Text style={styles.subscribeBtnText}>Start 7-Day Free Trial</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Powered by RevenueCat for Google Play & App Store
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
    backgroundColor: 'rgba(27, 28, 26, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  crownContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onBackground,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  featuresList: {
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainer,
    padding: 12,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  pricingCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.secondary,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 8,
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.secondary,
  },
  pricePeriod: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  trialText: {
    fontSize: 12,
    color: Colors.tertiary,
    fontWeight: '600',
    marginTop: 6,
  },
  subscribeBtn: {
    width: '100%',
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  subscribeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  footerNote: {
    fontSize: 11,
    color: Colors.outline,
    marginTop: 14,
  },
});
