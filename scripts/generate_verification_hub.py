#!/usr/bin/env python3
"""
PoquitoTalk Bocas – Unified WhatsApp Outreach & Verification Hub
Generates an interactive verification dashboard for:
- 75 Certified Hope Spot Boat Captains
- 25 Curated Facebook Group Contractors & Tradesmen
"""

import json
import urllib.parse
from pathlib import Path

CAPTAINS_FILE = Path("web-funnel/data/captains.json")
CONTRACTORS_FILE = Path("web-funnel/data/facebook_contractors.json")
OUTPUT_HTML_LOCAL = Path("whatsapp_ping_dashboard.html")
OUTPUT_HTML_FUNNEL = Path("web-funnel/verify.html")

CONTRACTOR_SPECIALTIES = {
    "CONTRACTORS": "construcción, carpintería o remodelaciones",
    "AC_REPAIR": "reparación de aire acondicionado, refrigeración o electricidad",
    "LAND_TAXI": "transporte terrestre, mudanzas o traslados",
    "WATER_TAXI": "servicios marítimos, astillero o lancha",
    "VET": "atención y bienestar animal",
    "COMMUNITY": "actividades y proyectos comunitarios",
}

def generate_captain_message(captain):
    c_name = captain.get("captain_name", captain.get("name", ""))
    raw_name = c_name.replace("Capt. ", "").replace("Captain ", "").strip()
    first_name = raw_name.split()[0] if raw_name else "Capitán"
    captain_id = captain.get("id", "")
    profile_link = f"https://poquitotalk.hero-apps.com/es/directorio.html#{captain_id}"

    msg = (
        f"¡Buenas Capitán {first_name}! Un cordial saludo desde PoquitoTalk Bocas.\n\n"
        f"Le escribimos porque ya se encuentra incluido en el directorio comunitario de lanchas y capitanes de PoquitoTalk:\n"
        f"{profile_link}\n\n"
        f"Queremos que los residentes locales y visitantes que buscan lancha tengan su perfil completo y actualizado para recomendarlo directamente.\n\n"
        f"¿Nos podría compartir (por mensaje de texto o con una nota de voz rápida) estos detalles?:\n\n"
        f"1. Muelle habitual de salida (¿de dónde suele salir normalmente?)\n"
        f"2. Islas o rutas principales que atiende con más frecuencia\n"
        f"3. ¿Realiza viajes en días de lluvia o días feriados?\n"
        f"4. Horario habitual de servicio (¿hace viajes nocturnos si se le avisa?)\n"
        f"5. Tours favoritos o recomendados (Zapatilla, Bahía Delfines, snorkel, pesca, etc.)\n"
        f"6. Tarifas o precios aproximados por traslado o tour privado\n"
        f"7. ¿Tiene página de Instagram, Facebook o sitio web?\n\n"
        f"¡Muchas gracias por su tiempo y por su servicio en las aguas de Bocas! Quedamos atentos a su mensaje o nota de voz."
    )
    return msg

def generate_contractor_message(contractor):
    name = contractor.get("name", "amigo").split()[0]
    cat = contractor.get("category", "CONTRACTORS")
    specialty = CONTRACTOR_SPECIALTIES.get(cat, "servicios profesionales")
    c_id = contractor.get("id", "")
    profile_link = f"https://poquitotalk.hero-apps.com/es/directorio.html#{c_id}"
    
    msg = (
        f"¡Hola {name}! Un cordial saludo desde el directorio comunitario de PoquitoTalk Bocas.\n\n"
        f"Le escribimos porque ya se encuentra en nuestro directorio de servicios locales:\n"
        f"{profile_link}\n\n"
        f"Queríamos confirmar si actualmente se encuentra activo y disponible para realizar trabajos de {specialty} para nuevos clientes en las islas.\n\n"
        f"Si tiene áreas principales de cobertura (Colón, Carenero, Bastimentos, etc.), tarifas de referencia o fotos de sus trabajos, nos encantaría agregarlas a su ficha para recomendarlo directamente.\n\n"
        f"¡Muchas gracias por su tiempo! Puede respondernos por texto o con una nota de voz."
    )
    return msg


def main():
    with open(CAPTAINS_FILE, "r", encoding="utf-8") as f:
        captains = json.load(f)

    with open(CONTRACTORS_FILE, "r", encoding="utf-8") as f:
        contractors = json.load(f)

    print(f"Loaded {len(captains)} Captains and {len(contractors)} Contractors.")

    # Build Captains JSON Data for client-side JS
    captains_data = []
    for idx, c in enumerate(captains, 1):
        phone_raw = c.get("phone_raw", "").replace("+", "")
        msg = generate_captain_message(c)
        encoded = urllib.parse.quote(msg)
        wa_url = f"https://wa.me/{phone_raw}?text={encoded}"
        captains_data.append({
            "id": c.get("id", f"cap_{idx}"),
            "index": idx,
            "name": c.get("captain_name", c.get("name")),
            "operator": c.get("operator", "Independiente"),
            "category": "WATER_TAXI",
            "phone": c.get("phone", ""),
            "phone_raw": phone_raw,
            "location": c.get("location", "Bocas del Toro"),
            "message": msg,
            "wa_url": wa_url,
            "badge": "Hope Spot Certified",
            "type": "captain"
        })

    # Build Contractors JSON Data for client-side JS
    contractors_data = []
    for idx, c in enumerate(contractors, 1):
        phone_raw = c.get("phone_raw", "").replace("+", "")
        msg = generate_contractor_message(c)
        encoded = urllib.parse.quote(msg)
        wa_url = f"https://wa.me/{phone_raw}?text={encoded}"
        contractors_data.append({
            "id": c.get("id", f"fb_{idx}"),
            "index": idx,
            "name": c.get("name"),
            "trade": c.get("category_label", c.get("category")),
            "category": c.get("category", "CONTRACTORS"),
            "phone": c.get("phone", ""),
            "phone_raw": phone_raw,
            "location": c.get("location", "Bocas del Toro"),
            "description": c.get("description", ""),
            "message": msg,
            "wa_url": wa_url,
            "badge": "Facebook Group",
            "type": "contractor"
        })

    html_template = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>PoquitoTalk – WhatsApp Outreach & Verification Hub</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {{
            --primary: #964824;
            --primary-hover: #7A3719;
            --wa-green: #25D366;
            --wa-hover: #20BA5A;
            --bg-page: #FAF8F5;
            --card-bg: #FFFFFF;
            --border-color: rgba(150, 72, 36, 0.12);
            --text-main: #1A1208;
            --text-sub: #5C4E3A;
            --text-muted: #8C7853;
        }}
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        body {{
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-page);
            color: var(--text-main);
            padding: 24px 16px 80px;
            line-height: 1.5;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        .header-card {{
            background: var(--card-bg);
            border: 2px solid var(--border-color);
            border-radius: 24px;
            padding: 28px 32px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            margin-bottom: 24px;
        }}
        .header-title-row {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 12px;
        }}
        h1 {{
            font-size: 26px;
            font-weight: 900;
            color: var(--primary);
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 12px;
        }}
        .stats-badge {{
            background: #FEF3C7;
            color: #92400E;
            font-size: 13.5px;
            font-weight: 800;
            padding: 6px 14px;
            border-radius: 999px;
            border: 1px solid rgba(146, 64, 14, 0.2);
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }}
        .header-card p {{
            font-size: 15px;
            color: var(--text-sub);
            max-width: 900px;
        }}
        
        /* Tabs Bar */
        .tabs-container {{
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            border-bottom: 2px solid #EBE4DA;
            padding-bottom: 12px;
        }}
        .tab-btn {{
            background: #FFFFFF;
            border: 1.5px solid #D8CFC4;
            padding: 12px 24px;
            border-radius: 14px;
            font-family: inherit;
            font-size: 15px;
            font-weight: 800;
            color: var(--text-sub);
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }}
        .tab-btn:hover {{
            background: #FDFBF9;
            border-color: var(--primary);
            color: var(--primary);
        }}
        .tab-btn.active {{
            background: var(--primary);
            color: #FFFFFF;
            border-color: var(--primary);
            box-shadow: 0 4px 14px rgba(150, 72, 36, 0.25);
        }}
        .tab-badge {{
            background: rgba(0,0,0,0.08);
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 12px;
        }}
        .tab-btn.active .tab-badge {{
            background: rgba(255,255,255,0.25);
            color: #FFFFFF;
        }}

        /* Utility Bar */
        .utility-bar {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 14px;
            margin-bottom: 20px;
            background: #FFFFFF;
            padding: 16px 20px;
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }}
        .search-box {{
            flex: 1;
            min-width: 260px;
            position: relative;
        }}
        .search-input {{
            width: 100%;
            padding: 11px 16px 11px 40px;
            border-radius: 12px;
            border: 1.5px solid #DDD3C7;
            font-size: 14.5px;
            font-family: inherit;
            outline: none;
            transition: border-color 0.2s ease;
        }}
        .search-input:focus {{
            border-color: var(--primary);
        }}
        .search-icon {{
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #8C7853;
        }}
        .filter-group {{
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        .filter-btn {{
            background: #F4EFEA;
            border: 1px solid #D8CFC4;
            padding: 8px 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            color: var(--text-sub);
            cursor: pointer;
            transition: all 0.15s ease;
        }}
        .filter-btn.active {{
            background: #1A1208;
            color: #FFFFFF;
            border-color: #1A1208;
        }}

        /* Table Card */
        .table-card {{
            background: #FFFFFF;
            border-radius: 24px;
            border: 2px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            overflow: hidden;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }}
        th {{
            background: #F6F2EC;
            padding: 16px 20px;
            font-size: 12.5px;
            font-weight: 800;
            color: var(--text-sub);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #EBE4DA;
        }}
        td {{
            padding: 18px 20px;
            border-bottom: 1px solid #F0EAE1;
            vertical-align: middle;
        }}
        tr:hover {{
            background-color: #FCFBF9;
        }}
        tr.row-contacted {{
            background-color: #F8FAFC !important;
        }}
        tr.row-confirmed {{
            background-color: #F0FDF4 !important;
        }}
        .provider-name {{
            font-size: 16px;
            font-weight: 800;
            color: #1A1208;
            margin-bottom: 4px;
        }}
        .provider-meta {{
            font-size: 12.5px;
            color: #6B7280;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }}
        .provider-notes {{
            font-size: 12px;
            color: #4B5563;
            margin-top: 6px;
            line-height: 1.35;
        }}
        .badge {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }}
        .badge-hope {{
            background: #E0F2FE;
            color: #0369A1;
            border: 1px solid rgba(3, 105, 161, 0.2);
        }}
        .badge-fb {{
            background: #EBF5FF;
            color: #1877F2;
            border: 1px solid rgba(24, 119, 242, 0.2);
        }}
        .phone-cell {{
            font-family: monospace;
            font-size: 13.5px;
            font-weight: 700;
            color: #1F2937;
            white-space: nowrap;
        }}
        .actions-cell {{
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: flex-end;
            white-space: nowrap;
        }}
        .btn-wa {{
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--wa-green);
            color: #FFFFFF;
            text-decoration: none;
            font-size: 13px;
            font-weight: 800;
            padding: 9px 16px;
            border-radius: 999px;
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
            transition: all 0.2s ease;
        }}
        .btn-wa:hover {{
            background: var(--wa-hover);
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(37, 211, 102, 0.35);
        }}
        .btn-copy {{
            background: #FFFFFF;
            border: 1.5px solid #D8CFC4;
            color: var(--text-sub);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
        }}
        .btn-copy:hover {{
            border-color: var(--primary);
            color: var(--primary);
        }}
        .btn-copy.copied {{
            background: #10B981;
            border-color: #10B981;
            color: #FFFFFF;
        }}
        .btn-preview {{
            background: #F4EFEA;
            border: none;
            color: var(--text-sub);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }}
        .status-checkbox {{
            transform: scale(1.35);
            cursor: pointer;
            accent-color: var(--primary);
        }}

        /* Preview Modal */
        .modal-overlay {{
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
        }}
        .modal-content {{
            background: #FFFFFF;
            border-radius: 20px;
            max-width: 650px;
            width: 100%;
            padding: 28px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            position: relative;
        }}
        .modal-title {{
            font-size: 18px;
            font-weight: 900;
            color: var(--primary);
            margin-bottom: 12px;
        }}
        .modal-text {{
            background: #F8FAFC;
            border: 1.5px solid #E2E8F0;
            border-radius: 12px;
            padding: 16px;
            font-size: 13.5px;
            line-height: 1.55;
            white-space: pre-wrap;
            color: #334155;
            max-height: 380px;
            overflow-y: auto;
            margin-bottom: 16px;
        }}
        .modal-actions {{
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }}
        .btn-close {{
            background: #E5E7EB;
            border: none;
            padding: 10px 18px;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
        }}

        @media (max-width: 768px) {{
            body {{ padding: 16px 10px 60px; }}
            .header-card {{ padding: 20px; }}
            h1 {{ font-size: 20px; }}
            .actions-cell {{ flex-direction: column; align-items: stretch; }}
            .btn-wa {{ justify-content: center; }}
        }}
    </style>
</head>
<body>

<div class="container">
    <!-- Header -->
    <div class="header-card">
        <div class="header-title-row">
            <h1>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                PoquitoTalk – WhatsApp Outreach & Verification Hub
            </h1>
            <div class="stats-badge" id="statsBadge">
                <span id="contactedCount">0</span> / 100 Contacted
            </div>
        </div>
        <p>
            1-Click verification outreach protocol for the Bocas del Toro community directory. 
            Clicking <strong>Send WhatsApp</strong> opens WhatsApp directly with a pre-filled, respectful Spanish inquiry 
            tailored to either boat captains (requesting departure docks, routes, rainy day policy, tour specialties, and rates) or local contractors.
        </p>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
        <button class="tab-btn active" id="tabCaptains" onclick="switchTab('captain')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
            Certified Boat Captains <span class="tab-badge">75</span>
        </button>
        <button class="tab-btn" id="tabContractors" onclick="switchTab('contractor')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            Facebook Contractors & Tradesmen <span class="tab-badge">25</span>
        </button>
    </div>

    <!-- Utility Bar: Search & Status Filters -->
    <div class="utility-bar">
        <div class="search-box">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="searchInput" class="search-input" placeholder="Search by name, operator, trade or phone..." oninput="filterTable()">
        </div>
        <div class="filter-group">
            <button class="filter-btn active" id="filterAll" onclick="setStatusFilter('ALL')">All</button>
            <button class="filter-btn" id="filterPending" onclick="setStatusFilter('PENDING')">Pending</button>
            <button class="filter-btn" id="filterContacted" onclick="setStatusFilter('CONTACTED')">Contacted</button>
        </div>
    </div>

    <!-- Table Container -->
    <div class="table-card">
        <table>
            <thead>
                <tr>
                    <th style="width: 45px; text-align: center;">#</th>
                    <th>Provider / Name</th>
                    <th style="width: 140px;">Category / Badge</th>
                    <th style="width: 150px;">Phone</th>
                    <th style="width: 290px; text-align: right;">1-Click Outreach</th>
                    <th style="width: 70px; text-align: center;">Done</th>
                </tr>
            </thead>
            <tbody id="tableBody">
                <!-- Dynamically Rendered -->
            </tbody>
        </table>
    </div>
</div>

<!-- Preview Modal -->
<div class="modal-overlay" id="previewModal" onclick="closeModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-title" id="modalProviderName">Message Preview</div>
        <div class="modal-text" id="modalMessageText"></div>
        <div class="modal-actions">
            <button class="btn-copy" id="modalCopyBtn" onclick="copyCurrentModalMessage()">Copy Message</button>
            <a href="#" target="_blank" class="btn-wa" id="modalWaBtn">Open in WhatsApp</a>
            <button class="btn-close" onclick="closeModal()">Close</button>
        </div>
    </div>
</div>

<script>
    const CAPTAINS = {json.dumps(captains_data, ensure_ascii=False)};
    const CONTRACTORS = {json.dumps(contractors_data, ensure_ascii=False)};

    let currentTab = 'captain';
    let currentStatusFilter = 'ALL';
    let activeModalMsg = '';

    // Load persisted state from localStorage
    function getStoredStatus(id) {{
        return localStorage.getItem('pt_verified_' + id) || 'PENDING';
    }}

    function setStoredStatus(id, status) {{
        if (status === 'PENDING') {{
            localStorage.removeItem('pt_verified_' + id);
        }} else {{
            localStorage.setItem('pt_verified_' + id, status);
        }}
        updateStats();
    }}

    function switchTab(tab) {{
        currentTab = tab;
        document.getElementById('tabCaptains').classList.toggle('active', tab === 'captain');
        document.getElementById('tabContractors').classList.toggle('active', tab === 'contractor');
        filterTable();
    }}

    function setStatusFilter(filter) {{
        currentStatusFilter = filter;
        document.getElementById('filterAll').classList.toggle('active', filter === 'ALL');
        document.getElementById('filterPending').classList.toggle('active', filter === 'PENDING');
        document.getElementById('filterContacted').classList.toggle('active', filter === 'CONTACTED');
        filterTable();
    }}

    function filterTable() {{
        const searchVal = document.getElementById('searchInput').value.toLowerCase().trim();
        const data = currentTab === 'captain' ? CAPTAINS : CONTRACTORS;
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        data.forEach(item => {{
            const status = getStoredStatus(item.id);
            if (currentStatusFilter === 'PENDING' && status !== 'PENDING') return;
            if (currentStatusFilter === 'CONTACTED' && status === 'PENDING') return;

            const text = (item.name + ' ' + (item.operator || '') + ' ' + (item.trade || '') + ' ' + item.phone).toLowerCase();
            if (searchVal && !text.includes(searchVal)) return;

            const isContacted = status !== 'PENDING';
            const tr = document.createElement('tr');
            tr.id = 'row-' + item.id;
            if (isContacted) tr.classList.add('row-contacted');

            const badgeHtml = item.type === 'captain'
                ? '<span class="badge badge-hope">Hope Spot</span>'
                : '<span class="badge badge-fb">' + (item.trade || 'Tradesman') + '</span>';

            const subMeta = item.type === 'captain'
                ? (item.operator ? 'Operador: ' + item.operator + ' • ' : '') + item.location
                : (item.location ? '<svg style="vertical-align: -2px; margin-right: 3px;" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' + item.location : '');

            tr.innerHTML = `
                <td style="text-align: center; font-weight: 700; color: #8C7853;">${{item.index}}</td>
                <td>
                    <div class="provider-name">${{escapeHtml(item.name)}}</div>
                    <div class="provider-meta">${{escapeHtml(subMeta)}}</div>
                    ${{item.description ? '<div class="provider-notes">' + escapeHtml(item.description) + '</div>' : ''}}
                </td>
                <td>${{badgeHtml}}</td>
                <td class="phone-cell">${{item.phone}}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-preview" onclick="openPreview('${{item.id}}')">Preview</button>
                        <button class="btn-copy" id="copy-${{item.id}}" onclick="copyMessage('${{item.id}}')">Copy</button>
                        <a href="${{item.wa_url}}" target="_blank" class="btn-wa" onclick="markAutoContacted('${{item.id}}')">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                            Send WhatsApp
                        </a>
                    </div>
                </td>
                <td style="text-align: center;">
                    <input type="checkbox" class="status-checkbox" ${{isContacted ? 'checked' : ''}} onchange="toggleRowStatus('${{item.id}}', this.checked)">
                </td>
            `;
            tbody.appendChild(tr);
        }});
    }}

    function markAutoContacted(id) {{
        setStoredStatus(id, 'CONTACTED');
        const row = document.getElementById('row-' + id);
        if (row) {{
            row.classList.add('row-contacted');
            const chk = row.querySelector('.status-checkbox');
            if (chk) chk.checked = true;
        }}
    }}

    function toggleRowStatus(id, isChecked) {{
        setStoredStatus(id, isChecked ? 'CONTACTED' : 'PENDING');
        const row = document.getElementById('row-' + id);
        if (row) {{
            row.classList.toggle('row-contacted', isChecked);
        }}
    }}

    function copyMessage(id) {{
        const all = [...CAPTAINS, ...CONTRACTORS];
        const item = all.find(x => x.id === id);
        if (!item) return;
        navigator.clipboard.writeText(item.message).then(() => {{
            const btn = document.getElementById('copy-' + id);
            if (btn) {{
                const original = btn.textContent;
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(() => {{
                    btn.textContent = original;
                    btn.classList.remove('copied');
                }}, 1500);
            }}
        }});
    }}

    function openPreview(id) {{
        const all = [...CAPTAINS, ...CONTRACTORS];
        const item = all.find(x => x.id === id);
        if (!item) return;
        activeModalMsg = item.message;
        document.getElementById('modalProviderName').textContent = 'Outreach for: ' + item.name;
        document.getElementById('modalMessageText').textContent = item.message;
        document.getElementById('modalWaBtn').href = item.wa_url;
        document.getElementById('modalWaBtn').onclick = () => markAutoContacted(item.id);
        document.getElementById('previewModal').style.display = 'flex';
    }}

    function closeModal() {{
        document.getElementById('previewModal').style.display = 'none';
    }}

    function copyCurrentModalMessage() {{
        if (!activeModalMsg) return;
        navigator.clipboard.writeText(activeModalMsg).then(() => {{
            const btn = document.getElementById('modalCopyBtn');
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {{
                btn.textContent = 'Copy Message';
                btn.classList.remove('copied');
            }}, 1500);
        }});
    }}

    function updateStats() {{
        const all = [...CAPTAINS, ...CONTRACTORS];
        let contacted = 0;
        all.forEach(item => {{
            if (getStoredStatus(item.id) !== 'PENDING') contacted++;
        }});
        document.getElementById('contactedCount').textContent = contacted;
        document.getElementById('statsBadge').innerHTML = `<strong>${{contacted}}</strong> / ${{all.length}} Contacted`;
    }}

    function escapeHtml(str) {{
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }}

    // Init
    filterTable();
    updateStats();
</script>

</body>
</html>
"""

    with open(OUTPUT_HTML_LOCAL, "w", encoding="utf-8") as f:
        f.write(html_template)
    print(f"✓ Saved local hub: {OUTPUT_HTML_LOCAL.resolve()}")

    with open(OUTPUT_HTML_FUNNEL, "w", encoding="utf-8") as f:
        f.write(html_template)
    print(f"✓ Saved web funnel hub: {OUTPUT_HTML_FUNNEL.resolve()}")

if __name__ == "__main__":
    main()
