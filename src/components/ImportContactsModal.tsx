import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts/legacy';
import { Colors } from '../theme/colors';
import { PhoneBookContact } from '../types';
import {
  getPhoneBookContacts,
  savePhoneBookContact,
  normalizePanamaPhoneNumber,
} from '../services/storage';

interface ImportContactsModalProps {
  visible: boolean;
  onClose: () => void;
  onContactsImported: (importedCount: number) => void;
}

interface RawDeviceContact {
  id: string;
  name: string;
  phone: string;
  category: string;
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  visible,
  onClose,
  onContactsImported,
}) => {
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<RawDeviceContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (visible) {
      loadDeviceContacts();
    }
  }, [visible]);

  const loadDeviceContacts = async () => {
    setLoading(true);
    setPermissionDenied(false);
    setSelectedIds(new Set());

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        sort: Contacts.SortTypes.FirstName,
      });

      if (data && data.length > 0) {
        // Fetch existing phone book contacts to detect already imported ones
        const existing = await getPhoneBookContacts();
        const existingPhones = new Set(
          existing.map((c) => normalizePanamaPhoneNumber(c.whatsappNumber || c.phoneNumber || ''))
        );

        const list: RawDeviceContact[] = [];
        const seenNumbers = new Set<string>();

        data.forEach((c) => {
          const rawName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown Contact';
          if (c.phoneNumbers && c.phoneNumbers.length > 0) {
            const rawPhone = c.phoneNumbers[0].number || '';
            const normalized = normalizePanamaPhoneNumber(rawPhone);

            if (normalized && !seenNumbers.has(normalized)) {
              seenNumbers.add(normalized);

              // Infer category from name or notes if applicable
              const lowerName = rawName.toLowerCase();
              let inferredCategory = 'Personal / Friend';
              if (lowerName.includes('captain') || lowerName.includes('capitan') || lowerName.includes('lancha') || lowerName.includes('boat')) {
                inferredCategory = 'Water Taxi';
              } else if (lowerName.includes('ac') || lowerName.includes('aire') || lowerName.includes('electric')) {
                inferredCategory = 'A/C & Electric';
              } else if (lowerName.includes('plumb') || lowerName.includes('plomer') || lowerName.includes('agua')) {
                inferredCategory = 'Plumbing';
              } else if (lowerName.includes('landlord') || lowerName.includes('rent') || lowerName.includes('dueno') || lowerName.includes('dueña')) {
                inferredCategory = 'Landlord / Rental';
              } else if (lowerName.includes('clean') || lowerName.includes('maid') || lowerName.includes('aseo')) {
                inferredCategory = 'Cleaner / Maid';
              }

              list.push({
                id: c.id || `contact_${Math.random()}`,
                name: rawName,
                phone: rawPhone,
                category: inferredCategory,
              });
            }
          }
        });

        setDeviceContacts(list);
      } else {
        setDeviceContacts([]);
      }
    } catch (e) {
      console.warn('Failed to load device contacts:', e);
      Alert.alert('Contacts Error', 'Could not access phone contacts. Please check device settings.');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return deviceContacts;
    const q = searchQuery.toLowerCase().trim();
    return deviceContacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [deviceContacts, searchQuery]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const handleImportSelected = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('No Contacts Selected', 'Please tap on the contacts you would like to import.');
      return;
    }

    setIsImporting(true);
    let importedCount = 0;

    try {
      for (const contact of deviceContacts) {
        if (selectedIds.has(contact.id)) {
          const newPhoneBookContact: PhoneBookContact = {
            id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: contact.name,
            whatsappNumber: contact.phone,
            phoneNumber: contact.phone,
            normalizedPhone: normalizePanamaPhoneNumber(contact.phone),
            category: contact.category,
            isFavorite: false,
            isVerifiedDirectory: false,
            createdAt: Date.now(),
          };
          await savePhoneBookContact(newPhoneBookContact);
          importedCount++;
        }
      }

      onContactsImported(importedCount);
      onClose();
      Alert.alert(
        'Contacts Imported! 🇵🇦',
        `Successfully added ${importedCount} contact${importedCount === 1 ? '' : 's'} to your Phone Book.`
      );
    } catch (e) {
      console.error('Import error:', e);
      Alert.alert('Import Failed', 'An error occurred while importing contacts.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIcon}>
                <Ionicons name="download" size={20} color={Colors.tertiary} />
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>Import from Phone</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  Select contacts to add to your Phone Book
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Search Bar & Select All Control */}
          <View style={styles.controlsBar}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={16} color="#0F172A" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search phone contacts..."
                placeholderTextColor={Colors.outline}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#0F172A" />
                </TouchableOpacity>
              ) : null}
            </View>

            {filteredContacts.length > 0 && (
              <TouchableOpacity
                style={styles.selectAllBtn}
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <Text style={styles.selectAllText}>
                  {selectedIds.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Contacts List */}
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={Colors.tertiary} />
              <Text style={styles.centerText}>Reading device contacts...</Text>
            </View>
          ) : permissionDenied ? (
            <View style={styles.centerBox}>
              <Ionicons name="lock-closed-outline" size={42} color={Colors.outline} />
              <Text style={styles.emptyTitle}>Contacts Access Required</Text>
              <Text style={styles.emptySubtitle}>
                Please allow <Text style={{ color: Colors.onBackground, fontWeight: '700' }}>Poquito</Text><Text style={{ color: Colors.secondary, fontWeight: '700' }}>Talk</Text> to access your contacts in system settings to import them.
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={loadDeviceContacts}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Retry Permission</Text>
              </TouchableOpacity>
            </View>
          ) : filteredContacts.length === 0 ? (
            <View style={styles.centerBox}>
              <Ionicons name="people-outline" size={42} color={Colors.outline} />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching contacts' : 'No phone contacts found'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No contacts match "${searchQuery}".`
                  : 'Your phone does not have any saved contacts with phone numbers.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <TouchableOpacity
                    style={[styles.contactRow, isSelected && styles.contactRowSelected]}
                    onPress={() => toggleSelect(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>

                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.contactPhone}>{item.phone}</Text>
                    </View>

                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.importBtn,
                (selectedIds.size === 0 || isImporting) && styles.importBtnDisabled,
              ]}
              onPress={handleImportSelected}
              disabled={selectedIds.size === 0 || isImporting}
              activeOpacity={0.85}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="download" size={16} color="#FFFFFF" />
                  <Text style={styles.importBtnText}>
                    Import {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
    height: '88%',
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
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  controlsBar: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  selectAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
  },
  contactRowSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  contactPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  centerText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0F172A',
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  importBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  importBtnDisabled: {
    opacity: 0.45,
  },
  importBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
