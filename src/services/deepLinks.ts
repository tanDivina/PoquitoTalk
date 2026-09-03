// Deep-Linking & Viral Web Share Service for PoquitoTalk Phrasebooks
// Generates viral web preview URLs for Bocas del Toro Expat WhatsApp & Facebook Groups

import { Share, Alert, Linking } from 'react-native';

export const BASE_WEB_FUNNEL_URL = 'https://poquitotalk.hero-apps.com';

export interface PhrasebookPackage {
  id: string;
  title: string;
  category: string;
  emoji: string;
  phraseCount: number;
}

export function generatePhrasebookShareUrl(packageId: string): string {
  return `${BASE_WEB_FUNNEL_URL}/p/${packageId}`;
}

export async function sharePhrasebookToCommunity(pkg: PhrasebookPackage): Promise<void> {
  const shareUrl = generatePhrasebookShareUrl(pkg.id);
  const shareMessage = `🌴 Check out the "${pkg.title}" phrasebook (${pkg.phraseCount} phrases) for Bocas del Toro expats!\n\nListen to Panamanian Spanish audio notes here: ${shareUrl}`;

  try {
    const result = await Share.share({
      message: shareMessage,
      url: shareUrl,
      title: `PoquitoTalk Phrasebook: ${pkg.title}`,
    });
  } catch (e) {
    Alert.alert('Share Error', 'Could not share phrasebook.');
  }
}

export async function shareWalkieTalkieToWhatsApp(
  shareUrl: string,
  recipientName: string = 'Amigo',
  topicEs?: string,
  topicEn?: string
): Promise<void> {
  const greeting = (recipientName && recipientName !== 'Amigo' && recipientName !== 'Contractor' && recipientName !== 'Recipient') ? `¡Hola ${recipientName}!` : '¡Hola!';
  let message = '';
  if (topicEs && topicEs.trim().length > 0) {
    message = `${greeting}\n\n*${topicEs.trim()}*${topicEn && topicEn.trim() && topicEn.trim() !== topicEs.trim() ? `\n_("${topicEn.trim()}")_` : ''}\n\n🎙️ Toca el enlace para responder por voz:\n${shareUrl}`;
  } else {
    message = `${greeting}\n\n🎙️ Toca el enlace para hablarme por voz:\n${shareUrl}`;
  }

  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

  try {
    const supported = await Linking.canOpenURL(whatsappUrl);
    if (supported) {
      await Linking.openURL(whatsappUrl);
    } else {
      await Share.share({
        message,
        url: shareUrl,
        title: 'PoquitoTalk Canal Walkie-Talkie en Vivo'
      });
    }
  } catch (e) {
    await Share.share({
      message,
      url: shareUrl,
      title: 'PoquitoTalk Canal Walkie-Talkie en Vivo'
    });
  }
}

export interface ClaimRedemptionResult {
  success: boolean;
  token?: string;
  packageName?: string;
  creditsGranted?: number;
  isPro?: boolean;
  message?: string;
  alreadyRedeemed?: boolean;
}

/**
 * Parses and redeems Web-to-App Stripe purchase claims (poquitotalk://claim?token=...)
 */
export async function handleIncomingClaimDeepLink(url: string): Promise<ClaimRedemptionResult | null> {
  if (!url) return null;

  try {
    let token = '';

    // Handle poquitotalk://claim?token=... or https://poquitotalk.hero-apps.com/claim?token=...
    if (url.startsWith('poquitotalk://') || url.includes('hero-apps.com/claim') || url.includes('hero-apps.com/success')) {
      const match = url.match(/[?&]token=([^&]+)/);
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) return null;

    // Call Claim API
    const response = await fetch(`${BASE_WEB_FUNNEL_URL}/api/claim.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        device_id: 'device_' + Math.random().toString(36).substring(2, 9),
      }),
    });

    const data = await response.json();

    if (data.success) {
      const claim = data.claim || data;
      const credits = claim.credits || (claim.is_pro ? 100 : 50);
      const isPro = claim.is_pro ?? true;
      const packageName = claim.package_name || (isPro ? 'PoquitoTalk Pro Pass' : '50 Poquito Credits');

      // Import userService dynamically to avoid circular dependencies
      const { redeemWebPurchase } = await import('./userService');
      await redeemWebPurchase(token, isPro, credits, packageName);

      return {
        success: true,
        token,
        packageName,
        creditsGranted: credits,
        isPro,
        alreadyRedeemed: !!data.already_redeemed,
        message: data.message || 'Purchase successfully unlocked!',
      };
    } else {
      return {
        success: false,
        token,
        message: data.message || 'Could not validate claim code.',
      };
    }
  } catch (err: any) {
    console.warn('Error handling claim deep link:', err);
    return {
      success: false,
      message: err.message || 'Network error processing claim.',
    };
  }
}


