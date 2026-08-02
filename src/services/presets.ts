import { ServicePreset } from '../types';

export const SERVICE_PRESETS: ServicePreset[] = [
  {
    id: 'medical_pharmacy',
    category: 'Health & Emergency',
    title: 'Medical & Pharmacy',
    icon: 'hospital-building',
    description: 'Describe symptoms, urgent clinic visits, ambulance, or open pharmacy inquiries.',
    defaultInputPrompt: 'Hi, I need an urgent doctor consultation or nearest open pharmacy in Bocas.',
    phrases: [
      {
        title: 'Urgent Doctor Visit',
        input: '¡Buenas! Tengo fiebre y dolor intenso, ¿tienen un médico disponible para una consulta hoy?',
      },
      {
        title: 'Pharmacy Medication',
        input: 'Hola, ¿tienen medicamentos para la infección/fiebre en la farmacia y hasta qué hora están abiertos?',
      },
      {
        title: 'Medical Emergency Help',
        input: '¡Buenas! Necesito asistencia médica de emergencia o una ambulancia inmediatamente, por favor.',
      },
    ],
  },
  {
    id: 'dentist_appointments',
    category: 'Appointments',
    title: 'Dentist & Appointments',
    icon: 'tooth-outline',
    description: 'Schedule urgent dentist visits, toothache appointments, or general health checkups.',
    defaultInputPrompt: 'Hi, I have a severe toothache and need an urgent dentist appointment today.',
    phrases: [
      {
        title: 'Urgent Toothache Appointment',
        input: '¡Buenas! Tengo un dolor de muela muy fuerte, ¿tendrá cita disponible con el dentista hoy?',
      },
      {
        title: 'Schedule Dental Cleaning',
        input: 'Hola, quisiera programar una cita para una limpieza dental la próxima semana.',
      },
      {
        title: 'Doctor Follow-up / Lab Results',
        input: 'Buenas, quisiera consultar por los resultados de mis exámenes de laboratorio.',
      },
    ],
  },
  {
    id: 'ac_repair',
    category: 'Home & Climate',
    title: 'Air Conditioning (A/C)',
    icon: 'snowflake',
    description: 'A/C leaking, remote control issues, refrigerant refill, or no cold air.',
    defaultInputPrompt: 'My air conditioning unit is leaking water and not blowing cold air.',
    phrases: [
      {
        title: 'A/C Leaking Water',
        input: '¡Buenas! El aire acondicionado está goteando agua dentro de la habitación. ¿Podría venir a revisarlo?',
      },
      {
        title: 'Needs Gas/Refrigerant',
        input: 'Hola, el aire acondicionado enciende pero no frena frío. Creo que necesita recarga de gas.',
      },
      {
        title: 'Remote Not Working',
        input: 'Hola, el control remoto del aire no responde. ¿Podría revisarlo?',
      },
    ],
  },
  {
    id: 'broken_fridge',
    category: 'Appliances',
    title: 'Broken Fridge & Appliances',
    icon: 'fridge-outline',
    description: 'Fridge not cooling, freezer defrosting, stove or washing machine broken.',
    defaultInputPrompt: 'Our refrigerator stopped cooling and the food inside is defrosting.',
    phrases: [
      {
        title: 'Fridge Not Cooling',
        input: 'Hola, la nevera dejó de enfriar hoy. ¿Podría venir un técnico a revisarla?',
      },
      {
        title: 'Washing Machine Error',
        input: 'Buenas, la lavadora no está botando el agua al final del ciclo.',
      },
      {
        title: 'Stove Ignition Broken',
        input: 'Hola, el quemador de la estufa no está encendiendo bien.',
      },
    ],
  },
  {
    id: 'boat_repair',
    category: 'Marine & Outdoors',
    title: 'Boat Repairs & Marine',
    icon: 'sail-boat',
    description: 'Outboard motor troubles, bilge pump, hull checks, or battery issues.',
    defaultInputPrompt: 'The outboard motor is turning over but will not start.',
    phrases: [
      {
        title: 'Outboard Motor Won\'t Start',
        input: '¡Buenas! El motor fuera de borda de la lancha no quiere arrancar. ¿Hace trabajos de mecánica marina por aquí?',
      },
      {
        title: 'Bilge Pump Check',
        input: '¡Buenas! Necesito que alguien revise la bomba de achique automática y el cableado de la batería marina, por favor.',
      },
      {
        title: 'Hull Clean & Maintenance',
        input: '¡Buenas! ¿Realiza limpieza de casco y revisión de hélice en el muelle?',
      },
    ],
  },
  {
    id: 'car_mechanic',
    category: 'Vehicles',
    title: 'Car & Vehicle Maintenance',
    icon: 'car-wrench',
    description: 'Flat tires, battery jump, oil changes, engine warning light, mechanic quote.',
    defaultInputPrompt: 'My car battery is dead and I need a jump start or replacement.',
    phrases: [
      {
        title: 'Dead Battery Jump',
        input: '¡Buenas! La batería del carro se descargó por completo. ¿Alguien podría traerme cables o una batería nueva?',
      },
      {
        title: 'Punctured Tire Repair',
        input: 'Hola, la llanta tiene un clavo y perdió aire. ¿Dónde podría repararla cerca?',
      },
      {
        title: 'Oil Change & Checkup',
        input: 'Buenas, quisiera programar un cambio de aceite y revisión general de frenos.',
      },
    ],
  },
  {
    id: 'starlink_internet',
    category: 'Tech & Connectivity',
    title: 'Internet & Starlink Repairs',
    icon: 'satellite-variant',
    description: 'Starlink dish alignment, Wi-Fi router reboot, cut fiber line, ISP setup.',
    defaultInputPrompt: 'My Starlink dish lost signal connection and the router light is red.',
    phrases: [
      {
        title: 'Starlink Dish Disconnected',
        input: 'Buenas, la antena de Starlink perdió la conexión. ¿Hay alguna caída de señal en la zona?',
      },
      {
        title: 'Fiber Cable Damaged',
        input: 'Hola, el cable de fibra de internet afuera de la casa parece dañado o cortado.',
      },
      {
        title: 'Router Reboot / Low Speed',
        input: 'Buenas, el internet está muy lento hoy. ¿Podría verificar el estado de la línea?',
      },
    ],
  },
  {
    id: 'landlord_housing',
    category: 'Housing & Property',
    title: 'Landlord & Property Care',
    icon: 'home-city-outline',
    description: 'Rent inquiries, spare keys, water pressure, garbage collection, gate access.',
    defaultInputPrompt: 'Hi, the water pressure in the shower dropped significantly today.',
    phrases: [
      {
        title: 'Low Water Pressure',
        input: '¡Buenas! La presión del agua en el baño principal bajó por completo.',
      },
      {
        title: 'Spare Key Request',
        input: 'Hola, me quedé fuera por accidente. ¿Tendrá un duplicado de la llave cerca?',
      },
      {
        title: 'Rent & Utility Payment',
        input: 'Buenas, ya le envié el pago del alquiler por transferencia y le adjunté el comprobante.',
      },
    ],
  },
];
