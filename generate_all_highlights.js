const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const slides = [
  // ==========================================
  // FOLDER 1: 01_How_It_Works
  // ==========================================
  {
    folder: '01_How_It_Works',
    filename: 'how_it_works_01.png',
    pill: '01 / 03 • The Reality',
    pillColor: '#059669',
    title: 'Texting In Panama Is Different',
    subtitle: 'Locals and tradesmen in Bocas del Toro rarely read long, stiff text translations.',
    bodyHtml: `
      <div style="display:flex; flex-direction:column; gap:26px;">
        <div style="background:#FFFFFF; border:2.5px solid rgba(220,38,38,0.22); border-radius:28px; padding:38px 40px; box-shadow:0 16px 40px rgba(0,0,0,0.05);">
          <div style="font-size:16px; font-weight:800; color:#DC2626; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:14px; display:flex; align-items:center; gap:10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Google Translate Text
          </div>
          <div style="font-size:27px; color:#4B5563; line-height:1.45; font-style:italic;">
            "Estimado señor, le escribo para consultar si tiene la bondad de revisar mi aire acondicionado hoy..."
          </div>
          <div style="font-size:18px; font-weight:700; color:#991B1B; margin-top:16px;">
            ⚠️ Sounds formal & stiff. Often gets left on read.
          </div>
        </div>

        <div style="background:#F9FEFA; border:2.5px solid rgba(5,150,105,0.28); border-radius:28px; padding:38px 40px; box-shadow:0 16px 40px rgba(0,0,0,0.05);">
          <div style="font-size:16px; font-weight:800; color:#059669; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:14px; display:flex; align-items:center; gap:10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Panamanian WhatsApp Voice Note
          </div>
          <div style="font-size:27px; color:#14532D; font-weight:700; line-height:1.45;">
            "¡Buenas, amigo! ¿Cómo está? Mire, tengo el aire goteando agua en la sala. ¿Tendrá un tiempito hoy?"
          </div>
          <div style="font-size:18px; font-weight:700; color:#059669; margin-top:16px;">
            ✨ Quick, respectful & island contractors listen on the go.
          </div>
        </div>
      </div>
    `,
    footerAction: 'Swipe to see how it works ➔'
  },
  {
    folder: '01_How_It_Works',
    filename: 'how_it_works_02.png',
    pill: '02 / 03 • The Generator',
    pillColor: '#059669',
    title: 'Speak English. Get Local Voice Notes.',
    subtitle: 'Tap speak in English. PoquitoTalk crafts natural Panamanian voice notes in 1 tap.',
    bodyHtml: `
      <div style="background:#FFFFFF; border:2.5px solid rgba(150,72,36,0.14); border-radius:32px; padding:44px 40px; box-shadow:0 20px 48px rgba(0,0,0,0.06);">
        <div style="display:flex; align-items:center; gap:22px;">
          <div style="width:72px; height:72px; border-radius:22px; background:#D95B3015; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D95B30" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </div>
          <div>
            <div style="font-size:15px; font-weight:800; color:#927F6D; letter-spacing:1px; text-transform:uppercase;">1. You Speak In English</div>
            <div style="font-size:26px; font-weight:800; color:#1A1208; margin-top:4px;">"Can you come check my water pump today?"</div>
          </div>
        </div>

        <div style="height:2px; background:#F4F1EA; margin:32px 0;"></div>

        <div style="display:flex; align-items:center; gap:22px;">
          <div style="width:72px; height:72px; border-radius:22px; background:#05966915; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          </div>
          <div>
            <div style="font-size:15px; font-weight:800; color:#059669; letter-spacing:1px; text-transform:uppercase;">2. PoquitoTalk Generates</div>
            <div style="font-size:26px; font-weight:800; color:#1A1208; margin-top:4px;">Authentic Panamanian Audio</div>
            <div style="font-size:18px; color:#5C4E3A; margin-top:4px; font-weight:600;">Polite tone & island terminology locals trust.</div>
          </div>
        </div>
      </div>
    `,
    footerAction: 'Swipe to see WhatsApp delivery ➔'
  },
  {
    folder: '01_How_It_Works',
    filename: 'how_it_works_03.png',
    pill: '03 / 03 • WhatsApp Delivery',
    pillColor: '#059669',
    title: 'They Never Need An App',
    subtitle: 'Voice notes share directly into native WhatsApp chats. Your contractor simply taps play.',
    bodyHtml: `
      <div style="background:#EBF9EE; border:2.5px solid #86EFAC; border-radius:32px; padding:40px; box-shadow:0 18px 45px rgba(0,0,0,0.05); margin-bottom:26px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:14px; height:14px; border-radius:50%; background:#22C55E;"></div>
            <span style="font-size:18px; font-weight:800; color:#14532D;">WhatsApp Voice Message</span>
          </div>
          <span style="font-size:15px; font-weight:700; color:#15803D;">Delivered</span>
        </div>

        <div style="background:#FFFFFF; border-radius:24px; padding:24px 28px; display:flex; align-items:center; gap:20px; box-shadow:0 6px 18px rgba(0,0,0,0.04);">
          <div style="width:58px; height:58px; border-radius:50%; background:#059669; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="6 4 19 12 6 20 6 4"/></svg>
          </div>
          <div style="flex:1;">
            <div style="display:flex; gap:4px; align-items:center; height:32px;">
              <div style="width:5px; height:14px; background:#059669; border-radius:2px;"></div>
              <div style="width:5px; height:26px; background:#059669; border-radius:2px;"></div>
              <div style="width:5px; height:18px; background:#059669; border-radius:2px;"></div>
              <div style="width:5px; height:32px; background:#059669; border-radius:2px;"></div>
              <div style="width:5px; height:22px; background:#059669; border-radius:2px;"></div>
              <div style="width:5px; height:12px; background:#D1D5DB; border-radius:2px;"></div>
              <div style="width:5px; height:24px; background:#D1D5DB; border-radius:2px;"></div>
              <div style="width:5px; height:16px; background:#D1D5DB; border-radius:2px;"></div>
              <div style="width:5px; height:28px; background:#D1D5DB; border-radius:2px;"></div>
              <div style="width:5px; height:12px; background:#D1D5DB; border-radius:2px;"></div>
            </div>
            <div style="font-size:15px; font-weight:700; color:#6B7280; margin-top:6px;">0:14 • Clear Panamanian Spanish</div>
          </div>
        </div>
      </div>

      <div style="background:#FFFFFF; border:2.5px solid rgba(150,72,36,0.14); border-radius:26px; padding:28px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#1A1208;">Try Your First Voice Note Free</div>
        <div style="font-size:17px; color:#5C4E3A; margin-top:4px; font-weight:600;">Tap link sticker below to try in browser</div>
      </div>
    `,
    footerAction: 'Try it free • poquitotalk.hero-apps.com'
  },

  // ==========================================
  // FOLDER 2: 02_Boat_Taxis
  // ==========================================
  {
    folder: '02_Boat_Taxis',
    filename: 'boat_taxis_01.png',
    pill: '01 / 03 • Island Mobility',
    pillColor: '#0284C7',
    title: 'Bocas Runs On Water Taxis',
    subtitle: 'From Carenero to Red Frog, moving between islands in Bocas happens on pangas, not Uber.',
    bodyHtml: `
      <div style="display:flex; flex-direction:column; gap:18px;">
        <div style="background:#FFFFFF; border:2.5px solid rgba(2,132,199,0.22); border-radius:24px; padding:24px 28px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 12px 30px rgba(0,0,0,0.04);">
          <div>
            <div style="font-size:14px; font-weight:800; color:#0284C7; letter-spacing:1px; text-transform:uppercase;">Quick Hop</div>
            <div style="font-size:23px; font-weight:800; color:#1A1208; margin-top:2px;">Isla Colón ➔ Carenero</div>
          </div>
          <div style="background:#F0F9FF; color:#0284C7; font-weight:800; padding:10px 18px; border-radius:14px; font-size:17px;">2 Mins</div>
        </div>

        <div style="background:#FFFFFF; border:2.5px solid rgba(2,132,199,0.22); border-radius:24px; padding:24px 28px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 12px 30px rgba(0,0,0,0.04);">
          <div>
            <div style="font-size:14px; font-weight:800; color:#0284C7; letter-spacing:1px; text-transform:uppercase;">Village Ride</div>
            <div style="font-size:23px; font-weight:800; color:#1A1208; margin-top:2px;">Town ➔ Bastimentos / Old Bank</div>
          </div>
          <div style="background:#F0F9FF; color:#0284C7; font-weight:800; padding:10px 18px; border-radius:14px; font-size:17px;">10 Mins</div>
        </div>

        <div style="background:#FFFFFF; border:2.5px solid rgba(2,132,199,0.22); border-radius:24px; padding:24px 28px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 12px 30px rgba(0,0,0,0.04);">
          <div>
            <div style="font-size:14px; font-weight:800; color:#0284C7; letter-spacing:1px; text-transform:uppercase;">Beach Transfer</div>
            <div style="font-size:23px; font-weight:800; color:#1A1208; margin-top:2px;">Town ➔ Red Frog Marina</div>
          </div>
          <div style="background:#F0F9FF; color:#0284C7; font-weight:800; padding:10px 18px; border-radius:14px; font-size:17px;">15 Mins</div>
        </div>
      </div>
    `,
    footerAction: 'Swipe for 1-tap boat presets ➔'
  },
  {
    folder: '02_Boat_Taxis',
    filename: 'boat_taxis_02.png',
    pill: '02 / 03 • Voice Presets',
    pillColor: '#0284C7',
    title: 'Hailing A Ride Made 1-Tap',
    subtitle: 'Pre-built local phrases for dock pickups, luggage help, and return rides.',
    bodyHtml: `
      <div style="background:#FFFFFF; border:2.5px solid rgba(150,72,36,0.14); border-radius:32px; padding:38px 36px; box-shadow:0 18px 45px rgba(0,0,0,0.06);">
        <div style="font-size:15px; font-weight:800; color:#0284C7; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          1-Tap Dock Hailing Preset
        </div>
        <div style="font-size:26px; font-weight:800; color:#1A1208; line-height:1.4; margin-bottom:18px;">
          "¡Buenas, capitán! ¿Tiene lancha disponible para recogernos en el muelle de Carenero?"
        </div>
        <div style="font-size:19px; color:#5C4E3A; line-height:1.45; border-top:1.5px solid #F4F1EA; padding-top:16px;">
          Translation: "Hello captain! Do you have a boat available to pick us up at Carenero dock?"
        </div>
      </div>

      <div style="margin-top:28px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
        <span style="background:#E0F2FE; color:#0369A1; font-weight:800; padding:12px 22px; border-radius:24px; font-size:16px;">🧳 Luggage Help</span>
        <span style="background:#E0F2FE; color:#0369A1; font-weight:800; padding:12px 22px; border-radius:24px; font-size:16px;">🌧️ Rain Cover</span>
        <span style="background:#E0F2FE; color:#0369A1; font-weight:800; padding:12px 22px; border-radius:24px; font-size:16px;">🔄 Return Trip</span>
      </div>
    `,
    footerAction: 'Swipe for verified captains ➔'
  },
  {
    folder: '02_Boat_Taxis',
    filename: 'boat_taxis_03.png',
    pill: '03 / 03 • Verified Captains',
    pillColor: '#0284C7',
    title: '75+ Verified Captains',
    subtitle: 'Direct WhatsApp contacts with Hope Spot certified captains across the archipelago.',
    bodyHtml: `
      <div style="background:#F0F9FF; border:2.5px solid #BAE6FD; border-radius:32px; padding:38px 36px; box-shadow:0 18px 45px rgba(0,0,0,0.05); margin-bottom:26px;">
        <div style="display:flex; align-items:center; gap:18px; margin-bottom:18px;">
          <div style="width:68px; height:68px; border-radius:50%; background:#0284C7; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2.5-5.5h5.5l2 5.5h4.2l-2.4 4.5a2 2 0 0 1-1.8 1H6a2 2 0 0 1-1.8-1.1L3 12z"/><path d="M2 18.5c2 1.2 4 1.2 6 0s4-1.2 6 0 4 1.2 6 0"/></svg>
          </div>
          <div>
            <div style="font-size:24px; font-weight:900; color:#0C4A6E;">Hope Spot Certified</div>
            <div style="font-size:16px; color:#0369A1; font-weight:600; margin-top:2px;">Safe island transfers & licensed tours</div>
          </div>
        </div>
        <div style="font-size:19px; color:#0369A1; line-height:1.5; font-weight:600;">
          Never get stranded at the dock. Access verified captain numbers and dispatch voice notes in seconds.
        </div>
      </div>

      <div style="background:#FFFFFF; border:2.5px solid rgba(150,72,36,0.14); border-radius:26px; padding:28px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#1A1208;">Browse Bocas Captains Free</div>
        <div style="font-size:17px; color:#5C4E3A; margin-top:4px; font-weight:600;">Tap link sticker below to open directory</div>
      </div>
    `,
    footerAction: 'Browse Captains • poquitotalk.hero-apps.com'
  },

  // ==========================================
  // FOLDER 3: 03_Contractors
  // ==========================================
  {
    folder: '03_Contractors',
    filename: 'contractors_01.png',
    pill: '01 / 03 • Island Repairs',
    pillColor: '#CA8A04',
    title: 'Island Home Emergencies',
    subtitle: 'When tropical living brings repairs, fast communication with local tradesmen is crucial.',
    bodyHtml: `
      <div style="display:flex; flex-direction:column; gap:18px;">
        <div style="background:#FFFFFF; border:2.5px solid rgba(202,138,4,0.22); border-radius:24px; padding:24px 28px; display:flex; align-items:center; gap:20px; box-shadow:0 12px 30px rgba(0,0,0,0.04);">
          <div style="font-size:36px;">❄️</div>
          <div>
            <div style="font-size:22px; font-weight:800; color:#1A1208;">A/C Refrigerant & Coils</div>
            <div style="font-size:16px; color:#5C4E3A; margin-top:2px; font-weight:600;">Salt air corrodes condensers fast in Bocas.</div>
          </div>
        </div>

        <div style="background:#FFFFFF; border:2.5px solid rgba(202,138,4,0.22); border-radius:24px; padding:24px 28px; display:flex; align-items:center; gap:20px; box-shadow:0 12px 30px rgba(0,0,0,0.04);">
          <div style="font-size:36px;">💧</div>
          <div>
            <div style="font-size:22px; font-weight:800; color:#1A1208;">Water Pumps & Cisterns</div>
            <div style="font-size:16px; color:#5C4E3A; margin-top:2px; font-weight:600;">Pressure switch failures & rainwater filters.</div>
          </div>
        </div>

        <div style="background:#FFFFFF; border:2.5px solid rgba(202,138,4,0.22); border-radius:24px; padding:24px 28px; display:flex; align-items:center; gap:20px; box-shadow:0 12px 30px rgba(0,0,0,0.04);">
          <div style="font-size:36px;">📡</div>
          <div>
            <div style="font-size:22px; font-weight:800; color:#1A1208;">Starlink & Solar Inverters</div>
            <div style="font-size:16px; color:#5C4E3A; margin-top:2px; font-weight:600;">Post-storm alignment & battery diagnostics.</div>
          </div>
        </div>
      </div>
    `,
    footerAction: 'Swipe for 2-way live audio ➔'
  },
  {
    folder: '03_Contractors',
    filename: 'contractors_02.png',
    pill: '02 / 03 • 2-Way Live Audio',
    pillColor: '#CA8A04',
    title: 'Live Walkie-Talkie Sessions',
    subtitle: 'Have real-time 2-way voice conversations with zero language barrier on the job site.',
    bodyHtml: `
      <div style="background:#FEFCE8; border:2.5px solid #FDE047; border-radius:32px; padding:38px 36px; box-shadow:0 18px 45px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <span style="font-size:15px; font-weight:800; color:#854D0E; letter-spacing:1px; text-transform:uppercase;">You Speak</span>
          <span style="font-size:15px; font-weight:800; color:#854D0E; letter-spacing:1px; text-transform:uppercase;">They Hear</span>
        </div>

        <div style="background:#FFFFFF; border-radius:22px; padding:22px 26px; display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-weight:800; font-size:20px; color:#1A1208;">🇺🇸 English Voice</div>
          <div style="color:#CA8A04; font-size:24px; font-weight:900;">➔</div>
          <div style="font-weight:800; font-size:20px; color:#059669;">🇵🇦 Spanish Audio</div>
        </div>

        <div style="background:#FFFFFF; border-radius:22px; padding:22px 26px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div style="font-weight:800; font-size:20px; color:#059669;">🇵🇦 Spanish Reply</div>
          <div style="color:#CA8A04; font-size:24px; font-weight:900;">➔</div>
          <div style="font-weight:800; font-size:20px; color:#1A1208;">🇺🇸 English Audio</div>
        </div>

        <div style="font-size:17px; color:#854D0E; text-align:center; margin-top:22px; font-weight:700;">
          Contractors tap a lightweight room link. No app required.
        </div>
      </div>
    `,
    footerAction: 'Swipe to see contractor benefits ➔'
  },
  {
    folder: '03_Contractors',
    filename: 'contractors_03.png',
    pill: '03 / 03 • Clear Repairs',
    pillColor: '#CA8A04',
    title: 'No Misunderstandings',
    subtitle: 'Clear, respectful local Spanish that gets tradesmen to show up with the right parts.',
    bodyHtml: `
      <div style="background:#FFFFFF; border:2.5px solid rgba(150,72,36,0.14); border-radius:32px; padding:40px; box-shadow:0 20px 48px rgba(0,0,0,0.06); margin-bottom:26px;">
        <div style="font-size:16px; font-weight:800; color:#CA8A04; letter-spacing:1px; margin-bottom:18px;">WHY CONTRACTORS RESPOND FASTER:</div>
        <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:16px; font-size:20px; color:#5C4E3A; font-weight:700;">
          <li>✓ Correct local technical terms for island parts</li>
          <li>✓ Proper polite Panamanian greetings</li>
          <li>✓ Audio they can play easily in noisy workshops</li>
          <li>✓ Zero confusion on location, island, or dock</li>
        </ul>
      </div>

      <div style="background:#FFFFFF; border:2.5px solid rgba(150,72,36,0.14); border-radius:26px; padding:28px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#1A1208;">Handle Home Repairs Confidently</div>
        <div style="font-size:17px; color:#5C4E3A; margin-top:4px; font-weight:600;">Tap link sticker below to try free</div>
      </div>
    `,
    footerAction: 'Try PoquitoTalk • poquitotalk.hero-apps.com'
  },

  // ==========================================
  // FOLDER 4: 04_Bocas_Directory
  // ==========================================
  {
    folder: '04_Bocas_Directory',
    filename: 'bocas_directory_01.png',
    pill: '01 / 03 • Island Directory',
    pillColor: '#E11D48',
    title: 'The Pocket Directory For Bocas',
    subtitle: 'Over 75 vetted local service providers organized across 12 island categories.',
    bodyHtml: `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div style="background:#F0F9FF; border:2px solid #BAE6FD; border-radius:22px; padding:22px 18px; text-align:center;">
          <div style="font-size:32px;">🚤</div>
          <div style="font-size:18px; font-weight:800; color:#0369A1; margin-top:6px;">Boat Taxis</div>
        </div>
        <div style="background:#ECFDF5; border:2px solid #A7F3D0; border-radius:22px; padding:22px 18px; text-align:center;">
          <div style="font-size:32px;">❄️</div>
          <div style="font-size:18px; font-weight:800; color:#047857; margin-top:6px;">A/C & Solar</div>
        </div>
        <div style="background:#F0FDFA; border:2px solid #99F6E4; border-radius:22px; padding:22px 18px; text-align:center;">
          <div style="font-size:32px;">💧</div>
          <div style="font-size:18px; font-weight:800; color:#0F766E; margin-top:6px;">Plumbing</div>
        </div>
        <div style="background:#FFF1F2; border:2px solid #FECDD3; border-radius:22px; padding:22px 18px; text-align:center;">
          <div style="font-size:32px;">🩺</div>
          <div style="font-size:18px; font-weight:800; color:#BE123C; margin-top:6px;">Doctors & Clinic</div>
        </div>
        <div style="background:#FFFBEB; border:2px solid #FDE68A; border-radius:22px; padding:22px 18px; text-align:center;">
          <div style="font-size:32px;">💵</div>
          <div style="font-size:18px; font-weight:800; color:#B45309; margin-top:6px;">ATMs & Cash</div>
        </div>
        <div style="background:#FDF4FF; border:2px solid #F5D0FE; border-radius:22px; padding:22px 18px; text-align:center;">
          <div style="font-size:32px;">🐾</div>
          <div style="font-size:18px; font-weight:800; color:#A21CAF; margin-top:6px;">Island Vets</div>
        </div>
      </div>
    `,
    footerAction: 'Swipe to see direct WhatsApp ➔'
  },
  {
    folder: '04_Bocas_Directory',
    filename: 'bocas_directory_02.png',
    pill: '02 / 03 • 1-Tap Connect',
    pillColor: '#E11D48',
    title: 'No Middlemen. Direct WhatsApp.',
    subtitle: 'Tap any contractor or captain to launch a chat with pre-translated greetings ready.',
    bodyHtml: `
      <div style="background:#FFFFFF; border:2.5px solid rgba(150,72,36,0.14); border-radius:32px; padding:36px; box-shadow:0 20px 48px rgba(0,0,0,0.06); margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <div>
            <div style="font-size:24px; font-weight:900; color:#1A1208;">Local Electrician & Solar</div>
            <div style="font-size:16px; color:#5C4E3A; font-weight:600; margin-top:2px;">Isla Colón • Carenero • Bastimentos</div>
          </div>
          <div style="background:#D1FAE5; color:#047857; font-weight:800; padding:6px 14px; border-radius:10px; font-size:14px;">Verified</div>
        </div>

        <div style="background:#25D366; color:#FFFFFF; font-weight:800; font-size:20px; padding:18px; border-radius:20px; text-align:center; display:flex; align-items:center; justify-content:center; gap:12px; box-shadow:0 8px 20px rgba(37,211,102,0.25);">
          <span>Chat on WhatsApp</span>
        </div>
      </div>

      <div style="font-size:18px; color:#5C4E3A; text-align:center; font-weight:600;">
        Includes pre-loaded polite Spanish inquiry templates so you never have to think about what to write.
      </div>
    `,
    footerAction: 'Swipe to save to phone ➔'
  },
  {
    folder: '04_Bocas_Directory',
    filename: 'bocas_directory_03.png',
    pill: '03 / 03 • Access Anywhere',
    pillColor: '#E11D48',
    title: 'Save To Your Phone Free',
    subtitle: 'Access the complete Bocas directory anytime in your browser or phone home screen.',
    bodyHtml: `
      <div style="background:#FFF1F2; border:2.5px solid #FECDD3; border-radius:32px; padding:44px 36px; text-align:center; box-shadow:0 18px 45px rgba(0,0,0,0.05); margin-bottom:26px;">
        <div style="width:78px; height:78px; border-radius:24px; background:#E11D4818; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
        </div>
        <div style="font-size:26px; font-weight:900; color:#9F1239; margin-bottom:10px;">poquitotalk.hero-apps.com/directory</div>
        <div style="font-size:18px; color:#881337; font-weight:600; line-height:1.45;">
          1-tap search for boat rides, repairs, clinics & island essentials.
        </div>
      </div>

      <div style="background:#FFFFFF; border:2.5px solid rgba(150,72,36,0.14); border-radius:26px; padding:28px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#1A1208;">Access Directory Free</div>
        <div style="font-size:17px; color:#5C4E3A; margin-top:4px; font-weight:600;">Tap link sticker below to open</div>
      </div>
    `,
    footerAction: 'Open Directory • poquitotalk.hero-apps.com'
  }
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });

  for (const s of slides) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Lexend:wght@800;900&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1080px;
            height: 1920px;
            background: #FAF8F5;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 160px 70px 180px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            position: relative;
            overflow: hidden;
          }
          .header {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
          .pill-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .pill {
            background: ${s.pillColor}15;
            color: ${s.pillColor};
            border: 2px solid ${s.pillColor}30;
            padding: 12px 26px;
            border-radius: 30px;
            font-size: 18px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }
          .brand-badge {
            font-size: 20px;
            font-weight: 800;
            color: #927F6D;
            letter-spacing: 1.5px;
          }
          .title {
            font-family: 'Lexend', sans-serif;
            font-size: 68px;
            font-weight: 900;
            color: #1A1208;
            line-height: 1.08;
            letter-spacing: -2.2px;
            margin-top: 8px;
          }
          .subtitle {
            font-size: 27px;
            font-weight: 600;
            color: #5C4E3A;
            line-height: 1.45;
            max-width: 900px;
          }
          .main-body {
            margin: auto 0;
            width: 100%;
          }
          .footer-action {
            background: #FFFFFF;
            border: 2px solid rgba(150,72,36,0.15);
            border-radius: 24px;
            padding: 24px 34px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.04);
          }
          .footer-left {
            font-family: 'Lexend', sans-serif;
            font-size: 22px;
            font-weight: 800;
            color: #1A1208;
          }
          .footer-link {
            font-size: 20px;
            font-weight: 800;
            color: #D95B30;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="pill-row">
            <div class="pill">${s.pill}</div>
            <div class="brand-badge">POQUITOTALK 🇵🇦</div>
          </div>
          <div class="title">${s.title}</div>
          <div class="subtitle">${s.subtitle}</div>
        </div>

        <div class="main-body">
          ${s.bodyHtml}
        </div>

        <div class="footer-action">
          <div class="footer-left">${s.footerAction}</div>
          <div class="footer-link">poquitotalk.hero-apps.com</div>
        </div>
      </body>
      </html>
    `;
    await page.setContent(html, { waitUntil: 'networkidle' });
    const localDir = path.join('/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras', s.folder);
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    const outPath = path.join(localDir, s.filename);
    await page.screenshot({ path: outPath });
    console.log('Generated:', outPath);
  }
  await browser.close();
})();
