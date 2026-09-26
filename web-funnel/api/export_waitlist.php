<?php
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$SECRET_KEY = 'poquitotalk_hero_apps_waitlist_2026';
$PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.heroapps.poquitotalk';

$providedKey = $_GET['key'] ?? $_POST['key'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
$providedKey = str_replace('Bearer ', '', $providedKey);

if ($providedKey !== $SECRET_KEY) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please provide valid ?key= parameter']);
    exit;
}

$dataDir = '/home/finclazc/poquitotalk_data';
if (!is_dir($dataDir)) {
    $dataDir = __DIR__ . '/../data_private';
}

$type = $_GET['type'] ?? 'contractor';
$format = $_GET['format'] ?? 'html';

$contractorsFile = $dataDir . '/contractors.json';
$waitlistFile = $dataDir . '/waitlist.json';

$contractors = file_exists($contractorsFile) ? (json_decode(file_get_contents($contractorsFile), true) ?: []) : [];
$waitlist = file_exists($waitlistFile) ? (json_decode(file_get_contents($waitlistFile), true) ?: []) : [];

// Helper function to build high-deliverability HTML email
function buildLaunchEmailHtml($isSpanish = false, $playstoreUrl = 'https://play.google.com/store/apps/details?id=com.heroapps.poquitotalk') {
    if ($isSpanish) {
        $subject = "¡PoquitoTalk ya está listo en Google Play! 🚀";
        $title = "¡PoquitoTalk ya está disponible! 🚀";
        $subtitle = "Tu app de notas de voz en español panameño para WhatsApp ya está lista para descargar en Google Play Store.";
        $greeting = "¡Hola!";
        $intro = "¡Muchas gracias por unirte a nuestra lista VIP de espera! Nos emociona contarte que <strong>PoquitoTalk ya está oficialmente disponible para descargar en Google Play Store</strong>.";
        $freeTitle = "🌴 Siempre 100% Gratis:";
        $free1 = "<strong>Directorio Local de Bocas</strong>: Teléfonos y contactos directos de WhatsApp para capitanes de lancha, taxis acuáticos, electricistas, mecánicos y emergencias médicas.";
        $free2 = "<strong>Frases Panameñas y Traducción</strong>: Frases esenciales de la isla y traducciones al español panameño natural y educado.";
        $free3 = "<strong>Sin Instalación para Destinatarios</strong>: Quien reciba tus audios en WhatsApp los escucha de inmediato sin necesidad de instalar la app.";
        $proTitle = "⚡ Funciones Pro (Prueba Gratuita de 7 Días):";
        $pro1 = "<strong>Walkie-Talkie en Vivo Ilimitado</strong>: Conversaciones bidireccionales en tiempo real con contratistas y capitanes (tú hablas en inglés y ellos en español).";
        $pro2 = "<strong>Notas de Voz Ilimitadas</strong>: Generación de audios sin límite y con eliminación automática de firma.";
        $ctaText = "DESCARGAR EN GOOGLE PLAY →";
        $footerText = "Enviado con ❤️ por Hero-Apps • Bocas del Toro";
        $disclaimer = "Recibiste este correo de única vez porque te registraste para el lanzamiento en poquitotalk.hero-apps.com. Cero spam.";
    } else {
        $subject = "PoquitoTalk is Officially Live on Google Play! 🚀";
        $title = "PoquitoTalk is Officially Live! 🚀";
        $subtitle = "Your 1-tap WhatsApp voice notes app for Bocas del Toro & Panama is now available on Google Play.";
        $greeting = "Hi there,";
        $intro = "Thank you for joining our VIP Android waitlist! We are thrilled to announce that <strong>PoquitoTalk is now officially available for download on Google Play Store</strong>.";
        $freeTitle = "🌴 Always 100% Free:";
        $free1 = "<strong>Local Bocas Directory</strong>: Instant phone numbers and WhatsApp contacts for verified boat captains, water taxis, handymen, mechanics, and medical emergencies.";
        $free2 = "<strong>Panama Phrasebook & Translations</strong>: Natural, respectful Panamanian Spanish phrases and everyday expat communication.";
        $free3 = "<strong>Zero Install for Recipients</strong>: Locals and contractors hear your clear voice notes directly in WhatsApp (no app needed on their side).";
        $proTitle = "⚡ Pro Features (7-Day Free Trial):";
        $pro1 = "<strong>Live 2-Way Walkie-Talkie</strong>: Talk live with contractors where they speak Spanish and you hear English in real-time.";
        $pro2 = "<strong>Unlimited Natural Voice Notes</strong>: Unlimited audio generation with automatic signature removal.";
        $ctaText = "GET IT ON GOOGLE PLAY →";
        $footerText = "Sent with ❤️ by Hero-Apps • Bocas del Toro";
        $disclaimer = "You are receiving this one-time email because you requested launch notification at poquitotalk.hero-apps.com. Zero spam.";
    }

    $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{$title}</title>
</head>
<body style="background-color: #F8FAFC; color: #1E293B; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px 16px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <tr>
      <td style="padding: 36px 32px 28px 32px; text-align: center; background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%); border-bottom: 1px solid #E2E8F0;">
        <img src="https://poquitotalk.hero-apps.com/poquitotalk_logo_clean.png" alt="PoquitoTalk" width="96" height="96" style="margin-bottom: 12px; display: inline-block;">
        <div>
          <span style="display: inline-block; background: #059669; color: #FFFFFF; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;">Google Play Store • Launch</span>
        </div>
        <h1 style="color: #0F172A; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">{$title}</h1>
        <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.45;">{$subtitle}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px; color: #334155; font-size: 15px; line-height: 1.6;">
        <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0F172A;">{$greeting}</p>
        <p>{$intro}</p>
        
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">{$freeTitle}</h3>
          <ul style="margin: 0 0 18px 0; padding-left: 20px; color: #334155; font-size: 14.5px; line-height: 1.55;">
            <li style="margin-bottom: 8px;">{$free1}</li>
            <li style="margin-bottom: 8px;">{$free2}</li>
            <li style="margin-bottom: 0;">{$free3}</li>
          </ul>

          <h3 style="color: #0284C7; margin: 0 0 10px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">{$proTitle}</h3>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14.5px; line-height: 1.55;">
            <li style="margin-bottom: 8px;">{$pro1}</li>
            <li style="margin-bottom: 0;">{$pro2}</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0 20px 0;">
          <a href="{$playstoreUrl}" style="background: #059669; color: #FFFFFF; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 800; font-size: 15px; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(5,150,105,0.35);">
            {$ctaText}
          </a>
        </div>
        <p style="text-align: center; margin: 0; font-size: 13px; color: #64748B;">
          Direct link: <a href="{$playstoreUrl}" style="color: #059669; text-decoration: underline;">{$playstoreUrl}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B; line-height: 1.5;">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">{$footerText}</p>
        <p style="margin: 0;">{$disclaimer}</p>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

    return ['subject' => $subject, 'html' => $html];
}

// Function to dispatch email via local mail system with SPF/DKIM envelope
function dispatchLaunchEmail($toEmail, $isSpanish = false, $playstoreUrl = 'https://play.google.com/store/apps/details?id=com.heroapps.poquitotalk') {
    $mailData = buildLaunchEmailHtml($isSpanish, $playstoreUrl);
    $subject = $mailData['subject'];
    $html = $mailData['html'];

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: PoquitoTalk <support@hero-apps.com>\r\n";
    $headers .= "Reply-To: support@hero-apps.com\r\n";
    $headers .= "X-Mailer: PoquitoTalk-LaunchEngine/1.0\r\n";

    return mail($toEmail, $subject, $html, $headers, "-f support@hero-apps.com");
}

// Process Action Requests
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$actionResult = null;

// Action: Mark specified IDs as notified
if ($action === 'mark_notified' || isset($_GET['mark_notified'])) {
    $rawInput = file_get_contents('php://input');
    $inputData = json_decode($rawInput, true) ?: [];
    $targetIds = $inputData['ids'] ?? ($_POST['ids'] ?? []);

    if (!empty($targetIds) && is_array($targetIds)) {
        $modified = false;
        foreach ($waitlist as &$item) {
            if (in_array($item['id'] ?? '', $targetIds)) {
                $item['notified'] = true;
                $item['notifiedAt'] = date('c');
                $modified = true;
            }
        }
        if ($modified) {
            file_put_contents($waitlistFile, json_encode($waitlist, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        }
    }

    if ($format === 'json' || isset($_GET['json'])) {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'marked_count' => count($targetIds)]);
        exit;
    }
    $actionResult = ['type' => 'success', 'message' => "Marked " . count($targetIds) . " subscribers as notified."];
}

// Action: Send test email to Dorien or specified address
if ($action === 'test_email') {
    $testEmail = trim($_GET['email'] ?? $_POST['email'] ?? 'dorien.vda@gmail.com');
    $testLang = trim($_GET['lang'] ?? $_POST['lang'] ?? 'en');
    $isSpanish = (strtolower($testLang) === 'es' || str_contains(strtolower($testLang), 'span'));

    $sent = dispatchLaunchEmail($testEmail, $isSpanish, $PLAYSTORE_URL);

    if ($format === 'json' || isset($_GET['json'])) {
        header('Content-Type: application/json');
        echo json_encode(['success' => $sent, 'recipient' => $testEmail, 'language' => $isSpanish ? 'es' : 'en']);
        exit;
    }
    $actionResult = [
        'type' => $sent ? 'success' : 'error',
        'message' => $sent ? "Test launch email successfully sent to {$testEmail} (" . ($isSpanish ? 'Spanish' : 'English') . ")!" : "Failed to send test email to {$testEmail}."
    ];
}

// Action: Broadcast launch notification to all pending subscribers
if ($action === 'broadcast_launch') {
    $sentCount = 0;
    $failedCount = 0;
    $sentRecipients = [];
    $targetId = $_GET['id'] ?? $_POST['id'] ?? null;

    foreach ($waitlist as &$item) {
        $email = $item['email'] ?: ($item['payload']['Email'] ?? '');
        $subId = $item['id'] ?? '';
        $isNotified = $item['notified'] ?? false;

        // If targetId is provided, only process that one; otherwise process all unnotified playstore signups
        if ($targetId && $subId !== $targetId) {
            continue;
        }

        if (!$targetId && ($isNotified || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL))) {
            continue;
        }

        // Avoid sending to example/dummy emails
        if (str_contains($email, 'example.com')) {
            continue;
        }

        $lang = $item['language'] ?? ($item['payload']['Language'] ?? 'en-US');
        $isSpanish = (str_contains(strtolower($lang), 'es') || str_contains(strtolower($lang), 'span'));

        $sent = dispatchLaunchEmail($email, $isSpanish, $PLAYSTORE_URL);
        if ($sent) {
            $item['notified'] = true;
            $item['notifiedAt'] = date('c');
            $sentCount++;
            $sentRecipients[] = ['email' => $email, 'lang' => $isSpanish ? 'es' : 'en', 'id' => $subId];
        } else {
            $failedCount++;
        }
    }

    if ($sentCount > 0) {
        file_put_contents($waitlistFile, json_encode($waitlist, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    if ($format === 'json' || isset($_GET['json'])) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'sent_count' => $sentCount,
            'failed_count' => $failedCount,
            'recipients' => $sentRecipients
        ]);
        exit;
    }
    $actionResult = [
        'type' => 'success',
        'message' => "Launch announcement broadcast completed: {$sentCount} subscribers notified ({$failedCount} failed)."
    ];
}

// Handle JSON API mode
if ($format === 'json' || isset($_GET['json'])) {
    header('Content-Type: application/json');
    $records = ($type === 'waitlist') ? $waitlist : $contractors;
    echo json_encode([
        'success' => true,
        'type' => $type,
        'total' => count($records),
        'unnotified_count' => count(array_filter($records, fn($r) => !($r['notified'] ?? false) && !empty($r['email'] ?: ($r['payload']['Email'] ?? '')) && !str_contains($r['email'] ?: ($r['payload']['Email'] ?? ''), 'example.com'))),
        'data' => $records
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Render HTML Dashboard
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PoquitoTalk • Admin Directory & Submissions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Lexend:wght@700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0F172A;
      --card-bg: #1E293B;
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #25D366;
      --accent-alt: #10B981;
      --text: #F8FAFC;
      --text-muted: #94A3B8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 30px 20px;
      line-height: 1.5;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--card-border);
    }
    .title-area h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 26px;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: rgba(37, 211, 102, 0.15);
      color: var(--accent);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
    }
    .badge-pending {
      background: rgba(234, 179, 8, 0.15);
      color: #FACC15;
    }
    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
    }
    .tab-btn {
      background: var(--card-bg);
      color: var(--text-muted);
      border: 1px solid var(--card-border);
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: var(--accent);
      color: #0F172A;
      border-color: var(--accent);
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    .btn-action {
      background: rgba(255,255,255,0.06);
      color: var(--text);
      border: 1px solid var(--card-border);
      padding: 8px 16px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-action:hover { background: rgba(255,255,255,0.12); }
    .btn-primary {
      background: var(--accent);
      color: #0F172A;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary:hover { opacity: 0.9; }
    .alert {
      padding: 14px 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34D399; }
    .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #F87171; }
    .broadcast-panel {
      background: rgba(37, 211, 102, 0.06);
      border: 1px solid rgba(37, 211, 102, 0.25);
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .grid { display: grid; gap: 16px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 10px;
    }
    .card-title {
      font-size: 18px;
      font-weight: 800;
      color: #FFFFFF;
    }
    .card-meta {
      font-size: 13px;
      color: var(--accent);
      font-weight: 600;
    }
    .card-body {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      background: rgba(0,0,0,0.2);
      padding: 14px;
      border-radius: 10px;
      font-size: 14px;
    }
    .data-item strong { color: var(--text-muted); font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px; }
    .whatsapp-btn {
      background: #25D366;
      color: #0F172A;
      text-decoration: none;
      font-weight: 700;
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: var(--card-bg);
      border-radius: 14px;
      border: 1px dashed var(--card-border);
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="title-area">
        <h1>🇵🇦 PoquitoTalk Directory Submissions</h1>
        <p style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">Live submission feed stored privately on LiteSpeed server</p>
      </div>
      <div class="actions">
        <a href="?key=<?php echo htmlspecialchars($SECRET_KEY); ?>&type=<?php echo htmlspecialchars($type); ?>" class="btn-action">🔄 Refresh Live</a>
        <a href="?key=<?php echo htmlspecialchars($SECRET_KEY); ?>&type=<?php echo htmlspecialchars($type); ?>&format=json" target="_blank" class="btn-action">📄 Raw JSON</a>
      </div>
    </header>

    <?php if ($actionResult): ?>
      <div class="alert alert-<?php echo $actionResult['type']; ?>">
        <?php echo htmlspecialchars($actionResult['message']); ?>
      </div>
    <?php endif; ?>

    <div class="tabs">
      <a href="?key=<?php echo htmlspecialchars($SECRET_KEY); ?>&type=contractor" class="tab-btn <?php echo ($type === 'contractor') ? 'active' : ''; ?>">
        🛠️ Contractors & Services <span class="badge"><?php echo count($contractors); ?></span>
      </a>
      <a href="?key=<?php echo htmlspecialchars($SECRET_KEY); ?>&type=waitlist" class="tab-btn <?php echo ($type === 'waitlist') ? 'active' : ''; ?>">
        📱 App Waitlist & Pre-orders <span class="badge"><?php echo count($waitlist); ?></span>
      </a>
    </div>

    <?php if ($type === 'contractor'): ?>
      <?php if (empty($contractors)): ?>
        <div class="empty-state">
          <h3>No contractor submissions recorded yet</h3>
          <p style="margin-top: 6px;">Registrations submitted via <a href="../contractors.html" style="color: var(--accent);">contractors.html</a> will appear here automatically.</p>
        </div>
      <?php else: ?>
        <div class="grid">
          <?php foreach ($contractors as $item): ?>
            <?php 
              $p = $item['payload'] ?? [];
              $cleanPhone = preg_replace('/[^0-9]/', '', $p['WhatsAppPhone'] ?? '');
            ?>
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title"><?php echo htmlspecialchars($p['BusinessName'] ?? 'Unnamed Provider'); ?></div>
                  <div class="card-meta">📍 <?php echo htmlspecialchars($p['PrimaryLocation'] ?? 'Bocas del Toro'); ?> • 🏷️ <?php echo htmlspecialchars($p['TradeCategory'] ?? 'General'); ?></div>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  🕒 <?php echo htmlspecialchars($item['registeredAt'] ?? 'Recent'); ?>
                </div>
              </div>

              <div class="card-body">
                <div class="data-item">
                  <strong>WhatsApp / Phone</strong>
                  <div><?php echo htmlspecialchars($p['WhatsAppPhone'] ?? 'N/A'); ?></div>
                  <?php if (!empty($cleanPhone)): ?>
                    <a href="https://wa.me/<?php echo $cleanPhone; ?>" target="_blank" class="whatsapp-btn">
                      💬 Open WhatsApp
                    </a>
                  <?php endif; ?>
                </div>
                <div class="data-item">
                  <strong>Email</strong>
                  <div><?php echo htmlspecialchars($p['Email'] ?? 'N/A'); ?></div>
                </div>
                <div class="data-item">
                  <strong>Languages Spoken</strong>
                  <div><?php echo htmlspecialchars($p['LanguagesSpoken'] ?? 'Español'); ?></div>
                </div>
                <div class="data-item" style="grid-column: 1 / -1;">
                  <strong>Service Summary & Notes</strong>
                  <div style="color: #E2E8F0;"><?php echo nl2br(htmlspecialchars($p['ServiceSummary'] ?? 'No notes provided')); ?></div>
                </div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>

    <?php else: ?>
      <?php 
        $pendingCount = count(array_filter($waitlist, fn($r) => !($r['notified'] ?? false) && !empty($r['email'] ?: ($r['payload']['Email'] ?? '')) && !str_contains($r['email'] ?: ($r['payload']['Email'] ?? ''), 'example.com')));
      ?>
      <!-- Play Store Launch Broadcast Controller -->
      <div class="broadcast-panel">
        <div>
          <h3 style="color: #25D366; font-size: 17px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
            🚀 Google Play Launch Broadcast Engine
          </h3>
          <p style="color: var(--text-muted); font-size: 13px; margin: 0;">
            Target URL: <code style="color: #A7F3D0; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;"><?php echo htmlspecialchars($PLAYSTORE_URL); ?></code>
          </p>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
            <strong><?php echo $pendingCount; ?></strong> eligible waitlist subscribers pending notification.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="?key=<?php echo htmlspecialchars($SECRET_KEY); ?>&type=waitlist&action=test_email&email=dorien.vda@gmail.com&lang=en" class="btn-action">
            📧 Test English (Dorien)
          </a>
          <a href="?key=<?php echo htmlspecialchars($SECRET_KEY); ?>&type=waitlist&action=test_email&email=dorien.vda@gmail.com&lang=es" class="btn-action">
            📧 Test Spanish (Dorien)
          </a>
          <?php if ($pendingCount > 0): ?>
            <a href="?key=<?php echo htmlspecialchars($SECRET_KEY); ?>&type=waitlist&action=broadcast_launch" onclick="return confirm('Broadcast launch announcement emails to all <?php echo $pendingCount; ?> pending subscribers?');" class="btn-primary">
              🚀 Broadcast to All Pending (<?php echo $pendingCount; ?>)
            </a>
          <?php else: ?>
            <span class="badge">✅ All Subscribers Notified</span>
          <?php endif; ?>
        </div>
      </div>

      <?php if (empty($waitlist)): ?>
        <div class="empty-state">
          <h3>No app waitlist submissions recorded yet</h3>
        </div>
      <?php else: ?>
        <div class="grid">
          <?php foreach ($waitlist as $item): ?>
            <?php 
              $p = $item['payload'] ?? []; 
              $email = $item['email'] ?: ($p['Email'] ?? '');
              $isNotified = $item['notified'] ?? false;
            ?>
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title"><?php echo htmlspecialchars($email ?: 'Direct Checkout Lead'); ?></div>
                  <div class="card-meta">
                    Type: <?php echo htmlspecialchars($item['type'] ?? 'playstore'); ?> • Lang: <?php echo htmlspecialchars($item['language'] ?? 'en-US'); ?>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <?php if (!empty($email) && ($item['type'] ?? '') === 'playstore'): ?>
                    <?php if ($isNotified): ?>
                      <span class="badge">✅ Notified <?php echo !empty($item['notifiedAt']) ? date('M j, Y', strtotime($item['notifiedAt'])) : ''; ?></span>
                    <?php else: ?>
                      <span class="badge badge-pending">⏳ Pending</span>
                      <a href="?key=<?php echo htmlspecialchars($SECRET_KEY); ?>&type=waitlist&action=broadcast_launch&id=<?php echo urlencode($item['id']); ?>" class="btn-action" style="font-size: 11px; padding: 4px 8px;" onclick="return confirm('Send launch email to <?php echo htmlspecialchars($email); ?>?');">
                        Send Now
                      </a>
                    <?php endif; ?>
                  <?php endif; ?>
                  <div style="font-size: 12px; color: var(--text-muted);">
                    🕒 <?php echo htmlspecialchars($item['registeredAt'] ?? ''); ?>
                  </div>
                </div>
              </div>
              <?php if (!empty($p['PlanSelected'])): ?>
                <div class="card-body">
                  <div class="data-item">
                    <strong>Plan Selected</strong>
                    <div><?php echo htmlspecialchars($p['PlanSelected']); ?></div>
                  </div>
                  <div class="data-item">
                    <strong>Price</strong>
                    <div><?php echo htmlspecialchars($p['PromoPrice'] ?? ''); ?></div>
                  </div>
                </div>
              <?php endif; ?>
            </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    <?php endif; ?>
  </div>
</body>
</html>
