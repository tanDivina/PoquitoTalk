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

$referralsFile = $dataDir . '/referrals.json';

function loadJson($filePath) {
    if (!file_exists($filePath)) return [];
    $content = @file_get_contents($filePath);
    return json_decode($content, true) ?: [];
}

function saveJson($filePath, $data) {
    return @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// GET: Query referral stats for a specific referrer code or user ID
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $refCode = trim($_GET['ref'] ?? '');
    $referrals = loadJson($referralsFile);

    if (empty($refCode)) {
        echo json_encode([
            'success' => true,
            'total_events' => count($referrals),
            'referrals' => $referrals
        ]);
        exit;
    }

    $userEvents = array_filter($referrals, function($r) use ($refCode) {
        return ($r['referrer_code'] ?? '') === $refCode || ($r['referrer_uid'] ?? '') === $refCode;
    });

    $joinedCount = 0;
    foreach ($userEvents as $ev) {
        if (($ev['status'] ?? '') === 'joined') {
            $joinedCount++;
        }
    }

    echo json_encode([
        'success' => true,
        'referrer' => $refCode,
        'invites_sent' => count($userEvents),
        'neighbors_joined' => $joinedCount,
        'bonus_credits_earned' => $joinedCount * 5,
        'events' => array_values($userEvents)
    ]);
    exit;
}

// POST: Record Invite Created or Referral Claimed
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: $_POST;

    $action = strtolower(trim($input['action'] ?? 'track_invite'));
    $referrerCode = trim($input['referrer_code'] ?? ($input['ref'] ?? 'guest_general'));
    $referrerUid = trim($input['referrer_uid'] ?? 'usr_guest_bocas');
    $channel = trim($input['channel'] ?? 'whatsapp');
    $neighborUid = trim($input['neighbor_uid'] ?? '');

    $referrals = loadJson($referralsFile);

    if ($action === 'claim_referral') {
        if (empty($neighborUid)) {
            $neighborUid = 'usr_guest_' . substr(md5(uniqid()), 0, 8);
        }

        // Anti-abuse: check if this neighbor already claimed
        foreach ($referrals as $r) {
            if (($r['neighbor_uid'] ?? '') === $neighborUid && ($r['status'] ?? '') === 'joined') {
                echo json_encode([
                    'success' => true,
                    'already_claimed' => true,
                    'message' => 'Neighbor bonus already claimed on this device.',
                    'credits_awarded' => 0
                ]);
                exit;
            }
        }

        $record = [
            'id' => 'ref_join_' . time() . '_' . substr(md5(uniqid()), 0, 6),
            'action' => 'neighbor_join',
            'status' => 'joined',
            'referrer_code' => $referrerCode,
            'referrer_uid' => $referrerUid,
            'neighbor_uid' => $neighborUid,
            'bonus_credits' => 5,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 120),
            'timestamp' => time(),
            'date_formatted' => date('c')
        ];

        $referrals[] = $record;
        saveJson($referralsFile, $referrals);

        echo json_encode([
            'success' => true,
            'message' => '🎉 Referral validated! +5 Free Voice Notes awarded.',
            'credits_awarded' => 5,
            'record' => $record
        ]);
        exit;
    }

    // Default: track share click
    $record = [
        'id' => 'ref_share_' . time() . '_' . substr(md5(uniqid()), 0, 6),
        'action' => 'invite_sent',
        'status' => 'pending',
        'referrer_code' => $referrerCode,
        'referrer_uid' => $referrerUid,
        'channel' => $channel,
        'bonus_credits' => 0,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
        'timestamp' => time(),
        'date_formatted' => date('c')
    ];

    $referrals[] = $record;
    saveJson($referralsFile, $referrals);

    echo json_encode([
        'success' => true,
        'message' => 'Invite share tracked.',
        'record' => $record
    ]);
    exit;
}
