import { ServicePreset } from '../types';

export interface PastelTheme {
  bg: string;
  border: string;
  accent: string;
  badgeBg: string;
  chipBg: string;
}

export const SERVICE_PRESETS: ServicePreset[] = [
  // 1. Daily High-Frequency: Dining & Restaurants
  {
    id: 'restaurant_dining',
    category: 'Dining',
    title: 'Restaurants & Dining',
    icon: 'silverware-fork-knife',
    description: 'Reserve a table, ask for menu, dietary options (vegan/gluten-free), or opening hours.',
    defaultInputPrompt: 'Hi, I would like to reserve a dinner table for 4 people tonight at 7:30 PM.',
    phrases: [
      {
        id: 'dining_table_reservation',
        title: 'Reserve Dinner Table',
        input: 'Hi! I would like to reserve a table for 4 people tonight at 7:30 PM, please.',
        output: '¡Buenas! Quisiera reservar una mesa para 4 personas hoy a las 7:30 de la noche, por favor.',
      },
      {
        id: 'dining_dietary_options',
        title: 'Vegan / Dietary Options',
        input: 'Hello, do you offer vegetarian or gluten-free meal options on your menu?',
        output: '¡Hola! ¿Tienen opciones vegetarianas o platos sin gluten en el menú?',
      },
      {
        id: 'dining_menu_specials',
        title: "Menu & Today's Specials",
        input: 'Hi! Could you send me your current food menu and today\'s specials via WhatsApp?',
        output: '¡Buenas! ¿Me podrían enviar su menú actualizado y la pesca del día por WhatsApp?',
      },
    ],
  },

  // 2. Daily High-Frequency: Groceries & Fresh Markets
  {
    id: 'groceries_diet',
    category: 'Groceries',
    title: 'Groceries & Special Diet',
    icon: 'cart-outline',
    description: 'Super Gourmet specialty items, gluten-free/vegan foods, fresh seafood catch, and island store hours.',
    defaultInputPrompt: 'Hi! Do you have gluten-free bread, almond milk, and organic produce in stock today?',
    phrases: [
      {
        id: 'groceries_specialty_diet',
        title: 'Gluten-Free / Vegan / Organic',
        input: 'Hi! Do you carry gluten-free bread, almond/oat milk, and vegan cheese in your store?',
        output: '¡Buenas! ¿Tienen en existencia pan sin gluten, leche de almendras o avena, y queso vegano?',
      },
      {
        id: 'groceries_fresh_seafood_order',
        title: 'Fresh Fish / Lobster Catch',
        input: 'Hello! Do you have fresh snapper (pargo), corvina, or lobster available today and what is the price per pound?',
        output: '¡Buenas! ¿Tienen pargo fresco, corvina o langosta hoy y a cómo tienen la libra?',
      },
      {
        id: 'groceries_whatsapp_delivery_list',
        title: 'WhatsApp Grocery Order Delivery',
        input: 'Hi! Can I send you my grocery list over WhatsApp for delivery to our dock or home address?',
        output: '¡Hola! ¿Les puedo mandar mi lista de compras por WhatsApp para que me la preparen y envíen a domicilio?',
      },
    ],
  },

  // 3. Daily High-Frequency: Land Taxi & Drivers
  {
    id: 'taxi_land',
    category: 'Taxi',
    title: 'Land Taxi & Drivers',
    icon: 'taxi',
    description: 'Island taxis to Paunch/Bluff beach, airport pickup, driver fare quotes.',
    defaultInputPrompt: 'Hi, I need a land taxi driver to pick me up for a trip to Playa Bluff.',
    phrases: [
      {
        id: 'taxi_beach_trip',
        title: 'Taxi to Beach / Resort',
        input: 'Hi! Are you available for a taxi ride to Playa Bluff / Paunch today?',
        output: '¡Buenas! ¿Estará disponible para una carrera en taxi hacia Playa Bluff o Paunch hoy?',
      },
      {
        id: 'taxi_airport_pickup',
        title: 'Airport Transfer Pickup',
        input: 'Hello, what is your rate for an airport pickup transfer in Bocas Town?',
        output: '¡Hola! ¿Cuánto me cobra por recogerme en el aeropuerto de Bocas Town?',
      },
      {
        id: 'taxi_day_rate_hire',
        title: 'Daily Driver Hire Quote',
        input: 'Hi, how much do you charge for half-day driver service around Isla Colón?',
        output: '¡Buenas! ¿Cuánto me cobraría por el servicio de chofer por medio día para recorrer Isla Colón?',
      },
    ],
  },

  // 4. Daily High-Frequency: Water Taxis & Boat Captains
  {
    id: 'water_taxi',
    category: 'Boats',
    title: 'Water Taxi & Boats',
    icon: 'ferry',
    description: 'Boat shuttles to Carenero, Bastimentos, Red Frog, or late night boat rates.',
    defaultInputPrompt: 'Hi, is a water taxi boat available to take us to Red Frog Beach right now?',
    phrases: [
      {
        id: 'water_taxi_red_frog',
        title: 'Water Taxi to Red Frog',
        input: 'Hi! Is a water taxi available to take 2 people to Red Frog Beach right now?',
        output: '¡Buenas capitán! ¿Tendrá lancha disponible para llevar a 2 personas a Red Frog Beach ahora mismo?',
      },
      {
        id: 'water_taxi_carenero_bastimentos',
        title: 'Carenero / Bastimentos Shuttle',
        input: 'Hello, how much is the boat ride per person from Bocas Town to Carenero / Old Bank?',
        output: '¡Hola! ¿A cuánto está el pasaje por persona en lancha desde Bocas Town hasta Carenero u Old Bank?',
      },
      {
        id: 'water_taxi_late_night',
        title: 'Late Night Boat Inquiry',
        input: 'Hi! Are water taxi boats running until late tonight for return trips?',
        output: '¡Buenas capitán! ¿Habrá lanchas trabajando hasta tarde esta noche para el viaje de regreso?',
      },
    ],
  },

  // 5. High-Frequency: ATM, Cash & Banking
  {
    id: 'banking_money',
    category: 'Banking',
    title: 'ATMs, Western Union & Cash',
    icon: 'cash-multiple',
    description: 'Banco Nacional ATM, supermarket ATMs, Western Union transfers, Punto Pago kiosks, and small bill change.',
    defaultInputPrompt: 'Hi! Does the Banco Nacional ATM or supermarket ATM currently have cash available?',
    phrases: [
      {
        id: 'banking_atm_banconal',
        title: 'Banco Nacional ATM Cash Status',
        input: 'Hi! Does anyone know if the Banco Nacional ATM currently has cash dispensed?',
        output: '¡Buenas! ¿Alguien sabe si el cajero del Banco Nacional tiene plata disponible ahora mismo?',
      },
      {
        id: 'banking_atm_police_station',
        title: 'ATM in front of Duo2 Market (Near Police)',
        input: 'Hi! Does anyone know if the ATM in front of Duo2 Market near the police station has cash today?',
        output: '¡Buenas! ¿Alguien sabe si el cajero frente a Duo2 Market cerca de la policía tiene efectivo hoy?',
      },
      {
        id: 'banking_atm_supermarket',
        title: 'ATM in front of Supermarket Alba (Calle 3ra)',
        input: 'Hi! Is the ATM in front of Supermarket Alba on main street working and dispensing cash today?',
        output: '¡Buenas! ¿Saben si el cajero frente a Supermercado Alba en la calle principal tiene plata hoy?',
      },
      {
        id: 'banking_western_union',
        title: 'Western Union Wire Pickup & Hours',
        input: 'Hi, is the Western Union agency open today to receive an international money transfer?',
        output: '¡Buenas! ¿La agencia de Western Union está abierta hoy para retirar un giro internacional?',
      },
      {
        id: 'banking_punto_pago',
        title: 'Punto Pago Kiosk / Utility Bills',
        input: 'Hello, where is the nearest Punto Pago machine to pay electricity or recharge phone minutes?',
        output: '¡Hola! ¿Dónde queda el kiosco de Punto Pago más cercano para pagar la luz o recargar minutos?',
      },
      {
        id: 'banking_small_bill_change',
        title: 'Change $50 / $100 for Small Bills',
        input: 'Hello, could you break a $100 / $50 bill into smaller $5, $10, and $20 notes, please?',
        output: '¡Buenas! ¿Disculpe, tendrá cambio de un billete de 100 o 50 en billetes chicos de 5, 10 y 20 dólares?',
      },
    ],
  },

  // 6. High-Frequency: Power Outages & Naturgy
  {
    id: 'power_blackout',
    category: 'Power',
    title: 'Power Outage & Generators',
    icon: 'lightning-bolt',
    description: 'Naturgy power blackout status, generator diesel/gasoline delivery, voltage fluctuations, and inverter check.',
    defaultInputPrompt: 'Hi! Did the power go out in the whole sector or is it just our transformer?',
    phrases: [
      {
        id: 'power_blackout_status',
        title: 'Naturgy Sector Blackout Check',
        input: 'Hi! Did the power go out across the whole sector/island or is there an estimated restore time?',
        output: '¡Buenas! ¿Se fue la luz en todo el sector o se sabe a qué hora regresará el servicio eléctrico?',
      },
      {
        id: 'power_generator_fuel_delivery',
        title: 'Generator Fuel / Diesel Delivery',
        input: 'Hello! Can someone deliver 5 gallons of gasoline/diesel in a safety can for our backup generator?',
        output: '¡Hola! ¿Podrían traerme 5 galones de gasolina o diesel en paila para el generador de respaldo?',
      },
      {
        id: 'power_low_voltage_fluctuation',
        title: 'Low Voltage / Breaker Tripping',
        input: 'Hi, we are experiencing severe voltage drops and flickering lights. Could an electrician inspect the main panel?',
        output: '¡Buenas! Hay un bajón de voltaje muy fuerte y las luces parpadean. ¿Podría venir un electricista a revisar la caja de breakers?',
      },
    ],
  },

  // 7. Regular Need: Starlink & Internet
  {
    id: 'starlink_internet',
    category: 'Internet',
    title: 'Starlink & Internet Outage',
    icon: 'satellite-variant',
    description: 'Starlink dish connection drops, local fiber cuts, router reboot, and speed checks.',
    defaultInputPrompt: 'My Starlink dish lost signal connection and the router light is red.',
    phrases: [
      {
        id: 'starlink_dish_offline',
        title: 'Starlink Dish Disconnected',
        input: 'Hi, the Starlink dish lost connection. Is there a signal outage in the area?',
        output: '¡Buenas! La antena de Starlink perdió la señal. ¿Hay alguna caída general del servicio en la zona?',
      },
      {
        id: 'starlink_fiber_damaged',
        title: 'Fiber Cable Damaged',
        input: 'Hello, the internet fiber cable outside the house appears damaged or cut.',
        output: '¡Hola! El cable de fibra óptica afuera de la casa parece estar dañado o cortado.',
      },
      {
        id: 'starlink_slow_line_check',
        title: 'Router Reboot / Low Speed',
        input: 'Hi, the internet is very slow today. Could you check the line status?',
        output: '¡Buenas! El internet está demasiado lento hoy. ¿Podría verificar el estado de la línea desde la central?',
      },
    ],
  },

  // 8. Regular Need: Landlord & Housing
  {
    id: 'landlord_housing',
    category: 'Housing',
    title: 'Landlord & Housing',
    icon: 'home-city-outline',
    description: 'Rent inquiries, spare keys, water pressure, garbage collection, gate access.',
    defaultInputPrompt: 'Hi, the water pressure in the shower dropped significantly today.',
    phrases: [
      {
        id: 'landlord_water_pressure',
        title: 'Low Water Pressure',
        input: 'Hi! The water pressure in the main bathroom dropped completely.',
        output: '¡Buenas! La presión del agua en el baño principal se cayó por completo.',
      },
      {
        id: 'landlord_spare_key',
        title: 'Spare Key Request',
        input: 'Hello, I accidentally locked myself out. Do you have a spare key nearby?',
        output: '¡Hola! Se me quedaron las llaves adentro por accidente. ¿Tendrá una llave de repuesto cerca?',
      },
      {
        id: 'landlord_rent_transfer_proof',
        title: 'Rent & Utility Payment',
        input: 'Hi, I sent the rent payment via transfer and attached the proof.',
        output: '¡Buenas! Ya le envié el pago del alquiler por transferencia bancaria y le adjunto el comprobante.',
      },
    ],
  },

  // 9. Regular Need: Air Conditioning (A/C)
  {
    id: 'ac_repair',
    category: 'A/C',
    title: 'Air Conditioning (A/C)',
    icon: 'snowflake',
    description: 'A/C leaking, remote control issues, refrigerant refill, or no cold air.',
    defaultInputPrompt: 'My air conditioning unit is leaking water and not blowing cold air.',
    phrases: [
      {
        id: 'ac_leaking_water',
        title: 'A/C Leaking Water',
        input: 'Hi! The air conditioner is leaking water inside the room. Could you come check it?',
        output: '¡Buenas! El aire acondicionado está botando agua dentro de la habitación. ¿Podría venir a revisarlo hoy?',
      },
      {
        id: 'ac_gas_refill',
        title: 'Needs Gas/Refrigerant',
        input: 'Hello, the air conditioner turns on but is not blowing cold air. I think it needs gas refill.',
        output: '¡Hola! El aire acondicionado prende pero no tira aire frío. Me parece que le hace falta una recarga de gas.',
      },
      {
        id: 'ac_remote_not_working',
        title: 'Remote Not Working',
        input: 'Hello, the air conditioner remote control is not responding. Could you check it?',
        output: '¡Buenas! El control remoto del aire acondicionado no responde. ¿Podrían revisarlo?',
      },
    ],
  },

  // 10. Regular Need: Fridge & Appliances
  {
    id: 'broken_fridge',
    category: 'Appliances',
    title: 'Fridge & Appliances',
    icon: 'fridge-outline',
    description: 'Fridge not cooling, freezer defrosting, stove or washing machine broken.',
    defaultInputPrompt: 'Our refrigerator stopped cooling and the food inside is defrosting.',
    phrases: [
      {
        id: 'fridge_not_cooling',
        title: 'Fridge Not Cooling',
        input: 'Hi! The refrigerator stopped cooling and the food inside is defrosting. Can you inspect it today?',
        output: '¡Buenas! La refrigeradora dejó de enfriar y la comida se está descongelando. ¿Podría venir a revisarla hoy?',
      },
      {
        id: 'fridge_gas_leak',
        title: 'Gas Leak / Compressor Noise',
        input: 'Hello, the fridge compressor is making a loud buzzing noise and not keeping cold.',
        output: '¡Hola! El compresor de la refrigeradora hace un zumbido fuerte y no mantiene el frío.',
      },
      {
        id: 'washing_machine_broken',
        title: 'Washing Machine Not Draining',
        input: 'Hi! The washing machine is not draining water during the spin cycle.',
        output: '¡Buenas! La lavadora no está botando el agua durante el ciclo de centrifugado.',
      },
    ],
  },

  // 11. Maintenance: Hardware & Ferretería
  {
    id: 'hardware_construction',
    category: 'Hardware',
    title: 'Hardware & Ferretería',
    icon: 'hammer-wrench',
    description: 'Wood screws, zinc roofing sheets, PVC pipes, cement bags, tools, and island construction supplies.',
    defaultInputPrompt: 'Hi! Do you have stainless steel wood screws, PVC pipe fittings, and cement bags in stock?',
    phrases: [
      {
        id: 'hardware_screws_nails',
        title: 'Stainless Screws & Marine Fasteners',
        input: 'Hi! Do you have 2-inch stainless steel wood screws and marine-grade fasteners in stock?',
        output: '¡Buenas! ¿Tienen tornillos de acero inoxidable de dos pulgadas para madera y fijaciones marinas?',
      },
      {
        id: 'hardware_zinc_roofing',
        title: 'Zinc Roof Sheets & Plywood',
        input: 'Hello! Do you have corrugated zinc roofing sheets and marine plywood boards with delivery available?',
        output: '¡Buenas! ¿Tienen láminas de zinc ondulado para techo y madera contrachapada marina con entrega a domicilio?',
      },
      {
        id: 'hardware_pvc_plumbing_pipes',
        title: 'PVC Pipes, Elbows & Glue',
        input: 'Hi, I need half-inch PVC water pipes, elbows, adapters, and heavy-duty PVC cement glue.',
        output: '¡Hola! Necesito tubos de PVC para agua de media pulgada, codos, adaptadores y pegamento de PVC.',
      },
      {
        id: 'hardware_cement_sand_bags',
        title: 'Cement Bags & Sand Delivery',
        input: 'Hello, how much for 5 bags of grey cement and sand delivered to the island dock?',
        output: '¡Buenas! ¿Cuánto saldrían 5 sacos de cemento gris con arena puestos en el muelle de la isla?',
      },
    ],
  },

  // 12. Health: Doctor & Medical Clinic
  {
    id: 'doctor_clinic',
    category: 'Doctor',
    title: 'Doctor & Medical Clinic',
    icon: 'hospital-building',
    description: 'Schedule doctor consultations, lab blood work, fever or illness checkups, and urgent clinic visits.',
    defaultInputPrompt: 'Hi, I have a fever and severe pain. Is a doctor available for a consultation today?',
    phrases: [
      {
        id: 'med_doctor_visit',
        title: 'Urgent Doctor Visit',
        input: 'Hi! I have a fever and severe pain. Is a doctor available for a consultation today?',
        output: '¡Buenas! Tengo fiebre alta y dolor fuerte. ¿Habrá algún médico disponible para una consulta hoy?',
      },
      {
        id: 'med_doctor_lab_results',
        title: 'Doctor Follow-Up / Lab Results',
        input: 'Hi, I would like to inquire if the results of my blood tests or lab exams are ready.',
        output: '¡Buenas! Quisiera consultar si ya tienen listos los resultados de mis exámenes de laboratorio.',
      },
      {
        id: 'med_emergency_ambulance',
        title: 'Medical Emergency Help',
        input: 'Hi! I need urgent medical assistance or an ambulance immediately, please.',
        output: '¡Urgente! Necesito asistencia médica de emergencia o una ambulancia de inmediato, por favor.',
      },
    ],
  },

  // 13. Health: Pharmacy & Prescriptions
  {
    id: 'pharmacy_prescriptions',
    category: 'Pharmacy',
    title: 'Pharmacy & Prescriptions',
    icon: 'pill',
    description: 'Inquire about prescription medications, antibiotics, pain relief, rehydration salts, and opening hours.',
    defaultInputPrompt: 'Hi, do you have medication for fever and infection in the pharmacy today?',
    phrases: [
      {
        id: 'med_pharmacy_meds',
        title: 'Pharmacy Medication & Hours',
        input: 'Hello, do you have medication for fever/infection in the pharmacy and what time are you open until?',
        output: '¡Buenas! ¿Tienen medicamentos para la fiebre o infección en la farmacia y hasta qué hora están abiertos hoy?',
      },
      {
        id: 'pharmacy_prescription_whatsapp',
        title: 'Send Prescription Photo',
        input: 'Hi! Can I send you a photo of my doctor prescription over WhatsApp so you can prepare it for pickup?',
        output: '¡Hola! ¿Le puedo enviar una foto de la receta médica por WhatsApp para que me tengan el medicamento listo para retirar?',
      },
      {
        id: 'pharmacy_rehydration_electrolytes',
        title: 'Electrolytes & Stomach Relief',
        input: 'Hi! Do you have oral rehydration electrolyte packets (suero oral) and stomach relief pills available?',
        output: '¡Buenas! ¿Tienen sobres de suero oral de rehidratación y pastillas para el estómago disponibles?',
      },
    ],
  },

  // 14. Health: Dentist & Dental Care
  {
    id: 'dentist_appointments',
    category: 'Dentist',
    title: 'Dentist & Dental Care',
    icon: 'tooth',
    description: 'Schedule urgent dentist visits for toothaches, teeth cleaning checkups, or broken filling repairs.',
    defaultInputPrompt: 'Hi, I have a severe toothache and need an urgent dentist appointment today.',
    phrases: [
      {
        id: 'dent_urgent_toothache',
        title: 'Urgent Toothache Appointment',
        input: 'Hi! I have a severe toothache. Is a dentist appointment available today?',
        output: '¡Buenas! Tengo un dolor de muela muy fuerte. ¿Tendrá cupo disponible con el odontólogo hoy?',
      },
      {
        id: 'dent_cleaning_schedule',
        title: 'Schedule Dental Cleaning',
        input: 'Hello, I would like to schedule a dental cleaning and checkup appointment for next week.',
        output: '¡Hola! Quisiera agendar una cita para una limpieza dental y revisión para la próxima semana, por favor.',
      },
      {
        id: 'dent_broken_filling_repair',
        title: 'Broken Tooth / Filling Repair',
        input: 'Hi! A tooth filling fell out and I need to have a broken tooth repaired as soon as possible.',
        output: '¡Buenas! Se me cayó una calza de una muela y necesito arreglarme el diente lo más pronto posible.',
      },
    ],
  },

  // 14. Pet Care: Pet & Island Vet
  {
    id: 'pet_vet_emergency',
    category: 'Pet Vet',
    title: 'Pet Care & Island Vet',
    icon: 'paw',
    description: 'Urgent vet appointments, cane toad/snake toxicity, rabies/flea medication, and spay/neuter clinic.',
    defaultInputPrompt: 'Hi! I have an emergency with my dog, is the vet clinic open today?',
    phrases: [
      {
        id: 'pet_emergency_vet_visit',
        title: 'Urgent Pet Exam / Sickness',
        input: 'Hi! My pet is vomiting and lethargic. Is a veterinarian available for an emergency consultation right now?',
        output: '¡Buenas! Mi mascota está vomitando y decaída. ¿Habrá un veterinario disponible para una consulta de urgencia ahora mismo?',
      },
      {
        id: 'pet_toad_snake_toxicity',
        title: 'Cane Toad / Poison Emergency',
        input: 'Urgent! My dog bit a cane toad and has foaming at the mouth. What immediate steps should I take and are you open?',
        output: '¡Urgente! Mi perro mordió un sapo y tiene espuma en la boca. ¿Qué primeros auxilios le hago y están abiertos ya?',
      },
      {
        id: 'pet_flea_tick_meds',
        title: 'Flea, Tick & Heartworm Meds',
        input: 'Hello, do you have Nexgard/Bravecto chewables and tick prevention medication in stock?',
        output: '¡Hola! ¿Tienen pastillas masticables para garrapatas y pulgas como Nexgard o Bravecto disponibles?',
      },
    ],
  },

  // 15. Marine: Boat & Outboard Repair
  {
    id: 'boat_repair',
    category: 'Outboard',
    title: 'Boat & Outboard Repair',
    icon: 'engine',
    description: 'Yamaha 2-stroke outboard mechanics, fuel filter replacement, impeller issues, and fiberglass repair.',
    defaultInputPrompt: 'Hi, my Yamaha outboard motor won\'t start and seems to have water in the fuel tank.',
    phrases: [
      {
        id: 'boat_engine_not_starting',
        title: 'Outboard Motor Won\'t Start',
        input: 'Hi! My Yamaha 40hp outboard won\'t start. Could a mechanic come inspect the spark plugs and carburetor?',
        output: '¡Buenas capitán! Mi motor Yamaha 40 no quiere arrancar. ¿Podría venir un mecánico a revisar las bujías y el carburador?',
      },
      {
        id: 'boat_propeller_impeller_change',
        title: 'Impeller / Water Pump Overheating',
        input: 'Hello, the engine is not peeing cooling water. I need an urgent impeller replacement before it overheats.',
        output: '¡Hola! El motor no está botando el chorro de agua de refrigeración. Necesito cambiarle el impeller urgente.',
      },
      {
        id: 'boat_fiberglass_patch',
        title: 'Fiberglass / Hull Repair',
        input: 'Hi, I have a small crack in the fiberglass hull that is taking in water. Do you do boat repairs?',
        output: '¡Buenas! Tengo una fisura en el casco de fibra de vidrio que está filtrando agua. ¿Usted hace trabajos de fibra?',
      },
    ],
  },

  // 16. Automotive: Car & Golf Cart Repair
  {
    id: 'car_mechanic',
    category: 'Mechanic',
    title: 'Car & Golf Cart Repair',
    icon: 'car-wrench',
    description: 'Flat tire repair, battery jump start, brake pads, and golf cart electric troubleshooting.',
    defaultInputPrompt: 'Hi, my car battery died and I need a jump start in Bocas Town.',
    phrases: [
      {
        id: 'car_battery_jump_start',
        title: 'Dead Battery Jump Start',
        input: 'Hi! My car battery is completely dead. Is someone available to bring jumper cables for a jump start?',
        output: '¡Buenas! Me quedé sin batería en el auto. ¿Habrá alguien disponible que me pueda pasar corriente con cables?',
      },
      {
        id: 'car_flat_tire_patch',
        title: 'Flat Tire Repair / Llantas',
        input: 'Hello, I have a flat tire. Where is the nearest vulcanizadora or tire repair shop in Isla Colón?',
        output: '¡Hola! Se me ponchó una llanta. ¿Dónde queda la vulcanizadora o taller de llantas más cercano?',
      },
      {
        id: 'car_golf_cart_electric_issue',
        title: 'Golf Cart Battery & Wiring',
        input: 'Hi, our electric golf cart is losing power quickly and not charging. Could a technician take a look?',
        output: '¡Buenas! El carrito de golf eléctrico se descarga muy rápido y no agarra carga. ¿Podría revisarlo un técnico?',
      },
    ],
  },

  // 17. Periodic: Water Delivery & Cisterns
  {
    id: 'water_supply',
    category: 'Water',
    title: 'Water Delivery & Cisterns',
    icon: 'water-pump',
    description: 'Emergency water truck delivery, 5-gallon drinking jugs, cistern refills, and pump priming.',
    defaultInputPrompt: 'Hi! Do you have a water truck available to fill a reserve cistern tank at my house today?',
    phrases: [
      {
        id: 'water_cistern_truck',
        title: 'Water Truck / Cistern Refill',
        input: 'Hi! Do you have a water tanker truck available to fill a 1,500 gallon reserve tank at my property today?',
        output: '¡Buenas! Necesitamos un viaje de agua en camión cisterna para un tanque de reserva de mil quinientos galones.',
      },
      {
        id: 'water_jugs_delivery',
        title: '5-Gallon Drinking Water Jugs',
        input: 'Hello, do you do home delivery for three 5-gallon purified drinking water jugs today?',
        output: '¡Buenas tardes! ¿Hacen entrega a domicilio de 3 botellones de agua purificada de 5 galones hoy?',
      },
      {
        id: 'water_pump_lost_prime',
        title: 'Water Pump Lost Prime / Pressure',
        input: 'Hi, the water pump ran dry and lost pressure. Could a technician come check and prime the pump?',
        output: '¡Hola! La bomba de agua del tanque se quedó sin agua y perdió la presión. ¿Podría venir un técnico a purgarla y revisarla?',
      },
      {
        id: 'water_filter_maintenance',
        title: 'Rain Catchment & Filter Service',
        input: 'Hello, I need to schedule a filter change and maintenance for my rainwater catchment system, please.',
        output: '¡Buenas! Necesito hacerle cambio de filtros y mantenimiento al sistema de captación de agua de lluvia, por favor.',
      },
    ],
  },

  // 18. Periodic: Border Runs (Costa Rica)
  {
    id: 'border_immigration',
    category: 'Border Runs',
    title: 'Border Runs (Costa Rica)',
    icon: 'passport',
    description: 'Costa Rica border runs via Sixaola/Guabito, Migración exit & entry stamps, shared taxi to Almirante docks, and customs.',
    defaultInputPrompt: 'Hi! I am doing a visa run at the border for renewal stamps. Where is the Migración office?',
    phrases: [
      {
        id: 'border_exit_entry_stamp',
        title: 'Tourist Visa Run / Border Stamp',
        input: 'Hi! I came for my exit and entry stamp to renew my tourist stay. How much is the tax/stamp fee?',
        output: '¡Buenas! Vengo a hacer el sello de salida y entrada para la renovación de mi estadía de turista. ¿Cuánto es el costo de los timbres?',
      },
      {
        id: 'border_taxi_to_almirante',
        title: 'Taxi: Guabito to Almirante Docks',
        input: 'Hello! How much is a taxi from the Guabito border to the water taxi boat docks in Almirante?',
        output: '¡Hola! ¿Cuánto me cobra por el viaje en taxi desde la frontera de Guabito hasta el muelle de lanchas en Almirante?',
      },
      {
        id: 'border_customs_clearance',
        title: 'Customs & Luggage Clearance',
        input: 'Hi! I have personal luggage and small retail purchases. Where do I go for customs inspection?',
        output: '¡Buenas! Traigo equipaje personal y algunas compras menores. ¿Dónde paso para la revisión de Aduanas?',
      },
      {
        id: 'border_shuttle_puerto_viejo',
        title: 'Bus / Shuttle to Puerto Viejo (CR)',
        input: 'Hello, what time does the next shared bus or shuttle depart from Sixaola towards Puerto Viejo / San José?',
        output: '¡Buenas! ¿A qué hora sale el próximo bus o colectivo hacia Puerto Viejo / San José desde Sixaola?',
      },
    ],
  },

  // 19. Tactical Replies: Pricing & Yappy Payments
  {
    id: 'price_yappy_pay',
    category: 'Yappy & Pay',
    title: 'Pricing & Yappy Payments',
    icon: 'cash-multiple',
    description: 'Ask final price, confirm total, request account number, and send Yappy receipt.',
    defaultInputPrompt: 'What is your best final price and do you accept payment via Yappy?',
    phrases: [
      {
        id: 'yappy_final_price',
        title: 'Ask Final / Best Price',
        input: 'What is your best / final price for the service?',
        output: '¿Cuánto sería lo último por el servicio?',
        fullPanamenoOutput: '¡Qué xopa compa! ¿Cuánto es lo último que me lo deja?',
      },
      {
        id: 'yappy_payment_method',
        title: 'Accept Yappy or Cash Only?',
        input: 'Do you accept payment via Yappy or only cash?',
        output: '¿Aceptan pago por Yappy o solo efectivo?',
        fullPanamenoOutput: '¿Le puedo pagar por Yappy directo o solo efectivo?',
      },
      {
        id: 'yappy_receipt_sent',
        title: 'Receipt Sent via Yappy',
        input: 'I already sent the payment via Yappy and attached the receipt here.',
        output: 'Ya le hice el envío por Yappy y le adjunto el comprobante.',
        fullPanamenoOutput: 'Listo compa, ya le tiré la plata por Yappy y le mandé el comprobante.',
      },
    ],
  },

  // 20. Tactical Replies: Location & Dock ETA
  {
    id: 'dock_location_eta',
    category: 'Dock & ETA',
    title: 'Location & Dock ETA',
    icon: 'map-marker-radius',
    description: 'Boat arrival, meeting at dock, estimated arrival time, and live GPS location.',
    defaultInputPrompt: 'Hi, I am already waiting at the main dock. What is your estimated arrival time?',
    phrases: [
      {
        id: 'dock_waiting_here',
        title: 'Waiting at Main Dock',
        input: 'Hi! I am already waiting for you at the main dock.',
        output: '¡Buenas! Ya estoy esperándolo en el muelle principal.',
        fullPanamenoOutput: '¡Qué xopa! Ya estoy en el muelle esperándolo.',
      },
      {
        id: 'dock_estimated_arrival',
        title: 'Estimated Arrival Time',
        input: 'What time do you estimate you will arrive at the house / dock?',
        output: '¿A qué hora calcula que estaría llegando a la casa?',
        fullPanamenoOutput: '¿A qué hora calcula que llega por acá compa?',
      },
      {
        id: 'dock_share_location',
        title: 'Sharing Exact Live GPS',
        input: 'I am sharing my exact live location here so you do not get lost.',
        output: 'Le comparto mi ubicación exacta por aquí para que no se pierda.',
        fullPanamenoOutput: 'Le tiro mi ubicación en vivo por el mapa pa que llegue directo.',
      },
    ],
  },

  // 21. Tactical Replies: Follow-Up & Availability
  {
    id: 'followup_schedule',
    category: 'Follow-Up',
    title: 'Follow-Up & Confirmation',
    icon: 'clock-check-outline',
    description: 'Confirm appointment, check same-day availability, notify delays, and confirm tomorrow morning.',
    defaultInputPrompt: 'Sorry to bother you, are you still available to come today?',
    phrases: [
      {
        id: 'followup_still_available',
        title: 'Still Available Today?',
        input: 'Sorry to bother you, are you still available to come today?',
        output: 'Disculpe la molestia, ¿sigue disponible para venir hoy?',
        fullPanamenoOutput: 'Buenas maestro, ¿todavía tiene chance de pasar hoy?',
      },
      {
        id: 'followup_heading_there',
        title: 'On My Way Now',
        input: 'Sorry for the delay, I am heading there right now.',
        output: 'Disculpe la demora, voy saliendo para allá ahora mismo.',
        fullPanamenoOutput: 'Disculpe la tardanza, ya voy en camino para allá.',
      },
      {
        id: 'followup_confirmed_tomorrow',
        title: 'Confirmed for Tomorrow Morning',
        input: 'Great, confirmed for tomorrow morning. Thank you very much!',
        output: 'Excelente, quedamos así para mañana en la mañana. ¡Muchas gracias!',
        fullPanamenoOutput: '¡De una compa! Quedamos claros para mañana tempranito. ¡Gracias!',
      },
    ],
  },

  // 22. Property Care: Gardening, Landscaping & Plant Nursery
  {
    id: 'gardening_plants',
    category: 'Gardening',
    title: 'Gardening & Plant Nursery',
    icon: 'sprout-outline',
    description: 'Lawn mowing, tree trimming, machete brush clearing, fruit trees, garden soil, and tropical ornamental plants.',
    defaultInputPrompt: 'Hi! Do you do garden clearing, grass cutting, and do you sell tropical plants or fruit trees?',
    phrases: [
      {
        id: 'garden_mowing_chapeo',
        title: 'Lawn Mowing & Bush Clearing (Chapeo)',
        input: 'Hi! I need someone to cut the grass and clear overgrown brush on my property. Are you available this week?',
        output: '¡Buenas! Necesito hacer un chapeo y corte de grama en mi terreno. ¿Tendrá disponibilidad esta semana?',
        fullPanamenoOutput: '¡Qué xopa maestro! Necesito tirar un buen chapeo y machete al monte. ¿Tiene chance esta semana?',
      },
      {
        id: 'garden_plants_fruit_trees',
        title: 'Tropical Plants & Fruit Trees for Sale',
        input: 'Hello! Do you have fruit trees (lime, mango, avocado) or tropical ornamental plants available for sale?',
        output: '¡Buenas! ¿Tienen arbolitos frutales (limón, mango, aguacate) o plantas ornamentales tropicales a la venta?',
        fullPanamenoOutput: '¡Buenas! ¿Tienen plantones de limón criollo, mango, aguacate o matas ornamentales para sembrar?',
      },
      {
        id: 'garden_tree_palm_trimming',
        title: 'Tree Trimming / Coconut Cutting',
        input: 'Hi! I have tall coconut trees and branches that need safe trimming before the next storm. Could you give me a quote?',
        output: '¡Buenas! Tengo unas palmas de coco y ramas altas que necesito podar por seguridad. ¿Cuánto me cobraría por el trabajo?',
        fullPanamenoOutput: '¡Buenas compa! Tengo que tumbar unos cocos y podar unas ramas peligrosas. ¿Cuánto me cobra por el trabajo?',
      },
      {
        id: 'garden_soil_compost_delivery',
        title: 'Black Soil & Compost Delivery',
        input: 'Hello, do you deliver sacks of black garden soil (tierra negra) and organic compost to the property or dock?',
        output: '¡Hola! ¿Hacen entrega de sacos de tierra negra abonada y abono orgánico para jardín a domicilio o al muelle?',
        fullPanamenoOutput: '¡Hola! ¿Tienen sacos de tierra negra y abono con viaje al muelle o la casa?',
      },
    ],
  },
];

export function getCategoryPastelTheme(presetId: string): PastelTheme {
  switch (presetId) {
    case 'restaurant_dining':
      return {
        bg: '#FAF8F5', // Soft Warm Linen
        border: '#E8E2D8',
        accent: '#6B5E51',
        badgeBg: '#F3ECE2',
        chipBg: '#FFFFFF',
      };
    case 'groceries_diet':
      return {
        bg: '#F2F8F3', // Soft Sage Mint
        border: '#D3E7D5',
        accent: '#376A47',
        badgeBg: '#E3F1E5',
        chipBg: '#FFFFFF',
      };
    case 'taxi_land':
      return {
        bg: '#FAF4F4', // Soft Blush Clay
        border: '#ECD5D5',
        accent: '#824545',
        badgeBg: '#F6E4E4',
        chipBg: '#FFFFFF',
      };
    case 'water_taxi':
      return {
        bg: '#F0F7F9', // Soft Coastal Mist
        border: '#CFE3EB',
        accent: '#2F6278',
        badgeBg: '#DEEDF3',
        chipBg: '#FFFFFF',
      };
    case 'banking_money':
      return {
        bg: '#F2F7F4', // Soft Eucalyptus
        border: '#D2E5D8',
        accent: '#366649',
        badgeBg: '#E2EFE7',
        chipBg: '#FFFFFF',
      };
    case 'power_blackout':
      return {
        bg: '#FAF9F4', // Soft Warm Oat
        border: '#EBE4D5',
        accent: '#6E614D',
        badgeBg: '#F4ECE0',
        chipBg: '#FFFFFF',
      };
    case 'starlink_internet':
      return {
        bg: '#F6F4FA', // Soft Lavender Slate
        border: '#DFD8EC',
        accent: '#584770',
        badgeBg: '#ECE6F5',
        chipBg: '#FFFFFF',
      };
    case 'landlord_housing':
      return {
        bg: '#FAF8F3', // Soft Warm Sand
        border: '#E8E1D5',
        accent: '#695D4A',
        badgeBg: '#F2EBE0',
        chipBg: '#FFFFFF',
      };
    case 'ac_repair':
      return {
        bg: '#F1F7FA', // Soft Ice Mist
        border: '#D2E3ED',
        accent: '#34617A',
        badgeBg: '#E2EDF4',
        chipBg: '#FFFFFF',
      };
    case 'broken_fridge':
      return {
        bg: '#F2F8F5', // Soft Mint
        border: '#D3E6DB',
        accent: '#386950',
        badgeBg: '#E3EFE8',
        chipBg: '#FFFFFF',
      };
    case 'hardware_construction':
      return {
        bg: '#F5F7F5', // Soft Slate Green
        border: '#D8E2D8',
        accent: '#475B4E',
        badgeBg: '#E5EDE5',
        chipBg: '#FFFFFF',
      };
    case 'doctor_clinic':
    case 'medical_pharmacy':
      return {
        bg: '#FAF3F4', // Soft Medical Rose
        border: '#ECD2D6',
        accent: '#85424D',
        badgeBg: '#F5E2E5',
        chipBg: '#FFFFFF',
      };
    case 'pharmacy_prescriptions':
      return {
        bg: '#F0F9F8', // Soft Teal Pharmacy
        border: '#CCEBE7',
        accent: '#26736A',
        badgeBg: '#DCF2F0',
        chipBg: '#FFFFFF',
      };
    case 'dentist_appointments':
      return {
        bg: '#F7F4F9', // Soft Heather Lilac
        border: '#E2D9EA',
        accent: '#5E4B72',
        badgeBg: '#EDE5F4',
        chipBg: '#FFFFFF',
      };
    case 'pet_vet_emergency':
      return {
        bg: '#FAF4F7', // Soft Mauve
        border: '#EAD7E3',
        accent: '#754769',
        badgeBg: '#F4E3F0',
        chipBg: '#FFFFFF',
      };
    case 'boat_repair':
      return {
        bg: '#F0F8F7', // Soft Seafoam
        border: '#D0E6E3',
        accent: '#2F6761',
        badgeBg: '#DEEFECE',
        chipBg: '#FFFFFF',
      };
    case 'car_mechanic':
      return {
        bg: '#FAF5F0', // Soft Warm Peach
        border: '#EBDCCE',
        accent: '#7D583F',
        badgeBg: '#F5E8DC',
        chipBg: '#FFFFFF',
      };
    case 'water_supply':
      return {
        bg: '#F1F7F8', // Soft Aqua Mist
        border: '#D1E4E7',
        accent: '#33656C',
        badgeBg: '#E1EDF0',
        chipBg: '#FFFFFF',
      };
    case 'border_immigration':
      return {
        bg: '#EEF2FF', // Soft Indigo Passport
        border: '#C7D2FE',
        accent: '#3730A3',
        badgeBg: '#E0E7FF',
        chipBg: '#FFFFFF',
      };
    case 'price_yappy_pay':
      return {
        bg: '#F0FDF4', // Soft Emerald Yappy Green
        border: '#86EFAC',
        accent: '#166534',
        badgeBg: '#DCFCE7',
        chipBg: '#FFFFFF',
      };
    case 'dock_location_eta':
      return {
        bg: '#EFF6FF', // Soft Marine Cobalt Blue
        border: '#BFDBFE',
        accent: '#1D4ED8',
        badgeBg: '#DBEAFE',
        chipBg: '#FFFFFF',
      };
    case 'followup_schedule':
      return {
        bg: '#FFFBEB', // Soft Sunset Amber Gold
        border: '#FDE68A',
        accent: '#B45309',
        badgeBg: '#FEF3C7',
        chipBg: '#FFFFFF',
      };
    case 'gardening_plants':
      return {
        bg: '#F2F8F1', // Soft Botanical Garden Green
        border: '#D2E8CF',
        accent: '#2E663B',
        badgeBg: '#E1F2DD',
        chipBg: '#FFFFFF',
      };
    default:
      return {
        bg: '#FAF9F6',
        border: '#E5E2DA',
        accent: '#4B5563',
        badgeBg: '#F3F4F6',
        chipBg: '#FFFFFF',
      };
  }
}
