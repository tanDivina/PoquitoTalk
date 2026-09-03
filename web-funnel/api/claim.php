<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = '/home/finclazc/poquitotalk_data';
if (!is_dir($dataDir) || !is_writable($dataDir)) {
    $dataDir = __DIR__ . '/../data_private';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0750, true);
    }
}

$claimsFile = $dataDir . '/claims.json';

function loadJson($filePath) {
    if (!file_exists($filePath)) return [];
    $content = @file_get_contents($filePath);
    return json_decode($content, true) ?: [];
}

function saveJson($filePath, $data) {
    return @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// 1. GET: Validate / Inspect a claim token
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $token = trim($_GET['token'] ?? '');
    $sessionId = trim($_GET['sid'] ?? $_GET['cs'] ?? $_GET['session'] ?? $_GET['session_id'] ?? '');

    if (empty($token) && empty($sessionId)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing token or session_id parameter.'
        ]);
        exit;
    }

    $claims = loadJson($claimsFile);

    // Find claim by token or checkout session_id
    $foundClaim = null;
    foreach ($claims as $c) {
        if (!empty($token) && ($c['token'] ?? '') === $token) {
            $foundClaim = $c;
            break;
        }
        if (!empty($sessionId) && ($c['session_id'] ?? '') === $sessionId) {
            $foundClaim = $c;
            break;
        }
    }

    if (!$foundClaim) {
        // Auto-provision claim token for live checkout session if not yet recorded by webhook
        if (!empty($sessionId)) {
            $claimToken = 'pt_claim_' . substr(hash('sha256', $sessionId . 'pt_salt_2026'), 0, 16);
            $foundClaim = [
                'token' => $claimToken,
                'session_id' => $sessionId,
                'customer_email' => '',
                'amount' => 4.99,
                'package_type' => 'travel_pass_7d',
                'package_name' => '7-Day Travel Pass',
                'is_pro' => true,
                'credits' => 50,
                'status' => 'pending',
                'created_at' => time(),
                'expires_at' => time() + (86400 * 30),
                'redeemed_at' => null,
                'redeemed_by_device' => null
            ];
            $claims[] = $foundClaim;
            saveJson($claimsFile, $claims);
        } else if (str_starts_with($token, 'pt_demo_') || str_starts_with($sessionId, 'cs_demo_')) {
            // Fallback demo/sandbox claim if token matches test format
            echo json_encode([
                'success' => true,
                'status' => 'pending',
                'token' => $token ?: 'pt_demo_pro_pass',
                'package_name' => '7-Day Travel Pass',
                'is_pro' => true,
                'credits' => 100,
                'customer_email' => 'demo@example.com',
                'is_demo' => true
            ]);
            exit;
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Claim token not found or expired.'
            ]);
            exit;
        }
    }

    echo json_encode([
        'success' => true,
        'token' => $foundClaim['token'],
        'status' => $foundClaim['status'] ?? 'pending',
        'package_type' => $foundClaim['package_type'] ?? 'pro_annual',
        'package_name' => $foundClaim['package_name'] ?? 'PoquitoTalk Pro',
        'is_pro' => $foundClaim['is_pro'] ?? true,
        'credits' => $foundClaim['credits'] ?? 50,
        'customer_email' => $foundClaim['customer_email'] ?? '',
        'created_at' => $foundClaim['created_at'] ?? time(),
        'redeemed_at' => $foundClaim['redeemed_at'] ?? null
    ]);
    exit;
}

// 2. POST: Redeem a claim token (called from Mobile App deep link)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $token = trim($input['token'] ?? '');
    $deviceId = trim($input['device_id'] ?? $input['app_user_id'] ?? 'unknown_device');

    if (empty($token)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing token parameter.'
        ]);
        exit;
    }

    $claims = loadJson($claimsFile);
    $foundIndex = -1;

    foreach ($claims as $idx => $c) {
        if (($c['token'] ?? '') === $token) {
            $foundIndex = $idx;
            break;
        }
    }

    if ($foundIndex === -1) {
        if (str_starts_with($token, 'pt_demo_')) {
            echo json_encode([
                'success' => true,
                'message' => 'Demo claim successfully redeemed!',
                'is_pro' => true,
                'credits' => 100,
                'token' => $token
            ]);
            exit;
        }

        echo json_encode([
            'success' => false,
            'message' => 'Claim token not found.'
        ]);
        exit;
    }

    if (($claims[$foundIndex]['status'] ?? '') === 'redeemed') {
        echo json_encode([
            'success' => true,
            'already_redeemed' => true,
            'message' => 'This claim has already been redeemed on this or another device.',
            'claim' => $claims[$foundIndex]
        ]);
        exit;
    }

    // Mark as redeemed
    $claims[$foundIndex]['status'] = 'redeemed';
    $claims[$foundIndex]['redeemed_at'] = time();
    $claims[$foundIndex]['redeemed_by_device'] = $deviceId;
    saveJson($claimsFile, $claims);

    echo json_encode([
        'success' => true,
        'message' => 'Claim successfully redeemed!',
        'claim' => $claims[$foundIndex]
    ]);
    exit;
}
