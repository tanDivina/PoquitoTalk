export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface ServicePreset {
  id: string;
  category: string;
  title: string;
  icon: string;
  description: string;
  defaultInputPrompt: string;
  phrases: {
    title: string;
    input: string;
    output?: string;
  }[];
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
}

export interface UserSubscription {
  isPro: boolean;
  translationsCountToday: number;
  maxFreeTranslations: number;
}
