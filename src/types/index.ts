export type PanamaTone = 'poquito' | 'full_panameno';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface PresetPhrase {
  id?: string;
  title: string;
  input: string;
  output: string;
  spanishText?: string;
  audioKey?: string;
  fullPanamenoOutput?: string;
}

export interface ServicePreset {
  id: string;
  category: string;
  title: string;
  icon: string;
  description: string;
  defaultInputPrompt: string;
  phrases: PresetPhrase[];
}

export interface TranslationItem {
  id: string;
  timestamp: number;
  fromLang: string;
  toLang: string;
  inputText: string;
  outputText: string;
  category?: string;
  isSaved?: boolean;
  tone?: PanamaTone;
}

export interface LocalServiceProvider {
  id: string;
  region: string;
  category: string;
  name: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  normalizedPhone?: string;
  address?: string;
  hours?: string;
  website?: string;
  rating: number;
  verified: boolean;
  notes?: string;
  isSponsored?: boolean;
  adSpotlightText?: string;
  googleMapsQuery?: string;
  serviceType?: 'service' | 'atm' | 'bank' | 'western_union' | 'punto_pago' | 'utility';
  customTone?: PanamaTone;
  nominatedBy?: string;
  communityNotes?: string[];
  vouchCount?: number;
}

export interface UserSubscription {
  isPro: boolean;
  translationsCountToday: number;
  maxFreeTranslations: number;
}
