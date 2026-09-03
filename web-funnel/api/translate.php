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

// 1. First Tier: MyMemory Free Worldwide Translation API
$encodedText = urlencode($text);
$myMemoryUrl = "https://api.mymemory.translated.net/get?q={$encodedText}&langpair={$from}|{$to}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $myMemoryUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
curl_setopt($ch, CURLOPT_TIMEOUT, 6);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response && $httpCode === 200) {
    $resJson = json_decode($response, true);
    if (!empty($resJson['responseData']['translatedText'])) {
        $translated = trim($resJson['responseData']['translatedText']);
        // Check that response is not an error message
        if (!empty($translated) && strpos($translated, 'MYMEMORY WARNING') === false) {
            if ($to === 'en') {
                $translated = polishPanamaSpanishToEnglish($translated, $text);
            } else if ($to === 'es') {
                $translated = polishEnglishToPanamaSpanish($translated);
            }
            echo json_encode([
                'success' => true,
                'translated' => $translated,
                'from' => $from,
                'to' => $to,
                'source' => 'mymemory'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

// 2. Second Tier: Google Translate Single API Query
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
            if ($to === 'en') {
                $translated = polishPanamaSpanishToEnglish($translated, $text);
            } else if ($to === 'es') {
                $translated = polishEnglishToPanamaSpanish($translated);
            }
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
$fallbackTranslated = $text;
if ($to === 'es') {
    $fallbackTranslated = polishEnglishToPanamaSpanish($text);
}
echo json_encode([
    'success' => true,
    'translated' => $fallbackTranslated,
    'from' => $from,
    'to' => $to,
    'source' => 'passthrough'
]);

function normalizeBocasTerminologyPHP($text) {
    if (empty($text)) return '';
    $result = $text;

    // Bastimentos variations (including split pauses like "Basti mentos", "Busti mentos", "Basty mentos", "Busti mentus")
    $result = preg_replace('/\b[bBvV][aAuUoO][sS][tT][iIeEyY]?[\s-]*[mM][eEaAiI][nN][tT][oOuUaAeE][sS]?\b/u', 'Bastimentos', $result);
    $result = preg_replace('/\b[bBvV][aAuUoO][sS][tT][iIeEyY]?[\s-]*[mM][eEaAiI][nN][dD][oOuUaAeE][sS]?\b/u', 'Bastimentos', $result);
    $result = preg_replace('/\b[bBvV][aAuUoO][sS][tT][aA][\s-]*[mM][eE][nN][tT][oOuUaAeE][sS]?\b/u', 'Bastimentos', $result);

    // Carenero (including "Care nero")
    $result = preg_replace('/\b[cC][aA][rR][aAeEiI][\s-]*[nNñÑ][eEaAoO][rR][oOaA][sS]?\b/u', 'Carenero', $result);

    // Solarte (including "So larte")
    $result = preg_replace('/\b[sSzZ][oOaA][\s-]*[lL][aA][rR][tT][eEiIyY][sS]?\b/u', 'Solarte', $result);

    return $result;
}

function polishEnglishToPanamaSpanish($esText) {
    if (empty($esText)) return '';
    $text = trim($esText);

    // 1. Regional phonetic normalization
    $text = normalizeBocasTerminologyPHP($text);

    // 2. Local Panamanian Boat / Utility vocabulary
    $text = preg_replace('/\bun\s+barco\b/i', 'una lancha', $text);
    $text = preg_replace('/\bel\s+barco\b/i', 'la lancha');
    $text = preg_replace('/\bunos\s+barcos\b/i', 'unas lanchas', $text);
    $text = preg_replace('/\blos\s+barcos\b/i', 'las lanchas', $text);
    $text = preg_replace('/\bun\s+taxi\s+acuático\b/i', 'una lancha', $text);
    $text = preg_replace('/\bel\s+taxi\s+acuático\b/i', 'la lancha', $text);
    $text = preg_replace('/\btaxi\s+acuático\b/i', 'lancha', $text);
    $text = preg_replace('/\btaxis\s+acuáticos\b/i', 'lanchas', $text);
    $text = preg_replace('/\bun\s+water\s+taxi\b/i', 'una lancha', $text);
    $text = preg_replace('/\bel\s+water\s+taxi\b/i', 'la lancha', $text);
    $text = preg_replace('/\bwater\s+taxi\b/i', 'lancha', $text);
    $text = preg_replace('/\bbarco\b/i', 'lancha', $text);
    $text = preg_replace('/\bbarcos\b/i', 'lanchas', $text);
    $text = preg_replace('/\bwater truck\b/i', 'camión cisterna', $text);
    $text = preg_replace('/\bwater tank\b/i', 'tanque de reserva', $text);
    $text = preg_replace('/\bdormitorio\b/i', 'recámara', $text);
    $text = preg_replace('/\bhabitación principal\b/i', 'recámara principal', $text);

    // Proper Spanish punctuation
    if (substr($text, -1) === '?' && strpos($text, '¿') !== 0) {
        $text = '¿' . $text;
    }
    if (substr($text, -1) === '!' && strpos($text, '¡') !== 0) {
        $text = '¡' . $text;
    }

    return trim($text);
}

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
