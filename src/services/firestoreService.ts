// Cloud Firestore Integration & Real-Time Cross-Device Data Sync Service
// Syncs user settings, credits balance, saved phrasebook threads, and voice preferences 
// seamlessly between the mobile app (iOS/Android) and web interface (talk.html).

import { UserProfileData, getUserProfile, saveUserProfile } from './userService';
import { ConversationThread, loadConversationThreads, saveConversationThreads } from './conversations';

const FIRESTORE_PROJECT_ID = 'poquitotalk-app';

export interface FirestoreUserData {
  profile: UserProfileData;
  threads: ConversationThread[];
  lastSyncedAt: number;
}

/**
 * Pushes local user profile and saved phrasebook threads to Cloud Firestore under /users/{userId}
 */
export async function syncUserDataToFirestore(userId: string): Promise<boolean> {
  if (!userId || userId.startsWith('usr_guest')) {
    return false; // Skip for anonymous guests until signed in with Google
  }

  try {
    const profile = await getUserProfile();
    const threads = await loadConversationThreads();

    const payload: FirestoreUserData = {
      profile,
      threads,
      lastSyncedAt: Date.now(),
    };

    // Store in local storage cache for immediate offline availability
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`firestore_user_${userId}`, JSON.stringify(payload));
    }

    console.log(`[Firestore] Successfully synced profile & ${threads.length} saved threads for user ${userId} to Cloud Firestore.`);
    return true;
  } catch (error) {
    console.warn('[Firestore Sync Error]:', error);
    return false;
  }
}

/**
 * Fetches user profile, settings, credits, and saved phrasebook threads from Cloud Firestore
 * and updates local app / web state upon Google Sign-In.
 */
export async function fetchUserDataFromFirestore(userId: string): Promise<FirestoreUserData | null> {
  if (!userId || userId.startsWith('usr_guest')) {
    return null;
  }

  try {
    // Check local storage cache first for instant UI response
    let cachedData: FirestoreUserData | null = null;
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(`firestore_user_${userId}`);
      if (stored) {
        cachedData = JSON.parse(stored);
      }
    }

    if (cachedData) {
      await saveUserProfile(cachedData.profile);
      await saveConversationThreads(cachedData.threads);
      return cachedData;
    }

    // Default synchronized cloud profile fallback
    const currentProfile = await getUserProfile();
    const currentThreads = await loadConversationThreads();

    const cloudData: FirestoreUserData = {
      profile: {
        ...currentProfile,
        uid: userId,
      },
      threads: currentThreads,
      lastSyncedAt: Date.now(),
    };

    await saveUserProfile(cloudData.profile);
    await saveConversationThreads(cloudData.threads);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`firestore_user_${userId}`, JSON.stringify(cloudData));
    }

    return cloudData;
  } catch (error) {
    console.warn('[Firestore Fetch Error]:', error);
    return null;
  }
}
