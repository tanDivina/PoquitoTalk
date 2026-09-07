import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  LayoutAnimation,
} from "react-native";
import * as Speech from "expo-speech";
import * as Clipboard from "expo-clipboard";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "../theme/colors";
import { Header } from "../components/Header";
import {
  ConversationThread,
  loadConversationThreads,
  saveConversationThreads,
  syncAllThreadsWithServer,
  subscribeToThreadUpdates,
} from "../services/conversations";
import { getCategoryUnifiedMeta } from "../services/presets";
import { ThreadViewModal } from "../components/ThreadViewModal";
import { TranslationItem } from "../types";

interface ConversationsScreenProps {
  isPro: boolean;
  onOpenPaywall: () => void;
  onOpenSaved?: () => void;
  onOpenSettings?: () => void;
  savedCount?: number;
  onResetOnboarding?: () => void;
  savedTranslations?: TranslationItem[];
  onToggleSave?: (item: TranslationItem) => void;
}

export const ConversationsScreen: React.FC<ConversationsScreenProps> = ({
  isPro,
  onOpenPaywall,
  onOpenSaved,
  onOpenSettings,
  savedCount = 0,
  onResetOnboarding,
  savedTranslations = [],
  onToggleSave,
}) => {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [threadModalVisible, setThreadModalVisible] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState<string>(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("deck");
      if (p) return p;
    }
    return "bookmarks_deck";
  });
  const [playingAudioText, setPlayingAudioText] = useState<string | null>(null);

  const handleToggleDeck = (deckId: string) => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setActiveDeckId((prev) => (prev === deckId ? "" : deckId));
  };

  const handlePlayAudio = (spanishText: string) => {
    if (playingAudioText === spanishText) {
      Speech.stop();
      setPlayingAudioText(null);
      return;
    }
    setPlayingAudioText(spanishText);
    Speech.speak(spanishText, {
      language: "es-PA",
      pitch: 0.95,
      rate: 0.88,
      onDone: () => setPlayingAudioText(null),
      onError: () => setPlayingAudioText(null),
    });
  };

  const handleCopyPhrase = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied! 📋", "Spanish phrase copied to clipboard for WhatsApp.");
  };

  useEffect(() => {
    let isMounted = true;

    const refreshThreads = async () => {
      const data = await loadConversationThreads();
      if (!isMounted) return;
      setThreads(data);
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const threadModal = params.get("threadModal");
        const targetThreadId = params.get("threadId");
        if (threadModal === "true" && data.length > 0) {
          const matched = targetThreadId ? data.find((t) => t.id === targetThreadId) : data[0];
          if (matched) {
            setActiveThread(matched);
            setThreadModalVisible(true);
          }
        }
      }
    };

    refreshThreads();

    // Initial server sync for replies from contractor web interface
    syncAllThreadsWithServer().then((res) => {
      if (res.updatedCount > 0 && isMounted) {
        refreshThreads();
      }
    });

    // 5-second polling interval
    const interval = setInterval(async () => {
      const res = await syncAllThreadsWithServer();
      if (res.updatedCount > 0 && isMounted) {
        refreshThreads();
      }
    }, 5000);

    // Event listener subscription
    const unsubscribe = subscribeToThreadUpdates(({ thread }) => {
      if (!isMounted) return;
      refreshThreads();
      setActiveThread((prev) => (prev && (prev.id === thread.id || prev.roomId === thread.roomId) ? thread : prev));
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
      unsubscribe();
    };
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Create Thread",
          onPress: (contactName) => {
            if (!contactName) return;
            const newThread: ConversationThread = {
              id: `thread_${Date.now()}`,
              contactName: contactName.trim(),
              category: "General Service",
              avatarIcon: "person-outline",
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
            const meta = getCategoryUnifiedMeta(thread.category);
            const lastMsg = thread?.messages?.length ? thread.messages[thread.messages.length - 1] : null;
            const formattedDate = thread?.lastUpdated
              ? new Date(thread.lastUpdated).toLocaleDateString([], { month: "short", day: "numeric" })
              : "";
            return (
              <TouchableOpacity
                key={thread.id}
                style={styles.threadCard}
                onPress={() => handleSelectThread(thread)}
                activeOpacity={0.7}
              >
                <View style={[styles.avatarCircle, { backgroundColor: meta.badgeBg, borderColor: meta.border, borderWidth: 1.2 }]}>
                  <Ionicons name={(meta.ioniconsName as any) || (thread?.avatarIcon as any) || "person-outline"} size={20} color={meta.color} />
                </View>

                <View style={styles.threadInfo}>
                  <View style={styles.threadHeaderRow}>
                    <Text style={styles.contactName}>{thread?.contactName || "Service Contact"}</Text>
                    <Text style={styles.timestamp}>{formattedDate}</Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                    <View style={[styles.categoryPill, { backgroundColor: meta.badgeBg, borderColor: meta.border }]}>
                      <Text style={[styles.categoryLabel, { color: meta.color }]}>{thread.category}</Text>
                    </View>
                  </View>

                  <Text style={styles.lastMsgSnippet} numberOfLines={1}>
                    {lastMsg ? lastMsg.textEnglish : "Tap to start 2-way conversation in Spanish..."}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Bookmarked & Saved Templates Section */}
      {savedTranslations.length > 0 && (
        <View style={styles.quickDecksSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="bookmark" size={14} color="#D97706" />
            <Text style={[styles.sectionHeaderTitle, { color: "#B45309" }]}>
              BOOKMARKED PHRASE TEMPLATES ({savedTranslations.length})
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Phrases bookmarked in Templates for fast 1-tap WhatsApp replies and thread selection.
          </Text>

          <View
            style={[
              styles.stackedDeckCard,
              {
                backgroundColor: "#FFFFFF",
                borderColor: activeDeckId === "bookmarks_deck" ? "#D97706" : "#E8E2D8",
                borderWidth: activeDeckId === "bookmarks_deck" ? 2 : 1.2,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.deckHeaderRow}
              onPress={() => handleToggleDeck("bookmarks_deck")}
              activeOpacity={0.8}
            >
              <View style={[styles.deckIconBubble, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="bookmark" size={17} color="#D97706" />
              </View>
              <View style={styles.deckInfo}>
                <Text style={[styles.deckTitle, { color: "#1A1208" }]}>
                  Bookmarked Phrase Templates
                </Text>
                <Text style={styles.deckSubtitle} numberOfLines={1}>
                  {savedTranslations.length} bookmarked phrase{savedTranslations.length > 1 ? "s" : ""} organized by service category
                </Text>
              </View>
              <View style={[styles.deckToggleCircle, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons
                  name={activeDeckId === "bookmarks_deck" ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#D97706"
                />
              </View>
            </TouchableOpacity>

            {activeDeckId === "bookmarks_deck" && (
              <View style={styles.deckContentList}>
                {savedTranslations.map((item, bIdx) => {
                  const meta = getCategoryUnifiedMeta(item.category);
                  const isPlaying = playingAudioText === item.outputText;
                  return (
                    <View
                      key={item.id || bIdx}
                      style={[
                        styles.phraseCard,
                        {
                          backgroundColor: "#FFFFFF",
                          borderColor: meta.border,
                          borderWidth: 1.2,
                        },
                      ]}
                    >
                      <View style={[styles.bookmarkCategoryTag, { backgroundColor: meta.badgeBg, borderColor: meta.border, borderWidth: 1 }]}>
                        <Ionicons name={meta.ioniconsName as any} size={11} color={meta.color} style={{ marginRight: 4 }} />
                        <Text style={[styles.bookmarkCategoryText, { color: meta.color }]}>
                          {(item.category || meta.category).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.phraseEnglishText}>"{item.inputText}"</Text>
                      <Text style={[styles.phraseSpanishText, { color: meta.color }]}>{item.outputText}</Text>
                      <View style={styles.phraseActionRow}>
                        <TouchableOpacity
                          style={[styles.phraseActionBtn, { backgroundColor: meta.badgeBg, borderColor: meta.border }]}
                          onPress={() => handlePlayAudio(item.outputText)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isPlaying ? "volume-high" : "play"}
                            size={13}
                            color={meta.color}
                          />
                          <Text style={[styles.phraseActionBtnText, { color: meta.color }]}>
                            {isPlaying ? "Playing" : "Audio"}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.phraseActionBtn, { backgroundColor: "#059669", borderColor: "#047857" }]}
                          onPress={() => handleCopyPhrase(item.outputText)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="copy-outline" size={13} color="#FFF" />
                          <Text style={[styles.phraseActionBtnText, { color: "#FFF" }]}>Copy</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      )}

      <ThreadViewModal
        visible={threadModalVisible}
        thread={activeThread}
        onClose={() => setThreadModalVisible(false)}
        onUpdateThread={handleUpdateThread}
        savedTranslations={savedTranslations}
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
    paddingBottom: 40,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.onBackground,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  addContactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  threadsList: {
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 10,
  },
  threadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceContainerLowest || "#FFF",
    borderRadius: 20,
    padding: 14,
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  threadInfo: {
    flex: 1,
    marginRight: 8,
  },
  threadHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.onBackground,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.outline,
  },
  categoryPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  lastMsgSnippet: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLowest || "#FFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.onBackground,
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    marginTop: 18,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFF",
  },
  quickDecksSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: "800",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  deckHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deckIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Colors.onBackground,
  },
  deckSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  deckToggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  deckContentList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
    gap: 10,
  },
  phraseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 4,
  },
  phraseEnglishText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Colors.onBackground || "#1A1208",
    lineHeight: 20,
  },
  phraseSpanishText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: Colors.onSurfaceVariant || "#5C4E3A",
    fontStyle: "italic",
    lineHeight: 17,
  },
  phraseActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  phraseActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  phraseActionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  bookmarkCategoryTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#FEF3C7",
    marginBottom: 4,
  },
  bookmarkCategoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 0.4,
  },
  phraseCopyBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
