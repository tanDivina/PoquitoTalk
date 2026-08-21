<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
    exit;
}

$type = isset($data['Type']) ? trim($data['Type']) : (isset($data['type']) ? trim($data['type']) : 'playstore');
$email = isset($data['Email']) ? trim($data['Email']) : (isset($data['email']) ? trim($data['email']) : '');
$language = isset($data['Language']) ? trim($data['Language']) : 'en-US';

if ($type === 'playstore' && (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Valid email address required']);
    exit;
}

// Private directory location above public_html on Namecheap cPanel
$dataDir = '/home/finclazc/poquitotalk_data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0750, true);
}

// Fallback to local directory if parent dir is not writable
if (!is_dir($dataDir) || !is_writable($dataDir)) {
    $dataDir = __DIR__ . '/../data_private';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0750, true);
    }
}

$dataFile = ($type === 'contractor') ? $dataDir . '/contractors.json' : $dataDir . '/waitlist.json';

$records = [];
if (file_exists($dataFile)) {
    $content = file_get_contents($dataFile);
    $records = json_decode($content, true) ?: [];
}

if ($type === 'contractor') {
    $phone = isset($data['WhatsAppPhone']) ? trim($data['WhatsAppPhone']) : (isset($data['phone']) ? trim($data['phone']) : '');
    
    // Auto-normalize Panama phone number if country code is omitted
    $digits = preg_replace('/[^0-9]/', '', $phone);
    if (strlen($digits) === 8 && ($digits[0] === '6' || $digits[0] === '7' || $digits[0] === '8')) {
        $phone = '+507 ' . substr($digits, 0, 4) . '-' . substr($digits, 4);
    } elseif (strlen($digits) === 11 && substr($digits, 0, 3) === '507') {
        $local = substr($digits, 3);
        $phone = '+507 ' . substr($local, 0, 4) . '-' . substr($local, 4);
    }
    
    // Check for duplicate phone number
    if (!empty($phone)) {
        foreach ($records as $record) {
            $recPhone = $record['WhatsAppPhone'] ?? ($record['phone'] ?? '');
            $recDigits = preg_replace('/[^0-9]/', '', $recPhone);
            if (!empty($digits) && $recDigits === $digits) {
                echo json_encode(['success' => true, 'message' => 'Contractor already registered with this phone number', 'status' => 'duplicate', 'id' => $record['id'] ?? '']);
                exit;
            }
        }
    }

    $website = trim($data['Website'] ?? ($data['website'] ?? ($data['url'] ?? '')));

    $entry = [
        'id' => 'contractor_' . substr(md5(uniqid(rand(), true)), 0, 8),
        'type' => 'contractor',
        'BusinessName' => trim($data['BusinessName'] ?? ($data['name'] ?? 'Local Contractor')),
        'TradeCategory' => trim($data['TradeCategory'] ?? ($data['category'] ?? 'CONTRACTORS')),
        'PrimaryLocation' => trim($data['PrimaryLocation'] ?? ($data['location'] ?? 'Bocas Town')),
        'LanguagesSpoken' => trim($data['LanguagesSpoken'] ?? ($data['languages'] ?? 'Español')),
        'WhatsAppPhone' => $phone,
        'Email' => $email ?: 'N/A',
        'Website' => $website ?: 'N/A',
        'website' => $website ?: '',
        'ServiceSummary' => trim($data['ServiceSummary'] ?? ($data['notes'] ?? '')),
        'status' => 'pending',
        'verified' => false,
        'rating' => 5.0,
        'SubmittedAt' => date('Y-m-d H:i:s T'),
        'created_at' => date('c'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'
    ];
} else {
    $entry = [
        'id' => uniqid('waitlist_'),
        'type' => $type,
        'email' => $email,
        'language' => $language,
        'payload' => $data,
        'notified' => false,
        'registeredAt' => date('c'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'
    ];
}

array_unshift($records, $entry);

file_put_contents($dataFile, json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'success' => true,
    'message' => 'Registration saved successfully',
    'id' => $entry['id'],
    'status' => $entry['status'] ?? 'registered',
    'total_records' => count($records)
]);
