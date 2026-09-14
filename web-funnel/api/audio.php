<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$storageDir = __DIR__ . '/../audio/voice_notes';
if (!is_dir($storageDir)) {
    @mkdir($storageDir, 0777, true);
}

$linksDir = __DIR__ . '/data/links';
if (!is_dir($linksDir)) {
    @mkdir($linksDir, 0777, true);
}

$baseUrl = 'https://poquitotalk.hero-apps.com';

function generateShortCode($length = 6) {
    // Unambiguous lowercase base32 (no 0, o, 1, l, i)
    $chars = '23456789abcdefghjkmnpqrstuvwxyz';
    $code = '';
    $max = strlen($chars) - 1;
    for ($i = 0; $i < $length; $i++) {
        $code .= $chars[random_int(0, $max)];
    }
    return $code;
}

// Handle GET: Retrieve metadata for short link or file
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', trim($_GET['id'] ?? $_GET['v'] ?? ''));
    if (!empty($id)) {
        // 1. Check if short link metadata file exists
        $linkFile = $linksDir . '/' . $id . '.json';
        if (file_exists($linkFile)) {
            $data = json_decode(file_get_contents($linkFile), true);
            echo json_encode([
                'success' => true,
                'shortId' => $id,
                'note' => $data,
                'fileId' => $data['fileId'] ?? $id,
                'audioUrl' => $data['audioUrl'] ?? null,
                'text' => $data['text'] ?? '',
                'enText' => $data['enText'] ?? '',
                'room' => $data['room'] ?? '',
                'contractor' => $data['contractor'] ?? '',
                'sender' => $data['sender'] ?? '',
                'phone' => $data['phone'] ?? ''
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // 2. Check if raw voice note audio file exists
        $possibleFiles = glob($storageDir . '/' . $id . '.*');
        if (!empty($possibleFiles)) {
            $filename = basename($possibleFiles[0]);
            $audioUrl = $baseUrl . '/audio/voice_notes/' . $filename;
            echo json_encode([
                'success' => true,
                'fileId' => $id,
                'audioUrl' => $audioUrl
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    echo json_encode([
        'success' => false,
        'error' => 'No valid voice note found'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Handle POST: Upload audio file or base64 audio and generate short link
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $jsonData = json_decode($rawInput, true) ?? [];

    $text = trim($_POST['text'] ?? $jsonData['text'] ?? '');
    $voice = trim($_POST['voice'] ?? $jsonData['voice'] ?? 'sofia');
    $room = trim($_POST['room'] ?? $jsonData['room'] ?? $jsonData['roomId'] ?? '');
    $contractor = trim($_POST['contractor'] ?? $jsonData['contractor'] ?? $jsonData['contractorName'] ?? '');
    $sender = trim($_POST['sender'] ?? $jsonData['sender'] ?? $jsonData['clientName'] ?? '');
    $phone = trim($_POST['phone'] ?? $jsonData['phone'] ?? '');
    $enText = trim($_POST['englishText'] ?? $jsonData['englishText'] ?? $jsonData['en'] ?? '');

    // Helper to store short link record and return clean short URL
    $createShortLink = function($fileId, $audioUrl, $presetId = null) use ($linksDir, $baseUrl, $text, $enText, $room, $contractor, $sender, $phone) {
        $shortId = generateShortCode();
        $linkData = [
            'shortId' => $shortId,
            'fileId' => $fileId,
            'audioUrl' => $audioUrl,
            'presetId' => $presetId,
            'text' => $text,
            'enText' => $enText,
            'room' => $room,
            'contractor' => $contractor,
            'sender' => $sender,
            'phone' => $phone,
            'created' => round(microtime(true) * 1000)
        ];
        
        $jsonStr = json_encode($linkData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        @file_put_contents($linksDir . '/' . $shortId . '.json', $jsonStr);
        if (!empty($fileId) && $fileId !== $shortId) {
            @file_put_contents($linksDir . '/' . $fileId . '.json', $jsonStr);
        }

        $shortUrl = $baseUrl . '/l/' . $shortId;
        return [
            'shortId' => $shortId,
            'shortUrl' => $shortUrl,
            'listenUrl' => $shortUrl
        ];
    };

    $recordInitialRoomMessage = function($cleanRoom, $audioUrl, $fileId = '') use ($text, $enText, $sender) {
        if (empty($cleanRoom)) return;
        $cleanRoom = preg_replace('/[^a-zA-Z0-9_-]/', '', $cleanRoom);
        if (empty($cleanRoom)) return;
        $roomsDir = __DIR__ . '/data/rooms';
        if (!is_dir($roomsDir)) {
            @mkdir($roomsDir, 0777, true);
        }
        $roomFile = $roomsDir . '/' . $cleanRoom . '.json';
        $existing = [];
        if (file_exists($roomFile)) {
            $existing = json_decode(file_get_contents($roomFile), true) ?? [];
        }
        $msgId = 'msg_client_' . time();
        $existing[] = [
            'id' => $msgId,
            'roomId' => $cleanRoom,
            'sender' => 'client',
            'senderName' => (!empty($sender) && strtolower($sender) !== 'client' && strtolower($sender) !== 'cliente') ? $sender : 'un cliente',
            'esText' => $text,
            'enText' => $enText,
            'audioUrl' => $audioUrl,
            'timestamp' => round(microtime(true) * 1000),
            'time' => date('g:i A')
        ];
        if (count($existing) > 50) {
            $existing = array_slice($existing, -50);
        }
        @file_put_contents($roomFile, json_encode($existing, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    };

    // 1. Check if multipart file uploaded
    if (isset($_FILES['audio']) || isset($_FILES['file'])) {
        $file = $_FILES['audio'] ?? $_FILES['file'];
        $tmpName = $file['tmp_name'];
        if (file_exists($tmpName) && filesize($tmpName) > 0) {
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            if (empty($ext) || !in_array(strtolower($ext), ['mp3', 'm4a', 'wav', 'aac', 'ogg'])) {
                $ext = 'mp3';
            }
            $fileId = 'vn_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 6);
            $filename = $fileId . '.' . $ext;
            $targetPath = $storageDir . '/' . $filename;

            if (move_uploaded_file($tmpName, $targetPath)) {
                $audioUrl = $baseUrl . '/audio/voice_notes/' . $filename;
                $linkInfo = $createShortLink($fileId, $audioUrl);
                if (!empty($room)) {
                    $recordInitialRoomMessage($room, $audioUrl, $fileId);
                }
                echo json_encode([
                    'success' => true,
                    'fileId' => $fileId,
                    'shortId' => $linkInfo['shortId'],
                    'audioUrl' => $audioUrl,
                    'shortUrl' => $linkInfo['shortUrl'],
                    'listenUrl' => $linkInfo['listenUrl'],
                    'text' => $text,
                    'room' => $room
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
    }

    // 2. Check if base64 audio provided
    $base64 = trim($jsonData['audioBase64'] ?? $_POST['audioBase64'] ?? '');
    if (!empty($base64)) {
        if (strpos($base64, 'base64,') !== false) {
            $parts = explode('base64,', $base64);
            $base64 = end($parts);
        }
        $decoded = base64_decode($base64);
        if ($decoded !== false && strlen($decoded) > 0) {
            $fileId = 'vn_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 6);
            $filename = $fileId . '.mp3';
            $targetPath = $storageDir . '/' . $filename;
            file_put_contents($targetPath, $decoded);

            $audioUrl = $baseUrl . '/audio/voice_notes/' . $filename;
            $linkInfo = $createShortLink($fileId, $audioUrl);
            if (!empty($room)) {
                $recordInitialRoomMessage($room, $audioUrl, $fileId);
            }
            echo json_encode([
                'success' => true,
                'fileId' => $fileId,
                'shortId' => $linkInfo['shortId'],
                'audioUrl' => $audioUrl,
                'shortUrl' => $linkInfo['shortUrl'],
                'listenUrl' => $linkInfo['listenUrl'],
                'text' => $text,
                'room' => $room
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // 3. Preset Audio URL lookup
    $presetId = trim($jsonData['presetId'] ?? $_POST['presetId'] ?? '');
    if (!empty($presetId)) {
        $presetFile = $presetId . '.mp3';
        $presetPath = __DIR__ . '/../audio/presets/' . $presetFile;
        if (file_exists($presetPath)) {
            $audioUrl = $baseUrl . '/audio/presets/' . $presetFile;
            $linkInfo = $createShortLink($presetId, $audioUrl, $presetId);
            if (!empty($room)) {
                $recordInitialRoomMessage($room, $audioUrl);
            }
            echo json_encode([
                'success' => true,
                'presetId' => $presetId,
                'shortId' => $linkInfo['shortId'],
                'audioUrl' => $audioUrl,
                'shortUrl' => $linkInfo['shortUrl'],
                'listenUrl' => $linkInfo['listenUrl'],
                'text' => $text,
                'room' => $room
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // 4. Text only / Short link generation
    $linkInfo = $createShortLink('text_' . time(), '');
    if (!empty($room)) {
        $recordInitialRoomMessage($room, '');
    }
    echo json_encode([
        'success' => true,
        'shortId' => $linkInfo['shortId'],
        'audioUrl' => null,
        'shortUrl' => $linkInfo['shortUrl'],
        'listenUrl' => $linkInfo['listenUrl'],
        'text' => $text,
        'room' => $room
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
