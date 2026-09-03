import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { TranslationCard } from './TranslationCard';
import { TranslationItem } from '../types';

interface SavedTranslationsModalProps {
  visible: boolean;
  onClose: () => void;
  savedTranslations: TranslationItem[];
  onToggleSave: (item: TranslationItem) => void;
}

export const SavedTranslationsModal: React.FC<SavedTranslationsModalProps> = ({
  visible,
  onClose,
  savedTranslations,
  onToggleSave,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar with Dismiss and Close */}
          <View style={styles.topBar}>
            <View style={styles.topBadge}>
              <Ionicons name="bookmark" size={13} color={Colors.secondary} />
              <Text style={styles.topBadgeText}>BOOKMARKED PHRASES</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={18} color="#6B5E51" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header Info */}
            <View style={styles.headerInfo}>
              <Text style={styles.headline}>Your Saved Island Phrases</Text>
              <Text style={styles.subheadline}>
                {savedTranslations.length === 0
                  ? 'Keep your most important custom translations ready for 1-tap reuse.'
                  : `${savedTranslations.length} ${savedTranslations.length === 1 ? 'phrase' : 'phrases'} saved for quick WhatsApp dispatch & replay.`}
              </Text>
            </View>

            {savedTranslations.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="bookmark-outline" size={32} color={Colors.secondary} />
                </View>
                <Text style={styles.emptyTitle}>No Bookmarked Phrases Yet</Text>
                <Text style={styles.emptyDesc}>
                  Whenever you speak or type a translation in <Text style={{ color: Colors.onBackground, fontWeight: '700' }}>Poquito</Text><Text style={{ color: Colors.secondary, fontWeight: '700' }}>Talk</Text>, tap the <Text style={{ fontWeight: '700', color: Colors.onBackground }}>Save / Bookmark</Text> button on the translation card to store it here permanently.
                </Text>

                {/* Helpful Instruction Tip Box */}
                <View style={styles.guideTipBox}>
                  <Ionicons name="bulb-outline" size={18} color={Colors.secondary} style={{ marginTop: 1 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guideTipTitle}>How Bookmarking Works</Text>
                    <Text style={styles.guideTipText}>
                      1. Speak or type any English message on the Translate screen.{"\n"}
                      2. Tap the bookmark icon on the Spanish card.{"\n"}
                      3. Tap the bookmark icon in the top header anytime to access your saved phrases for 1-tap audio replay or WhatsApp dispatch.
                    </Text>
                  </View>
                </View>
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: '#E8E1D7',
    maxHeight: '90%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFDBCD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FD9A6F',
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E1D7',
  },
  scrollBody: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerInfo: {
    marginBottom: 16,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B1C1A',
    letterSpacing: -0.4,
  },
  subheadline: {
    fontSize: 13,
    color: '#6B5E51',
    lineHeight: 18,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    marginVertical: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFDBCD',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B1C1A',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#6B5E51',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  guideTipBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF0EA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFDBCD',
    width: '100%',
  },
  guideTipTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 4,
  },
  guideTipText: {
    fontSize: 11.5,
    color: '#6B5E51',
    lineHeight: 17,
  },
  list: {
    gap: 12,
    paddingBottom: 16,
  },
});
