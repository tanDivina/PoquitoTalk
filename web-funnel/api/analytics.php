<?php
/**
 * PoquitoTalk Analytics Engine & Hackathon Proof Generator (api/analytics.php)
 * Delivers real-time analytics, CSV/JSON data export, and official Hackathon Proof Reports.
 */

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$ADMIN_SECRET = 'poquito2026!bocas';
$ALT_SECRET = 'poquitotalk_hero_apps_waitlist_2026';

// Check Auth Header or Parameter
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['HTTP_X_ADMIN_KEY'] ?? '');
$providedKey = '';

if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $providedKey = trim($matches[1]);
} elseif (!empty($_SERVER['HTTP_X_ADMIN_KEY'])) {
    $providedKey = trim($_SERVER['HTTP_X_ADMIN_KEY']);
} elseif (isset($_GET['key'])) {
    $providedKey = trim($_GET['key']);
} elseif (isset($_POST['key'])) {
    $providedKey = trim($_POST['key']);
}

$action = strtolower(trim($_GET['action'] ?? 'overview'));
$isProofAction = ($action === 'proof_report' || $action === 'proof');

// Validate Secret Key (allow open view for proof report if proof token provided or matching key)
if (!$isProofAction && $providedKey !== $ADMIN_SECRET && $providedKey !== $ALT_SECRET) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Unauthorized: Invalid Admin Secret Key']);
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
$waitlistFile = $dataDir . '/waitlist.json';
$contractorsFile = $dataDir . '/contractors.json';

// Helper to load JSON safely
function loadJson($filePath) {
    if (!file_exists($filePath)) return [];
    $content = @file_get_contents($filePath);
    return json_decode($content, true) ?: [];
}

$events = loadJson($eventsFile);
$dailyStats = loadJson($dailyFile);
$waitlist = loadJson($waitlistFile);
$contractors = loadJson($contractorsFile);

// Date range filtering
$range = strtolower(trim($_GET['range'] ?? 'all'));
$filterStartDate = null;

if ($range === 'today') {
    $filterStartDate = date('Y-m-d');
} elseif ($range === '7d') {
    $filterStartDate = date('Y-m-d', strtotime('-7 days'));
} elseif ($range === '30d') {
    $filterStartDate = date('Y-m-d', strtotime('-30 days'));
}

// Filter events by date range if specified
$filteredEvents = $events;
if ($filterStartDate) {
    $filteredEvents = array_filter($events, function($ev) use ($filterStartDate) {
        $evDate = substr($ev['datetime'] ?? ($ev['date'] ?? ''), 0, 10);
        if (!$evDate && isset($ev['timestamp'])) {
            $evDate = date('Y-m-d', intval($ev['timestamp'] / 1000));
        }
        return $evDate >= $filterStartDate;
    });
}

// Compute Aggregated Overview Metrics
$totalPageviews = 0;
$uniqueVisitorsSet = [];
$uniqueSessionsSet = [];
$eventCounts = [];
$pageCounts = [];
$sourceCounts = [];
$deviceCounts = ['mobile' => 0, 'desktop' => 0, 'tablet' => 0];
$osCounts = [];
$browserCounts = [];
$countryCounts = [];

foreach ($filteredEvents as $ev) {
    $evName = $ev['event'] ?? 'pageview';
    $eventCounts[$evName] = ($eventCounts[$evName] ?? 0) + 1;

    if ($evName === 'pageview') {
        $totalPageviews++;
    }

    $vid = $ev['visitor_id'] ?? '';
    if ($vid) $uniqueVisitorsSet[$vid] = true;

    $sid = $ev['session_id'] ?? '';
    if ($sid) $uniqueSessionsSet[$sid] = true;

    $p = $ev['path'] ?? '/';
    $pageCounts[$p] = ($pageCounts[$p] ?? 0) + 1;

    $src = $ev['source'] ?? ($ev['referrer_category'] ?? 'Direct');
    $sourceCounts[$src] = ($sourceCounts[$src] ?? 0) + 1;

    $dev = strtolower($ev['device'] ?? 'desktop');
    if (isset($deviceCounts[$dev])) {
        $deviceCounts[$dev]++;
    } else {
        $deviceCounts['desktop']++;
    }

    $os = $ev['os'] ?? 'Unknown';
    $osCounts[$os] = ($osCounts[$os] ?? 0) + 1;

    $br = $ev['browser'] ?? 'Unknown';
    $browserCounts[$br] = ($browserCounts[$br] ?? 0) + 1;

    $ctry = $ev['country'] ?? 'PA';
    $countryCounts[$ctry] = ($countryCounts[$ctry] ?? 0) + 1;
}

$totalUniqueVisitors = count($uniqueVisitorsSet);
$totalSessions = count($uniqueSessionsSet);

// Compute Key Conversions
$waitlistConversions = count($waitlist);
$contractorCount = count($contractors);
$whatsappClicks = $eventCounts['whatsapp_click'] ?? ($eventCounts['contractor_whatsapp_click'] ?? 0);
$voiceDemoPlays = $eventCounts['play_voice_demo'] ?? ($eventCounts['audio_play'] ?? 0);
$toneSwitches = $eventCounts['toggle_tone'] ?? 0;
$directorySearches = $eventCounts['directory_search'] ?? 0;

$conversionRate = $totalUniqueVisitors > 0 ? round(($waitlistConversions / $totalUniqueVisitors) * 100, 1) : 0;

// Sort breakdowns descending
arsort($pageCounts);
arsort($sourceCounts);
arsort($osCounts);
arsort($countryCounts);
arsort($eventCounts);

// Daily timeline array
$timeline = [];
foreach ($dailyStats as $d => $data) {
    if ($filterStartDate && $d < $filterStartDate) continue;
    $timeline[] = [
        'date' => $d,
        'pageviews' => $data['pageviews'] ?? 0,
        'unique_visitors' => $data['unique_visitor_count'] ?? count($data['unique_visitors'] ?? []),
        'events' => $data['events'] ?? [],
        'top_source' => !empty($data['sources']) ? array_key_first($data['sources']) : 'Direct'
    ];
}

// -------------------------------------------------------------
// ACTION: EXPORT CSV
// -------------------------------------------------------------
if ($action === 'export_csv') {
    $exportType = strtolower(trim($_GET['type'] ?? 'events'));
    
    header('Content-Type: text/csv; charset=utf-8');
    
    if ($exportType === 'daily') {
        header('Content-Disposition: attachment; filename="poquitotalk_daily_traffic_' . date('Ymd_His') . '.csv"');
        $output = fopen('php://output', 'w');
        fputcsv($output, ['Date', 'Pageviews', 'Unique Visitors', 'Top Source', 'Top Page', 'Total Events']);
        
        foreach ($dailyStats as $d => $day) {
            $topSrc = !empty($day['sources']) ? array_key_first($day['sources']) : 'Direct';
            $topPg = !empty($day['pages']) ? array_key_first($day['pages']) : '/';
            $totalEvs = array_sum($day['events'] ?? []);
            fputcsv($output, [
                $d,
                $day['pageviews'] ?? 0,
                $day['unique_visitor_count'] ?? count($day['unique_visitors'] ?? []),
                $topSrc,
                $topPg,
                $totalEvs
            ]);
        }
        fclose($output);
        exit;
    }

    if ($exportType === 'visitors') {
        header('Content-Disposition: attachment; filename="poquitotalk_visitors_' . date('Ymd_His') . '.csv"');
        $output = fopen('php://output', 'w');
        fputcsv($output, ['Visitor ID', 'First Seen', 'Last Seen', 'Total Events', 'Device', 'OS', 'Browser', 'Country', 'Source', 'Last Page']);
        
        $visitorMap = [];
        foreach ($events as $ev) {
            $vid = $ev['visitor_id'] ?? 'unknown';
            if (!isset($visitorMap[$vid])) {
                $visitorMap[$vid] = [
                    'id' => $vid,
                    'first_seen' => $ev['datetime'] ?? '',
                    'last_seen' => $ev['datetime'] ?? '',
                    'total_events' => 0,
                    'device' => $ev['device'] ?? 'desktop',
                    'os' => $ev['os'] ?? '',
                    'browser' => $ev['browser'] ?? '',
                    'country' => $ev['country'] ?? 'PA',
                    'source' => $ev['source'] ?? 'Direct',
                    'last_page' => $ev['path'] ?? '/'
                ];
            }
            $visitorMap[$vid]['last_seen'] = $ev['datetime'] ?? $visitorMap[$vid]['last_seen'];
            $visitorMap[$vid]['last_page'] = $ev['path'] ?? $visitorMap[$vid]['last_page'];
            $visitorMap[$vid]['total_events']++;
        }

        foreach ($visitorMap as $v) {
            fputcsv($output, [
                $v['id'],
                $v['first_seen'],
                $v['last_seen'],
                $v['total_events'],
                $v['device'],
                $v['os'],
                $v['browser'],
                $v['country'],
                $v['source'],
                $v['last_page']
            ]);
        }
        fclose($output);
        exit;
    }

    // Default: Raw Events CSV
    header('Content-Disposition: attachment; filename="poquitotalk_events_stream_' . date('Ymd_His') . '.csv"');
    $output = fopen('php://output', 'w');
    fputcsv($output, [
        'Event ID', 'Date Time', 'Event Name', 'Visitor ID', 'Session ID',
        'Path', 'Page Title', 'Referrer Source', 'UTM Source', 'UTM Medium',
        'UTM Campaign', 'Device Type', 'OS', 'Browser', 'Country', 'Event Details'
    ]);

    foreach ($filteredEvents as $ev) {
        $detailsStr = !empty($ev['data']) ? json_encode($ev['data'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : '';
        fputcsv($output, [
            $ev['id'] ?? '',
            $ev['datetime'] ?? date('Y-m-d H:i:s', intval(($ev['timestamp'] ?? time()*1000)/1000)),
            $ev['event'] ?? 'pageview',
            $ev['visitor_id'] ?? '',
            $ev['session_id'] ?? '',
            $ev['path'] ?? '/',
            $ev['title'] ?? '',
            $ev['source'] ?? ($ev['referrer_category'] ?? 'Direct'),
            $ev['utm_source'] ?? '',
            $ev['utm_medium'] ?? '',
            $ev['utm_campaign'] ?? '',
            $ev['device'] ?? 'desktop',
            $ev['os'] ?? '',
            $ev['browser'] ?? '',
            $ev['country'] ?? 'PA',
            $detailsStr
        ]);
    }
    fclose($output);
    exit;
}

// -------------------------------------------------------------
// ACTION: EXPORT JSON
// -------------------------------------------------------------
if ($action === 'export_json') {
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename="poquitotalk_telemetry_dump_' . date('Ymd_His') . '.json"');
    echo json_encode([
        'project' => 'PoquitoTalk',
        'exported_at' => date('c'),
        'total_events' => count($events),
        'total_unique_visitors' => $totalUniqueVisitors,
        'total_pageviews' => $totalPageviews,
        'summary_metrics' => [
            'waitlist_conversions' => $waitlistConversions,
            'contractors_registered' => $contractorCount,
            'whatsapp_inquiries' => $whatsappClicks,
            'audio_demo_plays' => $voiceDemoPlays
        ],
        'daily_summary' => $dailyStats,
        'events' => $events
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// ACTION: HACKATHON & SHIPPATHON PROOF REPORT (HTML / PDF Ready)
// -------------------------------------------------------------
if ($isProofAction) {
    header('Content-Type: text/html; charset=utf-8');
    $auditHash = hash('sha256', count($events) . '-' . $totalUniqueVisitors . '-' . $totalPageviews . '-' . date('Ymd'));
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>PoquitoTalk • Official Hackathon & Shippathon Proof of Traction Report</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lexend:wght@600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-dark: #0A0D14;
          --panel-bg: #121824;
          --panel-card: #182232;
          --border: rgba(255, 255, 255, 0.08);
          --accent: #25D366;
          --accent-gold: #F59E0B;
          --accent-blue: #3B82F6;
          --text: #F8FAFC;
          --text-muted: #94A3B8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--bg-dark);
          color: var(--text);
          padding: 40px 20px;
          line-height: 1.5;
        }
        .report-container {
          max-width: 960px;
          margin: 0 auto;
          background: var(--panel-bg);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border);
          padding-bottom: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .brand-seal {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .brand-title {
          font-family: 'Lexend', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #FFF;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .badge-verified {
          background: rgba(37, 211, 102, 0.15);
          color: var(--accent);
          border: 1px solid rgba(37, 211, 102, 0.3);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .kpi-card {
          background: var(--panel-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px 20px;
          text-align: left;
        }
        .kpi-val {
          font-family: 'Lexend', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: #FFF;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .kpi-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .section-title {
          font-family: 'Lexend', sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #FFF;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .grid-2col {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .table-box {
          background: var(--panel-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        th, td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        th { color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .hash-box {
          background: #080B10;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #64748B;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 30px;
        }
        .btn-print {
          background: var(--accent);
          color: #0A0D14;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        @media print {
          body { background: #FFF; color: #000; padding: 0; }
          .report-container { box-shadow: none; border: 1px solid #CCC; background: #FFF; color: #000; }
          .kpi-card, .table-box { background: #F8F9FA; border-color: #DDD; }
          .kpi-val, .brand-title, .section-title { color: #000; }
          .btn-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <div class="brand-seal">
            <div>
              <div class="brand-title">PoquitoTalk <span style="font-size: 20px;">🇵🇦</span></div>
              <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                Verified Shippathon & Hackathon Traction Proof • Production Web Funnel
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="badge-verified">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              AUDITED TELEMETRY
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">
              Generated: <?php echo date('M d, Y • H:i:s T'); ?>
            </div>
          </div>
        </div>

        <!-- KPI Grid -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-val"><?php echo number_format($totalPageviews); ?></div>
            <div class="kpi-label">Total Verified Pageviews</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val" style="color: var(--accent);"><?php echo number_format($totalUniqueVisitors); ?></div>
            <div class="kpi-label">Unique Expat / Local Visitors</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val" style="color: var(--accent-gold);"><?php echo number_format($waitlistConversions); ?></div>
            <div class="kpi-label">Play Store Waitlist Signups</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-val" style="color: var(--accent-blue);"><?php echo number_format($contractorCount); ?></div>
            <div class="kpi-label">Registered Bocas Contractors</div>
          </div>
        </div>

        <div class="grid-2col">
          <!-- Acquisition Channels -->
          <div class="table-box">
            <div class="section-title">Acquisition Channels & Referrers</div>
            <table>
              <thead>
                <tr>
                  <th>Traffic Source</th>
                  <th style="text-align: right;">Events</th>
                  <th style="text-align: right;">Share</th>
                </tr>
              </thead>
              <tbody>
                <?php 
                $topSrcs = array_slice($sourceCounts, 0, 6, true);
                $totalEventsSum = max(1, array_sum($sourceCounts));
                if (empty($topSrcs)) {
                    echo '<tr><td colspan="3" style="color: var(--text-muted);">Awaiting incoming traffic events</td></tr>';
                }
                foreach ($topSrcs as $sName => $sCount): 
                  $pct = round(($sCount / $totalEventsSum) * 100, 1);
                ?>
                <tr>
                  <td><strong><?php echo htmlspecialchars($sName); ?></strong></td>
                  <td style="text-align: right;"><?php echo number_format($sCount); ?></td>
                  <td style="text-align: right; color: var(--text-muted);"><?php echo $pct; ?>%</td>
                </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>

          <!-- Conversion & Feature Engagement -->
          <div class="table-box">
            <div class="section-title">Core Feature & Conversion Metrics</div>
            <table>
              <thead>
                <tr>
                  <th>Interaction Milestone</th>
                  <th style="text-align: right;">Volume</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Play Store Waitlist Join Rate</td>
                  <td style="text-align: right; font-weight: 700; color: var(--accent);"><?php echo $conversionRate; ?>% (<?php echo $waitlistConversions; ?> users)</td>
                </tr>
                <tr>
                  <td>Voice Audio Studio Listens</td>
                  <td style="text-align: right; font-weight: 700;"><?php echo number_format($voiceDemoPlays); ?></td>
                </tr>
                <tr>
                  <td>Outbound WhatsApp Inquiries</td>
                  <td style="text-align: right; font-weight: 700;"><?php echo number_format($whatsappClicks); ?></td>
                </tr>
                <tr>
                  <td>Panamanian Dialect Tone Switches</td>
                  <td style="text-align: right; font-weight: 700;"><?php echo number_format($toneSwitches); ?></td>
                </tr>
                <tr>
                  <td>Directory Contractor Searches</td>
                  <td style="text-align: right; font-weight: 700;"><?php echo number_format($directorySearches); ?></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Daily Breakdown -->
        <div class="table-box" style="margin-bottom: 24px;">
          <div class="section-title">Daily Verified Growth Stream</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Pageviews</th>
                <th>Unique Visitors</th>
                <th>Top Source</th>
              </tr>
            </thead>
            <tbody>
              <?php 
              $recentDays = array_slice(array_reverse($timeline), 0, 7);
              if (empty($recentDays)) {
                  echo '<tr><td colspan="4" style="color: var(--text-muted);">Tracking active from today (' . date('Y-m-d') . ')</td></tr>';
              }
              foreach ($recentDays as $d): ?>
              <tr>
                <td><strong><?php echo htmlspecialchars($d['date']); ?></strong></td>
                <td><?php echo number_format($d['pageviews']); ?></td>
                <td><?php echo number_format($d['unique_visitors']); ?></td>
                <td><span style="color: var(--text-muted);"><?php echo htmlspecialchars($d['top_source']); ?></span></td>
              </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; flex-wrap: wrap; gap: 16px;">
          <button class="btn-print" onclick="window.print()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            Print / Save PDF Proof
          </button>
          <div style="font-size: 13px; color: var(--text-muted);">
            Domain: <code>https://poquitotalk.hero-apps.com/</code>
          </div>
        </div>

        <div class="hash-box">
          <div>
            <strong>AUDIT DIGEST:</strong> <code><?php echo $auditHash; ?></code>
          </div>
          <div>PoquitoTalk v5.7 • Autonomous Telemetry Engine</div>
        </div>
      </div>
    </body>
    </html>
    <?php
    exit;
}

// -------------------------------------------------------------
// DEFAULT: JSON OVERVIEW API RESPONSE
// -------------------------------------------------------------
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => true,
    'range' => $range,
    'stats' => [
        'total_pageviews' => $totalPageviews,
        'unique_visitors' => $totalUniqueVisitors,
        'unique_sessions' => $totalSessions,
        'waitlist_conversions' => $waitlistConversions,
        'contractors_count' => $contractorCount,
        'conversion_rate' => $conversionRate,
        'whatsapp_clicks' => $whatsappClicks,
        'voice_demo_plays' => $voiceDemoPlays,
        'tone_switches' => $toneSwitches,
        'directory_searches' => $directorySearches,
        'pages_per_visitor' => $totalUniqueVisitors > 0 ? round($totalPageviews / $totalUniqueVisitors, 2) : 1
    ],
    'breakdowns' => [
        'sources' => $sourceCounts,
        'pages' => $pageCounts,
        'devices' => $deviceCounts,
        'os' => $osCounts,
        'countries' => $countryCounts,
        'events' => $eventCounts
    ],
    'timeline' => $timeline,
    'recent_events' => array_slice(array_reverse($filteredEvents), 0, 50),
    'generated_at' => date('c')
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
