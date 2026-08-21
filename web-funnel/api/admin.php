<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Master Admin Access Passphrase
$ADMIN_SECRET = 'poquito2026!bocas';

// Check Auth Header or Parameter
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['HTTP_X_ADMIN_KEY'] ?? '');
$providedKey = '';

if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $providedKey = trim($matches[1]);
} elseif (!empty($_SERVER['HTTP_X_ADMIN_KEY'])) {
    $providedKey = trim($_SERVER['HTTP_X_ADMIN_KEY']);
} elseif (isset($_GET['key'])) {
    $providedKey = trim($_GET['key']);
} elseif (isset($_POST['key'])) {
    $providedKey = trim($_POST['key']);
}

if ($providedKey !== $ADMIN_SECRET) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized: Invalid Admin Secret Key']);
    exit;
}

// Locate Data Storage Directory
$dataDir = '/home/finclazc/poquitotalk_data';
if (!is_dir($dataDir) || !is_writable($dataDir)) {
    $dataDir = __DIR__ . '/../data_private';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0750, true);
    }
}

$contractorsFile = $dataDir . '/contractors.json';
$waitlistFile = $dataDir . '/waitlist.json';
$referralsFile = $dataDir . '/referrals.json';

// Helper to Load / Save JSON
function loadJson($filePath) {
    if (!file_exists($filePath)) return [];
    $content = @file_get_contents($filePath);
    return json_decode($content, true) ?: [];
}

function saveJson($filePath, $data) {
    return @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// -------------------------------------------------------------
// GET: Fetch Admin Summary & Categorized Records
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $contractors = loadJson($contractorsFile);
    $waitlist = loadJson($waitlistFile);
    $referrals = loadJson($referralsFile);

    $pending = [];
    $approved = [];
    $rejected = [];

    foreach ($contractors as $c) {
        $normalized = [
            'id' => $c['id'] ?? uniqid('contractor_'),
            'type' => 'contractor',
            'BusinessName' => $c['BusinessName'] ?? ($c['payload']['BusinessName'] ?? ($c['name'] ?? 'Local Contractor')),
            'TradeCategory' => $c['TradeCategory'] ?? ($c['payload']['TradeCategory'] ?? ($c['category'] ?? 'General Trade')),
            'PrimaryLocation' => $c['PrimaryLocation'] ?? ($c['payload']['PrimaryLocation'] ?? ($c['location'] ?? 'Bocas Town')),
            'LanguagesSpoken' => $c['LanguagesSpoken'] ?? ($c['payload']['LanguagesSpoken'] ?? ($c['languages'] ?? 'Español')),
            'WhatsAppPhone' => $c['WhatsAppPhone'] ?? ($c['payload']['WhatsAppPhone'] ?? ($c['phone'] ?? '')),
            'Email' => $c['Email'] ?? ($c['payload']['Email'] ?? ($c['email'] ?? 'N/A')),
            'Website' => $c['Website'] ?? ($c['website'] ?? ($c['payload']['Website'] ?? ($c['payload']['website'] ?? ''))),
            'website' => $c['Website'] ?? ($c['website'] ?? ($c['payload']['Website'] ?? ($c['payload']['website'] ?? ''))),
            'ServiceSummary' => $c['ServiceSummary'] ?? ($c['payload']['ServiceSummary'] ?? ($c['notes'] ?? '')),
            'status' => strtolower($c['status'] ?? 'pending'),
            'verified' => isset($c['verified']) ? (bool)$c['verified'] : false,
            'rating' => $c['rating'] ?? 5.0,
            'SubmittedAt' => $c['SubmittedAt'] ?? ($c['payload']['SubmittedAt'] ?? ($c['registeredAt'] ?? date('c'))),
            'approved_at' => $c['approved_at'] ?? null,
            'rejected_at' => $c['rejected_at'] ?? null,
        ];

        $status = $normalized['status'];
        if ($status === 'approved') {
            $approved[] = $normalized;
        } elseif ($status === 'rejected') {
            $rejected[] = $normalized;
        } else {
            $pending[] = $normalized;
        }
    }

    $totalInvitesSent = 0;
    $totalNeighborsJoined = 0;
    foreach ($referrals as $r) {
        if (($r['status'] ?? '') === 'joined') {
            $totalNeighborsJoined++;
        } else {
            $totalInvitesSent++;
        }
    }

    $dailyStats = loadJson($dataDir . '/analytics_daily.json');
    $analyticsEvents = loadJson($dataDir . '/analytics_events.json');

    $totalPageviews = 0;
    $uniqueVisitorsSet = [];
    foreach ($analyticsEvents as $ev) {
        if (($ev['event'] ?? '') === 'pageview') $totalPageviews++;
        if (!empty($ev['visitor_id'])) $uniqueVisitorsSet[$ev['visitor_id']] = true;
    }

    $todayStr = date('Y-m-d');
    $todayStats = $dailyStats[$todayStr] ?? null;
    $todayViews = $todayStats['pageviews'] ?? 0;
    $todayVisitors = $todayStats['unique_visitor_count'] ?? count($todayStats['unique_visitors'] ?? []);

    echo json_encode([
        'success' => true,
        'stats' => [
            'total_contractors' => count($contractors),
            'pending_count' => count($pending),
            'approved_count' => count($approved),
            'rejected_count' => count($rejected),
            'playstore_waitlist_count' => count($waitlist),
            'referrals_sent_count' => $totalInvitesSent,
            'referrals_joined_count' => $totalNeighborsJoined,
            'credits_awarded_count' => $totalNeighborsJoined * 5,
            'total_pageviews' => $totalPageviews,
            'unique_visitors' => count($uniqueVisitorsSet),
            'today_pageviews' => $todayViews,
            'today_visitors' => $todayVisitors
        ],
        'pending' => $pending,
        'approved' => $approved,
        'rejected' => $rejected,
        'waitlist' => $waitlist,
        'referrals' => array_reverse($referrals),
        'timestamp' => time()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// POST: Execute 1-Click Action (Approve, Reject, Delete, Reset)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: $_POST;

    $action = strtolower(trim($input['action'] ?? ''));
    $contractorId = trim($input['id'] ?? '');

    if (empty($action) || empty($contractorId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing action or contractor id']);
        exit;
    }

    $contractors = loadJson($contractorsFile);
    $foundIndex = -1;

    foreach ($contractors as $i => $c) {
        if (($c['id'] ?? '') === $contractorId || ($c['WhatsAppPhone'] ?? '') === $contractorId) {
            $foundIndex = $i;
            break;
        }
    }

    if ($foundIndex === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Contractor record not found']);
        exit;
    }

    $target = &$contractors[$foundIndex];

    if ($action === 'approve') {
        $target['status'] = 'approved';
        $target['verified'] = true;
        $target['approved_at'] = date('c');
        $target['updated_at'] = date('c');
        saveJson($contractorsFile, $contractors);

        echo json_encode([
            'success' => true,
            'message' => 'Contractor successfully approved and published to Directory!',
            'contractor' => $target
        ]);
        exit;
    }

    if ($action === 'reject') {
        $target['status'] = 'rejected';
        $target['verified'] = false;
        $target['rejected_at'] = date('c');
        $target['updated_at'] = date('c');
        saveJson($contractorsFile, $contractors);

        echo json_encode([
            'success' => true,
            'message' => 'Contractor marked as rejected.',
            'contractor' => $target
        ]);
        exit;
    }

    if ($action === 'pending' || $action === 'reset') {
        $target['status'] = 'pending';
        $target['verified'] = false;
        $target['updated_at'] = date('c');
        saveJson($contractorsFile, $contractors);

        echo json_encode([
            'success' => true,
            'message' => 'Contractor restored to pending queue.',
            'contractor' => $target
        ]);
        exit;
    }

    if ($action === 'update') {
        if (isset($input['BusinessName'])) $target['BusinessName'] = trim($input['BusinessName']);
        if (isset($input['TradeCategory'])) $target['TradeCategory'] = trim($input['TradeCategory']);
        if (isset($input['PrimaryLocation'])) $target['PrimaryLocation'] = trim($input['PrimaryLocation']);
        if (isset($input['LanguagesSpoken'])) $target['LanguagesSpoken'] = trim($input['LanguagesSpoken']);
        if (isset($input['WhatsAppPhone'])) {
            $phone = trim($input['WhatsAppPhone']);
            // Auto normalize Panama phone if missing country code
            $digits = preg_replace('/[^0-9]/', '', $phone);
            if (strlen($digits) === 8 && ($digits[0] === '6' || $digits[0] === '7' || $digits[0] === '8')) {
                $target['WhatsAppPhone'] = '+507 ' . substr($digits, 0, 4) . '-' . substr($digits, 4);
            } elseif (strlen($digits) === 11 && substr($digits, 0, 3) === '507') {
                $local = substr($digits, 3);
                $target['WhatsAppPhone'] = '+507 ' . substr($local, 0, 4) . '-' . substr($local, 4);
            } else {
                $target['WhatsAppPhone'] = $phone;
            }
        }
        if (isset($input['Email'])) $target['Email'] = trim($input['Email']);
        if (isset($input['Website']) || isset($input['website'])) {
            $webVal = trim($input['Website'] ?? ($input['website'] ?? ''));
            $target['Website'] = $webVal;
            $target['website'] = $webVal;
        }
        if (isset($input['ServiceSummary'])) $target['ServiceSummary'] = trim($input['ServiceSummary']);
        if (isset($input['status'])) $target['status'] = strtolower(trim($input['status']));
        if (isset($input['verified'])) $target['verified'] = (bool)$input['verified'];
        
        $target['updated_at'] = date('c');
        saveJson($contractorsFile, $contractors);

        echo json_encode([
            'success' => true,
            'message' => 'Contractor details successfully updated!',
            'contractor' => $target
        ]);
        exit;
    }

    if ($action === 'delete') {
        array_splice($contractors, $foundIndex, 1);
        saveJson($contractorsFile, $contractors);

        echo json_encode([
            'success' => true,
            'message' => 'Contractor record permanently deleted.'
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Unsupported action. Use: approve, reject, reset, delete']);
    exit;
}
