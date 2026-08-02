import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';

interface SettingsScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ isPro, onOpenPaywall }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} />

      <View style={styles.titleSection}>
        <Text style={styles.title}>Settings & Account</Text>
        <Text style={styles.subtitle}>Configure preferences and subscription options.</Text>
      </View>

      {/* Subscription Card */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="card-outline" size={20} color={Colors.secondary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Subscription Plan</Text>
            <Text style={styles.cardSubtitle}>
              {isPro ? 'Pro Member (Unlimited Access)' : 'Free Tier (10 Translations / Day)'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onOpenPaywall}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>{isPro ? 'Manage Subscription' : 'Upgrade to Pro'}</Text>
        </TouchableOpacity>
      </View>

      {/* Hackathon Info Card */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>HACKATHON INFORMATION</Text>

        <View style={styles.settingRow}>
          <Text style={styles.rowLabel}>Event</Text>
          <Text style={styles.rowValue}>RevenueCat Shipaton 2026</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.rowLabel}>AI Engine</Text>
          <Text style={styles.rowValue}>Gemma 2B / Gemma 3 1B</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.rowLabel}>Monetization SDK</Text>
          <Text style={styles.rowValue}>RevenueCat Purchases v9</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.rowLabel}>Target Stores</Text>
          <Text style={styles.rowValue}>Google Play / Galaxy Store</Text>
        </View>
      </View>

      {/* Support & Privacy */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('mailto:support@hero-apps.com')}
        >
          <Ionicons name="mail-outline" size={18} color={Colors.primary} />
          <Text style={styles.linkLabel}>Support & Feedback</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Alert.alert('Privacy Policy', 'PoquitoTalk processes translations securely and respects your privacy.')}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
          <Text style={styles.linkLabel}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>PoquitoTalk v1.0.0 • Built for RevenueCat Shipaton</Text>
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
  actionBtn: {
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.outline,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
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
    marginVertical: 6,
  },
  versionText: {
    fontSize: 11,
    color: Colors.outline,
    textAlign: 'center',
    marginTop: 12,
  },
});
