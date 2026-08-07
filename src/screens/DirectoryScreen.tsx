import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { DirectoryCard } from '../components/DirectoryCard';
import { fetchRegionalProviders, LocalServiceProvider } from '../services/directory';

interface DirectoryScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onSelectProviderMessage?: (providerName: string, category: string) => void;
}

const CATEGORY_FILTERS = [
  { id: 'ALL', label: 'All Providers', icon: 'grid-outline' },
  { id: 'AC', label: 'A/C & Electrical', icon: 'snow-outline' },
  { id: 'BOAT', label: 'Boat & Water Taxi', icon: 'boat-outline' },
  { id: 'PLUMBING', label: 'Plumbing & Water', icon: 'water-outline' },
  { id: 'STARLINK', label: 'Starlink & Internet', icon: 'radio-outline' },
  { id: 'MEDICAL', label: 'Doctor & Medical', icon: 'medical-outline' },
];

export const DirectoryScreen: React.FC<DirectoryScreenProps> = ({
  isPro,
  onOpenPaywall,
  onSelectProviderMessage,
}) => {
  const [providers, setProviders] = useState<LocalServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    fetchRegionalProviders('bocas_del_toro').then((list) => {
      setProviders(list);
      setLoading(false);
    });
  }, []);

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'AC') return p.category.toLowerCase().includes('a/c') || p.category.toLowerCase().includes('air');
    if (activeFilter === 'BOAT') return p.category.toLowerCase().includes('boat') || p.category.toLowerCase().includes('taxi');
    if (activeFilter === 'PLUMBING') return p.category.toLowerCase().includes('plumb') || p.category.toLowerCase().includes('water');
    if (activeFilter === 'STARLINK') return p.category.toLowerCase().includes('starlink') || p.category.toLowerCase().includes('internet');
    if (activeFilter === 'MEDICAL') return p.category.toLowerCase().includes('doctor') || p.category.toLowerCase().includes('medic');
    return true;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} />

      <View style={styles.heroSection}>
        <View style={styles.badgeRow}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.tertiary} />
          <Text style={styles.badgeText}>VERIFIED BOCAS DIRECTORY 🇵🇦</Text>
        </View>
        <Text style={styles.title}>Local Service Providers</Text>
        <Text style={styles.subtitle}>
          Connect directly with verified A/C technicians, water taxi captains, plumbers, and Starlink pros in Bocas del Toro.
        </Text>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search provider, service, or island location..."
            placeholderTextColor={Colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {CATEGORY_FILTERS.map((f) => {
            const isSelected = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setActiveFilter(f.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={f.icon as any}
                  size={14}
                  color={isSelected ? Colors.tertiary : Colors.onSurfaceVariant}
                />
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Directory List View */}
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 20 }} />
        ) : filteredProviders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={36} color={Colors.outline} />
            <Text style={styles.emptyTitle}>No matching providers found</Text>
            <Text style={styles.emptySub}>Try searching for "Carlos", "A/C", "Boat", or "Isla Colón".</Text>
          </View>
        ) : (
          filteredProviders.map((provider) => (
            <DirectoryCard key={provider.id} provider={provider} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.tertiaryContainer,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.tertiary,
    letterSpacing: 0.5,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.onBackground,
  },
  filterRow: {
    marginTop: 12,
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: Colors.tertiaryContainer,
    borderWidth: 1,
    borderColor: Colors.tertiary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  filterChipTextSelected: {
    color: Colors.tertiary,
    fontWeight: '800',
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
});
