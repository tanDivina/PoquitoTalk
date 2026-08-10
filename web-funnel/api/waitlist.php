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

// Check for existing duplicates if email provided
if (!empty($email)) {
    foreach ($records as $record) {
        if (isset($record['email']) && strtolower($record['email']) === strtolower($email)) {
            echo json_encode(['success' => true, 'message' => 'Already registered', 'status' => 'duplicate']);
            exit;
        }
    }
}

$entry = [
    'id' => uniqid('sub_'),
    'type' => $type,
    'email' => $email,
    'language' => $language,
    'payload' => $data,
    'notified' => false,
    'registeredAt' => date('c'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'
];

array_unshift($records, $entry);

file_put_contents($dataFile, json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'success' => true,
    'message' => 'Registration saved successfully',
    'id' => $entry['id'],
    'total_subscribers' => count($records)
]);
