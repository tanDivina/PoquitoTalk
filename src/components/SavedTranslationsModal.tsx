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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBubble}>
                <Ionicons name="bookmark" size={20} color={Colors.tertiary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Saved Translations</Text>
                <Text style={styles.modalSubtitle}>
                  {savedTranslations.length} {savedTranslations.length === 1 ? 'phrase' : 'phrases'} saved for quick access
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {savedTranslations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="bookmark-outline" size={48} color={Colors.outline} />
                <Text style={styles.emptyTitle}>No saved phrases yet</Text>
                <Text style={styles.emptyDesc}>
                  Tap the Save button on any translated message to bookmark it here for quick 1-tap reuse.
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 32,
    marginVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    paddingBottom: 24,
  },
});
