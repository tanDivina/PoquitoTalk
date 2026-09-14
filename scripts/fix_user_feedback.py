import json
import re
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIRECTORY = os.path.join(ROOT, 'src', 'services', 'directory.ts')
WEB_PLACES = os.path.join(ROOT, 'web-funnel', 'data', 'places.json')

with open(SRC_DIRECTORY, 'r', encoding='utf-8') as f:
    ts_code = f.read()

# 1. Fix Dolphin Blue Paradise address & notes
# 2. Remove redundant 'outer_dolphin_ecolodge_where_the_car'
# 3. Correct The Blue Coconut to Isla Solarte with a helpful verification note

# Clean up outer_dolphin_ecolodge_where_the_car block
ts_code = re.sub(
    r'\s*\{\s*id:\s*"outer_dolphin_ecolodge_where_the_car",[\s\S]*?\},\n',
    '\n',
    ts_code
)

# Fix Dolphin Blue Paradise
ts_code = re.sub(
    r'(\{\s*id:\s*"outer_dolphin_blue_paradise",[\s\S]*?address:\s*)"[^"]+"',
    r'\1"Isla San Cristóbal (Dolphin Bay), Bocas del Toro Archipelago, Panama"',
    ts_code
)
ts_code = re.sub(
    r'(\{\s*id:\s*"outer_dolphin_blue_paradise",[\s\S]*?notes:\s*)"[^"]+"',
    r'\1"Premier eco-resort and boutique overwater cabanas in Dolphin Bay (Bahía de los Delfines), Isla San Cristóbal."',
    ts_code
)

# Fix The Blue Coconut location & notes
ts_code = re.sub(
    r'(\{\s*id:\s*"outer_the_blue_coconut_restaurant",[\s\S]*?address:\s*)"[^"]+"',
    r'\1"Isla Solarte (Overwater Reef), Bocas del Toro Archipelago, Panama"',
    ts_code
)
ts_code = re.sub(
    r'(\{\s*id:\s*"outer_the_blue_coconut_restaurant",[\s\S]*?notes:\s*)"[^"]+"',
    r'\1"Iconic over-the-water bar and restaurant off Isla Solarte. Active for day-trips, snorkeling, and Filthy Friday (property currently on the market for sale; check hours before heading out)."',
    ts_code
)

with open(SRC_DIRECTORY, 'w', encoding='utf-8') as f:
    f.write(ts_code)

print("✅ Updated directory.ts successfully!")

# Now update web-funnel/data/places.json
with open(WEB_PLACES, 'r', encoding='utf-8') as f:
    places = json.load(f)

new_places = []
for p in places:
    if p.get('id') == 'outer_dolphin_ecolodge_where_the_car':
        continue # Remove redundant listing
    if p.get('id') == 'outer_dolphin_blue_paradise':
        p['location'] = "Isla San Cristóbal (Dolphin Bay), Bocas del Toro Archipelago, Panama"
        p['description'] = "Premier eco-resort and boutique overwater cabanas in Dolphin Bay (Bahía de los Delfines), Isla San Cristóbal."
        p['description_en'] = "Premier eco-resort and boutique overwater cabanas in Dolphin Bay (Bahía de los Delfines), Isla San Cristóbal."
    if p.get('id') == 'outer_the_blue_coconut_restaurant':
        p['location'] = "Isla Solarte (Overwater Reef), Bocas del Toro Archipelago, Panama"
        p['description'] = "Iconic over-the-water bar and restaurant off Isla Solarte. Active for day-trips, snorkeling, and Filthy Friday (property currently on the market for sale; check hours before heading out)."
        p['description_en'] = "Iconic over-the-water bar and restaurant off Isla Solarte. Active for day-trips, snorkeling, and Filthy Friday (property currently on the market for sale; check hours before heading out)."
    new_places.append(p)

with open(WEB_PLACES, 'w', encoding='utf-8') as f:
    json.dump(new_places, f, indent=2, ensure_ascii=False)

print(f"✅ Updated places.json successfully! Total places: {len(new_places)}")
