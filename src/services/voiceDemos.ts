import * as Speech from 'expo-speech';
import { VoiceOption } from './googleVoice';

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
    spanishDemoText: '¡Buenas capitán! ¿Tendrá disponibilidad para llevarnos a dos personas a Old Bank en Bastimentos esta noche y cuánto nos saldría?',
  },
  Mateo: {
    personaName: 'Mateo',
    scenarioTitle: 'A/C Technician Repair Request',
    categoryIcon: 'snowflake',
    englishText: 'Hello, the air conditioner in the main bedroom is leaking water and not cooling. Can someone inspect it today?',
    spanishDemoText: 'Hola, el aire acondicionado de la habitación principal está goteando agua y no está enfriando bien. ¿Podría venir un técnico a revisarlo hoy?',
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
    spanishDemoText: '¡Hola! Si les llevo dos bolsas de ropa a lavar esta mañana, ¿estarán listas hoy antes de las 5 de la tarde?',
  },
};

export async function playVoiceDemoSample(persona: VoiceOption): Promise<void> {
  const sample = VOICE_DEMO_SAMPLES[persona.name] || VOICE_DEMO_SAMPLES.Diego;
  
  // Stop any currently playing audio
  await Speech.stop();

  let pitch = persona.pitch || 1.0;
  let rate = persona.rate || 0.90;

  // Ensure natural female/male pitch bounds
  if (persona.name === 'Sofia') pitch = 1.02;
  else if (persona.name === 'Valeria') pitch = 1.08;
  else if (persona.name === 'Diego') pitch = 0.96;
  else if (persona.name === 'Mateo') pitch = 0.90;

  try {
    const availableVoices = await Speech.getAvailableVoicesAsync();
    const esVoice = availableVoices.find(
      (v) => (v.language.includes('es') || v.language.includes('ES')) &&
             (persona.gender === 'FEMALE' ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('monica') || v.name.toLowerCase().includes('paolina') : true)
    );

    Speech.speak(sample.spanishDemoText, {
      language: 'es-419', // Latin American Spanish
      voice: esVoice ? esVoice.identifier : undefined,
      pitch,
      rate,
    });
  } catch (error) {
    Speech.speak(sample.spanishDemoText, {
      language: 'es',
      pitch,
      rate,
    });
  }
}

export function stopVoiceDemoSample(): void {
  Speech.stop();
}
