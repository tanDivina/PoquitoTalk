// Translation service: island phrase map, then MyMemory, our proxy and Google Translate, polished for Panamanian Spanish
// Tailored for Bocas del Toro, Panama (Spanish - Panamanian / Latin American Regional Focus)

import { normalizeBocasTerminology } from './transcriptionService';

export const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish (Panamá)', nativeName: 'Español (Panamá)', flag: '🇵🇦' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
];

export async function translateText(
  inputText: string,
  fromLangCode: string = 'en',
  toLangCode: string = 'es',
  categoryContext?: string
): Promise<string> {
  const normalizedInput = normalizeBocasTerminology(inputText.trim()).toLowerCase();

  // 1. Instant Local Panamanian Spanish Quick Map
  const panamaQuickMap: Record<string, string> = {
    // Quick Island Scenarios & High Frequency
    'bastimentos': 'Bastimentos',
    'to bastimentos': 'A Bastimentos',
    'a bastimentos': 'A Bastimentos',
    'old bank': 'Old Bank',
    'old bank, bastimentos': 'Old Bank, Bastimentos',
    'red frog': 'Red Frog',
    'red frog, bastimentos': 'Red Frog, Bastimentos',
    'boat to bastimentos': 'Una lancha a Bastimentos.',
    'a boat to bastimentos': 'Una lancha a Bastimentos.',
    'i need a boat to bastimentos': 'Necesito una lancha a Bastimentos.',
    'i need a boat to bastimentos.': 'Necesito una lancha a Bastimentos.',
    'i need a water taxi to bastimentos': 'Necesito una lancha a Bastimentos.',
    'i need a water taxi to bastimentos.': 'Necesito una lancha a Bastimentos.',
    'water taxi to bastimentos': 'Una lancha a Bastimentos.',
    'i want to go to bastimentos': 'Quiero ir a Bastimentos.',
    'i want to go to bastimentos.': 'Quiero ir a Bastimentos.',
    'take me to bastimentos': 'Lléveme a Bastimentos.',
    'can you take me to bastimentos?': '¿Me puede llevar a Bastimentos?',
    'can you take us to bastimentos?': '¿Nos puede llevar a Bastimentos?',
    'how much is a boat to bastimentos?': '¿Cuánto sale la lancha a Bastimentos?',
    'how much to bastimentos?': '¿Cuánto sale el viaje a Bastimentos?',
    'how much is a water taxi to bastimentos?': '¿Cuánto sale la lancha a Bastimentos?',
    'are you available to go to bastimentos?': '¿Tiene disponibilidad para ir a Bastimentos?',
    'boat to carenero': 'Una lancha a Carenero.',
    'i need a boat to carenero': 'Necesito una lancha a Carenero.',
    'how much for a water taxi to carenero?': '¿Cuánto sale la lancha a Carenero?',
    'how much for a water taxi to carenero': '¿Cuánto sale la lancha a Carenero?',
    'how much is a water taxi to carenero?': '¿Cuánto sale la lancha a Carenero?',
    'how much is a water taxi to carenero': '¿Cuánto sale la lancha a Carenero?',
    'boat to solarte': 'Una lancha a Isla Solarte.',
    'i need a boat to solarte': 'Necesito una lancha a Isla Solarte.',
    'hi, is there a power outage or blackout affecting our sector in bocas right now?': '¡Buenas! ¿Hay algún corte de luz o apagón afectando nuestro sector en Bocas en este momento?',
    'is there a power outage or blackout affecting our sector in bocas right now?': '¡Buenas! ¿Hay algún corte de luz o apagón afectando nuestro sector en Bocas en este momento?',
    'hi! do you have a water tanker truck available to fill a 1,500 gallon reserve tank at my property today?': '¡Buenas! ¿Tendrá disponible un camión cisterna para llenar un tanque de reserva de 1,500 galones en mi propiedad hoy?',
    'hi! do you have a water tanker truck available to fill a reserve cistern tank at my property today?': '¡Buenas! ¿Tendrá disponible un camión cisterna para llenar un tanque de reserva de 1,500 galones en mi propiedad hoy?',
    'hi! do you have a water truck available to fill a reserve cistern tank at my house today?': '¡Buenas! ¿Tendrá disponible un camión cisterna para llenar el tanque de reserva de agua en mi casa hoy?',
    'hello, the air conditioner in the main bedroom is leaking water and not cooling. can someone inspect it today?': '¡Buenas! El aire acondicionado de la recámara principal está botando agua y no enfría. ¿Podría venir alguien a revisarlo hoy?',
    'hi captain! are you available to take two of us to old bank on bastimentos tonight, and how much would it be for the two of us?': '¡Buenas, capitán! ¿Tiene disponibilidad para llevarnos a dos personas a Old Bank en Bastimentos esta noche, y cuánto nos saldría?',
    'hello! my dog is showing signs of cane toad contact / fever. is the vet clinic open right now?': '¡Buenas! Mi perro tuvo contacto con un sapo de caña / tiene fiebre. ¿La clínica veterinaria está abierta en este momento?',
    'hello! my dog is showing signs of cane toad contact. is the vet clinic open right now?': '¡Buenas! Mi perro tuvo contacto con un sapo de caña. ¿La clínica veterinaria está abierta en este momento?',
    'hi! are you available for a land taxi ride to playa bluff from bocas town today?': '¡Buenas! ¿Tendrá disponibilidad para un viaje en taxi a Playa Bluff desde Bocas Town hoy?',
    'hi! are you available for a taxi ride to playa bluff / paunch today?': '¡Buenas! ¿Tendrá disponibilidad para un viaje en taxi a Playa Bluff / Paunch hoy?',

    // Medical & Pharmacy
    'hi! i have a fever and severe pain. is a doctor available for a consultation today?': '¡Buenas! Tengo fiebre y dolor intenso. ¿Tienen un médico disponible para una consulta hoy, por favor?',
    'hello, do you have medication for fever/infection in the pharmacy and what time are you open until?': 'Hola, ¿tienen medicamentos para la infección o fiebre en la farmacia y hasta qué hora están abiertos?',
    'hi! i need urgent medical assistance or an ambulance immediately, please.': '¡Buenas! Necesito asistencia médica de emergencia o una ambulancia inmediatamente, por favor.',
    'hi, i need an urgent doctor consultation or nearest open pharmacy in bocas.': '¡Buenas! Necesito una consulta médica urgente o la farmacia abierta más cercana en Bocas.',

    // Dentist
    'hi! i have a severe toothache. is a dentist appointment available today?': '¡Buenas! Tengo un dolor de muela muy fuerte, ¿tendrá cita disponible con el dentista hoy?',
    'hello, i would like to schedule a dental cleaning appointment for next week.': 'Hola, quisiera programar una cita para una limpieza dental la próxima semana.',
    'hi, i would like to inquire about the results of my laboratory exams.': 'Buenas, quisiera consultar por los resultados de mis exámenes de laboratorio.',
    'hi, i have a severe toothache and need an urgent dentist appointment today.': '¡Buenas! Tengo un dolor de muela fuerte y necesito una cita urgente con el dentista hoy.',

    // Air Conditioning & Appliances
    'hi! the air conditioner is leaking water inside the room. could you come check it?': '¡Buenas! El aire acondicionado está goteando agua dentro de la habitación. ¿Podría venir a revisarlo?',
    'hello, the air conditioner turns on but is not blowing cold air. i think it needs gas refill.': 'Hola, el aire acondicionado enciende pero no echa aire frío. Creo que necesita recarga de gas.',
    'hello, the air conditioner remote control is not responding. could you check it?': 'Hola, el control remoto del aire no responde. ¿Podría revisarlo?',
    'my air conditioning unit is leaking water and not blowing cold air.': '¡Buenas! El aire acondicionado está goteando agua y no está enfriando bien. ¿Podría revisarlo?',
    'hello, the refrigerator stopped cooling today. could a technician inspect it?': 'Hola, la nevera dejó de enfriar hoy. ¿Podría venir un técnico a revisarla?',
    'hi, the washing machine is not draining water at the end of the cycle.': 'Buenas, la lavadora no está botando el agua al final del ciclo.',
    'hello, the stove burner is not igniting properly.': 'Hola, el quemador de la estufa no está encendiendo bien.',
    'our refrigerator stopped cooling and the food inside is defrosting.': 'Hola, la nevera dejó de enfriar y los alimentos se están descongelando. ¿Podría revisarla?',

    // Boat Repairs & Marine
    'hi! the boat outboard motor won\'t start. do you do marine mechanics here?': '¡Buenas! El motor fuera de borda de la lancha no quiere arrancar. ¿Hace trabajos de mecánica marina por aquí?',
    'hi! i need someone to check the automatic bilge pump and marine battery wiring, please.': '¡Buenas! Necesito que alguien revise la bomba de achique automática y el cableado de la batería marina, por favor.',
    'hi! do you do hull cleaning and propeller inspection at the dock?': '¡Buenas! ¿Realiza limpieza de casco y revisión de hélice en el muelle?',
    'the outboard motor is turning over but will not start.': '¡Buenas! El motor fuera de borda da marcha pero no arranca. ¿Tendrá disponibilidad para revisarlo?',

    // Vehicles & Mechanics
    'hi! the car battery is dead. could someone bring jumper cables or a new battery?': '¡Buenas! La batería del carro se descargó por completo. ¿Alguien podría traerme cables o una batería nueva?',
    'hello, the tire has a nail in it and lost air. where can i get it repaired nearby?': 'Hola, la llanta tiene un clavo y perdió aire. ¿Dónde podría repararla cerca?',
    'hi, i would like to schedule an oil change and general brake checkup.': 'Buenas, quisiera programar un cambio de aceite y revisión general de frenos.',
    'my car battery is dead and i need a jump start or replacement.': '¡Buenas! La batería del carro se descargó y necesito auxilio o reemplazo.',

    // Internet & Starlink
    'hi, the starlink dish lost connection. is there a signal outage in the area?': 'Buenas, la antena de Starlink perdió la conexión. ¿Hay alguna caída de señal en la zona?',
    'hello, the internet fiber cable outside the house appears damaged or cut.': 'Hola, el cable de fibra de internet afuera de la casa parece dañado o cortado.',
    'hi, the internet is very slow today. could you check the line status?': 'Buenas, el internet está muy lento hoy. ¿Podría verificar el estado de la línea?',
    'my starlink dish lost signal connection and the router light is red.': 'Buenas, la antena de Starlink perdió conexión y la luz del router está roja.',

    // Housing & Property
    'hi! the water pressure in the main bathroom dropped completely.': '¡Buenas! La presión del agua en el baño principal bajó por completo.',
    'hello, i accidentally locked myself out. do you have a spare key nearby?': 'Hola, me quedé fuera por accidente. ¿Tendrá un duplicado de la llave cerca?',
    'hi, i sent the rent payment via transfer and attached the proof.': 'Buenas, ya le envié el pago del alquiler por transferencia y le adjunté el comprobante.',
    'hi, the water pressure in the shower dropped significantly today.': '¡Buenas! La presión del agua en la ducha bajó por completo hoy.',

    // Restaurants & Reservations
    'hi! i would like to reserve a table for 4 people tonight at 7:30 pm, please.': '¡Buenas! Quisiera reservar una mesa para 4 personas esta noche a las 7:30 PM, por favor.',
    'hello, do you offer vegetarian or gluten-free meal options on your menu?': 'Hola, ¿ofrecen opciones vegetarianas o sin gluten en su menú?',
    'hi! could you send me your current food menu and today\'s specials via whatsapp?': '¡Buenas! ¿Podría enviarme el menú actual y los platos del día por WhatsApp, por favor?',
    'hi, i would like to reserve a dinner table for 4 people tonight at 7:30 pm.': '¡Buenas! Quisiera reservar una mesa para cenar para 4 personas esta noche a las 7:30 PM.',
    // Gardening, Nursery & Plants (Finca Montezuma / Bocas Landscaping)
    'i need some new plants': 'Necesito algunas plantas nuevas.',
    'i need some plants': 'Necesito unas plantas.',
    'i need plants': 'Necesito unas plantas.',
    'i need some plants for my garden': 'Necesito unas plantas para mi jardín.',
    'do you have fruit trees available?': '¿Tienen árboles frutales disponibles?',
    'do you have fruit trees?': '¿Tienen árboles frutales?',
    'how much are the plants?': '¿A cómo salen las plantas?',
    'how much are the fruit trees?': '¿A cómo salen los árboles frutales?',
    'do you deliver plants to the dock or island?': '¿Hacen entregas de plantas al muelle o a la isla?',
  };

  if (panamaQuickMap[normalizedInput]) {
    return panamaQuickMap[normalizedInput];
  }

  // 2. Smart Language Direction Detection
  // Prevent accidental English -> English passthrough when previous screen left fromLang as 'es'
  const isPredominantlyEnglish = /\b(i|need|some|new|plants|plant|want|have|please|where|when|what|how|who|can|could|would|you|the|is|are|we|they|hello|hi|good|morning|afternoon|tonight|water|electrician|doctor|taxi|boat|captain|price|cost|tomorrow|today|garden|tree|trees)\b/i.test(inputText);
  const isPredominantlySpanish = /\b(necesito|quiero|tengo|plantas|planta|por favor|donde|cuando|que|como|quien|puede|podria|usted|el|la|los|las|es|son|somos|ellos|hola|buenas|buenos|dias|tardes|noches|agua|lancha|chofer|medico|doctor|cuanto|sale|cuesta|manana|hoy|jardin|arbol|arboles)\b/i.test(inputText);

  let from = fromLangCode || 'en';
  let to = toLangCode || 'es';

  if (isPredominantlyEnglish && to === 'en') {
    from = 'en';
    to = 'es';
  } else if (isPredominantlySpanish && to === 'es') {
    from = 'es';
    to = 'en';
  }

  const encoded = encodeURIComponent(inputText.trim());

  // 3. Real Translation via MyMemory API (Instant & Unrestricted)
  try {
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${from}|${to}`;
    const myMemoryRes = await fetch(myMemoryUrl);
    if (myMemoryRes.ok) {
      const data = await myMemoryRes.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const rawText = data.responseData.translatedText.trim();
        const isEcho = rawText.toLowerCase().replace(/[^a-z0-9]/g, '') === inputText.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        if (rawText.length > 0 && !rawText.includes('MYMEMORY WARNING') && (!isEcho || from === to)) {
          return polishPanamaSpanish(rawText, from, to, inputText);
        }
      }
    }
  } catch (e) {
    console.warn('MyMemory translation failed:', e);
  }

  // 4. Fallback: LiteSpeed Backend Translation Proxy
  try {
    const proxyRes = await fetch('https://poquitotalk.hero-apps.com/api/translate.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: inputText.trim(),
        from: from,
        to: to,
      }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && data.success && data.translated) {
        const rawText = data.translated.trim();
        const isEcho = rawText.toLowerCase().replace(/[^a-z0-9]/g, '') === inputText.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!isEcho || from === to) {
          return polishPanamaSpanish(rawText, from, to, inputText);
        }
      }
    }
  } catch (e) {
    console.warn('LiteSpeed translate proxy failed:', e);
  }

  // 5. Fallback: Google GTX direct endpoint
  try {
    const directUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encoded}`;
    const directRes = await fetch(directUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });

    if (directRes.ok) {
      const data = await directRes.json();
      if (data && data[0] && Array.isArray(data[0])) {
        const translated = data[0].map((chunk: any) => chunk[0]).filter(Boolean).join('');
        if (translated && translated.trim().length > 0) {
          return polishPanamaSpanish(translated.trim(), from, to, inputText);
        }
      }
    }
  } catch (e) {
    console.warn('Direct Google GTX translation failed:', e);
  }

  // 6. Clean Fallback: Local Panama inference
  return panamaLocalInference(inputText);
}

function polishPanamaSpanish(translatedText: string, fromLang: string, toLang: string, originalInput: string = ''): string {
  if (toLang === 'en') {
    return polishPanamaEnglish(translatedText, originalInput);
  }

  if (toLang !== 'es') {
    return translatedText;
  }

  let text = translatedText.trim();

  // 1. Regional phonetic normalization (e.g. Bastimentus -> Bastimentos)
  text = normalizeBocasTerminology(text);

  // 2. Natural Panamanian local vocabulary adaptations
  // In Bocas del Toro, island boat transit is always "lancha", never "barco"
  text = text.replace(/\bun\s+barco\b/gi, 'una lancha');
  text = text.replace(/\bel\s+barco\b/gi, 'la lancha');
  text = text.replace(/\bunos\s+barcos\b/gi, 'unas lanchas');
  text = text.replace(/\blos\s+barcos\b/gi, 'las lanchas');
  text = text.replace(/\bun\s+taxi\s+acuático\b/gi, 'una lancha');
  text = text.replace(/\bel\s+taxi\s+acuático\b/gi, 'la lancha');
  text = text.replace(/\btaxi\s+acuático\b/gi, 'lancha');
  text = text.replace(/\btaxis\s+acuáticos\b/gi, 'lanchas');
  text = text.replace(/\bun\s+water\s+taxi\b/gi, 'una lancha');
  text = text.replace(/\bel\s+water\s+taxi\b/gi, 'la lancha');
  text = text.replace(/\bwater\s+taxi\b/gi, 'lancha');
  text = text.replace(/\bbarco\b/gi, 'lancha');
  text = text.replace(/\bbarcos\b/gi, 'lanchas');
  text = text.replace(/\bwater truck\b/gi, 'camión cisterna');
  text = text.replace(/\bwater tank\b/gi, 'tanque de reserva');
  text = text.replace(/\bdormitorio\b/gi, 'recámara');
  text = text.replace(/\bhabitación principal\b/gi, 'recámara principal');
  // Water cuts are "se fue el agua" in Panama, not the textbook "el agua se detuvo"
  text = text.replace(/(^|[.!?]\s+)el agua se (detuvo|paró|cortó)/gi, '$1Se fue el agua');
  text = text.replace(/\bel agua se (detuvo|paró|cortó)/gi, 'se fue el agua');

  // Proper Spanish punctuation: open each question/exclamation sentence with ¿/¡,
  // not the whole message ("Se fue el agua. ¿Puede...?", not "¿Se fue el agua. Puede...?")
  text = text.replace(/(^|[.!?]\s+)([^.!?¿¡]+\?)/g, '$1¿$2');
  text = text.replace(/(^|[.!?]\s+)([^.!?¿¡]+!)/g, '$1¡$2');

  return text;
}

function polishPanamaEnglish(translatedText: string, originalSpanish: string = ''): string {
  let text = translatedText.trim();

  // 1. Fix literal "Good friend" / "Good buddy" from Panamanian greeting "Buenas amigo" / "Buenas compa"
  text = text.replace(/^(¡|!)?\s*Good\s+friend\b/i, 'Hello friend');
  text = text.replace(/^(¡|!)?\s*Good\s*,\s*friend\b/i, 'Hello friend');
  text = text.replace(/^(¡|!)?\s*Good\s+buddy\b/i, 'Hello friend');
  text = text.replace(/^(¡|!)?\s*Good\s+partner\b/i, 'Hello friend');
  text = text.replace(/^(¡|!)?\s*Good\s+Captain\b/i, 'Hello Captain');
  text = text.replace(/^(¡|!)?\s*Good\s+boss\b/i, 'Hello boss');

  // 2. If original was Panamanian greeting "Buenas" (without "tardes" or "noches")
  if (originalSpanish && /^\s*(¡|!)?\s*Buenas\b(?!\s+(tardes|noches|dias))/i.test(originalSpanish)) {
    text = text.replace(/^(¡|!)?\s*Good\s+morning[!,\.\s]*/i, 'Hello! ');
    text = text.replace(/^(¡|!)?\s*Good\s+day[!,\.\s]*/i, 'Hello! ');
    text = text.replace(/^(¡|!)?\s*Good[!,\.\s]+/i, 'Hello! ');
  } else {
    text = text.replace(/^(¡|!)?\s*Good!\s*(Yes|Yeah|I|We|Sure|No|Today|Tomorrow|Right)\b/i, 'Hello! $2');
    text = text.replace(/^(¡|!)?\s*Good,\s*(yes|yeah|i|we|sure|no|today|tomorrow|right)\b/i, 'Hello, $2');
  }

  // 3. Panamanian colloquialisms ("A la orden", "Dale", etc.)
  text = text.replace(/\bTo(\s+the)?\s+order\b/gi, 'At your service');
  text = text.replace(/\bIn(\s+the)?\s+order\b/gi, 'At your service');
  text = text.replace(/^(¡|!)?\s*Give it[!,\.\s]+/i, 'Sounds good! ');

  return text;
}

function panamaLocalInference(input: string): string {
  const lower = input.toLowerCase();
  const hasGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|buenas|hola)\b/i.test(lower);
  const greeting = hasGreeting ? '¡Buenas! ' : '';

  if (/\b(plant|plants|nursery|garden|tree|trees|cacao|fruit|planta|plantas|vivero|jardín|árbol|árboles)\b/i.test(lower)) {
    return `${greeting}Necesito algunas plantas nuevas para mi propiedad o jardín. ¿Qué especies tienen disponibles hoy?`;
  }
  if (/\b(power|blackout|electricity|luz|apagón)\b/i.test(lower)) {
    return `${greeting}¿Hay algún corte de luz o apagón en este sector de Bocas ahora mismo?`;
  }
  if (/\b(water tanker|water truck|cistern|tanque de agua)\b/i.test(lower)) {
    return `${greeting}Necesitamos un viaje de agua en camión cisterna para llenar el tanque de reserva.`;
  }
  if (/\b(air conditioning|a\/c|ac unit|aire acondicionado)\b/i.test(lower)) {
    return `${greeting}El aire acondicionado tiene un problema y no está enfriando bien. ¿Podría revisarlo?`;
  }
  if (/\b(boat|lancha|captain|capitán)\b/i.test(lower)) {
    return `${greeting}¿Tendrá disponibilidad y tarifa para un viaje en lancha?`;
  }
  if (/\b(taxi|cab|driver|chofer)\b/i.test(lower)) {
    return `${greeting}¿Tendrá disponibilidad para un viaje en taxi hoy?`;
  }
  if (/\b(doctor|hospital|fever|urgent medical|médico|ambulancia)\b/i.test(lower)) {
    return `${greeting}Necesito una consulta médica o asistencia de salud. ¿Tendrá disponibilidad hoy?`;
  }
  if (/\b(vet|veterinarian|veterinaria|cane toad|sapo)\b/i.test(lower)) {
    return `${greeting}Mi mascota necesita atención veterinaria. ¿La clínica está abierta?`;
  }

  return input;
}

// ---------------------------------------------------------------------------
//  INBOUND WHATSAPP VOICE NOTE DECODER ENGINE
// ---------------------------------------------------------------------------

export interface VoiceNoteDecodeResult {
  spanishTranscription: string;
  englishMeaning: string;
  senderContext: string;
  suggestedReplies: {
    spanish: string;
    english: string;
    tone: string;
  }[];
}

export const SAMPLE_VOICE_NOTES = [
  {
    id: 'boat_captain',
    title: 'Boat Captain (Dock Arrival)',
    sender: 'Water Taxi Captain',
    iconName: 'boat',
    duration: '0:14',
    sampleText: '¡Buenas jefe! Ya voy saliendo del muelle central de Bocas Town con la lancha. Llego a Carenero en unos diez minutos con los tanques de agua.',
  },
  {
    id: 'ac_technician',
    title: 'A/C Repair Tech (Gas & Leak)',
    sender: 'A/C & Cooling Technician',
    iconName: 'snow',
    duration: '0:22',
    sampleText: 'Hola amigo, revisé el split. La fuga está en la tubería de cobre del compresor y le falta refrigerante R410. Tengo repuesto para cambiárselo hoy en la tarde si le parece bien.',
  },
  {
    id: 'plumber_water',
    title: 'Plumber (Water Pump & Cistern)',
    sender: 'Plumber & Water Systems',
    iconName: 'construct',
    duration: '0:18',
    sampleText: '¡Buenas tardes patrón! La bomba de agua no tenía presión porque agarró aire la válvula de pie. Ya quedó purgada y llenando el tanque de arriba.',
  },
  {
    id: 'landlord_rent',
    title: 'Landlord (Utility & Power Outage)',
    sender: 'Property Management',
    iconName: 'home',
    duration: '0:16',
    sampleText: 'Buenas noches, le aviso que mañana cortan la luz de 8am a 12md en todo Bluff por mantenimiento de Naturgy. Dejé la planta eléctrica lista por si la necesitan.',
  },
];

export async function decodeVoiceNote(inputAudioOrText: string): Promise<VoiceNoteDecodeResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const lower = inputAudioOrText.toLowerCase();

  // Boat Captain Scenario
  if (lower.includes('lancha') || lower.includes('muelle') || lower.includes('carenero') || lower.includes('mingo') || lower.includes('capitán') || lower.includes('boat')) {
    return {
      senderContext: 'Boat Captain / Water Taxi Driver',
      spanishTranscription: '¡Buenas jefe! Ya voy saliendo del muelle central de Bocas Town con la lancha. Llego a Carenero en unos diez minutos con los tanques de agua.',
      englishMeaning: 'Captain Mingo is letting you know he just left the main Bocas Town dock in his boat and will arrive at your dock in Carenero in about 10 minutes with the water tanks.',
      suggestedReplies: [
        {
          tone: 'Confirm & Wait',
          spanish: '¡Excelente Capitán! Acá lo estoy esperando en el muelle de madera.',
          english: 'Excellent Captain! I am waiting for you here at the wooden dock.',
        },
        {
          tone: 'Ask Total Price',
          spanish: 'Perfecto amigo, ¿cuánto sería el total del viaje y el flete de los tanques?',
          english: 'Perfect my friend, how much is the total for the trip and freight of the tanks?',
        },
        {
          tone: 'Slight Delay Request',
          spanish: 'Entendido, deme 5 minutos que voy bajando al muelle.',
          english: 'Understood, give me 5 minutes, I am walking down to the dock right now.',
        },
      ],
    };
  }

  // Plumber Scenario (Check before AC to prevent trapped air 'aire' matching)
  if (lower.includes('bomba') || lower.includes('válvula') || lower.includes('purgada') || lower.includes('plomer') || lower.includes('fontaner')) {
    return {
      senderContext: 'Plumber & Water Systems Specialist',
      spanishTranscription: '¡Buenas tardes patrón! La bomba de agua no tenía presión porque agarró aire la válvula de pie. Ya quedó purgada y llenando el tanque de arriba.',
      englishMeaning: 'The plumber explains that the water pump lost pressure due to air trapped in the foot valve. It has been purged and is now filling the upper cistern tank.',
      suggestedReplies: [
        {
          tone: 'Confirm & Thank',
          spanish: '¡Buenas tardes! Excelente noticia, muchas gracias por purgar la bomba.',
          english: 'Good afternoon! Excellent news, thank you very much for purging the pump.',
        },
        {
          tone: 'Ask for Bill',
          spanish: 'Perfecto maestro, ¿cuánto sería el total por el servicio?',
          english: 'Perfect master, what would be the total for the service?',
        },
      ],
    };
  }

  // A/C Technician Scenario
  if (lower.includes('aire acondicionado') || lower.includes('fuga') || lower.includes('refrigerante') || lower.includes('compresor') || lower.includes('split') || /\ba\/c\b/i.test(lower) || /\bac\b/i.test(lower)) {
    return {
      senderContext: 'Air Conditioning Technician',
      spanishTranscription: 'Hola amigo, revisé el split. La fuga está en la tubería de cobre del compresor y le falta refrigerante R410. Tengo repuesto para cambiárselo hoy en la tarde si le parece bien.',
      englishMeaning: 'The technician found a leak in the copper tubing on the A/C compressor and it needs an R410 gas recharge. He has the replacement parts and can do it this afternoon if you approve.',
      suggestedReplies: [
        {
          tone: 'Approve & Ask Cost',
          spanish: '¡Buenas tardes! Sí, por favor proceda. ¿Cuánto saldría el trabajo completo con los repuestos?',
          english: 'Good afternoon! Yes, please proceed. How much would the complete repair be with parts?',
        },
        {
          tone: 'Confirm Afternoon Time',
          spanish: 'Perfecto, ¿a qué hora aproximadamente estaría llegando esta tarde?',
          english: 'Perfect, approximately what time will you be arriving this afternoon?',
        },
        {
          tone: 'Reschedule',
          spanish: 'Gracias por avisar. ¿Podría venir mañana temprano en la mañana en vez de hoy?',
          english: 'Thanks for letting me know. Could you come tomorrow morning instead of today?',
        },
      ],
    };
  }

  // Landlord / Utility Outage Scenario
  if (lower.includes('naturgy') || lower.includes('cortan la luz') || lower.includes('planta eléctrica') || lower.includes('arrendador') || lower.includes('alquiler')) {
    return {
      senderContext: 'Property Management & Landlord',
      spanishTranscription: 'Buenas noches, le aviso que mañana cortan la luz de 8am a 12md en todo Bluff por mantenimiento de Naturgy. Dejé la planta eléctrica lista por si la necesitan.',
      englishMeaning: 'The property manager informs you of a scheduled power outage tomorrow by Naturgy from 8am to 12pm, and the backup generator is prepared.',
      suggestedReplies: [
        {
          tone: 'Acknowledge & Thank',
          spanish: 'Muchas gracias por avisar, estaremos atentos con la planta.',
          english: 'Thank you very much for letting us know, we will keep an eye on the generator.',
        },
      ],
    };
  }

  // General / Default Voice Note
  return {
    senderContext: 'Panamanian Local Contractor',
    spanishTranscription: inputAudioOrText.trim(),
    englishMeaning: 'The contractor is reaching out with an update regarding your service request and confirming availability.',
    suggestedReplies: [
      {
        tone: 'Confirm & Thank',
        spanish: '¡Buenas! Recibido y de acuerdo, muchas gracias por la pronta respuesta.',
        english: 'Good day! Received and agreed, thank you very much for the quick response.',
      },
      {
        tone: 'Ask for Estimate',
        spanish: 'Entendido. ¿Me podría dar un estimado del costo antes de empezar?',
        english: 'Understood. Could you give me a cost estimate before starting?',
      },
      {
        tone: 'Location Sharing',
        spanish: 'Perfecto, le acabo de compartir mi ubicación exacta por WhatsApp.',
        english: 'Perfect, I just shared my exact location with you via WhatsApp.',
      },
    ],
  };
}

// ---------------------------------------------------------------------------
//  DOCUMENT & UTILITY BILL PHOTO SCANNER ENGINE
// ---------------------------------------------------------------------------

export interface DocumentScanResult {
  docType: string;
  badge: string;
  dueOrTotal: string;
  englishSummary: string;
  keyDetails: { label: string; value: string; english: string }[];
  suggestedQuestions: {
    spanish: string;
    english: string;
  }[];
}

export const SAMPLE_DOCUMENTS = [
  { id: 'naturgy_power', title: 'Naturgy Electricity Bill', category: 'Electricity', icon: 'flash' },
  { id: 'idaan_water', title: 'IDAAN Water Utility Bill', category: 'Water', icon: 'water' },
  { id: 'lease_agreement', title: 'Rental Lease Agreement', category: 'Rental', icon: 'document-text' },
];

export async function scanDocumentOrBill(docIdOrText: string): Promise<DocumentScanResult> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const lower = docIdOrText.toLowerCase();

  // 1. Naturgy Power Bill
  if (lower.includes('naturgy') || lower.includes('ensa') || lower.includes('electr') || lower.includes('luz') || lower.includes('kwh') || lower.includes('power') || lower.includes('naturgy_power')) {
    return {
      docType: 'Naturgy Electricity Bill (Factura de Luz)',
      badge: 'Bocas del Toro / Naturgy Panamá',
      dueOrTotal: '$48.50 USD (B/. 48.50)',
      englishSummary: 'Monthly residential electricity bill (Tarifa BTS). Normal consumption of 210 kWh with municipal trash service included. No overdue balance.',
      keyDetails: [
        { label: 'Total a Pagar', value: '$48.50', english: 'Total Amount Due' },
        { label: 'Fecha Límite de Pago', value: '25 de Agosto', english: 'Due Date' },
        { label: 'NIS (Radicación / Cuenta)', value: '2049182-3', english: 'Supply ID / Account Number' },
        { label: 'Tarifa / Medidor', value: 'BTS • #681024', english: 'Low Voltage Residential Rate & Meter' },
        { label: 'Consumo Facturado', value: '210 kWh', english: 'Monthly Power Consumption' },
        { label: 'Tasa de Aseo Municipal', value: '$5.20 (Incl.)', english: 'Municipal Waste Collection Fee' },
      ],
      suggestedQuestions: [
        {
          spanish: '¿Dónde puedo pagar esta factura de Naturgy en Bocas Town o por banca en línea?',
          english: 'Where can I pay this Naturgy bill in Bocas Town or via online banking?',
        },
        {
          spanish: 'Buenas, necesito consultar por qué aumentó el consumo de luz en este recibo.',
          english: 'Hi, I need to inquire why the electricity consumption increased on this bill.',
        },
        {
          spanish: '¿Podrían verificar si mi NIS ya refleja el pago que realicé ayer por banca en línea?',
          english: 'Could you verify if my NIS number already reflects the online payment I made yesterday?',
        },
      ],
    };
  }

  // 2. IDAAN Water Bill
  if (lower.includes('idaan') || lower.includes('water') || lower.includes('agua') || lower.includes('acueducto') || lower.includes('idaan_water')) {
    return {
      docType: 'IDAAN Municipal Water Bill (Factura de Agua)',
      badge: 'IDAAN Panamá • Acueductos',
      dueOrTotal: '$12.40 USD (B/. 12.40)',
      englishSummary: 'Standard monthly municipal water and sewage utility bill for residential supply in Isla Colón.',
      keyDetails: [
        { label: 'Total Facturado', value: '$12.40', english: 'Total Invoiced Amount' },
        { label: 'Fecha Límite', value: '18 de Agosto', english: 'Payment Deadline' },
        { label: 'Número de Medidor', value: 'W-98214', english: 'Water Meter Serial' },
        { label: 'Tarifa Residencial', value: 'Bocas Urbano', english: 'Residential Urban Tier' },
      ],
      suggestedQuestions: [
        {
          spanish: 'Hola, quisiera pagar el recibo de IDAAN. ¿Tienen Punto Pago disponible?',
          english: 'Hello, I would like to pay the IDAAN receipt. Do you have Punto Pago available?',
        },
        {
          spanish: 'Buenas, ¿dónde queda la oficina de IDAAN para hacer una consulta de cuenta?',
          english: 'Hi, where is the IDAAN office located to inquire about an account?',
        },
      ],
    };
  }

  // 3. Lease Agreement / Receipt
  return {
    docType: 'Bocas Rental Lease Agreement',
    badge: 'Property Lease • Bocas del Toro',
    dueOrTotal: '$850.00 / month',
    englishSummary: 'Monthly residential lease agreement. Rent of $850/mo due on the 1st. Water and high-speed fiber internet included; electricity paid separately by tenant.',
    keyDetails: [
      { label: 'Monto de Alquiler', value: '$850.00 / mes', english: 'Monthly Rent' },
      { label: 'Día de Pago', value: 'Día 1 de cada mes', english: 'Due on the 1st of each month' },
      { label: 'Servicios Incluidos', value: 'Agua + Internet Fibra', english: 'Included: Water + Fiber Internet' },
      { label: 'Servicios Aparte', value: 'Electricidad (Naturgy)', english: 'Tenant pays Electricity' },
    ],
    suggestedQuestions: [
      {
        spanish: 'Buenas, le acabo de enviar el comprobante de transferencia por WhatsApp.',
        english: 'Hello, I just sent you the bank transfer receipt via WhatsApp.',
      },
      {
        spanish: '¿Me podría enviar la factura de luz de este mes para transferir el pago?',
        english: 'Could you send me this month’s electricity bill so I can transfer payment?',
      },
    ],
  };
}

export type PanamaTone = 'poquito' | 'full_panameno';

export interface ToneOption {
  id: PanamaTone;
  label: string;
  sublabel: string;
  vectorIcon: string;
  tagColor: string;
}

export const PANAMA_TONE_OPTIONS: {
  id: PanamaTone;
  label: string;
  sublabel: string;
  vectorIcon: 'checkmark-circle-outline' | 'flash-outline';
  tagColor: string;
}[] = [
  {
    id: 'poquito',
    label: 'Poquito',
    sublabel: 'Amable y Natural',
    vectorIcon: 'checkmark-circle-outline',
    tagColor: '#047857',
  },
  {
    id: 'full_panameno',
    label: 'Full Panameño',
    sublabel: 'Dialecto Local',
    vectorIcon: 'flash-outline',
    tagColor: '#B45309',
  },
];

export function applyPanamaTone(
  baseSpanish: string,
  tone: PanamaTone
): string {
  if (!baseSpanish) return '';

  const lower = baseSpanish.toLowerCase();

  // 1. Water Truck & Cistern Refill
  if (lower.includes('camión cisterna') || lower.includes('tanque de reserva') || (lower.includes('agua') && lower.includes('cisterna')) || lower.includes('viaje de agua') || lower.includes('galones')) {
    if (tone === 'full_panameno') return '¡Buenas compa! Estamos secos acá, necesitamos un viaje de agua de camión cisterna urgente para el tanque de 1,500 galones.';
    return '¡Buenas! Necesitamos un viaje de agua en camión cisterna para un tanque de reserva de mil quinientos galones.';
  }

  // 2. A/C Leaking & Repair
  if (lower.includes('aire acondicionado') || lower.includes('split') || lower.includes('recámara') || lower.includes('botando agua')) {
    if (tone === 'full_panameno') return '¡Qué xopa maestro! El split está botando buco agua en la recámara. ¿A qué hora puede pasar a chequearlo?';
    return '¡Buenas! El aire acondicionado está botando agua dentro del cuarto. ¿Podría venir a revisarlo?';
  }

  // 3. Outboard Boat Engine
  if (lower.includes('fuera de borda') || lower.includes('lancha') || lower.includes('mecánico') || lower.includes('arrancar') || lower.includes('motor')) {
    if (tone === 'full_panameno') return '¡Qué xopa compa! La máquina no quiere prender, da marcha pero nada. ¿Tira una vuelta a chequearla?';
    return '¡Buenas! El motor fuera de borda no quiere arrancar. ¿Tendrá un mecánico disponible hoy?';
  }

  // 4. Starlink & Internet Outage
  if (lower.includes('starlink') || lower.includes('router') || lower.includes('caída de red') || lower.includes('señal')) {
    if (tone === 'full_panameno') return '¡Qué xopa gente! ¿A ustedes también se les cayó el Starlink con este aguacero?';
    return '¡Buenas! La antena de Starlink perdió la señal y el router está en rojo. ¿Sabe si hay caída de red?';
  }

  // 5. Banco Nacional ATM Cash
  if (lower.includes('banco nacional') || lower.includes('banconal') || lower.includes('calle principal') || lower.includes('cajero')) {
    if (tone === 'full_panameno') return '¡Qué xopa mi gente! ¿Alguien sabe si el Banconal está soltando plata o está sin red?';
    return '¡Buenas! ¿Sabe si el cajero de Banco Nacional en la calle principal tiene efectivo hoy?';
  }

  let clean = baseSpanish.trim();

  // Strip initial greetings to re-calibrate
  clean = clean.replace(/^(¡Buenas!|Hola,|Buenas,|¡Buenas Capitán!|Buenas tardes,|¡Qué xopa compa!)/i, '').trim();
  clean = clean.replace(/^(Disculpe,|con el debido respeto|quisiera consultar)/i, '').trim();
  clean = clean.replace(/(Muchas gracias\.|Gracias\.|¿Podría apoyarme con esto\?|Quedo al pendiente, gracias\.|Pa ver si me tira una mano, gracias jefe\.)$/i, '').trim();

  // Determine if core sentence is a question
  const isQuestion = clean.includes('?') || clean.startsWith('¿');
  let coreText = clean.replace(/^[¿¡]/, '').replace(/[?!.]$/, '').trim();

  // Specific local adaptations for Full Panameño jerga
  let jergaText = coreText;
  jergaText = jergaText.replace(/botando agua y no está enfriando bien/i, 'dañado y ta botando buco agua');
  jergaText = jergaText.replace(/un tanque de reserva de agua en mi propiedad hoy/i, 'el tanque de agua hoy acá en la casa');
  jergaText = jergaText.replace(/muy lento hoy/i, 'lento buco hoy');
  jergaText = jergaText.replace(/se descargó por completo/i, 'se murió del todo');

  if (tone === 'full_panameno') {
    if (isQuestion) {
      return `¡Qué xopa compa! ¿${jergaText}? Pa ver si me tira una mano, gracias jefe.`;
    } else {
      return `¡Qué xopa compa! ${jergaText}. Pa ver si me tira una mano con eso, gracias jefe.`;
    }
  }

  return baseSpanish;
}

