import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform, Linking, Alert, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets, initialWindowMetrics } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors } from './src/theme/colors';
import { HomeScreen } from './src/screens/HomeScreen';
import { PresetsScreen } from './src/screens/PresetsScreen';
import { ConversationsScreen } from './src/screens/ConversationsScreen';
import { DirectoryScreen } from './src/screens/DirectoryScreen';
import { PhoneBookScreen } from './src/screens/PhoneBookScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { PaywallModal } from './src/components/PaywallModal';
import { PaidUserOnboardingModal } from './src/components/PaidUserOnboardingModal';
import { SavedTranslationsModal } from './src/components/SavedTranslationsModal';
import { SettingsModal } from './src/components/SettingsModal';
import { RestorePurchasesModal } from './src/components/RestorePurchasesModal';
import { ClaimCelebrationModal } from './src/components/ClaimCelebrationModal';
import { TranslationItem, UserPersona } from './src/types';
import { GOOGLE_SPANISH_VOICES, VoiceOption } from './src/services/googleVoice';
import { getUserPersona, setUserPersona, getSavedTranslations, toggleSavedTranslationItem } from './src/services/storage';
import {
  loadConversationThreads,
  syncAllThreadsWithServer,
  subscribeToThreadUpdates,
} from './src/services/conversations';
import { revenueCat } from './src/services/revenuecat';
import { layersService } from './src/services/layersService';
import { handleIncomingClaimDeepLink } from './src/services/deepLinks';
import { walkieTalkieService } from './src/services/walkieTalkie';

const Tab = createBottomTabNavigator();

function MainAppTabs({
  isPro,
  setPaywallVisible,
  savedTranslations,
  handleToggleSave,
  activePresetPrompt,
  setActivePresetPrompt,
  activePresetCategory,
  setActivePresetCategory,
  userVoice,
  setShowOnboarding,
  paywallVisible,
  setIsPro,
}: any) {
  const insets = useSafeAreaInsets();
  const dynamicBottom = Platform.select({
    ios: Math.max(insets.bottom + 8, 20),
    android: Math.max(insets.bottom > 0 ? insets.bottom + 12 : 48, 44),
    default: 20,
  });

  const [savedModalVisible, setSavedModalVisible] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('saved') === 'true';
    }
    return false;
  });
  const [settingsModalVisible, setSettingsModalVisible] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('settings') === 'true';
    }
    return false;
  });
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [paidOnboardingDetails, setPaidOnboardingDetails] = useState<{
    visible: boolean;
    packageName: string;
    isTrial: boolean;
  }>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('paidOnboarding');
      if (p === 'true') {
        return {
          visible: true,
          packageName: 'Annual Explorer Pass',
          isTrial: true,
        };
      }
    }
    return {
      visible: false,
      packageName: 'Annual Explorer Pass',
      isTrial: true,
    };
  });
  const [totalUnreadThreads, setTotalUnreadThreads] = useState(0);
  const [incomingNotification, setIncomingNotification] = useState<{
    threadId: string;
    contactName: string;
    messageText: string;
  } | null>(null);

  const navigationRef = useNavigationContainerRef();

  // Background thread sync and reactive notifications
  useEffect(() => {
    let isMounted = true;
    const updateUnread = async () => {
      const threads = await loadConversationThreads();
      if (!isMounted) return;
      const count = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
      setTotalUnreadThreads(count);
    };

    updateUnread();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      (window as any).__openSettings = () => setSettingsModalVisible(true);
      (window as any).__closeSettings = () => setSettingsModalVisible(false);
      (window as any).__openPaidOnboarding = () =>
        setPaidOnboardingDetails({
          visible: true,
          packageName: 'Annual Explorer Pass',
          isTrial: true,
        });
      (window as any).__closePaidOnboarding = () =>
        setPaidOnboardingDetails((prev) => ({ ...prev, visible: false }));
    }

    const pollInterval = setInterval(async () => {
      const res = await syncAllThreadsWithServer();
      if (res.updatedCount > 0 && isMounted) {
        updateUnread();
      }
    }, 6000);

    const unsub = subscribeToThreadUpdates(({ thread, isIncomingReply, newMessage }) => {
      if (!isMounted) return;
      updateUnread();
      if (isIncomingReply && newMessage) {
        setIncomingNotification({
          threadId: thread.id,
          contactName: thread.contactName,
          messageText: newMessage.textEnglish || newMessage.textSpanish || 'New message received',
        });
      }
    });

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      unsub();
    };
  }, []);

  // Auto-dismiss banner toast after 6 seconds
  useEffect(() => {
    if (!incomingNotification) return;
    const timer = setTimeout(() => {
      setIncomingNotification(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [incomingNotification]);

  const initialTab =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('tab') || 'Translate'
      : 'Translate';

  return (
    <View style={styles.mainContainer}>
      <NavigationContainer ref={navigationRef}>
        <Tab.Navigator
          id="main_tabs"
          initialRouteName={initialTab}
          screenListeners={({ navigation, route }: any) => ({
            tabPress: (e: any) => {
              const activeSession = walkieTalkieService.getActiveSession();
              if (!activeSession) return;

              e.preventDefault();

              const tabDestinations: Record<string, string> = {
                Translate: 'the main menu',
                Presets: 'Templates',
                Conversations: 'Threads',
                Directory: 'the Directory',
                PhoneBook: 'the Phone Book',
              };

              const destination = tabDestinations[route.name] || route.name;

              if (route.name === 'Translate') {
                Alert.alert(
                  'Exit Walkie Channel?',
                  'Do you want to return to the main menu?',
                  [
                    { text: 'Stay in Channel', style: 'cancel' },
                    {
                      text: 'Return to Menu',
                      style: 'destructive',
                      onPress: () => {
                        walkieTalkieService.closeSession();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Exit Walkie Channel?',
                  `Do you want to exit the channel and go to ${destination}?`,
                  [
                    { text: 'Stay in Channel', style: 'cancel' },
                    {
                      text: `Go to ${destination}`,
                      style: 'destructive',
                      onPress: () => {
                        walkieTalkieService.closeSession();
                        navigation.navigate(route.name);
                      },
                    },
                  ]
                );
              }
            },
          })}
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#964824',
            tabBarInactiveTintColor: '#8A7D70',
            tabBarStyle: [styles.tabBar, { bottom: dynamicBottom }],
            tabBarItemStyle: styles.tabBarItem,
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        >
          <Tab.Screen
            name="Translate"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="chat-processing-outline" size={24} color={color} />
              ),
            }}
          >
            {(props) => (
              <HomeScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
                onOpenSaved={() => setSavedModalVisible(true)}
                onOpenSettings={() => setSettingsModalVisible(true)}
                savedTranslations={savedTranslations}
                onToggleSave={handleToggleSave}
                activePresetPrompt={activePresetPrompt}
                activePresetCategory={activePresetCategory}
                onClearPresetPrompt={() => {
                  setActivePresetPrompt(undefined);
                  setActivePresetCategory(undefined);
                }}
                initialVoice={userVoice}
                onResetOnboarding={() => setShowOnboarding(true)}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Presets"
            options={{
              tabBarLabel: 'Templates',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cards-outline" size={24} color={color} />
              ),
            }}
          >
            {(props) => (
              <PresetsScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
                onOpenSaved={() => setSavedModalVisible(true)}
                onOpenSettings={() => setSettingsModalVisible(true)}
                savedCount={savedTranslations.length}
                savedTranslations={savedTranslations}
                onToggleSave={handleToggleSave}
                onSelectPhrasePrompt={(promptText, categoryTitle) => {
                  setActivePresetPrompt(promptText);
                  setActivePresetCategory(categoryTitle);
                  props.navigation.navigate('Translate');
                }}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Conversations"
            options={{
              tabBarLabel: 'Threads',
              tabBarBadge: totalUnreadThreads > 0 ? totalUnreadThreads : undefined,
              tabBarBadgeStyle: {
                backgroundColor: Colors.secondary,
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: '700',
              },
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubbles-outline" size={23} color={color} />
              ),
            }}
          >
            {(props) => (
              <ConversationsScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
                onOpenSaved={() => setSavedModalVisible(true)}
                onOpenSettings={() => setSettingsModalVisible(true)}
                savedCount={savedTranslations.length}
                savedTranslations={savedTranslations}
                onToggleSave={handleToggleSave}
                onResetOnboarding={() => setShowOnboarding(true)}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Directory"
            options={{
              tabBarLabel: 'Directory',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people" size={24} color={color} />
              ),
            }}
          >
            {(props) => (
              <DirectoryScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
                onOpenSaved={() => setSavedModalVisible(true)}
                onOpenSettings={() => setSettingsModalVisible(true)}
                savedCount={savedTranslations.length}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="PhoneBook"
            options={{
              tabBarLabel: 'Phone Book',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="book" size={22} color={color} />
              ),
            }}
          >
            {(props) => (
              <PhoneBookScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
                onOpenSaved={() => setSavedModalVisible(true)}
                onOpenSettings={() => setSettingsModalVisible(true)}
                savedCount={savedTranslations.length}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>

      {/* Header-Triggered Modals */}
      <SavedTranslationsModal
        visible={savedModalVisible}
        onClose={() => setSavedModalVisible(false)}
        savedTranslations={savedTranslations}
        onToggleSave={handleToggleSave}
      />

      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        isPro={isPro}
        onOpenPaywall={() => {
          setSettingsModalVisible(false);
          setTimeout(() => setPaywallVisible(true), 250);
        }}
        onOpenPaidOnboarding={() => {
          setSettingsModalVisible(false);
          setTimeout(() => {
            setPaidOnboardingDetails({
              visible: true,
              packageName: 'Annual Explorer Pass',
              isTrial: true,
            });
          }, 250);
        }}
        onOpenRestore={() => {
          setSettingsModalVisible(false);
          setTimeout(() => setRestoreModalVisible(true), 250);
        }}
        onResetOnboarding={() => {
          setSettingsModalVisible(false);
          setShowOnboarding(true);
        }}
      />

      {/* RevenueCat Paywall Modal */}
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSuccess={(details) => {
          setIsPro(true);
          setPaywallVisible(false);
          layersService.track('purchase_success', {
            product_id: details?.packageName || 'Annual Explorer Pass',
            is_trial: details?.isTrial ?? true,
          });
          setPaidOnboardingDetails({
            visible: true,
            packageName: details?.packageName || 'Annual Explorer Pass',
            isTrial: details?.isTrial ?? true,
          });
        }}
        onOpenRestore={() => {
          setPaywallVisible(false);
          setTimeout(() => setRestoreModalVisible(true), 250);
        }}
      />

      {/* Post-Purchase Value & Activation Modal (RevenueCat App Aftercare) */}
      <PaidUserOnboardingModal
        visible={paidOnboardingDetails.visible}
        onClose={() => setPaidOnboardingDetails((prev) => ({ ...prev, visible: false }))}
        planName={paidOnboardingDetails.packageName}
        isTrial={paidOnboardingDetails.isTrial}
        onStartAction={() => {
          setActivePresetPrompt('¡Buenas! ¿A qué hora sale la lancha para Isla Colón?');
          setActivePresetCategory('Boat Captains & Water Taxis');
          if (navigationRef.isReady()) {
            (navigationRef as any).navigate('Translate');
          }
        }}
      />

      {/* Animated Restore Purchases Modal */}
      <RestorePurchasesModal
        visible={restoreModalVisible}
        onClose={() => setRestoreModalVisible(false)}
        onSuccess={() => {
          setIsPro(true);
        }}
        onOpenPaywall={() => {
          setRestoreModalVisible(false);
          setTimeout(() => setPaywallVisible(true), 250);
        }}
      />

      {/* In-App Reply Toast Notification */}
      {incomingNotification && (
        <TouchableOpacity
          style={[styles.toastBanner, { top: insets.top + 8 }]}
          activeOpacity={0.9}
          onPress={() => {
            setIncomingNotification(null);
            if (navigationRef.isReady()) {
              (navigationRef as any).navigate('Conversations');
            }
          }}
        >
          <View style={styles.toastIconCircle}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.toastTextContainer}>
            <View style={styles.toastHeaderRow}>
              <Text style={styles.toastTitle} numberOfLines={1}>
                Reply from {incomingNotification.contactName}
              </Text>
              <Text style={styles.toastActionText}>View</Text>
            </View>
            <Text style={styles.toastSnippet} numberOfLines={2}>
              "{incomingNotification.messageText}"
            </Text>
          </View>
          <TouchableOpacity
            style={styles.toastCloseBtn}
            onPress={() => setIncomingNotification(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={16} color="#71717A" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function App() {
  const [isPro, setIsPro] = useState(false);
  const [isSplashComplete, setIsSplashComplete] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('splash');
      if (param === 'false') return true;
    }
    return false;
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('onboarding');
      if (param === 'false' || new URLSearchParams(window.location.search).has('tab')) {
        return false;
      }
    }
    return true;
  }); // First-time Intake Flow
  const [paywallVisible, setPaywallVisible] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('paywall');
      return p === 'true' || p === 'original' || p === '1';
    }
    return false;
  });
  const [savedTranslations, setSavedTranslations] = useState<TranslationItem[]>([]);
  const [activePresetPrompt, setActivePresetPrompt] = useState<string | undefined>(undefined);
  const [activePresetCategory, setActivePresetCategory] = useState<string | undefined>(undefined);
  const [userName, setUserName] = useState('Expat Friend');
  const [userVoice, setUserVoice] = useState<VoiceOption>(GOOGLE_SPANISH_VOICES[0]);
  const [userPersona, setUserPersonaState] = useState<UserPersona>('expat');
  const [claimCelebration, setClaimCelebration] = useState<{
    visible: boolean;
    packageName?: string;
    creditsGranted?: number;
    isPro?: boolean;
  }>({ visible: false });

  useEffect(() => {
    // Load saved persona
    getUserPersona().then((p) => setUserPersonaState(p));

    // Load saved / bookmarked translations
    getSavedTranslations().then((saved) => {
      if (saved && saved.length > 0) {
        setSavedTranslations(saved);
      }
    });

    // Initialize RevenueCat SDK
    revenueCat.initialize().then(() => {
      revenueCat.isProSubscriber().then((status) => setIsPro(status));
    });

    // Initialize Layers Growth SDK
    layersService.init();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      (window as any).__openPaywall = () => setPaywallVisible(true);
      (window as any).__closePaywall = () => setPaywallVisible(false);
    }

    // Deep Link Claim Listener
    const processDeepLink = async (url: string | null) => {
      if (!url) return;
      const result = await handleIncomingClaimDeepLink(url);
      if (result && result.success) {
        if (result.isPro) setIsPro(true);
        setClaimCelebration({
          visible: true,
          packageName: result.packageName,
          creditsGranted: result.creditsGranted,
          isPro: result.isPro,
        });
      }
    };

    // Check initial launch URL
    Linking.getInitialURL().then(processDeepLink);

    // Listen for incoming URLs while running
    const subscription = Linking.addEventListener('url', (event) => {
      processDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleCompleteOnboarding = (name: string, voice: VoiceOption, persona: UserPersona) => {
    setUserName(name);
    setUserVoice(voice);
    setUserPersonaState(persona);
    setUserPersona(persona);
    setShowOnboarding(false);
  };

  const handleToggleSave = async (item: TranslationItem) => {
    const updated = await toggleSavedTranslationItem(item);
    setSavedTranslations(updated);
  };

  const handleSplashFinish = useCallback(() => {
    setIsSplashComplete(true);
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics} style={styles.mainContainer}>
      <StatusBar style="dark" />
      {showOnboarding ? (
        <OnboardingScreen onComplete={handleCompleteOnboarding} />
      ) : (
        <MainAppTabs
          isPro={isPro}
          setPaywallVisible={setPaywallVisible}
          savedTranslations={savedTranslations}
          handleToggleSave={handleToggleSave}
          activePresetPrompt={activePresetPrompt}
          setActivePresetPrompt={setActivePresetPrompt}
          activePresetCategory={activePresetCategory}
          setActivePresetCategory={setActivePresetCategory}
          userVoice={userVoice}
          setShowOnboarding={setShowOnboarding}
          paywallVisible={paywallVisible}
          setIsPro={setIsPro}
        />
      )}

      {/* Animated Brand Splash Screen */}
      {!isSplashComplete && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}

      {/* Web-to-App Claim Celebration Modal */}
      <ClaimCelebrationModal
        visible={claimCelebration.visible}
        onClose={() => setClaimCelebration((prev) => ({ ...prev, visible: false }))}
        packageName={claimCelebration.packageName}
        creditsGranted={claimCelebration.creditsGranted}
        isPro={claimCelebration.isPro}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 22,
    left: 10,
    right: 10,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 32,
    height: Platform.OS === 'ios' ? 72 : 68,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    paddingTop: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  tabBarItem: {
    paddingVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
  },
  toastBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(150, 72, 36, 0.20)',
  },
  toastIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  toastTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  toastHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  toastTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1A1208',
    flex: 1,
    marginRight: 6,
  },
  toastActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  toastSnippet: {
    fontSize: 12.5,
    color: '#5C4E3A',
    lineHeight: 16,
  },
  toastCloseBtn: {
    padding: 4,
    flexShrink: 0,
  },
});
