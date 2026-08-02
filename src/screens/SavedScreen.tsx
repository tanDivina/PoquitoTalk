import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { TranslationCard } from '../components/TranslationCard';
import { TranslationItem } from '../types';

interface SavedScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  savedTranslations: TranslationItem[];
  onToggleSave: (item: TranslationItem) => void;
}

export const SavedScreen: React.FC<SavedScreenProps> = ({
  isPro,
  onOpenPaywall,
  savedTranslations,
  onToggleSave,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} />

      <View style={styles.titleSection}>
        <Text style={styles.title}>Saved Phrases & History</Text>
        <Text style={styles.subtitle}>
          Frequently used WhatsApp translations saved for quick 1-tap access.
        </Text>
      </View>

      {savedTranslations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={48} color={Colors.outline} />
          <Text style={styles.emptyTitle}>No saved phrases yet</Text>
          <Text style={styles.emptyDesc}>
            Star any translated message on the Home screen to save it here for quick reuse.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {savedTranslations.map((item) => (
            <TranslationCard
              key={item.id}
              inputText={item.inputText}
              outputText={item.outputText}
              fromLang={item.fromLang}
              toLang={item.toLang}
              category={item.category}
              isSaved={true}
              onSave={() => onToggleSave(item)}
            />
          ))}
        </View>
      )}
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
  emptyContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 20,
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  list: {
    marginTop: 8,
  },
});
