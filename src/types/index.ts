export type PanamaTone = 'poquito' | 'full_panameno';
export type UserPersona = 'expat' | 'traveler' | 'local';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface PresetSubCategory {
  id: string;
  label: string;
  icon?: string;
}

export interface PresetPhrase {
  id?: string;
  title: string;
  input: string;
  output?: string;
  spanishText?: string;
  audioKey?: string;
  fullPanamenoOutput?: string;
  subCategory?: string;
  subCategoryLabel?: string;
}

export interface ServicePreset {
  id: string;
  category: string;
  title: string;
  icon: string;
  description: string;
  defaultInputPrompt: string;
  subCategories?: PresetSubCategory[];
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
  serviceType?:
    | 'service'
    | 'atm'
    | 'bank'
    | 'western_union'
    | 'punto_pago'
    | 'utility'
    | 'doctor_clinic'
    | 'pharmacy_prescriptions'
    | 'vet_pet'
    | 'taxi_land'
    | 'dining_groceries'
    | 'restaurant_dining'
    | 'hotel_lodging'
    | 'hardware_supplies'
    | 'car_rental';
  customTone?: PanamaTone;
  nominatedBy?: string;
  communityNotes?: string[];
  vouchCount?: number;

  // Provenance & Audit Trail
  source?: 'google_maps' | 'official_registry' | 'notebook_lm' | 'community_vouched' | 'facebook_group';
  sourceUrl?: string;
  sourcePlaceId?: string;
  verifiedDate?: string;

  // Extended Database Profile Fields
  certifications?: string[];
  departureDock?: string;
  tourOfferings?: { tour: string; price?: string; details?: string; description?: string }[];
  includedAmenities?: string[];
  partners?: { partner: string; role: string }[];
  frequentDestinations?: string[];
  rainyDayPolicy?: string;
  email?: string;
}

export interface UserSubscription {
  isPro: boolean;
  translationsCountToday: number;
  maxFreeTranslations: number;
}

export interface PhoneBookContact {
  id: string;
  name: string;
  whatsappNumber: string;
  phoneNumber?: string;
  normalizedPhone?: string;
  category: string; // e.g. 'Water Taxi', 'A/C & Electric', 'Plumbing', 'Landlord', 'Personal', 'General'
  isFavorite: boolean;
  notes?: string;
  isVerifiedDirectory?: boolean;
  directoryProviderId?: string;
  lastContactedAt?: number;
  createdAt: number;
}
