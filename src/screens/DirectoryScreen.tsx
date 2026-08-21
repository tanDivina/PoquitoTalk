import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { DirectoryCard } from '../components/DirectoryCard';
import { AddProviderModal } from '../components/AddProviderModal';
import { fetchRegionalProviders, LocalServiceProvider, INITIAL_BOCAS_DIRECTORY } from '../services/directory';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DirectoryScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onOpenSaved?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
  onSelectProviderMessage?: (providerName: string, category: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROVIDER_CARD_WIDTH = Math.min(SCREEN_WIDTH - 64, 320);

const CATEGORY_FILTERS = [
  { id: 'ALL', label: 'All Services', icon: 'grid-outline', color: '#0F766E', bg: '#F0FDFA', border: '#CCFBF1', badgeBg: '#CCFBF1' },
  { id: 'boat', label: 'Boat & Water Taxi', icon: 'boat-outline', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', badgeBg: '#E0F2FE' },
  { id: 'banking', label: 'ATMs & Banks', icon: 'cash-outline', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', badgeBg: '#D1FAE5' },
  { id: 'ac', label: 'A/C & Electric', icon: 'snow-outline', color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC', badgeBg: '#CFFAFE' },
  { id: 'starlink', label: 'Starlink & Wi-Fi', icon: 'radio-outline', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', badgeBg: '#E0E7FF' },
  { id: 'plumbing', label: 'Plumbing & Water', icon: 'water-outline', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', badgeBg: '#DCFCE7' },
  { id: 'medical', label: 'Doctor & Clinic', icon: 'medical-outline', color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3', badgeBg: '#FFE4E6' },
  { id: 'vet', label: 'Island Vet & Pets', icon: 'paw-outline', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', badgeBg: '#EDE9FE' },
  { id: 'taxi', label: 'Land Taxis', icon: 'car-outline', color: '#D97706', bg: '#FEFCE8', border: '#FEF08A', badgeBg: '#FEF9C3' },
  { id: 'dining', label: 'Supermarkets & Dining', icon: 'restaurant-outline', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', badgeBg: '#FFEDD5' },
];

const DIRECTORY_DECKS = [
  {
    id: 'boat',
    title: 'Boat Captains & Water Taxis',
    subtitle: 'Hope Spots certified captains & island transfers',
    icon: 'boat',
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    badgeBg: '#E0F2FE',
    match: (p: LocalServiceProvider) => p.category === 'boat_repair' || p.category === 'water_taxi',
  },
  {
    id: 'banking',
    title: 'ATMs, Banks & Money Transfers',
    subtitle: 'Banco Nacional, supermarket ATMs, Western Union & Punto Pago',
    icon: 'cash',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    badgeBg: '#D1FAE5',
    match: (p: LocalServiceProvider) => p.category === 'banking_money',
  },
  {
    id: 'ac',
    title: 'A/C & Electricians',
    subtitle: 'Refrigerant refills, leaks & electrical wiring',
    icon: 'snow',
    color: '#0891B2',
    bg: '#ECFEFF',
    border: '#A5F3FC',
    badgeBg: '#CFFAFE',
    match: (p: LocalServiceProvider) => p.category === 'ac_repair',
  },
  {
    id: 'starlink',
    title: 'Starlink & Internet Techs',
    subtitle: 'Dish installation, routers & high-speed line tests',
    icon: 'radio',
    color: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    badgeBg: '#E0E7FF',
    match: (p: LocalServiceProvider) => p.category === 'starlink_internet',
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Water Tanks',
    subtitle: 'Water pressure pumps, leaks & tank maintenance',
    icon: 'water',
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    badgeBg: '#DCFCE7',
    match: (p: LocalServiceProvider) => p.category === 'landlord_housing' || p.category === 'water_supply' || p.category === 'plumber',
  },
  {
    id: 'medical',
    title: 'Doctor & Pharmacy',
    subtitle: 'Urgent consultations, prescriptions & clinic care',
    icon: 'medical',
    color: '#E11D48',
    bg: '#FFF1F2',
    border: '#FECDD3',
    badgeBg: '#FFE4E6',
    match: (p: LocalServiceProvider) => p.category === 'medical_pharmacy' || p.category === 'doctor_clinic' || p.category === 'pharmacy_prescriptions' || p.category === 'dentist_appointments',
  },
  {
    id: 'vet',
    title: 'Island Vets & Animal Care',
    subtitle: 'Emergency pet consultations & veterinary clinics',
    icon: 'paw',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    badgeBg: '#EDE9FE',
    match: (p: LocalServiceProvider) => p.category === 'vet_pet',
  },
  {
    id: 'taxi',
    title: 'Land Taxis & Transport',
    subtitle: 'Isla Colón town taxi stands & Bluff beach pickups',
    icon: 'car',
    color: '#D97706',
    bg: '#FEFCE8',
    border: '#FEF08A',
    badgeBg: '#FEF9C3',
    match: (p: LocalServiceProvider) => p.category === 'taxi_land',
  },
  {
    id: 'dining',
    title: 'Supermarkets & Dining',
    subtitle: 'Super Gourmet, specialty diets & island dining',
    icon: 'restaurant',
    color: '#EA580C',
    bg: '#FFF7ED',
    border: '#FED7AA',
    badgeBg: '#FFEDD5',
    match: (p: LocalServiceProvider) => p.category === 'dining_groceries',
  },
];

export const DirectoryScreen: React.FC<DirectoryScreenProps> = ({
  isPro,
  onOpenPaywall,
  onOpenSaved,
  onOpenSettings,
  savedCount = 0,
}) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const filterBarRef = React.useRef<ScrollView>(null);

  const [providers, setProviders] = useState<LocalServiceProvider[]>(INITIAL_BOCAS_DIRECTORY);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeDeckId, setActiveDeckId] = useState<string>(DIRECTORY_DECKS[0]?.id || 'boat');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchRegionalProviders('bocas_del_toro').then((list) => {
      if (list && list.length > 0) {
        setProviders(list);
      }
    });
  }, []);

  const handleProviderAdded = (newOrUpdated: LocalServiceProvider, isExistingMerge: boolean) => {
    setProviders((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === newOrUpdated.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = newOrUpdated;
        return updated;
      }
      return [newOrUpdated, ...prev];
    });
  };

  const handleToggleDeck = (deckId: string, shouldScroll: boolean = false) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    const nextId = activeDeckId === deckId ? '' : deckId;
    setActiveDeckId(nextId);

    if (nextId !== '') {
      const index = DIRECTORY_DECKS.findIndex((d) => d.id === nextId);
      if (index >= 0) {
        // Sync horizontal filter bar
        filterBarRef.current?.scrollTo({ x: Math.max(0, (index + 1) * 105 - 60), animated: true });

        // Scroll the selected deck card directly to the top of the viewport under pinned bar
        if (shouldScroll) {
          const targetY = index * 48;
          scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
        }
      }
    }
  };

  const handleSelectFilter = (filterId: string) => {
    if (filterId === 'ALL') {
      setActiveFilter('ALL');
      handleToggleDeck('boat', true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      filterBarRef.current?.scrollTo({ x: 0, animated: true });
      return;
    }

    setActiveFilter('ALL');
    handleToggleDeck(filterId, true);
  };

  // Vertical scroll listener: Automatically opens category cards smoothly as user scrolls
  const handleVerticalScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isStackedView) return;
    const scrollY = event.nativeEvent.contentOffset.y;

    const cardStep = 48;
    // Calibrated index: if scrollY <= 24, guarantee instant snap to Boat Captains (index 0)
    const computedIndex = scrollY <= 24 
      ? 0 
      : Math.max(0, Math.min(DIRECTORY_DECKS.length - 1, Math.floor((scrollY + 20) / cardStep)));

    const targetDeck = DIRECTORY_DECKS[computedIndex];
    if (targetDeck && targetDeck.id !== activeDeckId) {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setActiveDeckId(targetDeck.id);
      if (computedIndex === 0) {
        filterBarRef.current?.scrollTo({ x: 0, animated: true });
      } else {
        filterBarRef.current?.scrollTo({ x: Math.max(0, computedIndex * 105 - 40), animated: true });
      }
    }
  };

  const filteredProviders = useMemo(() => {
    let result = providers;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.notes && p.notes.toLowerCase().includes(query)) ||
          (p.address && p.address.toLowerCase().includes(query)) ||
          (p.serviceType && p.serviceType.toLowerCase().includes(query)) ||
          (p.phoneNumber && p.phoneNumber.toLowerCase().includes(query)) ||
          (p.whatsappNumber && p.whatsappNumber.toLowerCase().includes(query))
      );
    }

    return result;
  }, [providers, activeFilter, searchQuery]);

  const isStackedView = activeFilter === 'ALL' && !searchQuery.trim();

  return (
    <View style={styles.screenContainer}>
      <Header
        isPro={isPro}
        onOpenPaywall={onOpenPaywall}
        onOpenSaved={onOpenSaved}
        savedCount={savedCount}
        onOpenSettings={onOpenSettings}
      />

      {/* Permanently Pinned Top Header (Badge, Add Pro, Search, Category Filter Bar) */}
      <View style={styles.pinnedDirectoryHeader}>
        <View style={styles.directoryHeaderTopRow}>
          <View style={styles.badgeRow}>
            <Ionicons name="shield-checkmark" size={13} color="#0F172A" />
            <Text style={styles.badgeText}>VERIFIED BOCAS DIRECTORY</Text>
          </View>
          <TouchableOpacity
            style={styles.recommendBtnMini}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle" size={15} color="#FFF" />
            <Text style={styles.recommendBtnMiniText}>Recommend Pro</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#0F172A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search provider, service, island..."
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

        {/* Permanently Pinned Horizontal Category Filter Bar */}
        <ScrollView
          ref={filterBarRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          {CATEGORY_FILTERS.map((f) => {
            const isSelected = activeDeckId === f.id || (f.id === 'ALL' && activeDeckId === '');
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? f.badgeBg : f.bg,
                    borderColor: isSelected ? f.color : f.border,
                    borderWidth: isSelected ? 1.5 : 1,
                  },
                ]}
                onPress={() => handleSelectFilter(f.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={f.icon as any}
                  size={14}
                  color="#0F172A"
                />
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: '#0F172A',
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 800 }]}
        showsVerticalScrollIndicator={true}
        onScroll={handleVerticalScroll}
        scrollEventThrottle={16}
      >

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 20 }} />
        ) : isStackedView ? (
          <View style={styles.stackedDecksWrapper}>
            {DIRECTORY_DECKS.map((deck, index) => {
              const isExpanded = activeDeckId === deck.id;
              const deckProviders = providers.filter(deck.match);

              return (
                <View
                  key={deck.id}
                  style={[
                    styles.stackedDeckCard,
                    {
                      backgroundColor: deck.bg,
                      borderColor: isExpanded ? deck.color : deck.border,
                      borderWidth: isExpanded ? 2.5 : 1.5,
                      marginTop: index > 0 ? -18 : 0, // Fanned overlapping playing card deck
                      zIndex: isExpanded ? 100 : DIRECTORY_DECKS.length - index,
                      elevation: isExpanded ? 8 : DIRECTORY_DECKS.length - index,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.deckHeaderRow}
                    onPress={() => handleToggleDeck(deck.id, true)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.deckIconBubble, { backgroundColor: deck.badgeBg }]}>
                      <Ionicons name={deck.icon as any} size={20} color="#0F172A" />
                    </View>
                    <View style={styles.deckInfo}>
                      <Text style={styles.deckTitle}>{deck.title}</Text>
                      <Text style={styles.deckSubtitle} numberOfLines={1}>{deck.subtitle}</Text>
                    </View>
                    <View style={[styles.deckToggleCircle, { backgroundColor: deck.badgeBg }]}>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#0F172A"
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.deckCarouselWrapper}>
                      <View style={styles.deckCarouselHeaderRow}>
                        <Text style={styles.deckCountText}>
                          {deckProviders.length} {deckProviders.length === 1 ? 'Provider' : 'Verified Providers'}
                        </Text>
                        {deckProviders.length > 1 && (
                          <View style={[styles.swipeHintBadge, { backgroundColor: deck.badgeBg }]}>
                            <Text style={[styles.swipeHintText, { color: deck.color }]}>
                              Swipe →
                            </Text>
                          </View>
                        )}
                      </View>

                      {deckProviders.length === 0 ? (
                        <Text style={styles.noDeckProvidersText}>No verified providers listed in this category yet.</Text>
                      ) : (
                        <ScrollView
                          horizontal
                          pagingEnabled={false}
                          snapToInterval={PROVIDER_CARD_WIDTH + 12}
                          decelerationRate="fast"
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.horizontalProviderList}
                        >
                          {deckProviders.map((provider) => (
                            <View key={provider.id} style={{ width: PROVIDER_CARD_WIDTH }}>
                              <DirectoryCard provider={provider} />
                            </View>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : filteredProviders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={36} color={Colors.outline} />
            <Text style={styles.emptyTitle}>No matching providers found</Text>
          </View>
        ) : (
          filteredProviders.map((provider) => (
            <DirectoryCard key={provider.id} provider={provider} />
          ))
        )}
      </View>
    </ScrollView>

    <AddProviderModal
      visible={showAddModal}
      onClose={() => setShowAddModal(false)}
      existingProviders={providers}
      onProviderAdded={handleProviderAdded}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pinnedDirectoryHeader: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 20,
  },
  directoryHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  recommendBtnMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary || '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  recommendBtnMiniText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.tertiaryContainer,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.tertiary,
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.onBackground,
  },
  filterRow: {
    marginTop: 2,
    marginBottom: 2,
  },
  filterRowContent: {
    paddingRight: 16,
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 11.5,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 800,
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    textAlign: 'center',
  },
  stackedDecksWrapper: {
    marginTop: 8,
  },
  stackedDeckCard: {
    borderRadius: 22,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  deckHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  deckIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  deckSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  deckToggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckCarouselWrapper: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  deckCarouselHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deckCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  swipeHintBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  swipeHintText: {
    fontSize: 11,
    fontWeight: '800',
  },
  horizontalProviderList: {
    gap: 12,
    paddingRight: 16,
    paddingBottom: 4,
  },
  noDeckProvidersText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
    paddingVertical: 10,
    textAlign: 'center',
  },
});
