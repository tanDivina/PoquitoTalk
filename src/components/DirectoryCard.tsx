import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Modal, Alert } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { LocalServiceProvider } from '../services/directory';

interface DirectoryCardProps {
  provider: LocalServiceProvider;
  translatedMessage?: string;
  onRewardGranted?: (bonusCredits: number) => void;
}

export const DirectoryCard: React.FC<DirectoryCardProps> = ({ provider, translatedMessage, onRewardGranted }) => {
  const [showSpotlightModal, setShowSpotlightModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isWatching, setIsWatching] = useState(false);

  const handleChatWhatsApp = async () => {
    const cleanNumber = provider.whatsappNumber.replace(/[^0-9+]/g, '');
    const message = translatedMessage || '¡Buenas! Le escribo por PoquitoTalk.';
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(`whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`);
    }
  };

  const handleWatchRewardedAd = () => {
    setShowSpotlightModal(true);
    setIsWatching(true);
    setCountdown(10);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsWatching(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClaimReward = () => {
    setShowSpotlightModal(false);
    if (onRewardGranted) onRewardGranted(5);
    Alert.alert(
      "Reward Unlocked! 🎁",
      `Thank you for viewing ${provider.name}'s local spotlight. You received +5 Free Voice Note Translations!`,
      [{ text: "Awesome!" }]
    );
  };

  return (
    <View style={[styles.card, provider.isSponsored && styles.sponsoredCard]}>
      {provider.isSponsored && (
        <View style={styles.sponsoredHeaderBanner}>
          <MaterialCommunityIcons name="star-circle" size={14} color="#FFF" />
          <Text style={styles.sponsoredHeaderBannerText}>SPONSORED BOCAS PROVIDER</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.nameSection}>
          <Text style={styles.providerName}>{provider.name}</Text>
          {provider.notes && <Text style={styles.notes}>{provider.notes}</Text>}
        </View>

        {provider.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.tertiary} />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}
      </View>

      {/* Catvertising Rewarded Ad Trigger Button */}
      {provider.isSponsored && provider.adSpotlightText && (
        <TouchableOpacity
          style={styles.rewardedAdBtn}
          onPress={handleWatchRewardedAd}
          activeOpacity={0.8}
        >
          <Ionicons name="play-circle-outline" size={16} color={Colors.secondary} />
          <Text style={styles.rewardedAdBtnText}>
            Watch 10s Sponsor Spotlight $\rightarrow$ Get +5 Free Voice Notes! 🎁
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color="#E6A100" />
          <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
        </View>

        <TouchableOpacity style={styles.chatBtn} onPress={handleChatWhatsApp} activeOpacity={0.8}>
          <FontAwesome5 name="whatsapp" size={14} color="#FFF" />
          <Text style={styles.chatBtnText}>Message on WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Rewarded Sponsor Spotlight Modal */}
      <Modal visible={showSpotlightModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="star-circle" size={24} color={Colors.secondary} />
              <Text style={styles.modalTitle}>{provider.name}</Text>
            </View>

            <Text style={styles.modalSubtitle}>
              Local Bocas del Toro Featured Sponsor
            </Text>

            <View style={styles.spotlightBox}>
              <Ionicons name="megaphone-outline" size={28} color={Colors.secondary} />
              <Text style={styles.spotlightDesc}>
                {provider.notes} Contact directly on WhatsApp for prompt island service!
              </Text>
            </View>

            {isWatching ? (
              <View style={styles.countdownBox}>
                <Ionicons name="time-outline" size={20} color={Colors.secondary} />
                <Text style={styles.countdownText}>
                  Watching Sponsor Spotlight... ({countdown}s)
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.claimRewardBtn}
                onPress={handleClaimReward}
                activeOpacity={0.8}
              >
                <Ionicons name="gift" size={18} color="#FFF" />
                <Text style={styles.claimRewardBtnText}>Claim +5 Free Translations!</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sponsoredCard: {
    borderColor: Colors.secondary,
    borderWidth: 2,
    backgroundColor: Colors.secondaryContainer || '#F4FAFE',
  },
  sponsoredHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  sponsoredHeaderBannerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameSection: {
    flex: 1,
    marginRight: 8,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  notes: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.tertiary,
  },
  rewardedAdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  rewardedAdBtnText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.whatsapp,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  spotlightBox: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  spotlightDesc: {
    fontSize: 13,
    color: Colors.onBackground,
    textAlign: 'center',
    lineHeight: 18,
  },
  countdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  claimRewardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    width: '100%',
    justifyContent: 'center',
  },
  claimRewardBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
