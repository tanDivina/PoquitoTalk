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

export async function shareWalkieTalkieToWhatsApp(shareUrl: string, recipientName: string = 'Amigo'): Promise<void> {
  const message = `¡Buenas ${recipientName}! 📻 Te envío un enlace de Walkie-Talkie en vivo sin instalar nada:\n\n${shareUrl}\n\nToca el enlace para hablarme por voz en español y yo te escucho en inglés.`;
  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

  try {
    const supported = await Linking.canOpenURL(whatsappUrl);
    if (supported) {
      await Linking.openURL(whatsappUrl);
    } else {
      await Share.share({
        message,
        url: shareUrl,
        title: 'PoquitoTalk Walkie-Talkie en Vivo 📻'
      });
    }
  } catch (e) {
    await Share.share({
      message,
      url: shareUrl,
      title: 'PoquitoTalk Walkie-Talkie en Vivo 📻'
    });
  }
}

