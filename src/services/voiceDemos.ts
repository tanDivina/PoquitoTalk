import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { VoiceOption } from './googleVoice';
import { generateElevenLabsAudio } from './elevenLabsVoice';

export interface VoiceDemoSample {
  personaName: string;
  scenarioTitle: string;
  categoryIcon: string;
  englishText: string;
  spanishDemoText: string;
}

export const VOICE_DEMO_SAMPLES: Record<string, VoiceDemoSample> = {
  Diego: {
    personaName: 'Diego',
    scenarioTitle: 'Boat Captain to Old Bank (Bastimentos)',
    categoryIcon: 'sail-boat',
    englishText: 'Hi Captain! Are you available to take two of us to Old Bank on Bastimentos tonight, and how much would it be for the two of us?',
    spanishDemoText: '¿Buenas capitán? ¿Tendrá disponibilidad para llevarnos a dos personas a Old Bank en Bastimentos esta noche y cuánto nos saldría?',
  },
  Mateo: {
    personaName: 'Mateo',
    scenarioTitle: 'A/C Technician Repair Request',
    categoryIcon: 'snowflake',
    englishText: 'Hello, the air conditioner in the main bedroom is leaking water and not cooling. Can someone inspect it today?',
    spanishDemoText: '¿Buenas? El aire acondicionado de la habitación principal está goteando agua y no está enfriando bien. ¿Podría venir un técnico a revisarlo hoy?',
  },
  Sofia: {
    personaName: 'Sofia',
    scenarioTitle: 'Waterfront Table & Dinner Catch of the Day',
    categoryIcon: 'silverware-fork-knife',
    englishText: 'Hi! Do you have a table for two available tonight around 7:00 PM, and what is the catch of the day?',
    spanishDemoText: '¡Buenas! ¿Tienen mesa disponible para dos personas hoy a las 7 de la noche y cuál es la pesca del día?',
  },
  Valeria: {
    personaName: 'Valeria',
    scenarioTitle: 'Bocas Town Laundry Wash & Fold',
    categoryIcon: 'tshirt',
    englishText: 'Hi! If I drop off two bags of laundry this morning, will they be ready by 5:00 PM today?',
    spanishDemoText: '¡Hola! ¿Si les llevo dos bolsas de ropa a lavar esta mañana, estarán listas hoy antes de las 5 de la tarde?',
  },
};

let currentSoundObject: Audio.Sound | null = null;

export async function playVoiceDemoSample(persona: VoiceOption): Promise<void> {
  const sample = VOICE_DEMO_SAMPLES[persona.name] || VOICE_DEMO_SAMPLES.Diego;
  
  // Stop any currently playing audio
  await stopVoiceDemoSample();

  // 1. First Priority: Try Hyper-Realistic ElevenLabs Studio Voices (Diego, Mateo, Sofia, Valeria)
  try {
    const elevenMp3Uri = await generateElevenLabsAudio(sample.spanishDemoText, persona.name);
    if (elevenMp3Uri) {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: elevenMp3Uri },
        { shouldPlay: true }
      );
      currentSoundObject = sound;
      return;
    }
  } catch (e) {
    console.warn('ElevenLabs demo audio generation fallback:', e);
  }

  // 2. Fallback: Native Device TTS
  let pitch = persona.pitch || 1.0;
  let rate = persona.rate || 0.88;

  if (persona.name === 'Diego') pitch = 0.72;
  else if (persona.name === 'Mateo') pitch = 0.65;
  else if (persona.name === 'Sofia') pitch = 1.05;
  else if (persona.name === 'Valeria') pitch = 1.15;

  try {
    const availableVoices = await Speech.getAvailableVoicesAsync();
    const spanishVoices = availableVoices.filter(
      (v) => v.language.toLowerCase().includes('es')
    );

    let esVoice = undefined;
    if (persona.gender === 'MALE') {
      esVoice = spanishVoices.find(
        (v) =>
          v.name.toLowerCase().includes('jorge') ||
          v.name.toLowerCase().includes('juan') ||
          v.name.toLowerCase().includes('diego') ||
          v.name.toLowerCase().includes('carlos') ||
          v.name.toLowerCase().includes('male') ||
          v.identifier.toLowerCase().includes('jorge') ||
          v.identifier.toLowerCase().includes('juan') ||
          v.identifier.toLowerCase().includes('male')
      );
    } else {
      esVoice = spanishVoices.find(
        (v) =>
          v.name.toLowerCase().includes('monica') ||
          v.name.toLowerCase().includes('paolina') ||
          v.name.toLowerCase().includes('sofia') ||
          v.name.toLowerCase().includes('female') ||
          v.identifier.toLowerCase().includes('female')
      );
    }

    Speech.speak(sample.spanishDemoText, {
      language: 'es-419',
      voice: esVoice ? esVoice.identifier : undefined,
      pitch: Math.max(0.4, Math.min(pitch, 2.0)),
      rate,
    });
  } catch (error) {
    Speech.speak(sample.spanishDemoText, {
      language: 'es-419',
      pitch: Math.max(0.4, Math.min(pitch, 2.0)),
      rate,
    });
  }
}

export async function stopVoiceDemoSample(): Promise<void> {
  try {
    await Speech.stop();
  } catch (e) {}

  if (currentSoundObject) {
    try {
      await currentSoundObject.stopAsync();
      await currentSoundObject.unloadAsync();
    } catch (e) {}
    currentSoundObject = null;
  }
}
