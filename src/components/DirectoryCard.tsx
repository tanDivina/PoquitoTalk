import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Modal, Alert } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { LocalServiceProvider } from '../types';
import { vouchService } from '../services/vouch';
import { walkieTalkieService } from '../services/walkieTalkie';
import { shareWalkieTalkieToWhatsApp } from '../services/deepLinks';

interface DirectoryCardProps {
  provider: LocalServiceProvider;
  translatedMessage?: string;
  onRewardGranted?: (bonusCredits: number) => void;
}

export const DirectoryCard: React.FC<DirectoryCardProps> = ({ provider, translatedMessage, onRewardGranted }) => {
  const [showSpotlightModal, setShowSpotlightModal] = useState(false);
  const [showVouchModal, setShowVouchModal] = useState(false);
  const [hasVouched, setHasVouched] = useState(false);
  const [vouchCount, setVouchCount] = useState(provider.vouchCount || 0);
  const [countdown, setCountdown] = useState(10);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    vouchService.hasVouched(provider.id).then((vouched) => {
      setHasVouched(vouched);
    });
    setVouchCount(provider.vouchCount || 0);
  }, [provider.id, provider.vouchCount]);

  const handleStartPoquitoTalkie = async () => {
    const session = walkieTalkieService.createSession();
    const recipientName = provider.name.split(' ')[0] || 'Amigo';
    await shareWalkieTalkieToWhatsApp(session.shareUrl, recipientName);
    Alert.alert(
      'PoquitoTalkie Channel Sent! 📻',
      `Sent 2-way live web link to ${provider.name}'s WhatsApp. They can talk with you with zero app installation!`
    );
  };

  const handleChatWhatsApp = async () => {
    if (!provider.whatsappNumber) return;
    const cleanNumber = provider.whatsappNumber.replace(/[^0-9+]/g, '');
    const defaultGreeting = '¡Buenas! Le escribo por PoquitoTalk para consultar sobre un servicio.';
    const message = translatedMessage || defaultGreeting;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    // Arm post-contact check-in prompt if not yet vouched
    if (!hasVouched) {
      setTimeout(() => {
        setShowVouchModal(true);
      }, 1200);
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(`whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`);
    }
  };

  const handleCallPhone = async () => {
    if (!provider.phoneNumber) return;
    const cleanPhone = provider.phoneNumber.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanPhone}`;

    if (!hasVouched) {
      setTimeout(() => {
        setShowVouchModal(true);
      }, 1200);
    }

    Linking.openURL(url).catch(() => {
      Alert.alert('Phone Call', `Call ${provider.phoneNumber}`);
    });
  };

  const handleOpenMap = () => {
    const query = provider.googleMapsQuery || provider.address || provider.name;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  const handleDirectVouch = async (reason: 'fast_response' | 'fair_price' | 'great_service') => {
    await vouchService.submitVouch(provider.id, reason);
    setHasVouched(true);
    setVouchCount((prev) => prev + 1);
    setShowVouchModal(false);
    Alert.alert(
      "Community Vouch Added!",
      `Thank you for supporting ${provider.name} and the Bocas del Toro community!`,
      [{ text: "Great!" }]
    );
  };

  const handleClaimListing = () => {
    const cleanPhone = (provider.phoneNumber || provider.whatsappNumber || '').replace(/[^0-9]/g, '');
    const text = `Hola PoquitoTalk, soy el dueño de ${provider.name} (${provider.phoneNumber || provider.whatsappNumber}). Solicito verificar y actualizar los datos de mi perfil.`;
    const url = `https://wa.me/50762625817?text=${encodeURIComponent(text)}`;
    Linking.openURL(url);
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
      "Reward Unlocked!",
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

      {/* 1. Provider Name as Full Width Header */}
      <Text style={styles.providerName}>{provider.name}</Text>

      {/* 2. Badges Row: Verified, Community Nominated, Dialect Tone, Vouch */}
      <View style={styles.badgesRow}>
        {provider.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.tertiary} />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}

        {provider.nominatedBy && (
          <View style={styles.nominatedBadge}>
            <Ionicons name="star" size={11} color="#B45309" />
            <Text style={styles.nominatedText}>CLIENT RECOMMENDED</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.vouchBadge, hasVouched && styles.vouchBadgeActive]}
          onPress={() => setShowVouchModal(true)}
          activeOpacity={0.75}
        >
          <Ionicons
            name={vouchCount > 0 ? "shield-checkmark" : "shield-outline"}
            size={11}
            color={hasVouched ? '#FFF' : '#047857'}
          />
          <Text style={[styles.vouchText, hasVouched && styles.vouchTextActive]}>
            {vouchCount > 0 ? `${vouchCount} ${vouchCount === 1 ? 'Vouch' : 'Vouches'}` : '+ Vouch'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Full-width Gray Info Box: Notes / Description across 100% card width */}
      {provider.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>{provider.notes}</Text>
        </View>
      ) : null}

      {/* 4. Clean Metadata Details (Location, Hours, Phone) */}
      <View style={styles.metaSection}>
        {provider.address ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color="#0F172A" style={styles.metaIcon} />
            <Text style={styles.metaText}>{provider.address}</Text>
          </View>
        ) : null}

        {provider.hours ? (
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={13} color="#0F172A" style={styles.metaIcon} />
            <Text style={styles.metaText}>{provider.hours}</Text>
          </View>
        ) : null}

        {provider.phoneNumber ? (
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={13} color="#0F172A" style={styles.metaIcon} />
            <Text style={styles.metaText}>{provider.phoneNumber}</Text>
          </View>
        ) : null}

        {provider.website ? (
          <TouchableOpacity
            style={styles.metaRow}
            onPress={() => {
              const url = provider.website?.startsWith('http') ? provider.website : `https://${provider.website}`;
              Linking.openURL(url).catch(() => {});
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="globe-outline" size={13} color="#0F172A" style={styles.metaIcon} />
            <Text style={[styles.metaText, { color: '#0F172A', textDecorationLine: 'underline' }]} numberOfLines={1}>
              {provider.website.replace(/^https?:\/\//, '')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Catvertising Rewarded Ad Trigger Button */}
      {provider.isSponsored && provider.adSpotlightText && (
        <TouchableOpacity
          style={styles.rewardedAdBtn}
          onPress={handleWatchRewardedAd}
          activeOpacity={0.8}
        >
          <Ionicons name="play-circle-outline" size={16} color="#0F172A" />
          <Text style={styles.rewardedAdBtnText}>
            Watch 10s Sponsor Spotlight → Get +5 Free Voice Notes!
          </Text>
        </TouchableOpacity>
      )}

      {/* Compact Footer: Claim on left, WhatsApp/Call buttons on right */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleClaimListing} activeOpacity={0.7} style={styles.claimLinkBox}>
          <Ionicons name="create-outline" size={11} color="#0F172A" />
          <Text style={styles.claimLinkText}>¿Es tu perfil? Actualizar</Text>
        </TouchableOpacity>

        <View style={styles.buttonGroup}>
          {provider.whatsappNumber && (
            <TouchableOpacity style={styles.talkieBtn} onPress={handleStartPoquitoTalkie} activeOpacity={0.8}>
              <Ionicons name="radio" size={12} color="#FFF" />
              <Text style={styles.talkieBtnText}>Talkie</Text>
            </TouchableOpacity>
          )}

          {provider.googleMapsQuery && (
            <TouchableOpacity style={styles.mapBtn} onPress={handleOpenMap} activeOpacity={0.8}>
              <Ionicons name="navigate-outline" size={13} color="#0F172A" />
              <Text style={styles.mapBtnText}>Map</Text>
            </TouchableOpacity>
          )}

          {provider.phoneNumber && !provider.whatsappNumber && (
            <TouchableOpacity style={styles.callBtn} onPress={handleCallPhone} activeOpacity={0.8}>
              <Ionicons name="call" size={13} color="#FFF" />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          )}

          {provider.whatsappNumber && (
            <TouchableOpacity style={styles.chatBtn} onPress={handleChatWhatsApp} activeOpacity={0.8}>
              <FontAwesome5 name="whatsapp" size={14} color="#FFF" />
              <Text style={styles.chatBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 1-TAP POST-WHATSAPP COMMUNITY VOUCH MODAL */}
      <Modal visible={showVouchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowVouchModal(false)}>
              <Ionicons name="close" size={20} color={Colors.outline} />
            </TouchableOpacity>

            <View style={styles.modalHeaderIcon}>
              <Ionicons name="shield-checkmark" size={28} color="#059669" />
            </View>

            <Text style={styles.modalTitle}>Vouch for {provider.name}</Text>
            <Text style={styles.modalSubtitle}>
              Help expats and locals in Bocas del Toro by leaving an authentic 1-tap vouch:
            </Text>

            <View style={styles.vouchOptionsList}>
              <TouchableOpacity
                style={styles.vouchOptionBtn}
                onPress={() => handleDirectVouch('fast_response')}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="flash-outline" size={16} color="#059669" />
                  <Text style={styles.vouchOptionLabel}>Fast Response & On Time</Text>
                </View>
                <View style={styles.vouchPlusTag}><Text style={styles.vouchPlusTagText}>+1 Vouch</Text></View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.vouchOptionBtn}
                onPress={() => handleDirectVouch('fair_price')}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="pricetag-outline" size={16} color="#059669" />
                  <Text style={styles.vouchOptionLabel}>Fair & Transparent Price</Text>
                </View>
                <View style={styles.vouchPlusTag}><Text style={styles.vouchPlusTagText}>+1 Vouch</Text></View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.vouchOptionBtn}
                onPress={() => handleDirectVouch('great_service')}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="star-outline" size={16} color="#059669" />
                  <Text style={styles.vouchOptionLabel}>Great Island Service</Text>
                </View>
                <View style={styles.vouchPlusTag}><Text style={styles.vouchPlusTagText}>+1 Vouch</Text></View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setShowVouchModal(false)} style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  },
  sponsoredHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sponsoredHeaderBannerText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 6,
    width: '100%',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    width: '100%',
    flexWrap: 'wrap',
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
  nominatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  nominatedText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  vouchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  vouchBadgeActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  vouchText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#047857',
  },
  vouchTextActive: {
    color: '#FFF',
  },
  notesContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    width: '100%',
  },
  metaSection: {
    marginTop: 6,
    marginBottom: 4,
    gap: 5,
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 1,
    width: '100%',
  },
  metaIcon: {
    flexShrink: 0,
    marginTop: 1.5,
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
    lineHeight: 17,
  },
  rewardedAdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  rewardedAdBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  claimLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimLinkText: {
    fontSize: 11,
    color: Colors.outline,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  talkieBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  talkieBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 18,
  },
  vouchOptionsList: {
    width: '100%',
    gap: 8,
    marginVertical: 10,
  },
  vouchOptionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  vouchOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  vouchPlusTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  vouchPlusTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  skipBtn: {
    marginTop: 12,
    padding: 6,
  },
  skipBtnText: {
    fontSize: 12,
    color: Colors.outline,
    textDecorationLine: 'underline',
  },
  spotlightBox: {
    backgroundColor: Colors.secondaryContainer || '#F4FAFE',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  spotlightDesc: {
    fontSize: 13,
    color: Colors.onBackground,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  countdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  claimRewardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
  },
  claimRewardBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
