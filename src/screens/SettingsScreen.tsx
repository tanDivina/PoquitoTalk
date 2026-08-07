import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { FeedbackModal } from '../components/FeedbackModal';
import { GreenParrotLogo } from '../components/GreenParrotLogo';

import { GoogleSignInButton } from '../components/GoogleSignInButton';

interface SettingsScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onResetOnboarding?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ isPro, onOpenPaywall, onResetOnboarding }) => {
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} onResetOnboarding={onResetOnboarding} />

      <View style={styles.titleSection}>
        <Text style={styles.title}>Settings & Account</Text>
        <Text style={styles.subtitle}>Configure preferences and sync your Google account.</Text>
      </View>

      {/* Google Account Sign-In Card */}
      <View style={styles.card}>
        <GoogleSignInButton />
      </View>

      {/* Studio Credits Card */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.iconCircle, { backgroundColor: 'transparent' }]}>
            <GreenParrotLogo size={42} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Natural Voice Notes</Text>
            <Text style={styles.cardSubtitle}>
              {isPro ? 'Pro Member (Unlimited Voice Notes)' : '5 Free Welcome Voice Notes Active'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onOpenPaywall}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>{isPro ? 'Manage Membership' : 'Get 50 Studio Credits ($4.99)'}</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Trigger Card */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => setFeedbackVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.secondary} />
          <Text style={styles.linkLabel}>Send Feedback & Feature Requests</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
        </TouchableOpacity>
      </View>

      {/* Intake Reset Card */}
      {onResetOnboarding && (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={onResetOnboarding}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-circle-outline" size={20} color={Colors.secondary} />
            <Text style={styles.linkLabel}>Re-run First-Time Intake Flow (Onboarding)</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
          </TouchableOpacity>
        </View>
      )}

      {/* Support & Privacy */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('mailto:support@hero-apps.com')}
        >
          <Ionicons name="mail-outline" size={18} color={Colors.primary} />
          <Text style={styles.linkLabel}>Support Desk</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('https://poquitotalk.hero-apps.com/privacy.html')}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
          <Text style={styles.linkLabel}>Privacy Policy & Data Security</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>PoquitoTalk v1.0.2 • Bocas del Toro, Panamá 🇵🇦</Text>

      {/* In-App Feedback Modal */}
      <FeedbackModal
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  keyInput: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: 12,
  },
  saveKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.whatsapp,
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 10,
  },
  saveKeyBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  linkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 12,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.outline,
    marginTop: 12,
  },
});
