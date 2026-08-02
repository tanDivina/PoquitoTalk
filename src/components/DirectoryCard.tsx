import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { LocalServiceProvider } from '../services/directory';

interface DirectoryCardProps {
  provider: LocalServiceProvider;
  translatedMessage?: string;
}

export const DirectoryCard: React.FC<DirectoryCardProps> = ({ provider, translatedMessage }) => {
  const handleChatWhatsApp = async () => {
    const cleanNumber = provider.whatsappNumber.replace(/[^0-9+]/g, '');
    const message = translatedMessage || '¡Buenas! Le escribo por PoquitoTalk.';
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(`whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nameSection}>
          <Text style={styles.providerName}>{provider.name}</Text>
          {provider.notes && <Text style={styles.notes}>{provider.notes}</Text>}
        </View>

        {provider.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.tertiary} />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color="#E6A100" />
          <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
        </View>

        <TouchableOpacity style={styles.chatBtn} onPress={handleChatWhatsApp} activeOpacity={0.8}>
          <FontAwesome5 name="whatsapp" size={14} color="#FFF" />
          <Text style={styles.chatBtnText}>Message on WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameSection: {
    flex: 1,
    marginRight: 8,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  notes: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.tertiary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.whatsapp,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});
