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

$baseUrl = 'https://poquitotalk.hero-apps.com';

// Handle POST: Upload audio file or base64 audio
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $jsonData = json_decode($rawInput, true) ?? [];

    $text = trim($_POST['text'] ?? $jsonData['text'] ?? '');
    $voice = trim($_POST['voice'] ?? $jsonData['voice'] ?? 'valeria');

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
                $listenUrl = $baseUrl . '/listen.html?v=' . $fileId . '&audio=' . urlencode($audioUrl) . '&text=' . urlencode($text);
                echo json_encode([
                    'success' => true,
                    'fileId' => $fileId,
                    'audioUrl' => $audioUrl,
                    'listenUrl' => $listenUrl,
                    'text' => $text
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
            $listenUrl = $baseUrl . '/listen.html?v=' . $fileId . '&audio=' . urlencode($audioUrl) . '&text=' . urlencode($text);
            echo json_encode([
                'success' => true,
                'fileId' => $fileId,
                'audioUrl' => $audioUrl,
                'listenUrl' => $listenUrl,
                'text' => $text
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
            $listenUrl = $baseUrl . '/listen.html?audio=' . urlencode($audioUrl) . '&text=' . urlencode($text);
            echo json_encode([
                'success' => true,
                'presetId' => $presetId,
                'audioUrl' => $audioUrl,
                'listenUrl' => $listenUrl,
                'text' => $text
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // Fallback: Text only listen URL
    $listenUrl = $baseUrl . '/listen.html?text=' . urlencode($text);
    echo json_encode([
        'success' => true,
        'audioUrl' => null,
        'listenUrl' => $listenUrl,
        'text' => $text
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// GET: Check file or resolve listen info
$id = preg_replace('/[^a-zA-Z0-9_-]/', '', trim($_GET['id'] ?? $_GET['v'] ?? ''));
if (!empty($id)) {
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
    'error' => 'No valid audio request specified'
]);
