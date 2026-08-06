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
        input: 'Hi! I have a fever and severe pain. Is a doctor available for a consultation today?',
      },
      {
        title: 'Pharmacy Medication',
        input: 'Hello, do you have medication for fever/infection in the pharmacy and what time are you open until?',
      },
      {
        title: 'Medical Emergency Help',
        input: 'Hi! I need urgent medical assistance or an ambulance immediately, please.',
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
        input: 'Hi! I have a severe toothache. Is a dentist appointment available today?',
      },
      {
        title: 'Schedule Dental Cleaning',
        input: 'Hello, I would like to schedule a dental cleaning appointment for next week.',
      },
      {
        title: 'Doctor Follow-up / Lab Results',
        input: 'Hi, I would like to inquire about the results of my laboratory exams.',
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
        input: 'Hi! The air conditioner is leaking water inside the room. Could you come check it?',
      },
      {
        title: 'Needs Gas/Refrigerant',
        input: 'Hello, the air conditioner turns on but is not blowing cold air. I think it needs gas refill.',
      },
      {
        title: 'Remote Not Working',
        input: 'Hello, the air conditioner remote control is not responding. Could you check it?',
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
        input: 'Hello, the refrigerator stopped cooling today. Could a technician inspect it?',
      },
      {
        title: 'Washing Machine Error',
        input: 'Hi, the washing machine is not draining water at the end of the cycle.',
      },
      {
        title: 'Stove Ignition Broken',
        input: 'Hello, the stove burner is not igniting properly.',
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
        input: 'Hi! The boat outboard motor won\'t start. Do you do marine mechanics here?',
      },
      {
        title: 'Bilge Pump Check',
        input: 'Hi! I need someone to check the automatic bilge pump and marine battery wiring, please.',
      },
      {
        title: 'Hull Clean & Maintenance',
        input: 'Hi! Do you do hull cleaning and propeller inspection at the dock?',
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
        input: 'Hi! The car battery is dead. Could someone bring jumper cables or a new battery?',
      },
      {
        title: 'Punctured Tire Repair',
        input: 'Hello, the tire has a nail in it and lost air. Where can I get it repaired nearby?',
      },
      {
        title: 'Oil Change & Checkup',
        input: 'Hi, I would like to schedule an oil change and general brake checkup.',
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
        input: 'Hi, the Starlink dish lost connection. Is there a signal outage in the area?',
      },
      {
        title: 'Fiber Cable Damaged',
        input: 'Hello, the internet fiber cable outside the house appears damaged or cut.',
      },
      {
        title: 'Router Reboot / Low Speed',
        input: 'Hi, the internet is very slow today. Could you check the line status?',
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
        input: 'Hi! The water pressure in the main bathroom dropped completely.',
      },
      {
        title: 'Spare Key Request',
        input: 'Hello, I accidentally locked myself out. Do you have a spare key nearby?',
      },
      {
        title: 'Rent & Utility Payment',
        input: 'Hi, I sent the rent payment via transfer and attached the proof.',
      },
    ],
  },
];
