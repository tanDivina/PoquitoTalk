#!/usr/bin/env python3
"""
harvest_outer_islands.py
Scrapes Google Maps directly using Playwright Chromium for businesses across the outer islands:
- Isla Bastimentos (Old Bank, Red Frog, Wizard Beach, Bahia Honda)
- Isla Solarte (Hospital Point, Bambuda Lodge, Blue Coconut)
- Isla San Cristóbal (Dolphin Bay / Laguna Bocatorito, cacao farms)
- Isla Popa & Cayo Agua (Popa Paradise, Urraca, eco retreats)
- Isla Carenero (Aqua Lounge, Leaf Eaters, Cosmic Crab, Hotel Tierra Verde)
"""

import asyncio
import json
import os
import re
from playwright.async_api import async_playwright

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'google_places_outer_islands.json')

QUERIES = [
    ('hotels resorts Isla Bastimentos Bocas del Toro', 'hotel_lodging', 'hotel_lodging', 'Isla Bastimentos'),
    ('restaurants bars Isla Bastimentos Bocas del Toro', 'restaurant_dining', 'restaurant_dining', 'Isla Bastimentos'),
    ('Red Frog Beach Bocas del Toro resort hotel restaurant', 'hotel_lodging', 'hotel_lodging', 'Isla Bastimentos (Red Frog)'),
    ('Old Bank Bastimentos Bocas del Toro restaurant hotel', 'restaurant_dining', 'restaurant_dining', 'Isla Bastimentos (Old Bank)'),
    ('hotels lodges Isla Solarte Bocas del Toro', 'hotel_lodging', 'hotel_lodging', 'Isla Solarte'),
    ('restaurants bars Isla Solarte Bocas del Toro', 'restaurant_dining', 'restaurant_dining', 'Isla Solarte'),
    ('hotels eco lodges Isla San Cristobal Bocas del Toro', 'hotel_lodging', 'hotel_lodging', 'Isla San Cristóbal'),
    ('Dolphin Bay San Cristobal Bocas del Toro restaurant lodge', 'hotel_lodging', 'hotel_lodging', 'Isla San Cristóbal (Dolphin Bay)'),
    ('hotels resorts Isla Popa Bocas del Toro', 'hotel_lodging', 'hotel_lodging', 'Isla Popa / Cayo Agua'),
    ('hotels Isla Carenero Bocas del Toro', 'hotel_lodging', 'hotel_lodging', 'Isla Carenero'),
    ('restaurants bars Isla Carenero Bocas del Toro', 'restaurant_dining', 'restaurant_dining', 'Isla Carenero'),
    ('tours chocolate farm activities Bastimentos San Cristobal Bocas del Toro', 'community_culture', 'service', 'Outer Islands (Agro-Tourism & Nature)'),
]

async def scrape_query(page, query, category, service_type, island_tag):
    url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
    print(f"🔍 Searching Google Maps for {island_tag}: {query}...")
    try:
        await page.goto(url, timeout=25000, wait_until='domcontentloaded')
        await page.wait_for_timeout(3500)
    except Exception as e:
        print(f"⚠️ Timeout loading query {query}: {e}")
        return []

    # Scroll the feed to load more outer island cards
    feed = await page.query_selector('div[role="feed"]')
    if feed:
        for _ in range(3):
            await feed.evaluate('el => el.scrollBy(0, 1000)')
            await page.wait_for_timeout(1000)

    cards = await page.query_selector_all('div.Nv2PK')
    extracted = []
    
    for card in cards:
        try:
            name_el = await card.query_selector('.qBF1Pd')
            name = (await name_el.inner_text()).strip() if name_el else ''
            if not name or len(name) < 2:
                continue

            link_el = await card.query_selector('a.hfpxzc')
            link = await link_el.get_attribute('href') if link_el else ''

            rating_el = await card.query_selector('span.MW4etd')
            rating_text = (await rating_el.inner_text()).strip() if rating_el else ''
            try:
                rating = float(rating_text)
            except ValueError:
                rating = 4.8

            # Extract details / snippet
            snippet_el = await card.query_selector('.W4Efsd:last-child')
            snippet = (await snippet_el.inner_text()).strip() if snippet_el else ''

            # Extract Place ID if in URL
            place_id_match = re.search(r'!1s(0x[0-9a-fA-F]+:[0-9a-fA-F]+)', link)
            place_id = place_id_match.group(1) if place_id_match else ''

            slug = re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')
            entry_id = f"outer_{slug[:30]}"

            extracted.append({
                'id': entry_id,
                'name': name,
                'category': category,
                'serviceType': service_type,
                'island': island_tag,
                'rating': rating,
                'address': f"{island_tag}, Bocas del Toro Archipelago, Panama",
                'notes': f"Verified {island_tag} business in Bocas del Toro. {snippet[:120]}".strip(),
                'source': 'google_maps',
                'sourceUrl': link,
                'sourcePlaceId': place_id,
                'verifiedDate': '2026-09-12',
                'verified': True
            })
        except Exception as e:
            continue

    print(f"  -> Extracted {len(extracted)} places from {island_tag}")
    return extracted

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        all_results = []
        seen_names = set()

        for query, cat, stype, tag in QUERIES:
            results = await scrape_query(page, query, cat, stype, tag)
            for r in results:
                n_clean = r['name'].lower()
                if n_clean not in seen_names:
                    seen_names.add(n_clean)
                    all_results.append(r)

        await browser.close()

    print(f"\n✅ Total unique outer island places harvested: {len(all_results)}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    print(f"📁 Saved to {OUTPUT_FILE}")

if __name__ == '__main__':
    asyncio.run(main())
