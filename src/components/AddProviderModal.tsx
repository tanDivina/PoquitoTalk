import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { LocalServiceProvider } from '../types';
import {
  normalizePanamaPhoneNumber,
  saveCustomProvider,
} from '../services/storage';
import { findExistingProviderByPhone } from '../services/directory';

interface AddProviderModalProps {
  visible: boolean;
  onClose: () => void;
  existingProviders: LocalServiceProvider[];
  onProviderAdded: (provider: LocalServiceProvider, isExistingMerge: boolean) => void;
}

const CATEGORIES = [
  { id: 'water_taxi', label: 'Boat Captain / Water Taxi', icon: 'boat-outline' },
  { id: 'ac_repair', label: 'A/C & Electrician', icon: 'snow-outline' },
  { id: 'plumber', label: 'Plumber & Water Tanks', icon: 'water-outline' },
  { id: 'starlink_internet', label: 'Starlink & Internet Tech', icon: 'radio-outline' },
  { id: 'handyman', label: 'Handyman & Repairs', icon: 'construct-outline' },
  { id: 'cleaning', label: 'Housekeeping & Laundry', icon: 'sparkles-outline' },
  { id: 'doctor_clinic', label: 'Doctor & Medical Clinic', icon: 'medkit-outline' },
  { id: 'pharmacy_prescriptions', label: 'Pharmacy & Prescriptions', icon: 'fitness-outline' },
  { id: 'dentist_appointments', label: 'Dentist & Dental Care', icon: 'happy-outline' },
];

export const AddProviderModal: React.FC<AddProviderModalProps> = ({
  visible,
  onClose,
  existingProviders,
  onProviderAdded,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('water_taxi');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [nominatedBy, setNominatedBy] = useState('');
  const [existingMatch, setExistingMatch] = useState<LocalServiceProvider | null>(null);

  // Real-time duplicate phone checking
  useEffect(() => {
    if (!phone || phone.trim().length < 4) {
      setExistingMatch(null);
      return;
    }
    const match = findExistingProviderByPhone(phone, existingProviders);
    setExistingMatch(match || null);
  }, [phone, existingProviders]);

  const handleSubmit = async () => {
    if (!name.trim() && !existingMatch) {
      Alert.alert('Name Required', 'Please enter the provider or business name.');
      return;
    }

    if (!phone.trim() && !existingMatch) {
      Alert.alert('Phone Required', 'Please enter a WhatsApp or phone number so expats can contact them.');
      return;
    }

    const normalized = normalizePanamaPhoneNumber(phone);

    // CASE 1: MATCH FOUND (DUPLICATE SAFE MERGE)
    if (existingMatch) {
      const mergedProvider: LocalServiceProvider = {
        ...existingMatch,
        communityNotes: [
          ...(existingMatch.communityNotes || []),
          ...(notes.trim() ? [`"${notes.trim()}" — recommended by ${nominatedBy.trim() || 'Client'}`] : []),
        ],
      };

      await saveCustomProvider(mergedProvider);

      Alert.alert(
        'Vouch Added! ⭐',
        `Your recommendation was successfully added to ${existingMatch.name}'s profile. Zero duplicates created!`
      );

      onProviderAdded(mergedProvider, true);
      handleReset();
      onClose();
      return;
    }

    // CASE 2: BRAND NEW CONTRACTOR
    const newId = `pro_community_${Date.now()}`;
    const newProvider: LocalServiceProvider = {
      id: newId,
      region: 'bocas_del_toro',
      category,
      name: name.trim(),
      whatsappNumber: phone.trim(),
      phoneNumber: phone.trim(),
      normalizedPhone: normalized,
      address: address.trim() || 'Bocas del Toro (Isla Colón & Archipelago)',
      hours: 'Daily Availability',
      rating: 5.0,
      verified: true,
      notes: notes.trim()
        ? `${notes.trim()}${nominatedBy.trim() ? ` (Client recommended by ${nominatedBy.trim()})` : ''}`
        : 'Community-recommended local professional.',
      nominatedBy: nominatedBy.trim() || 'Community Member',
    };

    await saveCustomProvider(newProvider);

    Alert.alert(
      'Provider Added',
      `${newProvider.name} has been added to your local island directory and recommended to the Bocas community.`
    );

    onProviderAdded(newProvider, false);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setName('');
    setCategory('water_taxi');
    setPhone('');
    setAddress('');
    setNotes('');
    setNominatedBy('');
    setExistingMatch(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.title}>Recommend a Local Pro</Text>
              <Text style={styles.subtitle}>Help your favorite tradesmen and boat captains get more jobs</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.outline} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Real-Time Match Alert Banner */}
            {existingMatch && (
              <View style={styles.matchBanner}>
                <Ionicons name="shield-checkmark" size={18} color="#047857" />
                <View style={styles.matchBannerTextGroup}>
                  <Text style={styles.matchBannerTitle}>Already in Directory!</Text>
                  <Text style={styles.matchBannerDesc}>
                    <Text style={{ fontWeight: '700' }}>{existingMatch.name}</Text> is already listed. Submitting will add your vouch & recommendation note to their existing card.
                  </Text>
                </View>
              </View>
            )}

            {/* Provider WhatsApp Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>WhatsApp / Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="+507 6745-0876"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Provider Name */}
            {!existingMatch && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Provider Name / Business *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Maestro Carlos – Boat Painter"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            {/* Category Selector */}
            {!existingMatch && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Service Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                        onPress={() => setCategory(cat.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={14}
                          color={isSelected ? '#FFF' : Colors.secondary}
                        />
                        <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Location / Islands */}
            {!existingMatch && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location / Island Coverage</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Isla Colón, Carenero, Bastimentos"
                  placeholderTextColor="#94A3B8"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            )}

            {/* Recommendation / Vouch Note */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recommendation & Vouch Note</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Fixed our roof in Bastimentos. Honest, punctual, and fair price!"
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Client Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name / Relationship (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sarah (Carenero Resident)"
                placeholderTextColor="#94A3B8"
                value={nominatedBy}
                onChangeText={setNominatedBy}
              />
            </View>

            {/* Action Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Ionicons
                name={existingMatch ? 'shield-checkmark' : 'add-circle-outline'}
                size={18}
                color="#FFF"
              />
              <Text style={styles.submitBtnText}>
                {existingMatch ? 'Add My Recommendation & Vouch' : 'Add Pro to Bocas Directory'}
              </Text>
            </TouchableOpacity>
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
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleGroup: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  matchBannerTextGroup: {
    flex: 1,
  },
  matchBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#047857',
    marginBottom: 2,
  },
  matchBannerDesc: {
    fontSize: 12,
    color: '#065F46',
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary || '#059669',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
