<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$roomsDir = __DIR__ . '/data/rooms';
if (!is_dir($roomsDir)) {
    @mkdir($roomsDir, 0777, true);
}

$rawInput = file_get_contents('php://input');
$jsonData = json_decode($rawInput, true) ?? [];
$action = trim($_GET['action'] ?? $_POST['action'] ?? $jsonData['action'] ?? 'poll');

$roomId = trim($_GET['r'] ?? $_GET['room'] ?? $_POST['r'] ?? $_POST['room'] ?? $jsonData['roomId'] ?? $jsonData['room'] ?? '');
if (empty($roomId)) {
    echo json_encode(['success' => false, 'error' => 'No room specified']);
    exit;
}

// Clean roomId to safe alphanumeric and underscores
$cleanRoom = preg_replace('/[^a-zA-Z0-9_-]/', '', $roomId);
$roomFile = $roomsDir . '/' . $cleanRoom . '.json';

if ($action === 'send') {
    $sender = trim($_POST['sender'] ?? $jsonData['sender'] ?? 'contractor');
    $senderName = trim($_POST['senderName'] ?? $jsonData['senderName'] ?? '');
    $esText = trim($_POST['esText'] ?? $jsonData['esText'] ?? '');
    $enText = trim($_POST['enText'] ?? $jsonData['enText'] ?? '');
    $audioData = trim($_POST['audioData'] ?? $jsonData['audioData'] ?? '');
    $timestamp = intval($_POST['timestamp'] ?? $jsonData['timestamp'] ?? (time() * 1000));
    $msgId = trim($_POST['id'] ?? $jsonData['id'] ?? ('msg_' . $timestamp));

    if (empty($esText) && empty($enText) && empty($audioData)) {
        echo json_encode(['success' => false, 'error' => 'Message has no content']);
        exit;
    }

    // Auto-translate Spanish contractor reply to English if enText is not supplied
    if (empty($enText) && !empty($esText)) {
        $encoded = urlencode($esText);
        $gtUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q={$encoded}";
        $ch = curl_init($gtUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $gtRes = curl_exec($ch);
        curl_close($ch);

        if ($gtRes) {
            $gtData = json_decode($gtRes, true);
            if (isset($gtData[0]) && is_array($gtData[0])) {
                $t = '';
                foreach ($gtData[0] as $p) {
                    if (isset($p[0]) && is_string($p[0])) $t .= $p[0];
                }
                if (!empty($t)) $enText = $t;
            }
        }

        // Secondary Fallback if Google GTX fails
        if (empty($enText)) {
            $mmUrl = "https://api.mymemory.translated.net/get?q={$encoded}&langpair=es|en";
            $ch = curl_init($mmUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERAGENT, 'PoquitoTalk/1.0');
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
            $mmRes = curl_exec($ch);
            curl_close($ch);
            if ($mmRes) {
                $mmData = json_decode($mmRes, true);
                if (!empty($mmData['responseData']['translatedText'])) {
                    $enText = $mmData['responseData']['translatedText'];
                }
            }
        }

        // Polish English translation for Panamanian colloquialisms & greetings (e.g. "Buenas amigo" -> "Hello friend")
        if (!empty($enText)) {
            $enText = polishPanamaSpanishToEnglish($enText, $esText);
        }
    }

    $audioUrl = '';
    if (!empty($audioData) && strpos($audioData, 'base64,') !== false) {
        $voiceNotesDir = __DIR__ . '/../audio/voice_notes';
        if (!is_dir($voiceNotesDir)) {
            @mkdir($voiceNotesDir, 0777, true);
        }
        $parts = explode('base64,', $audioData);
        $b64 = end($parts);
        $bin = base64_decode($b64);
        if ($bin !== false && strlen($bin) > 0) {
            $ext = 'mp3';
            if (strpos($audioData, 'audio/webm') !== false) $ext = 'webm';
            else if (strpos($audioData, 'audio/mp4') !== false) $ext = 'm4a';
            else if (strpos($audioData, 'audio/ogg') !== false) $ext = 'ogg';
            
            $filename = 'wk_' . $cleanRoom . '_' . time() . '_' . substr(bin2hex(random_bytes(3)), 0, 4) . '.' . $ext;
            @file_put_contents($voiceNotesDir . '/' . $filename, $bin);
            $audioUrl = 'https://poquitotalk.hero-apps.com/audio/voice_notes/' . $filename;
        }
    }

    $existing = [];
    if (file_exists($roomFile)) {
        $existing = json_decode(file_get_contents($roomFile), true) ?? [];
    }

    // Check if message ID already exists
    $foundIndex = -1;
    foreach ($existing as $idx => $m) {
        if (isset($m['id']) && $m['id'] === $msgId) {
            $foundIndex = $idx;
            break;
        }
    }

    $newMsg = [
        'id' => $msgId,
        'roomId' => $cleanRoom,
        'sender' => $sender,
        'senderName' => $senderName,
        'esText' => $esText,
        'enText' => $enText,
        'audioData' => $audioData,
        'audioUrl' => $audioUrl,
        'timestamp' => $timestamp,
        'time' => date('g:i A')
    ];

    if ($foundIndex >= 0) {
        $existing[$foundIndex] = $newMsg;
    } else {
        $existing[] = $newMsg;
    }

    // Keep max last 50 messages per room
    if (count($existing) > 50) {
        $existing = array_slice($existing, -50);
    }

    file_put_contents($roomFile, json_encode($existing, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    echo json_encode([
        'success' => true,
        'message' => $newMsg,
        'total' => count($existing)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Default action: poll / get
$since = intval($_GET['since'] ?? 0);
$allMessages = [];
if (file_exists($roomFile)) {
    $allMessages = json_decode(file_get_contents($roomFile), true) ?? [];
}

if ($since > 0) {
    $filtered = array_filter($allMessages, function($m) use ($since) {
        return isset($m['timestamp']) && $m['timestamp'] > $since;
    });
    $allMessages = array_values($filtered);
}

echo json_encode([
    'success' => true,
    'room' => $cleanRoom,
    'messages' => $allMessages,
    'serverTime' => round(microtime(true) * 1000)
], JSON_UNESCAPED_UNICODE);

function polishPanamaSpanishToEnglish($enText, $esText = '') {
    if (empty($enText)) return '';
    $text = trim($enText);

    // 1. Fix literal "Good friend" / "Good buddy" from Panamanian greeting "Buenas amigo" / "Buenas compa"
    $text = preg_replace('/^(¡|!)?\s*Good\s+friend\b/i', 'Hello friend', $text);
    $text = preg_replace('/^(¡|!)?\s*Good\s*,\s*friend\b/i', 'Hello friend', $text);
    $text = preg_replace('/^(¡|!)?\s*Good\s+buddy\b/i', 'Hello friend', $text);
    $text = preg_replace('/^(¡|!)?\s*Good\s+partner\b/i', 'Hello friend', $text);
    $text = preg_replace('/^(¡|!)?\s*Good\s+Captain\b/i', 'Hello Captain', $text);
    $text = preg_replace('/^(¡|!)?\s*Good\s+boss\b/i', 'Hello boss', $text);

    // 2. If original was Panamanian greeting "Buenas" (without "tardes" or "noches")
    if (!empty($esText) && preg_match('/^\s*(¡|!)?\s*Buenas\b(?!\s+(tardes|noches|dias))/i', $esText)) {
        $text = preg_replace('/^(¡|!)?\s*Good\s+morning[!,\.\s]*/i', 'Hello! ', $text);
        $text = preg_replace('/^(¡|!)?\s*Good\s+day[!,\.\s]*/i', 'Hello! ', $text);
        $text = preg_replace('/^(¡|!)?\s*Good[!,\.\s]+/i', 'Hello! ', $text);
    } else {
        $text = preg_replace('/^(¡|!)?\s*Good!\s*(Yes|Yeah|I|We|Sure|No|Today|Tomorrow|Right)\b/i', 'Hello! $2', $text);
        $text = preg_replace('/^(¡|!)?\s*Good,\s*(yes|yeah|i|we|sure|no|today|tomorrow|right)\b/i', 'Hello, $2', $text);
    }

    // 3. Panamanian colloquialisms ("A la orden", "Dale", etc.)
    $text = preg_replace('/\bTo(\s+the)?\s+order\b/i', 'At your service', $text);
    $text = preg_replace('/\bIn(\s+the)?\s+order\b/i', 'At your service', $text);
    $text = preg_replace('/^(¡|!)?\s*Give it[!,\.\s]+/i', 'Sounds good! ', $text);

    return trim($text);
}
