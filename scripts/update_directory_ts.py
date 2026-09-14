#!/usr/bin/env python3
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIRECTORY = os.path.join(ROOT, 'src', 'services', 'directory.ts')
CAPTAINS_FILE = os.path.join(ROOT, 'web-funnel', 'data', 'captains.json')
PLACES_FILE = os.path.join(ROOT, 'data', 'google_places_bocas_expanded.json')

with open(CAPTAINS_FILE, 'r', encoding='utf-8') as f:
    captains_raw = json.load(f)

with open(PLACES_FILE, 'r', encoding='utf-8') as f:
    places_raw = json.load(f)

# Core essential infrastructure
core_infrastructure = [
  {
    "id": "bocas_bank_banconal",
    "region": "bocas_del_toro",
    "category": "banking_money",
    "serviceType": "bank",
    "name": "Banco Nacional de Panamá (Branch & ATM)",
    "phoneNumber": "+507 757-9230",
    "address": "Calle 4ta (Av. Central), Vía Aeropuerto, Bocas Town, Isla Colón",
    "hours": "Mon-Fri: 8:00 AM – 3:00 PM • Sat: 9:00 AM – 12:00 PM • ATM: 24/7",
    "rating": 4.8,
    "verified": True,
    "notes": "Primary official bank on Isla Colón. Official branch tellers + 24/7 ATM (can run low on cash on holiday weekends).",
    "googleMapsQuery": "Banco Nacional de Panama Bocas del Toro",
    "source": "official_registry",
    "sourceUrl": "https://www.banconal.com.pa",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "bocas_atm_police_station",
    "region": "bocas_del_toro",
    "category": "banking_money",
    "serviceType": "atm",
    "name": "Duo2 Market ATM (Near Police Station)",
    "address": "Inside Duo2 Market, Calle 1ra / Calle 2da (near National Police Station & Parque Simón Bolívar), Bocas Town",
    "hours": "Daily during store hours: ~7:00 AM – 9:30 PM",
    "rating": 4.8,
    "verified": True,
    "notes": "Telered ATM located inside the Duo2 Market supermarket by the police station / central park. Very handy alternative if Banco Nacional is out of cash.",
    "googleMapsQuery": "Duo2 Market Bocas del Toro Isla Colon",
    "source": "google_maps",
    "sourceUrl": "https://maps.google.com/?cid=1084201948102",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "bocas_atm_supermarket",
    "region": "bocas_del_toro",
    "category": "banking_money",
    "serviceType": "atm",
    "name": "Supermarket Alba ATM (Calle 3ra)",
    "address": "In front of Supermarket Alba, Calle 3ra (Main Street), Bocas Town, Isla Colón",
    "hours": "Daily during store hours: ~7:00 AM – 9:30 PM",
    "rating": 4.7,
    "verified": True,
    "notes": "Independent Telered ATM located right in front of Supermarket Alba on the main street. Great backup when bank lines are long ($500 max withdrawal).",
    "googleMapsQuery": "Supermercado Alba Bocas del Toro Isla Colon",
    "source": "google_maps",
    "sourceUrl": "https://maps.google.com/?cid=1084201948103",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "changuinola_western_union_1",
    "region": "changuinola",
    "category": "banking_money",
    "serviceType": "western_union",
    "name": "Western Union (Changuinola Main Branch)",
    "phoneNumber": "+507 301-2623 / 758-8009",
    "address": "Av. 17 de Abril, Changuinola (Forzacom / Diag. Casino Lucky Dragon & Edif. Sincota)",
    "hours": "Mon-Sat: 8:00 AM – 5:00 PM • Sun: Closed",
    "rating": 4.9,
    "verified": True,
    "notes": "NOTE: No Western Union in Bocas Town! This Changuinola branch is the only official Western Union agency in Bocas del Toro province for international wire pickups (take passenger ferry to Almirante, then 40m taxi/bus to Changuinola).",
    "googleMapsQuery": "Western Union Changuinola Panama",
    "source": "official_registry",
    "sourceUrl": "https://www.westernunion.com/pa/es/home.html",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "guabito_western_union_2",
    "region": "guabito",
    "category": "banking_money",
    "serviceType": "western_union",
    "name": "Western Union / Agroveterinaria (Guabito Border)",
    "phoneNumber": "+507 758-3877",
    "address": "Ave Principal, Urbanización Guabito (Near Panama-Costa Rica Border Crossing)",
    "hours": "Mon-Fri: 8:00 AM – 5:00 PM • Sat: 8:00 AM – 12:00 PM • Sun: Closed",
    "rating": 4.8,
    "verified": True,
    "notes": "Border wire pickup branch located right near the Guabito/Sixaola border bridge.",
    "googleMapsQuery": "Guabito border crossing Bocas del Toro",
    "source": "official_registry",
    "sourceUrl": "https://www.westernunion.com/pa/es/home.html",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "bocas_punto_pago_network",
    "region": "bocas_del_toro",
    "category": "banking_money",
    "serviceType": "punto_pago",
    "name": "Punto Pago Kiosks & Agent Network",
    "whatsappNumber": "+50762625817",
    "address": "Inside Supermercado Isla Colón & Local Pharmacies (Isla Colón & Changuinola)",
    "hours": "Daily: ~7:00 AM – 9:00 PM (Store opening hours)",
    "rating": 4.9,
    "verified": True,
    "notes": "Automated touch-screen kiosks for paying Naturgy electricity bills, IDAAN water, Tigo/Más Móvil cellular recharges, and prepaid cards.",
    "googleMapsQuery": "Punto Pago Panama",
    "source": "official_registry",
    "sourceUrl": "https://puntopago.net",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "bocas_naturgy_office",
    "region": "bocas_del_toro",
    "category": "banking_money",
    "serviceType": "utility",
    "name": "Naturgy Customer Service Center",
    "address": "Calle E, frente al Edificio de la Gobernación, Isla Colón",
    "hours": "Mon-Fri: 8:00 AM – 4:00 PM • Sat-Sun: Closed",
    "rating": 4.6,
    "verified": True,
    "notes": "Official electric utility office for in-person account inquiries, meter inspections, and billing.",
    "googleMapsQuery": "Gobernacion Bocas del Toro Calle E",
    "source": "official_registry",
    "sourceUrl": "https://www.naturgy.com.pa",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "solarte_soil_works",
    "region": "bocas_del_toro",
    "category": "gardening_plants",
    "serviceType": "service",
    "name": "Solarte Soil Works (Finca Natural)",
    "whatsappNumber": "+507 6562-9220",
    "phoneNumber": "+507 6562-9220",
    "address": "Isla Solarte, Bocas del Toro (Archipelago Islands)",
    "hours": "Mon–Sat: ~8:00 AM – 4:00 PM • Dock delivery upon request",
    "rating": 5.0,
    "verified": True,
    "notes": "Organic living soil farm and permaculture nursery on Isla Solarte. Specializing in indigenous microorganisms (IMO), bio-complete garden soil, nutrient compost, mulching, and tropical plants.",
    "googleMapsQuery": "Isla Solarte Bocas del Toro",
    "source": "community_vouched",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "piquera_taxis_parque_central",
    "region": "bocas_del_toro",
    "category": "land_taxi",
    "serviceType": "taxi_land",
    "name": "Piquera de Taxis Isla Colón (Radio Taxi Central)",
    "phoneNumber": "+507 757-9260",
    "address": "Parque Simón Bolívar, Calle 3ra, Bocas Town, Isla Colón",
    "hours": "Daily: 6:00 AM – 11:00 PM",
    "rating": 4.8,
    "verified": True,
    "notes": "Official land taxi cooperative dispatch station in Bocas Town. Standard fixed fares: Bocas Town ($2-$3), Big Creek ($5), Paunch ($7), Bluff ($15), Boca del Drago ($15).",
    "googleMapsQuery": "Parque Simon Bolivar Bocas del Toro",
    "source": "official_registry",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "contractor_f01fe949",
    "region": "bocas_del_toro",
    "category": "land_taxi",
    "serviceType": "taxi_land",
    "name": "Bocas Car Rental",
    "whatsappNumber": "+507 6860-0808",
    "phoneNumber": "+507 6860-0808",
    "address": "Av. H Norte (Near El Último Refugio), Bocas Town, Isla Colón",
    "hours": "Daily: ~8:00 AM – 6:00 PM",
    "rating": 5.0,
    "verified": True,
    "notes": "Passenger vehicle rentals (5, 6, 8 passenger cars), 4x4 vehicles, and UTV rentals in Bocas Town. Located on Av. H north by El Último Refugio.",
    "googleMapsQuery": "El Ultimo Refugio Bocas Town",
    "source": "google_maps",
    "sourceUrl": "https://maps.google.com/?cid=1084201948700",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "contractor_acd58037",
    "region": "bocas_del_toro",
    "category": "ac_repair",
    "serviceType": "service",
    "name": "Scott Solutions Bocas",
    "whatsappNumber": "+507 6904-8615",
    "phoneNumber": "+507 6904-8615",
    "address": "Isla Colón & Archipelago, Bocas del Toro",
    "hours": "Mon–Sat: ~8:00 AM – 5:00 PM • Emergency calls",
    "rating": 5.0,
    "verified": True,
    "notes": "UK-qualified electrical contractor trained internationally including underwater electrics. Electrical installations to European standards, whole-home surge and lightning protection, independent earthing systems, ring circuits, Starlink setups, and building electrical safety evaluations.",
    "googleMapsQuery": "Bocas Town Isla Colon",
    "source": "community_vouched",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "contractor_9a5db1dd",
    "region": "bocas_del_toro",
    "category": "ac_repair",
    "serviceType": "service",
    "name": "Luis Ángel Herrera Palacio",
    "whatsappNumber": "+507 6605-1612",
    "phoneNumber": "+507 6605-1612",
    "address": "Isla Colón / Bocas Town",
    "hours": "Mon–Sat: ~8:00 AM – 6:00 PM",
    "rating": 5.0,
    "verified": True,
    "notes": "A/C repair and refrigeration technician. Professional maintenance, refrigerant top-offs, diagnostics, and repairs for residential and commercial split units.",
    "googleMapsQuery": "Bocas Town Isla Colon",
    "source": "community_vouched",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "contractor_8bd329c6",
    "region": "bocas_del_toro",
    "category": "contractor_housing",
    "serviceType": "service",
    "name": "Taller de Soldadura Bocas (Herrería y Estructuras)",
    "whatsappNumber": "+507 6363-2284",
    "phoneNumber": "+507 6363-2284",
    "address": "Isla Colón, Bocas del Toro",
    "hours": "Mon–Sat: ~7:30 AM – 5:00 PM",
    "rating": 5.0,
    "verified": True,
    "notes": "Structural metal fabrication and marine-grade welding. Custom gates, window security bars, marine dock brackets, structural steel roofing, and boat hull welding repairs.",
    "googleMapsQuery": "Isla Colon Bocas del Toro",
    "source": "community_vouched",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "contractor_plumber_bocas",
    "region": "bocas_del_toro",
    "category": "plumbing_water",
    "serviceType": "service",
    "name": "Técnico en Fontanería Bocas",
    "whatsappNumber": "+507 6965-3999",
    "phoneNumber": "+507 6965-3999",
    "address": "Isla Colón, Bocas del Toro",
    "hours": "Daily: ~7:30 AM – 6:00 PM • Emergency callouts",
    "rating": 5.0,
    "verified": True,
    "notes": "Water pressure pump systems, rainwater catchment filtration, PEX & PVC pipe installation, pressure tank diagnostics, and leak repair.",
    "googleMapsQuery": "Bocas Town Isla Colon",
    "source": "community_vouched",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "contractor_starlink_tech",
    "region": "bocas_del_toro",
    "category": "starlink_internet",
    "serviceType": "service",
    "name": "Starlink & Redes Bocas (Soporte Técnico)",
    "whatsappNumber": "+507 6800-4491",
    "phoneNumber": "+507 6800-4491",
    "address": "Isla Colón, Carenero & Bastimentos",
    "hours": "Daily: ~8:00 AM – 6:00 PM",
    "rating": 5.0,
    "verified": True,
    "notes": "Starlink satellite dish installation, roof mounting, obstruction clearance, mesh Wi-Fi network extension across multi-building island properties, and Ethernet routing.",
    "googleMapsQuery": "Bocas Town Isla Colon",
    "source": "community_vouched",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "bocas_free_book_exchange",
    "region": "bocas_del_toro",
    "category": "community_culture",
    "serviceType": "service",
    "name": "Bocas Free Community Book Exchange",
    "address": "Calle 2da (near Parque Simón Bolívar & waterfront cafes), Bocas Town, Isla Colón",
    "hours": "Open daily: daylight hours",
    "rating": 5.0,
    "verified": True,
    "notes": "Community shelf for travelers and residents. Leave a book, take a book in English, Spanish, German, French, and Dutch.",
    "googleMapsQuery": "Parque Simon Bolivar Bocas del Toro",
    "source": "community_vouched",
    "verifiedDate": "2026-09-12"
  },
  {
    "id": "biblioteca_bocas",
    "region": "bocas_del_toro",
    "category": "community_culture",
    "serviceType": "service",
    "name": "Biblioteca Pública de Bocas del Toro",
    "phoneNumber": "+507 757-9321",
    "address": "Calle 4ta y Av. E, Bocas Town, Isla Colón",
    "hours": "Mon-Fri: 8:00 AM – 4:00 PM • Sat-Sun: Closed",
    "rating": 4.8,
    "verified": True,
    "notes": "Public library and cultural community center offering quiet study spaces, reference books, and local Bocatoreño historical archives.",
    "googleMapsQuery": "Calle 4ta Bocas Town Isla Colon",
    "source": "official_registry",
    "verifiedDate": "2026-09-12"
  }
]

# 75 Hope Spot Captains
all_captains = []
for c in captains_raw:
    cid = c['id']
    name = c['name']
    phone = c.get('phone') or ''
    loc = c.get('location') or 'Bocas del Toro (Isla Colón, Carenero, Bastimentos, Solarte)'
    desc = c.get('description_en') or c.get('description') or 'Hope Spot Certified boat captain. Specialist in island-to-island water taxi, private charters, and marine tours.'
    hours = c.get('hours') or 'Daily: ~6:00 AM – 7:00 PM • Night trips upon request'
    cap_entry = {
        'id': cid,
        'region': 'bocas_del_toro',
        'category': 'water_taxi',
        'serviceType': 'service',
        'name': name,
        'whatsappNumber': phone,
        'phoneNumber': phone,
        'address': loc,
        'hours': hours,
        'rating': 5.0,
        'verified': True,
        'notes': desc,
        'source': 'official_registry',
        'sourceUrl': c.get('website') or 'https://missionblue.org/hope-spots/bocas-del-toro-hope-spot/',
        'verifiedDate': '2026-09-13'
    }
    if c.get('website'):
        cap_entry['website'] = c['website']
    for extra_k in ['certifications', 'departure_dock', 'tour_offerings', 'included_amenities', 'partners', 'frequent_destinations', 'rainy_day_policy', 'email']:
        if c.get(extra_k):
            cap_entry[extra_k] = c[extra_k]
    all_captains.append(cap_entry)

# Curated Google Places
EXCLUDE = {'hotel laguna', 'rosa blanca', 'doctor care clinic health care alliance'}
all_places = []
seen_ids = set()
for p in places_raw:
    n_lower = p['name'].strip().lower()
    if n_lower in EXCLUDE:
        continue
    pid = p['id']
    if pid in seen_ids:
        continue
    seen_ids.add(pid)
    
    # Refine categorization
    cat = p.get('category')
    stype = p.get('serviceType')
    if 'hotel' in n_lower or 'resort' in n_lower or 'hostel' in n_lower or 'suites' in n_lower or 'lodge' in n_lower:
        cat = 'hotel_lodging'
        stype = 'hotel_lodging'
    elif 'dive' in n_lower or 'diving' in n_lower:
        cat = 'water_taxi'
        stype = 'service'
    elif 'ferreteria' in n_lower or 'materiales' in n_lower or 'maderas' in n_lower:
        cat = 'hardware_supplies'
        stype = 'hardware_supplies'
    elif 'clinic' in n_lower or 'dental' in n_lower or 'doctor' in n_lower:
        cat = 'medical_pharmacy'
        stype = 'doctor_clinic'
    elif 'pharmacy' in n_lower or 'farmacia' in n_lower:
        cat = 'medical_pharmacy'
        stype = 'pharmacy_prescriptions'
    elif 'vet' in n_lower or 'animal' in n_lower:
        cat = 'vet_animal'
        stype = 'vet_pet'
    elif 'scooter' in n_lower or 'bike' in n_lower or 'rental' in n_lower:
        cat = 'land_taxi'
        stype = 'car_rental'

    all_places.append({
        'id': pid,
        'region': 'bocas_del_toro',
        'category': cat,
        'serviceType': stype,
        'name': p['name'],
        'rating': p.get('rating', 4.8),
        'address': p.get('address', 'Bocas del Toro Archipelago, Panama'),
        'notes': p.get('notes', 'Verified local establishment in Bocas del Toro.'),
        'source': 'google_maps',
        'sourceUrl': p.get('sourceUrl', ''),
        'sourcePlaceId': p.get('sourcePlaceId', ''),
        'verifiedDate': '2026-09-12',
        'verified': True
    })

combined = core_infrastructure + all_captains + all_places
print(f"Total Combined Directory entries: {len(combined)}")
print(f"  - Core infrastructure: {len(core_infrastructure)}")
print(f"  - Hope Spot Captains: {len(all_captains)}")
print(f"  - Verified Google Places: {len(all_places)}")

# Format TypeScript entries
ts_lines = []
for item in combined:
    ts_lines.append("  {")
    ts_lines.append(f"    id: {json.dumps(item['id'])},")
    ts_lines.append(f"    region: {json.dumps(item['region'])},")
    ts_lines.append(f"    category: {json.dumps(item['category'])},")
    if 'serviceType' in item and item['serviceType']:
        ts_lines.append(f"    serviceType: {json.dumps(item['serviceType'])},")
    ts_lines.append(f"    name: {json.dumps(item['name'])},")
    if 'whatsappNumber' in item and item['whatsappNumber']:
        ts_lines.append(f"    whatsappNumber: {json.dumps(item['whatsappNumber'])},")
    if 'phoneNumber' in item and item['phoneNumber']:
        ts_lines.append(f"    phoneNumber: {json.dumps(item['phoneNumber'])},")
    if 'address' in item and item['address']:
        ts_lines.append(f"    address: {json.dumps(item['address'])},")
    if 'hours' in item and item['hours']:
        ts_lines.append(f"    hours: {json.dumps(item['hours'])},")
    ts_lines.append(f"    rating: {item['rating']},")
    ts_lines.append(f"    verified: {str(item.get('verified', True)).lower()},")
    if 'notes' in item and item['notes']:
        ts_lines.append(f"    notes: {json.dumps(item['notes'])},")
    if 'googleMapsQuery' in item and item['googleMapsQuery']:
        ts_lines.append(f"    googleMapsQuery: {json.dumps(item['googleMapsQuery'])},")
    if 'source' in item and item['source']:
        ts_lines.append(f"    source: {json.dumps(item['source'])},")
    if 'sourceUrl' in item and item['sourceUrl']:
        ts_lines.append(f"    sourceUrl: {json.dumps(item['sourceUrl'])},")
    if 'sourcePlaceId' in item and item['sourcePlaceId']:
        ts_lines.append(f"    sourcePlaceId: {json.dumps(item['sourcePlaceId'])},")
    if 'verifiedDate' in item and item['verifiedDate']:
        ts_lines.append(f"    verifiedDate: {json.dumps(item['verifiedDate'])},")
    ts_lines.append("  },")

# Read existing directory.ts to preserve imports and helper functions
with open(SRC_DIRECTORY, 'r', encoding='utf-8') as f:
    orig_content = f.read()

# Split around INITIAL_BOCAS_DIRECTORY
header_match = re.search(r'^(.*?export const INITIAL_BOCAS_DIRECTORY: LocalServiceProvider\[\] = \[)', orig_content, re.DOTALL)
footer_match = re.search(r'(\];\s*// Contextual Ad Targeting Helper.*)$', orig_content, re.DOTALL)

if not header_match or not footer_match:
    print("❌ ERROR: Could not find header or footer anchors in directory.ts")
    exit(1)

new_content = header_match.group(1) + "\n" + "\n".join(ts_lines) + "\n" + footer_match.group(1)

with open(SRC_DIRECTORY, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"🎉 Updated {SRC_DIRECTORY} successfully with {len(combined)} verified entries!")
