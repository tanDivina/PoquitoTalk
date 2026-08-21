import { Platform, Alert, Linking } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

/**
 * Shares a native .mp3 voice note file directly to WhatsApp or native share sheet
 */
export async function shareVoiceNoteToWhatsApp(
  audioUri: string,
  recipientName: string = 'Provider',
  spanishText?: string
): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable && audioUri) {
      await Sharing.shareAsync(audioUri, {
        mimeType: 'audio/mp3',
        dialogTitle: `Send Voice Note to ${recipientName}`,
        UTI: 'public.mp3',
      });
      return true;
    }
  } catch (error) {
    console.warn('Native audio sharing error:', error);
  }

  // Fallback: If direct audio sharing not possible, copy text & open WhatsApp
  if (spanishText) {
    await Clipboard.setStringAsync(spanishText);
    const message = `${spanishText}\n\n— Sent via PoquitoTalk.app 🇵🇦`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert(
        'Voice Note Prepared!',
        'Text copied to clipboard. Open WhatsApp to paste your message or attach audio.'
      );
      return true;
    }
  }

  return false;
}

/**
 * Sends formatted Panamanian Spanish text to WhatsApp
 */
export async function sendTextToWhatsApp(
  spanishText: string,
  whatsappNumber?: string
): Promise<boolean> {
  const message = `${spanishText}\n\n— Sent via PoquitoTalk.app 🇵🇦`;
  let url = `whatsapp://send?text=${encodeURIComponent(message)}`;

  if (whatsappNumber) {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const fullNumber = cleanNumber.startsWith('507') ? cleanNumber : `507${cleanNumber}`;
    url = `whatsapp://send?phone=${fullNumber}&text=${encodeURIComponent(message)}`;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
  } catch (e) {}

  // Fallback: copy to clipboard
  await Clipboard.setStringAsync(message);
  Alert.alert('Copied! 📋', 'Spanish message copied to clipboard. You can paste it directly into WhatsApp.');
  return true;
}
