<?php
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$SECRET_KEY = 'poquitotalk_hero_apps_waitlist_2026';

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

// Handle JSON API mode
if ($format === 'json' || isset($_GET['json'])) {
    header('Content-Type: application/json');
    $records = ($type === 'waitlist') ? $waitlist : $contractors;
    echo json_encode([
        'success' => true,
        'type' => $type,
        'total' => count($records),
        'unnotified_count' => count(array_filter($records, fn($r) => !($r['notified'] ?? false))),
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
      <?php if (empty($waitlist)): ?>
        <div class="empty-state">
          <h3>No app waitlist submissions recorded yet</h3>
        </div>
      <?php else: ?>
        <div class="grid">
          <?php foreach ($waitlist as $item): ?>
            <?php $p = $item['payload'] ?? []; ?>
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title"><?php echo htmlspecialchars($item['email'] ?: ($p['Email'] ?? 'Direct Checkout Lead')); ?></div>
                  <div class="card-meta">Type: <?php echo htmlspecialchars($item['type'] ?? 'playstore'); ?> • Lang: <?php echo htmlspecialchars($item['language'] ?? 'en-US'); ?></div>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  🕒 <?php echo htmlspecialchars($item['registeredAt'] ?? ''); ?>
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

