import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { getCurrentGoogleUser, signInWithGoogle, signOutGoogle, GoogleAuthUser } from '../services/googleAuthService';

interface GoogleSignInButtonProps {
  onSuccess?: (user: GoogleAuthUser) => void;
  style?: object;
}

export const GoogleLogoSvg = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, style }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<GoogleAuthUser | null>(null);

  useEffect(() => {
    getCurrentGoogleUser().then((u) => setUser(u));
  }, []);

  const handlePress = async () => {
    if (user) {
      // Sign Out prompt
      Alert.alert(
        'Google Account',
        `Signed in as ${user.displayName} (${user.email})`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              await signOutGoogle();
              setUser(null);
            },
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithGoogle();
      setUser(res.user);
      if (onSuccess) onSuccess(res.user);
      Alert.alert('Signed in with Google!', `Welcome back, ${res.user.displayName}!`);
    } catch (e) {
      Alert.alert('Google Sign-In', 'Could not sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.btn, user && styles.btnSignedIn, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.onBackground} />
      ) : user ? (
        <View style={styles.userRow}>
          <GoogleLogoSvg size={18} />
          <Text style={styles.signedInText} numberOfLines={1}>
            Signed in as {user.displayName}
          </Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          <GoogleLogoSvg size={20} />
          <Text style={styles.btnText}>Continue with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    width: '100%',
  },
  btnSignedIn: {
    backgroundColor: Colors.tertiaryContainer || '#E6F4EA',
    borderColor: Colors.tertiary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3C4043',
  },
  signedInText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.tertiary,
  },
});
