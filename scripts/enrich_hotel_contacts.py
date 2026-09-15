#!/usr/bin/env python3
"""
scripts/enrich_hotel_contacts.py
Enriches all places in web-funnel/data/places.json (hotels, clinics, hardware, restaurants, etc.)
by visiting their Google Maps detail URLs via Playwright and extracting:
- Verified phone number (formatted +507 and raw)
- WhatsApp direct link if mobile
- Official website URL
- Specific physical street / island address
Also filters out non-business entities (like geographic island features or out-of-country entries).
"""

import asyncio
import json
import os
import re
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLACES_FILE = os.path.join(ROOT, 'web-funnel', 'data', 'places.json')
EXPANDED_FILE = os.path.join(ROOT, 'data', 'google_places_bocas_expanded.json')

BLACKLIST_IDS = {
    'outer_isla_de_san_crist_bal',
    'outer_golden_bay_galapagos',
    'outer_bah_a_delfines',
    'bocas_isla_de_san_crist_bal',
    'bocas_golden_bay_galapagos',
    'bocas_bah_a_delfines'
}

def format_panama_phone(raw_phone_str):
    if not raw_phone_str:
        return None, None, None

    cleaned = re.sub(r'[^0-9+]', '', raw_phone_str)
    
    # Toll free or US/Canada (+1 ...)
    if cleaned.startswith('+1') or (cleaned.startswith('1') and len(cleaned) == 11):
        raw = '+' + cleaned.lstrip('+')
        digits = cleaned.lstrip('+')
        if len(digits) == 11:
            display = f"+1 {digits[1:4]}-{digits[4:7]}-{digits[7:]}"
        else:
            display = raw_phone_str
        return display, raw, None

    p_digits = cleaned.lstrip('+')
    if p_digits.startswith('507') and len(p_digits) >= 10:
        p_digits = p_digits[3:]

    if len(p_digits) == 7: # landline
        display = f"+507 {p_digits[:3]}-{p_digits[3:]}"
        raw = f"+507{p_digits}"
        wa = None
        return display, raw, wa
    elif len(p_digits) == 8: # mobile or modern landline
        display = f"+507 {p_digits[:4]}-{p_digits[4:]}"
        raw = f"+507{p_digits}"
        wa = f"https://wa.me/507{p_digits}" if p_digits.startswith('6') else None
        return display, raw, wa

    raw = '+' + cleaned.lstrip('+') if not cleaned.startswith('+') else cleaned
    return raw_phone_str, raw, None


async def scrape_place_details(context, place):
    url = place.get('map_url')
    if not url or not url.startswith('http'):
        return None

    page = await context.new_page()
    try:
        await page.goto(url, wait_until='domcontentloaded', timeout=18000)
        await page.wait_for_timeout(2200)

        # 1. Phone extraction
        phone_el = await page.query_selector('[data-item-id^="phone:"]')
        phone_text = None
        phone_raw_id = None
        if phone_el:
            raw_t = await phone_el.inner_text()
            phone_text = raw_t.replace('\ue0b0', '').replace('', '').strip()
            phone_raw_id = await phone_el.get_attribute('data-item-id')
            if phone_raw_id and 'phone:tel:' in phone_raw_id:
                raw_tel = phone_raw_id.split('phone:tel:')[-1]
                if not phone_text or len(phone_text) < 5:
                    phone_text = raw_tel

        # 2. Website extraction
        web_el = await page.query_selector('[data-item-id="authority"]')
        website = None
        if web_el:
            href = await web_el.get_attribute('href')
            if href:
                m = re.search(r'q=([^&]+)', href)
                if m and 'google.com/url' in href:
                    import urllib.parse
                    website = urllib.parse.unquote(m.group(1))
                else:
                    website = href

        # 3. Address extraction
        addr_el = await page.query_selector('[data-item-id="address"]')
        address = None
        if addr_el:
            raw_a = await addr_el.inner_text()
            address = raw_a.replace('\ue0c8', '').replace('', '').strip().replace('\n', ', ')

        return {
            'phone_text': phone_text,
            'website': website,
            'address': address
        }
    except Exception as e:
        return None
    finally:
        await page.close()


async def enrich_all(places, concurrency=5):
    # Only places missing phone and website
    to_enrich = [
        p for p in places 
        if (not p.get('phone') or not p.get('website')) and p.get('id') not in BLACKLIST_IDS and p.get('map_url')
    ]
    print(f"Total places needing enrichment: {len(to_enrich)}")

    semaphore = asyncio.Semaphore(concurrency)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='en-US'
        )

        completed = 0
        total = len(to_enrich)

        async def worker(place):
            nonlocal completed
            async with semaphore:
                details = await scrape_place_details(context, place)
                if details:
                    phone_text = details.get('phone_text')
                    if phone_text and not place.get('phone'):
                        display, raw, wa = format_panama_phone(phone_text)
                        place['phone'] = display
                        place['phone_raw'] = raw
                        if wa:
                            place['whatsapp_url'] = wa
                    
                    website = details.get('website')
                    if website and not place.get('website'):
                        place['website'] = website

                    address = details.get('address')
                    if address and (not place.get('location') or 'Bocas del Toro Archipelago' in place.get('location', '')):
                        place['location'] = address
                
                completed += 1
                if completed % 10 == 0 or completed == total:
                    print(f"Progress: {completed}/{total} places processed...")

        tasks = [worker(p) for p in to_enrich]
        await asyncio.gather(*tasks)
        await browser.close()


async def main():
    print(f"Loading {PLACES_FILE}...")
    with open(PLACES_FILE, 'r', encoding='utf-8') as f:
        places = json.load(f)

    original_count = len(places)
    places = [p for p in places if p.get('id') not in BLACKLIST_IDS]
    if original_count != len(places):
        print(f"Removed {original_count - len(places)} blacklisted non-business entries.")

    await enrich_all(places, concurrency=5)

    with open(PLACES_FILE, 'w', encoding='utf-8') as f:
        json.dump(places, f, indent=2, ensure_ascii=False)
    print(f"🎉 Successfully updated {PLACES_FILE}!")

    if os.path.exists(EXPANDED_FILE):
        with open(EXPANDED_FILE, 'r', encoding='utf-8') as f:
            expanded = json.load(f)
        
        enriched_map = {p['id']: p for p in places}
        for item in expanded:
            eid = item.get('id')
            if eid in enriched_map:
                ep = enriched_map[eid]
                if 'phone' in ep:
                    item['phone'] = ep['phone']
                if 'phone_raw' in ep:
                    item['phone_raw'] = ep['phone_raw']
                if 'whatsapp_url' in ep:
                    item['whatsappNumber'] = ep['whatsapp_url']
                if 'website' in ep:
                    item['website'] = ep['website']
                if 'location' in ep:
                    item['address'] = ep['location']
        
        with open(EXPANDED_FILE, 'w', encoding='utf-8') as f:
            json.dump(expanded, f, indent=2, ensure_ascii=False)
        print(f"🎉 Successfully updated {EXPANDED_FILE}!")


if __name__ == '__main__':
    asyncio.run(main())
