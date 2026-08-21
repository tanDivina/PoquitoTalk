import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  LayoutAnimation,
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import {
  ConversationThread,
  loadConversationThreads,
  saveConversationThreads,
} from '../services/conversations';
import { ThreadViewModal } from '../components/ThreadViewModal';

interface ConversationsScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onOpenSaved?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
  onResetOnboarding?: () => void;
}

const QUICK_RESPONSE_DECKS = [
  {
    id: 'price_pay',
    title: 'Pricing & Yappy Payments',
    subtitle: 'Ask final price, confirm total & send Yappy',
    icon: 'cash-outline',
    color: '#366649',
    bg: '#F2F7F4',
    border: '#D2E5D8',
    badgeBg: '#E2EFE7',
    phrases: [
      {
        es: '¿Cuánto sería lo último por el servicio?',
        en: 'What is your best/final price for the service?',
      },
      {
        es: '¿Aceptan pago por Yappy o solo efectivo?',
        en: 'Do you accept payment via Yappy or only cash?',
      },
      {
        es: 'Ya le hice el envío por Yappy y le adjunto el comprobante.',
        en: 'I already sent the payment via Yappy and attached the receipt.',
      },
    ],
  },
  {
    id: 'location_eta',
    title: 'Location & Dock ETA',
    subtitle: 'Boat arrival, meeting at dock & directions',
    icon: 'location-outline',
    color: '#2F6278',
    bg: '#F0F7F9',
    border: '#CFE3EB',
    badgeBg: '#DEEDF3',
    phrases: [
      {
        es: '¡Buenas! Ya estoy esperándolo en el muelle principal.',
        en: 'Hi! I am already waiting for you at the main dock.',
      },
      {
        es: '¿A qué hora calcula que estaría llegando a la casa?',
        en: 'What time do you estimate you will arrive at the house?',
      },
      {
        es: 'Le comparto mi ubicación exacta por aquí para que no se pierda.',
        en: 'I am sharing my exact live location here so you do not get lost.',
      },
    ],
  },
  {
    id: 'followup_avail',
    title: 'Follow-Up & Availability',
    subtitle: 'Confirm schedule, delays & availability',
    icon: 'time-outline',
    color: '#6B5E51',
    bg: '#FAF8F5',
    border: '#E8E2D8',
    badgeBg: '#F3ECE2',
    phrases: [
      {
        es: 'Disculpe la molestia, ¿sigue disponible para venir hoy?',
        en: 'Sorry to bother you, are you still available to come today?',
      },
      {
        es: 'Disculpe la demora, voy saliendo para allá ahora mismo.',
        en: 'Sorry for the delay, I am heading there right now.',
      },
      {
        es: 'Excelente, quedamos así para mañana en la mañana. ¡Muchas gracias!',
        en: 'Great, confirmed for tomorrow morning. Thank you very much!',
      },
    ],
  },
];

export const ConversationsScreen: React.FC<ConversationsScreenProps> = ({
  isPro,
  onOpenPaywall,
  onOpenSaved,
  onOpenSettings,
  savedCount = 0,
  onResetOnboarding,
}) => {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [threadModalVisible, setThreadModalVisible] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState<string>('price_pay');
  const [playingAudioText, setPlayingAudioText] = useState<string | null>(null);

  const handleToggleDeck = (deckId: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setActiveDeckId((prev) => (prev === deckId ? '' : deckId));
  };

  const handlePlayAudio = (spanishText: string) => {
    if (playingAudioText === spanishText) {
      Speech.stop();
      setPlayingAudioText(null);
      return;
    }
    setPlayingAudioText(spanishText);
    Speech.speak(spanishText, {
      language: 'es-PA',
      pitch: 0.95,
      rate: 0.88,
      onDone: () => setPlayingAudioText(null),
      onError: () => setPlayingAudioText(null),
    });
  };

  const handleCopyPhrase = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied! 📋', 'Spanish phrase copied to clipboard for WhatsApp.');
  };

  useEffect(() => {
    loadConversationThreads().then((data) => setThreads(data));
  }, []);

  const handleSelectThread = (thread: ConversationThread) => {
    setActiveThread(thread);
    setThreadModalVisible(true);
  };

  const handleUpdateThread = (updatedThread: ConversationThread) => {
    const nextThreads = threads.map((t) => (t.id === updatedThread.id ? updatedThread : t));
    setThreads(nextThreads);
    setActiveThread(updatedThread);
    saveConversationThreads(nextThreads);
  };

  const handleCreateNewContactThread = () => {
    Alert.prompt(
      'New Service Contact',
      'Enter contact name (e.g., "Landlord Maria" or "Starlink Tech"):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Thread',
          onPress: (contactName) => {
            if (!contactName) return;
            const newThread: ConversationThread = {
              id: `thread_${Date.now()}`,
              contactName: contactName.trim(),
              category: 'General Service',
              avatarIcon: 'person-outline',
              lastUpdated: Date.now(),
              messages: [],
            };
            const updated = [newThread, ...threads];
            setThreads(updated);
            saveConversationThreads(updated);
            handleSelectThread(newThread);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 120 }]}>
      <Header
        isPro={isPro}
        onOpenPaywall={onOpenPaywall}
        onOpenSaved={onOpenSaved}
        savedCount={savedCount}
        onOpenSettings={onOpenSettings}
        onResetOnboarding={onResetOnboarding}
      />

      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Conversations 💬</Text>
            <Text style={styles.subtitle}>2-Way WhatsApp threads with local Bocas services</Text>
          </View>

          <TouchableOpacity
            style={styles.addContactBtn}
            onPress={handleCreateNewContactThread}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* List of Active Conversation Threads */}
      <View style={styles.threadsList}>
        {threads.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={36} color={Colors.outline} />
            <Text style={styles.emptyTitle}>No Active Threads Yet</Text>
            <Text style={styles.emptyDesc}>
              Create a dedicated 2-way conversation thread for your service contacts (e.g., Landlord, Plumber, or Water Taxi).
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={handleCreateNewContactThread}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.emptyAddBtnText}>Add First Contact Thread</Text>
            </TouchableOpacity>
          </View>
        ) : (
          threads.map((thread) => {
            const lastMsg = thread?.messages?.length ? thread.messages[thread.messages.length - 1] : null;
            const formattedDate = thread?.lastUpdated
              ? new Date(thread.lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric' })
              : '';
            return (
              <TouchableOpacity
                key={thread.id}
                style={styles.threadCard}
                onPress={() => handleSelectThread(thread)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarCircle}>
                  <Ionicons name={(thread?.avatarIcon as any) || 'person-outline'} size={20} color={Colors.secondary} />
                </View>

                <View style={styles.threadInfo}>
                  <View style={styles.threadHeaderRow}>
                    <Text style={styles.contactName}>{thread?.contactName || 'Service Contact'}</Text>
                    <Text style={styles.timestamp}>{formattedDate}</Text>
                  </View>

                  <Text style={styles.categoryLabel}>{thread.category}</Text>

                  <Text style={styles.lastMsgSnippet} numberOfLines={1}>
                    {lastMsg ? lastMsg.textEnglish : 'Tap to start 2-way conversation in Spanish...'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Quick Tactical Response Decks (Stacked Cards) */}
      <View style={styles.quickDecksSection}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="chatbubbles-outline" size={14} color={Colors.tertiary} />
          <Text style={styles.sectionHeaderTitle}>QUICK TACTICAL WHATSAPP REPLIES</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Tap any scenario deck to unfold 1-tap Spanish negotiation & arrival responses.
        </Text>

        <View style={styles.stackedDecksWrapper}>
          {QUICK_RESPONSE_DECKS.map((deck, index) => {
            const isExpanded = activeDeckId === deck.id;

            return (
              <View
                key={deck.id}
                style={[
                  styles.stackedDeckCard,
                  {
                    backgroundColor: deck.bg,
                    borderColor: isExpanded ? deck.color : deck.border,
                    borderWidth: isExpanded ? 2 : 1.2,
                    marginTop: index > 0 ? -12 : 0,
                    zIndex: isExpanded ? 40 : QUICK_RESPONSE_DECKS.length - index,
                    elevation: isExpanded ? 6 : QUICK_RESPONSE_DECKS.length - index,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.deckHeaderRow}
                  onPress={() => handleToggleDeck(deck.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.deckIconBubble, { backgroundColor: deck.badgeBg }]}>
                    <Ionicons name={deck.icon as any} size={18} color={deck.color} />
                  </View>
                  <View style={styles.deckInfo}>
                    <Text style={styles.deckTitle}>{deck.title}</Text>
                    <Text style={styles.deckSubtitle} numberOfLines={1}>{deck.subtitle}</Text>
                  </View>
                  <View style={[styles.deckToggleCircle, { backgroundColor: deck.badgeBg }]}>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={deck.color}
                    />
                  </View>
                </TouchableOpacity>

                {/* Fanned Phrases Inside Deck */}
                {isExpanded && (
                  <View style={styles.deckContentList}>
                    {deck.phrases.map((phrase, pIdx) => {
                      const isPlaying = playingAudioText === phrase.es;
                      return (
                        <View key={pIdx} style={styles.phraseCard}>
                          <Text style={styles.phraseSpanishText}>"{phrase.es}"</Text>
                          <Text style={styles.phraseEnglishText}>{phrase.en}</Text>
                          <View style={styles.phraseActionRow}>
                            <TouchableOpacity
                              style={styles.phraseActionBtn}
                              onPress={() => handlePlayAudio(phrase.es)}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name={isPlaying ? 'volume-high' : 'play'}
                                size={13}
                                color={Colors.primary}
                              />
                              <Text style={styles.phraseActionBtnText}>{isPlaying ? 'Playing' : 'Audio'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.phraseActionBtn, styles.phraseCopyBtn]}
                              onPress={() => handleCopyPhrase(phrase.es)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="copy-outline" size={13} color="#FFF" />
                              <Text style={[styles.phraseActionBtnText, { color: '#FFF' }]}>Copy</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* 2-Way Thread View Modal */}
      <ThreadViewModal
        visible={threadModalVisible}
        thread={activeThread}
        onClose={() => setThreadModalVisible(false)}
        onUpdateThread={handleUpdateThread}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  addContactBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  threadInfo: {
    flex: 1,
    marginRight: 8,
  },
  threadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.outline,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 1,
  },
  lastMsgSnippet: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.onBackground,
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    marginTop: 18,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  quickDecksSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.tertiary,
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginBottom: 12,
    lineHeight: 16,
  },
  stackedDecksWrapper: {
    marginTop: 4,
  },
  stackedDeckCard: {
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  deckHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deckIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  deckSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  deckToggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckContentList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    gap: 10,
  },
  phraseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  phraseSpanishText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.onBackground,
    fontStyle: 'italic',
  },
  phraseEnglishText: {
    fontSize: 11.5,
    color: Colors.onSurfaceVariant,
  },
  phraseActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  phraseActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  phraseActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  phraseCopyBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
