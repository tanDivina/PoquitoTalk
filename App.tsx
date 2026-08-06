import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors } from './src/theme/colors';
import { HomeScreen } from './src/screens/HomeScreen';
import { PresetsScreen } from './src/screens/PresetsScreen';
import { SavedScreen } from './src/screens/SavedScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ConversationsScreen } from './src/screens/ConversationsScreen';
import { PaywallModal } from './src/components/PaywallModal';
import { TranslationItem } from './src/types';
import { GOOGLE_SPANISH_VOICES, VoiceOption } from './src/services/googleVoice';
import { revenueCat } from './src/services/revenuecat';

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
  const dynamicBottom = Math.max(insets.bottom + 12, Platform.OS === 'android' ? 24 : 20);

  return (
    <View style={styles.mainContainer}>
      <NavigationContainer>
        <Tab.Navigator
          id="main_tabs"
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.secondary,
            tabBarInactiveTintColor: Colors.outline,
            tabBarStyle: [styles.tabBar, { bottom: dynamicBottom }],
            tabBarItemStyle: styles.tabBarItem,
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        >
          <Tab.Screen
            name="Translate"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="chat-processing-outline" size={22} color={color} />
              ),
            }}
          >
            {(props) => (
              <HomeScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
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
            name="Threads"
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubbles-outline" size={22} color={color} />
              ),
            }}
          >
            {(props) => (
              <ConversationsScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
                onResetOnboarding={() => setShowOnboarding(true)}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Presets"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="toolbox-outline" size={22} color={color} />
              ),
            }}
          >
            {(props) => (
              <PresetsScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
                onSelectPhrasePrompt={(promptText, categoryTitle) => {
                  setActivePresetPrompt(promptText);
                  setActivePresetCategory(categoryTitle);
                  props.navigation.navigate('Translate');
                }}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Saved"
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bookmark-outline" size={22} color={color} />
              ),
            }}
          >
            {(props) => (
              <SavedScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
                savedTranslations={savedTranslations}
                onToggleSave={handleToggleSave}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Settings"
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" size={22} color={color} />
              ),
            }}
          >
            {(props) => (
              <SettingsScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
                onResetOnboarding={() => setShowOnboarding(true)}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>

      {/* RevenueCat Paywall Modal */}
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSuccess={() => setIsPro(true)}
      />
    </View>
  );
}

export default function App() {
  const [isPro, setIsPro] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true); // First-time Intake Flow
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [savedTranslations, setSavedTranslations] = useState<TranslationItem[]>([]);
  const [activePresetPrompt, setActivePresetPrompt] = useState<string | undefined>(undefined);
  const [activePresetCategory, setActivePresetCategory] = useState<string | undefined>(undefined);
  const [userName, setUserName] = useState('Expat Friend');
  const [userVoice, setUserVoice] = useState<VoiceOption>(GOOGLE_SPANISH_VOICES[0]);

  useEffect(() => {
    // Initialize RevenueCat SDK
    revenueCat.initialize().then(() => {
      revenueCat.isProSubscriber().then((status) => setIsPro(status));
    });
  }, []);

  const handleCompleteOnboarding = (name: string, voice: VoiceOption) => {
    setUserName(name);
    setUserVoice(voice);
    setShowOnboarding(false);
  };

  const handleToggleSave = (item: TranslationItem) => {
    setSavedTranslations((prev) => {
      const exists = prev.some((t) => t.inputText === item.inputText && t.outputText === item.outputText);
      if (exists) {
        return prev.filter((t) => !(t.inputText === item.inputText && t.outputText === item.outputText));
      } else {
        return [item, ...prev];
      }
    });
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent />
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 16,
    right: 16,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 32,
    height: 64,
    paddingBottom: Platform.OS === 'ios' ? 10 : 6,
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
    paddingVertical: 2,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
});
