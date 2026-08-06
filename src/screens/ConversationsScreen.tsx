import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
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
  onResetOnboarding?: () => void;
}

export const ConversationsScreen: React.FC<ConversationsScreenProps> = ({
  isPro,
  onOpenPaywall,
  onResetOnboarding,
}) => {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [threadModalVisible, setThreadModalVisible] = useState(false);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header isPro={isPro} onOpenPaywall={onOpenPaywall} onResetOnboarding={onResetOnboarding} />

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
});
