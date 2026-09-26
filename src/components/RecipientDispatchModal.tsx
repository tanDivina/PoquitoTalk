import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Colors } from '../theme/colors';
import { PhoneBookContact, LocalServiceProvider } from '../types';
import {
  getPhoneBookContacts,
  savePhoneBookContact,
  toggleFavoriteContact,
  recordRecentContact,
  syncDirectoryFavorite,
  subscribePhoneBookChanged,
  getPreferredVoiceGender,
} from '../services/storage';
import { INITIAL_BOCAS_DIRECTORY } from '../services/directory';
import { shareVoiceNoteToWhatsApp, sendTextToWhatsApp } from '../services/sharing';
import { getOrCreateThreadForContact, addMessageToThread } from '../services/conversations';
import { getUserProfile } from '../services/userService';
import {
  generateGoogleGeminiAudio,
  playGoogleAudioFile,
  stopAllAudioPlayback,
  GOOGLE_SPANISH_VOICES,
} from '../services/googleVoice';
import { AddContactModal } from './AddContactModal';
import { ImportContactsModal } from './ImportContactsModal';

interface RecipientDispatchModalProps {
  visible: boolean;
  onClose: () => void;
  audioUri?: string | null;
  spanishText: string;
  englishText?: string;
  dispatchType: 'voice_note' | 'text';
  presetCategory?: string;
  onDispatched?: (contactName?: string, dispatchType?: 'voice_note' | 'text') => void;
}

export const RecipientDispatchModal: React.FC<RecipientDispatchModalProps> = ({
  visible,
  onClose,
  audioUri,
  spanishText,
  englishText,
  dispatchType,
  presetCategory,
  onDispatched,
}) => {
  const [activeTab, setActiveTab] = useState<'phonebook' | 'directory'>('phonebook');
  const [phoneBook, setPhoneBook] = useState<PhoneBookContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingRecipientId, setSendingRecipientId] = useState<string | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Stop playback when modal closes
  useEffect(() => {
    if (!visible) {
      stopAllAudioPlayback();
      setIsPlayingPreview(false);
    }
  }, [visible]);

  const handleTogglePreviewAudio = async () => {
    try {
      if (isPlayingPreview) {
        setIsPlayingPreview(false);
        await stopAllAudioPlayback();
        return;
      }

      setIsPlayingPreview(true);
      let uriToPlay = audioUri;
      if (!uriToPlay && spanishText) {
        const preferredGender = await getPreferredVoiceGender();
        uriToPlay = await generateGoogleGeminiAudio(spanishText, preferredGender === 'FEMALE' ? 'Female' : 'Male');
      }

      if (uriToPlay) {
        const sound = await playGoogleAudioFile(uriToPlay, GOOGLE_SPANISH_VOICES[0]);
        if (sound) {
          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlayingPreview(false);
              sound.unloadAsync();
            }
          });
        } else {
          setIsPlayingPreview(false);
        }
      } else {
        const SpeechModule = require('expo-speech');
        SpeechModule.speak(spanishText, {
          language: 'es-US',
          onDone: () => setIsPlayingPreview(false),
          onError: () => setIsPlayingPreview(false),
        });
      }
    } catch (e) {
      setIsPlayingPreview(false);
    }
  };

  const isSending = sendingRecipientId !== null;

  // Load phonebook on open
  useEffect(() => {
    if (visible) {
      loadContacts();
    }
  }, [visible]);

  useEffect(() => {
    const unsubscribe = subscribePhoneBookChanged((updatedList) => {
      setPhoneBook(updatedList);
    });
    return unsubscribe;
  }, []);

  const loadContacts = async () => {
    const contacts = await getPhoneBookContacts();
    setPhoneBook(contacts);
  };

  // Quick favorite / recent avatar rail (sorted by favorites and last contacted)
  const quickFavorites = useMemo(() => {
    return [...phoneBook]
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return (b.lastContactedAt || 0) - (a.lastContactedAt || 0);
      })
      .slice(0, 8);
  }, [phoneBook]);

  // Filtered Phone Book
  const filteredPhoneBook = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return phoneBook;
    return phoneBook.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        c.whatsappNumber.includes(q)
    );
  }, [phoneBook, searchQuery]);

  // Filtered Bocas Directory
  const filteredDirectory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      // If presetCategory provided, show matching category first
      if (presetCategory) {
        return [...INITIAL_BOCAS_DIRECTORY].sort((a, b) => {
          const aMatch = a.category.toLowerCase().includes(presetCategory.toLowerCase()) ? 1 : 0;
          const bMatch = b.category.toLowerCase().includes(presetCategory.toLowerCase()) ? 1 : 0;
          return bMatch - aMatch;
        });
      }
      return INITIAL_BOCAS_DIRECTORY;
    }
    return INITIAL_BOCAS_DIRECTORY.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q))
    );
  }, [searchQuery, presetCategory]);

  const handleSendToContact = async (contact: PhoneBookContact) => {
    setSendingRecipientId(contact.id);
    try {
      await recordRecentContact(contact.id);
      loadContacts();

      // 1. Find or create persistent chat thread
      const thread = await getOrCreateThreadForContact({
        id: contact.id,
        name: contact.name,
        category: contact.category,
        whatsappNumber: contact.whatsappNumber,
        avatarIcon: 'person-outline',
      });

      // 2. Record outgoing message into thread
      await addMessageToThread(thread.id, {
        sender: 'EXPAT',
        textEnglish: englishText || spanishText,
        textSpanish: spanishText,
        audioUri: audioUri || undefined,
        timestamp: Date.now(),
      });

      // 3. Dispatch to WhatsApp with room & thread metadata
      const profile = await getUserProfile();
      const clientName = (profile.displayName && profile.displayName.trim() && profile.displayName.trim().toLowerCase() !== 'client') ? profile.displayName.trim() : '';

      if (dispatchType === 'voice_note' && audioUri) {
        await shareVoiceNoteToWhatsApp(
          audioUri,
          contact.name,
          spanishText,
          contact.whatsappNumber,
          {
            roomId: thread.roomId,
            contractorName: contact.name,
            clientName: clientName,
            phone: contact.whatsappNumber,
            englishText: englishText,
          }
        );
      } else {
        await sendTextToWhatsApp(spanishText, contact.whatsappNumber);
      }

      if (onDispatched) onDispatched(contact.name, dispatchType);
      onClose();
    } catch (e) {
      console.warn('Dispatch failed:', e);
      Alert.alert('Error', 'Failed to dispatch message to WhatsApp.');
    } finally {
      setSendingRecipientId(null);
    }
  };

  const handleSendToDirectoryProvider = async (provider: LocalServiceProvider) => {
    const phone = provider.whatsappNumber || provider.phoneNumber;
    if (!phone) {
      Alert.alert('No WhatsApp Number', `${provider.name} does not have a direct WhatsApp number listed.`);
      return;
    }

    setSendingRecipientId(provider.id);
    try {
      // 1. Find or create persistent chat thread for directory provider
      const thread = await getOrCreateThreadForContact({
        id: provider.id,
        name: provider.name,
        category: provider.category,
        whatsappNumber: phone,
        avatarIcon: 'boat-outline',
      });

      // 2. Record outgoing message into thread
      await addMessageToThread(thread.id, {
        sender: 'EXPAT',
        textEnglish: englishText || spanishText,
        textSpanish: spanishText,
        audioUri: audioUri || undefined,
        timestamp: Date.now(),
      });

      // 3. Dispatch to WhatsApp with room & thread metadata
      const profile = await getUserProfile();
      const clientName = (profile.displayName && profile.displayName.trim() && profile.displayName.trim().toLowerCase() !== 'client') ? profile.displayName.trim() : '';

      if (dispatchType === 'voice_note' && audioUri) {
        await shareVoiceNoteToWhatsApp(
          audioUri,
          provider.name,
          spanishText,
          phone,
          {
            roomId: thread.roomId,
            contractorName: provider.name,
            clientName: clientName,
            phone: phone,
            englishText: englishText,
          }
        );
      } else {
        await sendTextToWhatsApp(spanishText, phone);
      }

      if (onDispatched) onDispatched(provider.name, dispatchType);
      onClose();
    } catch (e) {
      console.warn('Dispatch failed:', e);
      Alert.alert('Error', 'Failed to dispatch message to WhatsApp.');
    } finally {
      setSendingRecipientId(null);
    }
  };

  const handleToggleFavorite = async (contactId: string) => {
    const updated = await toggleFavoriteContact(contactId);
    setPhoneBook(updated);
  };

  const handleToggleDirectoryFavorite = async (provider: LocalServiceProvider) => {
    const isAlreadySaved = phoneBook.some(
      (c) => c.directoryProviderId === provider.id || c.name === provider.name
    );
    const updated = await syncDirectoryFavorite(provider, !isAlreadySaved);
    setPhoneBook(updated);
  };

  const handleGeneralShare = async () => {
    setSendingRecipientId('general_share');
    try {
      const thread = await getOrCreateThreadForContact({
        name: 'Shared Contact',
        category: 'General',
        avatarIcon: 'chatbubbles-outline',
      });

      await addMessageToThread(thread.id, {
        sender: 'EXPAT',
        textEnglish: englishText || spanishText,
        textSpanish: spanishText,
        audioUri: audioUri || undefined,
        timestamp: Date.now(),
      });

      const profile = await getUserProfile();
      const clientName = (profile.displayName && profile.displayName.trim() && profile.displayName.trim().toLowerCase() !== 'client') ? profile.displayName.trim() : '';

      if (dispatchType === 'voice_note' && audioUri) {
        await shareVoiceNoteToWhatsApp(
          audioUri,
          'Contact',
          spanishText,
          undefined,
          {
            roomId: thread.roomId,
            contractorName: 'Provider',
            clientName: clientName,
            englishText: englishText,
          }
        );
      } else {
        await sendTextToWhatsApp(spanishText);
      }
      if (onDispatched) onDispatched('WhatsApp Contact', dispatchType);
      onClose();
    } finally {
      setSendingRecipientId(null);
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
                <Ionicons
                  name={dispatchType === 'voice_note' ? 'mic' : 'paper-plane'}
                  size={20}
                  color={Colors.tertiary}
                />
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>
                  {dispatchType === 'voice_note' ? 'Send Voice Note (MP3)' : 'Send Spanish Text'}
                </Text>
                <View style={styles.headerSubtitleRow}>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    "{spanishText}"
                  </Text>
                  {!(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('hideAudioPreview') === 'true') && (
                    <TouchableOpacity
                      style={[styles.listenPreviewBtn, isPlayingPreview && styles.listenPreviewBtnActive]}
                      onPress={handleTogglePreviewAudio}
                      activeOpacity={0.8}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={isPlayingPreview ? 'stop-circle' : 'volume-high'}
                        size={14}
                        color={isPlayingPreview ? '#FFFFFF' : Colors.tertiary}
                      />
                      <Text style={[styles.listenPreviewBtnText, isPlayingPreview && styles.listenPreviewBtnTextActive]}>
                        {isPlayingPreview ? 'Stop' : 'Listen'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Quick Favorites & Recent Avatar Rail */}
          {quickFavorites.length > 0 && (
            <View style={styles.quickFavoritesSection}>
              <Text style={styles.sectionLabel}>⭐ QUICK FAVORITES & RECENT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
                {quickFavorites.map((contact) => {
                  const isThisSending = sendingRecipientId === contact.id;
                  return (
                    <TouchableOpacity
                      key={contact.id}
                      style={styles.avatarChip}
                      onPress={() => handleSendToContact(contact)}
                      activeOpacity={0.7}
                      disabled={isSending}
                    >
                      <View style={styles.avatarCircle}>
                        {isThisSending ? (
                          <ActivityIndicator size="small" color={Colors.tertiary} />
                        ) : (
                          <Text style={styles.avatarInitial}>
                            {contact.name.charAt(0).toUpperCase()}
                          </Text>
                        )}
                        {contact.isFavorite && !isThisSending && (
                          <View style={styles.starBadge}>
                            <Ionicons name="star" size={8} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.avatarName} numberOfLines={1}>
                        {contact.name.split(' ')[0]}
                      </Text>
                      <Text style={styles.avatarCategory} numberOfLines={1}>
                        {contact.category.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Quick Add Button */}
                <TouchableOpacity
                  style={styles.avatarAddChip}
                  onPress={() => setShowAddContactModal(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarAddCircle}>
                    <Ionicons name="add" size={20} color={Colors.tertiary} />
                  </View>
                  <Text style={styles.avatarAddName}>Add</Text>
                </TouchableOpacity>

                {/* Quick Import Button */}
                <TouchableOpacity
                  style={styles.avatarAddChip}
                  onPress={() => setShowImportModal(true)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatarAddCircle, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}>
                    <Ionicons name="people" size={18} color="#166534" />
                  </View>
                  <Text style={[styles.avatarAddName, { color: '#166534' }]}>Import</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Colors.outline} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts, water taxis, plumbers..."
              placeholderTextColor={Colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                <Ionicons name="close-circle" size={16} color={Colors.outline} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Segmented Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'phonebook' && styles.tabBtnActive]}
              onPress={() => setActiveTab('phonebook')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="book"
                size={16}
                color={activeTab === 'phonebook' ? Colors.tertiary : Colors.onSurfaceVariant}
              />
              <Text
                style={[styles.tabBtnText, activeTab === 'phonebook' && styles.tabBtnTextActive]}
              >
                My Phone Book ({phoneBook.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'directory' && styles.tabBtnActive]}
              onPress={() => setActiveTab('directory')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="compass"
                size={16}
                color={activeTab === 'directory' ? Colors.tertiary : Colors.onSurfaceVariant}
              />
              <Text
                style={[styles.tabBtnText, activeTab === 'directory' && styles.tabBtnTextActive]}
              >
                Bocas Directory
              </Text>
            </TouchableOpacity>
          </View>

          {/* List Content */}
          <View style={styles.listContainer}>
            {activeTab === 'phonebook' ? (
              filteredPhoneBook.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={42} color={Colors.outline} />
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'No matching contacts found' : 'No saved contacts in your phone book'}
                  </Text>
                  <Text style={styles.emptyDesc}>
                    {searchQuery
                      ? 'Try searching with a different name or category.'
                      : 'Add your landlord, cleaning lady, or boat captain for 1-tap Spanish dispatch.'}
                  </Text>
                  <View style={styles.emptyButtonsRow}>
                    <TouchableOpacity
                      style={styles.emptyAddBtn}
                      onPress={() => setShowAddContactModal(true)}
                    >
                      <Ionicons name="person-add" size={16} color="#FFFFFF" />
                      <Text style={styles.emptyAddBtnText}>Add Contact</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.emptyImportBtn}
                      onPress={() => setShowImportModal(true)}
                    >
                      <Ionicons name="people" size={16} color="#166534" />
                      <Text style={styles.emptyImportBtnText}>Import from Phone</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <FlatList
                  data={filteredPhoneBook}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.flatListContent}
                  renderItem={({ item }) => (
                    <View style={styles.contactCard}>
                      <View style={styles.contactLeft}>
                        <View style={styles.contactAvatar}>
                          <Text style={styles.contactAvatarText}>
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.contactInfo}>
                          {item.isVerifiedDirectory && (
                            <View style={styles.verifiedBadgeTop}>
                              <Ionicons name="checkmark-circle" size={10} color={Colors.tertiary} />
                              <Text style={styles.verifiedBadgeTopText}>VERIFIED</Text>
                            </View>
                          )}
                          <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.contactMeta}>
                            {item.category} • 🇵🇦 {item.whatsappNumber}
                          </Text>
                          {item.notes ? (
                            <Text style={styles.contactNotes} numberOfLines={1}>
                              {item.notes}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.contactActions}>
                        <TouchableOpacity
                          style={styles.starBtn}
                          onPress={() => handleToggleFavorite(item.id)}
                          accessibilityLabel="Favorite Contact"
                          disabled={isSending}
                        >
                          <Ionicons
                            name={item.isFavorite ? 'star' : 'star-outline'}
                            size={18}
                            color={item.isFavorite ? '#EAB308' : Colors.outline}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.sendItemBtn}
                          onPress={() => handleSendToContact(item)}
                          activeOpacity={0.8}
                          disabled={isSending}
                        >
                          {sendingRecipientId === item.id ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <WhatsAppIcon size={15} color="#FFFFFF" />
                              <Text style={styles.sendItemBtnText}>Send</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              )
            ) : (
              <FlatList
                data={filteredDirectory}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                renderItem={({ item }) => {
                  const isSaved = phoneBook.some(
                    (c) => c.directoryProviderId === item.id || c.name === item.name
                  );
                  return (
                    <View style={styles.contactCard}>
                      <View style={styles.contactLeft}>
                        <View style={[styles.contactAvatar, styles.directoryAvatar]}>
                          <Ionicons name="business" size={16} color={Colors.tertiary} />
                        </View>
                        <View style={styles.contactInfo}>
                          <View style={styles.verifiedBadgeTop}>
                            <Ionicons name="checkmark-circle" size={10} color={Colors.tertiary} />
                            <Text style={styles.verifiedBadgeTopText}>VERIFIED</Text>
                          </View>
                          <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.contactMeta}>
                            {item.category} • {item.address || 'Bocas del Toro'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.contactActions}>
                        <TouchableOpacity
                          style={styles.starBtn}
                          onPress={() => handleToggleDirectoryFavorite(item)}
                          accessibilityLabel="Favorite Provider"
                          disabled={isSending}
                        >
                          <Ionicons
                            name={isSaved ? 'star' : 'star-outline'}
                            size={18}
                            color={isSaved ? '#EAB308' : Colors.outline}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.sendItemBtn}
                          onPress={() => handleSendToDirectoryProvider(item)}
                          activeOpacity={0.8}
                          disabled={isSending}
                        >
                          {sendingRecipientId === item.id ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <WhatsAppIcon size={15} color="#FFFFFF" />
                              <Text style={styles.sendItemBtnText}>Send</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addContactFooterBtn}
              onPress={() => setShowAddContactModal(true)}
              activeOpacity={0.7}
              disabled={isSending}
            >
              <Ionicons name="person-add" size={16} color={Colors.tertiary} />
              <Text style={styles.addContactFooterText}>Add Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.importContactFooterBtn}
              onPress={() => setShowImportModal(true)}
              activeOpacity={0.7}
              disabled={isSending}
            >
              <Ionicons name="people" size={16} color="#166534" />
              <Text style={styles.importContactFooterText}>Import Phone</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.generalShareBtn}
              onPress={handleGeneralShare}
              activeOpacity={0.8}
              disabled={isSending}
            >
              {sendingRecipientId === 'general_share' ? (
                <ActivityIndicator size="small" color={Colors.onSurface} />
              ) : (
                <>
                  <Ionicons name="share-outline" size={16} color={Colors.onSurface} />
                  <Text style={styles.generalShareText}>Share Sheet</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Embedded Add Contact Modal */}
      <AddContactModal
        visible={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        initialCategory={presetCategory || 'Water Taxi'}
        onContactSaved={(newContact) => {
          loadContacts();
        }}
      />

      {/* Embedded Import Contacts Modal */}
      <ImportContactsModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onContactsImported={async (importedCount) => {
          setShowImportModal(false);
          await loadContacts();
        }}
      />
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
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    flex: 1,
    marginRight: 6,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  listenPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.25)',
  },
  listenPreviewBtnActive: {
    backgroundColor: Colors.tertiary,
    borderColor: Colors.tertiary,
  },
  listenPreviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  listenPreviewBtnTextActive: {
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  quickFavoritesSection: {
    paddingTop: 12,
    paddingBottom: 6,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  avatarScroll: {
    flexDirection: 'row',
  },
  avatarChip: {
    alignItems: 'center',
    width: 62,
    marginRight: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.tertiary,
  },
  starBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EAB308',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 4,
    textAlign: 'center',
  },
  avatarCategory: {
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  avatarAddChip: {
    alignItems: 'center',
    width: 54,
  },
  avatarAddCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.outline,
  },
  avatarAddName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onBackground,
  },
  clearSearchBtn: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  tabBtnTextActive: {
    color: Colors.onBackground,
    fontWeight: '800',
  },
  listContainer: {
    maxHeight: 280,
    minHeight: 180,
    paddingHorizontal: 20,
  },
  flatListContent: {
    paddingBottom: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directoryAvatar: {
    backgroundColor: '#E0F2FE',
  },
  contactAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.tertiary,
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  verifiedBadgeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  verifiedBadgeTopText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.tertiary,
    letterSpacing: 0.3,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  contactMeta: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  contactNotes: {
    fontSize: 10,
    color: Colors.outline,
    marginTop: 2,
    fontStyle: 'italic',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  starBtn: {
    padding: 6,
    flexShrink: 0,
  },
  sendItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
    minWidth: 80,
    flexShrink: 0,
    overflow: 'visible',
  },
  sendItemBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    paddingRight: 4,
    includeFontPadding: false,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  emptyButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  emptyImportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addContactFooterBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.tertiaryContainer,
    gap: 5,
  },
  addContactFooterText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  importContactFooterBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 5,
  },
  importContactFooterText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#166534',
  },
  generalShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    gap: 5,
  },
  generalShareText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.onSurface,
  },
});
