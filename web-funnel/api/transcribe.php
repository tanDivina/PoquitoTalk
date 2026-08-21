<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$lang = trim($_POST["lang"] ?? $_GET["lang"] ?? "en");

// Check if audio file was uploaded
if (!isset($_FILES["audio"]) && !isset($_FILES["file"])) {
    echo json_encode([
        "success" => false,
        "error" => "No audio file provided"
    ]);
    exit;
}

$file = $_FILES["audio"] ?? $_FILES["file"];
$tmpPath = $file["tmp_name"];

if (!file_exists($tmpPath) || filesize($tmpPath) === 0) {
    echo json_encode([
        "success" => false,
        "error" => "Uploaded file is empty or invalid"
    ]);
    exit;
}

// 1. ElevenLabs Scribe Speech-to-Text API
$elevenLabsKey = getenv("ELEVENLABS_API_KEY") ?: "sk_64d48eca9c2c52a559dfc4e40da1a2dc76870f3f851f4c49";
if (!empty($elevenLabsKey)) {
    $cFile = new CURLFile($tmpPath, $file["type"] ?? "audio/m4a", $file["name"] ?? "voice.m4a");
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.elevenlabs.io/v1/speech-to-text");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "xi-api-key: " . $elevenLabsKey
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        "file" => $cFile,
        "model_id" => "scribe_v1"
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($res && $httpCode === 200) {
        $data = json_decode($res, true);
        if (!empty($data["text"])) {
            echo json_encode([
                "success" => true,
                "text" => trim($data["text"]),
                "source" => "elevenlabs_scribe"
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

// 2. OpenAI Whisper API
$openaiKey = getenv("OPENAI_API_KEY") ?: "";

if (!empty($openaiKey)) {
    $cFile = new CURLFile($tmpPath, $file["type"] ?? "audio/m4a", $file["name"] ?? "voice.m4a");
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.openai.com/v1/audio/transcriptions");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . $openaiKey
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        "file" => $cFile,
        "model" => "whisper-1",
        "language" => ($lang === "es" ? "es" : "en")
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($res && $httpCode === 200) {
        $data = json_decode($res, true);
        if (!empty($data["text"])) {
            echo json_encode([
                "success" => true,
                "text" => trim($data["text"]),
                "source" => "whisper_backend"
            ]);
            exit;
        }
    }
}

// If OpenAI or Groq Whisper not available or failed
echo json_encode([
    "success" => false,
    "error" => "No transcription provider configured or audio could not be decoded"
]);
