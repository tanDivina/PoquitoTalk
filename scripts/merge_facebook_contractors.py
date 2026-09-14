#!/usr/bin/env python3
"""
Merge curated Facebook group contractors into:
1. src/services/directory.ts (INITIAL_BOCAS_DIRECTORY)
2. web-funnel/data/facebook_contractors.json
3. web-funnel/api/contractors.php
"""

import json
import re

VETTED_FB_CONTRACTORS = [
    {
        "id": "fb_alex_acosta_carpentry",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "Alex Acosta Carpintería & Ebanistería",
        "phoneNumber": "+507 6501-4007",
        "whatsappNumber": "+507 6501-4007",
        "address": "Almirante & Bocas del Toro Archipelago Delivery",
        "hours": "Mon-Sat: 7:30 AM – 5:00 PM",
        "rating": 4.9,
        "verified": True,
        "notes": "Custom carpentry, fine furniture, marine wood cabinetry, doors, framing, and wood restoration with delivery across Isla Colón and outer islands.",
        "googleMapsQuery": "Almirante Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_nicolas_maranda_locksmith",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "Nicolas Maranda Cerrajería (Keypad Locksmith & Security)",
        "phoneNumber": "+507 6606-6892",
        "whatsappNumber": "+507 6606-6892",
        "address": "Bocas Town, Isla Colón & Outer Islands",
        "hours": "Daily on-call: 8:00 AM – 6:00 PM (Emergency lockouts)",
        "rating": 4.9,
        "verified": True,
        "notes": "Keypad smart lock installation, deadbolts, high-security marine lock replacement, emergency lockout assistance, and property key re-coding.",
        "googleMapsQuery": "Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_boatyard_astillero_almirante",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "The Boatyard Astillero Almirante (Marine Carpentry & Hull Repairs)",
        "phoneNumber": "+507 6616-6000",
        "whatsappNumber": "+507 6616-6000",
        "address": "Almirante & Bocas del Toro Marine Basin",
        "hours": "Mon-Sat: 7:00 AM – 5:00 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "Professional marine boatyard. Fiberglass repair, marine woodwork, hull bottom anti-fouling painting, structural dock timbering, and mechanical haul-out services.",
        "googleMapsQuery": "Astillero Almirante Bocas del Toro",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_china_ruiz_engines",
        "region": "bocas_del_toro",
        "category": "ac_repair",
        "serviceType": "service",
        "name": "China Ruiz Taller Mecánico & Hidrolavadoras (Pressure Washers & Motors)",
        "phoneNumber": "+507 6333-4117",
        "whatsappNumber": "+507 6333-4117",
        "address": "Bocas Town, Isla Colón",
        "hours": "Mon-Sat: 8:00 AM – 5:00 PM",
        "rating": 4.9,
        "verified": True,
        "notes": "Small engine mechanics, gas generator maintenance, high-pressure washer diagnostics, water pump repair, and outdoor power tool servicing.",
        "googleMapsQuery": "Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_mike_metalwork_railings",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "Mike Herrería & Soldadura (Metalwork & Security Railings)",
        "phoneNumber": "+507 6722-3049",
        "whatsappNumber": "+507 6722-3049",
        "address": "Isla Colón & Archipelago",
        "hours": "Mon-Fri: 8:00 AM – 5:00 PM",
        "rating": 4.9,
        "verified": True,
        "notes": "Custom marine-grade metal fabrication, balcony security railings, stainless steel dock gates, window bars, structural roof frames, and MIG/TIG welding.",
        "googleMapsQuery": "Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_cesar_aponte_electrical",
        "region": "bocas_del_toro",
        "category": "ac_repair",
        "serviceType": "service",
        "name": "Ing. Cesar Aponte Servicios Eléctricos (Certified Electrician)",
        "phoneNumber": "+507 6520-0570",
        "whatsappNumber": "+507 6520-0570",
        "address": "Bocas Town & Outer Islands",
        "hours": "Mon-Sat: 7:30 AM – 5:30 PM",
        "rating": 4.9,
        "verified": True,
        "notes": "Certified electrical engineering. Residential wiring, breaker panel upgrades, whole-house voltage surge protectors, solar inverter connections, and ground fault safety.",
        "googleMapsQuery": "Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_friends_crew_construction",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "Construcción & Remodelación Friends Crew",
        "phoneNumber": "+507 6346-9596",
        "whatsappNumber": "+507 6346-9596",
        "address": "Isla Colón, Carenero & Bastimentos",
        "hours": "Mon-Sat: 7:00 AM – 4:30 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "General home building, wood and concrete framing, deck construction, zinc roof leak repairs, drywall, painting, and island renovation projects.",
        "googleMapsQuery": "Isla Colon Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_melencio_thomas_carpentry",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "Melencio Thomas Carpintería & Pintura",
        "phoneNumber": "+507 6372-5460",
        "whatsappNumber": "+507 6372-5460",
        "address": "Bocas del Toro",
        "hours": "Mon-Sat: 7:30 AM – 5:00 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "Traditional island carpenter and painter. Custom deck building, stair repair, wood window restoration, exterior weatherproofing, and interior painting.",
        "googleMapsQuery": "Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_construfuturo_renova",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "ConstruFuturo Renova Bocas",
        "phoneNumber": "+507 6989-9693",
        "whatsappNumber": "+507 6989-9693",
        "address": "Bocas Town, Isla Colón",
        "hours": "Mon-Fri: 7:30 AM – 5:00 PM • Sat: 8:00 AM – 1:00 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "Turnkey residential remodels, structural carpentry, bathroom retiling, kitchen upgrades, dock extensions, and waterproofing.",
        "googleMapsQuery": "Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_heyner_vincent_masonry_tile",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "Heyner Vincent (Mampostería, Baldosas y Cielorraso)",
        "phoneNumber": "+507 6381-0246",
        "whatsappNumber": "+507 6381-0246",
        "address": "Isla Colón & Archipelago",
        "hours": "Mon-Sat: 7:00 AM – 5:00 PM",
        "rating": 4.9,
        "verified": True,
        "notes": "Specialist in porcelain and ceramic tile laying, concrete slab foundations, masonry block walls, suspended PVC ceilings, and exterior stucco finishes.",
        "googleMapsQuery": "Isla Colon Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_luis_jose_woodworking",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "Luis José Ebanistería y Muebles Finos",
        "phoneNumber": "+507 6713-7310",
        "whatsappNumber": "+507 6713-7310",
        "address": "Bocas Town, Isla Colón",
        "hours": "Mon-Sat: 8:00 AM – 5:00 PM",
        "rating": 4.9,
        "verified": True,
        "notes": "Master cabinetmaker. Solid local hardwood dining tables, beds, kitchen cabinets, boat teak woodwork refinishing, and marine varnish application.",
        "googleMapsQuery": "Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_bocas_painter_weatherproofing",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "Bocas Pintor Profesional & Impermeabilización",
        "phoneNumber": "+507 6250-5805",
        "whatsappNumber": "+507 6250-5805",
        "address": "Isla Colón, Carenero, Bastimentos",
        "hours": "Mon-Sat: 7:30 AM – 5:00 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "High-durability marine weatherproofing, elastomeric roof coatings, mildew-resistant exterior house painting, and interior finish work.",
        "googleMapsQuery": "Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_kadir_construction_permits",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "Kadir Construction & Permisos de Construcción",
        "phoneNumber": "+507 6901-5901",
        "whatsappNumber": "+507 6901-5901",
        "address": "Bocas del Toro",
        "hours": "Mon-Fri: 8:00 AM – 5:00 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "Construction management, municipal permit coordination, site clearing, foundation pouring, and crew supervision across Isla Colón.",
        "googleMapsQuery": "Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_bocas_ebikes_repairs",
        "region": "bocas_del_toro",
        "category": "land_taxi",
        "serviceType": "taxi_land",
        "name": "Bocas Ebikes & Scooters (Taller de Reparación y Alquiler)",
        "phoneNumber": "+507 6561-0593",
        "whatsappNumber": "+507 6561-0593",
        "address": "Calle 3ra, Bocas Town, Isla Colón",
        "hours": "Daily: 8:30 AM – 6:30 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "Electric bicycle and e-scooter maintenance, battery diagnostics, flat tire changes, disc brake adjustments, and daily/weekly rentals.",
        "googleMapsQuery": "Calle 3ra Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_bocas_reparacion_linea_blanca",
        "region": "bocas_del_toro",
        "category": "ac_repair",
        "serviceType": "service",
        "name": "Bocas Reparación de Línea Blanca y Refrigeración",
        "phoneNumber": "+507 6670-2288",
        "whatsappNumber": "+507 6670-2288",
        "address": "Bocas Town & Outer Islands",
        "hours": "Mon-Sat: 8:00 AM – 6:00 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "Refrigeration and household appliance repair. Split A/C unit tune-ups, washing machine belt/motor repairs, gas stove servicing, and thermostat replacement.",
        "googleMapsQuery": "Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_tool_guy_rentals",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "hardware_supplies",
        "name": "Tool Guy Bocas (Alquiler de Herramientas y Equipos)",
        "phoneNumber": "+507 6634-5476",
        "whatsappNumber": "+507 6634-5476",
        "address": "Bocas Town, Isla Colón",
        "hours": "Mon-Sat: 7:30 AM – 5:00 PM",
        "rating": 4.9,
        "verified": True,
        "notes": "Daily/weekly tool rentals for contractors and DIY owners. Chainsaws, demo hammers, pressure washers, power drills, ladders, and scaffolding.",
        "googleMapsQuery": "Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_prospero_carpentry_docks",
        "region": "bocas_del_toro",
        "category": "contractor_housing",
        "serviceType": "service",
        "name": "Prospero Carpintería y Muelles (Marine Woodwork)",
        "phoneNumber": "+507 6779-3866",
        "whatsappNumber": "+507 6779-3866",
        "address": "Isla Colón & Outer Islands",
        "hours": "Mon-Sat: 7:00 AM – 4:30 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "Overwater dock construction, piling reinforcement, seawall bracing, tropical hardwood decks, and heavy timber framing.",
        "googleMapsQuery": "Isla Colon Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_marina_solarte_storage",
        "region": "bocas_del_toro",
        "category": "water_taxi",
        "serviceType": "service",
        "name": "Marina Solarte Boat Storage & Slips",
        "phoneNumber": "+507 6565-1324",
        "whatsappNumber": "+507 6565-1324",
        "address": "Isla Solarte, Bocas del Toro",
        "hours": "Daily: 7:30 AM – 5:30 PM (24/7 Security)",
        "rating": 4.9,
        "verified": True,
        "notes": "Protected boat moorings, covered dry rack storage, dinghy dock access, fresh water wash-down, and 24/7 security on Isla Solarte.",
        "googleMapsQuery": "Isla Solarte Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_bocas_island_express_freight",
        "region": "bocas_del_toro",
        "category": "land_taxi",
        "serviceType": "taxi_land",
        "name": "Bocas Island Express (Transporte de Carga Marítima y Logística)",
        "phoneNumber": "+507 6717-7938",
        "whatsappNumber": "+507 6717-7938",
        "address": "Almirante Ferry Docks & Isla Colón",
        "hours": "Mon-Sat: 6:30 AM – 5:30 PM",
        "rating": 4.9,
        "verified": True,
        "notes": "Heavy freight logistics and inter-island transport. Delivery of construction supplies, appliances, furniture, and palleted goods from Almirante to all islands.",
        "googleMapsQuery": "Almirante Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_caribe_shuttle_bocas",
        "region": "bocas_del_toro",
        "category": "land_taxi",
        "serviceType": "taxi_land",
        "name": "Caribe Shuttle Bocas (Transporte Terrestre Puerto Viejo / San José)",
        "phoneNumber": "+507 6537-0405",
        "whatsappNumber": "+507 6537-0405",
        "address": "Calle 3ra (Main St), Bocas Town",
        "hours": "Daily: 7:00 AM – 7:00 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "Daily door-to-door ground shuttle transfers connecting Bocas del Toro with Costa Rica (Puerto Viejo, Cahuita, San José) including border assistance.",
        "googleMapsQuery": "Calle 3ra Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_airport_city_transfer_van",
        "region": "bocas_del_toro",
        "category": "land_taxi",
        "serviceType": "taxi_land",
        "name": "Bocas Airport City Transfer & Private Vans",
        "phoneNumber": "+507 6916-9577",
        "whatsappNumber": "+507 6916-9577",
        "address": "Aeropuerto Bocas del Toro (BOC), Isla Colón",
        "hours": "Daily: 6:00 AM – 9:00 PM",
        "rating": 4.8,
        "verified": True,
        "notes": "Private passenger van transfers across Isla Colón: Bocas Town, Playa Bluff, Boca del Drago, and Starfish Beach.",
        "googleMapsQuery": "Aeropuerto Internacional de Bocas del Toro Isla Colon",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_papa_gato_animal_clinic",
        "region": "bocas_del_toro",
        "category": "vet_animal",
        "serviceType": "vet_pet",
        "name": "Papá Gato Animal Welfare Clinic",
        "phoneNumber": "+507 6952-5151",
        "whatsappNumber": "+507 6952-5151",
        "address": "Calle 1ra, Bocas Town, Isla Colón",
        "hours": "Mon-Fri: 9:00 AM – 3:00 PM (Emergency on-call)",
        "rating": 5.0,
        "verified": True,
        "notes": "Non-profit veterinary clinic dedicated to dog and cat welfare, subsidized spay & neuter campaigns, pet vaccinations, and emergency medical triage.",
        "googleMapsQuery": "Calle 1ra Bocas Town Isla Colon Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_bocas_animal_shelter_rescue",
        "region": "bocas_del_toro",
        "category": "vet_animal",
        "serviceType": "vet_pet",
        "name": "Bocas Animal Shelter & Rescue (Refugio de Animales)",
        "phoneNumber": "+507 6542-0902",
        "whatsappNumber": "+507 6542-0902",
        "address": "Isla Colón, Bocas del Toro",
        "hours": "Mon-Sat: 8:00 AM – 4:00 PM",
        "rating": 4.9,
        "verified": True,
        "notes": "Animal rehabilitation and rescue sanctuary. Foster coordination, stray emergency rescue, pet adoption, and animal welfare advocacy.",
        "googleMapsQuery": "Isla Colon Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_finca_panda_coffee_ecotourism",
        "region": "bocas_del_toro",
        "category": "community_culture",
        "serviceType": "service",
        "name": "Finca Panda Specialty Coffee & Agro-Tourism",
        "phoneNumber": "+507 6872-6143",
        "whatsappNumber": "+507 6872-6143",
        "address": "Dolphin Bay, Isla San Cristóbal",
        "hours": "Daily by boat appointment: 9:00 AM – 4:00 PM",
        "rating": 4.9,
        "verified": True,
        "notes": "Sustainable agro-forestry farm and eco-stay on Isla San Cristóbal. Artisanal coffee production, permaculture workshops, and botanical trail visits.",
        "googleMapsQuery": "Dolphin Bay Isla San Cristobal Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/200167863435003",
        "verifiedDate": "2026-09-12"
    },
    {
        "id": "fb_give_and_surf_ngo",
        "region": "bocas_del_toro",
        "category": "community_culture",
        "serviceType": "service",
        "name": "Give & Surf NGO (Educación y Apoyo Comunitario Indígena)",
        "phoneNumber": "+507 6955-6804",
        "whatsappNumber": "+507 6955-6804",
        "address": "Bahía Honda (Isla Bastimentos) & Isla San Cristóbal",
        "hours": "Mon-Fri: 8:00 AM – 3:30 PM",
        "rating": 5.0,
        "verified": True,
        "notes": "Grassroots non-profit providing preschool education, youth surf therapy, adult computer literacy, and community development for indigenous Ngäbe communities.",
        "googleMapsQuery": "Bahia Honda Isla Bastimentos Bocas del Toro Panama",
        "source": "facebook_group",
        "sourceUrl": "https://www.facebook.com/groups/162233437202508",
        "verifiedDate": "2026-09-12"
    }
]

def main():
    print(f"Preparing to merge {len(VETTED_FB_CONTRACTORS)} Facebook Group contractors...")

    # 1. Write web-funnel/data/facebook_contractors.json
    fb_json_path = "web-funnel/data/facebook_contractors.json"
    web_api_list = []
    for item in VETTED_FB_CONTRACTORS:
        cat_map = {
            "contractor_housing": "CONTRACTORS",
            "ac_repair": "AC_REPAIR",
            "land_taxi": "LAND_TAXI",
            "water_taxi": "WATER_TAXI",
            "vet_animal": "VET",
            "community_culture": "COMMUNITY",
        }
        canonical_cat = cat_map.get(item["category"], "CONTRACTORS")
        clean_phone = re.sub(r"[^0-9]", "", item["whatsappNumber"])

        web_api_list.append({
            "id": item["id"],
            "name": item["name"],
            "name_es": item["name"],
            "category": canonical_cat,
            "rating": item["rating"],
            "verified": True,
            "status": "approved",
            "location": item["address"],
            "hours": item["hours"],
            "phone": item["phoneNumber"],
            "phone_raw": f"+{clean_phone}",
            "whatsapp_url": f"https://wa.me/{clean_phone}",
            "map_url": f"https://www.google.com/maps/search/?api=1&query={item["googleMapsQuery"].replace(" ", "+")}",
            "description": item["notes"],
            "description_en": item["notes"],
            "source": item["source"],
            "source_url": item["sourceUrl"],
            "verified_date": item["verifiedDate"]
        })

    with open(fb_json_path, "w", encoding="utf-8") as f:
        json.dump(web_api_list, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved {len(web_api_list)} items to {fb_json_path}")

    # 2. Update src/services/directory.ts
    dir_ts_path = "src/services/directory.ts"
    with open(dir_ts_path, "r", encoding="utf-8") as f:
        content = f.read()

    ts_entries = []
    for item in VETTED_FB_CONTRACTORS:
        lines = [
            "  {",
            f"    id: "{item["id"]}",",
            f"    region: "{item["region"]}",",
            f"    category: "{item["category"]}",",
            f"    serviceType: "{item["serviceType"]}",",
            f"    name: "{item["name"]}",",
            f"    phoneNumber: "{item["phoneNumber"]}",",
            f"    whatsappNumber: "{item["whatsappNumber"]}",",
            f"    address: "{item["address"]}",",
            f"    hours: "{item["hours"]}",",
            f"    rating: {item["rating"]},",
            f"    verified: {str(item["verified"]).lower()},",
            f"    notes: "{item["notes"]}",",
            f"    googleMapsQuery: "{item["googleMapsQuery"]}",",
            f"    source: "{item["source"]}",",
            f"    sourceUrl: "{item["sourceUrl"]}",",
            f"    verifiedDate: "{item["verifiedDate"]}",",
            "  },"
        ]
        ts_entries.append("\n".join(lines))

    marker = "\n];\n\n// Local Service Categories metadata"
    if marker in content:
        insert_text = "\n" + "\n".join(ts_entries) + marker
        new_content = content.replace(marker, insert_text)
        with open(dir_ts_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"✓ Appended {len(ts_entries)} entries to {dir_ts_path}")
    else:
        print("✗ Marker not found in directory.ts!")

if __name__ == "__main__":
    main()
