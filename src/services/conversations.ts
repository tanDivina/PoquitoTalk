// Conversation Threads Storage & Management Service
// Manages 2-way persistent chat threads per service contact (Plumber, Landlord, Boat Captain)

import * as FileSystem from 'expo-file-system/legacy';

export interface ThreadMessage {
  id: string;
  sender: 'EXPAT' | 'SERVICE_PROVIDER';
  textEnglish: string;
  textSpanish: string;
  audioUri?: string;
  personaName?: string;
  timestamp: number;
}

export interface ConversationThread {
  id: string;
  contactName: string; // e.g., "Carlos (A/C Technician)", "Captain Juan (Water Taxi)"
  category: string;    // e.g., "A/C Repair", "Boating", "Starlink", "Plumbing"
  avatarIcon: string;  // e.g., "snowflake-outline", "boat-outline", "flash-outline"
  lastUpdated: number;
  messages: ThreadMessage[];
  roomId?: string;
  whatsappNumber?: string;
  unreadCount?: number;
}

function getStorageFilePath(): string {
  let base = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
  if (base && !base.endsWith('/')) {
    base += '/';
  }
  return `${base}poquitotalk_threads.json`;
}

export const DEFAULT_PRESET_THREADS: ConversationThread[] = [
  {
    id: 'thread_ac_carlos',
    roomId: 'room_ac_carlos',
    contactName: 'Carlos (A/C Repair)',
    category: 'A/C Repair',
    avatarIcon: 'snow-outline',
    lastUpdated: Date.now() - 3600000,
    messages: [
      {
        id: 'msg_1',
        sender: 'EXPAT',
        textEnglish: 'Hi Carlos! My air conditioning unit in the main bedroom is leaking water inside.',
        textSpanish: '¡Buenas Carlos! El aire acondicionado en la recámara principal está goteando agua por dentro. ¿Cuándo podría revisarlo?',
        personaName: 'Diego',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'msg_2',
        sender: 'SERVICE_PROVIDER',
        textEnglish: 'Hello! I can drop by today at 3:00 PM. Please confirm your location on Isla Colón.',
        textSpanish: '¡Buenas! Puedo pasar a revisar el aire hoy a las 3:00 PM. ¿Me confirma su ubicación en Isla Colón?',
        timestamp: Date.now() - 1800000,
      },
    ],
  },
  {
    id: 'thread_boat_juan',
    roomId: 'room_boat_juan',
    contactName: 'Captain Juan (Water Taxi)',
    category: 'Boat / Water Taxi',
    avatarIcon: 'boat-outline',
    lastUpdated: Date.now() - 86400000,
    messages: [
      {
        id: 'msg_3',
        sender: 'EXPAT',
        textEnglish: 'Hello Captain Juan! What time is your first boat leaving from Isla Carenero tomorrow morning?',
        textSpanish: '¡Buenas Capitán Juan! ¿A qué hora sale su primera lancha desde Isla Carenero mañana en la mañana?',
        personaName: 'Diego',
        timestamp: Date.now() - 86400000,
      },
    ],
  },
];

let cachedThreads: ConversationThread[] | null = null;
type ThreadUpdateListener = (event: { thread: ConversationThread; newMessage?: ThreadMessage; isIncomingReply?: boolean }) => void;
const listeners = new Set<ThreadUpdateListener>();

export function subscribeToThreadUpdates(listener: ThreadUpdateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyThreadListeners(thread: ConversationThread, newMessage?: ThreadMessage, isIncomingReply: boolean = false) {
  listeners.forEach(fn => {
    try {
      fn({ thread, newMessage, isIncomingReply });
    } catch (e) {
      console.warn('Listener error in thread updates:', e);
    }
  });
}

export function cleanRoomId(raw: string): string {
  const clean = raw.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return clean ? `room_${clean}` : `room_${Math.floor(Date.now() / 1000)}`;
}

export async function loadConversationThreads(): Promise<ConversationThread[]> {
  if (cachedThreads && cachedThreads.length > 0) {
    return cachedThreads;
  }

  const filePath = getStorageFilePath();
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(filePath);
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedThreads = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading threads file:', e);
  }
  cachedThreads = DEFAULT_PRESET_THREADS;
  return DEFAULT_PRESET_THREADS;
}

export async function saveConversationThreads(threads: ConversationThread[]): Promise<void> {
  cachedThreads = threads;
  const filePath = getStorageFilePath();
  try {
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(threads));
  } catch (e) {
    console.warn('Error saving threads file:', e);
  }
}

export interface ContactThreadParams {
  id?: string;
  name: string;
  category?: string;
  whatsappNumber?: string;
  avatarIcon?: string;
}

/**
 * Finds or creates a persistent conversation thread for a given contact or directory provider
 */
export async function getOrCreateThreadForContact(contact: ContactThreadParams): Promise<ConversationThread> {
  const threads = await loadConversationThreads();
  const cleanPhone = (contact.whatsappNumber || '').replace(/[^0-9]/g, '');
  const cleanName = (contact.name || '').trim().toLowerCase();

  // Try to find existing thread by phone or name match
  let existingIndex = threads.findIndex(t => {
    if (cleanPhone && t.whatsappNumber) {
      const existingPhone = t.whatsappNumber.replace(/[^0-9]/g, '');
      if (existingPhone && (existingPhone === cleanPhone || existingPhone.endsWith(cleanPhone) || cleanPhone.endsWith(existingPhone))) {
        return true;
      }
    }
    if (cleanName && t.contactName.toLowerCase() === cleanName) {
      return true;
    }
    if (contact.id && t.id === contact.id) {
      return true;
    }
    return false;
  });

  if (existingIndex >= 0) {
    const existing = threads[existingIndex];
    if (!existing.roomId) {
      existing.roomId = cleanRoomId(existing.contactName || existing.id);
    }
    if (!existing.whatsappNumber && contact.whatsappNumber) {
      existing.whatsappNumber = contact.whatsappNumber;
    }
    await saveConversationThreads(threads);
    return existing;
  }

  // Create new thread
  const newThreadId = `thread_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const deterministicRoomId = cleanRoomId(contact.name || contact.id || `contact_${Date.now()}`);

  const newThread: ConversationThread = {
    id: newThreadId,
    roomId: deterministicRoomId,
    contactName: contact.name || 'Local Provider',
    category: contact.category || 'Local Service',
    avatarIcon: contact.avatarIcon || 'chatbubble-outline',
    whatsappNumber: contact.whatsappNumber,
    lastUpdated: Date.now(),
    messages: [],
  };

  threads.unshift(newThread);
  await saveConversationThreads(threads);
  notifyThreadListeners(newThread);
  return newThread;
}

/**
 * Appends a message to a thread and saves
 */
export async function addMessageToThread(
  threadId: string,
  message: Omit<ThreadMessage, 'id'> & { id?: string }
): Promise<ConversationThread | null> {
  const threads = await loadConversationThreads();
  const threadIndex = threads.findIndex(t => t.id === threadId || t.roomId === threadId);
  if (threadIndex < 0) return null;

  const targetThread = threads[threadIndex];
  const fullMessage: ThreadMessage = {
    ...message,
    id: message.id || `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: message.timestamp || Date.now(),
  };

  targetThread.messages.push(fullMessage);
  targetThread.lastUpdated = fullMessage.timestamp;

  // Move thread to top of list
  threads.splice(threadIndex, 1);
  threads.unshift(targetThread);

  await saveConversationThreads(threads);
  notifyThreadListeners(targetThread, fullMessage, message.sender === 'SERVICE_PROVIDER');
  return targetThread;
}

/**
 * Synchronizes all conversation threads with walkie.php on the server.
 * Fetches replies sent by contractors from listen.html or live walkie rooms.
 */
export async function syncAllThreadsWithServer(): Promise<{
  updatedCount: number;
  newReplies: Array<{ thread: ConversationThread; message: ThreadMessage }>;
}> {
  const threads = await loadConversationThreads();
  const newReplies: Array<{ thread: ConversationThread; message: ThreadMessage }> = [];
  let hasModifications = false;

  for (const thread of threads) {
    const roomId = thread.roomId || cleanRoomId(thread.contactName || thread.id);
    if (!roomId) continue;

    try {
      const url = `https://poquitotalk.hero-apps.com/api/walkie.php?action=poll&room=${encodeURIComponent(roomId)}`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      if (!data || !data.success || !Array.isArray(data.messages)) continue;

      const serverMessages = data.messages;
      for (const sMsg of serverMessages) {
        // We only pull contractor replies here (expat messages are already added locally upon dispatch)
        if (sMsg.sender === 'contractor') {
          const sTimestamp = sMsg.timestamp || Date.now();
          const sTextEs = sMsg.esText || '';
          const sTextEn = sMsg.enText || sTextEs;
          const sAudio = sMsg.audioUrl || undefined;

          // Check if message is already recorded in thread
          const alreadyExists = thread.messages.some(m => 
            (sMsg.id && m.id === sMsg.id) ||
            (Math.abs(m.timestamp - sTimestamp) < 3000 && m.textSpanish === sTextEs)
          );

          if (!alreadyExists) {
            const newMsg: ThreadMessage = {
              id: sMsg.id || `msg_contractor_${sTimestamp}`,
              sender: 'SERVICE_PROVIDER',
              textEnglish: sTextEn,
              textSpanish: sTextEs,
              audioUri: sAudio,
              personaName: sMsg.senderName || thread.contactName,
              timestamp: sTimestamp,
            };

            thread.messages.push(newMsg);
            thread.lastUpdated = Math.max(thread.lastUpdated, sTimestamp);
            thread.unreadCount = (thread.unreadCount || 0) + 1;
            newReplies.push({ thread, message: newMsg });
            hasModifications = true;
            notifyThreadListeners(thread, newMsg, true);
          }
        }
      }
    } catch (e) {
      // Server poll error, continue to next thread
    }
  }

  if (hasModifications) {
    // Sort threads by most recently updated
    threads.sort((a, b) => b.lastUpdated - a.lastUpdated);
    await saveConversationThreads(threads);
  }

  return {
    updatedCount: newReplies.length,
    newReplies,
  };
}
