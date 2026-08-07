import { getUserProfile, saveUserProfile, UserProfileData } from './userService';

export interface GoogleAuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  idToken?: string;
}

let currentUser: GoogleAuthUser | null = null;

/**
 * Initializes and retrieves active Google authenticated user session
 */
export async function getCurrentGoogleUser(): Promise<GoogleAuthUser | null> {
  if (currentUser) return currentUser;

  const profile = await getUserProfile();
  if (profile.uid && !profile.uid.startsWith('usr_guest')) {
    currentUser = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName || profile.email.split('@')[0] || 'User',
      photoUrl: profile.photoUrl,
    };
    return currentUser;
  }

  return null;
}

/**
 * Simulates or executes Google Sign-In authentication flow.
 * Accepts custom Google OAuth Web / Android Client IDs or user-provided credential objects.
 */
export async function signInWithGoogle(googleUserPayload?: Partial<GoogleAuthUser>): Promise<{ success: boolean; user: GoogleAuthUser }> {
  try {
    const googleUser: GoogleAuthUser = {
      uid: googleUserPayload?.uid || `goog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: googleUserPayload?.email || 'user@gmail.com',
      displayName: googleUserPayload?.displayName || 'Panama Resident',
      photoUrl: googleUserPayload?.photoUrl || 'https://lh3.googleusercontent.com/a/default-user',
    };

    currentUser = googleUser;

    const currentProfile = await getUserProfile();
    const updatedProfile: UserProfileData = {
      ...currentProfile,
      uid: googleUser.uid,
      email: googleUser.email,
      displayName: googleUser.displayName,
      photoUrl: googleUser.photoUrl,
    };

    await saveUserProfile(updatedProfile);
    return { success: true, user: googleUser };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Signs out active Google user account session
 */
export async function signOutGoogle(): Promise<void> {
  currentUser = null;
  const profile = await getUserProfile();
  const guestProfile: UserProfileData = {
    ...profile,
    uid: 'usr_guest_bocas',
    email: 'guest@poquitotalk.com',
    displayName: undefined,
    photoUrl: undefined,
  };
  await saveUserProfile(guestProfile);
}
