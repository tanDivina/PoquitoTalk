// Google Gemini / Cloud Text-to-Speech Studio Voice Service
// Supports Gender (Male/Female), Age/Tone (Young/Mature/Warm), and Google API Key configuration

import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  tone: string;
  flag: string;
}

export const GOOGLE_SPANISH_VOICES: VoiceOption[] = [
  { id: 'es-US-Neural2-B', name: 'Diego', gender: 'MALE', tone: 'Warm & Natural (Panamá)', flag: '👨' },
  { id: 'es-US-Neural2-A', name: 'Sofia', gender: 'FEMALE', tone: 'Clear & Natural', flag: '👩' },
  { id: 'es-US-Journey-F', name: 'Valeria', gender: 'FEMALE', tone: 'Young & Expressive (Studio)', flag: '👧' },
  { id: 'es-US-Neural2-C', name: 'Mateo', gender: 'MALE', tone: 'Mature & Deep', flag: '🧔' },
  { id: 'es-US-Neural2-F', name: 'Lucía', gender: 'FEMALE', tone: 'Young & Friendly', flag: '✨' },
];

let customApiKey = '';

export function setGoogleApiKey(key: string) {
  customApiKey = key;
}

export async function generateGoogleGeminiAudio(
  text: string,
  voiceId: string = 'es-US-Neural2-B'
): Promise<string | null> {
  const apiKey = customApiKey || 'AIzaSyDemoGoogleKeyForShipaton2026';
  const GOOGLE_TTS_ENDPOINT = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  try {
    const selectedVoice = GOOGLE_SPANISH_VOICES.find((v) => v.id === voiceId) || GOOGLE_SPANISH_VOICES[0];

    const response = await fetch(GOOGLE_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'es-US',
          name: selectedVoice.id,
          ssmlGender: selectedVoice.gender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: selectedVoice.id.includes('Journey') ? 0.95 : 0.90,
          pitch: 0.0,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audioContent) {
        const fileUri = `${FileSystem.cacheDirectory}poquitotalk_voice_${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, data.audioContent, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return fileUri;
      }
    }
  } catch (error) {
    console.warn('Google Cloud Voice API call:', error);
  }

  return null;
}

export async function playGoogleAudioFile(fileUri: string): Promise<Audio.Sound | null> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    const { sound } = await Audio.Sound.createAsync({ uri: fileUri }, { shouldPlay: true });
    return sound;
  } catch (error) {
    console.warn('Error playing audio file:', error);
    return null;
  }
}
