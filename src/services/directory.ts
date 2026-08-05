// Local Service Directory Service (MongoDB Atlas Schema & Regional Provider Data)
// Supports multi-region scaling (Starting with Bocas del Toro, Panama)

export interface LocalServiceProvider {
  id: string;
  region: string; // e.g. 'bocas_del_toro', 'boquete', 'coronado'
  category: string; // e.g. 'ac_repair', 'boat_repair', 'plumber', 'starlink', 'medical'
  name: string;
  whatsappNumber: string;
  rating: number;
  verified: boolean;
  notes?: string;
  isSponsored?: boolean;      // Catvertising Award: B2B Local Provider Ad Placement
  adSpotlightText?: string;   // Rewarded Ad Text
}

// Initial Verified Directory for Bocas del Toro, Panama 🇵🇦
export const INITIAL_BOCAS_DIRECTORY: LocalServiceProvider[] = [
  {
    id: 'bocas_ac_1',
    region: 'bocas_del_toro',
    category: 'ac_repair',
    name: 'Carlos A/C & Refrigeración',
    whatsappNumber: '+50761234567',
    rating: 4.9,
    verified: true,
    isSponsored: true,
    adSpotlightText: 'FEATURED SPONSOR • Watch 10s Spotlight to Unlock +5 Free Translations!',
    notes: 'A/C leak repairs & gas refills in Isla Colón & Carenero.',
  },
  {
    id: 'bocas_boat_1',
    region: 'bocas_del_toro',
    category: 'boat_repair',
    name: 'Capitán Mingo - Mecánica Marina',
    whatsappNumber: '+50769876543',
    rating: 4.8,
    verified: true,
    isSponsored: true,
    adSpotlightText: 'FEATURED SPONSOR • Dockside outboard motor assistance in Bocas town.',
    notes: 'Outboard motor repairs & dockside assistance in Bocas town.',
  },
  {
    id: 'bocas_starlink_1',
    region: 'bocas_del_toro',
    category: 'starlink_internet',
    name: 'Bocas Wi-Fi & Starlink Tech',
    whatsappNumber: '+50765554321',
    rating: 5.0,
    verified: true,
    isSponsored: true,
    adSpotlightText: 'FEATURED SPONSOR • Dish installation, router cabling & line testing.',
    notes: 'Starlink dish installation, router cabling & line testing.',
  },
  {
    id: 'bocas_plumber_1',
    region: 'bocas_del_toro',
    category: 'landlord_housing',
    name: 'Técnico Fontanería y Bombas de Agua',
    whatsappNumber: '+50764443322',
    rating: 4.7,
    verified: true,
    notes: 'Water pressure pumps, tank leaks & plumbing in Bocas del Toro.',
  },
  {
    id: 'bocas_medical_1',
    region: 'bocas_del_toro',
    category: 'medical_pharmacy',
    name: 'Clínica & Farmacia Bocas Health',
    whatsappNumber: '+50763332211',
    rating: 4.9,
    verified: true,
    notes: 'Doctor consultation & urgent pharmacy needs in Isla Colón.',
  },
];

// Contextual Ad Targeting Helper
export function getMatchingProviderForCategory(categoryName?: string): LocalServiceProvider | null {
  if (!categoryName) return null;
  const lower = categoryName.toLowerCase();

  if (lower.includes('air') || lower.includes('ac') || lower.includes('conditioning') || lower.includes('cooling')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'ac_repair') || null;
  }
  if (lower.includes('boat') || lower.includes('water') || lower.includes('taxi') || lower.includes('marina')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'boat_repair') || null;
  }
  if (lower.includes('starlink') || lower.includes('wifi') || lower.includes('internet')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'starlink_internet') || null;
  }
  if (lower.includes('plumb') || lower.includes('housing') || lower.includes('landlord') || lower.includes('water')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'landlord_housing') || null;
  }
  if (lower.includes('medical') || lower.includes('doctor') || lower.includes('pharmacy')) {
    return INITIAL_BOCAS_DIRECTORY.find((p) => p.category === 'medical_pharmacy') || null;
  }

  return null;
}

export async function fetchRegionalProviders(
  region: string = 'bocas_del_toro',
  category?: string
): Promise<LocalServiceProvider[]> {
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
          filter: { region, ...(category ? { category } : {}) },
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

  return INITIAL_BOCAS_DIRECTORY.filter((p) => {
    const matchesRegion = p.region === region;
    const matchesCategory = !category || p.category === category;
    return matchesRegion && matchesCategory;
  });
}
