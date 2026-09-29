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
  Male: 'JBFqnCBsd6RMkjVDRZzb', // Diego - Warm Conversational Male
  Female: 'cgSgspJ2msm6clMCkdW9', // Sofia - Clear Friendly Female
  male: 'JBFqnCBsd6RMkjVDRZzb',
  female: 'cgSgspJ2msm6clMCkdW9',
  male_warm: 'JBFqnCBsd6RMkjVDRZzb',
  female_clear: 'cgSgspJ2msm6clMCkdW9',
  Diego: 'JBFqnCBsd6RMkjVDRZzb',
  Sofia: 'cgSgspJ2msm6clMCkdW9',
};

let elevenLabsApiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';

export function setElevenLabsApiKey(key: string) {
  elevenLabsApiKey = key.trim();
}

export function getElevenLabsApiKey(): string {
  return elevenLabsApiKey;
}

export function getAudioCacheKey(text: string, personaName: string): string {
  let hash = 0;
  const clean = text.trim().toLowerCase();
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  const safeHash = Math.abs(hash).toString(36);
  const slug = clean.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
  return `${FileSystem.cacheDirectory}poquito_tts_${personaName.toLowerCase()}_${slug}_${safeHash}.mp3`;
}

export async function generateElevenLabsAudio(
  text: string,
  personaName: string = 'Male'
): Promise<string | null> {
  if (!elevenLabsApiKey) {
    return null;
  }

  const voiceId = ELEVENLABS_PERSONAS[personaName] || ELEVENLABS_PERSONAS['Male'];
  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const cacheFileUri = getAudioCacheKey(text, personaName);

  // 1. Instant Cache Hit Check: return previously saved studio-grade audio
  try {
    const fileInfo = await FileSystem.getInfoAsync(cacheFileUri);
    if (fileInfo.exists && (fileInfo as any).size && (fileInfo as any).size > 1000) {
      return cacheFileUri;
    }
  } catch (e) {
    // Continue to network generation if file check fails
  }

  // 2. Fetch from ElevenLabs with retry (up to 2 attempts) and timeout guard
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        const chunkSize = 8192;
        let binary = '';
        for (let i = 0; i < len; i += chunkSize) {
          const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
          binary += String.fromCharCode.apply(null, chunk as any);
        }
        const base64data = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(arrayBuffer).toString('base64');
        await FileSystem.writeAsStringAsync(cacheFileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return cacheFileUri;
      } else {
        const errText = await response.text();
        console.warn(`ElevenLabs API error (attempt ${attempt}):`, errText);
      }
    } catch (error) {
      console.warn(`ElevenLabs speech generation error (attempt ${attempt}):`, error);
    }
  }

  return null;
}
