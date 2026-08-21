<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

$text = trim($_GET['text'] ?? $data['text'] ?? '');
$from = trim($_GET['from'] ?? $data['from'] ?? 'en');
$to = trim($_GET['to'] ?? $data['to'] ?? 'es');

if (empty($text)) {
    echo json_encode([
        'success' => false,
        'error' => 'No text provided for translation'
    ]);
    exit;
}

// Google Translate Single API Query
$encodedText = urlencode($text);
$gtUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl={$from}&tl={$to}&dt=t&q={$encodedText}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $gtUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
curl_setopt($ch, CURLOPT_TIMEOUT, 6);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response && $httpCode === 200) {
    $resJson = json_decode($response, true);
    if (isset($resJson[0]) && is_array($resJson[0])) {
        $translated = '';
        foreach ($resJson[0] as $part) {
            if (isset($part[0]) && is_string($part[0])) {
                $translated .= $part[0];
            }
        }
        if (!empty($translated)) {
            echo json_encode([
                'success' => true,
                'translated' => $translated,
                'from' => $from,
                'to' => $to,
                'source' => 'google_gtx'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

// Fallback response
echo json_encode([
    'success' => false,
    'error' => 'Translation service temporarily unavailable'
]);
