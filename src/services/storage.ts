import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { PanamaTone, LocalServiceProvider, PhoneBookContact, UserPersona, TranslationItem } from '../types';

function getDocPath(filename: string): string {
  let base = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
  if (base && !base.endsWith('/')) {
    base += '/';
  }
  return `${base}${filename}`;
}

async function readJsonFile<T>(filename: string): Promise<T | null> {
  const filePath = getDocPath(filename);
  try {
    const info = await FileSystem.getInfoAsync(filePath);
    if (info.exists) {
      const text = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(text);
    }
  } catch (e) {
    // fallback
  }
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (cacheDir) {
      const cachePath = `${cacheDir.endsWith('/') ? cacheDir : cacheDir + '/'}${filename}`;
      if (cachePath !== filePath) {
        const info = await FileSystem.getInfoAsync(cachePath);
        if (info.exists) {
          const text = await FileSystem.readAsStringAsync(cachePath);
          return JSON.parse(text);
        }
      }
    }
  } catch (e) {}
  return null;
}

async function writeJsonFile(filename: string, data: any): Promise<void> {
  const json = JSON.stringify(data);
  const filePath = getDocPath(filename);
  try {
    await FileSystem.writeAsStringAsync(filePath, json);
  } catch (e) {
    console.warn(`Failed writing to ${filePath}:`, e);
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const cachePath = `${cacheDir.endsWith('/') ? cacheDir : cacheDir + '/'}${filename}`;
        if (cachePath !== filePath) {
          await FileSystem.writeAsStringAsync(cachePath, json);
        }
      }
    } catch (e2) {}
  }
}

let cachedSavedTranslations: TranslationItem[] | null = null;

export type PlaybackSpeed = '0.75x' | '1.0x';

interface AppSettingsStorage {
  globalDefaultTone: PanamaTone;
  contactTones: Record<string, PanamaTone>;
  playbackSpeed: PlaybackSpeed;
  userPersona?: UserPersona;
  includeAppSignature?: boolean;
  preferredVoiceGender?: 'MALE' | 'FEMALE';
  onboardingComplete?: boolean;
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
    const parsed = await readJsonFile<AppSettingsStorage>('poquito_settings_v2.json');
    if (parsed) {
      cachedSettings = { ...DEFAULT_SETTINGS, ...parsed };
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
  await writeJsonFile('poquito_settings_v2.json', settings);
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

export async function getOnboardingComplete(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.onboardingComplete === true;
}

export async function setOnboardingComplete(done: boolean): Promise<void> {
  const settings = await getAppSettings();
  settings.onboardingComplete = done;
  await saveAppSettings(settings);
}

export async function getCustomProviders(): Promise<LocalServiceProvider[]> {
  if (cachedCustomProviders) return cachedCustomProviders;

  try {
    const parsed = await readJsonFile<LocalServiceProvider[]>('poquito_custom_providers_v1.json');
    if (parsed && Array.isArray(parsed)) {
      cachedCustomProviders = parsed;
      return cachedCustomProviders;
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
  await writeJsonFile('poquito_custom_providers_v1.json', updatedList);

  return updatedList;
}

// ==========================================
// PHONE BOOK / FAVORITES STORAGE LAYER
// ==========================================

export function mapDirectoryCategoryToPhoneBook(dirCategory?: string): string {
  if (!dirCategory) return 'other';
  const cat = dirCategory.toLowerCase();
  if (
    cat.includes('boat') ||
    cat.includes('lancha') ||
    cat.includes('water_taxi') ||
    cat.includes('land_taxi') ||
    cat.includes('taxi') ||
    cat.includes('transport')
  ) {
    return 'boat_repair';
  }
  if (
    cat.includes('ac_repair') ||
    cat.includes('contractor') ||
    cat.includes('gardening') ||
    cat.includes('plumb') ||
    cat.includes('electric') ||
    cat.includes('solar') ||
    cat.includes('handyman') ||
    cat.includes('starlink') ||
    cat.includes('tech') ||
    cat.includes('trades')
  ) {
    return 'home_trades';
  }
  if (cat.includes('clean') || cat.includes('maid') || cat.includes('aseo')) {
    return 'cleaning';
  }
  if (cat.includes('housing') || cat.includes('landlord') || cat.includes('rent')) {
    return 'housing';
  }
  if (cat.includes('tour') || cat.includes('rental') || cat.includes('surf') || cat.includes('dive')) {
    return 'tours';
  }
  return 'other';
}

type PhoneBookChangeListener = (contacts: PhoneBookContact[]) => void;
const phoneBookListeners = new Set<PhoneBookChangeListener>();

export function subscribePhoneBookChanged(listener: PhoneBookChangeListener): () => void {
  phoneBookListeners.add(listener);
  return () => {
    phoneBookListeners.delete(listener);
  };
}

function notifyPhoneBookChanged(contacts: PhoneBookContact[]) {
  phoneBookListeners.forEach((listener) => {
    try {
      listener(contacts);
    } catch (e) {
      console.warn('Error in phoneBookListener:', e);
    }
  });
}

// Early builds seeded the phone book with made-up demo contacts (ids "seed-1".."seed-4").
// Their numbers could belong to real strangers, so they are dropped from stored lists.
const isLegacyDemoContact = (c: PhoneBookContact) => typeof c?.id === 'string' && c.id.startsWith('seed-');

let phoneBookPromise: Promise<PhoneBookContact[]> | null = null;

async function persistPhoneBook(list: PhoneBookContact[]): Promise<void> {
  cachedPhoneBook = list;
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('poquito_phonebook_v1', JSON.stringify(list));
    } catch (e) {}
  }
  await writeJsonFile('poquito_phonebook_v1.json', list);
  notifyPhoneBookChanged(list);
}

export async function getPhoneBookContacts(): Promise<PhoneBookContact[]> {
  if (cachedPhoneBook) return cachedPhoneBook;
  if (phoneBookPromise) return phoneBookPromise;

  phoneBookPromise = (async () => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('poquito_phonebook_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            cachedPhoneBook = parsed.filter((c: PhoneBookContact) => !isLegacyDemoContact(c));
            if (cachedPhoneBook.length !== parsed.length) persistPhoneBook(cachedPhoneBook);
            return cachedPhoneBook;
          }
        }
      } catch (e) {
        // fallback
      }
    }

    try {
      const parsed = await readJsonFile<PhoneBookContact[]>('poquito_phonebook_v1.json');
      if (parsed && Array.isArray(parsed)) {
        cachedPhoneBook = parsed.filter((c) => !isLegacyDemoContact(c));
        if (cachedPhoneBook.length !== parsed.length) persistPhoneBook(cachedPhoneBook);
        return cachedPhoneBook;
      }
    } catch (e) {
      // fallback
    } finally {
      phoneBookPromise = null;
    }

    // First launch: start with an empty phone book
    cachedPhoneBook = [];
    return cachedPhoneBook;
  })();

  return phoneBookPromise;
}

export async function savePhoneBookContact(contact: PhoneBookContact): Promise<PhoneBookContact[]> {
  const existing = await getPhoneBookContacts();
  const normalizedNew = normalizePanamaPhoneNumber(contact.whatsappNumber || contact.phoneNumber || '');

  const existingIdx = existing.findIndex(
    (c) =>
      c.id === contact.id ||
      (c.directoryProviderId && contact.directoryProviderId && c.directoryProviderId === contact.directoryProviderId) ||
      (normalizedNew &&
        normalizePanamaPhoneNumber(c.whatsappNumber || c.phoneNumber || c.normalizedPhone || '') === normalizedNew)
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

  await persistPhoneBook(updatedList);
  return updatedList;
}

export async function deletePhoneBookContact(contactId: string): Promise<PhoneBookContact[]> {
  const existing = await getPhoneBookContacts();
  const updatedList = existing.filter((c) => c.id !== contactId && c.directoryProviderId !== contactId);
  await persistPhoneBook(updatedList);
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
  await persistPhoneBook(updatedList);
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
  await persistPhoneBook(updatedList);
}

export async function syncDirectoryFavorite(
  provider: LocalServiceProvider,
  isFavorite: boolean
): Promise<PhoneBookContact[]> {
  const existing = await getPhoneBookContacts();
  const normalized = normalizePanamaPhoneNumber(provider.whatsappNumber || provider.phoneNumber || '');
  const mappedCategory = mapDirectoryCategoryToPhoneBook(provider.category || provider.serviceType);

  if (isFavorite) {
    const existingIdx = existing.findIndex(
      (c) =>
        (c.directoryProviderId && c.directoryProviderId === provider.id) ||
        (c.id && c.id === provider.id) ||
        (c.id && c.id === `fav_${provider.id}`) ||
        (provider.name && c.name.trim().toLowerCase() === provider.name.trim().toLowerCase()) ||
        (normalized &&
          normalizePanamaPhoneNumber(c.whatsappNumber || c.phoneNumber || c.normalizedPhone || '') === normalized)
    );

    let updatedList: PhoneBookContact[];
    if (existingIdx >= 0) {
      const updatedContact: PhoneBookContact = {
        ...existing[existingIdx],
        name: provider.name || existing[existingIdx].name,
        whatsappNumber: provider.whatsappNumber || existing[existingIdx].whatsappNumber,
        phoneNumber: provider.phoneNumber || existing[existingIdx].phoneNumber,
        normalizedPhone: normalized || existing[existingIdx].normalizedPhone,
        isFavorite: true,
        category: existing[existingIdx].category || mappedCategory,
        notes: provider.notes || existing[existingIdx].notes,
        isVerifiedDirectory: true,
        directoryProviderId: provider.id,
      };
      // Move favorited contact to top of list
      const rest = existing.filter((_, idx) => idx !== existingIdx);
      updatedList = [updatedContact, ...rest];
    } else {
      const newContact: PhoneBookContact = {
        id: `fav_${provider.id}_${Date.now()}`,
        name: provider.name,
        whatsappNumber: provider.whatsappNumber || provider.phoneNumber || '',
        phoneNumber: provider.phoneNumber || provider.whatsappNumber || '',
        normalizedPhone: normalized,
        category: mappedCategory,
        isFavorite: true,
        notes: provider.notes,
        isVerifiedDirectory: true,
        directoryProviderId: provider.id,
        createdAt: Date.now(),
      };
      updatedList = [newContact, ...existing];
    }

    await persistPhoneBook(updatedList);
    return updatedList;
  } else {
    // Unfavorite
    const targetIdx = existing.findIndex(
      (c) =>
        (c.directoryProviderId && c.directoryProviderId === provider.id) ||
        (c.id && c.id === provider.id) ||
        (c.id && c.id === `fav_${provider.id}`) ||
        (provider.name && c.name.trim().toLowerCase() === provider.name.trim().toLowerCase()) ||
        (normalized &&
          normalizePanamaPhoneNumber(c.whatsappNumber || c.phoneNumber || c.normalizedPhone || '') === normalized)
    );

    if (targetIdx >= 0) {
      const target = existing[targetIdx];
      // If it originated strictly as a directory favorite (id starts with fav_), remove it from phone book
      if (target.id.startsWith('fav_') || target.directoryProviderId === provider.id) {
        return deletePhoneBookContact(target.id);
      } else {
        return toggleFavoriteContact(target.id);
      }
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
    const parsed = await readJsonFile<TranslationItem[]>('poquito_saved_translations_v1.json');
    if (parsed && Array.isArray(parsed)) {
      cachedSavedTranslations = parsed;
      return cachedSavedTranslations;
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
  await writeJsonFile('poquito_saved_translations_v1.json', list);
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
