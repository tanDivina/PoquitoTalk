<?php
header('Content-Type: application/json');

$SECRET_KEY = 'poquitotalk_hero_apps_waitlist_2026';

$providedKey = $_GET['key'] ?? $_POST['key'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
$providedKey = str_replace('Bearer ', '', $providedKey);

if ($providedKey !== $SECRET_KEY) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$dataDir = '/home/finclazc/poquitotalk_data';
if (!is_dir($dataDir)) {
    $dataDir = __DIR__ . '/../data_private';
}

$type = $_GET['type'] ?? 'waitlist';
$dataFile = ($type === 'contractor') ? $dataDir . '/contractors.json' : $dataDir . '/waitlist.json';

if (!file_exists($dataFile)) {
    echo json_encode(['success' => true, 'total' => 0, 'data' => []]);
    exit;
}

$records = json_decode(file_get_contents($dataFile), true) ?: [];

// Optional action to mark emails as notified
if (isset($_GET['mark_notified']) && $_GET['mark_notified'] === 'true') {
    $notifiedIds = json_decode(file_get_contents('php://input'), true)['ids'] ?? [];
    if (!empty($notifiedIds)) {
        foreach ($records as &$record) {
            if (in_array($record['id'], $notifiedIds)) {
                $record['notified'] = true;
                $record['notifiedAt'] = date('c');
            }
        }
        file_put_contents($dataFile, json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}

echo json_encode([
    'success' => true,
    'total' => count($records),
    'unnotified_count' => count(array_filter($records, fn($r) => !($r['notified'] ?? false))),
    'data' => $records
]);
