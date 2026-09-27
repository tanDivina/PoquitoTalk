// RevenueCat Integration Service for PoquitoTalk
// Manages Pro Subscriptions, Entitlements, Paywalls, and Free Usage Limits

import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { getUserProfile, setProSubscriber, addCredits } from './userService';

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

  async purchaseProPackage(tier?: string): Promise<{ success: boolean; userCancelled?: boolean; errorMessage?: string }> {
    if (this.isPurchasesConfigured) {
      try {
        const offerings = await this.getOfferings();
        if (offerings && offerings.availablePackages.length > 0) {
          let pkg: PurchasesPackage | undefined;
          if (tier === 'MONTHLY') {
            pkg = offerings.availablePackages.find(p => p.identifier === '$rc_monthly' || p.packageType === 'MONTHLY');
          } else if (tier === 'TRAVEL_PASS') {
            pkg = offerings.availablePackages.find(p => p.identifier === '$rc_weekly' || p.packageType === 'WEEKLY');
          } else if (tier === 'ANNUAL_TRIAL') {
            pkg = offerings.availablePackages.find(p => p.identifier === '$rc_annual' || p.packageType === 'ANNUAL');
          } else if (tier === 'CREDITS') {
            pkg = offerings.availablePackages.find(p => p.identifier === 'credits_50' || p.identifier === '$rc_custom');
          } else {
            pkg = offerings.availablePackages[0];
          }

          if (!pkg) {
            console.warn(`[RevenueCat] Selected tier '${tier}' is not currently available in this offering.`);
            return {
              success: false,
              userCancelled: false,
              errorMessage: `The selected plan is currently syncing with the store. Please select another plan or try again shortly.`,
            };
          }

          const { customerInfo } = await Purchases.purchasePackage(pkg);

          if (tier === 'CREDITS') {
            await addCredits(50, 'PURCHASE', 'Purchased 50 Poquito Credits Pack', 'PURCHASE_APP');
            return { success: true };
          }

          const isPro = typeof customerInfo.entitlements.active['pro'] !== 'undefined' ||
                        typeof customerInfo.entitlements.active['unlimited_translations'] !== 'undefined';
          if (isPro) {
            await setProSubscriber(true);
            return { success: true };
          }
          return { success: false, userCancelled: false, errorMessage: 'Subscription confirmed, entitlement is updating.' };
        } else {
          console.warn('[RevenueCat] No available packages found in current offering.');
          return { success: false, userCancelled: false, errorMessage: 'Store offerings are coming soon or currently updating.' };
        }
      } catch (error: any) {
        const userCancelled = !!error?.userCancelled;
        console.warn('[RevenueCat] Purchase error or cancelled:', error);
        return {
          success: false,
          userCancelled,
          errorMessage: userCancelled ? undefined : (error?.message || 'Transaction could not be completed.'),
        };
      }
    }
    console.warn('[RevenueCat] Purchases not configured on this device/platform.');
    return { success: false, userCancelled: false, errorMessage: 'In-app billing is only available on supported mobile devices.' };
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
