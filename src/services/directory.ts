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
    address: 'Inside Duo2 Market, Calle 1ra / Calle 2da (near National Police Station & Parque Simón Bolívar), Bocas Town',
    hours: 'Daily during store hours: ~7:00 AM – 9:30 PM',
    rating: 4.8,
    verified: true,
    notes: 'Telered ATM located inside the Duo2 Market supermarket by the police station / central park. Very handy alternative if Banco Nacional is out of cash.',
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
    notes: 'NOTE: No Western Union in Bocas Town! This Changuinola branch is the only official Western Union agency in Bocas del Toro province for international wire pickups (take passenger ferry to Almirante, then 40m taxi/bus to Changuinola).',
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
    whatsappNumber: '+507 6562-9220',
    phoneNumber: '+507 6562-9220',
    address: 'Isla Solarte, Bocas del Toro (Archipelago Islands)',
    hours: 'Mon–Sat: ~8:00 AM – 4:00 PM • Dock delivery upon request',
    rating: 5.0,
    verified: true,
    notes: 'Organic living soil farm and permaculture nursery on Isla Solarte. Specializing in indigenous microorganisms (IMO), bio-complete garden soil, nutrient compost, mulching, and tropical plants.',
    googleMapsQuery: 'Isla Solarte Bocas del Toro',
  },
  // --- LAND TAXIS & TRANSPORT (VERIFIED FACILITY & CAR RENTALS) ---
  {
    id: 'piquera_taxis_parque_central',
    region: 'bocas_del_toro',
    category: 'land_taxi',
    serviceType: 'taxi_land',
    name: 'Piquera de Taxis Isla Colón (Radio Taxi Central)',
    phoneNumber: '+507 757-9260',
    address: 'Parque Simón Bolívar, Calle 3ra, Bocas Town, Isla Colón',
    hours: 'Daily: 6:00 AM – 11:00 PM',
    rating: 4.8,
    verified: true,
    notes: 'Official land taxi cooperative dispatch station in Bocas Town. Standard fixed fares: Bocas Town ($2-$3), Big Creek ($5), Paunch ($7), Bluff ($15), Boca del Drago ($15).',
    googleMapsQuery: 'Parque Simon Bolivar Bocas del Toro',
  },
  {
    id: 'contractor_f01fe949',
    region: 'bocas_del_toro',
    category: 'land_taxi',
    serviceType: 'taxi_land',
    name: 'Bocas Car Rental',
    whatsappNumber: '+507 6860-0808',
    phoneNumber: '+507 6860-0808',
    address: 'Av. H Norte (Near El Último Refugio), Bocas Town, Isla Colón',
    hours: 'Daily: ~8:00 AM – 6:00 PM',
    rating: 5.0,
    verified: true,
    notes: 'Passenger vehicle rentals (5, 6, 8 passenger cars), 4x4 vehicles, and UTV rentals in Bocas Town. Located on Av. H north by El Último Refugio.',
    googleMapsQuery: 'El Ultimo Refugio Bocas Town',
  },
  // --- ELECTRICIANS, A/C & SOLAR TRADES ---
  {
    id: 'contractor_acd58037',
    region: 'bocas_del_toro',
    category: 'ac_repair',
    serviceType: 'service',
    name: 'Scott Solutions Bocas',
    whatsappNumber: '+507 6904-8615',
    phoneNumber: '+507 6904-8615',
    address: 'Isla Colón & Archipelago, Bocas del Toro',
    hours: 'Mon–Sat: ~8:00 AM – 5:00 PM • Emergency calls',
    rating: 5.0,
    verified: true,
    notes: 'UK-qualified electrical contractor trained internationally including underwater electrics. Electrical installations to European standards, whole-home surge and lightning protection, independent earthing systems, ring circuits, Starlink setups, and building electrical safety evaluations.',
    googleMapsQuery: 'Bocas Town Isla Colon',
  },
  {
    id: 'contractor_9a5db1dd',
    region: 'bocas_del_toro',
    category: 'ac_repair',
    serviceType: 'service',
    name: 'Luis Ángel Herrera Palacio',
    whatsappNumber: '+507 6605-1612',
    phoneNumber: '+507 6605-1612',
    address: 'Isla Colón / Bocas Town',
    hours: 'Mon–Sat: ~8:00 AM – 6:00 PM',
    rating: 5.0,
    verified: true,
    notes: 'A/C repair and refrigeration technician. Professional maintenance, refrigerant top-offs, diagnostics, and repairs for residential and commercial split units.',
    googleMapsQuery: 'Bocas Town Isla Colon',
  },
  // --- CONTRACTORS, HANDYMEN & FABRICATION ---
  {
    id: 'contractor_8bd329c6',
    region: 'bocas_del_toro',
    category: 'contractor_housing',
    serviceType: 'service',
    name: 'Abner Shalém Pineda Baker',
    whatsappNumber: '+507 6404-0523',
    phoneNumber: '+507 6404-0523',
    address: 'Isla Colón & Archipelago, Bocas del Toro',
    hours: 'Mon–Sat: ~7:00 AM – 5:30 PM',
    rating: 5.0,
    verified: true,
    notes: 'Versatile general contractor and property maintenance specialist. Experience with residential and commercial repairs, minor structural adjustments, painting, custom carpentry and wood structures, property grounds clearing and pruning.',
    googleMapsQuery: 'Bocas Town Isla Colon',
  },
  {
    id: 'contractor_a16a4bf9',
    region: 'bocas_del_toro',
    category: 'contractor_housing',
    serviceType: 'service',
    name: 'Reg Soldadura',
    whatsappNumber: '+507 6597-1099',
    phoneNumber: '+507 6597-1099',
    address: 'Isla Colón / Bocas Town',
    hours: 'Mon–Sat: ~7:30 AM – 5:00 PM',
    rating: 5.0,
    verified: true,
    notes: 'Welder available for custom fabrication, remanufacturing car parts, bicycle racks, security doors and burglar-proof window grates, farm 4-wheelers, and metal structural repairs.',
    googleMapsQuery: 'Bocas Town Isla Colon',
  },

  // --- DOCTOR, CLINIC & PHARMACY (VERIFIED FACILITIES) ---
  {
    id: 'hospital_raul_davila_changuinola',
    region: 'changuinola',
    category: 'medical_pharmacy',
    serviceType: 'doctor_clinic',
    name: 'Hospital Dr. Raúl Dávila Bolaños (Regional Hospital)',
    phoneNumber: '+507 758-8232',
    address: 'Av. 17 de Abril, Changuinola, Bocas del Toro',
    hours: '24 Hours / 7 Days a Week Emergency Department',
    rating: 4.7,
    verified: true,
    notes: 'Main regional public hospital with emergency trauma department, surgical units, X-ray, and inpatient medical wards.',
    googleMapsQuery: 'Hospital Dr Raul Davila Bolanos Changuinola',
  },
  {
    id: 'farmacia_isla_colon',
    region: 'bocas_del_toro',
    category: 'medical_pharmacy',
    serviceType: 'pharmacy_prescriptions',
    name: 'Farmacia Isla Colón (Main Street)',
    phoneNumber: '+507 757-9280',
    address: 'Calle 3ra (Main Street), Bocas Town, Isla Colón',
    hours: 'Mon-Sat: 8:00 AM – 9:00 PM • Sun: 9:00 AM – 7:00 PM',
    rating: 4.8,
    verified: true,
    notes: 'Full-service island pharmacy stocking prescription medications, antibiotics, pain relievers, first-aid bandages, electrolytes, and insect repellents.',
    googleMapsQuery: 'Farmacia Isla Colon Calle 3ra',
  },

  // --- SUPERMARKETS & PROVISIONS (VERIFIED FACILITY) ---
  {
    id: 'supermercado_isla_colon',
    region: 'bocas_del_toro',
    category: 'dining_provisions',
    serviceType: 'dining_groceries',
    name: 'Supermercado Isla Colón (Main Grocery Market)',
    address: 'Calle 3ra (Av. Principal), Bocas Town, Isla Colón',
    hours: 'Daily: 7:00 AM – 10:00 PM',
    rating: 4.7,
    verified: true,
    notes: 'Comprehensive grocery market with fresh meats, dairy, island produce, pantry staples, toiletries, cooking supplies, and cold beverages.',
    googleMapsQuery: 'Supermercado Isla Colon Bocas del Toro',
  },

  // --- COMMUNITY & ISLAND CULTURE (VERIFIED FACILITY) ---
  {
    id: 'bocas_free_book_exchange',
    region: 'bocas_del_toro',
    category: 'community_culture',
    serviceType: 'service',
    name: 'Bocas Free Book Exchange',
    address: 'Calle Segunda (Next to Mono Loco), Bocas Town, Isla Colón',
    hours: 'Open 24/7 (Always Open • Rain or Shine • Self-Service)',
    rating: 5.0,
    verified: true,
    notes: 'Self-service community book exchange open 24/7 in all weather. No staff or checkout required - stop by anytime to browse, take a book, and bring one to exchange if possible. Multi-language titles available. Book donations warmly welcomed (Spanish language books especially needed!).',
    googleMapsQuery: 'Mono Loco Calle 2da Bocas del Toro Isla Colon',
  },
];

// Contextual Ad Targeting Helper
export function getMatchingProviderForCategory(categoryName?: string): LocalServiceProvider | null {
  if (!categoryName) return null;
  const lower = categoryName.toLowerCase();

  if (lower.includes('book') || lower.includes('libro') || lower.includes('read') || lower.includes('exchange') || lower.includes('culture') || lower.includes('community')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.id === 'bocas_free_book_exchange') || null;
  }

  if (lower.includes('garden') || lower.includes('plant') || lower.includes('jardin') || lower.includes('soil') || lower.includes('landscap') || lower.includes('chapeo')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'gardening_plants') || null;
  }
  if (lower.includes('bank') || lower.includes('atm') || lower.includes('cajero') || lower.includes('money') || lower.includes('western') || lower.includes('punto')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'banking_money') || null;
  }
  if (lower.includes('air') || lower.includes('ac') || lower.includes('conditioning') || lower.includes('cooling') || lower.includes('clima') || lower.includes('electric') || lower.includes('solar')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'ac_repair') || null;
  }
  if (lower.includes('boat') || lower.includes('water') || lower.includes('taxi') || lower.includes('marina') || lower.includes('captain') || lower.includes('capitan') || lower.includes('lancha')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'water_taxi' || p.category === 'boat_repair') || null;
  }
  if (lower.includes('starlink') || lower.includes('wifi') || lower.includes('internet')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'starlink_internet') || null;
  }
  if (lower.includes('plumb') || lower.includes('water') || lower.includes('bomba') || lower.includes('cisterna')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'plumbing_water') || null;
  }
  if (lower.includes('medical') || lower.includes('doctor') || lower.includes('pharmacy') || lower.includes('clinic') || lower.includes('dentist')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'medical_pharmacy' || p.category === 'doctor_clinic' || p.category === 'pharmacy_prescriptions' || p.category === 'dentist_appointments') || null;
  }
  if (lower.includes('vet') || lower.includes('pet') || lower.includes('animal') || lower.includes('dog') || lower.includes('cat')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'vet_animal') || null;
  }
  if (lower.includes('taxi') || lower.includes('shuttle') || lower.includes('transport')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'land_taxi') || null;
  }
  if (lower.includes('dining') || lower.includes('grocer') || lower.includes('gourmet') || lower.includes('supermarket') || lower.includes('food')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'dining_provisions') || null;
  }
  if (lower.includes('contractor') || lower.includes('dock') || lower.includes('handyman') || lower.includes('housing') || lower.includes('carpenter')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'contractor_housing') || null;
  }

  return null;
}

export async function fetchRegionalProviders(
  region: string = 'bocas_del_toro',
  category?: string
): Promise<LocalServiceProvider[]> {
  const customList = await getCustomProviders();
  let baseList: LocalServiceProvider[] = [...customList, ...INITIAL_BOCAS_DIRECTORY];

  // 1. Try Live PoquitoTalk Verified Directory Feed
  try {
    const apiRes = await fetch('https://poquitotalk.hero-apps.com/api/contractors.php');
    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const liveMapped: LocalServiceProvider[] = json.data.map((item: any) => {
          const rawCat = (item.category || '').toUpperCase();
          const trade = (item.category_label || item.trade_category || '').toUpperCase();
          const nameUpper = (item.name || item.name_es || '').toUpperCase();
          const notesUpper = (item.description || item.description_en || '').toUpperCase();
          const combined = `${rawCat} ${trade} ${nameUpper} ${notesUpper}`;
          const cleanedCombined = combined.replace(/\bSOLARTE\b/g, '');

          let standardCat = 'contractor_housing';
          let sType: LocalServiceProvider['serviceType'] = 'service';

          // 1. Direct explicit category or trade checks
          if (/\b(BOAT|LANCHA|CAPITAN|CAPTAIN|WATER TAXI|WATER_TAXI|MARITIMO|ACUATICO|MARINA)\b/i.test(trade) || /\b(BOAT|LANCHA|CAPITAN|CAPTAIN|WATER TAXI|WATER_TAXI|MARITIMO|ACUATICO|MARINA)\b/i.test(rawCat)) {
            standardCat = 'water_taxi';
          } else if (/\b(ELECTRIC|SOLAR|A\/C|AIR COND|REFRIGER|VOLTAGE|SURGE)\b/i.test(trade) || /\b(ELECTRIC|SOLAR|A\/C|AIR COND|REFRIGER|VOLTAGE|SURGE)\b/i.test(rawCat)) {
            standardCat = 'ac_repair';
          } else if (/\b(CONTRACTOR|HANDYMAN|CARPINT|CONSTRUCTION|MASONRY|BUILDER)\b/i.test(trade) || /\b(CONTRACTOR|HANDYMAN|CARPINT|CONSTRUCTION|MASONRY|BUILDER)\b/i.test(rawCat)) {
            standardCat = 'contractor_housing';
          } else if (/\b(GARDEN|PLANT|JARDIN|VIVERO|SOIL|LANDSCAP)\b/i.test(trade) || /\b(GARDEN|PLANT|JARDIN|VIVERO|SOIL|LANDSCAP)\b/i.test(rawCat)) {
            standardCat = 'gardening_plants';
          } else if (/\b(TAXI|SHUTTLE|TRANSPORT|RENTAL|CAR RENTAL)\b/i.test(trade) || /\b(TAXI|SHUTTLE|TRANSPORT|RENTAL|CAR RENTAL)\b/i.test(rawCat)) {
            standardCat = 'land_taxi';
            sType = 'taxi_land';
          } else if (/\b(PLUMB|AGUA|WATER TANK|CISTERN)\b/i.test(trade) || /\b(PLUMB|AGUA|WATER TANK|CISTERN)\b/i.test(rawCat)) {
            standardCat = 'plumbing_water';
          } else if (/\b(STARLINK|INTERNET|WIFI)\b/i.test(trade) || /\b(STARLINK|INTERNET|WIFI)\b/i.test(rawCat)) {
            standardCat = 'starlink_internet';
          } else if (/\b(MEDIC|DOCTOR|PHARM|CLINIC|FARMACIA)\b/i.test(trade) || /\b(MEDIC|DOCTOR|PHARM|CLINIC|FARMACIA)\b/i.test(rawCat)) {
            standardCat = 'medical_pharmacy';
            sType = item.id?.includes('pharm') ? 'pharmacy_prescriptions' : item.id?.includes('hosp') || item.id?.includes('clinic') || item.id?.includes('dr') ? 'doctor_clinic' : 'service';
          } else if (/\b(VET|ANIMAL|PET|VETERINAR)\b/i.test(trade) || /\b(VET|ANIMAL|PET|VETERINAR)\b/i.test(rawCat)) {
            standardCat = 'vet_animal';
            sType = 'vet_pet';
          } else if (/\b(BANK|ATM|BANCO|WESTERN UNION)\b/i.test(trade) || /\b(BANK|ATM|BANCO|WESTERN UNION)\b/i.test(rawCat)) {
            standardCat = 'banking_money';
            sType = item.id?.includes('atm') ? 'atm' : item.id?.includes('banconal') ? 'bank' : item.id?.includes('wu') || item.name?.toLowerCase().includes('western union') ? 'western_union' : 'service';
          } else if (/\b(SUPERMARKET|GROCERY|RESTAURANT|DINING|SUPERMERCADO)\b/i.test(trade) || /\b(SUPERMARKET|GROCERY|RESTAURANT|DINING|SUPERMERCADO)\b/i.test(rawCat)) {
            standardCat = 'dining_provisions';
            sType = 'dining_groceries';
          } else {
            // 2. Semantic fallback inspection of business name and description (ignoring 'SOLARTE')
            if (/\b(BANK|ATM|BANCO|WESTERN UNION|REMESAS|GIROS)\b/i.test(cleanedCombined)) {
              standardCat = 'banking_money';
              sType = item.id?.includes('atm') ? 'atm' : item.id?.includes('banconal') ? 'bank' : item.id?.includes('wu') || item.name?.toLowerCase().includes('western union') ? 'western_union' : 'service';
            } else if (/\b(BOAT|LANCHA|CAPITAN|CAPTAIN|WATER TAXI|WATER_TAXI|MARITIMO|ACUATICO|MARINA|ISLAND TOUR|DOLPHIN BAY)\b/i.test(cleanedCombined)) {
              standardCat = 'water_taxi';
            } else if (/\b(CAR RENTAL|RENTAL CAR|UTV|4X4|RENTAL|TAXI|SHUTTLE|VEHICLE RENTAL)\b/i.test(cleanedCombined)) {
              standardCat = 'land_taxi';
              sType = 'taxi_land';
            } else if (/\b(SOIL|GARDEN|PLANT|JARDIN|VIVERO|MICROBIOLOGY|COMPOST|MULCH|PODA|FRUIT TREE)\b/i.test(cleanedCombined)) {
              standardCat = 'gardening_plants';
            } else if (/\b(WELD|SOLDAD|FABRICATION|CONTRACTOR|HANDYMAN|CARPINT|CONSTRUCTION|REPAIR|REMODEL|ESTRUCTUR)\b/i.test(cleanedCombined)) {
              standardCat = 'contractor_housing';
            } else if (/\b(ELECTRIC|SOLAR|A\/C|AIR COND|REFRIGER|VOLTAGE|SURGE|INVERTER)\b/i.test(cleanedCombined)) {
              standardCat = 'ac_repair';
            } else if (/\b(PLUMB|PLUMBER|AGUA|WATER TANK|CISTERN|BOMBA DE AGUA)\b/i.test(cleanedCombined)) {
              standardCat = 'plumbing_water';
            } else if (/\b(STARLINK|INTERNET|WIFI|ROUTER)\b/i.test(cleanedCombined)) {
              standardCat = 'starlink_internet';
            } else if (/\b(MEDIC|DOCTOR|PHARM|CLINIC|FARMACIA|DENTIST)\b/i.test(cleanedCombined)) {
              standardCat = 'medical_pharmacy';
            } else if (/\b(VET|ANIMAL|PET|VETERINAR)\b/i.test(cleanedCombined)) {
              standardCat = 'vet_animal';
            }
          }

          return {
            id: item.id || `live_${Math.random()}`,
            region: 'bocas_del_toro',
            category: standardCat,
            serviceType: sType,
            name: item.name || item.name_es || 'Verified Provider',
            whatsappNumber: item.phone_raw || item.phone,
            phoneNumber: item.phone_raw || item.phone,
            address: item.location || 'Bocas del Toro',
            hours: item.hours || 'Daily Availability',
            rating: item.rating || 4.9,
            verified: item.verified !== false,
            notes: item.description_en || item.description || '',
            googleMapsQuery: item.map_url || undefined,
          };
        });

        // Merge live providers with base list so ATMs and built-in directory items are preserved
        const mergedMap = new Map<string, LocalServiceProvider>();
        
        baseList.forEach((p) => {
          mergedMap.set(p.id, p);
        });

        liveMapped.forEach((liveP) => {
          const liveClean = (liveP.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const existing = Array.from(mergedMap.values()).find((p) => {
            const pClean = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const matchesId = p.id === liveP.id || 
              (p.id.includes('banconal') && liveP.id.includes('banconal')) ||
              (p.id.includes('police_station') && liveP.id.includes('police-station')) ||
              (p.id.includes('supermarket') && (liveP.id.includes('super-gourmet') || liveP.id.includes('supermercado'))) ||
              (p.id.includes('changuinola') && liveP.id.includes('changuinola')) ||
              (p.id.includes('guabito') && liveP.id.includes('guabito')) ||
              (p.id.includes('punto_pago') && liveP.id.includes('punto-pago')) ||
              (p.id.includes('naturgy') && liveP.id.includes('naturgy'));

            const matchesPhone = p.whatsappNumber && liveP.whatsappNumber && 
              normalizePanamaPhoneNumber(p.whatsappNumber) === normalizePanamaPhoneNumber(liveP.whatsappNumber);

            const matchesName = pClean === liveClean ||
              (pClean.length > 8 && liveClean.length > 8 && (pClean.includes(liveClean) || liveClean.includes(pClean)));

            return matchesId || matchesPhone || matchesName;
          });

          if (existing) {
            mergedMap.set(existing.id, {
              ...existing,
              ...liveP,
              name: existing.name || liveP.name, // Keep canonical English/Spanish display title
              notes: existing.notes || liveP.notes,
              address: existing.address || liveP.address,
              hours: existing.hours || liveP.hours,
              serviceType: existing.serviceType || liveP.serviceType,
              category: existing.category || liveP.category,
              googleMapsQuery: existing.googleMapsQuery || liveP.googleMapsQuery,
              phoneNumber: existing.phoneNumber || liveP.phoneNumber,
              whatsappNumber: existing.whatsappNumber || liveP.whatsappNumber,
            });
          } else {
            mergedMap.set(liveP.id, liveP);
          }
        });

        baseList = Array.from(mergedMap.values());
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

  if (category) {
    return baseList.filter((p) => p.category === category || p.serviceType === category);
  }

  return baseList;
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
