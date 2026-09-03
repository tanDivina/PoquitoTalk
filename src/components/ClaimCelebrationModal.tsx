import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface ClaimCelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  packageName?: string;
  creditsGranted?: number;
  isPro?: boolean;
}

export const ClaimCelebrationModal: React.FC<ClaimCelebrationModalProps> = ({
  visible,
  onClose,
  packageName = 'PoquitoTalk Pro Pass',
  creditsGranted = 50,
  isPro = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Top Green Accent Bar */}
          <View style={styles.accentBar} />

          {/* Victory Mascot Image from Studio */}
          <View style={styles.mascotContainer}>
            <Image
              source={require('../assets/poquito_victory_jump_256.webp')}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>

          {/* Badge */}
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={16} color="#2E402D" />
            <Text style={styles.badgeText}>Purchase Successfully Unlocked</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>¡Wepa! Access Granted</Text>
          <Text style={styles.subtitle}>
            Your{' '}
            <Text style={styles.boldText}>
              {packageName.includes('PoquitoTalk') ? (
                <>
                  <Text style={{ color: Colors.onBackground }}>Poquito</Text>
                  <Text style={{ color: Colors.secondary }}>Talk</Text>
                  {packageName.replace('PoquitoTalk', '')}
                </>
              ) : (
                packageName
              )}
            </Text>{' '}
            has been activated on this device.
          </Text>

          {/* Value Stats */}
          <View style={styles.statsRow}>
            {isPro && (
              <View style={styles.statChip}>
                <Ionicons name="infinite" size={18} color="#2E402D" />
                <Text style={styles.statText}>Unlimited Notes</Text>
              </View>
            )}
            <View style={styles.statChip}>
              <Ionicons name="flash" size={16} color="#964824" />
              <Text style={styles.statText}>+{creditsGranted} Credits</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="mic" size={16} color="#2E402D" />
              <Text style={styles.statText}>4 Studio Personas</Text>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={onClose}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaText}>Start Talking en Español</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#25D366',
  },
  mascotContainer: {
    width: 140,
    height: 140,
    marginVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D5E8D1',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E402D',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B1C1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#5C554D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#1B1C1A',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 24,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3EF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E2DE',
  },
  statText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B1C1A',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2E402D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    shadowColor: '#2E402D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
