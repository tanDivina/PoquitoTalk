import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from './src/theme/colors';
import { HomeScreen } from './src/screens/HomeScreen';
import { PresetsScreen } from './src/screens/PresetsScreen';
import { SavedScreen } from './src/screens/SavedScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PaywallModal } from './src/components/PaywallModal';
import { revenueCat } from './src/services/revenuecat';
import { TranslationItem } from './src/types';
import { VoiceOption, GOOGLE_SPANISH_VOICES } from './src/services/googleVoice';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isPro, setIsPro] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true); // First-time Intake Flow
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [savedTranslations, setSavedTranslations] = useState<TranslationItem[]>([]);
  const [activePresetPrompt, setActivePresetPrompt] = useState<string | undefined>(undefined);
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

  if (showOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <OnboardingScreen onComplete={handleCompleteOnboarding} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <NavigationContainer>
        <Tab.Navigator
          id="mainTabs"
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: Colors.secondary,
            tabBarInactiveTintColor: Colors.outline,
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        >
          <Tab.Screen
            name="Translate"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="chat-processing-outline" size={size} color={color} />
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
                onClearPresetPrompt={() => setActivePresetPrompt(undefined)}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Presets"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="toolbox-outline" size={size} color={color} />
              ),
            }}
          >
            {(props) => (
              <PresetsScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
                onSelectPhrasePrompt={(promptText) => {
                  setActivePresetPrompt(promptText);
                  props.navigation.navigate('Translate');
                }}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Saved"
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="star-outline" size={size} color={color} />
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
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          >
            {(props) => (
              <SettingsScreen
                {...props}
                isPro={isPro}
                onOpenPaywall={() => setPaywallVisible(true)}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
