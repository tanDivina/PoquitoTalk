import * as FileSystem from 'expo-file-system/legacy';

export interface UserTransaction {
  id: string;
  type: 'PURCHASE_APP' | 'PURCHASE_WEB' | 'REWARD_AD' | 'BONUS_FREE' | 'USAGE';
  amount: number;
  source: string;
  details: string;
  timestamp: number;
}

export interface UserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  creditsBalance: number;
  isProSubscriber: boolean;
  transactions: UserTransaction[];
}

const PROFILE_FILE_PATH = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}user_profile_v1.json`;

const INITIAL_USER_PROFILE: UserProfileData = {
  uid: 'usr_guest_bocas',
  email: 'guest@poquitotalk.com',
  creditsBalance: 5, // 5 Free Natural Voice Notes on install
  isProSubscriber: false,
  transactions: [
    {
      id: 'txn_welcome_bonus',
      type: 'BONUS_FREE',
      amount: 5,
      source: 'Welcome Bonus',
      details: '5 Free Natural-Sounding Voice Notes on app install',
      timestamp: Date.now(),
    },
  ],
};

let cachedProfile: UserProfileData | null = null;

export async function getUserProfile(): Promise<UserProfileData> {
  if (cachedProfile) return cachedProfile;

  try {
    const fileInfo = await FileSystem.getInfoAsync(PROFILE_FILE_PATH);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(PROFILE_FILE_PATH);
      cachedProfile = JSON.parse(content);
      return cachedProfile!;
    }
  } catch (error) {
    // fallback
  }

  cachedProfile = INITIAL_USER_PROFILE;
  await saveUserProfile(cachedProfile);
  return cachedProfile;
}

export async function saveUserProfile(profile: UserProfileData): Promise<void> {
  cachedProfile = profile;
  try {
    await FileSystem.writeAsStringAsync(PROFILE_FILE_PATH, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export async function addCredits(amount: number, source: string, details: string, type: UserTransaction['type'] = 'REWARD_AD'): Promise<UserProfileData> {
  const profile = await getUserProfile();
  const newTxn: UserTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    amount,
    source,
    details,
    timestamp: Date.now(),
  };

  const updatedProfile: UserProfileData = {
    ...profile,
    creditsBalance: profile.creditsBalance + amount,
    transactions: [newTxn, ...profile.transactions],
  };

  await saveUserProfile(updatedProfile);
  return updatedProfile;
}

export async function deductCreditForVoiceNote(personaName: string): Promise<{ success: boolean; profile: UserProfileData }> {
  const profile = await getUserProfile();

  if (profile.isProSubscriber) {
    // Pro subscribers have unlimited usage
    return { success: true, profile };
  }

  if (profile.creditsBalance <= 0) {
    return { success: false, profile };
  }

  const newTxn: UserTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: 'USAGE',
    amount: -1,
    source: 'Voice Note Generation',
    details: `Studio Voice Note sent using ${personaName}`,
    timestamp: Date.now(),
  };

  const updatedProfile: UserProfileData = {
    ...profile,
    creditsBalance: profile.creditsBalance - 1,
    transactions: [newTxn, ...profile.transactions],
  };

  await saveUserProfile(updatedProfile);
  return { success: true, profile: updatedProfile };
}
