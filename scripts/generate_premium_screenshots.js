const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const PORT = 8098;

// ── Read Poquito vector assets from disk ───────────────────────
const POQUITO_TALKIE_SVG = fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_talkie.svg'), 'utf8');
const POQUITO_CLEAN_SVG  = fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_clean.svg'), 'utf8');
const POQUITO_VICTORY_SVG= fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_victory.svg'), 'utf8');
const POQUITO_FRONT_SVG  = fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_front.svg'), 'utf8');

// ── Read WebP mascot assets as base64 for reliable rendering ─
const POQUITO_GREET_BASE64  = `data:image/webp;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_greet_5_17_160.webp')).toString('base64')}`;
const POQUITO_VICTORY_BASE64= `data:image/webp;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_victory_jump_256.webp')).toString('base64')}`;
const POQUITO_LISTEN_BASE64 = `data:image/webp;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_listening_49_60_160.webp')).toString('base64')}`;

// ── Inline Vector SVGs (Rules: monoline / duotone, no emojis) ─
const SVG_ICONS = {
  boat: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a6 6 0 0 0 4.5-2 6 6 0 0 1 7 0 6 6 0 0 1 4.5 2"/><path d="M4 14l2-8 12 1 2 7"/><path d="M12 7V3"/></svg>`,
  power: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  ac: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>`,
  mic: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  heart: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C24B3A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  offline: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0-4 7h1.26a5 5 0 0 0 8.74 3.95"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  whatsappWhite: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  radio: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.93 19.07A10 10 0 0 1 2 12a10 10 0 0 1 2.93-7.07"/><path d="M19.07 4.93A10 10 0 0 1 22 12a10 10 0 0 1-2.93 7.07"/><path d="M7.76 16.24A6 6 0 0 1 6 12a6 6 0 0 1 1.76-4.24"/><path d="M16.24 7.76A6 6 0 0 1 18 12a6 6 0 0 1-1.76 4.24"/><circle cx="12" cy="12" r="2"/></svg>`,
  shield: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  browser: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  waves: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v4"/><path d="M6 6v12"/><path d="M10 3v18"/><path d="M14 8v8"/><path d="M18 5v14"/><path d="M22 10v4"/></svg>`,
  sync: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`
};

// ── Custom peeking-corner Poquito SVG ─────────────────────────
const POQUITO_PEEKING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none">
  <!-- Body tucked below (just the top arc visible) -->
  <ellipse cx="100" cy="200" rx="72" ry="88" fill="#10B981" stroke="#047857" stroke-width="4"/>
  <!-- Teal belly highlight -->
  <ellipse cx="100" cy="200" rx="46" ry="58" fill="#34D399" stroke="none"/>
  <!-- Crest feathers poking up -->
  <path d="M 86 76 C 82 62 78 52 70 46" stroke="#047857" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M 97 72 C 93 57 88 47 80 42" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M 108 73 C 105 59 102 50 97 47" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Eyes (large, expressive, surprised wide-open) -->
  <circle cx="80" cy="110" r="18" fill="#fff" stroke="#047857" stroke-width="3"/>
  <circle cx="120" cy="110" r="18" fill="#fff" stroke="#047857" stroke-width="3"/>
  <circle cx="82" cy="113" r="10" fill="#0F172A"/>
  <circle cx="122" cy="113" r="10" fill="#0F172A"/>
  <!-- Eye shine -->
  <circle cx="78" cy="108" r="3.5" fill="#fff"/>
  <circle cx="118" cy="108" r="3.5" fill="#fff"/>
  <!-- Beak -->
  <path d="M 97 132 C 108 132 116 142 108 150 C 104 153 96 150 97 145 C 98 140 96 134 97 132 Z" fill="#F59E0B" stroke="#047857" stroke-width="3" stroke-linejoin="round"/>
  <path d="M 97 145 C 102 147 104 151 99 152 C 96 152 95 148 97 145 Z" fill="#D97706" stroke="#047857" stroke-width="1.8" stroke-linejoin="round"/>
  <!-- Left wing gripping ledge edge (left side) -->
  <path d="M 28 148 C 22 138 24 124 36 118 C 50 112 62 116 66 128 C 70 138 62 152 50 156 C 40 158 32 156 28 148 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- Right wing gripping ledge edge (right side) -->
  <path d="M 172 148 C 178 138 176 124 164 118 C 150 112 138 116 134 128 C 130 138 138 152 150 156 C 160 158 168 156 172 148 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round"/>
</svg>`;

// ── Static server ────────────────────────────────────────────
const mimeTypes = {
  '.html':'text/html','.css':'text/css','.js':'text/javascript',
  '.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp',
  '.svg':'image/svg+xml','.json':'application/json',
  '.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2','.ico':'image/x-icon',
};

function startStaticServer() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(DIST_DIR, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const fallback = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(fallback)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(fallback).pipe(res);
      } else { res.writeHead(404); res.end('Not Found'); }
    }
  });
  return new Promise(resolve => server.listen(PORT, () => {
    console.log(`🌐 Server running at http://localhost:${PORT}`);
    resolve(server);
  }));
}

// ── Capture app screen with optional click and scroll ────────
async function captureAppScreen(browser, urlParams, { scrollOffset = 0, hScrollOffset = 0 } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto(`http://localhost:${PORT}/?${urlParams}`, { waitUntil: ['load','networkidle2'], timeout: 25000 });
  await page.evaluate(() => {
    try {
      localStorage.setItem('@poquito_onboarding_completed', 'true');
      localStorage.setItem('@poquito_user_voice', 'diego');
    } catch(e) {}
  });
  await page.addStyleTag({ content: `*{box-sizing:border-box}html,body,#root{margin:0!important;padding:0!important;width:100%!important;height:100%!important;overflow:hidden!important}` });
  await new Promise(r => setTimeout(r, 2200));

  if (hScrollOffset > 0) {
    await page.evaluate((offset) => {
      const hScrollables = Array.from(document.querySelectorAll('div')).filter(d => {
        const style = window.getComputedStyle(d);
        return (style.overflowX === 'auto' || style.overflowX === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll') && d.scrollWidth > d.clientWidth;
      });
      if (hScrollables.length > 0) {
        hScrollables[0].scrollLeft = offset;
      }
    }, hScrollOffset);
    await new Promise(r => setTimeout(r, 400));
  }

  if (scrollOffset > 0) {
    await page.evaluate((offset) => {
      const scrollables = Array.from(document.querySelectorAll('div')).filter(d => {
        const style = window.getComputedStyle(d);
        return (style.overflowY === 'auto' || style.overflowY === 'scroll') && d.scrollHeight > d.clientHeight;
      });
      if (scrollables.length > 0) {
        scrollables[0].scrollTop = offset;
      } else {
        window.scrollBy(0, offset);
      }
    }, scrollOffset);
    await new Promise(r => setTimeout(r, 500));
  }

  const b64 = await page.screenshot({ encoding: 'base64' });
  await page.close();
  return `data:image/png;base64,${b64}`;
}

// ════════════════════════════════════════════════════════════════
// SCREENSHOT 1 — HERO SPLIT (Warm & Respectful Spanish)
// ════════════════════════════════════════════════════════════════
async function renderScreen1(browser, appImg) {
  console.log('🎨 Screenshot 1: Warm & Respectful Spanish hero…');
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  const html = `<!DOCTYPE html><html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  width:1080px;height:1920px;
  background:#FAF8F5;
  font-family:'Plus Jakarta Sans',sans-serif;
  overflow:hidden;position:relative;
}
.glow-tl{
  position:absolute;top:-60px;left:-60px;
  width:580px;height:580px;
  background:radial-gradient(circle,rgba(252,211,77,0.14) 0%,transparent 68%);
  border-radius:50%;pointer-events:none;
}
.glow-br{
  position:absolute;bottom:-80px;right:-80px;
  width:500px;height:500px;
  background:radial-gradient(circle,rgba(16,185,129,0.10) 0%,transparent 68%);
  border-radius:50%;pointer-events:none;
}
.divider{
  position:absolute;top:160px;bottom:160px;left:530px;
  width:1.5px;
  background:linear-gradient(to bottom,transparent,rgba(150,72,36,0.14) 25%,rgba(150,72,36,0.14) 75%,transparent);
}
.left{
  position:absolute;left:0;top:0;bottom:0;width:530px;
  display:flex;flex-direction:column;justify-content:center;
  padding:75px 30px 75px 65px;
}
.kicker{
  display:inline-flex;align-items:center;gap:9px;
  background:rgba(5,150,105,0.10);
  border:1.5px solid rgba(5,150,105,0.28);
  padding:9px 20px;border-radius:100px;
  font-size:15px;font-weight:800;
  color:#059669;letter-spacing:0.8px;
  margin-bottom:20px;width:fit-content;
}
.kicker-dot{width:8px;height:8px;background:#25D366;border-radius:50%;}
h1{
  font-family:'Lexend',sans-serif;
  font-size:62px;font-weight:900;
  line-height:1.06;letter-spacing:-1.8px;
  color:#1A1208;margin-bottom:18px;
}
h1 em{color:#C24B3A;font-style:normal;}
.body{font-size:19px;font-weight:500;color:#5C4E3A;line-height:1.5;margin-bottom:26px;}
.chips{display:flex;flex-direction:column;gap:11px;margin-bottom:28px;}
.chip{
  display:flex;align-items:center;gap:14px;
  background:#fff;
  border:1.5px solid rgba(150,72,36,0.12);
  border-radius:16px;padding:12px 16px;
  box-shadow:0 4px 14px rgba(150,72,36,0.06);
}
.chip-ico{
  width:40px;height:40px;border-radius:11px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.chip-title{font-size:17px;font-weight:700;color:#1A1208;}
.chip-sub{font-size:13px;font-weight:500;color:#786C5E;margin-top:2px;}

.poquito-wrap{
  display:flex;justify-content:center;align-items:center;
  margin-top:6px;
}
.poquito-box{
  width:215px;height:auto;
  filter:drop-shadow(0 14px 32px rgba(16,185,129,0.22));
}

.right{
  position:absolute;right:0;top:0;bottom:0;width:550px;
  display:flex;align-items:center;justify-content:flex-end;
  overflow:hidden;padding-top:40px;
}
.phone{
  width:540px;height:1440px;
  background:#0f1012;
  border-top-left-radius:54px;border-bottom-left-radius:54px;
  border-top-right-radius:0;border-bottom-right-radius:0;
  padding:11px 0 11px 11px;
  box-shadow:-24px 44px 110px rgba(150,72,36,0.28),-8px 14px 30px rgba(0,0,0,0.18),inset 0 0 0 1.5px rgba(255,255,255,0.09);
  border:3.5px solid #252830;border-right:none;
  position:relative;
}
.notch{position:absolute;top:19px;left:50%;transform:translateX(-50%);width:88px;height:21px;background:#000;border-radius:14px;z-index:10;}
.screen{width:100%;height:100%;border-top-left-radius:44px;border-bottom-left-radius:44px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:fill;display:block;}
</style>
</head>
<body>
  <div class="glow-tl"></div>
  <div class="glow-br"></div>
  <div class="divider"></div>

  <div class="left">
    <div class="kicker"><span class="kicker-dot"></span>LOCALS PREFER VOICE NOTES</div>
    <h1>Translate into<br><em>Warm & Respectful</em><br>Spanish</h1>
    <p class="body">Speak or type in English. Poquito translates into authentic Panamanian Spanish and shares ready-to-tap audio.</p>
    
    <div class="chips">
      <div class="chip">
        <div class="chip-ico" style="background:#E8F9EE;">${SVG_ICONS.mic}</div>
        <div><div class="chip-title">Ready-to-Tap Voice Notes</div><div class="chip-sub">Plays directly in WhatsApp via web link</div></div>
      </div>
      <div class="chip">
        <div class="chip-ico" style="background:#FFF5EE;">${SVG_ICONS.heart}</div>
        <div><div class="chip-title">Warm, Respectful Phrasing</div><div class="chip-sub">Authentic island tone locals appreciate</div></div>
      </div>
      <div class="chip">
        <div class="chip-ico" style="background:#EEF6FF;">${SVG_ICONS.offline}</div>
        <div><div class="chip-title">Works Offline Too</div><div class="chip-sub">Built-in emergency presets, no WiFi needed</div></div>
      </div>
    </div>

    <!-- Poquito talkie centered in left column -->
    <div class="poquito-wrap">
      <div class="poquito-box">
        ${POQUITO_TALKIE_SVG.replace('<svg ','<svg width="215" height="215" ')}
      </div>
    </div>
  </div>

  <div class="right">
    <div class="phone">
      <div class="notch"></div>
      <div class="screen"><img src="${appImg}"/></div>
    </div>
  </div>
</body></html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR,'play_store_screenshot_1_dynamic.png') });
  await page.close();
  console.log('✅ Screenshot 1 done');
}

// ════════════════════════════════════════════════════════════════
// SCREENSHOT 2 — ISLAND ERRANDS, ZERO STRESS
// ════════════════════════════════════════════════════════════════
async function renderScreen2(browser, appImg) {
  console.log('🎨 Screenshot 2: Island Errands (scrolled up, left Poquito, SVG pills)…');
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  const html = `<!DOCTYPE html><html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  width:1080px;height:1920px;
  background:linear-gradient(175deg,#FEF9F0 0%,#F6FBF7 55%,#F0FAF7 100%);
  font-family:'Plus Jakarta Sans',sans-serif;
  overflow:hidden;position:relative;
}
.glow-top{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:700px;height:400px;background:radial-gradient(ellipse,rgba(252,165,80,0.11) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.glow-bot{position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);width:800px;height:400px;background:radial-gradient(ellipse,rgba(16,185,129,0.09) 0%,transparent 68%);border-radius:50%;pointer-events:none;}

.head{position:absolute;top:60px;left:0;right:0;text-align:center;padding:0 70px;}
.badge{
  display:inline-flex;align-items:center;gap:9px;
  background:rgba(16,185,129,0.10);
  border:1.5px solid rgba(16,185,129,0.28);
  padding:9px 22px;border-radius:100px;
  font-size:16px;font-weight:800;color:#059669;
  letter-spacing:0.9px;margin-bottom:16px;
}
.badge-dot{width:8px;height:8px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:78px;font-weight:900;line-height:1.03;letter-spacing:-2.5px;color:#1A1208;margin-bottom:12px;}
h1 em{color:#059669;font-style:normal;}
.sub{font-size:22px;font-weight:500;color:#4A5E52;line-height:1.45;}

.poquito-left{
  position:absolute;top:205px;left:55px;
  z-index:15;
  filter:drop-shadow(0 14px 30px rgba(16,185,129,0.22));
}

.phone-stage{
  position:absolute;top:395px;left:50%;transform:translateX(-50%);
}
.phone{
  width:560px;height:1210px;
  background:#0f1012;border-radius:52px;padding:11px;
  box-shadow:0 56px 130px rgba(0,0,0,0.22),0 18px 50px rgba(0,0,0,0.14),inset 0 0 0 1.5px rgba(255,255,255,0.08);
  border:3.5px solid #252830;position:relative;
}
.notch{position:absolute;top:19px;left:50%;transform:translateX(-50%);width:82px;height:21px;background:#000;border-radius:14px;z-index:10;}
.screen{width:100%;height:100%;border-radius:42px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:fill;display:block;}

.pills{position:absolute;bottom:36px;left:32px;right:32px;display:flex;justify-content:space-between;gap:16px;z-index:20;}
.pill{
  flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;
  background:#ffffff;border:2px solid rgba(5,150,105,0.18);
  border-radius:26px;padding:20px 12px 18px;
  box-shadow:0 18px 40px rgba(0,0,0,0.10),0 4px 14px rgba(5,150,105,0.08);
}
.pill-ico{
  width:56px;height:56px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:10px;
}
.pill-ico.boat-ico{background:rgba(5,150,105,0.12);}
.pill-ico.power-ico{background:rgba(217,119,6,0.12);}
.pill-ico.ac-ico{background:rgba(2,132,199,0.12);}

.pill-t{font-size:22px;font-weight:800;color:#1A1208;letter-spacing:-0.4px;margin-bottom:2px;}
.pill-s{font-size:15px;font-weight:700;color:#059669;letter-spacing:0.2px;}
</style>
</head>
<body>
  <div class="glow-top"></div>
  <div class="glow-bot"></div>

  <div class="head">
    <div class="badge"><span class="badge-dot"></span>GET THINGS DONE STRESS-FREE</div>
    <h1>Island Errands,<br><em>Zero Stress</em></h1>
    <p class="sub">Ready-to-tap audio for repairs, water taxis,<br>power outages & ATMs.</p>
  </div>

  <div class="poquito-left">
    ${POQUITO_CLEAN_SVG.replace('<svg ','<svg width="190" height="190" ')}
  </div>

  <div class="phone-stage">
    <div class="phone">
      <div class="notch"></div>
      <div class="screen"><img src="${appImg}"/></div>
    </div>
  </div>

  <div class="pills">
    <div class="pill">
      <div class="pill-ico boat-ico">${SVG_ICONS.boat.replace('width="22" height="22"','width="28" height="28"')}</div>
      <div class="pill-t">Water Taxi</div>
      <div class="pill-s">Ready to tap</div>
    </div>
    <div class="pill">
      <div class="pill-ico power-ico">${SVG_ICONS.power.replace('width="22" height="22"','width="28" height="28"')}</div>
      <div class="pill-t">Power Outage</div>
      <div class="pill-s">Ready to tap</div>
    </div>
    <div class="pill">
      <div class="pill-ico ac-ico">${SVG_ICONS.ac.replace('width="22" height="22"','width="28" height="28"')}</div>
      <div class="pill-t">A/C Repair</div>
      <div class="pill-s">Ready to tap</div>
    </div>
  </div>
</body></html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR,'play_store_screenshot_2_dynamic.png') });
  await page.close();
  console.log('✅ Screenshot 2 done');
}

// ════════════════════════════════════════════════════════════════
// SCREENSHOT 3 — VERIFIED ISLAND DIRECTORY
// ════════════════════════════════════════════════════════════════
async function renderScreen3(browser, appImg) {
  console.log('🎨 Screenshot 3: Directory with open card + peeking Poquito…');
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  const html = `<!DOCTYPE html><html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  width:1080px;height:1920px;
  background:#FFFCF8;
  font-family:'Plus Jakarta Sans',sans-serif;
  overflow:hidden;position:relative;
}
.bg-tint{
  position:absolute;inset:0;
  background:radial-gradient(ellipse at 20% 10%,rgba(150,72,36,0.06) 0%,transparent 55%),
             radial-gradient(ellipse at 85% 90%,rgba(5,150,105,0.06) 0%,transparent 55%);
  pointer-events:none;
}
.head{position:absolute;top:66px;left:0;right:0;text-align:center;padding:0 70px;}
.badge{
  display:inline-flex;align-items:center;gap:8px;
  background:rgba(5,150,105,0.09);
  border:1.5px solid rgba(5,150,105,0.24);
  padding:8px 20px;border-radius:100px;
  font-size:16px;font-weight:800;color:#059669;
  letter-spacing:0.9px;margin-bottom:16px;
}
.check{font-size:15px;font-weight:900;}
h1{font-family:'Lexend',sans-serif;font-size:78px;font-weight:900;line-height:1.03;letter-spacing:-2.5px;color:#1A1208;margin-bottom:12px;}
h1 span{color:#059669;}
.sub{font-size:22px;font-weight:500;color:#5C4E3A;line-height:1.48;}

.phone-wrap{
  position:absolute;top:415px;left:50%;transform:translateX(-52%) rotate(-3.5deg);
  width:570px;height:1200px;
  background:#0f1012;border-radius:52px;padding:11px;
  box-shadow:10px 52px 120px rgba(150,72,36,0.28),4px 16px 40px rgba(0,0,0,0.18),inset 0 0 0 1.5px rgba(255,255,255,0.09);
  border:3.5px solid #252830;z-index:5;
}
.notch{position:absolute;top:19px;left:50%;transform:translateX(-50%);width:84px;height:21px;background:#000;border-radius:14px;z-index:20;}
.screen{width:100%;height:100%;border-radius:42px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}

.card{
  position:absolute;
  background:#fff;border-radius:22px;
  padding:18px 22px;
  box-shadow:0 14px 40px rgba(0,0,0,0.12),0 4px 12px rgba(0,0,0,0.06);
  border:1.5px solid rgba(150,72,36,0.10);z-index:20;
}
.ct{font-size:18px;font-weight:800;color:#1A1208;}
.cs{font-size:13px;font-weight:500;color:#786C5E;margin-top:3px;}
.ci{margin-bottom:8px;}

.card-wa{top:425px;right:36px;width:255px;background:linear-gradient(135deg,#059669 0%,#10B981 100%);border:none;}
.card-wa .ct{color:#fff;}
.card-wa .cs{color:rgba(255,255,255,0.85);}

.card-stars{top:730px;left:36px;width:245px;}
.stars-row{display:flex;gap:4px;margin-bottom:8px;}

.card-count{bottom:220px;right:36px;width:228px;background:#1A1208;border:none;}
.card-count .ct{color:#FCD34D;font-size:36px;font-weight:900;}
.card-count .cs{color:rgba(255,255,255,0.68);font-size:14px;}

.poquito-mascot{
  position:absolute;
  bottom:45px;left:45px;
  z-index:25;
  filter:drop-shadow(0 14px 34px rgba(5,150,105,0.22));
}
</style>
</head>
<body>
  <div class="bg-tint"></div>

  <div class="head">
    <div class="badge"><span class="check">✓</span> FAST ISLAND REPAIRS & SERVICES</div>
    <h1>Verified <span>Island</span><br>Directory</h1>
    <p class="sub">Ready-to-tap WhatsApp links to trusted Bocas del Toro<br>captains, mechanics & clinics.</p>
  </div>

  <div class="phone-wrap">
    <div class="notch"></div>
    <div class="screen"><img src="${appImg}"/></div>
  </div>

  <div class="card card-wa">
    <div class="ci">${SVG_ICONS.whatsappWhite}</div>
    <div class="ct">Direct WhatsApp</div>
    <div class="cs">Shared as ready-to-tap link</div>
  </div>
  <div class="card card-stars">
    <div class="stars-row">
      ${SVG_ICONS.star}${SVG_ICONS.star}${SVG_ICONS.star}${SVG_ICONS.star}${SVG_ICONS.star}
    </div>
    <div class="ct">Bocas Trusted</div>
    <div class="cs">Vetted local pros only</div>
  </div>
  <div class="card card-count">
    <div class="ct">74+</div>
    <div class="cs">Verified Captains</div>
  </div>

  <div class="poquito-mascot">
    ${POQUITO_FRONT_SVG.replace('<svg ','<svg width="220" height="220" ')}
  </div>
</body></html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR,'play_store_screenshot_3_dynamic.png') });
  await page.close();
  console.log('✅ Screenshot 3 done');
}

// ════════════════════════════════════════════════════════════════
// SCREENSHOT 4 — TALK LIVE WITH YOUR CONTRACTOR
// ════════════════════════════════════════════════════════════════
async function renderScreen4(browser, appImg) {
  console.log('🎨 Screenshot 4: Talk Live with Your Contractor…');
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  const html = `<!DOCTYPE html><html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  width:1080px;height:1920px;
  background:linear-gradient(160deg,#F8F6F2 0%,#F3F8F5 50%,#EEF7F4 100%);
  font-family:'Plus Jakarta Sans',sans-serif;
  overflow:hidden;position:relative;
}
.blob-tl{position:absolute;top:-80px;left:-80px;width:600px;height:500px;background:radial-gradient(circle,rgba(252,211,77,0.12) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.blob-br{position:absolute;bottom:-60px;right:-60px;width:540px;height:460px;background:radial-gradient(circle,rgba(37,211,102,0.10) 0%,transparent 68%);border-radius:50%;pointer-events:none;}

.head{position:absolute;top:66px;left:0;right:0;text-align:center;padding:0 70px;}
.badge{
  display:inline-flex;align-items:center;gap:9px;
  background:rgba(37,211,102,0.10);
  border:1.5px solid rgba(37,211,102,0.28);
  padding:9px 22px;border-radius:100px;
  font-size:16px;font-weight:800;color:#16A34A;
  letter-spacing:0.9px;margin-bottom:16px;
}
.live-dot{width:8px;height:8px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:78px;font-weight:900;line-height:1.03;letter-spacing:-2.5px;color:#1A1208;margin-bottom:12px;}
h1 em{color:#16A34A;font-style:normal;}
.sub{font-size:21px;font-weight:500;color:#4A5E52;line-height:1.48;}

.phone-stage{
  position:absolute;top:410px;left:50%;transform:translateX(-50%);
}
.phone{
  width:556px;height:1170px;
  background:#0f1012;border-radius:52px;padding:11px;
  box-shadow:0 60px 130px rgba(0,0,0,0.20),0 18px 50px rgba(0,0,0,0.12),inset 0 0 0 1.5px rgba(255,255,255,0.08);
  border:3.5px solid #252830;position:relative;
}
.notch{position:absolute;top:19px;left:50%;transform:translateX(-50%);width:82px;height:21px;background:#000;border-radius:14px;z-index:10;}
.screen{width:100%;height:100%;border-radius:42px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}

.poquito-right{
  position:absolute;
  right:65px;top:325px;
  z-index:25;
}

.gcard{
  position:absolute;
  background:rgba(255,255,255,0.98);
  border:1.5px solid rgba(16,185,129,0.18);
  border-radius:24px;
  padding:20px 18px;
  box-shadow:0 18px 45px rgba(0,0,0,0.12),0 4px 14px rgba(0,0,0,0.06);
  z-index:20;
  text-align:center;
}
.gcard-i{
  display:flex;justify-content:center;align-items:center;margin-bottom:10px;
}
.icon-circle{
  width:44px;height:44px;border-radius:50%;
  background:rgba(37,211,102,0.12);
  display:flex;align-items:center;justify-content:center;
}
.gcard-t{font-size:20px;font-weight:800;color:#1A1208;text-align:center;}
.gcard-s{font-size:15px;font-weight:600;color:#3D4F44;margin-top:4px;line-height:1.35;text-align:center;}

.cta{
  position:absolute;bottom:55px;left:50%;transform:translateX(-50%);
  display:inline-flex;align-items:center;gap:14px;
  background:#25D366;
  border-radius:100px;padding:20px 48px;
  box-shadow:0 12px 44px rgba(37,211,102,0.38);
  white-space:nowrap;
}
.cta-t{font-size:23px;font-weight:800;color:#fff;}
</style>
</head>
<body>
  <div class="blob-tl"></div>
  <div class="blob-br"></div>

  <div class="head">
    <div class="badge"><span class="live-dot"></span>WARM RESPECT FOR LOCALS</div>
    <h1>Talk <em>Live</em> with<br>Your Contractor</h1>
    <p class="sub">2-way real-time voice translation.<br>They speak Spanish, you hear English.</p>
  </div>

  <div class="phone-stage">
    <div class="phone">
      <div class="notch"></div>
      <div class="screen"><img src="${appImg}"/></div>
    </div>
  </div>

  <div class="poquito-right">
    <img src="${POQUITO_VICTORY_BASE64}" style="width:280px;height:auto;filter:drop-shadow(0 18px 45px rgba(16,185,129,0.32));"/>
  </div>

  <div class="gcard" style="top:460px;left:24px;width:300px;">
    <div class="gcard-i"><div class="icon-circle">${SVG_ICONS.browser}</div></div>
    <div class="gcard-t">No App Download</div>
    <div class="gcard-s">Contractor opens link directly in their phone browser</div>
  </div>
  <div class="gcard" style="top:655px;left:24px;width:300px;">
    <div class="gcard-i"><div class="icon-circle">${SVG_ICONS.waves}</div></div>
    <div class="gcard-t">Real-Time Audio</div>
    <div class="gcard-s">Instant, private & clear voice notes</div>
  </div>
  <div class="gcard" style="top:850px;left:24px;width:300px;">
    <div class="gcard-i"><div class="icon-circle">${SVG_ICONS.sync}</div></div>
    <div class="gcard-t">2-Way Live Talk</div>
    <div class="gcard-s">They speak Spanish, you hear English</div>
  </div>

  <div class="cta">
    <div style="display:flex;align-items:center;">${SVG_ICONS.whatsappWhite}</div>
    <span class="cta-t">Start Channel & Share on WhatsApp</span>
  </div>
</body></html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR,'play_store_screenshot_4_dynamic.png') });
  await page.close();
  console.log('✅ Screenshot 4 done');
}

// ════════════════════════════════════════════════════════════════
// 4-UP SHOWCASE COMPOSITE
// ════════════════════════════════════════════════════════════════
async function renderShowcase(browser) {
  console.log('🎨 Composing 4-up showcase…');
  const pages = [
    'play_store_screenshot_1_dynamic.png',
    'play_store_screenshot_2_dynamic.png',
    'play_store_screenshot_3_dynamic.png',
    'play_store_screenshot_4_dynamic.png',
  ];
  const imgs = pages.map(p => `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR,p)).toString('base64')}`);

  const page = await browser.newPage();
  await page.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  width:2400px;height:1350px;
  background:linear-gradient(135deg,#FFF8F2 0%,#FAF6F0 50%,#F5EDE0 100%);
  font-family:'Plus Jakarta Sans',sans-serif;
  display:flex;flex-direction:column;
  justify-content:space-between;
  padding:44px 60px 36px;overflow:hidden;
}
.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(150,72,36,0.12);padding-bottom:18px;}
.brand-name{font-family:'Lexend',sans-serif;font-size:32px;font-weight:900;color:#1A1208;}
.brand-tag{display:inline-block;background:#FFDBCD;color:#964824;font-size:13px;font-weight:800;padding:4px 13px;border-radius:100px;border:1px solid rgba(150,72,36,0.28);margin-left:10px;}
.brand-sub{font-size:16px;font-weight:600;color:#786C5E;margin-top:3px;}
.hdr-r{font-size:16px;font-weight:700;color:#964824;}
.stage{display:flex;gap:24px;flex:1;align-items:center;margin:18px 0;}
.card{flex:1;height:100%;border-radius:26px;overflow:hidden;box-shadow:0 18px 54px rgba(89,79,66,0.15),0 5px 16px rgba(0,0,0,0.05);border:2px solid rgba(255,255,255,0.95);}
.card img{width:100%;height:100%;object-fit:cover;}
.ftr{display:flex;justify-content:space-between;align-items:center;border-top:1.5px solid rgba(150,72,36,0.12);padding-top:12px;font-size:14px;font-weight:600;color:#786C5E;}
.ftr strong{color:#1A1208;}
</style>
</head>
<body>
  <div class="hdr">
    <div><div class="brand-name">PoquitoTalk <span class="brand-tag">Premium Store Suite</span></div><div class="brand-sub">Locals Prefer Voice Notes • Island Errands • Verified Directory • Talk Live</div></div>
    <div class="hdr-r">Google Play Store Ready • 1080 × 1920 px</div>
  </div>
  <div class="stage">
    ${imgs.map(src=>`<div class="card"><img src="${src}"/></div>`).join('\n    ')}
  </div>
  <div class="ftr">
    <div>Outcome-Driven Messaging • Bocas del Toro Island Palette • Poquito Mascot Series</div>
    <div>Created by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com 🇵🇦</div>
  </div>
</body></html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(WORKSPACE_DIR,'poquitotalk_dynamic_showcase_4up.png') });
  await page.close();
  console.log('✅ 4-up showcase saved');
}

// ════════════════════════════════════════════════════════════════
// MAIN RUNNER
// ════════════════════════════════════════════════════════════════
async function run() {
  const server = await startStaticServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
  });

  console.log('📸 Capturing app screens…');
  console.log('  -> Capturing Screenshot 1 (Translate)…');
  const translateImg = await captureAppScreen(browser, 'tab=Translate&prompt=Can%20you%20check%20the%20AC%20freon%20today%3F&output=%C2%A1Buenas!%20%C2%BFPuedes%20revisar%20el%20gas%20del%20aire%20hoy%20mismo%3F');
  
  console.log('  -> Capturing Screenshot 2 (Presets)…');
  const presetsExpandedImg = await captureAppScreen(browser, 'tab=Presets&preset=water_taxi', { scrollOffset: 75, hScrollOffset: 270 });
  
  console.log('  -> Capturing Screenshot 3 (Directory)…');
  const directoryExpandedImg = await captureAppScreen(browser, 'tab=Directory&deck=boat', { scrollOffset: 30 });
  
  console.log('  -> Capturing Screenshot 4 (Walkie)…');
  const walkieImg = await captureAppScreen(browser, 'tab=Translate&walkie=true');
  console.log('✅ All app screens captured');

  await renderScreen1(browser, translateImg);
  await renderScreen2(browser, presetsExpandedImg);
  await renderScreen3(browser, directoryExpandedImg);
  await renderScreen4(browser, walkieImg);
  await renderShowcase(browser);

  await browser.close();
  server.close();
  console.log('🎉 All premium screenshots successfully generated!');
}

run().catch(err => { console.error('❌', err); process.exit(1); });
