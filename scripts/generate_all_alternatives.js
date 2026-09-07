/**
 * generate_all_alternatives.js
 * Generates both Set A (Full Phone with Full Directory Stack) and Set B (Top-Half Zoomed Alternatives),
 * plus individual composites and a master side-by-side comparison.
 */

const puppeteer = require('puppeteer');
const http      = require('http');
const path      = require('path');
const fs        = require('fs');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');

const PORT          = 8098;
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DIST_DIR      = path.join(WORKSPACE_DIR, 'dist');
const CHROME_PATH   = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ── Read Vector Assets ─────────────────────────────────────────
const POQUITO_TALKIE_SVG = fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_talkie.svg'), 'utf8');
const POQUITO_CLEAN_SVG  = fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_clean.svg'), 'utf8');
const POQUITO_LOOK_DOWN_SVG = POQUITO_CLEAN_SVG
  .replace('cy="42" r="4.5"', 'cy="45.5" r="4.5"')
  .replace('cy="40" r="1.8"', 'cy="44" r="1.8"');
const POQUITO_VICTORY_SVG= fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_victory.svg'), 'utf8');
const POQUITO_FRONT_SVG  = fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_front.svg'), 'utf8');
const POQUITO_FRONT_LOOK_DOWN_SVG = POQUITO_FRONT_SVG
  .replace('<circle cx="69" cy="56" r="4.5" fill="#0F172A" />', '<circle cx="67" cy="60.5" r="4.5" fill="#0F172A" />')
  .replace('<circle cx="67" cy="54" r="1.8" fill="#FFFFFF" />', '<circle cx="65.5" cy="59" r="1.8" fill="#FFFFFF" />')
  .replace('<circle cx="95" cy="56" r="4.5" fill="#0F172A" />', '<circle cx="93" cy="60.5" r="4.5" fill="#0F172A" />')
  .replace('<circle cx="93" cy="54" r="1.8" fill="#FFFFFF" />', '<circle cx="91.5" cy="59" r="1.8" fill="#FFFFFF" />');

const POQUITO_GREET_BASE64  = `data:image/webp;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_greet_5_17_160.webp')).toString('base64')}`;
const POQUITO_VICTORY_BASE64= `data:image/webp;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_victory_jump_256.webp')).toString('base64')}`;
const POQUITO_LISTEN_BASE64 = `data:image/webp;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_listening_49_60_160.webp')).toString('base64')}`;
const POQUITO_RUFFLED_RX_BASE64 = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_ruffled_rx_tight.png')).toString('base64')}`;
const POQUITO_RUFFLED_RX_SVG = fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_ruffled_rx.svg'), 'utf8');

// ── Shared Vector Icons ────────────────────────────────────────
const SVG_ICONS = {
  boat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a6 6 0 0 0 4.5-2 6 6 0 0 1 7 0 6 6 0 0 1 4.5 2"/><path d="M4 14l2-8 12 1 2 7"/><path d="M12 7V3"/></svg>`,
  power: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  ac: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>`,
  sound: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  heart: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  bolt: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  whatsappWhite: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  whatsappGreen: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  star: `<svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  verifiedCheck: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA580C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  shield: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  browser: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  waves: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v4"/></svg>`,
  sync: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/><polyline points="2.5 22 2.5 16 8.5 16"/></svg>`,
  offlineSave: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#65A30D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 11a4 4 0 1 0-7.8-1.5A5.5 5.5 0 0 0 2 14c0 3 2.5 5 5.5 5h11a4.5 4.5 0 0 0 .5-9Z"/><path d="m9 13 2 2 4-4"/></svg>`,
  edit: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
};

// ── Static Web Server ──────────────────────────────────────────
function startStaticServer() {
  return new Promise((resolve) => {
    const serve = serveStatic(DIST_DIR, { index: ['index.html'] });
    const server = http.createServer((req, res) => {
      serve(req, res, finalhandler(req, res));
    });
    server.listen(PORT, () => {
      console.log(`🌐 Server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

// ── Puppeteer Screen Capture Helper ────────────────────────────
async function captureAppScreen(browser, queryParams, options = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2.5 });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('has_completed_onboarding', 'true');
    localStorage.setItem('has_seen_welcome_guide', 'true');
    localStorage.setItem('poquito_is_pro', 'true');
  });
  await page.goto(`http://localhost:${PORT}/?${queryParams}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));

  if (options.scrollOffset) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), options.scrollOffset);
    await new Promise((r) => setTimeout(r, 400));
  }
  if (options.hScrollText) {
    await page.evaluate((targetText) => {
      const all = Array.from(document.querySelectorAll('*'));
      const textNodes = all.filter(el => el.children.length === 0 && el.innerText && el.innerText.trim() === targetText);
      if (textNodes.length > 0) {
        // Walk up to the outer pill touchable/button
        let pill = textNodes[0];
        while (pill && pill.parentElement && pill.parentElement.children.length === 1) {
          pill = pill.parentElement;
        }
        if (pill && pill.parentElement && pill.parentElement.children.length > 1 && pill.parentElement.parentElement && (pill.parentElement.parentElement.scrollWidth > pill.parentElement.parentElement.clientWidth)) {
          pill = pill.parentElement;
        }

        // Find scrollable container
        let p = pill ? pill.parentElement : textNodes[0].parentElement;
        while (p && p !== document.body) {
          const style = window.getComputedStyle(p);
          const isScrollable = (style.overflowX === 'scroll' || style.overflowX === 'auto') || p.scrollWidth > p.clientWidth;
          if (isScrollable) {
            const pillRect = pill.getBoundingClientRect();
            const pRect = p.getBoundingClientRect();
            const offsetInside = (pillRect.left - pRect.left) + p.scrollLeft;
            p.scrollLeft = Math.max(0, offsetInside - 36);
            break;
          }
          p = p.parentElement;
        }
      }
    }, options.hScrollText);
    await new Promise((r) => setTimeout(r, 400));
  } else if (options.hScrollOffset !== undefined) {
    await page.evaluate((x) => {
      const scrollables = Array.from(document.querySelectorAll('*')).filter((el) => {
        const style = window.getComputedStyle(el);
        return (style.overflowX === 'scroll' || style.overflowX === 'auto') && el.scrollWidth > el.clientWidth;
      });
      scrollables.forEach(s => {
        s.scrollTo({ left: x, behavior: 'instant' });
        s.scrollLeft = x;
      });
    }, options.hScrollOffset);
    await new Promise((r) => setTimeout(r, 400));
  }

  const buf = await page.screenshot({ type: 'png' });
  await page.close();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

// ════════════════════════════════════════════════════════════════
// SET A — FULL PHONE SUITE (Including Full Directory Card Stack)
// ════════════════════════════════════════════════════════════════

// A1: Translate Hero
async function renderSetA_Screen1(browser, appImg) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;background:linear-gradient(175deg,#FEF9F0 0%,#F6FBF7 55%,#F0FAF7 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative;}
.glow-top{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:700px;height:400px;background:radial-gradient(ellipse,rgba(252,165,80,0.11) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.glow-bot{position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);width:800px;height:400px;background:radial-gradient(ellipse,rgba(16,185,129,0.09) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.head{position:absolute;top:55px;left:50%;transform:translateX(-50%);width:960px;text-align:center;}
.badge{display:inline-flex;align-items:center;gap:9px;background:rgba(16,185,129,0.10);border:1.5px solid rgba(16,185,129,0.28);padding:9px 22px;border-radius:100px;font-size:16px;font-weight:800;color:#059669;letter-spacing:0.9px;margin-bottom:14px;}
.badge-dot{width:8px;height:8px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:74px;font-weight:900;line-height:1.04;letter-spacing:-2.5px;color:#1A1208;margin-bottom:12px;}
h1 em{color:#059669;font-style:normal;}
.sub{font-size:21px;font-weight:600;color:#4A5E52;line-height:1.45;max-width:680px;margin:0 auto;}
.left-col{position:absolute;top:450px;left:45px;width:380px;z-index:20;}
.left-h2{font-family:'Lexend',sans-serif;font-size:41px;font-weight:900;line-height:1.10;color:#1A1208;margin-bottom:12px;letter-spacing:-1.2px;}
.left-h2 span{color:#964824;}
.left-p{font-size:19.5px;font-weight:600;color:#5C4E3A;line-height:1.42;margin-bottom:22px;max-width:365px;}
.proof-card{display:flex;align-items:center;gap:16px;background:#fff;border-radius:24px;padding:16px 22px;margin-bottom:14px;box-shadow:0 12px 30px rgba(0,0,0,0.07),0 2px 8px rgba(0,0,0,0.03);border:2px solid rgba(150,72,36,0.12);width:365px;}
.proof-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.proof-icon-sound{background:rgba(16,185,129,0.12);border:1.6px solid rgba(16,185,129,0.28);}
.proof-icon-heart{background:rgba(239,68,68,0.10);border:1.6px solid rgba(239,68,68,0.25);}
.proof-icon-bolt{background:rgba(245,158,11,0.12);border:1.6px solid rgba(245,158,11,0.28);}
.proof-t{font-size:22px;font-weight:900;color:#1A1208;line-height:1.15;letter-spacing:-0.4px;}
.proof-s{font-size:16.5px;font-weight:700;color:#5C4E3A;margin-top:3px;}
.poquito-mascot{position:absolute;bottom:25px;left:30px;z-index:25;filter:drop-shadow(0 16px 32px rgba(16,185,129,0.30));}
.mascot-bubble{
  position:absolute;bottom:182px;left:210px;z-index:28;
  background:#fff;border-radius:26px;padding:16px 24px;
  box-shadow:0 16px 38px rgba(0,0,0,0.12),0 3px 10px rgba(0,0,0,0.04);
  border:2.8px solid rgba(5,150,105,0.30);
  font-size:21px;font-weight:900;color:#059669;line-height:1.30;
  white-space:nowrap;
}
.mascot-bubble::before{
  content:"";position:absolute;left:-15px;top:72%;transform:translateY(-50%);
  width:0;height:0;
  border-top:12px solid transparent;border-bottom:12px solid transparent;
  border-right:16px solid rgba(5,150,105,0.30);
}
.mascot-bubble::after{
  content:"";position:absolute;left:-10px;top:72%;transform:translateY(-50%);
  width:0;height:0;
  border-top:9px solid transparent;border-bottom:9px solid transparent;
  border-right:13px solid #fff;
}
.phone-stage{position:absolute;top:420px;right:36px;width:590px;height:1260px;z-index:10;transform:rotate(2deg);}
.phone{position:relative;width:100%;height:100%;background:#111;border-radius:52px;padding:11px;box-shadow:0 50px 120px rgba(0,0,0,0.25),0 15px 40px rgba(150,72,36,0.18);border:3.5px solid #222;}
.notch{position:absolute;top:19px;left:50%;transform:translateX(-50%);width:84px;height:21px;background:#000;border-radius:14px;z-index:20;}
.screen{width:100%;height:100%;border-radius:42px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;display:block;}
</style></head><body>
<div class="glow-top"></div><div class="glow-bot"></div>
<div class="head">
  <div class="badge"><div class="badge-dot"></div> LOCALS PREFER VOICE NOTES</div>
  <h1>Stress-Free Translations<br><em>Into Warm Spanish</em></h1>
  <p class="sub">Speak in English. Poquito creates authentic Panamanian voice notes that build trust and get fast WhatsApp replies.</p>
</div>
<div class="left-col">
  <div class="left-h2">Get things done<br><span>without the stress</span></div>
  <p class="left-p">Panamanian phrasing and respectful local greetings that make island life smooth and easy.</p>
  <div class="proof-card">
    <div class="proof-icon proof-icon-sound">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
    </div>
    <div>
      <div class="proof-t">Ready-to-Tap Audio</div>
      <div class="proof-s">Voice notes for WhatsApp</div>
    </div>
  </div>
  <div class="proof-card">
    <div class="proof-icon proof-icon-heart">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    </div>
    <div>
      <div class="proof-t">Authentic Panameño</div>
      <div class="proof-s">Warm & respectful tone</div>
    </div>
  </div>
  <div class="proof-card">
    <div class="proof-icon proof-icon-bolt">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    </div>
    <div>
      <div class="proof-t">Works Offline Too</div>
      <div class="proof-s">Essential emergency presets</div>
    </div>
  </div>
</div>
<div class="poquito-mascot">
  ${POQUITO_TALKIE_SVG.replace('<svg ','<svg width="240" height="240" ')}
</div>
<div class="mascot-bubble">
  ¡Buenas!<br><span style="font-size:17px;font-weight:700;color:#2D5A43;">Ready to translate.</span>
</div>
<div class="phone-stage"><div class="phone"><div class="notch"></div><div class="screen"><img src="${appImg}"/></div></div></div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'play_store_screenshot_1_dynamic.png') });
  await page.close();
  console.log('✅ Set A: Screenshot 1 done');
}

// A2: Island Errands, Zero Stress (Presets & Emergency Audio — Large Phone Lowered, Cut Off Under Water Taxi Card, Poquito Peeking Over Top)
async function renderSetA_Screen2(browser, appImg) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;background:linear-gradient(175deg,#FEF9F0 0%,#F6FBF7 55%,#F0FAF7 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative;}
.glow-top{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:750px;height:420px;background:radial-gradient(ellipse,rgba(252,165,80,0.11) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.glow-bottom{position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);width:800px;height:450px;background:radial-gradient(ellipse,rgba(16,185,129,0.09) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.head{position:absolute;top:45px;left:0;right:0;text-align:center;padding:0 50px;z-index:20;}
.badge{display:inline-flex;align-items:center;gap:9px;background:rgba(16,185,129,0.10);border:1.5px solid rgba(16,185,129,0.28);padding:9px 22px;border-radius:100px;font-size:16px;font-weight:800;color:#059669;letter-spacing:0.9px;margin-bottom:10px;}
.badge-dot{width:8px;height:8px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:74px;font-weight:900;line-height:1.04;letter-spacing:-2.5px;color:#1A1208;margin-bottom:8px;white-space:nowrap;}
h1 em{color:#059669;font-style:normal;}
.sub{font-size:20.5px;font-weight:600;color:#4A5E52;line-height:1.35;max-width:980px;margin:0 auto;white-space:nowrap;}

.cards-row{
  position:absolute;top:220px;left:50%;transform:translateX(-50%);
  width:990px;display:flex;gap:14px;justify-content:space-between;z-index:25;
}
.proof-card{
  flex:1;display:flex;align-items:center;gap:14px;
  background:#FFFFFF;border-radius:24px;padding:15px 18px;
  box-shadow:0 12px 32px rgba(0,0,0,0.08),0 2px 8px rgba(0,0,0,0.03);
  border:2px solid rgba(150,72,36,0.12);
}
.proof-icon{width:50px;height:50px;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.proof-icon-wa{background:rgba(5,150,105,0.12);border:1.6px solid rgba(5,150,105,0.28);}
.proof-icon-offline{background:rgba(101,163,13,0.12);border:1.6px solid rgba(101,163,13,0.28);}
.proof-icon-edit{background:rgba(217,119,6,0.12);border:1.6px solid rgba(217,119,6,0.28);}
.proof-t{font-size:19.5px;font-weight:900;color:#1A1208;line-height:1.15;letter-spacing:-0.3px;white-space:nowrap;}
.proof-s{font-size:14.5px;font-weight:700;color:#5C4E3A;margin-top:3px;line-height:1.25;}

.poquito-peek{
  position:absolute;top:360px;left:50%;transform:translateX(-50%);
  width:175px;height:175px;z-index:5;
  display:flex;justify-content:center;align-items:center;
}
.poquito-peek svg{
  width:160px;height:160px;display:block;
  filter:drop-shadow(0 12px 28px rgba(0,0,0,0.14));
}

.phone-stage{
  position:absolute;top:505px;left:50%;transform:translateX(-50%);
  width:820px;height:1640px;z-index:10;
}
.phone{
  position:relative;width:100%;height:100%;
  background:#111;border-radius:64px;padding:14px;
  box-shadow:0 -10px 50px rgba(0,0,0,0.12),0 30px 100px rgba(150,72,36,0.22);
  border:4px solid #222;
}
.notch{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:96px;height:24px;background:#000;border-radius:14px;z-index:20;}
.screen{width:100%;height:100%;border-radius:52px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}
</style></head><body>
<div class="glow-top"></div>
<div class="glow-bottom"></div>
<div class="head">
  <div class="badge"><div class="badge-dot"></div> READY-TO-TAP AUDIO PRESETS</div>
  <h1>Island Errands, <em>Zero Stress</em></h1>
  <p class="sub">Ready-to-tap audio for repairs, water taxis, power outages & ATMs.</p>
</div>

<div class="cards-row">
  <div class="proof-card">
    <div class="proof-icon proof-icon-wa">${SVG_ICONS.whatsappGreen}</div>
    <div>
      <div class="proof-t">1-Tap Voice Audio</div>
      <div class="proof-s">Native Panameño Spanish</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-offline">${SVG_ICONS.offlineSave}</div>
    <div>
      <div class="proof-t">100% Offline Presets</div>
      <div class="proof-s">Zero cell signal needed</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-edit">${SVG_ICONS.edit}</div>
    <div>
      <div class="proof-t">Editable Scenarios</div>
      <div class="proof-s">Customize times & stops</div>
    </div>
  </div>
</div>

<div class="poquito-peek">${POQUITO_FRONT_LOOK_DOWN_SVG}</div>

<div class="phone-stage">
  <div class="phone">
    <div class="notch"></div>
    <div class="screen"><img src="${appImg}"/></div>
  </div>
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'play_store_screenshot_2_dynamic.png') });
  await page.close();
  console.log('✅ Set A: Screenshot 2 done');
}

// A3: Verified Island Directory — FULL CARD STACK (Centered Phone rotate -3.5deg, Single-line Title/Sub, Horizontal Cards, Right Mascot)
async function renderSetA_Screen3(browser, appImg) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;background:linear-gradient(175deg,#FEF9F0 0%,#F6FBF7 55%,#F0FAF7 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative;}
.glow-top{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:750px;height:420px;background:radial-gradient(ellipse,rgba(252,165,80,0.11) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.glow-bottom{position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);width:800px;height:450px;background:radial-gradient(ellipse,rgba(16,185,129,0.09) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.head{position:absolute;top:55px;left:0;right:0;text-align:center;padding:0 50px;z-index:20;}
.badge{display:inline-flex;align-items:center;gap:9px;background:rgba(16,185,129,0.10);border:1.5px solid rgba(16,185,129,0.28);padding:9px 22px;border-radius:100px;font-size:16px;font-weight:800;color:#059669;letter-spacing:0.9px;margin-bottom:12px;}
.badge-dot{width:8px;height:8px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:74px;font-weight:900;line-height:1.04;letter-spacing:-2.5px;color:#1A1208;margin-bottom:8px;white-space:nowrap;}
h1 em{color:#059669;font-style:normal;}
.sub{font-size:20.5px;font-weight:600;color:#4A5E52;line-height:1.35;max-width:980px;margin:0 auto;white-space:nowrap;}

.cards-row{
  position:absolute;top:245px;left:50%;transform:translateX(-50%);
  width:980px;display:flex;gap:14px;justify-content:space-between;z-index:25;
}
.proof-card{
  flex:1;display:flex;align-items:center;gap:12px;
  background:#FFFFFF;border-radius:22px;padding:14px 16px;
  box-shadow:0 12px 32px rgba(0,0,0,0.08),0 2px 8px rgba(0,0,0,0.03);
  border:2px solid rgba(150,72,36,0.12);
}
.proof-icon{width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.proof-icon-wa{background:rgba(5,150,105,0.12);border:1.6px solid rgba(5,150,105,0.28);}
.proof-icon-star{background:rgba(234,88,12,0.12);border:1.6px solid rgba(234,88,12,0.28);}
.proof-icon-offline{background:rgba(101,163,13,0.12);border:1.6px solid rgba(101,163,13,0.28);}
.proof-t{font-size:18.5px;font-weight:900;color:#1A1208;line-height:1.15;letter-spacing:-0.3px;white-space:nowrap;}
.proof-s{font-size:14.5px;font-weight:700;color:#5C4E3A;margin-top:3px;line-height:1.25;}

.phone-stage{
  position:absolute;top:415px;left:50%;transform:translateX(-52%) rotate(-3.5deg);
  width:590px;height:1310px;z-index:10;
}
.phone{
  position:relative;width:100%;height:100%;
  background:#111;border-radius:52px;padding:11px;
  box-shadow:10px 52px 120px rgba(150,72,36,0.26),0 20px 50px rgba(0,0,0,0.18);
  border:3.5px solid #222;
}
.notch{position:absolute;top:19px;left:50%;transform:translateX(-50%);width:84px;height:21px;background:#000;border-radius:14px;z-index:20;}
.screen{width:100%;height:100%;border-radius:42px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}

.poquito-mascot{position:absolute;bottom:20px;right:28px;z-index:30;filter:drop-shadow(0 16px 32px rgba(16,185,129,0.30));}
.mascot-bubble{
  position:absolute;bottom:72px;right:218px;z-index:32;
  background:#fff;border-radius:22px;padding:14px 22px;
  box-shadow:0 14px 34px rgba(0,0,0,0.10),0 3px 8px rgba(0,0,0,0.04);
  border:2.5px solid rgba(5,150,105,0.30);
  font-size:16.5px;font-weight:800;color:#1A1208;line-height:1.35;
  white-space:nowrap;
}
.mascot-bubble::before{
  content:"";position:absolute;right:-14px;top:52%;transform:translateY(-50%);
  width:0;height:0;
  border-top:10px solid transparent;border-bottom:10px solid transparent;
  border-left:14px solid rgba(5,150,105,0.30);
}
.mascot-bubble::after{
  content:"";position:absolute;right:-9px;top:52%;transform:translateY(-50%);
  width:0;height:0;
  border-top:8px solid transparent;border-bottom:8px solid transparent;
  border-left:12px solid #fff;
}
</style></head><body>
<div class="glow-top"></div>
<div class="glow-bottom"></div>
<div class="head">
  <div class="badge"><div class="badge-dot"></div> FAST ISLAND REPAIRS & SERVICES</div>
  <h1>Verified <em>Island</em> Directory</h1>
  <p class="sub">Direct WhatsApp links to vetted Bocas del Toro captains, mechanics & clinics.</p>
</div>

<div class="cards-row">
  <div class="proof-card">
    <div class="proof-icon proof-icon-wa">${SVG_ICONS.whatsappGreen}</div>
    <div>
      <div class="proof-t">Direct WhatsApp</div>
      <div class="proof-s">1-tap chat on WhatsApp</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-star">${SVG_ICONS.verifiedCheck}</div>
    <div>
      <div class="proof-t">Community Vetted</div>
      <div class="proof-s">★★★★★ Vouched by users</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-offline">${SVG_ICONS.offlineSave}</div>
    <div>
      <div class="proof-t">100% Offline Ready</div>
      <div class="proof-s">Phonebook with no signal</div>
    </div>
  </div>
</div>

<div class="phone-stage">
  <div class="phone">
    <div class="notch"></div>
    <div class="screen"><img src="${appImg}"/></div>
  </div>
</div>

<div class="poquito-mascot">
  ${POQUITO_FRONT_SVG.replace('<svg ', '<svg width="195" height="195" ')}
</div>
<div class="mascot-bubble">
  The best captains & technicians<br>of Bocas, vetted by you.
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'play_store_screenshot_3_dynamic.png') });
  await page.close();
  console.log('✅ Set A: Screenshot 3 (Full Stack) done');
}

// A4: Talk Live 2-Way Walkie-Talkie
async function renderSetA_Screen4(browser, appImg) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;background:linear-gradient(175deg,#FEF9F0 0%,#F6FBF7 55%,#F0FAF7 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative;}
.glow-top{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:750px;height:420px;background:radial-gradient(ellipse,rgba(252,165,80,0.11) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.glow-bottom{position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);width:800px;height:450px;background:radial-gradient(ellipse,rgba(16,185,129,0.09) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.head{position:absolute;top:55px;left:0;right:0;text-align:center;padding:0 60px;z-index:20;}
.badge{display:inline-flex;align-items:center;gap:9px;background:rgba(16,185,129,0.10);border:1.5px solid rgba(16,185,129,0.28);padding:9px 22px;border-radius:100px;font-size:16px;font-weight:800;color:#059669;letter-spacing:0.9px;margin-bottom:14px;}
.badge-dot{width:8px;height:8px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:74px;font-weight:900;line-height:1.04;letter-spacing:-2.5px;color:#1A1208;margin-bottom:12px;}
h1 em{color:#059669;font-style:normal;}
.sub{font-size:21px;font-weight:600;color:#4A5E52;line-height:1.45;max-width:680px;margin:0 auto;}
.left-col{position:absolute;top:405px;left:45px;width:375px;z-index:20;}
.left-h2{font-family:'Lexend',sans-serif;font-size:38px;font-weight:900;line-height:1.10;color:#1A1208;margin-bottom:8px;letter-spacing:-1.2px;}
.left-h2 span{color:#964824;}
.left-p{font-size:18px;font-weight:600;color:#5C4E3A;line-height:1.36;margin-bottom:16px;max-width:365px;}
.proof-card{display:flex;align-items:center;gap:14px;background:#fff;border-radius:20px;padding:13px 18px;margin-bottom:11px;box-shadow:0 10px 26px rgba(0,0,0,0.06),0 2px 6px rgba(0,0,0,0.03);border:2px solid rgba(150,72,36,0.12);width:365px;}
.proof-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.proof-icon-browser{background:rgba(5,150,105,0.12);border:1.6px solid rgba(5,150,105,0.28);}
.proof-icon-waves{background:rgba(217,119,6,0.12);border:1.6px solid rgba(217,119,6,0.28);}
.proof-icon-sync{background:rgba(2,132,199,0.12);border:1.6px solid rgba(2,132,199,0.28);}
.proof-icon-save{background:rgba(101,163,13,0.12);border:1.6px solid rgba(101,163,13,0.28);}
.proof-t{font-size:20px;font-weight:900;color:#1A1208;line-height:1.15;letter-spacing:-0.3px;}
.proof-s{font-size:14.5px;font-weight:700;color:#5C4E3A;margin-top:2.5px;}
.poquito-mascot{position:absolute;bottom:25px;left:24px;z-index:25;filter:drop-shadow(0 16px 32px rgba(16,185,129,0.30));}
.mascot-bubble{
  position:absolute;bottom:195px;left:195px;z-index:28;
  background:#fff;border-radius:22px;padding:11px 15px 11px 17px;
  box-shadow:0 14px 34px rgba(0,0,0,0.12),0 3px 10px rgba(0,0,0,0.04);
  border:2.5px solid rgba(5,150,105,0.30);
  font-size:18.5px;font-weight:900;color:#059669;line-height:1.25;
  white-space:nowrap;
}
.mascot-bubble::before{
  content:"";position:absolute;left:-13px;top:72%;transform:translateY(-50%);
  width:0;height:0;
  border-top:10px solid transparent;border-bottom:10px solid transparent;
  border-right:14px solid rgba(5,150,105,0.30);
}
.mascot-bubble::after{
  content:"";position:absolute;left:-9px;top:72%;transform:translateY(-50%);
  width:0;height:0;
  border-top:8px solid transparent;border-bottom:8px solid transparent;
  border-right:11px solid #fff;
}
.phone-stage{position:absolute;top:420px;right:36px;width:590px;height:1260px;z-index:10;transform:rotate(2deg);}
.phone{position:relative;width:100%;height:100%;background:#111;border-radius:52px;padding:11px;box-shadow:0 50px 120px rgba(0,0,0,0.25),0 15px 40px rgba(150,72,36,0.18);border:3.5px solid #222;}
.notch{position:absolute;top:19px;left:50%;transform:translateX(-50%);width:84px;height:21px;background:#000;border-radius:14px;z-index:20;}
.screen{width:100%;height:100%;border-radius:42px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}
</style></head><body>
<div class="glow-top"></div>
<div class="glow-bottom"></div>
<div class="head">
  <div class="badge"><div class="badge-dot"></div> REAL-TIME 2-WAY TRANSLATION</div>
  <h1>Talk <em>Live</em> with<br>Your Contractor</h1>
  <p class="sub">They speak Spanish, you hear English. Instant 2-way voice notes with no app download.</p>
</div>
<div class="left-col">
  <div class="left-h2">Live walkie-talkie<br><span>in any browser</span></div>
  <p class="left-p">Send a link on WhatsApp. Your contractor taps to speak. No app download or registration needed.</p>
  
  <div class="proof-card">
    <div class="proof-icon proof-icon-browser">${SVG_ICONS.browser}</div>
    <div>
      <div class="proof-t">No App Download</div>
      <div class="proof-s">Opens in contractor's browser</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-waves">${SVG_ICONS.waves}</div>
    <div>
      <div class="proof-t">Real-Time Voice Notes</div>
      <div class="proof-s">Instant, private & clear audio</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-sync">${SVG_ICONS.sync}</div>
    <div>
      <div class="proof-t">Dual-Language Live</div>
      <div class="proof-s">They speak Spanish, you hear English</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-save">${SVG_ICONS.offlineSave}</div>
    <div>
      <div class="proof-t">Auto-Saved History</div>
      <div class="proof-s">Audio stores safely & syncs on reconnect</div>
    </div>
  </div>
</div>

<div class="poquito-mascot">
  <img src="${POQUITO_RUFFLED_RX_BASE64}" style="width: 225px; height: auto; display: block;" />
</div>
<div class="mascot-bubble">
  Listening live...<br><span style="font-size:14.5px;font-weight:700;color:#2D5A43;">Ready to translate!</span>
</div>

<div class="phone-stage">
  <div class="phone">
    <div class="notch"></div>
    <div class="screen"><img src="${appImg}"/></div>
  </div>
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'play_store_screenshot_4_dynamic.png') });
  await page.close();
  console.log('✅ Set A: Screenshot 4 done');
}

// A4 (Centered Variation): Talk Live 2-Way Walkie-Talkie — STRAIGHT CENTERED PHONE WITH HORIZONTAL PROOF CARDS
async function renderSetA_Screen4_Centered(browser, appImg) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;background:linear-gradient(175deg,#FEF9F0 0%,#F6FBF7 55%,#F0FAF7 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative;}
.glow-top{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:750px;height:420px;background:radial-gradient(ellipse,rgba(252,165,80,0.11) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.glow-bottom{position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);width:800px;height:450px;background:radial-gradient(ellipse,rgba(16,185,129,0.09) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.head{position:absolute;top:55px;left:0;right:0;text-align:center;padding:0 60px;z-index:20;}
.badge{display:inline-flex;align-items:center;gap:9px;background:rgba(16,185,129,0.10);border:1.5px solid rgba(16,185,129,0.28);padding:9px 22px;border-radius:100px;font-size:16px;font-weight:800;color:#059669;letter-spacing:0.9px;margin-bottom:14px;}
.badge-dot{width:8px;height:8px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:74px;font-weight:900;line-height:1.04;letter-spacing:-2.5px;color:#1A1208;margin-bottom:12px;}
h1 em{color:#059669;font-style:normal;}
.sub{font-size:21px;font-weight:600;color:#4A5E52;line-height:1.45;max-width:720px;margin:0 auto;}

.cards-row{
  position:absolute;top:335px;left:50%;transform:translateX(-50%);
  width:980px;display:flex;gap:14px;justify-content:space-between;z-index:25;
}
.proof-card{
  flex:1;display:flex;align-items:center;gap:12px;
  background:#FFFFFF;border-radius:22px;padding:14px 16px;
  box-shadow:0 12px 32px rgba(0,0,0,0.08),0 2px 8px rgba(0,0,0,0.03);
  border:2px solid rgba(150,72,36,0.12);
}
.proof-icon{width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.proof-icon-browser{background:rgba(5,150,105,0.12);border:1.6px solid rgba(5,150,105,0.28);}
.proof-icon-waves{background:rgba(217,119,6,0.12);border:1.6px solid rgba(217,119,6,0.28);}
.proof-icon-sync{background:rgba(2,132,199,0.12);border:1.6px solid rgba(2,132,199,0.28);}
.proof-t{font-size:18.5px;font-weight:900;color:#1A1208;line-height:1.15;letter-spacing:-0.3px;white-space:nowrap;}
.proof-s{font-size:14.5px;font-weight:700;color:#5C4E3A;margin-top:3px;line-height:1.25;}

.phone-stage{
  position:absolute;top:465px;left:50%;transform:translateX(-50%);
  width:700px;height:1480px;z-index:10;
}
.phone{
  position:relative;width:100%;height:100%;
  background:#111;border-radius:54px;padding:12px;
  box-shadow:0 -15px 60px rgba(0,0,0,0.14),0 30px 100px rgba(150,72,36,0.22);
  border:3.5px solid #222;
}
.notch{position:absolute;top:20px;left:50%;transform:translateX(-50%);width:88px;height:22px;background:#000;border-radius:14px;z-index:20;}
.screen{width:100%;height:100%;border-radius:44px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}

.poquito-mascot{position:absolute;bottom:25px;left:30px;z-index:30;filter:drop-shadow(0 16px 32px rgba(16,185,129,0.30));}
.mascot-bubble{
  position:absolute;bottom:195px;left:200px;z-index:32;
  background:#fff;border-radius:22px;padding:11px 15px 11px 17px;
  box-shadow:0 14px 34px rgba(0,0,0,0.12),0 3px 10px rgba(0,0,0,0.04);
  border:2.5px solid rgba(5,150,105,0.30);
  font-size:18.5px;font-weight:900;color:#059669;line-height:1.25;
  white-space:nowrap;
}
.mascot-bubble::before{
  content:"";position:absolute;left:-13px;top:72%;transform:translateY(-50%);
  width:0;height:0;
  border-top:10px solid transparent;border-bottom:10px solid transparent;
  border-right:14px solid rgba(5,150,105,0.30);
}
.mascot-bubble::after{
  content:"";position:absolute;left:-9px;top:72%;transform:translateY(-50%);
  width:0;height:0;
  border-top:8px solid transparent;border-bottom:8px solid transparent;
  border-right:11px solid #fff;
}
</style></head><body>
<div class="glow-top"></div>
<div class="glow-bottom"></div>
<div class="head">
  <div class="badge"><div class="badge-dot"></div> 2-WAY REAL-TIME AUDIO</div>
  <h1>Talk <em>Live</em> with<br>Your Contractor</h1>
  <p class="sub">They speak Spanish in browser, you hear English in app. No app download needed for them.</p>
</div>

<div class="cards-row">
  <div class="proof-card">
    <div class="proof-icon proof-icon-browser">${SVG_ICONS.browser}</div>
    <div>
      <div class="proof-t">No App Download</div>
      <div class="proof-s">Opens in contractor's browser</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-waves">${SVG_ICONS.waves}</div>
    <div>
      <div class="proof-t">Real-Time Audio</div>
      <div class="proof-s">Instant, private & clear voice</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-sync">${SVG_ICONS.sync}</div>
    <div>
      <div class="proof-t">Dual-Language Live</div>
      <div class="proof-s">Spanish to English voice</div>
    </div>
  </div>
</div>

<div class="phone-stage">
  <div class="phone">
    <div class="notch"></div>
    <div class="screen"><img src="${appImg}"/></div>
  </div>
</div>

<div class="poquito-mascot">
  <img src="${POQUITO_RUFFLED_RX_BASE64}" style="width: 225px; height: auto; display: block;" />
</div>
<div class="mascot-bubble">
  Listening live...<br><span style="font-size:14.5px;font-weight:700;color:#2D5A43;">Ready to translate!</span>
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'play_store_screenshot_4_centered.png') });
  await page.close();
  console.log('✅ Set A: Screenshot 4 (Centered Variation) done');
}

// ════════════════════════════════════════════════════════════════
// SET B — TOP-HALF ZOOMED ALTERNATIVE SUITE
// ════════════════════════════════════════════════════════════════

// B1: Top-Half Zoomed Translation Focus
async function renderSetB_Screen1(browser, appImg) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;background:linear-gradient(175deg,#FFFDF9 0%,#F5FAF7 50%,#EFFBF5 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative;}
.glow-top{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:750px;height:450px;background:radial-gradient(ellipse,rgba(252,165,80,0.13) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.head{position:absolute;top:65px;left:0;right:0;text-align:center;padding:0 70px;}
.badge{display:inline-flex;align-items:center;gap:9px;background:rgba(16,185,129,0.10);border:1.5px solid rgba(16,185,129,0.28);padding:9px 24px;border-radius:100px;font-size:17px;font-weight:800;color:#059669;letter-spacing:0.9px;margin-bottom:18px;}
.badge-dot{width:9px;height:9px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:80px;font-weight:900;line-height:1.04;letter-spacing:-2.8px;color:#1A1208;margin-bottom:14px;}
h1 em{color:#059669;font-style:normal;}
.sub{font-size:23px;font-weight:600;color:#5C4E3A;line-height:1.45;}

.phone-stage-zoomed{
  position:absolute;bottom:-150px;left:50%;transform:translateX(-50%);
  width:780px;height:1360px;z-index:10;
}
.phone{
  position:relative;width:100%;height:100%;
  background:#111;border-radius:64px;padding:13px;
  box-shadow:0 -20px 80px rgba(0,0,0,0.18),0 30px 100px rgba(150,72,36,0.22);
  border:4px solid #222;
}
.notch{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:96px;height:24px;background:#000;border-radius:14px;z-index:20;}
.screen{width:100%;height:100%;border-radius:52px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}

.mascot-zoomed{
  position:absolute;top:390px;right:60px;z-index:30;
  filter:drop-shadow(0 16px 36px rgba(16,185,129,0.28));
}

.top-badges{
  position:absolute;top:385px;left:65px;z-index:30;display:flex;flex-direction:column;gap:14px;
}
.pill-badge{
  background:#fff;border-radius:22px;padding:14px 22px;
  box-shadow:0 14px 38px rgba(0,0,0,0.12);border:2px solid rgba(5,150,105,0.20);
  display:flex;align-items:center;gap:14px;
}
.pill-t{font-size:17px;font-weight:900;color:#1A1208;}
.pill-s{font-size:13px;font-weight:700;color:#059669;}
</style></head><body>
<div class="glow-top"></div>
<div class="head">
  <div class="badge"><div class="badge-dot"></div> LOCALS PREFER VOICE NOTES</div>
  <h1>Stress-Free Translations<br><em>Into Warm Spanish</em></h1>
  <p class="sub">Speak in English. Poquito creates authentic Panamanian voice notes that build trust and get fast WhatsApp replies.</p>
</div>

<div class="mascot-zoomed">
  ${POQUITO_TALKIE_SVG.replace('<svg ','<svg width="190" height="190" ')}
</div>

<div class="top-badges">
  <div class="pill-badge">
    <div style="flex-shrink:0;">${SVG_ICONS.sound}</div>
    <div><div class="pill-t">Ready-to-Tap Audio</div><div class="pill-s">Real Panameño voice notes</div></div>
  </div>
  <div class="pill-badge" style="background:#1A1208;border-color:rgba(255,255,255,0.15);">
    <div style="flex-shrink:0;">${SVG_ICONS.whatsappWhite}</div>
    <div><div class="pill-t" style="color:#FCD34D;">Direct to WhatsApp</div><div class="pill-s" style="color:rgba(255,255,255,0.75);">Instant link sharing</div></div>
  </div>
</div>

<div class="phone-stage-zoomed">
  <div class="phone">
    <div class="notch"></div>
    <div class="screen"><img src="${appImg}"/></div>
  </div>
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'play_store_screenshot_1_top_half.png') });
  await page.close();
  console.log('✅ Set B: Screenshot 1 (Top Half) done');
}

// B2: Top-Half Zoomed Presets & Errands Focus
async function renderSetB_Screen2(browser, appImg) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;background:linear-gradient(175deg,#FFFDF9 0%,#F5FAF7 50%,#EFFBF5 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative;}
.glow-top{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:750px;height:450px;background:radial-gradient(ellipse,rgba(252,165,80,0.13) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.head{position:absolute;top:65px;left:0;right:0;text-align:center;padding:0 70px;}
.badge{display:inline-flex;align-items:center;gap:9px;background:rgba(16,185,129,0.10);border:1.5px solid rgba(16,185,129,0.28);padding:9px 24px;border-radius:100px;font-size:17px;font-weight:800;color:#059669;letter-spacing:0.9px;margin-bottom:18px;}
.badge-dot{width:9px;height:9px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:74px;font-weight:900;line-height:1.04;letter-spacing:-2.5px;color:#1A1208;margin-bottom:8px;white-space:nowrap;}
h1 em{color:#059669;font-style:normal;}
.sub{font-size:20.5px;font-weight:600;color:#4A5E52;line-height:1.35;max-width:980px;margin:0 auto;white-space:nowrap;}

.cards-row{
  position:absolute;top:250px;left:50%;transform:translateX(-50%);
  width:990px;display:flex;gap:14px;justify-content:space-between;z-index:25;
}
.proof-card{
  flex:1;display:flex;align-items:center;gap:14px;
  background:#FFFFFF;border-radius:24px;padding:16px 18px;
  box-shadow:0 12px 32px rgba(0,0,0,0.08),0 2px 8px rgba(0,0,0,0.03);
  border:2px solid rgba(150,72,36,0.12);
}
.proof-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.proof-icon-wa{background:rgba(5,150,105,0.12);border:1.6px solid rgba(5,150,105,0.28);}
.proof-icon-offline{background:rgba(101,163,13,0.12);border:1.6px solid rgba(101,163,13,0.28);}
.proof-icon-edit{background:rgba(217,119,6,0.12);border:1.6px solid rgba(217,119,6,0.28);}
.proof-t{font-size:19.5px;font-weight:900;color:#1A1208;line-height:1.15;letter-spacing:-0.3px;white-space:nowrap;}
.proof-s{font-size:15px;font-weight:700;color:#5C4E3A;margin-top:3px;line-height:1.25;}

.poquito-peek{
  position:absolute;top:350px;left:50%;transform:translateX(-50%);
  width:175px;height:175px;z-index:5;
  display:flex;justify-content:center;align-items:center;
}
.poquito-peek svg{
  width:160px;height:160px;display:block;
  filter:drop-shadow(0 12px 28px rgba(0,0,0,0.14));
}

.phone-stage-zoomed{
  position:absolute;top:495px;left:50%;transform:translateX(-50%);
  width:800px;height:1600px;z-index:10;
}
.phone{
  position:relative;width:100%;height:100%;
  background:#111;border-radius:64px;padding:13px;
  box-shadow:0 -20px 80px rgba(0,0,0,0.18),0 30px 100px rgba(150,72,36,0.22);
  border:4px solid #222;
}
.notch{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:96px;height:24px;background:#000;border-radius:14px;z-index:20;}
.screen{width:100%;height:100%;border-radius:52px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}
</style></head><body>
<div class="glow-top"></div>
<div class="head">
  <div class="badge"><div class="badge-dot"></div> INSTANT PRESET PHRASES</div>
  <h1>Island Errands, <em>Zero Stress</em></h1>
  <p class="sub">Ready-to-tap audio templates for water taxis, outages, ATMs & groceries.</p>
</div>

<div class="cards-row">
  <div class="proof-card">
    <div class="proof-icon proof-icon-wa">${SVG_ICONS.whatsappGreen}</div>
    <div>
      <div class="proof-t">1-Tap Voice Audio</div>
      <div class="proof-s">Native Panameño Spanish</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-offline">${SVG_ICONS.offlineSave}</div>
    <div>
      <div class="proof-t">100% Offline Presets</div>
      <div class="proof-s">Zero cell signal needed</div>
    </div>
  </div>

  <div class="proof-card">
    <div class="proof-icon proof-icon-edit">${SVG_ICONS.edit}</div>
    <div>
      <div class="proof-t">Editable Scenarios</div>
      <div class="proof-s">Customize times & stops</div>
    </div>
  </div>
</div>

<div class="poquito-peek">${POQUITO_FRONT_LOOK_DOWN_SVG}</div>

<div class="phone-stage-zoomed">
  <div class="phone">
    <div class="notch"></div>
    <div class="screen"><img src="${appImg}"/></div>
  </div>
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'play_store_screenshot_2_top_half.png') });
  await page.close();
  console.log('✅ Set B: Screenshot 2 (Top Half) done');
}

// B3: Top-Half Zoomed Directory Stack Focus
async function renderSetB_Screen3(browser, appImg) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;background:linear-gradient(175deg,#FFFDF9 0%,#F5FAF7 50%,#EFFBF5 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative;}
.glow-top{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:750px;height:450px;background:radial-gradient(ellipse,rgba(252,165,80,0.13) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.head{position:absolute;top:65px;left:0;right:0;text-align:center;padding:0 70px;}
.badge{display:inline-flex;align-items:center;gap:9px;background:rgba(16,185,129,0.10);border:1.5px solid rgba(16,185,129,0.28);padding:9px 24px;border-radius:100px;font-size:17px;font-weight:800;color:#059669;letter-spacing:0.9px;margin-bottom:18px;}
.badge-dot{width:9px;height:9px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:80px;font-weight:900;line-height:1.04;letter-spacing:-2.8px;color:#1A1208;margin-bottom:14px;}
h1 em{color:#059669;font-style:normal;}
.sub{font-size:23px;font-weight:600;color:#5C4E3A;line-height:1.45;}

.phone-stage-zoomed{
  position:absolute;bottom:-150px;left:50%;transform:translateX(-50%);
  width:780px;height:1360px;z-index:10;
}
.phone{
  position:relative;width:100%;height:100%;
  background:#111;border-radius:64px;padding:13px;
  box-shadow:0 -20px 80px rgba(0,0,0,0.18),0 30px 100px rgba(150,72,36,0.22);
  border:4px solid #222;
}
.notch{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:96px;height:24px;background:#000;border-radius:14px;z-index:20;}
.screen{width:100%;height:100%;border-radius:52px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}

.mascot-zoomed{
  position:absolute;top:390px;left:60px;z-index:30;
  filter:drop-shadow(0 16px 36px rgba(16,185,129,0.25));
}
.top-badges-r{
  position:absolute;top:385px;right:65px;z-index:30;display:flex;flex-direction:column;gap:14px;
}
.pill-badge{
  background:#fff;border-radius:22px;padding:14px 22px;
  box-shadow:0 14px 38px rgba(0,0,0,0.12);border:2px solid rgba(5,150,105,0.20);
  display:flex;align-items:center;gap:14px;
}
.pill-t{font-size:17px;font-weight:900;color:#1A1208;}
.pill-s{font-size:13px;font-weight:700;color:#059669;}
</style></head><body>
<div class="glow-top"></div>
<div class="head">
  <div class="badge"><div class="badge-dot"></div> VETTED LOCAL DIRECTORY</div>
  <h1>Verified <em>Island</em><br>Directory</h1>
  <p class="sub">Direct WhatsApp links to vetted Bocas del Toro captains, mechanics & clinics.</p>
</div>

<div class="mascot-zoomed">
  ${POQUITO_FRONT_SVG.replace('<svg ','<svg width="190" height="190" ')}
</div>

<div class="top-badges-r">
  <div class="pill-badge">
    <div style="flex-shrink:0;">${SVG_ICONS.whatsappWhite}</div>
    <div><div class="pill-t">Direct WhatsApp</div><div class="pill-s">1-tap chat with local pros</div></div>
  </div>
  <div class="pill-badge" style="background:#1A1208;border-color:rgba(255,255,255,0.15);">
    <div class="pill-t" style="color:#FCD34D;font-size:24px;">74+</div>
    <div class="pill-s" style="color:rgba(255,255,255,0.75);">Verified Island Pros in Bocas</div>
  </div>
</div>

<div class="phone-stage-zoomed">
  <div class="phone">
    <div class="notch"></div>
    <div class="screen"><img src="${appImg}"/></div>
  </div>
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'play_store_screenshot_3_top_half.png') });
  await page.close();
  console.log('✅ Set B: Screenshot 3 (Top Half) done');
}

// B4: Top-Half Zoomed 2-Way Live Talk Focus
async function renderSetB_Screen4(browser, appImg) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;background:linear-gradient(175deg,#FFFDF9 0%,#F5FAF7 50%,#EFFBF5 100%);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative;}
.glow-top{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:750px;height:450px;background:radial-gradient(ellipse,rgba(252,165,80,0.13) 0%,transparent 68%);border-radius:50%;pointer-events:none;}
.head{position:absolute;top:65px;left:0;right:0;text-align:center;padding:0 70px;}
.badge{display:inline-flex;align-items:center;gap:9px;background:rgba(16,185,129,0.10);border:1.5px solid rgba(16,185,129,0.28);padding:9px 24px;border-radius:100px;font-size:17px;font-weight:800;color:#059669;letter-spacing:0.9px;margin-bottom:18px;}
.badge-dot{width:9px;height:9px;background:#25D366;border-radius:50%;}
h1{font-family:'Lexend',sans-serif;font-size:80px;font-weight:900;line-height:1.04;letter-spacing:-2.8px;color:#1A1208;margin-bottom:14px;}
h1 em{color:#059669;font-style:normal;}
.sub{font-size:23px;font-weight:600;color:#5C4E3A;line-height:1.45;}

.phone-stage-zoomed{
  position:absolute;bottom:-150px;left:50%;transform:translateX(-50%);
  width:780px;height:1360px;z-index:10;
}
.phone{
  position:relative;width:100%;height:100%;
  background:#111;border-radius:64px;padding:13px;
  box-shadow:0 -20px 80px rgba(0,0,0,0.18),0 30px 100px rgba(150,72,36,0.22);
  border:4px solid #222;
}
.notch{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:96px;height:24px;background:#000;border-radius:14px;z-index:20;}
.screen{width:100%;height:100%;border-radius:52px;overflow:hidden;background:#FAF8F5;}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}

.mascot-zoomed{
  position:absolute;top:390px;right:60px;z-index:30;
  filter:drop-shadow(0 16px 36px rgba(16,185,129,0.28));
}
.top-badges-l{
  position:absolute;top:385px;left:65px;z-index:30;display:flex;flex-direction:column;gap:14px;
}
.pill-badge{
  background:#fff;border-radius:22px;padding:14px 22px;
  box-shadow:0 14px 38px rgba(0,0,0,0.12);border:2px solid rgba(5,150,105,0.20);
  display:flex;align-items:center;gap:14px;
}
.pill-t{font-size:17px;font-weight:900;color:#1A1208;}
.pill-s{font-size:13px;font-weight:700;color:#059669;}
</style></head><body>
<div class="glow-top"></div>
<div class="head">
  <div class="badge"><div class="badge-dot"></div> 2-WAY REAL-TIME AUDIO</div>
  <h1>Talk <em>Live</em> with<br>Your Contractor</h1>
  <p class="sub">They speak Spanish in browser, you hear English in app. No download needed for them.</p>
</div>

<div class="mascot-zoomed">
  <img src="${POQUITO_VICTORY_BASE64}" style="width:230px;height:auto;"/>
</div>

<div class="top-badges-l">
  <div class="pill-badge">
    <div style="flex-shrink:0;">${SVG_ICONS.browser}</div>
    <div><div class="pill-t">No App Download</div><div class="pill-s">Opens directly in phone browser</div></div>
  </div>
  <div class="pill-badge" style="background:#1A1208;border-color:rgba(255,255,255,0.15);">
    <div style="flex-shrink:0;">${SVG_ICONS.sync}</div>
    <div><div class="pill-t" style="color:#FCD34D;">2-Way Live Talk</div><div class="pill-s" style="color:rgba(255,255,255,0.75);">Seamless audio translation</div></div>
  </div>
</div>

<div class="phone-stage-zoomed">
  <div class="phone">
    <div class="notch"></div>
    <div class="screen"><img src="${appImg}"/></div>
  </div>
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'play_store_screenshot_4_top_half.png') });
  await page.close();
  console.log('✅ Set B: Screenshot 4 (Top Half) done');
}

// ════════════════════════════════════════════════════════════════
// COMPOSITES
// ════════════════════════════════════════════════════════════════

// 4-Up Showcase Generator Helper
async function generate4UpShowcase(browser, images, title, subtitle, filename) {
  const imgs = images.map((p) => `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, p)).toString('base64')}`);
  const page = await browser.newPage();
  await page.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:2400px;height:1350px;background:linear-gradient(135deg,#FFF8F2 0%,#FAF6F0 50%,#F5EDE0 100%);font-family:'Plus Jakarta Sans',sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:36px 50px 30px;overflow:hidden;}
.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(150,72,36,0.12);padding-bottom:16px;}
.brand-name{font-family:'Lexend',sans-serif;font-size:32px;font-weight:900;color:#1A1208;}
.brand-tag{display:inline-block;background:#FFDBCD;color:#964824;font-size:13px;font-weight:800;padding:4px 13px;border-radius:100px;border:1px solid rgba(150,72,36,0.28);margin-left:10px;}
.brand-sub{font-size:16px;font-weight:600;color:#786C5E;margin-top:3px;}
.hdr-r{font-size:16px;font-weight:700;color:#964824;}
.stage{display:flex;gap:28px;flex:1;justify-content:center;align-items:center;margin:16px 0;}
.card{width:540px;height:960px;border-radius:28px;overflow:hidden;box-shadow:0 18px 54px rgba(89,79,66,0.16),0 5px 16px rgba(0,0,0,0.06);border:2.5px solid #FFFFFF;background:#FAF8F5;}
.card img{width:100%;height:100%;object-fit:contain;display:block;}
.ftr{display:flex;justify-content:space-between;align-items:center;border-top:1.5px solid rgba(150,72,36,0.12);padding-top:12px;font-size:14px;font-weight:600;color:#786C5E;}
.ftr strong{color:#1A1208;}
</style></head><body>
<div class="hdr">
  <div><div class="brand-name">PoquitoTalk <span class="brand-tag">${title}</span></div><div class="brand-sub">${subtitle}</div></div>
  <div class="hdr-r">Google Play Store Ready • 1080 × 1920 px</div>
</div>
<div class="stage">
  ${imgs.map((src) => `<div class="card"><img src="${src}"/></div>`).join('\n  ')}
</div>
<div class="ftr">
  <div>Outcome-Driven Messaging • Bocas del Toro Island Palette • Poquito Mascot Series</div>
  <div>Created by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com 🇵🇦</div>
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, filename) });
  await page.close();
  console.log(`✅ Showcase saved: ${filename}`);
}

// Master Comparison Composite (Set A vs Set B)
async function renderMasterComparison(browser) {
  const setA = [
    'play_store_screenshot_1_dynamic.png',
    'play_store_screenshot_2_dynamic.png',
    'play_store_screenshot_3_dynamic.png',
    'play_store_screenshot_4_dynamic.png',
  ].map((p) => `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, p)).toString('base64')}`);

  const setB = [
    'play_store_screenshot_1_top_half.png',
    'play_store_screenshot_2_top_half.png',
    'play_store_screenshot_3_top_half.png',
    'play_store_screenshot_4_top_half.png',
  ].map((p) => `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, p)).toString('base64')}`);

  const page = await browser.newPage();
  await page.setViewport({ width: 2800, height: 1800, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@800;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:2800px;height:1800px;background:linear-gradient(135deg,#FFF9F4 0%,#F5EDE0 100%);font-family:'Plus Jakarta Sans',sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:40px 60px 30px;overflow:hidden;}
.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(150,72,36,0.15);padding-bottom:18px;}
.brand-name{font-family:'Lexend',sans-serif;font-size:36px;font-weight:900;color:#1A1208;}
.brand-sub{font-size:18px;font-weight:600;color:#786C5E;margin-top:4px;}
.row-label{font-family:'Lexend',sans-serif;font-size:22px;font-weight:900;color:#1A1208;margin-bottom:10px;display:flex;align-items:center;gap:12px;}
.tag-a{background:#D1FAE5;color:#065F46;padding:4px 14px;border-radius:100px;font-size:14px;font-weight:800;}
.tag-b{background:#FEF3C7;color:#92400E;padding:4px 14px;border-radius:100px;font-size:14px;font-weight:800;}
.grid-container{display:flex;flex-direction:column;gap:24px;flex:1;justify-content:center;margin:12px 0;}
.cards-row{display:flex;gap:24px;justify-content:center;}
.card{width:380px;height:675px;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(89,79,66,0.14);border:2px solid #FFFFFF;background:#FAF8F5;}
.card img{width:100%;height:100%;object-fit:contain;display:block;}
.ftr{display:flex;justify-content:space-between;align-items:center;border-top:1.5px solid rgba(150,72,36,0.15);padding-top:12px;font-size:15px;font-weight:600;color:#786C5E;}
.ftr strong{color:#1A1208;}
</style></head><body>
<div class="hdr">
  <div><div class="brand-name">PoquitoTalk <span style="font-size:20px;color:#964824;font-weight:700;">• Google Play Store Asset Suite Comparison</span></div>
  <div class="brand-sub">Comparing Set A (Full-Phone Perspective Suite with Full Directory Stack) vs Set B (Top-Half Zoomed Suite)</div></div>
  <div style="font-size:18px;font-weight:800;color:#964824;">Pixel-Accurate 1080 × 1920 Renderings</div>
</div>
<div class="grid-container">
  <div style="display:flex;flex-direction:column;">
    <div class="row-label"><span class="tag-a">SET A</span> Full-Device Perspective Layouts (Full Card Stack Directory)</div>
    <div class="cards-row">
      ${setA.map((src) => `<div class="card"><img src="${src}"/></div>`).join('\n      ')}
    </div>
  </div>
  <div style="display:flex;flex-direction:column;">
    <div class="row-label"><span class="tag-b">SET B</span> Top-Half Zoomed Alternatives (Maximum UI Scale & Thumbnail Legibility)</div>
    <div class="cards-row">
      ${setB.map((src) => `<div class="card"><img src="${src}"/></div>`).join('\n      ')}
    </div>
  </div>
</div>
<div class="ftr">
  <div>Generated for Google Play Store • Pixel-accurate 1080 × 1920 px assets</div>
  <div>Created by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com 🇵🇦</div>
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'poquitotalk_all_alternatives_comparison.png') });
  await page.close();
  console.log('✅ Master Comparison Grid saved: poquitotalk_all_alternatives_comparison.png');
}

// ════════════════════════════════════════════════════════════════
// MAIN RUNNER
// ════════════════════════════════════════════════════════════════
async function run() {
  const server = await startStaticServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  console.log('📸 Capturing app screens for all suites…');
  console.log('  -> Capturing Screenshot 1 (Translate)…');
  const translateImg = await captureAppScreen(
    browser,
    'tab=Translate&prompt=Can%20you%20check%20the%20AC%20freon%20today%3F&output=%C2%A1Buenas!%20%C2%BFPuedes%20revisar%20el%20gas%20del%20aire%20hoy%20mismo%3F'
  );

  console.log('  -> Capturing Screenshot 2 (Presets Expanded)…');
  const presetsExpandedImg = await captureAppScreen(browser, 'tab=Presets&preset=water_taxi', { scrollOffset: 75, hScrollText: 'Boats' });

  console.log('  -> Capturing Screenshot 3 (Directory FULL CARD STACK)…');
  // No deck param: activeDeckId is empty string, showing the full 10-category fanned resting accordion stack!
  const directoryStackImg = await captureAppScreen(browser, 'tab=Directory', { scrollOffset: 0 });

  console.log('  -> Capturing Screenshot 4 (Walkie Modal)…');
  let walkieImg;
  if (fs.existsSync(path.join(WORKSPACE_DIR, 'walkie_explainer_sheet.png'))) {
    walkieImg = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'walkie_explainer_sheet.png')).toString('base64')}`;
  } else {
    walkieImg = await captureAppScreen(browser, 'tab=Translate&onboarding=false&splash=false&walkie=true');
  }

  console.log('🎨 Generating SET A (Full-Phone Suite with Full Directory Stack)…');
  await renderSetA_Screen1(browser, translateImg);
  await renderSetA_Screen2(browser, presetsExpandedImg);
  await renderSetA_Screen3(browser, directoryStackImg);
  await renderSetA_Screen4(browser, walkieImg);
  await renderSetA_Screen4_Centered(browser, walkieImg);
  await generate4UpShowcase(
    browser,
    [
      'play_store_screenshot_1_dynamic.png',
      'play_store_screenshot_2_dynamic.png',
      'play_store_screenshot_3_dynamic.png',
      'play_store_screenshot_4_dynamic.png',
    ],
    'Set A • Full Phone Suite',
    'Locals Prefer Voice Notes • Island Errands • Full Card Stack Directory • Talk Live',
    'poquitotalk_dynamic_showcase_4up.png'
  );
  await generate4UpShowcase(
    browser,
    [
      'play_store_screenshot_1_dynamic.png',
      'play_store_screenshot_2_dynamic.png',
      'play_store_screenshot_3_dynamic.png',
      'play_store_screenshot_4_centered.png',
    ],
    'Set A (Centered Variation) • Full Phone Suite',
    'Locals Prefer Voice Notes • Island Errands • Full Card Stack Directory • Talk Live (Centered)',
    'poquitotalk_showcase_centered_suite_4up.png'
  );

  console.log('🎨 Generating SET B (Top-Half Zoomed Suite)…');
  await renderSetB_Screen1(browser, translateImg);
  await renderSetB_Screen2(browser, presetsExpandedImg);
  await renderSetB_Screen3(browser, directoryStackImg);
  await renderSetB_Screen4(browser, walkieImg);
  await generate4UpShowcase(
    browser,
    [
      'play_store_screenshot_1_top_half.png',
      'play_store_screenshot_2_top_half.png',
      'play_store_screenshot_3_top_half.png',
      'play_store_screenshot_4_top_half.png',
    ],
    'Set B • Top-Half Zoomed Suite',
    'Maximum Legibility & Focus • Bold Typography • Full Scale Interface Details',
    'poquitotalk_top_half_showcase_4up.png'
  );

  console.log('🎨 Generating Master Comparison Grid…');
  await renderMasterComparison(browser);

  // Sync assets to play_store_final_assets and Desktop
  const finalDir = path.join(WORKSPACE_DIR, 'play_store_final_assets');
  const desktopDir = '/Users/dorienvandenabbeele/Desktop';
  if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

  const filesToSync = [
    'play_store_screenshot_1_dynamic.png',
    'play_store_screenshot_2_dynamic.png',
    'play_store_screenshot_3_dynamic.png',
    'play_store_screenshot_4_dynamic.png',
    'play_store_screenshot_4_centered.png',
    'play_store_screenshot_1_top_half.png',
    'play_store_screenshot_2_top_half.png',
    'play_store_screenshot_3_top_half.png',
    'play_store_screenshot_4_top_half.png',
    'poquitotalk_dynamic_showcase_4up.png',
    'poquitotalk_showcase_centered_suite_4up.png',
    'poquitotalk_top_half_showcase_4up.png',
    'poquitotalk_all_alternatives_comparison.png'
  ];

  filesToSync.forEach((file) => {
    const src = path.join(WORKSPACE_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(finalDir, file));
      fs.copyFileSync(src, path.join(desktopDir, file));
    }
  });

  // Also sync clean, standard named aliases to Desktop for immediate clarity
  fs.copyFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_1_dynamic.png'), path.join(desktopDir, 'play_store_screenshot_1_home.png'));
  fs.copyFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_2_dynamic.png'), path.join(desktopDir, 'play_store_screenshot_2_presets.png'));
  fs.copyFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_3_dynamic.png'), path.join(desktopDir, 'play_store_screenshot_3_directory.png'));
  fs.copyFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_4_dynamic.png'), path.join(desktopDir, 'play_store_screenshot_4_talklive.png'));
  fs.copyFileSync(path.join(WORKSPACE_DIR, 'poquitotalk_dynamic_showcase_4up.png'), path.join(desktopDir, 'poquitotalk_showcase.png'));

  // Also sync directly to google_play_submission_files
  const submissionDir = path.join(WORKSPACE_DIR, 'google_play_submission_files');
  if (fs.existsSync(submissionDir)) {
    fs.copyFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_1_dynamic.png'), path.join(submissionDir, '03_screenshot_1_voice_dispatch.png'));
    fs.copyFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_2_dynamic.png'), path.join(submissionDir, '04_screenshot_2_errands_presets.png'));
    fs.copyFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_3_dynamic.png'), path.join(submissionDir, '05_screenshot_3_verified_directory.png'));
    fs.copyFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_4_dynamic.png'), path.join(submissionDir, '06_screenshot_4_talk_live_decoder.png'));
  }

  await browser.close();
  server.close();
  console.log('🎉 All screenshot suites and comparison grids successfully generated and synced!');
}

run().catch((err) => {
  console.error('❌ Error during generation:', err);
  process.exit(1);
});

