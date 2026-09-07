import * as Speech from 'expo-speech';
import { Audio } from './audioCompat';
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
  Sofia: {
    personaName: 'Sofia',
    scenarioTitle: 'Waterfront Table & Dinner Catch of the Day',
    categoryIcon: 'silverware-fork-knife',
    englishText: 'Hi! Do you have a table for two available tonight around 7:00 PM, and what is the catch of the day?',
    spanishDemoText: '¡Buenas! ¿Tienen mesa disponible para dos personas hoy a las 7 de la noche y cuál es la pesca del día?',
  },
  Male: {
    personaName: 'Diego',
    scenarioTitle: 'Boat Captain to Old Bank (Bastimentos)',
    categoryIcon: 'sail-boat',
    englishText: 'Hi Captain! Are you available to take two of us to Old Bank on Bastimentos tonight?',
    spanishDemoText: '¿Buenas capitán? ¿Tendrá disponibilidad para llevarnos a dos personas a Old Bank en Bastimentos esta noche?',
  },
  Female: {
    personaName: 'Sofia',
    scenarioTitle: 'Waterfront Table & Dinner Catch of the Day',
    categoryIcon: 'silverware-fork-knife',
    englishText: 'Hi! Do you have a table for two available tonight around 7:00 PM?',
    spanishDemoText: '¡Buenas! ¿Tienen mesa disponible para dos personas hoy a las 7 de la noche?',
  },
};

let currentSoundObject: Audio.Sound | null = null;
let isPlayingDemo = false;

export async function playVoiceDemoSample(persona: VoiceOption): Promise<void> {
  const sample = VOICE_DEMO_SAMPLES[persona.name] || VOICE_DEMO_SAMPLES[persona.gender === 'FEMALE' ? 'Sofia' : 'Diego'] || VOICE_DEMO_SAMPLES.Diego;
  
  // If already playing, stop playback and return (toggle)
  if (isPlayingDemo) {
    await stopVoiceDemoSample();
    isPlayingDemo = false;
    return;
  }

  // Stop any currently playing audio across the whole app
  await stopVoiceDemoSample();
  isPlayingDemo = true;

  // 1. First Priority: Try Hyper-Realistic ElevenLabs Voices (Diego, Sofia)
  try {
    const elevenMp3Uri = await generateElevenLabsAudio(sample.spanishDemoText, sample.personaName);
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
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          isPlayingDemo = false;
          sound.unloadAsync();
        }
      });
      return;
    }
  } catch (e) {
    console.warn('ElevenLabs demo audio generation fallback:', e);
  }

  // 2. Fallback: Native Device TTS
  let pitch = persona.pitch || 1.0;
  let rate = persona.rate || 0.88;

  if (persona.name === 'Diego' || persona.gender === 'MALE') pitch = 0.72;
  else if (persona.name === 'Sofia' || persona.gender === 'FEMALE') pitch = 1.05;

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
      onDone: () => { isPlayingDemo = false; },
      onError: () => { isPlayingDemo = false; },
    });
  } catch (error) {
    Speech.speak(sample.spanishDemoText, {
      language: 'es-419',
      pitch: Math.max(0.4, Math.min(pitch, 2.0)),
      rate,
      onDone: () => { isPlayingDemo = false; },
      onError: () => { isPlayingDemo = false; },
    });
  }
}

export async function stopVoiceDemoSample(): Promise<void> {
  isPlayingDemo = false;
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
