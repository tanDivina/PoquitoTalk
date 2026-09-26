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

interface PostWhatsAppModalProps {
  visible: boolean;
  onClose: () => void;
  contactName?: string;
  dispatchType?: 'voice_note' | 'text';
  walkieRoomId?: string | null;
  onOpenDecoder?: () => void;
  onOpenWalkieChannel?: () => void;
}

export const PostWhatsAppModal: React.FC<PostWhatsAppModalProps> = ({
  visible,
  onClose,
  contactName,
  dispatchType = 'voice_note',
  walkieRoomId,
  onOpenDecoder,
  onOpenWalkieChannel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* Top Status Bar */}
          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <WhatsAppIcon size={14} color="#059669" />
              <Text style={styles.statusBadgeText}>DISPATCHED TO WHATSAPP</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close modal"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Mascot & Headline Row */}
            <View style={styles.heroRow}>
              <Image
                source={require('../assets/poquito_front_talking_v2_clean_256.webp')}
                style={styles.mascotImage}
                resizeMode="contain"
              />
              <View style={styles.heroTextWrap}>
                <Text style={styles.title}>Message Dispatched!</Text>
                <Text style={styles.subtitle}>
                  {contactName
                    ? `Successfully handed off to WhatsApp for ${contactName}.`
                    : `Your ${dispatchType === 'voice_note' ? 'Spanish voice note' : 'Spanish message'} was opened in WhatsApp.`}
                </Text>
              </View>
            </View>

            {/* Next Steps Guidance */}
            <View style={styles.guidanceSection}>
              <Text style={styles.sectionHeading}>WHAT TO DO NEXT</Text>

              {/* Priority 1: Live Walkie Room (if user dispatched live walkie link) */}
              {walkieRoomId && onOpenWalkieChannel ? (
                <>
                  <View style={styles.actionCard}>
                    <View style={styles.actionCardHeader}>
                      <View style={[styles.actionIconBubble, { backgroundColor: '#EFF6FF' }]}>
                        <Ionicons name="radio" size={18} color="#2563EB" />
                      </View>
                      <View style={styles.actionCardTextWrap}>
                        <Text style={styles.actionCardTitle}>Live 2-Way Channel Active</Text>
                        <Text style={styles.actionCardBody}>
                          {contactName || 'Your contractor'} can tap the WhatsApp link to talk. Replies are automatically translated and decoded into English in your live stream.
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.actionPrimaryBtn, { backgroundColor: '#2563EB' }]}
                      onPress={() => {
                        onClose();
                        onOpenWalkieChannel();
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="radio" size={15} color="#FFFFFF" />
                      <Text style={styles.actionPrimaryBtnText}>Return to Live Walkie-Talkie</Text>
                    </TouchableOpacity>
                  </View>

                  {onOpenDecoder && (
                    <View style={[styles.actionCard, { marginTop: 10 }]}>
                      <View style={styles.actionCardHeader}>
                        <View style={[styles.actionIconBubble, { backgroundColor: '#ECFDF5' }]}>
                          <Ionicons name="sparkles" size={18} color="#059669" />
                        </View>
                        <View style={styles.actionCardTextWrap}>
                          <Text style={styles.actionCardTitle}>Automatic Voice Decoder</Text>
                          <Text style={styles.actionCardBody}>
                            All incoming Spanish voice notes are automatically transcribed and decoded into plain English.
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.actionPrimaryBtn}
                        onPress={() => {
                          onClose();
                          onOpenDecoder();
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="sparkles-outline" size={15} color="#FFFFFF" />
                        <Text style={styles.actionPrimaryBtnText}>Open Voice Decoder</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                /* Standard Voice / Text Dispatch */
                <View style={styles.actionCard}>
                  <View style={styles.actionCardHeader}>
                    <View style={[styles.actionIconBubble, { backgroundColor: '#ECFDF5' }]}>
                      <Ionicons name="sparkles" size={18} color="#059669" />
                    </View>
                    <View style={styles.actionCardTextWrap}>
                      <Text style={styles.actionCardTitle}>Automatic Voice Translation</Text>
                      <Text style={styles.actionCardBody}>
                        {contactName ? `When ${contactName} replies` : 'When they reply'} with a Spanish voice note, PoquitoTalk automatically decodes and translates it into clear English.
                      </Text>
                    </View>
                  </View>
                  {onOpenDecoder && (
                    <TouchableOpacity
                      style={styles.actionPrimaryBtn}
                      onPress={() => {
                        onClose();
                        onOpenDecoder();
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="sparkles-outline" size={15} color="#FFFFFF" />
                      <Text style={styles.actionPrimaryBtnText}>Open Voice Decoder</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom Dismissal */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Back to PoquitoTalk</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#FAF8F5',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(150, 72, 36, 0.15)',
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  scrollContent: {
    paddingBottom: 12,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(150, 72, 36, 0.10)',
    marginBottom: 16,
  },
  mascotImage: {
    width: 64,
    height: 64,
  },
  heroTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1208',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5C4E3A',
    lineHeight: 18,
  },
  guidanceSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8C7A68',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(150, 72, 36, 0.08)',
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  actionIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardTextWrap: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1208',
    marginBottom: 3,
  },
  actionCardBody: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 17,
  },
  actionPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  actionPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#964824',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 14,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
