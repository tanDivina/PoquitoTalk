// Plays the English translation of an INCOMING message (contractor ➔ user) in a voice
// that matches the contractor, never the user's own Diego/Sofia setting (Rule 11).
// Uses the phone's built-in English voices, so there is no extra API cost or latency.
import * as Speech from 'expo-speech';
import type { SpeakerGender } from '../utils/speakerGender';

// iOS exposes voice names; Android (Google TTS) exposes codes like "en-us-x-iom-local".
const MALE_VOICE_HINTS = [
  'daniel', 'alex', 'aaron', 'arthur', 'evan', 'fred', 'gordon', 'nathan', 'oliver', 'reed',
  'rishi', 'tom', 'eddy', 'rocko', 'male',
  '-x-iol', '-x-iom', '-x-tpd', '-x-gbd', '-x-gbg', '-x-rjs',
];
const FEMALE_VOICE_HINTS = [
  'samantha', 'ava', 'allison', 'susan', 'zoe', 'nicky', 'karen', 'moira', 'tessa', 'fiona',
  'serena', 'kate', 'victoria', 'female',
  '-x-sfg', '-x-iob', '-x-iog', '-x-tpc', '-x-tpf', '-x-gba', '-x-gbc',
];

let cachedVoices: Speech.Voice[] | null = null;

async function getEnglishVoices(): Promise<Speech.Voice[]> {
  if (!cachedVoices) {
    const all = await Speech.getAvailableVoicesAsync().catch(() => [] as Speech.Voice[]);
    cachedVoices = all.filter((v) => v.language?.toLowerCase().startsWith('en'));
  }
  return cachedVoices;
}

function matches(voice: Speech.Voice, hints: string[]): boolean {
  const haystack = `${voice.name} ${voice.identifier}`.toLowerCase();
  return hints.some((h) => haystack.includes(h));
}

function rank(voices: Speech.Voice[]): Speech.Voice[] {
  // Prefer US English and enhanced/network-quality voices
  return [...voices].sort((a, b) => {
    const score = (v: Speech.Voice) =>
      (v.language?.toLowerCase() === 'en-us' ? 2 : 0) + ((v as any).quality === 'Enhanced' ? 1 : 0);
    return score(b) - score(a);
  });
}

/** Picks an English device voice for the speaker; undefined means "use the default voice". */
export async function pickIncomingEnglishVoice(gender: SpeakerGender): Promise<Speech.Voice | undefined> {
  const voices = await getEnglishVoices();
  if (voices.length === 0) return undefined;

  if (gender === 'MALE') {
    return rank(voices.filter((v) => matches(v, MALE_VOICE_HINTS) && !matches(v, FEMALE_VOICE_HINTS)))[0];
  }
  if (gender === 'FEMALE') {
    return rank(voices.filter((v) => matches(v, FEMALE_VOICE_HINTS)))[0];
  }
  // NEUTRAL: keep the previous behaviour (a good-quality default English voice)
  return rank(voices.filter((v) => matches(v, ['samantha', 'ava', 'daniel', 'alex']) || (v as any).quality === 'Enhanced'))[0];
}

/**
 * Speaks an incoming message's English translation in a voice matching the contractor.
 * If the phone has no voice of the right gender, it falls back to the default English voice
 * rather than faking one with pitch shifting.
 */
export async function speakIncomingEnglish(
  text: string,
  gender: SpeakerGender,
  options: Omit<Speech.SpeechOptions, 'language' | 'voice'> = {}
): Promise<void> {
  const clean = text.replace(/[*_#"`~]/g, '').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  const voice = await pickIncomingEnglishVoice(gender);
  Speech.speak(clean, {
    rate: 0.95,
    ...options,
    language: voice?.language || 'en-US',
    voice: voice?.identifier,
  });
}
