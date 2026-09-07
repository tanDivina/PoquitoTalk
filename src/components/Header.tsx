import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AnimatedParrotMascot } from './AnimatedParrotMascot';

interface HeaderProps {
  isPro?: boolean;
  onOpenPaywall: () => void;
  onOpenSaved?: () => void;
  savedCount?: number;
  onOpenSettings?: () => void;
  onResetOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isPro = false,
  onOpenPaywall,
  onOpenSaved,
  savedCount = 0,
  onOpenSettings,
  onResetOnboarding,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' 
    ? 24 
    : Math.max(insets.top + 6, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 40);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.brandContainer}>
        <AnimatedParrotMascot size={38} isAnimating={true} bubblePlacement="bottom" />
        <View style={styles.titleInfoBox}>
          <Text style={styles.title} numberOfLines={1}>
            Poquito<Text style={styles.titleTalk}>Talk</Text>
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Bocas del Toro 🇵🇦
          </Text>
        </View>
      </View>

      <View style={styles.actionsGroup}>
        {onOpenSaved && (
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={onOpenSaved}
            activeOpacity={0.75}
          >
            <Ionicons name="bookmark-outline" size={18} color={Colors.onSurface} />
            {savedCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{savedCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {onOpenSettings && (
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={onOpenSettings}
            activeOpacity={0.75}
          >
            <Ionicons name="settings-outline" size={18} color={Colors.onSurface} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    marginRight: 6,
  },
  titleInfoBox: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.2,
    flexShrink: 0,
  },
  titleTalk: {
    color: Colors.secondary, // Warm Terracotta Brown (#964824)
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.tertiary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
  },
  proPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
  },
  unlockBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
