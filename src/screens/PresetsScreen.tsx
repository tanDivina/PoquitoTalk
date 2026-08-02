import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { PresetCard } from '../components/PresetCard';
import { DirectoryCard } from '../components/DirectoryCard';
import { SERVICE_PRESETS } from '../services/presets';
import { ServicePreset } from '../types';
import { fetchRegionalProviders, LocalServiceProvider } from '../services/directory';

interface PresetsScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onSelectPhrasePrompt: (phraseText: string) => void;
}

export const PresetsScreen: React.FC<PresetsScreenProps> = ({
  isPro,
  onOpenPaywall,
  onSelectPhrasePrompt,
}) => {
  const [providers, setProviders] = useState<LocalServiceProvider[]>([]);

  useEffect(() => {
    // Fetch verified local directory for Bocas del Toro (MongoDB Atlas / Fallback)
    fetchRegionalProviders('bocas_del_toro').then((list) => setProviders(list));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} />

      <View style={styles.titleSection}>
        <Text style={styles.title}>Service Presets & Local Contacts</Text>
        <Text style={styles.subtitle}>
          Choose a scenario or message a verified local provider directly in Bocas del Toro 🇵🇦.
        </Text>
      </View>

      {/* Verified Local Contacts Section */}
      {providers.length > 0 && (
        <View style={styles.directorySection}>
          <Text style={styles.sectionHeader}>VERIFIED BOCAS DEL TORO DIRECTORY</Text>
          {providers.map((p) => (
            <DirectoryCard key={p.id} provider={p} />
          ))}
        </View>
      )}

      {/* Service Presets Section */}
      <View style={styles.list}>
        <Text style={styles.sectionHeader}>PRESET CONVERSATION TEMPLATES</Text>
        {SERVICE_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onSelect={(p: ServicePreset) => onSelectPhrasePrompt(p.defaultInputPrompt)}
            onSelectPhrase={(text: string) => onSelectPhrasePrompt(text)}
          />
        ))}
      </View>
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
    lineHeight: 18,
  },
  directorySection: {
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
