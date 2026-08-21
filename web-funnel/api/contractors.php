<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Cache-Control: no-store, no-cache, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Permanent Verified Bocas Entities (Base Directory)
$permanentEntities = [
    [
        'id' => 'banconal-bocas',
        'name' => 'Banco Nacional de Panamá (Sucursal y Cajeros)',
        'name_es' => 'Banco Nacional de Panamá (Sucursal y Cajeros)',
        'category' => 'BANKING',
        'category_label' => 'Bancos y Cajeros',
        'category_label_en' => 'Banks & ATMs',
        'rating' => 4.9,
        'verified' => true,
        'status' => 'approved',
        'location' => 'Calle 4ta (Vía Aeropuerto), Bocas Town, Isla Colón',
        'hours' => 'Sucursal: Lun–Vie 8:00 AM – 3:00 PM • Cajeros Telered: 24/7',
        'phone' => '+507 757-9230',
        'phone_raw' => '+5077579230',
        'map_url' => 'https://www.google.com/maps/search/?api=1&query=Banco+Nacional+de+Panama+Bocas+del+Toro',
        'description' => 'Único banco con sucursal física en Isla Colón. Dispone de 3 cajeros automáticos Telered activos 24/7 en el vestíbulo.',
        'description_en' => 'Only physical bank branch on Isla Colón. Features 3 Telered ATMs operating 24/7 in the lobby.'
    ],
    [
        'id' => 'atm-police-station',
        'name' => 'Cajero de Duo2 Market (Cerca de la Policía)',
        'name_es' => 'Cajero de Duo2 Market (Cerca de la Policía)',
        'category' => 'BANKING',
        'category_label' => 'Bancos y Cajeros',
        'category_label_en' => 'Banks & ATMs',
        'rating' => 4.8,
        'verified' => true,
        'status' => 'approved',
        'location' => 'Frente a Duo2 Market, Calle 1ra / Calle 2da (Cerca de la Policía y el Parque Central), Bocas Town',
        'hours' => 'Todos los días: ~7:00 AM – 9:30 PM (Horario del supermercado)',
        'phone' => '',
        'phone_raw' => '',
        'map_url' => 'https://www.google.com/maps/search/?api=1&query=Duo2+Market+Bocas+del+Toro+Isla+Colon',
        'description' => 'Cajero automático Telered ubicado al frente de Duo2 Market, cerca de la estación de Policía Nacional y el Parque Simón Bolívar.',
        'description_en' => 'Telered ATM located in front of Duo2 Market, near the National Police station and Simon Bolivar Central Park.'
    ],
    [
        'id' => 'atm-super-gourmet',
        'name' => 'Cajero de Supermercado Alba (Calle 3ra)',
        'name_es' => 'Cajero de Supermercado Alba (Calle 3ra)',
        'category' => 'BANKING',
        'category_label' => 'Bancos y Cajeros',
        'category_label_en' => 'Banks & ATMs',
        'rating' => 4.7,
        'verified' => true,
        'status' => 'approved',
        'location' => 'Frente a Supermercado Alba, Calle 3ra (Calle Principal), Bocas Town, Isla Colón',
        'hours' => 'Todos los días: ~7:00 AM – 9:30 PM',
        'phone' => '',
        'phone_raw' => '',
        'map_url' => 'https://www.google.com/maps/search/?api=1&query=Supermercado+Alba+Bocas+del+Toro+Isla+Colon',
        'description' => 'Cajero automático Telered independiente ubicado al frente de Supermercado Alba en la calle principal (Calle 3ra). Retiro máximo $500 por día.',
        'description_en' => 'Independent Telered ATM located in front of Supermarket Alba on main street (Calle 3ra). Max withdrawal $500/day.'
    ],
    [
        'id' => 'wu-changuinola',
        'name' => 'Western Union (Changuinola Principal)',
        'name_es' => 'Western Union (Changuinola Principal)',
        'category' => 'BANKING',
        'category_label' => 'Remesas y Giros',
        'category_label_en' => 'Money Transfers',
        'rating' => 4.9,
        'verified' => true,
        'status' => 'approved',
        'location' => 'Av. 17 de Abril, Edificio Sincota / Forzacom, Changuinola',
        'hours' => 'Lun–Sáb: 8:00 AM – 5:00/6:00 PM • Domingo: Cerrado',
        'phone' => '+507 301-2623',
        'phone_raw' => '+5073012623',
        'map_url' => 'https://www.google.com/maps/search/?api=1&query=Western+Union+Changuinola+Panama',
        'description' => 'Agencia principal en la provincia de Bocas del Toro para cobro y envío de giros internacionales, transferencias y remesas.',
        'description_en' => 'Main Western Union branch in Bocas del Toro province for international money transfers, remittances, and cash pickups.'
    ],
    [
        'id' => 'wu-guabito',
        'name' => 'Western Union (Frontera de Guabito)',
        'name_es' => 'Western Union (Frontera de Guabito)',
        'category' => 'BANKING',
        'category_label' => 'Remesas y Giros',
        'category_label_en' => 'Money Transfers',
        'rating' => 4.8,
        'verified' => true,
        'status' => 'approved',
        'location' => 'Ave Principal, Urbanización Guabito (Frontera Costa Rica)',
        'hours' => 'Lun–Vie: 8:00 AM – 5:00 PM • Sáb: 8:00 AM – 12:00 PM',
        'phone' => '+507 758-3877',
        'phone_raw' => '+5077583877',
        'map_url' => 'https://www.google.com/maps/search/?api=1&query=Guabito+border+crossing+Panama',
        'description' => 'Agencia de giros en Agroveterinaria justo antes del puente fronterizo con Sixaola / Costa Rica.',
        'description_en' => 'Money transfer agency at Agroveterinaria right before the border crossing bridge to Sixaola / Costa Rica.'
    ],
    [
        'id' => 'punto-pago-kiosks',
        'name' => 'Quioscos de Punto Pago',
        'name_es' => 'Quioscos de Punto Pago',
        'category' => 'BANKING',
        'category_label' => 'Pagos de Facturas',
        'category_label_en' => 'Bill Payments',
        'rating' => 4.9,
        'verified' => true,
        'status' => 'approved',
        'location' => 'Dentro de Supermercado Isla Colón y farmacias',
        'hours' => 'Todos los días: ~7:00 AM – 9:00 PM',
        'phone' => '+507 6262-5817',
        'phone_raw' => '+50762625817',
        'whatsapp_url' => 'https://wa.me/50762625817',
        'description' => 'Terminales automáticas de pago para recibos de luz Naturgy, agua IDAAN, recargas celulares Tigo / Más Móvil y tarjetas prepagadas.',
        'description_en' => 'Self-service payment kiosks for Naturgy electric bills, IDAAN water bills, cellular top-ups, and prepaid cards.'
    ],
    [
        'id' => 'naturgy-bocas',
        'name' => 'Centro de Atención Naturgy',
        'name_es' => 'Centro de Atención Naturgy',
        'category' => 'BANKING',
        'category_label' => 'Oficina Eléctrica',
        'category_label_en' => 'Power Utility Office',
        'rating' => 4.6,
        'verified' => true,
        'status' => 'approved',
        'location' => 'Calle E, frente a la Gobernación, Bocas Town, Isla Colón',
        'hours' => 'Lun–Vie: 8:00 AM – 4:00 PM • Fines de semana: Cerrado',
        'phone' => '+507 800-8346',
        'phone_raw' => '+5078008346',
        'map_url' => 'https://www.google.com/maps/search/?api=1&query=Gobernacion+Bocas+del+Toro+Calle+E',
        'description' => 'Oficina oficial de la empresa eléctrica en Isla Colón para trámites de medidores, cambios de titular y consultas de facturación.',
        'description_en' => 'Official electric utility customer service branch in Isla Colón for meter installations, ownership transfers, and billing inquiries.'
    ],
    [
        'id' => 'solarte-soil-works',
        'name' => 'Solarte Soil Works (Finca Natural)',
        'name_es' => 'Solarte Soil Works (Finca Natural Isla Solarte)',
        'category' => 'GARDENING',
        'category_label' => 'Jardinería y Suelo Vivo',
        'category_label_en' => 'Gardening & Living Soil',
        'rating' => 5.0,
        'verified' => true,
        'status' => 'approved',
        'location' => 'Isla Solarte, Bocas del Toro (Archipiélago e Islas)',
        'hours' => 'Lun–Sáb: ~8:00 AM – 4:00 PM • Entregas a muelle y consultas',
        'phone' => '',
        'phone_raw' => '',
        'website' => 'https://fincanatural.com',
        'map_url' => 'https://www.google.com/maps/search/?api=1&query=Isla+Solarte+Bocas+del+Toro',
        'description' => 'Finca orgánica y proyecto de suelo vivo en Isla Solarte. Producción de tierra negra rica en microorganismos autóctonos (IMO), abono orgánico, compost, acolchado (mulch) y plantas tropicales.',
        'description_en' => 'Organic living soil farm and permaculture nursery on Isla Solarte. Specializing in indigenous microorganisms (IMO), bio-complete garden soil, nutrient compost, mulching, and tropical plants.'
    ]
];

// 2. Load Certified Boat Captains from data/captains.json
$captainsFile = __DIR__ . '/../data/captains.json';
$captainsList = [];
if (file_exists($captainsFile)) {
    $rawCap = @file_get_contents($captainsFile);
    $captainsList = json_decode($rawCap, true) ?: [];
}

// 3. Load Dynamic Approved Contractors from JSON Storage
$dataDir = '/home/finclazc/poquitotalk_data';
if (!is_dir($dataDir) || !is_readable($dataDir)) {
    $dataDir = __DIR__ . '/../data_private';
}

$contractorsFile = $dataDir . '/contractors.json';
$dynamicContractors = [];

if (file_exists($contractorsFile)) {
    $raw = @file_get_contents($contractorsFile);
    $records = json_decode($raw, true) ?: [];
    
    foreach ($records as $rec) {
        if (isset($rec['status']) && $rec['status'] === 'approved') {
            $businessName = $rec['BusinessName'] ?? ($rec['payload']['BusinessName'] ?? ($rec['name'] ?? 'Local Contractor'));
            $tradeCategory = $rec['TradeCategory'] ?? ($rec['payload']['TradeCategory'] ?? ($rec['category'] ?? 'CONTRACTORS'));
            $location = $rec['PrimaryLocation'] ?? ($rec['payload']['PrimaryLocation'] ?? ($rec['location'] ?? 'Bocas del Toro'));
            $languages = $rec['LanguagesSpoken'] ?? ($rec['payload']['LanguagesSpoken'] ?? ($rec['languages'] ?? 'Español'));
            $phone = $rec['WhatsAppPhone'] ?? ($rec['payload']['WhatsAppPhone'] ?? ($rec['phone'] ?? ''));
            $summary = $rec['ServiceSummary'] ?? ($rec['payload']['ServiceSummary'] ?? ($rec['notes'] ?? 'Servicio técnico profesional en Bocas del Toro.'));
            $website = $rec['Website'] ?? ($rec['website'] ?? ($rec['payload']['Website'] ?? ($rec['payload']['website'] ?? '')));

            $phoneClean = preg_replace('/[^0-9]/', '', $phone);
            if (!empty($phoneClean) && substr($phoneClean, 0, 3) !== '507') {
                $phoneClean = '507' . $phoneClean;
            }
            
            $dynamicContractors[] = [
                'id' => $rec['id'] ?? ('contractor-' . substr(md5($businessName . rand()), 0, 8)),
                'name' => $businessName,
                'name_es' => $businessName,
                'category' => strtoupper($tradeCategory),
                'category_label' => $tradeCategory,
                'category_label_en' => $tradeCategory,
                'rating' => $rec['rating'] ?? 5.0,
                'verified' => true,
                'status' => 'approved',
                'location' => $location,
                'languages' => $languages,
                'phone' => $phone,
                'phone_raw' => '+' . $phoneClean,
                'whatsapp_url' => !empty($phoneClean) ? ('https://wa.me/' . $phoneClean) : '',
                'website' => $website && $website !== 'N/A' ? $website : '',
                'description' => $summary,
                'description_en' => $summary,
                'approved_at' => $rec['approved_at'] ?? ($rec['SubmittedAt'] ?? date('c'))
            ];
        }
    }
}

// 4. Merge Lists & Filter by Category if requested
$allEntries = array_merge($permanentEntities, $captainsList, $dynamicContractors);

$catFilter = isset($_GET['category']) ? strtoupper(trim($_GET['category'])) : 'ALL';
if ($catFilter !== 'ALL') {
    $allEntries = array_values(array_filter($allEntries, function($item) use ($catFilter) {
        if ($catFilter === 'GARDENING') {
            $cat = strtoupper($item['category'] ?? '');
            $name = strtoupper($item['name'] ?? '');
            $desc = strtoupper($item['description'] ?? '');
            return strpos($cat, 'GARDEN') !== false || strpos($cat, 'PLANT') !== false || strpos($name, 'JARDIN') !== false || strpos($desc, 'JARDIN') !== false;
        }
        return isset($item['category']) && $item['category'] === $catFilter;
    }));
}

// Filter out demo contractor entry if present
$allEntries = array_filter($allEntries, function($item) {
    return !(isset($item['id']) && $item['id'] === 'sub_6a80b63eeb847');
});
// Re-index array after filter
// Additional safety filter to remove any entry with the demo name
    $allEntries = array_filter($allEntries, function($item) {
        return !(isset($item['name']) && $item['name'] === 'Carlos Bocas Marine Mechanics');
    });
    $allEntries = array_values($allEntries);


echo json_encode([
    'success' => true,
    'count' => count($allEntries),
    'permanent_count' => count($permanentEntities),
    'approved_contractors_count' => count($dynamicContractors),
    'data' => $allEntries,
    'timestamp' => time()
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
