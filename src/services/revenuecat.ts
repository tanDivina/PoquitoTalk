// RevenueCat Integration Service for PoquitoTalk
// Manages Pro Subscriptions, Entitlements, Paywalls, and Free Usage Limits

import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage, WebPurchaseRedemptionResultType } from 'react-native-purchases';
import { Platform } from 'react-native';
import { getUserProfile, setProSubscriber, addCredits, fulfillWebCreditsOnce } from './userService';

// RevenueCat Public App-Specific API Keys (Stripe Projects: dorien@rankbeacon.dev)
const REVENUECAT_STRIPE_API_KEY = 'strp_oRCQHGzTOCydzvQECdMeNnbVXTI';
// Live Stripe product sold in the RevenueCat Funnel (50 Poquito Credits Pack)
const WEB_CREDITS_STRIPE_PRODUCT_ID = 'prod_V2ox5ofCGfROTh';

// Pro comes only from a subscription or pass. If the credits pack is ever attached to a
// Pro entitlement in the RevenueCat dashboard, ignore it so a credits purchase never unlocks Pro.
function hasProEntitlement(customerInfo: CustomerInfo): boolean {
  return ['pro', 'unlimited_translations'].some((id) => {
    const ent = customerInfo.entitlements.active[id];
    if (!ent) return false;
    const productId = (ent.productIdentifier || '').toLowerCase();
    return productId !== WEB_CREDITS_STRIPE_PRODUCT_ID.toLowerCase() && !productId.includes('credit');
  });
}
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
        const isPro = hasProEntitlement(customerInfo);
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

          const isPro = hasProEntitlement(customerInfo);
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
        const isPro = hasProEntitlement(customerInfo);
        await setProSubscriber(isPro);
        return isPro;
      } catch (error) {
        console.warn('[RevenueCat] Restore error:', error);
        return false;
      }
    }
    return false;
  }

  async handleWebPurchaseRedemption(url: string): Promise<{
    handled: boolean;
    success: boolean;
    resultType?: string;
    message?: string;
    isPro?: boolean;
    creditsGranted?: number;
    packageName?: string;
  }> {
    if (!url) return { handled: false, success: false };

    try {
      if (!this.isPurchasesConfigured) {
        await this.initialize();
      }

      const webPurchaseRedemption = await Purchases.parseAsWebPurchaseRedemption(url);
      if (!webPurchaseRedemption) {
        return { handled: false, success: false };
      }

      console.log('[RevenueCat] Redeeming web purchase with link:', url);
      const redemptionResult = await Purchases.redeemWebPurchase(webPurchaseRedemption);

      switch (redemptionResult.result) {
        case WebPurchaseRedemptionResultType.SUCCESS: {
          const customerInfo = redemptionResult.customerInfo;
          let isPro = false;
          let creditsGranted = 0;
          let packageName = 'PoquitoTalk Purchase';

          // 1. Grant Pro access if Pro entitlement is active
          if (hasProEntitlement(customerInfo)) {
            isPro = true;
            packageName = 'PoquitoTalk Pro Pass';
            await setProSubscriber(true);
          }

          // 2. Find credits product in nonSubscriptionTransactions and add 50 credits idempotently
          const nonSubTxns = customerInfo.nonSubscriptionTransactions || [];
          for (const tx of nonSubTxns) {
            const prodId = (tx.productIdentifier || '').toLowerCase();
            // RevenueCat reports Stripe purchases under the Stripe product id (prod_...), not the package id
            if (prodId === WEB_CREDITS_STRIPE_PRODUCT_ID.toLowerCase() || prodId.includes('credit') || prodId === '$rc_custom' || prodId === 'credits_50') {
              const res = await fulfillWebCreditsOnce(
                tx.transactionIdentifier,
                50,
                'RevenueCat Web Checkout',
                '50 Poquito Credits Pack'
              );
              if (!res.alreadyApplied) {
                creditsGranted += 50;
                packageName = isPro ? `${packageName} + 50 Credits` : '50 Poquito Credits Pack';
              }
            }
          }

          return {
            handled: true,
            success: true,
            resultType: 'SUCCESS',
            isPro,
            creditsGranted,
            packageName,
            message: 'Web purchase successfully unlocked!',
          };
        }

        case WebPurchaseRedemptionResultType.INVALID_TOKEN: {
          console.warn('[RevenueCat] Web redemption failed: INVALID_TOKEN');
          return {
            handled: true,
            success: false,
            resultType: 'INVALID_TOKEN',
            message: 'This redemption link is invalid or has already been redeemed.',
          };
        }

        case WebPurchaseRedemptionResultType.EXPIRED: {
          const email = (redemptionResult as any).obfuscatedEmail || 'your email';
          console.warn(`[RevenueCat] Web redemption link expired. Fresh link sent to ${email}`);
          return {
            handled: true,
            success: false,
            resultType: 'EXPIRED',
            message: `This redemption link has expired. A fresh redemption link was sent to ${email}.`,
          };
        }

        case WebPurchaseRedemptionResultType.PURCHASE_BELONGS_TO_OTHER_USER: {
          console.warn('[RevenueCat] Web redemption: PURCHASE_BELONGS_TO_OTHER_USER');
          return {
            handled: true,
            success: false,
            resultType: 'PURCHASE_BELONGS_TO_OTHER_USER',
            message: "This purchase was already activated on another phone. Email support@hero-apps.com and we'll help.",
          };
        }

        case WebPurchaseRedemptionResultType.ERROR: {
          const err = (redemptionResult as any).error;
          console.error('[RevenueCat] Web redemption error:', err);
          return {
            handled: true,
            success: false,
            resultType: 'ERROR',
            message: err?.message || 'An error occurred while redeeming your purchase.',
          };
        }

        default: {
          return {
            handled: true,
            success: false,
            resultType: 'ERROR',
            message: 'Unable to process redemption link.',
          };
        }
      }
    } catch (err: any) {
      console.warn('[RevenueCat] Exception in handleWebPurchaseRedemption:', err);
      return {
        handled: false,
        success: false,
        message: err?.message || 'Error processing web purchase link.',
      };
    }
  }
}

export const revenueCat = new RevenueCatService();

