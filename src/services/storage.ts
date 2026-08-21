import * as FileSystem from 'expo-file-system/legacy';
import { PanamaTone, LocalServiceProvider } from '../types';

const SETTINGS_FILE_PATH = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}poquito_settings_v2.json`;
const CUSTOM_PROVIDERS_FILE_PATH = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}poquito_custom_providers_v1.json`;

interface AppSettingsStorage {
  globalDefaultTone: PanamaTone;
  contactTones: Record<string, PanamaTone>;
}

const DEFAULT_SETTINGS: AppSettingsStorage = {
  globalDefaultTone: 'poquito',
  contactTones: {},
};

let cachedSettings: AppSettingsStorage | null = null;
let cachedCustomProviders: LocalServiceProvider[] | null = null;

export function normalizePanamaPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const digitsOnly = rawPhone.replace(/\D/g, '');
  if (digitsOnly.startsWith('507') && digitsOnly.length === 11) {
    return digitsOnly;
  }
  if (digitsOnly.length === 8) {
    return `507${digitsOnly}`;
  }
  return digitsOnly;
}

export async function getAppSettings(): Promise<AppSettingsStorage> {
  if (cachedSettings) return cachedSettings;

  try {
    const info = await FileSystem.getInfoAsync(SETTINGS_FILE_PATH);
    if (info.exists) {
      const text = await FileSystem.readAsStringAsync(SETTINGS_FILE_PATH);
      cachedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(text) };
      return cachedSettings;
    }
  } catch (e) {
    // fallback
  }

  cachedSettings = DEFAULT_SETTINGS;
  return cachedSettings;
}

export async function saveAppSettings(settings: AppSettingsStorage): Promise<void> {
  cachedSettings = settings;
  try {
    await FileSystem.writeAsStringAsync(SETTINGS_FILE_PATH, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

export async function getGlobalDefaultTone(): Promise<PanamaTone> {
  const settings = await getAppSettings();
  return settings.globalDefaultTone || 'poquito';
}

export async function setGlobalDefaultTone(tone: PanamaTone): Promise<void> {
  const settings = await getAppSettings();
  settings.globalDefaultTone = tone;
  await saveAppSettings(settings);
}

export async function getContactTone(contactId: string): Promise<PanamaTone> {
  const settings = await getAppSettings();
  if (contactId && settings.contactTones[contactId]) {
    return settings.contactTones[contactId];
  }
  return settings.globalDefaultTone || 'poquito';
}

export async function setContactTone(contactId: string, tone: PanamaTone): Promise<void> {
  if (!contactId) return;
  const settings = await getAppSettings();
  settings.contactTones[contactId] = tone;
  await saveAppSettings(settings);
}

export async function getCustomProviders(): Promise<LocalServiceProvider[]> {
  if (cachedCustomProviders) return cachedCustomProviders;

  try {
    const info = await FileSystem.getInfoAsync(CUSTOM_PROVIDERS_FILE_PATH);
    if (info.exists) {
      const text = await FileSystem.readAsStringAsync(CUSTOM_PROVIDERS_FILE_PATH);
      cachedCustomProviders = JSON.parse(text);
      return cachedCustomProviders || [];
    }
  } catch (e) {
    // fallback
  }

  cachedCustomProviders = [];
  return [];
}

export async function saveCustomProvider(newProvider: LocalServiceProvider): Promise<LocalServiceProvider[]> {
  const existing = await getCustomProviders();
  const normalizedNew = normalizePanamaPhoneNumber(newProvider.whatsappNumber || newProvider.phoneNumber || '');

  // Check if provider with this normalized phone already exists in custom list
  const existingIdx = existing.findIndex(
    (p) => normalizePanamaPhoneNumber(p.whatsappNumber || p.phoneNumber || '') === normalizedNew
  );

  let updatedList: LocalServiceProvider[];
  if (existingIdx >= 0) {
    // Update existing record
    existing[existingIdx] = {
      ...existing[existingIdx],
      ...newProvider,
      communityNotes: [
        ...(existing[existingIdx].communityNotes || []),
        ...(newProvider.notes ? [newProvider.notes] : []),
      ],
    };
    updatedList = [...existing];
  } else {
    updatedList = [newProvider, ...existing];
  }

  cachedCustomProviders = updatedList;
  try {
    await FileSystem.writeAsStringAsync(CUSTOM_PROVIDERS_FILE_PATH, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('Failed to save custom provider:', e);
  }

  return updatedList;
}
