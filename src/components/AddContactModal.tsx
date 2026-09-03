import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { PhoneBookContact } from '../types';
import { savePhoneBookContact, normalizePanamaPhoneNumber } from '../services/storage';
import { ImportContactsModal } from './ImportContactsModal';

interface CategoryOption {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'Water Taxi', label: 'Water Taxi / Captain', iconName: 'boat' },
  { id: 'A/C & Electric', label: 'A/C & Electric', iconName: 'snow' },
  { id: 'Plumbing', label: 'Plumbing & Water', iconName: 'water' },
  { id: 'Landlord / Rental', label: 'Landlord / Rental', iconName: 'home' },
  { id: 'Cleaner / Maid', label: 'Cleaner / Maid', iconName: 'sparkles' },
  { id: 'Handyman / Tech', label: 'Handyman / Tech', iconName: 'construct' },
  { id: 'Medical & Vet', label: 'Medical & Vet', iconName: 'medkit' },
  { id: 'Personal / Friend', label: 'Personal / Friend', iconName: 'person' },
  { id: 'General Service', label: 'General Service', iconName: 'grid' },
];

interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
  onContactSaved: (contact: PhoneBookContact) => void;
  initialCategory?: string;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  visible,
  onClose,
  onContactSaved,
  initialCategory,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState(initialCategory || 'Water Taxi');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this contact (e.g. Captain Raul, Rosa Landlord).');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Phone Number Required', 'Please enter a WhatsApp number.');
      return;
    }

    const normalized = normalizePanamaPhoneNumber(phone);
    const newContact: PhoneBookContact = {
      id: `custom_contact_${Date.now()}`,
      name: name.trim(),
      whatsappNumber: phone.trim(),
      phoneNumber: phone.trim(),
      normalizedPhone: normalized,
      category: category,
      isFavorite: isFavorite,
      notes: notes.trim() || undefined,
      isVerifiedDirectory: false,
      createdAt: Date.now(),
    };

    await savePhoneBookContact(newContact);
    onContactSaved(newContact);

    // Reset fields
    setName('');
    setPhone('');
    setNotes('');
    setIsFavorite(false);
    onClose();

    Alert.alert('Saved to Phone Book!', `${newContact.name} is now saved in your phone book.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIcon}>
                <Ionicons name="person-add" size={20} color={Colors.tertiary} />
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>Add to Phone Book</Text>
                <Text style={styles.subtitle} numberOfLines={1}>Save contacts for 1-tap dispatch</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Import from Device Contacts */}
            <TouchableOpacity
              style={styles.importBanner}
              onPress={() => setShowImportModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.importBannerIcon}>
                <Ionicons name="people" size={20} color={Colors.tertiary} />
              </View>
              <View style={styles.importBannerTextWrap}>
                <Text style={styles.importBannerTitle}>Import from Phone Contacts</Text>
                <Text style={styles.importBannerSubtitle}>Select contacts from your device address book</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.tertiary} />
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Contact Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CONTACT NAME *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Captain Raul, Rosa Landlord"
                placeholderTextColor={Colors.outline}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* WhatsApp Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WHATSAPP NUMBER *</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.flagPrefix}>
                  <Text style={styles.flagText}>🇵🇦 +507</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="6123-4567 or local number"
                  placeholderTextColor={Colors.outline}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SERVICE CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                      onPress={() => setCategory(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={cat.iconName}
                        size={14}
                        color={isSelected ? '#FFFFFF' : '#0F172A'}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NOTES / LOCATION (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Operates Carenero dock, speaks English, fast response"
                placeholderTextColor={Colors.outline}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Favorite Toggle */}
            <View style={[styles.favoriteRow, isFavorite && styles.favoriteRowActive]}>
              <View style={styles.favoriteInfo}>
                <Ionicons
                  name={isFavorite ? "star" : "star-outline"}
                  size={20}
                  color="#0F172A"
                />
                <View style={styles.favoriteTextWrap}>
                  <Text style={styles.favoriteTitle}>Pin to Top Favorites</Text>
                  <Text style={styles.favoriteDesc} numberOfLines={1}>
                    Show in quick avatar rail when dispatching
                  </Text>
                </View>
              </View>
              <Switch
                value={isFavorite}
                onValueChange={setIsFavorite}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor={isFavorite ? '#FFFFFF' : '#94A3B8'}
              />
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Embedded Import Contacts Modal */}
      <ImportContactsModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onContactsImported={async (importedCount) => {
          setShowImportModal(false);
          if (importedCount > 0) {
            onClose();
          }
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
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
    flex: 1,
    marginRight: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  closeButton: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  importBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  importBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBannerTextWrap: {
    flex: 1,
  },
  importBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: -0.2,
  },
  importBannerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#15803D',
    marginTop: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.onBackground,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flagPrefix: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  phoneInput: {
    flex: 1,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipSelected: {
    backgroundColor: Colors.tertiary,
    borderColor: Colors.tertiary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 6,
    marginBottom: 20,
  },
  favoriteRowActive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  favoriteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  favoriteTextWrap: {
    flex: 1,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  favoriteDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.tertiary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
