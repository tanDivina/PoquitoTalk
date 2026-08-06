// ElevenLabs Hyper-Realistic Studio Voice Service
// Generates human-grade, hyper-realistic Panamanian Spanish .mp3 voice clips
// Uses eleven_multilingual_v2 model for natural speech, breathing, and human emotion

import * as FileSystem from 'expo-file-system/legacy';
import { VoiceOption } from './googleVoice';

export interface ElevenLabsVoice {
  id: string;
  name: string;
  voiceId: string;
  gender: 'MALE' | 'FEMALE';
  description: string;
  flag: string;
}

export const ELEVENLABS_PERSONAS: Record<string, string> = {
  Diego: 'JBFqnCBsd6RMkjVDRZzb', // George - Warm Conversational Male
  Mateo: 'ErXwobaYiN019PkySvjV', // Antoni - Authoritative Deep Male
  Sofia: 'cgSgspJ2msm6clMCkdW9', // Jessica - Clear Friendly Female
  Valeria: 'EXAVITQu4vr4xnSDxMaL', // Bella - Young Expressive Female
};

let elevenLabsApiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || 'sk_64d48eca9c2c52a559dfc4e40da1a2dc76870f3f851f4c49';

export function setElevenLabsApiKey(key: string) {
  elevenLabsApiKey = key.trim();
}

export function getElevenLabsApiKey(): string {
  return elevenLabsApiKey;
}

export async function generateElevenLabsAudio(
  text: string,
  personaName: string = 'Diego'
): Promise<string | null> {
  if (!elevenLabsApiKey) {
    return null;
  }

  const voiceId = ELEVENLABS_PERSONAS[personaName] || ELEVENLABS_PERSONAS['Diego'];
  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.85,
          style: 0.20,
          use_speaker_boost: true,
        },
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64data = (reader.result as string).split(',')[1];
            const fileUri = `${FileSystem.cacheDirectory}poquitotalk_eleven_${personaName.toLowerCase()}_${Date.now()}.mp3`;
            await FileSystem.writeAsStringAsync(fileUri, base64data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            resolve(fileUri);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(blob);
      });
    } else {
      const errText = await response.text();
      console.warn('ElevenLabs API error response:', errText);
    }
  } catch (error) {
    console.warn('ElevenLabs speech generation error:', error);
  }

  return null;
}
