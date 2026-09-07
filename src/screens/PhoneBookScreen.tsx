import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { AddContactModal } from '../components/AddContactModal';
import { ImportContactsModal } from '../components/ImportContactsModal';
import { PhoneBookContact } from '../types';
import {
  getPhoneBookContacts,
  savePhoneBookContact,
  toggleFavoriteContact,
  deletePhoneBookContact,
  recordRecentContact,
  subscribePhoneBookChanged,
  mapDirectoryCategoryToPhoneBook,
} from '../services/storage';

interface PhoneBookScreenProps {
  isPro?: boolean;
  onOpenPaywall?: () => void;
  onOpenSaved?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
}

const PHONEBOOK_CATEGORIES = [
  { id: 'ALL', label: 'All Contacts', icon: 'people' },
  { id: 'FAVORITES', label: 'Favorites', icon: 'star' },
  { id: 'boat_repair', label: 'Boat Captains', icon: 'boat' },
  { id: 'home_trades', label: 'Trades & Handymen', icon: 'construct' },
  { id: 'cleaning', label: 'Cleaning & Maids', icon: 'sparkles' },
  { id: 'housing', label: 'Housing & Landlords', icon: 'home' },
  { id: 'tours', label: 'Tours & Rentals', icon: 'compass' },
  { id: 'other', label: 'Personal & Friends', icon: 'person' },
];

const getCategoryDisplayLabel = (category?: string): string => {
  if (!category) return '';
  const match = PHONEBOOK_CATEGORIES.find((c) => c.id === category);
  if (match) return match.label;
  const mapped = mapDirectoryCategoryToPhoneBook(category);
  const mappedMatch = PHONEBOOK_CATEGORIES.find((c) => c.id === mapped);
  if (mappedMatch) return mappedMatch.label;
  return category.replace(/_/g, ' ');
};

export const PhoneBookScreen: React.FC<PhoneBookScreenProps> = ({
  isPro,
  onOpenPaywall,
  onOpenSaved,
  onOpenSettings,
  savedCount = 0,
}) => {
  const [contacts, setContacts] = useState<PhoneBookContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const loadContacts = useCallback(async (isPullToRefresh = false) => {
    if (!isPullToRefresh) setLoading(true);
    try {
      const list = await getPhoneBookContacts();
      setContacts(list || []);
    } catch (e) {
      console.error('Error loading contacts:', e);
      setContacts([]);
    } finally {
      if (!isPullToRefresh) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts])
  );

  useEffect(() => {
    loadContacts();
    const unsubscribe = subscribePhoneBookChanged((updatedList) => {
      setContacts(updatedList);
    });
    return unsubscribe;
  }, [loadContacts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadContacts(true);
    setRefreshing(false);
  }, [loadContacts]);

  const handleToggleFavorite = async (contactId: string) => {
    const updated = await toggleFavoriteContact(contactId);
    setContacts(updated);
  };

  const handleDeleteContact = async (contact: PhoneBookContact) => {
    Alert.alert(
      'Remove Contact',
      `Remove ${contact.name} from your Phone Book?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = await deletePhoneBookContact(contact.id);
            setContacts(updated);
          },
        },
      ]
    );
  };

  const handleWhatsApp = async (contact: PhoneBookContact) => {
    await recordRecentContact(contact.id);
    const cleanNumber = contact.normalizedPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(`whatsapp://send?phone=${cleanNumber}`);
    }
  };

  const handleCall = async (contact: PhoneBookContact) => {
    await recordRecentContact(contact.id);
    const cleanPhone = contact.phoneNumber.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Phone Call', `Call ${contact.phoneNumber}`);
    });
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: contacts.length,
      FAVORITES: contacts.filter((c) => c.isFavorite).length,
    };

    PHONEBOOK_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'ALL' && cat.id !== 'FAVORITES') {
        const target = cat.id.toLowerCase();
        counts[cat.id] = contacts.filter((c) => {
          const raw = (c.category || '').toLowerCase();
          const mapped = mapDirectoryCategoryToPhoneBook(raw).toLowerCase();
          return raw === target || mapped === target;
        }).length;
      }
    });

    return counts;
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    let result = contacts;

    if (selectedCategory === 'FAVORITES') {
      result = result.filter((c) => c.isFavorite);
    } else if (selectedCategory !== 'ALL') {
      const target = selectedCategory.toLowerCase();
      result = result.filter((c) => {
        const raw = (c.category || '').toLowerCase();
        const mapped = mapDirectoryCategoryToPhoneBook(raw).toLowerCase();
        return raw === target || mapped === target;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phoneNumber.includes(q) ||
          (c.notes && c.notes.toLowerCase().includes(q)) ||
          (c.category && c.category.toLowerCase().includes(q)) ||
          mapDirectoryCategoryToPhoneBook(c.category).toLowerCase().includes(q)
      );
    }

    return result;
  }, [contacts, selectedCategory, searchQuery]);

  return (
    <View style={styles.screenContainer}>
      <Header
        isPro={isPro}
        onOpenPaywall={onOpenPaywall}
        onOpenSaved={onOpenSaved}
        savedCount={savedCount}
        onOpenSettings={onOpenSettings}
      />

      {/* Pinned Header Section */}
      <View style={styles.pinnedHeader}>
        <View style={styles.headerTopRow}>
          <View style={styles.badgeContainer}>
            <Ionicons name="book" size={13} color="#0F172A" />
            <Text style={styles.badgeText}>MY PHONE BOOK ({contacts.length})</Text>
          </View>
          <TouchableOpacity
            style={styles.importBtn}
            onPress={() => setShowImportModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="download" size={13} color="#0F172A" />
            <Text style={styles.importBtnText}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addContactBtn}
            onPress={() => setShowAddContactModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add" size={13} color="#FFF" />
            <Text style={styles.addContactBtnText}>Add Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Live Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#0F172A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, phone number, notes..."
            placeholderTextColor={Colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#0F172A" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          {PHONEBOOK_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={13}
                  color="#0F172A"
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {cat.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Contact List */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 160 }]}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.secondary}
            colors={[Colors.secondary]}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 30 }} />
        ) : filteredContacts.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="book-outline" size={32} color="#0F172A" />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? 'No Matching Contacts'
                : selectedCategory !== 'ALL'
                ? 'No Contacts in This Category'
                : 'Your Phone Book is Empty'}
            </Text>
            <Text style={styles.emptySub}>
              {searchQuery.trim()
                ? `No contacts found matching "${searchQuery}".`
                : selectedCategory !== 'ALL'
                ? `You have ${contacts.length} contact${contacts.length === 1 ? '' : 's'} saved across other categories.`
                : 'Save providers from the Bocas Directory with the "+ Phone Book" button, or tap "Add Contact" above to save your landlord, water taxi captain, maid, or friends.'}
            </Text>
            {selectedCategory !== 'ALL' && contacts.length > 0 && (
              <TouchableOpacity
                style={styles.showAllCategoryBtn}
                onPress={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="people" size={15} color="#FFF" />
                <Text style={styles.showAllCategoryBtnText}>
                  Show All Contacts ({contacts.length})
                </Text>
              </TouchableOpacity>
            )}
            {contacts.length === 0 && !searchQuery.trim() && (
              <View style={styles.emptyActionRow}>
                <TouchableOpacity
                  style={styles.importFirstBtn}
                  onPress={() => setShowImportModal(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="download" size={15} color="#0F172A" />
                  <Text style={styles.importFirstBtnText}>Import from Phone</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addFirstContactBtn}
                  onPress={() => setShowAddContactModal(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="person-add" size={15} color="#FFF" />
                  <Text style={styles.addFirstContactBtnText}>Add Contact</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.contactList}>
            {filteredContacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.cardHeader}>
                  {/* Initial Avatar */}
                  <View style={styles.avatarBubble}>
                    <Text style={styles.avatarText}>
                      {contact.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  {/* Name & Number */}
                  <View style={styles.contactInfo}>
                    {contact.isVerifiedDirectory && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={10} color="#059669" />
                        <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                      </View>
                    )}
                    <Text style={styles.contactName} numberOfLines={1}>
                      {contact.name}
                    </Text>
                    <View style={styles.phoneCategoryRow}>
                      <Text style={styles.contactPhone}>🇵🇦 {contact.phoneNumber}</Text>
                      {contact.category ? (
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryPillText}>
                            {getCategoryDisplayLabel(contact.category)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Star Favorite Button */}
                  <TouchableOpacity
                    style={styles.favBtn}
                    onPress={() => handleToggleFavorite(contact.id)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={contact.isFavorite ? 'star' : 'star-outline'}
                      size={20}
                      color={contact.isFavorite ? '#D97706' : '#94A3B8'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Notes box */}
                {contact.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText} numberOfLines={2}>
                      {contact.notes}
                    </Text>
                  </View>
                ) : null}

                {/* Card Actions Row */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.whatsAppBtn}
                    onPress={() => handleWhatsApp(contact)}
                    activeOpacity={0.8}
                  >
                    <WhatsAppIcon size={14} color="#FFF" />
                    <Text style={styles.whatsAppBtnText}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCall(contact)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={14} color="#0F172A" />
                    <Text style={styles.callBtnText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteContact(contact)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={14} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Contact Modal */}
      <AddContactModal
        visible={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        onContactSaved={() => loadContacts()}
      />

      {/* Import from Device Contacts Modal */}
      <ImportContactsModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onContactsImported={() => loadContacts()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  pinnedHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 8,
  },
  importBtnText: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: '700',
  },
  addContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#0F172A',
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 8,
  },
  addContactBtnText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    marginHorizontal: 16,
    height: 40,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
  },
  filterRow: {
    paddingLeft: 16,
  },
  filterRowContent: {
    gap: 6,
    paddingRight: 24,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  filterChipActive: {
    backgroundColor: '#E2E8F0',
    borderColor: '#0F172A',
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  filterChipTextActive: {
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  emptyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  importFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
  },
  importFirstBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  addFirstContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#0F172A',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
  },
  addFirstContactBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  showAllCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    marginTop: 6,
  },
  showAllCategoryBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  contactList: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3,
  },
  contactName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  phoneCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  favBtn: {
    padding: 6,
    alignSelf: 'center',
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 8,
    marginTop: 10,
  },
  notesText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  whatsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 8,
  },
  whatsAppBtnText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  callBtnText: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '700',
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});
