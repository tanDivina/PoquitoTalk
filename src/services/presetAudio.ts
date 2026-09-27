import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { generateGoogleGeminiAudio } from './googleVoice';
import { BUNDLED_PRESET_AUDIO } from './bundledPresetAudio';
import PRESET_TEXT_MAP_DATA from './presetTextMap.json';

const SERVER_CDN_BASE = 'https://poquitotalk.hero-apps.com/audio/presets';

export const PRESET_AUDIO_ALIASES: Record<string, string> = {
  boat_engine_not_starting: 'boat_motor_wont_start',
  boat_propeller_impeller_change: 'boat_hull_propeller',
  car_battery_jump_start: 'car_battery_jump',
  car_flat_tire_patch: 'car_tire_puncture',
  water_cistern_low: 'water_cistern_truck',
  water_leak_pipe_emergency: 'hardware_pvc_plumbing_pipes',
  ac_service: 'ac_leaking_water',
  ac_freon_refill: 'ac_gas_refill',
  banking_atm_banconal: 'banking_atm_banconal',
  taxi_airport_pickup: 'taxi_airport_pickup',
  starlink_mounts: 'starlink_dish_offline',
  dining_table: 'dining_table_reservation',
};

const PRESET_TEXT_LOOKUP: Record<string, string> = PRESET_TEXT_MAP_DATA as Record<string, string>;

function normalizeForLookup(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[¡!¿?.,;:"]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Resolves high-fidelity audio for preset phrases.
 * Exclusively uses Diego (Male) and Sofia (Female).
 * Priority 1: Clip bundled inside the app (works offline from the first launch).
 * Priority 2: Previously downloaded copy in persistent storage (0 network).
 * Priority 3: Pre-rendered audio from CDN server (poquitotalk.hero-apps.com) - $0 ElevenLabs cost!
 * Priority 4: Fallback on-demand generation via generateGoogleGeminiAudio (and cache locally).
 */
export async function resolvePresetAudioUri(
  phraseId: string | undefined,
  text: string,
  personaName: 'Male' | 'Female' | string
): Promise<string | null> {
  const isMale = !personaName.toLowerCase().includes('female');
  // Strict voice personas: Diego (Male) and Sofia (Female)
  const personaKey = isMale ? 'diego' : 'sofia';

  let canonicalId = phraseId;
  if (!canonicalId && text) {
    const clean = normalizeForLookup(text);
    canonicalId = PRESET_TEXT_LOOKUP[clean];
  }

  if (canonicalId) {
    const resolvedId = PRESET_AUDIO_ALIASES[canonicalId] || canonicalId;
    const filename = `${personaKey}_${resolvedId}.mp3`;
    // documentDirectory, not cacheDirectory: the OS may purge caches under storage pressure
    const localUri = `${FileSystem.documentDirectory}poquito_preset_${filename}`;

    // 1. Clip bundled with the app (scripts/build_offline_presets.py) — no network needed
    const bundled = BUNDLED_PRESET_AUDIO[`${personaKey}_${resolvedId}`];
    if (bundled) {
      try {
        const asset = Asset.fromModule(bundled);
        await asset.downloadAsync(); // copies out of the app package; offline-safe
        if (asset.localUri) {
          return asset.localUri;
        }
      } catch (e) {
        // Fall through to the downloaded copy / CDN
      }
    }

    // 2. Check local persistent disk copy
    try {
      const info = await FileSystem.getInfoAsync(localUri);
      if (info.exists && info.size && info.size > 1000) {
        return localUri;
      }
    } catch (e) {
      // Ignore cache check errors
    }

    // 3. Fetch pre-rendered audio from LiteSpeed CDN server (0 ElevenLabs cost!)
    const remoteUrl = `${SERVER_CDN_BASE}/${filename}`;
    try {
      const downloadResult = await FileSystem.downloadAsync(remoteUrl, localUri);
      if (downloadResult.status === 200) {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists && fileInfo.size && fileInfo.size > 1000) {
          return localUri;
        }
      }
    } catch (cdnErr) {
      // Remote fetch failed, fall through to generator
    }
  }

  // 4. Fallback to on-demand generation (with deterministic disk caching)
  return await generateGoogleGeminiAudio(text, isMale ? 'Male' : 'Female');
}
