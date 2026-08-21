// Local Service Directory Service (MongoDB Atlas Schema & Regional Provider Data)
// Supports multi-region scaling (Starting with Bocas del Toro, Panama)
import { LocalServiceProvider } from '../types';
import { getCustomProviders, normalizePanamaPhoneNumber } from './storage';

export type { LocalServiceProvider };

// Initial Verified Directory for Bocas del Toro, Panama 🇵🇦
export const INITIAL_BOCAS_DIRECTORY: LocalServiceProvider[] = [
  // --- BANKING, ATMS & MONEY TRANSFERS ---
  {
    id: 'bocas_bank_banconal',
    region: 'bocas_del_toro',
    category: 'banking_money',
    serviceType: 'bank',
    name: 'Banco Nacional de Panamá (Branch & ATM)',
    phoneNumber: '+507 757-9230',
    address: 'Calle 4ta (Av. Central), Vía Aeropuerto, Bocas Town, Isla Colón',
    hours: 'Mon-Fri: 8:00 AM – 3:00 PM • Sat: 9:00 AM – 12:00 PM • ATM: 24/7',
    rating: 4.8,
    verified: true,
    notes: 'Primary official bank on Isla Colón. Official branch tellers + 24/7 ATM (can run low on cash on holiday weekends).',
    googleMapsQuery: 'Banco Nacional de Panama Bocas del Toro',
  },
  {
    id: 'bocas_atm_police_station',
    region: 'bocas_del_toro',
    category: 'banking_money',
    serviceType: 'atm',
    name: 'Duo2 Market ATM (Near Police Station)',
    address: 'In front of Duo2 Market, Calle 1ra / Calle 2da (near National Police Station & Parque Simón Bolívar), Bocas Town',
    hours: 'Daily during store hours: ~7:00 AM – 9:30 PM',
    rating: 4.8,
    verified: true,
    notes: 'Telered ATM located right in front of Duo2 Market by the police station / central park. Very handy alternative if Banco Nacional is out of cash.',
    googleMapsQuery: 'Duo2 Market Bocas del Toro Isla Colon',
  },
  {
    id: 'bocas_atm_supermarket',
    region: 'bocas_del_toro',
    category: 'banking_money',
    serviceType: 'atm',
    name: 'Supermarket Alba ATM (Calle 3ra)',
    address: 'In front of Supermarket Alba, Calle 3ra (Main Street), Bocas Town, Isla Colón',
    hours: 'Daily during store hours: ~7:00 AM – 9:30 PM',
    rating: 4.7,
    verified: true,
    notes: 'Independent Telered ATM located right in front of Supermarket Alba on the main street. Great backup when bank lines are long ($500 max withdrawal).',
    googleMapsQuery: 'Supermercado Alba Bocas del Toro Isla Colon',
  },
  {
    id: 'changuinola_western_union_1',
    region: 'changuinola',
    category: 'banking_money',
    serviceType: 'western_union',
    name: 'Western Union (Changuinola Main Branch)',
    phoneNumber: '+507 301-2623 / 758-8009',
    address: 'Av. 17 de Abril, Changuinola (Forzacom / Diag. Casino Lucky Dragon & Edif. Sincota)',
    hours: 'Mon-Sat: 8:00 AM – 5:00 PM • Sun: Closed',
    rating: 4.9,
    verified: true,
    notes: 'Primary full-service Western Union in Bocas province for picking up and sending international money transfers.',
    googleMapsQuery: 'Western Union Changuinola Panama',
  },
  {
    id: 'guabito_western_union_2',
    region: 'guabito',
    category: 'banking_money',
    serviceType: 'western_union',
    name: 'Western Union / Agroveterinaria (Guabito Border)',
    phoneNumber: '+507 758-3877',
    address: 'Ave Principal, Urbanización Guabito (Near Panama-Costa Rica Border Crossing)',
    hours: 'Mon-Fri: 8:00 AM – 5:00 PM • Sat: 8:00 AM – 12:00 PM • Sun: Closed',
    rating: 4.8,
    verified: true,
    notes: 'Border wire pickup branch located right near the Guabito/Sixaola border bridge.',
    googleMapsQuery: 'Guabito border crossing Bocas del Toro',
  },
  {
    id: 'bocas_punto_pago_network',
    region: 'bocas_del_toro',
    category: 'banking_money',
    serviceType: 'punto_pago',
    name: 'Punto Pago Kiosks & Agent Network',
    whatsappNumber: '+50762625817',
    address: 'Inside Supermercado Isla Colón & Local Pharmacies (Isla Colón & Changuinola)',
    hours: 'Daily: ~7:00 AM – 9:00 PM (Store opening hours)',
    rating: 4.9,
    verified: true,
    notes: 'Automated touch-screen kiosks for paying Naturgy electricity bills, IDAAN water, Tigo/Más Móvil cellular recharges, and prepaid cards.',
    googleMapsQuery: 'Punto Pago Panama',
  },
  {
    id: 'bocas_naturgy_office',
    region: 'bocas_del_toro',
    category: 'banking_money',
    serviceType: 'utility',
    name: 'Naturgy Customer Service Center',
    address: 'Calle E, frente al Edificio de la Gobernación, Isla Colón',
    hours: 'Mon-Fri: 8:00 AM – 4:00 PM • Sat-Sun: Closed',
    rating: 4.6,
    verified: true,
    notes: 'Official electric utility office for in-person account inquiries, meter inspections, and billing.',
    googleMapsQuery: 'Gobernacion Bocas del Toro Calle E',
  },

  // --- HOPE SPOTS CERTIFIED BOAT CAPTAINS & WATER TAXIS ---
  {
    id: 'captain-50767450876',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Justo Raul Pineda – Independent Captain',
    whatsappNumber: '+507 6745-0876',
    phoneNumber: '+507 6745-0876',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50768968680',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Hipólito Baker – Ngabe Tours',
    whatsappNumber: '+507 6896-8680',
    phoneNumber: '+507 6896-8680',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain (Ngabe Tours). Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50769014186',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Junnior Ortiz – Bocas Island Adventours',
    whatsappNumber: '+507 6901-4186',
    phoneNumber: '+507 6901-4186',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain (Bocas Island Adventours). Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50768754839',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Camilo Georget – Independent Captain',
    whatsappNumber: '+507 6875-4839',
    phoneNumber: '+507 6875-4839',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50767631520',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Melquiades Stonstreet – Independent Captain',
    whatsappNumber: '+507 6763-1520',
    phoneNumber: '+507 6763-1520',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50768096370',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Gustavo Powell – Independent Captain',
    whatsappNumber: '+507 6809-6370',
    phoneNumber: '+507 6809-6370',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50765019283',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Emanuel Montenegro – Kawi Voyage',
    whatsappNumber: '+507 6501-9283',
    phoneNumber: '+507 6501-9283',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain (Kawi Voyage). Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50765034391',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Rodney Smith – Independent Captain',
    whatsappNumber: '+507 6503-4391',
    phoneNumber: '+507 6503-4391',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50769111253',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Monases Montenegro – Independent Captain',
    whatsappNumber: '+507 6911-1253',
    phoneNumber: '+507 6911-1253',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50769315125',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Angelino Palacio – VIP Tours',
    whatsappNumber: '+507 6931-5125',
    phoneNumber: '+507 6931-5125',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain (VIP Tours). Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50766156881',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. José Torres Chiritorres – Independent Captain',
    whatsappNumber: '+507 6615-6881',
    phoneNumber: '+507 6615-6881',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50766954123',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Ceferino Palacio – Independent Captain',
    whatsappNumber: '+507 6695-4123',
    phoneNumber: '+507 6695-4123',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50761881871',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Omar Abrego – Ngabe Tours',
    whatsappNumber: '+507 6188-1871',
    phoneNumber: '+507 6188-1871',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain (Ngabe Tours). Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50765167785',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Cesar Porta – Independent Captain',
    whatsappNumber: '+507 6516-7785',
    phoneNumber: '+507 6516-7785',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50765058568',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Sebastián Castillo – Independent Captain',
    whatsappNumber: '+507 6505-8568',
    phoneNumber: '+507 6505-8568',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50764821122',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Miguel Montenegro – Kawi Voyage',
    whatsappNumber: '+507 6482-1122',
    phoneNumber: '+507 6482-1122',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain (Kawi Voyage). Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50767692550',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Josias Bryan – Bocas Water Excursion',
    whatsappNumber: '+507 6769-2550',
    phoneNumber: '+507 6769-2550',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain (Bocas Water Excursion). Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50765106878',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Neftaly Montenegro – Kawi Voyage',
    whatsappNumber: '+507 6510-6878',
    phoneNumber: '+507 6510-6878',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain (Kawi Voyage). Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50763735079',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Edilberto Peñaloza – Independent Captain',
    whatsappNumber: '+507 6373-5079',
    phoneNumber: '+507 6373-5079',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50768888811',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Joanes Montenegro – Kawi Voyage',
    whatsappNumber: '+507 6888-8811',
    phoneNumber: '+507 6888-8811',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain (Kawi Voyage). Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50762482550',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Steve Eduardo – Ortiz Bocas Island Adventours',
    whatsappNumber: '+507 6248-2550',
    phoneNumber: '+507 6248-2550',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain (Ortiz Bocas Island Adventours). Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50767342535',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Celindo Martinez – Independent Captain',
    whatsappNumber: '+507 6734-2535',
    phoneNumber: '+507 6734-2535',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50766431752',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Demetrio Georget – Independent Captain',
    whatsappNumber: '+507 6643-1752',
    phoneNumber: '+507 6643-1752',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50766087142',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Gregorio Castillo – Independent Captain',
    whatsappNumber: '+507 6608-7142',
    phoneNumber: '+507 6608-7142',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50766158881',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Josiel Torres Chiritorres – Independent Captain',
    whatsappNumber: '+507 6615-8881',
    phoneNumber: '+507 6615-8881',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'captain-50767207638',
    region: 'bocas_del_toro',
    category: 'water_taxi',
    serviceType: 'service',
    name: 'Capt. Roberto Forbes Cametur – Independent Captain',
    whatsappNumber: '+507 6720-7638',
    phoneNumber: '+507 6720-7638',
    address: 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)',
    hours: 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request',
    rating: 5.0,
    verified: true,
    notes: 'Hope Spot Certified captain. Specialist in island-to-island water taxi, private charters, and marine tours.',
  },
  {
    id: 'solarte_soil_works',
    region: 'bocas_del_toro',
    category: 'gardening_plants',
    serviceType: 'service',
    name: 'Solarte Soil Works (Finca Natural)',
    address: 'Isla Solarte, Bocas del Toro (Archipelago Islands)',
    hours: 'Mon–Sat: ~8:00 AM – 4:00 PM • Dock delivery upon request',
    rating: 5.0,
    verified: true,
    notes: 'Organic living soil farm and permaculture nursery on Isla Solarte. Specializing in indigenous microorganisms (IMO), bio-complete garden soil, nutrient compost, mulching, and tropical plants.',
    googleMapsQuery: 'Isla Solarte Bocas del Toro',
  },
];

// Contextual Ad Targeting Helper
export function getMatchingProviderForCategory(categoryName?: string): LocalServiceProvider | null {
  if (!categoryName) return null;
  const lower = categoryName.toLowerCase();

  if (lower.includes('garden') || lower.includes('plant') || lower.includes('jardin') || lower.includes('soil') || lower.includes('landscap') || lower.includes('chapeo')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'gardening_plants') || null;
  }
  if (lower.includes('bank') || lower.includes('atm') || lower.includes('cajero') || lower.includes('money') || lower.includes('western') || lower.includes('punto')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'banking_money') || null;
  }
  if (lower.includes('air') || lower.includes('ac') || lower.includes('conditioning') || lower.includes('cooling')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'ac_repair') || null;
  }
  if (lower.includes('boat') || lower.includes('water') || lower.includes('taxi') || lower.includes('marina') || lower.includes('captain') || lower.includes('capitan') || lower.includes('lancha')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'water_taxi' || p.category === 'boat_repair') || null;
  }
  if (lower.includes('starlink') || lower.includes('wifi') || lower.includes('internet')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'starlink_internet') || null;
  }
  if (lower.includes('plumb') || lower.includes('housing') || lower.includes('landlord') || lower.includes('water')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'landlord_housing') || null;
  }
  if (lower.includes('medical') || lower.includes('doctor') || lower.includes('pharmacy') || lower.includes('clinic') || lower.includes('dentist')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'medical_pharmacy' || p.category === 'doctor_clinic' || p.category === 'pharmacy_prescriptions' || p.category === 'dentist_appointments') || null;
  }

  return null;
}

export async function fetchRegionalProviders(
  region: string = 'bocas_del_toro',
  category?: string
): Promise<LocalServiceProvider[]> {
  // 1. Try Live PoquitoTalk Verified Directory Feed
  try {
    const apiRes = await fetch('https://poquitotalk.hero-apps.com/api/contractors.php');
    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped: LocalServiceProvider[] = json.data.map((item: any) => ({
          id: item.id,
          region: 'bocas_del_toro',
          category: (item.category || 'contractors').toLowerCase(),
          serviceType: (item.category_label || item.category || 'contractor').toLowerCase(),
          name: item.name || 'Verified Provider',
          whatsappNumber: item.phone_raw || item.phone,
          address: item.location || 'Bocas del Toro',
          hours: item.hours || 'Daily Availability',
          rating: item.rating || 5.0,
          verified: item.verified !== false,
          notes: item.description_en || item.description || '',
          googleMapsQuery: item.map_url || undefined,
        }));

        if (category) {
          return mapped.filter((p) => p.category === category || p.serviceType.includes(category.toLowerCase()));
        }
        return mapped;
      }
    }
  } catch (apiError) {
    console.warn('PoquitoTalk Live Directory API fallback to local cache:', apiError);
  }

  // 2. Fallback to MongoDB Atlas Data API if configured
  try {
    const mongoDataApiUrl = process.env.EXPO_PUBLIC_MONGO_ATLAS_URL;
    if (mongoDataApiUrl) {
      const response = await fetch(`${mongoDataApiUrl}/action/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.EXPO_PUBLIC_MONGO_API_KEY || '',
        },
        body: JSON.stringify({
          dataSource: 'Cluster0',
          database: 'poquitotalk',
          collection: 'providers',
          filter: category ? { category } : {},
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.documents && result.documents.length > 0) {
          return result.documents;
        }
      }
    }
  } catch (error) {
    console.warn('MongoDB Atlas fetch fallback to local initial directory:', error);
  }

  // 3. Fallback to Offline Local Directory + User Custom Providers
  const customList = await getCustomProviders();
  const fullList = [...customList, ...INITIAL_BOCAS_DIRECTORY];

  return fullList.filter((p) => {
    const matchesCategory = !category || p.category === category;
    return matchesCategory;
  });
}

/**
 * Finds an existing provider by normalized phone number to prevent duplicate entries
 */
export function findExistingProviderByPhone(
  rawPhone: string,
  existingProviders: LocalServiceProvider[] = INITIAL_BOCAS_DIRECTORY
): LocalServiceProvider | undefined {
  if (!rawPhone) return undefined;
  const targetNormalized = normalizePanamaPhoneNumber(rawPhone);
  if (!targetNormalized) return undefined;

  return existingProviders.find((p) => {
    const pNorm1 = normalizePanamaPhoneNumber(p.whatsappNumber || '');
    const pNorm2 = normalizePanamaPhoneNumber(p.phoneNumber || '');
    return pNorm1 === targetNormalized || pNorm2 === targetNormalized;
  });
}
