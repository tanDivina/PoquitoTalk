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
}

const STORAGE_FILE = `${FileSystem.documentDirectory}poquitotalk_threads.json`;

export const DEFAULT_PRESET_THREADS: ConversationThread[] = [
  {
    id: 'thread_ac_carlos',
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
        personaName: 'Male',
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
        personaName: 'Mateo',
        timestamp: Date.now() - 86400000,
      },
    ],
  },
];

export async function loadConversationThreads(): Promise<ConversationThread[]> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(STORAGE_FILE);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(STORAGE_FILE);
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading threads file:', e);
  }
  return [];
}

export async function saveConversationThreads(threads: ConversationThread[]): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(threads));
  } catch (e) {
    console.warn('Error saving threads file:', e);
  }
}
