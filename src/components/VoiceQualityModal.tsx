import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { VoiceOption } from '../services/googleVoice';

interface VoiceQualityModalProps {
  visible: boolean;
  onClose: () => void;
  selectedVoice: VoiceOption;
  onSelectFreeStandardVoice: () => void;
  onBuyCreditsOrPro: () => void;
}

export const VoiceQualityModal: React.FC<VoiceQualityModalProps> = ({
  visible,
  onClose,
  selectedVoice,
  onSelectFreeStandardVoice,
  onBuyCreditsOrPro,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={Colors.outline} />
          </TouchableOpacity>

          <View style={styles.headerIcon}>
            <FontAwesome5 name="microphone-alt" size={28} color={Colors.secondary} />
          </View>

          <Text style={styles.title}>Choose Voice Note Quality 🎙️</Text>
          <Text style={styles.subtitle}>
            You selected <Text style={styles.boldText}>{selectedVoice.name} ({selectedVoice.tone.toLowerCase()})</Text>. You currently have 0 Studio Voice Credits remaining.
          </Text>

          {/* Option 1: Standard Free Voice */}
          <TouchableOpacity
            style={styles.freeOptionCard}
            onPress={() => {
              onClose();
              onSelectFreeStandardVoice();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.optionHeader}>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>100% FREE</Text>
              </View>
              <Text style={styles.optionTitle}>⚡ Standard Free Voice</Text>
            </View>
            <Text style={styles.optionDesc}>
              Send using local device voice engine. Unlimited usage with zero API cost.
            </Text>
            <View style={styles.actionRow}>
              <Text style={styles.freeActionText}>Use Standard Free Voice</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.secondary} />
            </View>
          </TouchableOpacity>

          {/* Option 2: Studio Pro / Credits */}
          <TouchableOpacity
            style={styles.proOptionCard}
            onPress={() => {
              onClose();
              onBuyCreditsOrPro();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.optionHeader}>
              <View style={styles.proBadge}>
                <Ionicons name="star" size={10} color="#FFF" />
                <Text style={styles.proBadgeText}>STUDIO QUALITY</Text>
              </View>
              <Text style={styles.optionTitle}>⭐ Unlock 50 Studio Credits ($4.99)</Text>
            </View>
            <Text style={styles.optionDesc}>
              Ultra-realistic ElevenLabs audio with human inflection, warm cadence, and natural Panamanian accent.
            </Text>
            <View style={styles.proActionBtn}>
              <Ionicons name="cart" size={16} color="#FFF" />
              <Text style={styles.proActionBtnText}>Get 50 Studio Credits ($4.99)</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainer,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondaryContainer || '#F4FAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.secondary,
  },
  freeOptionCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainer || '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  freeBadge: {
    backgroundColor: Colors.tertiaryContainer || '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.tertiary || '#2E7D32',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  optionDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  freeActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  proOptionCard: {
    width: '100%',
    backgroundColor: Colors.secondaryContainer || '#F4FAFE',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },
  proActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  proActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
});
