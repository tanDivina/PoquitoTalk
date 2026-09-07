<?php
$id = preg_replace('/[^a-zA-Z0-9_-]/', '', trim($_GET['id'] ?? $_GET['v'] ?? ''));
$linksDir = __DIR__ . '/api/data/links';
$linkFile = $linksDir . '/' . $id . '.json';

$note = null;
if (!empty($id) && file_exists($linkFile)) {
    $note = json_decode(@file_get_contents($linkFile), true);
}

$rawSender = trim($note['sender'] ?? '');
if (!empty($rawSender) && strtolower($rawSender) !== 'client' && strtolower($rawSender) !== 'cliente') {
    $sender = htmlspecialchars($rawSender, ENT_QUOTES, 'UTF-8');
    $title = "PoquitoTalk 🇵🇦 Nota de voz de " . $sender;
    $heading = "Nota de voz de " . $sender;
} else {
    $sender = 'un cliente';
    $title = "PoquitoTalk 🇵🇦 Nota de voz de un cliente";
    $heading = "Nota de voz de un cliente";
}
$text = !empty($note['text']) ? htmlspecialchars($note['text'], ENT_QUOTES, 'UTF-8') : 'Mensaje de voz en español';
$shortText = mb_strlen($text) > 90 ? mb_substr($text, 0, 87) . '...' : $text;
$targetUrl = "/listen.html?v=" . urlencode($id);

// Check if visited by social crawler (WhatsApp, iMessage, Facebook, Telegram, etc.)
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$isCrawler = preg_match('/(WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Slackbot|Discordbot|Applebot)/i', $userAgent);

if (!$isCrawler && !empty($id)) {
    header("Location: " . $targetUrl, true, 302);
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo $title; ?></title>
  <meta property="og:title" content="<?php echo $title; ?>">
  <meta property="og:description" content="&quot;<?php echo $shortText; ?>&quot;">
  <meta property="og:type" content="music.song">
  <meta property="og:url" content="https://poquitotalk.hero-apps.com/l/<?php echo htmlspecialchars($id); ?>">
  <meta property="og:image" content="https://poquitotalk.hero-apps.com/logo.svg">
  <meta property="og:site_name" content="PoquitoTalk Bocas del Toro">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="<?php echo $title; ?>">
  <meta name="twitter:description" content="&quot;<?php echo $shortText; ?>&quot;">
  <meta http-equiv="refresh" content="0;url=<?php echo $targetUrl; ?>">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #FAF8F5;
      color: #1A1208;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
    .card {
      background: #fff;
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      max-width: 400px;
      border: 1px solid rgba(0,0,0,0.08);
    }
    a.btn {
      display: inline-block;
      margin-top: 16px;
      padding: 12px 24px;
      background: #D9653B;
      color: #fff;
      text-decoration: none;
      font-weight: bold;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2><?php echo $heading; ?></h2>
    <p>&ldquo;<?php echo $shortText; ?>&rdquo;</p>
    <a class="btn" href="<?php echo $targetUrl; ?>">Abrir Reproductor de Audio ▶️</a>
  </div>
  <script>
    window.location.replace("<?php echo $targetUrl; ?>");
  </script>
</body>
</html>
