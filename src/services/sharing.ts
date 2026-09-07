import { Platform, Alert, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Clipboard from 'expo-clipboard';
import { getIncludeAppSignature } from './storage';
import { getUserProfile } from './userService';

export interface ShareVoiceNoteOptions {
  roomId?: string;
  contractorName?: string;
  clientName?: string;
  phone?: string;
  englishText?: string;
}

/**
 * Uploads a local voice audio file to the PoquitoTalk server for web playback
 */
export async function uploadVoiceNoteAudio(
  audioUri?: string | null,
  spanishText?: string,
  options?: ShareVoiceNoteOptions
): Promise<string | null> {
  try {
    let base64Data: string = '';

    // If local file provided, read as base64
    if (audioUri && !audioUri.startsWith('http://') && !audioUri.startsWith('https://')) {
      base64Data = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    const payload: Record<string, string> = {
      text: spanishText || '',
      room: options?.roomId || '',
      contractor: options?.contractorName || '',
      sender: options?.clientName || '',
      phone: options?.phone || '',
      englishText: options?.englishText || '',
    };

    if (base64Data) {
      payload.audioBase64 = base64Data;
    } else if (audioUri && (audioUri.startsWith('http://') || audioUri.startsWith('https://'))) {
      payload.presetId = audioUri;
    }

    const res = await fetch('https://poquitotalk.hero-apps.com/api/audio.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && (data.shortUrl || data.listenUrl)) {
        return data.shortUrl || data.listenUrl;
      }
    }
  } catch (e) {
    console.warn('Failed to upload/shorten voice note link on server:', e);
  }

  // Fallback web player link if server unreachable
  if (spanishText) {
    const params = new URLSearchParams();
    params.set('text', spanishText.trim());
    if (options?.roomId) params.set('room', options.roomId);
    if (options?.contractorName) params.set('contractor', options.contractorName);
    if (options?.clientName) params.set('sender', options.clientName);
    return `https://poquitotalk.hero-apps.com/listen.html?${params.toString()}`;
  }
  return null;
}

/**
 * Directly opens a 1-on-1 WhatsApp conversation with a contact or general chat
 */
export async function openDirectWhatsAppChat(
  message: string,
  whatsappNumber?: string
): Promise<boolean> {
  // Pre-copy message to clipboard for guaranteed access
  await Clipboard.setStringAsync(message);

  let fullNumber = '';
  if (whatsappNumber) {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    fullNumber = cleanNumber.startsWith('507')
      ? cleanNumber
      : cleanNumber.length === 8
      ? `507${cleanNumber}`
      : cleanNumber;
  }

  const primaryUrl = fullNumber
    ? `whatsapp://send?phone=${fullNumber}&text=${encodeURIComponent(message)}`
    : `whatsapp://send?text=${encodeURIComponent(message)}`;

  // 1. Try native whatsapp:// URL scheme
  try {
    const canOpen = await Linking.canOpenURL(primaryUrl);
    if (canOpen) {
      await Linking.openURL(primaryUrl);
      return true;
    }
  } catch (e) {
    // Some iOS versions fail canOpenURL without Info.plist queries scheme, attempt direct open
  }

  try {
    await Linking.openURL(primaryUrl);
    return true;
  } catch (e2) {
    console.warn('Direct whatsapp:// scheme failed, attempting wa.me universal link fallback:', e2);
  }

  // 2. Try universal wa.me web link fallback
  if (fullNumber) {
    const webUrl = `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(webUrl);
      return true;
    } catch (e3) {
      console.warn('Universal wa.me link failed:', e3);
    }
  }

  // 3. Fallback alert if WhatsApp cannot be opened
  Alert.alert(
    'Copied to Clipboard! 📋',
    'Spanish message copied. You can paste it directly into WhatsApp.'
  );
  return true;
}

/**
 * Formats Spanish message with or without the PoquitoTalk signature based on user plan & preference
 */
async function formatWhatsAppMessage(spanishText: string, listenUrl?: string | null): Promise<string> {
  const cleanSpanish = (spanishText || '').trim();
  let baseMsg = cleanSpanish || '¡Buenas!';

  if (listenUrl) {
    baseMsg = `${baseMsg}\n\n▶️ Escuchar audio:\n${listenUrl}`;
  }

  try {
    const includeSignature = await getIncludeAppSignature();
    const profile = await getUserProfile();
    const isPayingUser = profile.isProSubscriber || (profile.creditsBalance && profile.creditsBalance > 0);

    // Paying users can turn off the app signature
    if (isPayingUser && !includeSignature) {
      return baseMsg;
    }
  } catch (e) {
    // default to signature
  }

  return `${baseMsg}\n\n- Enviado por la app PoquitoTalk 🇵🇦`;
}

/**
 * Shares a server-hosted voice note directly to a WhatsApp contact or general chat
 */
export async function shareVoiceNoteToWhatsApp(
  audioUri?: string | null,
  recipientName: string = 'Provider',
  spanishText?: string,
  whatsappNumber?: string,
  options?: ShareVoiceNoteOptions
): Promise<boolean> {
  let listenUrl: string | null = null;
  const mergedOptions: ShareVoiceNoteOptions = {
    contractorName: recipientName,
    phone: whatsappNumber,
    ...options,
  };

  if (audioUri || spanishText) {
    listenUrl = await uploadVoiceNoteAudio(audioUri, spanishText, mergedOptions);
  }

  const formattedText = await formatWhatsAppMessage(spanishText || '¡Buenas!', listenUrl);

  // Directly open WhatsApp chat with recipient
  if (whatsappNumber && whatsappNumber.trim().length > 0) {
    return await openDirectWhatsAppChat(formattedText, whatsappNumber);
  }

  return await openDirectWhatsAppChat(formattedText);
}

/**
 * Sends formatted Panamanian Spanish text to WhatsApp
 */
export async function sendTextToWhatsApp(
  spanishText: string,
  whatsappNumber?: string
): Promise<boolean> {
  const message = await formatWhatsAppMessage(spanishText);
  return await openDirectWhatsAppChat(message, whatsappNumber);
}


