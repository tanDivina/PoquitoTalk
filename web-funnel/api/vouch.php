<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/../data/vouches.json';

function getVouchesData($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    $json = file_get_contents($filePath);
    return json_decode($json, true) ?: [];
}

// 1. GET: Return vouch statistics
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = getVouchesData($dataFile);
    $providerId = isset($_GET['provider_id']) ? trim($_GET['provider_id']) : null;

    if ($providerId) {
        $result = isset($data[$providerId]) ? $data[$providerId] : ['count' => 0, 'reasons' => ['fast_response' => 0, 'fair_price' => 0, 'great_service' => 0]];
        echo json_encode(['success' => true, 'provider_id' => $providerId, 'data' => $result]);
    } else {
        echo json_encode(['success' => true, 'count' => count($data), 'data' => $data]);
    }
    exit;
}

// 2. POST: Increment vouch for provider
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['providerId'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing providerId parameter']);
        exit;
    }

    $providerId = preg_replace('/[^a-zA-Z0-9_-]/', '', $input['providerId']);
    $reason = isset($input['reason']) ? preg_replace('/[^a-zA-Z0-9_]/', '', $input['reason']) : 'great_service';
    if (!in_array($reason, ['fast_response', 'fair_price', 'great_service'])) {
        $reason = 'great_service';
    }

    // Thread-safe file update with exclusive lock
    $fp = fopen($dataFile, 'c+');
    if (!$fp) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Cannot open database']);
        exit;
    }

    if (flock($fp, LOCK_EX)) {
        $filesize = filesize($dataFile);
        $contents = $filesize > 0 ? fread($fp, $filesize) : '{}';
        $data = json_decode($contents, true) ?: [];

        if (!isset($data[$providerId])) {
            $data[$providerId] = [
                'count' => 0,
                'reasons' => ['fast_response' => 0, 'fair_price' => 0, 'great_service' => 0]
            ];
        }

        $data[$providerId]['count'] += 1;
        if (!isset($data[$providerId]['reasons'][$reason])) {
            $data[$providerId]['reasons'][$reason] = 0;
        }
        $data[$providerId]['reasons'][$reason] += 1;
        $data[$providerId]['last_vouched_at'] = date('c');

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        echo json_encode([
            'success' => true,
            'provider_id' => $providerId,
            'new_count' => $data[$providerId]['count'],
            'reasons' => $data[$providerId]['reasons'],
            'message' => 'Community vouch successfully recorded'
        ]);
    } else {
        fclose($fp);
        http_response_code(503);
        echo json_encode(['success' => false, 'error' => 'Database locked']);
    }
    exit;
}
