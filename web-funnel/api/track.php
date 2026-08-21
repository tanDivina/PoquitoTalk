<?php
/**
 * PoquitoTalk Telemetry Ingestion Endpoint (api/track.php)
 * High-performance, privacy-respecting visitor and interaction event tracker.
 */

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
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

// Receive payload from beacon or fetch
$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

if (!$payload || !is_array($payload)) {
    // Attempt fallback to $_POST
    $payload = $_POST;
}

if (empty($payload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Empty tracking payload']);
    exit;
}

$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

// Bot detection - ignore automated web crawlers for authentic metrics
function isBot($ua) {
    if (empty($ua)) return false;
    $botPatterns = [
        'bot', 'crawl', 'spider', 'slurp', 'googlebot', 'bingbot', 'yandex',
        'baiduspider', 'ahrefs', 'semrush', 'petalbot', 'bytespider', 'claudebot',
        'gptbot', 'chatgpt', 'curl', 'wget', 'python-requests', 'headlesschrome',
        'lighthouse', 'pagepeed', 'feedly', 'mediapartners-google', 'facebookexternalhit'
    ];
    $uaLower = strtolower($ua);
    foreach ($botPatterns as $pat) {
        if (strpos($uaLower, $pat) !== false) {
            return true;
        }
    }
    return false;
}

if (isBot($userAgent)) {
    // Return early 200 without contaminating real user metrics
    echo json_encode(['success' => true, 'filtered' => 'bot']);
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

$eventsFile = $dataDir . '/analytics_events.json';
$dailyFile = $dataDir . '/analytics_daily.json';
$summaryFile = $dataDir . '/analytics_summary.json';

// Detect IP & Hash for privacy
$clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? 
            ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? 
            ($_SERVER['HTTP_X_REAL_IP'] ?? 
            ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1')));

if (strpos($clientIp, ',') !== false) {
    $clientIp = trim(explode(',', $clientIp)[0]);
}

$ipSalt = 'poquito_visitor_salt_2026';
$hashedIp = substr(hash('sha256', $clientIp . $ipSalt . date('Y-m-d')), 0, 16);

// Extract Country (Cloudflare header or fallback)
$country = $_SERVER['HTTP_CF_IPCOUNTRY'] ?? ($_SERVER['HTTP_X_COUNTRY_CODE'] ?? 'PA');
if (empty($country) || $country === 'XX' || $country === 'T1') {
    $country = 'PA';
}

// Parse OS and Browser
function parseUserAgentDetails($ua) {
    $os = 'Unknown OS';
    $browser = 'Unknown Browser';
    $device = 'desktop';

    // OS detection
    if (preg_match('/iPhone|iPad|iPod/i', $ua)) {
        $os = 'iOS';
        $device = preg_match('/iPad/i', $ua) ? 'tablet' : 'mobile';
    } elseif (preg_match('/Android/i', $ua)) {
        $os = 'Android';
        $device = preg_match('/Mobile/i', $ua) ? 'mobile' : 'tablet';
    } elseif (preg_match('/Macintosh|Mac OS X/i', $ua)) {
        $os = 'macOS';
        $device = 'desktop';
    } elseif (preg_match('/Windows NT/i', $ua)) {
        $os = 'Windows';
        $device = 'desktop';
    } elseif (preg_match('/Linux/i', $ua)) {
        $os = 'Linux';
        $device = 'desktop';
    }

    // Browser detection
    if (preg_match('/Edg/i', $ua)) {
        $browser = 'Edge';
    } elseif (preg_match('/Chrome/i', $ua) && !preg_match('/Edg/i', $ua)) {
        $browser = 'Chrome';
    } elseif (preg_match('/Safari/i', $ua) && !preg_match('/Chrome/i', $ua)) {
        $browser = 'Safari';
    } elseif (preg_match('/Firefox/i', $ua)) {
        $browser = 'Firefox';
    } elseif (preg_match('/Opera|OPR/i', $ua)) {
        $browser = 'Opera';
    }

    return ['os' => $os, 'browser' => $browser, 'device' => $device];
}

$uaDetails = parseUserAgentDetails($userAgent);

// Normalize event fields
$eventName = strtolower(trim($payload['event'] ?? 'pageview'));
$visitorId = trim($payload['visitor_id'] ?? ('v_' . substr($hashedIp, 0, 8)));
$sessionId = trim($payload['session_id'] ?? ('s_' . substr(md5(uniqid()), 0, 8)));
$path = trim($payload['path'] ?? '/');
$title = trim($payload['title'] ?? '');
$referrer = trim($payload['referrer'] ?? '');
$source = trim($payload['source'] ?? ($payload['referrer_category'] ?? 'Direct'));
$utmSource = trim($payload['utm_source'] ?? '');
$utmMedium = trim($payload['utm_medium'] ?? '');
$utmCampaign = trim($payload['utm_campaign'] ?? '');
$language = trim($payload['language'] ?? 'en');
$device = trim($payload['device'] ?? $uaDetails['device']);
$eventData = isset($payload['data']) && is_array($payload['data']) ? $payload['data'] : [];
$timestamp = isset($payload['timestamp']) ? intval($payload['timestamp']) : (time() * 1000);
$dateStr = date('Y-m-d');
$hourStr = date('H');

$eventRecord = [
    'id' => 'ev_' . substr(md5(uniqid(rand(), true)), 0, 10),
    'event' => $eventName,
    'visitor_id' => $visitorId,
    'session_id' => $sessionId,
    'ip_hash' => $hashedIp,
    'path' => $path,
    'title' => $title,
    'referrer' => $referrer,
    'source' => $source,
    'utm_source' => $utmSource,
    'utm_medium' => $utmMedium,
    'utm_campaign' => $utmCampaign,
    'country' => $country,
    'device' => $device,
    'os' => $uaDetails['os'],
    'browser' => $uaDetails['browser'],
    'language' => $language,
    'data' => $eventData,
    'timestamp' => $timestamp,
    'datetime' => date('Y-m-d H:i:s T')
];

// 1. Update Events Rolling Buffer (Last 10,000 items)
$events = [];
if (file_exists($eventsFile)) {
    $eventsContent = @file_get_contents($eventsFile);
    $events = json_decode($eventsContent, true) ?: [];
}
$events[] = $eventRecord;
if (count($events) > 10000) {
    $events = array_slice($events, -10000);
}
@file_put_contents($eventsFile, json_encode($events, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);

// 2. Update Aggregated Daily Stats
$dailyStats = [];
if (file_exists($dailyFile)) {
    $dailyContent = @file_get_contents($dailyFile);
    $dailyStats = json_decode($dailyContent, true) ?: [];
}

if (!isset($dailyStats[$dateStr])) {
    $dailyStats[$dateStr] = [
        'date' => $dateStr,
        'pageviews' => 0,
        'unique_visitors' => [],
        'unique_visitor_count' => 0,
        'events' => [],
        'pages' => [],
        'sources' => [],
        'devices' => [],
        'countries' => [],
        'hourly' => array_fill(0, 24, 0)
    ];
}

$today = &$dailyStats[$dateStr];

if ($eventName === 'pageview') {
    $today['pageviews'] = ($today['pageviews'] ?? 0) + 1;
    $h = intval($hourStr);
    if (isset($today['hourly'][$h])) {
        $today['hourly'][$h]++;
    }
}

// Track Unique Visitors per day
if (!isset($today['unique_visitors']) || !is_array($today['unique_visitors'])) {
    $today['unique_visitors'] = [];
}
if (!in_array($visitorId, $today['unique_visitors'])) {
    $today['unique_visitors'][] = $visitorId;
    $today['unique_visitor_count'] = count($today['unique_visitors']);
}

// Increment Event Counts
$today['events'][$eventName] = ($today['events'][$eventName] ?? 0) + 1;

// Increment Page Counts
$cleanPath = empty($path) ? '/' : $path;
$today['pages'][$cleanPath] = ($today['pages'][$cleanPath] ?? 0) + 1;

// Increment Source Counts
$cleanSource = empty($source) ? 'Direct' : $source;
$today['sources'][$cleanSource] = ($today['sources'][$cleanSource] ?? 0) + 1;

// Increment Device Counts
$today['devices'][$device] = ($today['devices'][$device] ?? 0) + 1;

// Increment Country Counts
$today['countries'][$country] = ($today['countries'][$country] ?? 0) + 1;

@file_put_contents($dailyFile, json_encode($dailyStats, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);

// 3. Update Global Summary
$summary = [
    'last_updated' => date('Y-m-d H:i:s T'),
    'total_events' => count($events),
    'today_pageviews' => $today['pageviews'] ?? 0,
    'today_unique_visitors' => $today['unique_visitor_count'] ?? 0,
    'latest_event' => $eventRecord
];
@file_put_contents($summaryFile, json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);

echo json_encode([
    'success' => true,
    'event' => $eventName,
    'visitor_id' => $visitorId,
    'timestamp' => $timestamp
]);
