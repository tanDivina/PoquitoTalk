import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { PresetCard } from '../components/PresetCard';
import { DirectoryCard } from '../components/DirectoryCard';
import { SERVICE_PRESETS, getCategoryPastelTheme } from '../services/presets';
import { ServicePreset } from '../types';
import { fetchRegionalProviders, LocalServiceProvider } from '../services/directory';

interface PresetsScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onSelectPhrasePrompt: (phraseText: string, categoryTitle?: string) => void;
}

export const PresetsScreen: React.FC<PresetsScreenProps> = ({
  isPro,
  onOpenPaywall,
  onSelectPhrasePrompt,
}) => {
  const [providers, setProviders] = useState<LocalServiceProvider[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fetch verified local directory for Bocas del Toro
    fetchRegionalProviders('bocas_del_toro').then((list) => setProviders(list));
  }, []);

  return (
    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
      scrollEventThrottle={16}
    >
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

      {/* Stacked Service Presets Cards Section */}
      <View style={styles.list}>
        <Text style={styles.sectionHeader}>PRESET CONVERSATION TEMPLATES</Text>
        {SERVICE_PRESETS.map((preset, index) => {
          const pastelTheme = getCategoryPastelTheme(preset.id);

          // Card Stack Animation Interpolation:
          // Cards move up, scale slightly, and stack neatly on scroll
          const cardOffset = index * 180;
          const translateY = scrollY.interpolate({
            inputRange: [-1, 0, cardOffset, cardOffset + 240],
            outputRange: [0, 0, 0, -index * 6],
            extrapolate: 'clamp',
          });

          const scale = scrollY.interpolate({
            inputRange: [cardOffset - 100, cardOffset, cardOffset + 240],
            outputRange: [1, 1, Math.max(0.94, 1 - index * 0.015)],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={preset.id}
              style={[
                styles.stackedCardWrapper,
                {
                  transform: [{ translateY }, { scale }],
                  zIndex: SERVICE_PRESETS.length - index,
                },
              ]}
            >
              <PresetCard
                preset={preset}
                customTheme={pastelTheme}
                onSelect={(p: ServicePreset) => onSelectPhrasePrompt(p.defaultInputPrompt, p.title)}
                onSelectPhrase={(text: string) => onSelectPhrasePrompt(text, preset.title)}
              />
            </Animated.View>
          );
        })}
      </View>
    </Animated.ScrollView>
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
  stackedCardWrapper: {
    marginBottom: 6,
  },
});
