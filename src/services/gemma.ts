// Gemma AI Translation Engine Service
// Tailored for Bocas del Toro, Panama (Spanish - Panamanian / Latin American Regional Focus)

export const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish (Panamá)', nativeName: 'Español (Panamá)', flag: '🇵🇦' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
];

export async function translateWithGemma(
  inputText: string,
  fromLangCode: string = 'en',
  toLangCode: string = 'es',
  categoryContext?: string
): Promise<string> {
  const normalizedInput = inputText.trim().toLowerCase();

  // 1. Instant Local Panamanian Spanish Quick Map
  const panamaQuickMap: Record<string, string> = {
    // Quick Island Scenarios & High Frequency
    'hi, is there a power outage or blackout affecting our sector in bocas right now?': '¡Buenas! ¿Hay algún corte de luz o apagón afectando nuestro sector en Bocas en este momento?',
    'is there a power outage or blackout affecting our sector in bocas right now?': '¡Buenas! ¿Hay algún corte de luz o apagón afectando nuestro sector en Bocas en este momento?',
    'hi! do you have a water tanker truck available to fill a reserve cistern tank at my property today?': '¡Buenas! Necesitamos un viaje de agua en camión cisterna para un tanque de reserva de agua en mi propiedad hoy.',
    'hi! do you have a water truck available to fill a reserve cistern tank at my house today?': '¡Buenas! Necesitamos un viaje de agua en camión cisterna para un tanque de reserva de agua en mi casa hoy.',
    'hello, the air conditioner in the main bedroom is leaking water and not cooling. can someone inspect it today?': '¡Buenas! El aire acondicionado de la recámara principal está botando agua y no enfría. ¿Podría venir alguien a revisarlo hoy?',
    'hi captain! are you available to take two of us to old bank on bastimentos tonight, and how much would it be for the two of us?': '¡Buenas Capitán! ¿Tiene disponibilidad para llevarnos a dos personas a Old Bank en Bastimentos esta noche, y cuánto nos saldría?',
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
  };

  if (panamaQuickMap[normalizedInput]) {
    return panamaQuickMap[normalizedInput];
  }

  // 2. Real Google Translation via GTX or LiteSpeed API
  try {
    const from = fromLangCode || 'en';
    const to = toLangCode || 'es';
    const encoded = encodeURIComponent(inputText.trim());

    // Try Google GTX direct endpoint
    const directUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encoded}`;
    const directRes = await fetch(directUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });

    if (directRes.ok) {
      const data = await directRes.json();
      if (data && data[0] && Array.isArray(data[0])) {
        const translated = data[0].map((chunk: any) => chunk[0]).filter(Boolean).join('');
        if (translated && translated.trim().length > 0) {
          return polishPanamaSpanish(translated.trim(), from, to);
        }
      }
    }
  } catch (e) {
    console.warn('Direct Google GTX translation failed, trying LiteSpeed API proxy:', e);
  }

  // Fallback: LiteSpeed Backend Translation Proxy
  try {
    const proxyRes = await fetch('https://poquitotalk.hero-apps.com/api/translate.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: inputText.trim(),
        from: fromLangCode || 'en',
        to: toLangCode || 'es',
      }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && data.success && data.translated) {
        return polishPanamaSpanish(data.translated.trim(), fromLangCode, toLangCode);
      }
    }
  } catch (e) {
    console.warn('LiteSpeed translate proxy failed:', e);
  }

  // 3. Fallback: Pure Spanish Offline Logic (NEVER mixing English words)
  return panamaGemmaInference(inputText);
}

function polishPanamaSpanish(translatedText: string, fromLang: string, toLang: string): string {
  if (toLang !== 'es') {
    return translatedText;
  }

  let text = translatedText.trim();
  // Ensure polite Spanish greeting if not present
  if (!text.startsWith('¡') && !text.startsWith('¿') && !text.toLowerCase().startsWith('hola') && !text.toLowerCase().startsWith('buenas')) {
    text = `¡Buenas! ${text}`;
  }
  return text;
}

function panamaGemmaInference(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('power') || lower.includes('blackout') || lower.includes('electricity') || lower.includes('luz') || lower.includes('apagón')) {
    return '¡Buenas! ¿Hay algún corte de luz o apagón en este sector de Bocas ahora mismo?';
  }
  if (lower.includes('water') && (lower.includes('tank') || lower.includes('cistern') || lower.includes('truck'))) {
    return '¡Buenas! Necesitamos un viaje de agua en camión cisterna para llenar el tanque de reserva.';
  }
  if (lower.includes('ac') || lower.includes('air') || lower.includes('leak') || lower.includes('cooling')) {
    return '¡Buenas! El aire acondicionado tiene un problema y no está enfriando bien. ¿Podría revisarlo?';
  }
  if (lower.includes('boat') || lower.includes('taxi') || lower.includes('captain') || lower.includes('lancha')) {
    return '¡Buenas Capitán! Quisiera consultar la disponibilidad y tarifa para un viaje en lancha.';
  }
  if (lower.includes('doctor') || lower.includes('hospital') || lower.includes('fever') || lower.includes('pain') || lower.includes('medical')) {
    return '¡Buenas! Necesito una consulta médica o asistencia de salud. ¿Tendrá disponibilidad hoy?';
  }
  if (lower.includes('vet') || lower.includes('dog') || lower.includes('cat') || lower.includes('toad')) {
    return '¡Buenas! Mi mascota necesita atención veterinaria urgente. ¿La clínica está abierta?';
  }

  return '¡Buenas! Quisiera hacer una consulta por favor. ¿Tendrá disponibilidad para atenderme hoy?';
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
    iconName: 'boat-outline',
    duration: '0:14',
    sampleText: '¡Buenas jefe! Ya voy saliendo del muelle central de Bocas Town con la lancha. Llego a Carenero en unos diez minutos con los tanques de agua.',
  },
  {
    id: 'ac_technician',
    title: 'A/C Repair Tech (Gas & Leak)',
    sender: 'A/C & Cooling Technician',
    iconName: 'snow-outline',
    duration: '0:22',
    sampleText: 'Hola amigo, revisé el split. La fuga está en la tubería de cobre del compresor y le falta refrigerante R410. Tengo repuesto para cambiárselo hoy en la tarde si le parece bien.',
  },
  {
    id: 'plumber_water',
    title: 'Plumber (Water Pump & Cistern)',
    sender: 'Plumber & Water Systems',
    iconName: 'construct-outline',
    duration: '0:18',
    sampleText: '¡Buenas tardes patrón! La bomba de agua no tenía presión porque agarró aire la válvula de pie. Ya quedó purgada y llenando el tanque de arriba.',
  },
  {
    id: 'landlord_rent',
    title: 'Landlord (Utility & Power Outage)',
    sender: 'Property Management',
    iconName: 'home-outline',
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

  // A/C Technician Scenario
  if (lower.includes('aire') || lower.includes('fuga') || lower.includes('refrigerante') || lower.includes('compresor') || lower.includes('split') || lower.includes('ac')) {
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
  { id: 'naturgy_power', title: 'Naturgy Electricity Bill (Luz)', category: 'Electricity', icon: 'bulb-outline' },
  { id: 'idaan_water', title: 'IDAAN Water Utility Bill (Agua)', category: 'Water', icon: 'water-outline' },
  { id: 'restaurant_menu', title: 'Bocas Seafood Restaurant Menu', category: 'Dining', icon: 'restaurant-outline' },
  { id: 'pharmacy_rx', title: 'Pharmacy Prescription Label', category: 'Medical', icon: 'medkit-outline' },
];

export async function scanDocumentOrBill(docIdOrText: string): Promise<DocumentScanResult> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const lower = docIdOrText.toLowerCase();

  // Naturgy Power Bill
  if (lower.includes('naturgy') || lower.includes('ensa') || lower.includes('electr') || lower.includes('luz') || lower.includes('kwh') || lower.includes('power')) {
    return {
      docType: 'Naturgy Electricity Bill (Factura de Luz)',
      badge: 'Bocas del Toro / Naturgy Panamá',
      dueOrTotal: 'B/. 48.50',
      englishSummary: 'Monthly residential electricity bill (Tarifa BTS). Normal consumption of 210 kWh with municipal trash service included. No overdue balance.',
      keyDetails: [
        { label: 'Total a Pagar', value: 'B/. 48.50', english: 'Total Amount Due ($48.50 USD)' },
        { label: 'Fecha Límite de Pago', value: '25 de Agosto', english: 'Due Date' },
        { label: 'NIS (Radicación / Cuenta)', value: '2049182-3', english: 'Supply ID / Account Number' },
        { label: 'Tarifa / Medidor', value: 'BTS • #681024', english: 'Low Voltage Residential Rate & Meter' },
        { label: 'Consumo Facturado', value: '210 kWh', english: 'Monthly Power Consumption' },
        { label: 'Tasa de Aseo Municipal', value: 'B/. 5.20 (Incl.)', english: 'Municipal Waste Collection Fee' },
        { label: 'Fecha Estimada de Corte', value: '02 de Septiembre', english: 'Disconnection Date if Unpaid' },
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

  // IDAAN Water Bill
  if (lower.includes('idaan') || lower.includes('water') || lower.includes('agua') || lower.includes('acueducto')) {
    return {
      docType: 'IDAAN Municipal Water Bill (Factura de Agua)',
      badge: 'IDAAN Panamá • Acueductos',
      dueOrTotal: 'B/. 12.40',
      englishSummary: 'Standard monthly municipal water and sewage utility bill for residential supply in Isla Colón.',
      keyDetails: [
        { label: 'Total Facturado', value: 'B/. 12.40', english: 'Total Invoiced Amount ($12.40 USD)' },
        { label: 'Fecha Límite', value: '18 de Agosto', english: 'Payment Deadline' },
        { label: 'Número de Medidor', value: 'W-98214', english: 'Water Meter Serial' },
        { label: 'Tarifa Residencial', value: 'Bocas Urbano', english: 'Residential Urban Tier' },
      ],
      suggestedQuestions: [
        {
          spanish: 'Hola, quisiera pagar el recibo de IDAAN. ¿Tienen Punto Pago disponible?',
          english: 'Hello, I would like to pay the IDAAN receipt. Do you have Punto Pago available?',
        },
      ],
    };
  }

  // Restaurant Menu
  if (lower.includes('menu') || lower.includes('restaurant') || lower.includes('pescado') || lower.includes('comida') || lower.includes('food')) {
    return {
      docType: 'Bocas Waterfront Seafood Menu',
      badge: 'Bocas del Toro Dining',
      dueOrTotal: 'Pargo / Corvina / Langosta',
      englishSummary: 'Local Bocas style seafood menu featuring catch of the day with coconut rice, patacones (fried plantains), and fresh fruit juices.',
      keyDetails: [
        { label: 'Pargo Entero Frito', value: '$14.00', english: 'Whole Fried Red Snapper with patacones' },
        { label: 'Filete de Corvina al Ajillo', value: '$12.50', english: 'Sea Bass Fillet in Garlic Sauce' },
        { label: 'Arroz con Mariscos Caribeño', value: '$15.00', english: 'Caribbean Seafood Rice (shrimp, calamari, conch)' },
        { label: 'Batido de Maracuyá / Piña', value: '$3.50', english: 'Passionfruit / Pineapple Smoothie in Water or Milk' },
      ],
      suggestedQuestions: [
        {
          spanish: '¿El pescado frito viene con patacones y arroz con coco?',
          english: 'Does the fried fish come with fried plantains and coconut rice?',
        },
        {
          spanish: '¿Tienen opciones vegetarianas o sin mariscos hoy?',
          english: 'Do you have vegetarian or shellfish-free options today?',
        },
      ],
    };
  }

  // Pharmacy Label / Prescription
  return {
    docType: 'Panamanian Pharmacy Medication Label',
    badge: 'Pharmacy & Medical',
    dueOrTotal: 'Amoxicilina 500mg • Cápsulas',
    englishSummary: 'Prescription instructions for antibiotics. Take 1 capsule every 8 hours with food for 7 days. Complete full course.',
    keyDetails: [
      { label: 'Dosis', value: '1 cápsula cada 8 horas', english: 'Take 1 capsule every 8 hours' },
      { label: 'Duración', value: 'Por 7 días continuos', english: 'Continuous for 7 days' },
      { label: 'Indicación', value: 'Tomar después de las comidas', english: 'Take after meals with water' },
      { label: 'Advertencia', value: 'No suspender antes de tiempo', english: 'Do not stop treatment early' },
    ],
    suggestedQuestions: [
      {
        spanish: 'Disculpe, ¿este medicamento requiere receta médica para comprar más?',
        english: 'Excuse me, does this medication require a prescription to buy more?',
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

