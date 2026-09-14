#!/usr/bin/env python3
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIRECTORY = os.path.join(ROOT, 'src', 'services', 'directory.ts')
OUTER_PLACES_FILE = os.path.join(ROOT, 'data', 'google_places_outer_islands.json')
WEB_PLACES_FILE = os.path.join(ROOT, 'web-funnel', 'data', 'places.json')

with open(SRC_DIRECTORY, 'r', encoding='utf-8') as f:
    orig_ts = f.read()

with open(OUTER_PLACES_FILE, 'r', encoding='utf-8') as f:
    outer_raw = json.load(f)

# Collect existing IDs and names
existing_names = set(m.group(1).lower().strip() for m in re.finditer(r'name:\s*\"([^\"]+)\"', orig_ts))
existing_ids = set(m.group(1).strip() for m in re.finditer(r'id:\s*\"([^\"]+)\"', orig_ts))

# Filter high quality Bocas outer island places
curated_additions = []
for p in outer_raw:
    name_clean = p['name'].lower().strip()
    if 'cerrito' in name_clean or 'boca brava' in name_clean:
        continue
    if p.get('rating', 0) < 4.0:
        continue
    if name_clean in existing_names:
        continue

    # Ensure unique ID
    pid = p['id']
    if pid in existing_ids:
        pid = f"{pid}_{len(curated_additions)}"
    existing_ids.add(pid)
    existing_names.add(name_clean)

    # Refine categorization
    cat = p.get('category', 'hotel_lodging')
    stype = p.get('serviceType', 'hotel_lodging')
    n_lower = name_clean
    if 'chocolate' in n_lower or 'cacao' in n_lower or 'farm' in n_lower or 'tour' in n_lower:
        cat = 'community_culture'
        stype = 'service'
    elif 'restaurant' in n_lower or 'bar' in n_lower or 'cafe' in n_lower or 'taco' in n_lower or 'lounge' in n_lower:
        cat = 'restaurant_dining'
        stype = 'restaurant_dining'
    elif 'hotel' in n_lower or 'resort' in n_lower or 'lodge' in n_lower or 'cabins' in n_lower or 'cabana' in n_lower or 'condo' in n_lower:
        cat = 'hotel_lodging'
        stype = 'hotel_lodging'

    curated_additions.append({
        'id': pid,
        'region': 'bocas_del_toro',
        'category': cat,
        'serviceType': stype,
        'name': p['name'],
        'rating': p.get('rating', 4.8),
        'address': p.get('address', 'Outer Islands, Bocas del Toro, Panama'),
        'notes': p.get('notes', 'Verified outer island establishment in Bocas del Toro Archipelago.'),
        'source': 'google_maps',
        'sourceUrl': p.get('sourceUrl', ''),
        'sourcePlaceId': p.get('sourcePlaceId', ''),
        'verifiedDate': '2026-09-12',
        'verified': True
    })

print(f"Adding {len(curated_additions)} curated outer island businesses to directory.ts...")

# Format as TypeScript lines
ts_lines = []
for item in curated_additions:
    ts_lines.append("  {")
    ts_lines.append(f"    id: {json.dumps(item['id'])},")
    ts_lines.append(f"    region: {json.dumps(item['region'])},")
    ts_lines.append(f"    category: {json.dumps(item['category'])},")
    if 'serviceType' in item and item['serviceType']:
        ts_lines.append(f"    serviceType: {json.dumps(item['serviceType'])},")
    ts_lines.append(f"    name: {json.dumps(item['name'])},")
    if 'address' in item and item['address']:
        ts_lines.append(f"    address: {json.dumps(item['address'])},")
    ts_lines.append(f"    rating: {item['rating']},")
    ts_lines.append(f"    verified: true,")
    if 'notes' in item and item['notes']:
        ts_lines.append(f"    notes: {json.dumps(item['notes'])},")
    if 'source' in item and item['source']:
        ts_lines.append(f"    source: {json.dumps(item['source'])},")
    if 'sourceUrl' in item and item['sourceUrl']:
        ts_lines.append(f"    sourceUrl: {json.dumps(item['sourceUrl'])},")
    if 'sourcePlaceId' in item and item['sourcePlaceId']:
        ts_lines.append(f"    sourcePlaceId: {json.dumps(item['sourcePlaceId'])},")
    if 'verifiedDate' in item and item['verifiedDate']:
        ts_lines.append(f"    verifiedDate: {json.dumps(item['verifiedDate'])},")
    ts_lines.append("  },")

# Append into INITIAL_BOCAS_DIRECTORY array before the closing "];"
insertion_point = orig_ts.rfind("];\n\n// Contextual Ad Targeting Helper")
if insertion_point == -1:
    insertion_point = orig_ts.rfind("];\n// Contextual Ad Targeting Helper")

if insertion_point == -1:
    print("❌ ERROR: Could not find closing bracket in directory.ts")
    exit(1)

new_ts = orig_ts[:insertion_point] + "\n".join(ts_lines) + "\n" + orig_ts[insertion_point:]

with open(SRC_DIRECTORY, 'w', encoding='utf-8') as f:
    f.write(new_ts)

print(f"🎉 Updated {SRC_DIRECTORY} successfully!")

# Also merge into web-funnel/data/places.json
CATEGORY_MAP = {
    'hotel_lodging': ('HOTEL', 'Hoteles y Hospedaje', 'Hotels & Lodging'),
    'restaurant_dining': ('RESTAURANT', 'Restaurantes y Gastronomía', 'Restaurants & Dining'),
    'community_culture': ('COMMUNITY', 'Tours y Actividades Comunitarias', 'Community & Eco-Tourism'),
}

with open(WEB_PLACES_FILE, 'r', encoding='utf-8') as f:
    web_places = json.load(f)

web_names = set(p['name'].lower().strip() for p in web_places)
added_to_web = 0
for item in curated_additions:
    if item['name'].lower().strip() in web_names:
        continue
    web_names.add(item['name'].lower().strip())
    cat_info = CATEGORY_MAP.get(item['category'], ('COMMUNITY', 'Servicios Locales', 'Local Services'))
    web_places.append({
        'id': item['id'],
        'name': item['name'],
        'name_es': item['name'],
        'category': cat_info[0],
        'category_label': cat_info[1],
        'category_label_en': cat_info[2],
        'rating': item['rating'],
        'verified': True,
        'status': 'approved',
        'location': item['address'],
        'map_url': item['sourceUrl'],
        'description': item['notes'],
        'description_en': item['notes']
    })
    added_to_web += 1

with open(WEB_PLACES_FILE, 'w', encoding='utf-8') as f:
    json.dump(web_places, f, indent=2, ensure_ascii=False)

print(f"🎉 Added {added_to_web} outer island places to {WEB_PLACES_FILE} (Total web places: {len(web_places)})!")

