import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { GreenParrotLogo } from './GreenParrotLogo';

interface HeaderProps {
  isPro?: boolean;
  onOpenPaywall: () => void;
  onResetOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isPro = false, onOpenPaywall, onResetOnboarding }) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top + 6, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 40);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.brandContainer}>
        <GreenParrotLogo size={36} />
        <View style={styles.titleInfoBox}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>PoquitoTalk</Text>
          </View>
          <Text style={styles.subtitle}>Bocas del Toro, Panamá 🇵🇦</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.proBadge, isPro && styles.proBadgeActive]}
        onPress={onOpenPaywall}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="crown" size={14} color={isPro ? Colors.tertiary : Colors.secondary} />
        <Text style={[styles.proText, isPro && styles.proTextActive]}>
          {isPro ? 'PRO ACTIVE' : 'GET PRO'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  logoBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInfoBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  intakeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  intakeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  proBadgeActive: {
    backgroundColor: Colors.tertiaryContainer,
    borderColor: Colors.tertiary,
  },
  proText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  proTextActive: {
    color: Colors.tertiary,
  },
});
