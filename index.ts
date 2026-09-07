import { registerRootComponent } from 'expo';

import App from './App';

import { LogBox } from 'react-native';

// Suppress known development/preview warnings in Expo Go
LogBox.ignoreLogs([
  'RevenueCat',
  '[RevenueCat]',
  'setLayoutAnimationEnabledExperimental',
  'Require cycle:',
  'Expo Go app detected',
  'Cannot connect to Expo CLI',
  'Method getContactsAsync imported from "expo-contacts" is deprecated',
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
