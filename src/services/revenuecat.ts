// RevenueCat Integration Service for PoquitoTalk
// Manages Pro Subscriptions, Entitlements, Paywalls, and Free Usage Limits

import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import { getUserProfile, setProSubscriber } from './userService';

// RevenueCat Public App-Specific API Keys (Stripe Projects: dorien@rankbeacon.dev)
const REVENUECAT_STRIPE_API_KEY = 'strp_oRCQHGzTOCydzvQECdMeNnbVXTI';
const REVENUECAT_ANDROID_API_KEY = 'goog_AlpDvQBZbuFjLWDnWAAVexYDMQz';

export interface SubscriptionState {
  isPro: boolean;
  activeEntitlement?: string;
  freeTranslationsRemaining: number;
  maxFreeTranslations: number;
}

export const MAX_FREE_TRANSLATIONS_PER_DAY = 10;

class RevenueCatService {
  private isInitialized = false;
  private isPurchasesConfigured = false;
  private currentCustomerInfo: CustomerInfo | null = null;
  private dailyTranslationsCount = 0;

  isConfigured(): boolean {
    return this.isPurchasesConfigured;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: REVENUECAT_ANDROID_API_KEY });
        this.isPurchasesConfigured = true;
        this.currentCustomerInfo = await Purchases.getCustomerInfo();
        console.log('[RevenueCat] Initialized successfully for Android Google Play');
      } else if (Platform.OS === 'web') {
        Purchases.configure({ apiKey: REVENUECAT_STRIPE_API_KEY });
        this.isPurchasesConfigured = true;
        this.currentCustomerInfo = await Purchases.getCustomerInfo();
        console.log('[RevenueCat] Initialized successfully with Stripe Projects account');
      } else {
        console.log('[RevenueCat] Platform initialization skipped for', Platform.OS);
      }
    } catch (error) {
      console.warn('[RevenueCat] Initialization warning:', error);
    } finally {
      this.isInitialized = true;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.isPurchasesConfigured) return null;
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null) {
        return offerings.current;
      }
    } catch (error) {
      console.warn('Error fetching RevenueCat offerings:', error);
    }
    return null;
  }

  async isProSubscriber(): Promise<boolean> {
    if (this.isPurchasesConfigured) {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const isPro = typeof customerInfo.entitlements.active['pro'] !== 'undefined' ||
                      typeof customerInfo.entitlements.active['unlimited_translations'] !== 'undefined';
        await setProSubscriber(isPro);
        return isPro;
      } catch (error) {
        // Fallback to local profile on network offline
      }
    }
    try {
      const profile = await getUserProfile();
      return !!profile.isProSubscriber;
    } catch (e) {
      return false;
    }
  }

  getFreeTranslationsCount(): number {
    return this.dailyTranslationsCount;
  }

  incrementTranslationCount(): number {
    this.dailyTranslationsCount += 1;
    return this.dailyTranslationsCount;
  }

  hasRemainingFreeTranslations(): boolean {
    return this.dailyTranslationsCount < MAX_FREE_TRANSLATIONS_PER_DAY;
  }

  async purchaseProPackage(): Promise<boolean> {
    if (this.isPurchasesConfigured) {
      try {
        const offerings = await this.getOfferings();
        if (offerings && offerings.availablePackages.length > 0) {
          const pkg = offerings.availablePackages[0];
          const { customerInfo } = await Purchases.purchasePackage(pkg);
          const isPro = typeof customerInfo.entitlements.active['pro'] !== 'undefined' ||
                        typeof customerInfo.entitlements.active['unlimited_translations'] !== 'undefined';
          if (isPro) {
            await setProSubscriber(true);
            return true;
          }
          return false;
        } else {
          console.warn('[RevenueCat] No available packages found in current offering.');
          return false;
        }
      } catch (error) {
        console.warn('[RevenueCat] Purchase error or cancelled by user:', error);
        return false;
      }
    }
    console.warn('[RevenueCat] Purchases not configured on this device/platform.');
    return false;
  }

  async restorePurchases(): Promise<boolean> {
    if (this.isPurchasesConfigured) {
      try {
        const customerInfo = await Purchases.restorePurchases();
        const isPro = typeof customerInfo.entitlements.active['pro'] !== 'undefined' ||
                      typeof customerInfo.entitlements.active['unlimited_translations'] !== 'undefined';
        await setProSubscriber(isPro);
        return isPro;
      } catch (error) {
        console.warn('[RevenueCat] Restore error:', error);
        return false;
      }
    }
    return false;
  }
}

export const revenueCat = new RevenueCatService();
