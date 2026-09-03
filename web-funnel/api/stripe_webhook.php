<?php
header('Content-Type: application/json');

$dataDir = '/home/finclazc/poquitotalk_data';
if (!is_dir($dataDir) || !is_writable($dataDir)) {
    $dataDir = __DIR__ . '/../data_private';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0750, true);
    }
}

$claimsFile = $dataDir . '/claims.json';
$webhookLogsFile = $dataDir . '/stripe_webhooks.json';

function loadJson($filePath) {
    if (!file_exists($filePath)) return [];
    $content = @file_get_contents($filePath);
    return json_decode($content, true) ?: [];
}

function saveJson($filePath, $data) {
    return @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

$payload = @file_get_contents('php://input');
$event = json_decode($payload, true);

if (!$event || !isset($event['type'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid webhook payload']);
    exit;
}

// Log incoming event for diagnostic history
$logs = loadJson($webhookLogsFile);
$logs[] = [
    'id' => $event['id'] ?? ('evt_' . time()),
    'type' => $event['type'],
    'created' => time(),
    'summary' => $event['data']['object']['id'] ?? 'unknown'
];
if (count($logs) > 100) $logs = array_slice($logs, -100);
saveJson($webhookLogsFile, $logs);

// Handle checkout.session.completed
if ($event['type'] === 'checkout.session.completed') {
    $session = $event['data']['object'];
    $sessionId = $session['id'] ?? '';
    $customerEmail = $session['customer_details']['email'] ?? $session['customer_email'] ?? '';
    $amountTotal = ($session['amount_total'] ?? 0) / 100;
    $metadata = $session['metadata'] ?? [];

    // Determine package type from metadata, line items or amount
    $packageType = $metadata['package_type'] ?? 'annual_pass';
    $credits = 999999;
    $isPro = true;
    $packageName = 'PoquitoTalk Annual Explorer Pass';

    if ($packageType === 'annual_pass' || abs($amountTotal - 39.99) < 0.1) {
        $packageType = 'annual_pass';
        $packageName = 'PoquitoTalk Annual Explorer Pass';
        $isPro = true;
        $credits = 999999;
    } elseif ($packageType === 'monthly_pass' || abs($amountTotal - 9.99) < 0.1) {
        $packageType = 'monthly_pass';
        $packageName = 'PoquitoTalk Monthly Resident Pass';
        $isPro = true;
        $credits = 999999;
    } elseif ($packageType === 'tourist_weekly' || ($packageType === 'travel_pass' && abs($amountTotal - 4.99) < 0.1)) {
        $packageType = 'tourist_weekly';
        $packageName = 'PoquitoTalk 7-Day Travel Pass';
        $isPro = false;
        $credits = 100;
    } elseif ($packageType === 'credits_50' || abs($amountTotal - 3.74) < 0.1 || abs($amountTotal - 4.99) < 0.1) {
        $packageType = 'credits_50';
        $packageName = '50 Poquito Credits Pack';
        $isPro = false;
        $credits = 50;
    }

    // Generate unique 1-time claim token
    $claimToken = 'pt_claim_' . bin2hex(random_bytes(16));

    $claims = loadJson($claimsFile);
    $claims[] = [
        'token' => $claimToken,
        'session_id' => $sessionId,
        'customer_email' => $customerEmail,
        'amount' => $amountTotal,
        'package_type' => $packageType,
        'package_name' => $packageName,
        'is_pro' => $isPro,
        'credits' => $credits,
        'status' => 'pending',
        'created_at' => time(),
        'expires_at' => time() + (86400 * 30), // 30 days expiry
        'redeemed_at' => null,
        'redeemed_by_device' => null
    ];
    saveJson($claimsFile, $claims);

    echo json_encode([
        'received' => true,
        'claim_token' => $claimToken,
        'status' => 'claim_created'
    ]);
    exit;
}

echo json_encode(['received' => true, 'status' => 'ignored']);
