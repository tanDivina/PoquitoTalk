const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const WORKSPACE = "/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras";
const DESKTOP = "/Users/dorienvandenabbeele/Desktop";
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new"
  });

  // Scale 0.73, shift (+18, -16) in 1080x1080
  const s = (0.73 * 1080) / 200;
  const sx = 18;
  const sy = -16;

  function getSvg(isTransparent = false) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080" style="background:${isTransparent ? "transparent" : "#FFFFFF"};">
        <g transform="translate(${540 + sx}, ${540 + sy}) scale(${s}) translate(-100, -100)">
          <!-- Outer Speech Bubble (WhatsApp Green with solid white fill) -->
          <path
            d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
            fill="#FFFFFF"
            stroke="#25D366"
            stroke-width="12"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Canonical Studio Parrot Group -->
          <g transform="translate(43, 39) scale(0.75)">
            <!-- 1. Straightened Wooden Perch Branch -->
            <path d="M 28 135 L 118 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

            <!-- 2. Golden Parrot Claws -->
            <path
              d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138"
              stroke="#F59E0B"
              stroke-width="4.5"
              stroke-linecap="round"
            />

            <!-- 3. Body & Anchored 2 Crown Feathers -->
            <g id="body-group">
              <path
                d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z"
                fill="#10B981"
                stroke="#047857"
                stroke-width="4.5"
                stroke-linejoin="round"
              />
              <path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
              <path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none" />
            </g>

            <!-- 4. Sleek Cyan Wing -->
            <path
              d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z"
              fill="#06B6D4"
              stroke="#047857"
              stroke-width="3.5"
              stroke-linejoin="round"
            />

            <!-- 5. Head Group (Big Eye & Golden Beak) -->
            <g id="head-group">
              <circle cx="76" cy="42" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
              <circle cx="74.5" cy="42" r="4.5" fill="#0F172A" />
              <circle cx="72.5" cy="40" r="1.8" fill="#FFFFFF" />

              <path
                d="M 90 36 C 106 36 114 50 100 62 C 95 65 88 61 89 55 C 91 49 88 40 90 36 Z"
                fill="#F59E0B"
                stroke="#047857"
                stroke-width="3.5"
                stroke-linejoin="round"
              />
              <path
                d="M 90 56 C 96 58 98 62 92 63 C 89 63 88 59 90 56 Z"
                fill="#D97706"
                stroke="#047857"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </g>

            <!-- 6. Bold Soundwave Broadcast Arcs (Shifted +10px right for clear beak breathing room) -->
            <g transform="translate(10, 0)">
              <path d="M 110 43 A 11 11 0 0 1 110 61" fill="none" stroke="#F59E0B" stroke-width="5.2" stroke-linecap="round" />
              <path d="M 120 37 A 17 17 0 0 1 120 67" fill="none" stroke="#F59E0B" stroke-width="5.2" stroke-linecap="round" />
              <path d="M 130 31 A 23 23 0 0 1 130 73" fill="none" stroke="#F59E0B" stroke-width="5.2" stroke-linecap="round" />
            </g>
          </g>
        </g>
      </svg>
    `;
  }

  // 1. Render White Background Icon (1080x1080)
  const p1 = await browser.newPage();
  await p1.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
  await p1.setContent(`<!DOCTYPE html><html><body style="margin:0; overflow:hidden;">${getSvg(false)}</body></html>`, { waitUntil: "networkidle0" });
  
  const destDesktopWhite = path.join(DESKTOP, "poquitotalk_instagram_profile_icon.png");
  const destWorkspaceWhite = path.join(WORKSPACE, "poquitotalk_instagram_profile_icon.png");
  await p1.screenshot({ path: destDesktopWhite, width: 1080, height: 1080 });
  fs.copyFileSync(destDesktopWhite, destWorkspaceWhite);
  console.log("Exported white icon to:", destDesktopWhite);

  // 2. Render Transparent Background Icon (1080x1080)
  const p2 = await browser.newPage();
  await p2.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
  await p2.setContent(`<!DOCTYPE html><html><body style="margin:0; overflow:hidden; background:transparent;">${getSvg(true)}</body></html>`, { waitUntil: "networkidle0" });
  
  const destDesktopTrans = path.join(DESKTOP, "poquitotalk_instagram_profile_icon_transparent.png");
  const destWorkspaceTrans = path.join(WORKSPACE, "poquitotalk_instagram_profile_icon_transparent.png");
  await p2.screenshot({ path: destDesktopTrans, width: 1080, height: 1080, omitBackground: true });
  fs.copyFileSync(destDesktopTrans, destWorkspaceTrans);
  console.log("Exported transparent icon to:", destDesktopTrans);

  // 3. Render High-Definition Comparison Graphic
  const p3 = await browser.newPage();
  await p3.setViewport({ width: 1300, height: 800, deviceScaleFactor: 2 });
  const oldScreenshotBase64 = fs.readFileSync(path.join(DESKTOP, "Screenshot 2026-09-11 at 16.41.39.png")).toString("base64");

  const comparisonHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #FAF8F5;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1A1208;
          padding: 50px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .header { text-align: center; margin-bottom: 40px; }
        h1 {
          font-family: "Lexend", sans-serif;
          font-size: 34px;
          font-weight: 900;
          letter-spacing: -0.8px;
          margin: 0 0 10px 0;
          color: #1A1208;
        }
        .subtitle {
          font-size: 16px;
          font-weight: 500;
          color: #64748B;
          margin: 0;
        }
        .cards-row {
          display: flex;
          gap: 40px;
          justify-content: center;
          align-items: stretch;
          width: 100%;
          max-width: 950px;
        }
        .card {
          flex: 1;
          background: #FFFFFF;
          border-radius: 28px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 2px solid rgba(150, 72, 36, 0.10);
          box-shadow: 0 16px 36px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03);
        }
        .badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        .badge-old {
          background: #FEE2E2;
          color: #DC2626;
        }
        .badge-new {
          background: #DCFCE7;
          color: #15803D;
        }
        .mockup-area {
          height: 250px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .old-img-frame {
          width: 190px;
          height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .old-img-frame img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.08));
        }
        .notes-widget {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .notes-pill {
          background: #FFFFFF;
          color: #262626;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 16px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
          position: relative;
          z-index: 5;
          margin-bottom: -12px;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .notes-pill::after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #FFFFFF;
        }
        .avatar-circle {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          overflow: hidden;
          background: #FFFFFF;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          border: 2px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-circle svg {
          width: 100%;
          height: 100%;
        }
        .points-list {
          width: 100%;
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .points-list li {
          font-size: 14.5px;
          font-weight: 600;
          line-height: 1.4;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .points-list.old li {
          color: #7F1D1D;
        }
        .points-list.new li {
          color: #14532D;
        }
        .icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 1px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PoquitoTalk Instagram Profile Picture</h1>
        <p class="subtitle">Direct visual verification against your Instagram Notes & Story circular frame</p>
      </div>

      <div class="cards-row">
        <!-- Old Version -->
        <div class="card">
          <span class="badge badge-old">Current Profile (Old)</span>
          <div class="mockup-area">
            <div class="old-img-frame">
              <img src="data:image/png;base64,${oldScreenshotBase64}" />
            </div>
          </div>
          <ul class="points-list old">
            <li><span class="icon">❌</span> <span><strong>Outdated Mascot:</strong> Flat head with no signature crown crest feathers</span></li>
            <li><span class="icon">❌</span> <span><strong>Clipping Tail:</strong> Speech bubble pointer tail touches the circular boundary</span></li>
            <li><span class="icon">❌</span> <span><strong>Top Crowding:</strong> Speech bubble is jammed against "Notitie..." bubble</span></li>
            <li><span class="icon">❌</span> <span><strong>No Breathing Room:</strong> Logo is crowded inside Instagram's frame</span></li>
          </ul>
        </div>

        <!-- New Version -->
        <div class="card">
          <span class="badge badge-new">New Profile (Ready on Desktop)</span>
          <div class="mockup-area">
            <div class="notes-widget">
              <div class="notes-pill">Notitie...</div>
              <div class="avatar-circle">
                ${getSvg(false)}
              </div>
            </div>
          </div>
          <ul class="points-list new">
            <li><span class="icon">✅</span> <span><strong>Canonical Mascot:</strong> Updated emerald plumage, crown feathers & golden beak</span></li>
            <li><span class="icon">✅</span> <span><strong>100% Unclipped:</strong> Speech bubble & tail sit completely inside the circle</span></li>
            <li><span class="icon">✅</span> <span><strong>Generous Safe Zone:</strong> Clean breathing room under Instagram Notes</span></li>
            <li><span class="icon">✅</span> <span><strong>Ultra-Crisp 1080x1080:</strong> Pure high-definition Retina resolution</span></li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;

  await p3.setContent(comparisonHtml, { waitUntil: "networkidle0" });
  const destDesktopComp = path.join(DESKTOP, "poquitotalk_instagram_avatar_comparison.png");
  const destWorkspaceComp = path.join(WORKSPACE, "poquitotalk_instagram_avatar_comparison.png");
  await p3.screenshot({ path: destDesktopComp, fullPage: true });
  fs.copyFileSync(destDesktopComp, destWorkspaceComp);
  console.log("Exported comparison graphic to:", destDesktopComp);

  await browser.close();
  console.log("All Instagram assets successfully created!");
}

main().catch(console.error);
