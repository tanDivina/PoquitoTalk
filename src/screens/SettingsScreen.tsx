import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { FeedbackModal } from '../components/FeedbackModal';
import { setElevenLabsApiKey, getElevenLabsApiKey } from '../services/elevenLabsVoice';

interface SettingsScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onResetOnboarding?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ isPro, onOpenPaywall, onResetOnboarding }) => {
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [elevenKey, setElevenKeyState] = useState(getElevenLabsApiKey());
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveElevenKey = () => {
    setElevenLabsApiKey(elevenKey);
    setIsSaved(true);
    Alert.alert("ElevenLabs API Key Saved! 🎙️", "Hyper-realistic studio voices are now active for all personas!");
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} onResetOnboarding={onResetOnboarding} />

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

      {/* ElevenLabs API Key Settings Card */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="mic-outline" size={20} color={Colors.whatsapp} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>ElevenLabs Hyper-Realistic Studio Voices 🎙️</Text>
            <Text style={styles.cardSubtitle}>
              Enter your ElevenLabs API Key for human-grade Panamanian Spanish speech
            </Text>
          </View>
        </View>

        <TextInput
          style={styles.keyInput}
          placeholder="sk_..."
          placeholderTextColor={Colors.outline}
          value={elevenKey}
          onChangeText={setElevenKeyState}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.saveKeyBtn}
          onPress={handleSaveElevenKey}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
          <Text style={styles.saveKeyBtnText}>{isSaved ? 'Key Saved & Active ✓' : 'Save ElevenLabs API Key'}</Text>
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
          <Text style={styles.linkLabel}>Send Feedback & Feature Requests 💬</Text>
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
          <Text style={styles.rowLabel}>TTS Voice Engine</Text>
          <Text style={styles.rowValue}>ElevenLabs Multilingual v2 / Google</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.rowLabel}>Monetization SDK</Text>
          <Text style={styles.rowValue}>RevenueCat Purchases v9</Text>
        </View>
      </View>

      {/* Support & Privacy */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('mailto:support@hero-apps.com')}
        >
          <Ionicons name="mail-outline" size={18} color={Colors.primary} />
          <Text style={styles.linkLabel}>Support Desk (support@hero-apps.com)</Text>
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

      <Text style={styles.versionText}>PoquitoTalk v1.0.2 • Built for RevenueCat Shipaton</Text>

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
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
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
    color: Colors.onBackground,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
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
