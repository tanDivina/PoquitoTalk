import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { DirectoryCard } from '../components/DirectoryCard';
import { AddProviderModal } from '../components/AddProviderModal';
import { fetchRegionalProviders, LocalServiceProvider, INITIAL_BOCAS_DIRECTORY } from '../services/directory';



interface DirectoryScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onOpenSaved?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
  onSelectProviderMessage?: (providerName: string, category: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROVIDER_CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 335);

// Rule 12 Falling Rainbow Spectrum & Logical Domain Order (1-to-1 matching DIRECTORY_DECKS)
const CATEGORY_FILTERS = [
  { id: 'boat', label: 'Boat & Water Taxi', icon: 'boat', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', badgeBg: '#E0F2FE' },
  { id: 'taxi', label: 'Land Taxis & Transport', icon: 'car', color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC', badgeBg: '#CFFAFE' },
  { id: 'plumbing', label: 'Plumbing & Water Tanks', icon: 'water', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4', badgeBg: '#CCFBF1' },
  { id: 'ac', label: 'A/C, Electric & Solar', icon: 'snow', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', badgeBg: '#D1FAE5' },
  { id: 'gardening', label: 'Gardening & Maintenance', icon: 'leaf', color: '#65A30D', bg: '#F7FEE7', border: '#D9F99D', badgeBg: '#ECFCCB' },
  { id: 'contractor', label: 'Contractors & Handymen', icon: 'construct', color: '#CA8A04', bg: '#FEFCE8', border: '#FEF08A', badgeBg: '#FEF9C3' },
  { id: 'starlink', label: 'Starlink & Internet', icon: 'radio', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', badgeBg: '#FEF3C7' },
  { id: 'banking', label: 'ATMs & Cash Services', icon: 'cash', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', badgeBg: '#FFEDD5' },
  { id: 'dining', label: 'Supermarkets & Dining', icon: 'restaurant', color: '#F43F5E', bg: '#FFF1F2', border: '#FECDD3', badgeBg: '#FFE4E6' },
  { id: 'medical', label: 'Doctor & Pharmacy', icon: 'medkit', color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3', badgeBg: '#FFE4E6' },
  { id: 'vet', label: 'Island Vets & Animal Care', icon: 'paw', color: '#C026D3', bg: '#FDF4FF', border: '#F5D0FE', badgeBg: '#FAE8FF' },
  { id: 'community', label: 'Community & Culture', icon: 'people', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', badgeBg: '#EDE9FE' },
];

const DIRECTORY_DECKS = [
  {
    id: 'boat',
    title: 'Boat Captains & Water Taxis',
    subtitle: 'Hope Spot certified captains & island transfers',
    icon: 'boat',
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    badgeBg: '#E0F2FE',
    match: (p: LocalServiceProvider) =>
      p.category !== 'banking_money' &&
      p.category !== 'banking' &&
      p.category !== 'atm' &&
      p.serviceType !== 'western_union' &&
      p.serviceType !== 'atm' &&
      p.serviceType !== 'bank' &&
      p.serviceType !== 'punto_pago' &&
      (p.category === 'water_taxi' ||
        p.category === 'boat_repair' ||
        p.category === 'boat' ||
        /\b(lancha|marítimo|maritimo|water taxi|capitán|capitan)\b/i.test(p.name)),
  },
  {
    id: 'taxi',
    title: 'Land Taxis & Transport',
    subtitle: 'Town taxi stands & island road pickups',
    icon: 'car',
    color: '#0891B2',
    bg: '#ECFEFF',
    border: '#A5F3FC',
    badgeBg: '#CFFAFE',
    match: (p: LocalServiceProvider) =>
      p.category !== 'water_taxi' &&
      p.category !== 'boat_repair' &&
      p.category !== 'boat' &&
      p.category !== 'banking_money' &&
      p.category !== 'banking' &&
      p.serviceType !== 'western_union' &&
      p.serviceType !== 'atm' &&
      p.serviceType !== 'bank' &&
      !/\b(lancha|marítimo|maritimo|water taxi|capitán|capitan)\b/i.test(p.name) &&
      (p.category === 'land_taxi' ||
        p.category === 'taxi_land' ||
        p.category === 'car_mechanic' ||
        p.category === 'car_rental' ||
        p.category === 'taxi'),
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Water Systems',
    subtitle: 'Pressure pumps, cistern deliveries & pipe maintenance',
    icon: 'water',
    color: '#0D9488',
    bg: '#F0FDFA',
    border: '#99F6E4',
    badgeBg: '#CCFBF1',
    match: (p: LocalServiceProvider) =>
      p.category === 'plumbing_water' ||
      p.category === 'plumber' ||
      p.category === 'water_supply' ||
      p.category === 'landlord_housing' ||
      p.category === 'plumbing',
  },
  {
    id: 'ac',
    title: 'Electricians, A/C & Solar',
    subtitle: 'Refrigerant refills, solar systems & wiring',
    icon: 'snow',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    badgeBg: '#D1FAE5',
    match: (p: LocalServiceProvider) =>
      p.category === 'ac_repair' ||
      p.category === 'power_blackout' ||
      p.category === 'electrician' ||
      p.category === 'solar',
  },
  {
    id: 'gardening',
    title: 'Gardening & Nurseries',
    subtitle: 'Mowing, landscaping & tree trimming',
    icon: 'leaf',
    color: '#65A30D',
    bg: '#F7FEE7',
    border: '#D9F99D',
    badgeBg: '#ECFCCB',
    match: (p: LocalServiceProvider) =>
      p.category === 'gardening_plants' ||
      p.category === 'gardening' ||
      p.category === 'plants',
  },
  {
    id: 'contractor',
    title: 'Contractors & Handymen',
    subtitle: 'Carpentry, masonry & hardware supplies',
    icon: 'construct',
    color: '#CA8A04',
    bg: '#FEFCE8',
    border: '#FEF08A',
    badgeBg: '#FEF9C3',
    match: (p: LocalServiceProvider) =>
      p.category === 'contractor_housing' ||
      p.category === 'contractor_handyman' ||
      p.category === 'hardware_construction' ||
      p.category === 'hardware_supplies' ||
      p.category === 'contractors' ||
      p.category === 'welding',
  },
  {
    id: 'starlink',
    title: 'Starlink & Internet Techs',
    subtitle: 'Satellite dish alignment, routers & network setup',
    icon: 'radio',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    badgeBg: '#FEF3C7',
    match: (p: LocalServiceProvider) =>
      p.category === 'starlink_internet' || p.category === 'internet',
  },
  {
    id: 'banking',
    title: 'ATMs & Western Union',
    subtitle: 'Cash dispensers, bank branches & transfer points',
    icon: 'cash',
    color: '#EA580C',
    bg: '#FFF7ED',
    border: '#FED7AA',
    badgeBg: '#FFEDD5',
    match: (p: LocalServiceProvider) =>
      p.category === 'banking_money' ||
      p.category === 'banking' ||
      p.category === 'atm' ||
      p.serviceType === 'western_union' ||
      p.serviceType === 'bank' ||
      p.serviceType === 'atm' ||
      p.serviceType === 'punto_pago' ||
      p.serviceType === 'utility',
  },
  {
    id: 'dining',
    title: 'Supermarkets & Dining',
    subtitle: 'Specialty grocers, fresh produce & island dining',
    icon: 'restaurant',
    color: '#F43F5E',
    bg: '#FFF1F2',
    border: '#FECDD3',
    badgeBg: '#FFE4E6',
    match: (p: LocalServiceProvider) =>
      p.category === 'dining_provisions' ||
      p.category === 'dining_groceries' ||
      p.category === 'restaurant_dining' ||
      p.category === 'groceries_diet',
  },
  {
    id: 'medical',
    title: 'Doctor & Pharmacy',
    subtitle: 'Urgent medical consultations, pharmacies & dental care',
    icon: 'medkit',
    color: '#E11D48',
    bg: '#FFF1F2',
    border: '#FECDD3',
    badgeBg: '#FFE4E6',
    match: (p: LocalServiceProvider) =>
      p.category === 'medical_pharmacy' ||
      p.category === 'doctor_clinic' ||
      p.category === 'pharmacy_prescriptions' ||
      p.category === 'dentist_appointments' ||
      p.category === 'medical',
  },
  {
    id: 'vet',
    title: 'Island Vets & Animal Care',
    subtitle: 'Emergency pet care, clinic visits & animal welfare',
    icon: 'paw',
    color: '#C026D3',
    bg: '#FDF4FF',
    border: '#F5D0FE',
    badgeBg: '#FAE8FF',
    match: (p: LocalServiceProvider) =>
      p.category === 'vet_animal' ||
      p.category === 'vet_pet' ||
      p.category === 'pet_vet_emergency' ||
      p.category === 'vet',
  },
  {
    id: 'community',
    title: 'Community & Island Culture',
    subtitle: 'Immigration check-ins, local artisans & island guides',
    icon: 'people',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    badgeBg: '#EDE9FE',
    match: (p: LocalServiceProvider) =>
      p.category === 'community_culture' ||
      p.category === 'border_immigration' ||
      p.category === 'community_island' ||
      p.category === 'community' ||
      p.category === 'hotel_lodging',
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
  // Starts clean and collapsed in 100% resting state so all category cards fit above fold (Rule 6)
  const [activeDeckId, setActiveDeckId] = useState<string>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const d = new URLSearchParams(window.location.search).get('deck');
      if (d) return d;
    }
    return '';
  });
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

  const providersByDeck = useMemo(() => {
    const map: Record<string, LocalServiceProvider[]> = {};
    for (const deck of DIRECTORY_DECKS) {
      map[deck.id] = providers.filter(deck.match);
    }
    return map;
  }, [providers]);

  const handleToggleDeck = (deckId: string, shouldScroll: boolean = true) => {
    if (Platform.OS === 'ios') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    const nextId = activeDeckId === deckId ? '' : deckId;
    setActiveDeckId(nextId);

    if (nextId !== '') {
      const index = DIRECTORY_DECKS.findIndex((d) => d.id === nextId);
      if (index >= 0) {
        // Sync horizontal filter bar so active chip is visible
        filterBarRef.current?.scrollTo({ x: Math.max(0, index * 105 - 60), animated: true });

        // Smoothly scroll the selected deck card into comfortable view flush under pinned header (no previous card line visible)
        if (shouldScroll) {
          const targetY = index === 0 ? 0 : 18 + index * 52;
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
          }, 80);
        }
      }
    } else {
      // Collapsed back to resting state - scroll filter bar back to 0
      filterBarRef.current?.scrollTo({ x: 0, animated: true });
    }
  };

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) {
      return providers;
    }
    const query = searchQuery.toLowerCase();
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.notes && p.notes.toLowerCase().includes(query)) ||
        (p.address && p.address.toLowerCase().includes(query)) ||
        (p.serviceType && p.serviceType.toLowerCase().includes(query)) ||
        (p.phoneNumber && p.phoneNumber.toLowerCase().includes(query)) ||
        (p.whatsappNumber && p.whatsappNumber.toLowerCase().includes(query))
    );
  }, [providers, searchQuery]);

  const isStackedView = !searchQuery.trim();

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
          directionalLockEnabled={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          {CATEGORY_FILTERS.map((f) => {
            const isSelected = activeDeckId === f.id;
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
                onPress={() => handleToggleDeck(f.id, true)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
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

      {/* Main Vertical ScrollView with Native Calm Scrolling */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 600 }]}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 20 }} />
          ) : isStackedView ? (
            <View style={styles.stackedDecksWrapper}>
              {DIRECTORY_DECKS.map((deck, index) => {
                const isExpanded = activeDeckId === deck.id;
                const deckProviders = isExpanded ? (providersByDeck[deck.id] || []) : [];

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
                        zIndex: isExpanded ? 50 : DIRECTORY_DECKS.length - index,
                        elevation: isExpanded ? 4 : 1,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.deckHeaderRow}
                      onPress={() => handleToggleDeck(deck.id)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                    >
                      <View style={[styles.deckIconBubble, { backgroundColor: deck.badgeBg }]}>
                        <Ionicons name={deck.icon as any} size={20} color="#0F172A" />
                      </View>
                      <View style={styles.deckInfo}>
                        <Text style={styles.deckTitle} numberOfLines={1} ellipsizeMode="tail">{deck.title}</Text>
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
                          <FlatList
                            data={deckProviders}
                            keyExtractor={(item) => item.id}
                            horizontal
                            snapToInterval={PROVIDER_CARD_WIDTH + 12}
                            decelerationRate="fast"
                            showsHorizontalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            initialNumToRender={2}
                            maxToRenderPerBatch={2}
                            windowSize={3}
                            contentContainerStyle={styles.horizontalProviderList}
                            renderItem={({ item: provider }) => (
                              <View style={{ width: PROVIDER_CARD_WIDTH }}>
                                <DirectoryCard provider={provider} />
                              </View>
                            )}
                          />
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
    zIndex: 1000,
    elevation: 20,
  },
  directoryHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
  },
  recommendBtnMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
  },
  recommendBtnMiniText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.onSurface,
    padding: 0,
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
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11.5,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 600,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  stackedDecksWrapper: {
    marginTop: 4,
  },
  stackedDeckCard: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  deckHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deckIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  deckSubtitle: {
    fontSize: 11.5,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '500',
  },
  deckToggleCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckCarouselWrapper: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  deckCarouselHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deckCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  swipeHintBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  swipeHintText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  noDeckProvidersText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  horizontalProviderList: {
    gap: 12,
    paddingVertical: 4,
    paddingRight: 16,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    marginTop: 10,
  },
});
