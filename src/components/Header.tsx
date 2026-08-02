import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface HeaderProps {
  isPro?: boolean;
  onOpenPaywall: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isPro = false, onOpenPaywall }) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.logoBubble}>
          <MaterialCommunityIcons name="chat-processing-outline" size={22} color={Colors.secondary} />
        </View>
        <View>
          <Text style={styles.title}>PoquitoTalk</Text>
          <Text style={styles.subtitle}>Friendly Local Translations</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
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
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  proTextActive: {
    color: Colors.tertiary,
  },
});
