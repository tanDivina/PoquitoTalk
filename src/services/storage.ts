import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { PanamaTone, LocalServiceProvider, PhoneBookContact, UserPersona, TranslationItem } from '../types';

const SETTINGS_FILE_PATH = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}poquito_settings_v2.json`;
const CUSTOM_PROVIDERS_FILE_PATH = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}poquito_custom_providers_v1.json`;
const PHONEBOOK_FILE_PATH = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}poquito_phonebook_v1.json`;
const SAVED_TRANSLATIONS_FILE_PATH = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}poquito_saved_translations_v1.json`;

let cachedSavedTranslations: TranslationItem[] | null = null;

export type PlaybackSpeed = '0.75x' | '1.0x';

interface AppSettingsStorage {
  globalDefaultTone: PanamaTone;
  contactTones: Record<string, PanamaTone>;
  playbackSpeed: PlaybackSpeed;
  userPersona?: UserPersona;
  includeAppSignature?: boolean;
  preferredVoiceGender?: 'MALE' | 'FEMALE';
}

const DEFAULT_SETTINGS: AppSettingsStorage = {
  globalDefaultTone: 'poquito',
  contactTones: {},
  playbackSpeed: '0.75x',
  userPersona: 'expat',
  includeAppSignature: true,
  preferredVoiceGender: 'MALE',
};

let cachedSettings: AppSettingsStorage | null = null;
let cachedCustomProviders: LocalServiceProvider[] | null = null;
let cachedPhoneBook: PhoneBookContact[] | null = null;

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

export async function getPlaybackSpeed(): Promise<PlaybackSpeed> {
  const settings = await getAppSettings();
  return settings.playbackSpeed || '0.75x';
}

export async function setPlaybackSpeed(speed: PlaybackSpeed): Promise<void> {
  const settings = await getAppSettings();
  settings.playbackSpeed = speed;
  await saveAppSettings(settings);
}

export async function getIncludeAppSignature(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.includeAppSignature !== false;
}

export async function setIncludeAppSignature(include: boolean): Promise<void> {
  const settings = await getAppSettings();
  settings.includeAppSignature = include;
  await saveAppSettings(settings);
}

export async function getUserPersona(): Promise<UserPersona> {
  const settings = await getAppSettings();
  return settings.userPersona || 'expat';
}

export async function setUserPersona(persona: UserPersona): Promise<void> {
  const settings = await getAppSettings();
  settings.userPersona = persona;
  await saveAppSettings(settings);
}

export async function getPreferredVoiceGender(): Promise<'MALE' | 'FEMALE'> {
  const settings = await getAppSettings();
  return settings.preferredVoiceGender || 'MALE';
}

export async function setPreferredVoiceGender(gender: 'MALE' | 'FEMALE'): Promise<void> {
  const settings = await getAppSettings();
  settings.preferredVoiceGender = gender;
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

// ==========================================
// PHONE BOOK / FAVORITES STORAGE LAYER
// ==========================================

let phoneBookPromise: Promise<PhoneBookContact[]> | null = null;

export async function getPhoneBookContacts(): Promise<PhoneBookContact[]> {
  if (cachedPhoneBook) return cachedPhoneBook;
  if (phoneBookPromise) return phoneBookPromise;

  phoneBookPromise = (async () => {
    try {
      const info = await FileSystem.getInfoAsync(PHONEBOOK_FILE_PATH);
      if (info.exists) {
        const text = await FileSystem.readAsStringAsync(PHONEBOOK_FILE_PATH);
        cachedPhoneBook = JSON.parse(text) || [];
        return cachedPhoneBook || [];
      }
    } catch (e) {
      // fallback
    } finally {
      phoneBookPromise = null;
    }

    cachedPhoneBook = [];
    return [];
  })();

  return phoneBookPromise;
}

export async function savePhoneBookContact(contact: PhoneBookContact): Promise<PhoneBookContact[]> {
  const existing = await getPhoneBookContacts();
  const normalizedNew = normalizePanamaPhoneNumber(contact.whatsappNumber || contact.phoneNumber || '');

  const existingIdx = existing.findIndex(
    (c) => c.id === contact.id || (normalizedNew && normalizePanamaPhoneNumber(c.whatsappNumber || c.phoneNumber || '') === normalizedNew)
  );

  let updatedList: PhoneBookContact[];
  if (existingIdx >= 0) {
    existing[existingIdx] = {
      ...existing[existingIdx],
      ...contact,
      normalizedPhone: normalizedNew || contact.normalizedPhone,
    };
    updatedList = [...existing];
  } else {
    updatedList = [
      {
        ...contact,
        normalizedPhone: normalizedNew || contact.normalizedPhone,
        createdAt: contact.createdAt || Date.now(),
      },
      ...existing,
    ];
  }

  cachedPhoneBook = updatedList;
  try {
    await FileSystem.writeAsStringAsync(PHONEBOOK_FILE_PATH, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('Failed to save phone book contact:', e);
  }

  return updatedList;
}

export async function deletePhoneBookContact(contactId: string): Promise<PhoneBookContact[]> {
  const existing = await getPhoneBookContacts();
  const updatedList = existing.filter((c) => c.id !== contactId && c.directoryProviderId !== contactId);

  cachedPhoneBook = updatedList;
  try {
    await FileSystem.writeAsStringAsync(PHONEBOOK_FILE_PATH, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('Failed to delete phone book contact:', e);
  }

  return updatedList;
}

export async function toggleFavoriteContact(contactId: string): Promise<PhoneBookContact[]> {
  const existing = await getPhoneBookContacts();
  const updatedList = existing.map((c) => {
    if (c.id === contactId || c.directoryProviderId === contactId) {
      return { ...c, isFavorite: !c.isFavorite };
    }
    return c;
  });

  cachedPhoneBook = updatedList;
  try {
    await FileSystem.writeAsStringAsync(PHONEBOOK_FILE_PATH, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('Failed to toggle favorite contact:', e);
  }

  return updatedList;
}

export async function recordRecentContact(contactId: string): Promise<void> {
  const existing = await getPhoneBookContacts();
  const updatedList = existing.map((c) => {
    if (c.id === contactId || c.directoryProviderId === contactId) {
      return { ...c, lastContactedAt: Date.now() };
    }
    return c;
  });

  cachedPhoneBook = updatedList;
  try {
    await FileSystem.writeAsStringAsync(PHONEBOOK_FILE_PATH, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('Failed to record recent contact:', e);
  }
}

export async function syncDirectoryFavorite(
  provider: LocalServiceProvider,
  isFavorite: boolean
): Promise<PhoneBookContact[]> {
  const existing = await getPhoneBookContacts();
  const normalized = normalizePanamaPhoneNumber(provider.whatsappNumber || provider.phoneNumber || '');

  if (isFavorite) {
    const alreadySaved = existing.find(
      (c) => c.directoryProviderId === provider.id || (normalized && c.normalizedPhone === normalized)
    );

    if (alreadySaved) {
      return toggleFavoriteContact(alreadySaved.id);
    }

    const newContact: PhoneBookContact = {
      id: `fav_${provider.id}_${Date.now()}`,
      name: provider.name,
      whatsappNumber: provider.whatsappNumber || provider.phoneNumber || '',
      phoneNumber: provider.phoneNumber,
      normalizedPhone: normalized,
      category: provider.category || 'Directory Provider',
      isFavorite: true,
      notes: provider.notes,
      isVerifiedDirectory: true,
      directoryProviderId: provider.id,
      createdAt: Date.now(),
    };

    return savePhoneBookContact(newContact);
  } else {
    // Remove or unfavorite
    const target = existing.find(
      (c) => c.directoryProviderId === provider.id || (normalized && c.normalizedPhone === normalized)
    );
    if (target) {
      return deletePhoneBookContact(target.id);
    }
    return existing;
  }
}

// ==========================================
// SAVED / BOOKMARKED TRANSLATIONS STORAGE LAYER
// ==========================================

export async function getSavedTranslations(): Promise<TranslationItem[]> {
  if (cachedSavedTranslations) return cachedSavedTranslations;

  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('poquito_saved_translations_v1');
      if (raw) {
        cachedSavedTranslations = JSON.parse(raw) || [];
        return cachedSavedTranslations || [];
      }
    } catch (e) {
      // fallback
    }
  }

  try {
    const info = await FileSystem.getInfoAsync(SAVED_TRANSLATIONS_FILE_PATH);
    if (info.exists) {
      const text = await FileSystem.readAsStringAsync(SAVED_TRANSLATIONS_FILE_PATH);
      cachedSavedTranslations = JSON.parse(text) || [];
      return cachedSavedTranslations || [];
    }
  } catch (e) {
    // fallback
  }

  cachedSavedTranslations = [];
  return [];
}

export async function saveSavedTranslations(list: TranslationItem[]): Promise<TranslationItem[]> {
  cachedSavedTranslations = list;
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('poquito_saved_translations_v1', JSON.stringify(list));
    } catch (e) {
      // fallback
    }
  }
  try {
    await FileSystem.writeAsStringAsync(SAVED_TRANSLATIONS_FILE_PATH, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save saved translations:', e);
  }
  return list;
}

export async function toggleSavedTranslationItem(item: TranslationItem): Promise<TranslationItem[]> {
  const current = await getSavedTranslations();
  const exists = current.some(
    (t) => (item.id && t.id === item.id) || (t.inputText === item.inputText && t.outputText === item.outputText)
  );

  let updated: TranslationItem[];
  if (exists) {
    updated = current.filter(
      (t) => !( (item.id && t.id === item.id) || (t.inputText === item.inputText && t.outputText === item.outputText) )
    );
  } else {
    updated = [{ ...item, isSaved: true, timestamp: Date.now() }, ...current];
  }

  return saveSavedTranslations(updated);
}
