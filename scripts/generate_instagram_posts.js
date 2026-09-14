const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const WORKSPACE = "/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras";
const DESKTOP = "/Users/dorienvandenabbeele/Desktop";
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Helper for crisp SVG icons (monoline duotone, stroke-width 2.2, round joins)
const ICONS = {
  chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  mic: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  mapPin: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  boat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a6 6 0 0 0 10 0 6 6 0 0 0 10 0"/><path d="M4 17l2-9h12l2 9"/><path d="M12 4v4"/></svg>`,
  wrench: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  shieldCheck: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  arrowRight: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#064E3B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  users: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
};

// Poquito Mascot Mini SVG
function getMiniPoquitoSvg(size = 80) {
  return `
    <svg viewBox="0 0 200 200" width="${size}" height="${size}">
      <!-- Outer Speech Bubble -->
      <path
        d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
        fill="#FFFFFF"
        stroke="#25D366"
        stroke-width="12"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- Mascot -->
      <g transform="translate(43, 39) scale(0.75)">
        <path d="M 28 135 L 118 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <g id="body-group">
          <path d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round" />
          <path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
          <path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none" />
        </g>
        <path d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
        <g id="head-group">
          <circle cx="76" cy="42" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
          <circle cx="74.5" cy="42" r="4.5" fill="#0F172A" />
          <circle cx="72.5" cy="40" r="1.8" fill="#FFFFFF" />
          <path d="M 90 36 C 106 36 114 50 100 62 C 95 65 88 61 89 55 C 91 49 88 40 90 36 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
          <path d="M 90 56 C 96 58 98 62 92 63 C 89 63 88 59 90 56 Z" fill="#D97706" stroke="#047857" stroke-width="1.8" stroke-linejoin="round" />
        </g>
        <!-- Soundwaves with calibrated 10px clearance -->
        <g transform="translate(10, 0)">
          <path d="M 110 43 A 11 11 0 0 1 110 61" fill="none" stroke="#F59E0B" stroke-width="5.2" stroke-linecap="round" />
          <path d="M 120 37 A 17 17 0 0 1 120 67" fill="none" stroke="#F59E0B" stroke-width="5.2" stroke-linecap="round" />
          <path d="M 130 31 A 23 23 0 0 1 130 73" fill="none" stroke="#F59E0B" stroke-width="5.2" stroke-linecap="round" />
        </g>
      </g>
    </svg>
  `;
}

// Master HTML template for Instagram 1080x1350 (4:5 portrait)
function renderPostHtml(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          width: 1080px;
          height: 1350px;
          background: #FAF8F5;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          color: #1A1208;
          padding: 64px 72px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        /* Subtle Island Ambient Radiance */
        .ambient-bg {
          position: absolute;
          top: -150px;
          right: -150px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37, 211, 102, 0.12) 0%, rgba(250, 248, 245, 0) 70%);
          pointer-events: none;
        }
        .ambient-bg-2 {
          position: absolute;
          bottom: -150px;
          left: -150px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.10) 0%, rgba(250, 248, 245, 0) 70%);
          pointer-events: none;
        }

        /* Top Brand Header */
        .top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 10;
        }
        .brand-cluster {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .brand-name {
          font-family: 'Lexend', sans-serif;
          font-size: 28px;
          font-weight: 900;
          color: #1A1208;
          letter-spacing: -0.6px;
          line-height: 1.1;
        }
        .brand-handle {
          font-size: 16px;
          font-weight: 700;
          color: #059669;
          margin-top: 2px;
        }
        .location-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1.5px solid rgba(150, 72, 36, 0.12);
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 700;
          color: #5C4E3A;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        /* Main Body Canvas */
        .main-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .category-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 8px 18px;
          border-radius: 20px;
          width: fit-content;
        }

        h1 {
          font-family: 'Lexend', sans-serif;
          font-size: 56px;
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -1.8px;
          color: #1A1208;
          margin: 0;
        }

        .subtitle {
          font-size: 21px;
          line-height: 1.45;
          font-weight: 600;
          color: #5C4E3A;
          margin: 0;
          max-width: 900px;
        }

        /* Cards Layout */
        .cards-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 6px;
        }
        .feature-card {
          background: #FFFFFF;
          border: 2px solid rgba(150, 72, 36, 0.10);
          border-radius: 24px;
          padding: 22px 26px;
          display: flex;
          align-items: center;
          gap: 22px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.04);
        }
        .icon-circle {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-text {
          flex: 1;
        }
        .card-title {
          font-family: 'Lexend', sans-serif;
          font-size: 21px;
          font-weight: 800;
          color: #1A1208;
          margin-bottom: 4px;
          letter-spacing: -0.3px;
        }
        .card-desc {
          font-size: 16px;
          line-height: 1.35;
          color: #64748B;
          font-weight: 600;
        }

        /* Bottom Footer Action */
        .bottom-cta-bar {
          position: relative;
          z-index: 10;
          background: #1A1208;
          border-radius: 26px;
          padding: 22px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 14px 30px rgba(26, 18, 8, 0.2);
        }
        .cta-left {
          display: flex;
          flex-direction: column;
        }
        .cta-tagline {
          font-family: 'Lexend', sans-serif;
          font-size: 21px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.4px;
        }
        .cta-url {
          font-size: 15px;
          font-weight: 700;
          color: #25D366;
          margin-top: 3px;
        }
        .cta-btn {
          background: #25D366;
          color: #064E3B;
          font-family: 'Lexend', sans-serif;
          font-size: 16px;
          font-weight: 800;
          padding: 13px 22px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          letter-spacing: -0.2px;
        }
      </style>
    </head>
    <body>
      <div class="ambient-bg"></div>
      <div class="ambient-bg-2"></div>

      <!-- Top Header -->
      <div class="top-nav">
        <div class="brand-cluster">
          ${getMiniPoquitoSvg(72)}
          <div class="brand-text">
            <span class="brand-name">PoquitoTalk</span>
            <span class="brand-handle">@poquitotalk</span>
          </div>
        </div>
        <div class="location-tag">
          <span>🇵🇦</span>
          <span>Bocas del Toro, Panama</span>
        </div>
      </div>

      <!-- Main Content Dynamic -->
      <div class="main-content">
        ${data.html}
      </div>

      <!-- Bottom Action Bar -->
      <div class="bottom-cta-bar">
        <div class="cta-left">
          <span class="cta-tagline">${data.ctaTagline}</span>
          <span class="cta-url">${data.ctaUrl}</span>
        </div>
        <div class="cta-btn">
          <span>${data.ctaBtnText}</span>
          ${ICONS.arrowRight}
        </div>
      </div>
    </body>
    </html>
  `;
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new"
  });

  const posts = [
    // -------------------------------------------------------------
    // POST 1 (EN): Intro / What is PoquitoTalk (Waitlist CTA)
    // -------------------------------------------------------------
    {
      filename: "instagram_post_1_intro_en.png",
      ctaTagline: "Join Early Beta Access",
      ctaUrl: "poquitotalk.hero-apps.com",
      ctaBtnText: "Link in Bio",
      html: `
        <span class="category-pill" style="background: #DCFCE7; color: #047857;">Introducing PoquitoTalk</span>
        <h1>Finally, talk to Bocas locals like a local.</h1>
        <p class="subtitle">
          The AI voice translator & verified WhatsApp directory designed specifically for life in Bocas del Toro.
        </p>
        <div class="cards-grid">
          <div class="feature-card">
            <div class="icon-circle" style="background: #DCFCE7;">${ICONS.chat}</div>
            <div class="card-text">
              <div class="card-title">2-Way WhatsApp Voice Notes</div>
              <div class="card-desc">Speak naturally in English — Poquito delivers clean, native Spanish voice notes directly to local WhatsApp chats.</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="icon-circle" style="background: #FEF3C7;">${ICONS.mic}</div>
            <div class="card-text">
              <div class="card-title">Island Dialect & Slang Ready</div>
              <div class="card-desc">Trained on Bocas terms: lancheros, panga runs, rain cuts, and everyday Caribbean Panamanian phrasing.</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="icon-circle" style="background: #E0F2FE;">${ICONS.mapPin}</div>
            <div class="card-text">
              <div class="card-title">Verified Island Directory</div>
              <div class="card-desc">Instant 1-tap WhatsApp dispatch to trusted boat captains, plumbers, electricians, and trades.</div>
            </div>
          </div>
        </div>
      `
    },

    // -------------------------------------------------------------
    // POST 2 (ES): Directorio Local & Proveedores (Provider Registration CTA)
    // -------------------------------------------------------------
    {
      filename: "instagram_post_2_providers_es.png",
      ctaTagline: "Registra tu Servicio Gratis",
      ctaUrl: "poquitotalk.hero-apps.com/contractors",
      ctaBtnText: "Enlace en Bio",
      html: `
        <span class="category-pill" style="background: #FEF3C7; color: #B45309;">Directorio de Servicios</span>
        <h1>¿Ofreces servicios en Bocas del Toro?</h1>
        <p class="subtitle">
          Conéctate directamente con nuevos clientes y residentes internacionales en WhatsApp, sin barreras de idioma.
        </p>
        <div class="cards-grid">
          <div class="feature-card">
            <div class="icon-circle" style="background: #E0F2FE;">${ICONS.boat}</div>
            <div class="card-text">
              <div class="card-title">Capitanes de Lancha y Transporte</div>
              <div class="card-desc">Recibe solicitudes de viajes entre islas directamente en tu WhatsApp con traducción instantánea.</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="icon-circle" style="background: #FEF3C7;">${ICONS.wrench}</div>
            <div class="card-text">
              <div class="card-title">Técnicos, Electricistas y Plomeros</div>
              <div class="card-desc">Llega a clientes que necesitan reparaciones de confianza, sistemas solares, A/C y trabajos del hogar.</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="icon-circle" style="background: #DCFCE7;">${ICONS.shieldCheck}</div>
            <div class="card-text">
              <div class="card-title">Registro 100% Gratuito</div>
              <div class="card-desc">Sin comisiones ni intermediarios. Tu contacto directo de WhatsApp va a los clientes de Bocas.</div>
            </div>
          </div>
        </div>
      `
    },

    // -------------------------------------------------------------
    // POST 3 (ES): Introducción en Español (Waitlist / Acceso Anticipado)
    // -------------------------------------------------------------
    {
      filename: "instagram_post_3_intro_es.png",
      ctaTagline: "Únete a la Lista de Espera",
      ctaUrl: "poquitotalk.hero-apps.com",
      ctaBtnText: "Enlace en Bio",
      html: `
        <span class="category-pill" style="background: #DCFCE7; color: #047857;">Te Presentamos PoquitoTalk</span>
        <h1>La voz de Bocas del Toro en WhatsApp.</h1>
        <p class="subtitle">
          Traductor de notas de voz con inteligencia artificial y directorio verificado para conectar a toda la comunidad.
        </p>
        <div class="cards-grid">
          <div class="feature-card">
            <div class="icon-circle" style="background: #DCFCE7;">${ICONS.chat}</div>
            <div class="card-text">
              <div class="card-title">Notas de Voz en 2 Vías</div>
              <div class="card-desc">Escucha mensajes de clientes en tu idioma y responde con tu propia voz de forma rápida y clara.</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="icon-circle" style="background: #FEF3C7;">${ICONS.mic}</div>
            <div class="card-text">
              <div class="card-title">Adaptado al Lenguaje de la Isla</div>
              <div class="card-desc">Entiende términos locales, muelles, lanchas y referencias cotidianas del archipiélago.</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="icon-circle" style="background: #EDE9FE;">${ICONS.users}</div>
            <div class="card-text">
              <div class="card-title">Comunidad Conectada</div>
              <div class="card-desc">Un puente directo entre vecinos, emprendedores, capitanes y visitantes en todo Bocas del Toro.</div>
            </div>
          </div>
        </div>
      `
    },

    // -------------------------------------------------------------
    // POST 4 (Bilingual): How It Works / Cómo Funciona (3 Steps)
    // -------------------------------------------------------------
    {
      filename: "instagram_post_4_how_it_works.png",
      ctaTagline: "Try Live Web Demo • Prueba la Demo",
      ctaUrl: "poquitotalk.hero-apps.com",
      ctaBtnText: "Link in Bio",
      html: `
        <span class="category-pill" style="background: #E0F2FE; color: #0369A1;">How It Works • Cómo Funciona</span>
        <h1>Never get lost in translation on the islands.</h1>
        <p class="subtitle">
          From booking a water taxi to calling an electrician — 3 simple steps to clear island communication.
        </p>
        <div class="cards-grid">
          <div class="feature-card">
            <div class="icon-circle" style="background: #DCFCE7; font-family: 'Lexend', sans-serif; font-size: 24px; font-weight: 900; color: #047857;">1</div>
            <div class="card-text">
              <div class="card-title">Habla o Escribe con Calma</div>
              <div class="card-desc">Speak in plain English or Spanish. No complex grammar needed — explain what you need naturally.</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="icon-circle" style="background: #FEF3C7; font-family: 'Lexend', sans-serif; font-size: 24px; font-weight: 900; color: #B45309;">2</div>
            <div class="card-text">
              <div class="card-title">Poquito Generates Native Audio</div>
              <div class="card-desc">Translates with local Bocas context and produces a crystal-clear audio note ready for WhatsApp.</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="icon-circle" style="background: #E0F2FE; font-family: 'Lexend', sans-serif; font-size: 24px; font-weight: 900; color: #0284C7;">3</div>
            <div class="card-text">
              <div class="card-title">Direct WhatsApp Dispatch</div>
              <div class="card-desc">1-tap connects you directly with verified local captains, trades, and services across the archipelago.</div>
            </div>
          </div>
        </div>
      `
    }
  ];

  for (const post of posts) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
    await page.setContent(renderPostHtml(post), { waitUntil: "networkidle0" });
    const desktopPath = path.join(DESKTOP, post.filename);
    const workspacePath = path.join(WORKSPACE, post.filename);
    await page.screenshot({ path: desktopPath, width: 1080, height: 1350 });
    fs.copyFileSync(desktopPath, workspacePath);
    console.log(`Exported: ${desktopPath}`);
    await page.close();
  }

  await browser.close();
  console.log("All Instagram posts generated successfully!");
}

main().catch(console.error);
