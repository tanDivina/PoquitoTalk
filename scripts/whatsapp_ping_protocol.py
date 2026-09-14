#!/usr/bin/env python3
"""
PoquitoTalk Bocas del Toro – WhatsApp Ping Protocol & Contractor Verification
Generates pre-formatted Spanish outreach messages and 1-click WhatsApp links
to verify active availability for newly curated independent contractors.
"""

import json
import urllib.parse
from pathlib import Path

DATA_FILE = Path("web-funnel/data/facebook_contractors.json")
OUTPUT_HTML = Path("scripts/whatsapp_ping_dashboard.html")

CATEGORY_SPECIALTIES = {
    "CONTRACTORS": "construcción, carpintería o reparaciones",
    "AC_REPAIR": "reparación eléctrica, aire acondicionado o línea blanca",
    "LAND_TAXI": "transporte terrestre o traslados",
    "WATER_TAXI": "servicios marítimos o atraque",
    "VET": "atención y bienestar animal",
    "COMMUNITY": "proyectos y actividades comunitarias",
}

def generate_message(contractor):
    cat = contractor.get("category", "CONTRACTORS")
    specialty = CATEGORY_SPECIALTIES.get(cat, "servicios profesionales")
    
    # Natural, respectful Panamanian phrasing
    msg = (
        f"¡Hola! Un cordial saludo. Le escribo desde el directorio comunitario PoquitoTalk Bocas. "
        f"Encontramos su contacto en la comunidad local y queríamos confirmar si actualmente se "
        f"encuentra disponible y brindando servicios de {specialty} para nuevos clientes en las islas. "
        f"¡Muchas gracias!"
    )
    return msg

def main():
    if not DATA_FILE.exists():
        print(f"Error: {DATA_FILE} not found!")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        contractors = json.load(f)

    print("\n=======================================================")
    print("  PoquitoTalk Bocas – WhatsApp Verification Ping Protocol")
    print(f"  Total Contractors to Verify: {len(contractors)}")
    print("=======================================================\n")

    items_html = []

    for idx, c in enumerate(contractors, 1):
        phone_raw = c.get("phone_raw", "").replace("+", "")
        message = generate_message(c)
        encoded_msg = urllib.parse.quote(message)
        wa_url = f"https://wa.me/{phone_raw}?text={encoded_msg}"

        print(f"[{idx:02d}] {c['name']}")
        print(f"     Phone: {c['phone']}")
        print(f"     Trade: {c.get('category')}")
        print(f"     WhatsApp Link: {wa_url}\n")

        items_html.append(f"""
        <tr class="contractor-row" id="row-{c['id']}">
            <td style="text-align: center; font-weight: 700; color: #8C7853;">{idx}</td>
            <td>
                <div style="font-weight: 800; font-size: 16px; color: #1A1208;">{c['name']}</div>
                <div style="font-size: 12.5px; color: #6B7280; margin-top: 3px;">📍 {c.get('location', 'Bocas del Toro')}</div>
                <div style="font-size: 12px; color: #4B5563; margin-top: 4px; line-height: 1.35;">{c.get('description', '')}</div>
            </td>
            <td>
                <span class="badge badge-{c.get('category', 'CONTRACTORS').lower()}">{c.get('category')}</span>
            </td>
            <td style="font-family: monospace; font-size: 14px; font-weight: 600; color: #1F2937;">
                {c.get('phone')}
            </td>
            <td style="text-align: center;">
                <a href="{wa_url}" target="_blank" class="btn-wa">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    Send Verification Ping
                </a>
            </td>
            <td style="text-align: center;">
                <input type="checkbox" style="transform: scale(1.4); cursor: pointer;" onchange="markChecked('row-{c['id']}', this.checked)">
            </td>
        </tr>
        """)

    rows_str = "".join(items_html)
    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>PoquitoTalk – WhatsApp Verification Protocol</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap" rel="stylesheet">
    <style>
        body {{
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            background: #FAF8F5;
            color: #1A1208;
            margin: 0;
            padding: 30px;
        }}
        .header {{
            max-width: 1200px;
            margin: 0 auto 30px;
            background: #FFFFFF;
            padding: 24px 32px;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
            border: 1px solid rgba(150,72,36,0.12);
        }}
        h1 {{
            margin: 0 0 8px;
            font-size: 26px;
            font-weight: 900;
            color: #964824;
        }}
        p {{
            margin: 0;
            color: #5C4E3A;
            font-size: 15px;
            line-height: 1.5;
        }}
        .table-wrap {{
            max-width: 1200px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 20px;
            box-shadow: 0 6px 24px rgba(0,0,0,0.05);
            border: 1px solid rgba(150,72,36,0.12);
            overflow: hidden;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }}
        th {{
            background: #F4EFEA;
            padding: 16px 20px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6B5E4D;
            border-bottom: 2px solid rgba(150,72,36,0.15);
        }}
        td {{
            padding: 18px 20px;
            border-bottom: 1px solid #F0EAE1;
            vertical-align: middle;
        }}
        tr:hover {{
            background-color: #FCFBF9;
        }}
        .checked-row {{
            background-color: #F0FDF4 !important;
            opacity: 0.7;
        }}
        .btn-wa {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #25D366;
            color: #FFFFFF;
            text-decoration: none;
            font-size: 13px;
            font-weight: 700;
            padding: 9px 16px;
            border-radius: 999px;
            box-shadow: 0 4px 12px rgba(37,211,102,0.3);
            transition: all 0.2s ease;
            white-space: nowrap;
        }}
        .btn-wa:hover {{
            background: #20BA5A;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(37,211,102,0.4);
        }}
        .badge {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }}
        .badge-contractors {{ background: #FEF3C7; color: #92400E; }}
        .badge-ac_repair {{ background: #D1FAE5; color: #065F46; }}
        .badge-land_taxi {{ background: #CFFAFE; color: #155E75; }}
        .badge-water_taxi {{ background: #E0F2FE; color: #075985; }}
        .badge-vet {{ background: #FAE8FF; color: #86198F; }}
        .badge-community {{ background: #EDE9FE; color: #5B21B6; }}
    </style>
    <script>
        function markChecked(rowId, isChecked) {{
            const row = document.getElementById(rowId);
            if (isChecked) {{
                row.classList.add('checked-row');
            }} else {{
                row.classList.remove('checked-row');
            }}
        }}
    </script>
</head>
<body>
    <div class="header">
        <h1>PoquitoTalk Bocas – WhatsApp Verification Protocol</h1>
        <p>Clicking <strong>Send Verification Ping</strong> opens WhatsApp directly with a respectful, pre-filled community verification inquiry in Spanish. Once they reply confirming their trade and island coverage, check off the row.</p>
    </div>

    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th style="width: 40px; text-align: center;">#</th>
                    <th>Business / Tradesman</th>
                    <th style="width: 140px;">Category</th>
                    <th style="width: 160px;">Phone (WhatsApp)</th>
                    <th style="width: 220px; text-align: center;">1-Click Outreach</th>
                    <th style="width: 60px; text-align: center;">Confirmed</th>
                </tr>
            </thead>
            <tbody>
                {rows_str}
            </tbody>
        </table>
    </div>
</body>
</html>
"""

    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"✓ Created interactive verification dashboard: {OUTPUT_HTML.resolve()}")

if __name__ == "__main__":
    main()
