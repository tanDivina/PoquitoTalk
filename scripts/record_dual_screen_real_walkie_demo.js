/**
 * record_dual_screen_real_walkie_demo.js
 * 
 * Scenario 1: Sarah (Resident on Isla Solarte) & Capitán Luis (Water Taxi at Taxi 25 dock)
 * - Left Phone: Real PoquitoTalk React Native App (dist/)
 * - Right Phone: Real zero-install contractor web funnel (web-funnel/talk.html)
 * - Center Bridge: Live AI routing, dynamic language nodes, equalizer waveform
 * - Bottom: Synchronized audio & bilingual subtitles
 * - Studio Audio: Synchronized multiplexing via FFmpeg adelay filter complex
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const APP_PORT = 8099;
const WEB_PORT = 8130;
const OUTPUT_VIDEO = path.join(__dirname, '..', 'dual_screen_walkie_talkie_demo.mp4');
const FFMPEG_PATH = '/opt/homebrew/bin/ffmpeg';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function serveDir(dir, port) {
  return http.createServer((req, res) => {
    let filePath = path.join(dir, req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(dir, 'index.html');
    }
    const ext = path.extname(filePath);
    const mime = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp3': 'audio/mpeg'
    }[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, {
        'Content-Type': mime,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  }).listen(port);
}

// Audio tracks
const AUDIO_BEEP = path.join(__dirname, '..', 'assets/audio/walkie_beep.mp3');
const AUDIO_EXPAT_TURN1 = path.join(__dirname, '..', 'assets/audio/simulation/sarah_original_en.mp3');
const AUDIO_TRANS_TURN1 = path.join(__dirname, '..', 'assets/audio/simulation/sarah_trans_es.mp3');
const AUDIO_CONTRACTOR_TURN2 = path.join(__dirname, '..', 'assets/audio/simulation/luis_reply_es.mp3');
const AUDIO_EXPAT_TURN2 = path.join(__dirname, '..', 'assets/audio/simulation/luis_trans_en.mp3');
const AUDIO_EXPAT_TURN3 = path.join(__dirname, '..', 'assets/audio/simulation/sarah_turn3_en.mp3');
const AUDIO_TRANS_TURN3 = path.join(__dirname, '..', 'assets/audio/simulation/sarah_turn3_es.mp3');

async function main() {
  console.log('--- Starting Dual Screen Real App Walkie Video Generator (Scenario 1: Sarah & Luis) ---');

  const appServer = serveDir(path.join(__dirname, '..', 'dist'), APP_PORT);
  const webServer = serveDir(path.join(__dirname, '..', 'web-funnel'), WEB_PORT);
  console.log(`Servers running on http://localhost:${APP_PORT} (App) and http://localhost:${WEB_PORT} (Web)`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    pipe: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${WEB_PORT}/dual_real_walkie_stage.html`, { waitUntil: 'networkidle0' });

  // Verbatim Spanish & English texts
  const spTopic = encodeURIComponent('¡Hola Capitán Luis! ¿Está disponible para recogernos en el muelle de Taxi 25 en Bocas Town como a las cuatro de la tarde y llevarnos de vuelta a Isla Solarte?');
  const enTopic = encodeURIComponent('Hi Capitán Luis! Are you available to pick us up at Taxi 25 dock in Bocas Town around 4:00 PM and take us back to Isla Solarte?');

  await page.evaluate((appPort, webPort, spT, enT) => {
    window.setExpatUrl(`http://localhost:${appPort}/?splash=false&onboarding=false`);
    window.setContractorUrl(`http://localhost:${webPort}/talk.html?name=Sarah&topic=${spT}&topicEn=${enT}`);
    window.setBridgeState('none');
    window.setStepStatus('Conexión lista • Toca el micrófono para iniciar');
    window.setSubtitles('system', 'PoquitoTalk 2-Way Walkie-Talkie • Resident App ⇄ Water Taxi Web');
  }, APP_PORT, WEB_PORT, spTopic, enTopic);

  // Wait 1.5s for iframes to render completely
  await new Promise(r => setTimeout(r, 1500));

  const audioCues = [];
  const FPS = 30;

  console.log('Setting up Chrome CDP Screencast...');
  const client = await page.target().createCDPSession();
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 95,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  const rawFrames = [];
  let startTime = Date.now();

  client.on('Page.screencastFrame', async (event) => {
    const buf = Buffer.from(event.data, 'base64');
    const t = Date.now() - startTime;
    rawFrames.push({ buf, t });
    try {
      await client.send('Page.screencastFrameAck', { sessionId: event.sessionId });
    } catch (e) {}
  });

  console.log('Recording timeline started...');

  function logCue(name) {
    const timeMs = Date.now() - startTime;
    console.log(`[Audio Cue: ${name}] at ${timeMs}ms`);
    audioCues.push({ name, timeMs });
  }

  const waitMs = (ms) => new Promise(r => setTimeout(r, ms));

  // --- ACT 1: SARAH TAPS MIC & SPEAKS ENGLISH (0s - 10s) ---
  console.log('Act 1: Sarah taps mic & speaks English question');
  await waitMs(1000);

  // Move finger to Sarah "TAP TO TALK" mic button
  await page.evaluate(() => {
    window.setVirtualFinger(500, 580, null, true);
  });
  await waitMs(600);

  // Tap Mic & PUSH IN BUTTON -> Button turns RED & RECORDING...
  await page.evaluate((appPort) => {
    window.setVirtualFinger(500, 580, 'tapping', true);
    window.setExpatUrl(`http://localhost:${appPort}/?splash=false&onboarding=false&listening=true`);
  }, APP_PORT);
  logCue('beep_1');
  await waitMs(300);

  // Speaking Turn 1 (Sarah)
  logCue('expat_turn1');
  await page.evaluate(() => {
    window.setVirtualFinger(500, 580, null, false);
    window.setBridgeState('en-to-es');
    window.setStepStatus('Transmitiendo voz en inglés ➔ Procesando modelo panameño');
    window.setSubtitles('expat', '"Hi Capitán Luis! Are you available to pick us up at Taxi 25 dock in Bocas Town around 4:00 PM and take us back to Isla Solarte?"');
  });

  // Sarah speaks for 4.5 seconds with button visibly in active red recording state
  await waitMs(4500);

  // Switch to translating (blue)
  await page.evaluate((appPort) => {
    window.setExpatUrl(`http://localhost:${appPort}/?splash=false&onboarding=false&translating=true`);
    window.setStepStatus('Afinando traducción en español de Panamá...');
  }, APP_PORT);
  await waitMs(1200);

  // Show translated Panamanian Spanish output & active walkie session
  const prompt1 = encodeURIComponent('Hi Capitán Luis! Are you available to pick us up at Taxi 25 dock in Bocas Town around 4:00 PM and take us back to Isla Solarte?');
  const output1 = encodeURIComponent('¡Hola Capitán Luis! ¿Está disponible para recogernos en el muelle de Taxi 25 en Bocas Town como a las cuatro de la tarde y llevarnos de vuelta a Isla Solarte?');
  await page.evaluate((appPort, p, o) => {
    window.setExpatUrl(`http://localhost:${appPort}/?splash=false&onboarding=false&walkieActive=true&prompt=${p}&output=${o}`);
  }, APP_PORT, prompt1, output1);

  await waitMs(3000);

  // Move finger to 'Share Channel on WhatsApp'
  await page.evaluate(() => {
    window.setVirtualFinger(500, 360, null, true);
  });
  await waitMs(600);
  await page.evaluate(() => {
    window.setVirtualFinger(500, 360, 'tapping', true);
  });
  await waitMs(300);

  await page.evaluate((appPort) => {
    window.setVirtualFinger(500, 360, null, false);
    window.setExpatUrl(`http://localhost:${appPort}/?splash=false&onboarding=false&walkieActive=true`);
    window.setStepStatus('Canal en vivo activado • Enlace instantáneo enviado por WhatsApp');
    window.setSubtitles('system', 'Canal 2-Way PoquitoTalkie activado • Enlace web enviado al Capitán Luis');
  }, APP_PORT);
  await waitMs(1500);

  // --- ACT 2: CAPTAIN OPENS WEB LINK & LISTENS IN SPANISH (10s - 23s) ---
  console.log('Act 2: Captain listens to Spanish voice note on web');
  await page.evaluate((webPort, spT, enT) => {
    window.setContractorUrl(`http://localhost:${webPort}/talk.html?name=Sarah&topic=${spT}&topicEn=${enT}`);
    window.setStepStatus('Capitán abre enlace web • Poquito listo para reproducir');
  }, WEB_PORT, spTopic, enTopic);
  await waitMs(1200);

  // Finger moves to Captain 'Escuchar Mensaje de Audio'
  await page.evaluate(() => {
    window.setVirtualFinger(1420, 525, null, true);
  });
  await waitMs(600);
  await page.evaluate(() => {
    window.setVirtualFinger(1420, 525, 'tapping', true);
  });
  await waitMs(300);

  // Audio Playback Turn 1 on Web
  logCue('trans_turn1');
  await page.evaluate(() => {
    window.setVirtualFinger(1420, 525, null, false);
    window.setBridgeState('es-to-en');
    window.setStepStatus('Capitán Luis escucha la solicitud en español panameño en alta definición');
    window.setSubtitles('translation_to_contractor', '"¡Hola Capitán Luis! ¿Está disponible para recogernos en el muelle de Taxi 25 en Bocas Town como a las cuatro de la tarde y llevarnos de vuelta a Isla Solarte?"');
  });

  await waitMs(8500);

  // --- ACT 3: CAPTAIN REPLIES IN SPANISH USING PTT (23s - 34s) ---
  console.log('Act 3: Captain replies in Spanish using Push-To-Talk');
  // Finger moves to Web PTT Button
  await page.evaluate(() => {
    window.setVirtualFinger(1420, 680, null, true);
  });
  await waitMs(600);

  // Press PTT
  await page.evaluate(() => {
    window.setVirtualFinger(1420, 680, 'tapping', true);
    try {
      const cIframe = document.getElementById('contractor-iframe');
      if (cIframe && cIframe.contentWindow && cIframe.contentWindow.handlePttStart) {
        cIframe.contentWindow.handlePttStart();
      }
    } catch(e) {}
  });
  logCue('beep_2');
  await waitMs(300);

  // Captain Speaking Turn 2
  logCue('contractor_turn2');
  await page.evaluate(() => {
    window.setBridgeState('es-to-en');
    window.setStepStatus('Capitán Luis mantiene pulsado PTT y responde en español natural');
    window.setSubtitles('contractor', '"¡Buenas tardes doña Sarah! Sí, claro que sí, a las cuatro en punto estoy amarrado en Taxi 25 esperándolos en la lancha. ¡Nos vemos allá!"');
  });

  await waitMs(7500);

  // Release PTT
  await page.evaluate(() => {
    window.setVirtualFinger(1420, 680, null, false);
    try {
      const cIframe = document.getElementById('contractor-iframe');
      if (cIframe && cIframe.contentWindow && cIframe.contentWindow.handlePttEnd) {
        cIframe.contentWindow.handlePttEnd();
        if (cIframe.contentWindow.conversation) {
          cIframe.contentWindow.conversation.push({
            id: 'msg_contractor_1',
            sender: 'contractor',
            senderName: 'Capitán Luis',
            time: '04:01 PM',
            esText: '¡Buenas tardes doña Sarah! Sí, claro que sí, a las cuatro en punto estoy amarrado en Taxi 25 esperándolos en la lancha. ¡Nos vemos allá!',
            enText: 'Good afternoon Mrs. Sarah! Yes, of course, at four sharp I will be tied up at Taxi 25 waiting for you in the boat. See you there!'
          });
          cIframe.contentWindow.renderConversation();
        }
      }
    } catch(e) {}
  });
  await waitMs(1000);

  // --- ACT 4: SARAH RECEIVES TRANSLATED ENGLISH AUDIO & POLISHED CARD (34s - 44s) ---
  console.log('Act 4: Sarah receives real-time translated English audio in App');
  logCue('expat_turn2');
  await page.evaluate((appPort) => {
    window.setExpatUrl(`http://localhost:${appPort}/?splash=false&onboarding=false&walkieActive=true&incoming=true`);
    window.setBridgeState('es-to-en');
    window.setStepStatus('Traducción en vivo recibida en la App • Audio inglés reproduciendo');
    window.setSubtitles('translation_to_expat', '"Good afternoon Mrs. Sarah! Yes, of course, at four sharp I will be tied up at Taxi 25 waiting for you in the boat. See you there!"');
  }, APP_PORT);

  await waitMs(8500);

  // --- ACT 5: SARAH TAPS REPLY & SENDS CONFIRMATION (44s - 55s) ---
  console.log('Act 5: Sarah taps Reply and confirms pickup');
  // Finger moves to "Reply to Capitán Luis in English"
  await page.evaluate(() => {
    window.setVirtualFinger(500, 645, null, true);
  });
  await waitMs(600);
  await page.evaluate(() => {
    window.setVirtualFinger(500, 645, 'tapping', true);
  });
  await waitMs(300);

  // App opens reply mode with clean composer & ready PTT
  await page.evaluate((appPort) => {
    window.setVirtualFinger(500, 645, null, false);
    window.setExpatUrl(`http://localhost:${appPort}/?splash=false&onboarding=false&walkieActive=true&replying=true`);
    window.setStepStatus('Sarah redacta confirmación de recogida');
  }, APP_PORT);
  await waitMs(1000);

  // Move finger to TAP TO TALK to speak reply
  await page.evaluate(() => {
    window.setVirtualFinger(500, 580, null, true);
  });
  await waitMs(600);

  // Tap Mic to dictate reply -> Button turns RED & RECORDING...
  await page.evaluate((appPort) => {
    window.setVirtualFinger(500, 580, 'tapping', true);
    window.setExpatUrl(`http://localhost:${appPort}/?splash=false&onboarding=false&walkieActive=true&replying=true&listening=true`);
  }, APP_PORT);
  await waitMs(300);

  // Speaking Turn 3 (Sarah)
  logCue('expat_turn3');
  await page.evaluate(() => {
    window.setVirtualFinger(500, 580, null, false);
    window.setBridgeState('en-to-es');
    window.setStepStatus('Sarah responde en inglés: "Perfect Captain, see you at four!"');
    window.setSubtitles('expat', '"Perfect Captain, see you at four at Taxi 25!"');
  });

  // Sarah speaks reply for 2.8s while recording is active
  await waitMs(2800);

  // Switch to translating
  await page.evaluate((appPort) => {
    window.setExpatUrl(`http://localhost:${appPort}/?splash=false&onboarding=false&walkieActive=true&replying=true&translating=true`);
  }, APP_PORT);
  await waitMs(1000);

  // Show translated reply
  const replyPrompt = encodeURIComponent('Perfect Captain, see you at four at Taxi 25!');
  const replyOutput = encodeURIComponent('¡Perfecto Capitán, nos vemos a las cuatro en Taxi 25!');
  await page.evaluate((appPort, rp, ro) => {
    window.setExpatUrl(`http://localhost:${appPort}/?splash=false&onboarding=false&walkieActive=true&replying=true&prompt=${rp}&output=${ro}`);
  }, APP_PORT, replyPrompt, replyOutput);
  await waitMs(1500);

  // Spanish translation dispatched to Captain's web feed
  logCue('trans_turn3');
  await page.evaluate(() => {
    window.setBridgeState('en-to-es');
    window.setStepStatus('Confirmación traducida y entregada al Capitán Luis en tiempo real');
    window.setSubtitles('translation_to_contractor', '"¡Perfecto Capitán, nos vemos a las cuatro en Taxi 25!"');
    try {
      const cIframe = document.getElementById('contractor-iframe');
      if (cIframe && cIframe.contentWindow && cIframe.contentWindow.conversation) {
        cIframe.contentWindow.conversation.push({
          id: 'msg_expat_2',
          sender: 'expat',
          senderName: 'Sarah',
          time: '04:02 PM',
          esText: '¡Perfecto Capitán, nos vemos a las cuatro en Taxi 25!',
          enText: 'Perfect Captain, see you at four at Taxi 25!'
        });
        cIframe.contentWindow.renderConversation();
      }
    } catch(e) {}
  });

  await waitMs(4500);

  // --- ACT 6: FINAL WRAP UP & SUMMARY ---
  console.log('Act 6: Final summary state');
  await page.evaluate(() => {
    window.setBridgeState('none');
    window.setStepStatus('✓ Conversación bidireccional fluida • Cero descargas para locales');
    window.setSubtitles('system', 'PoquitoTalk • Comunicación por voz en tiempo real para Bocas del Toro 🇵🇦');
  });
  await waitMs(3000);

  const totalDurationMs = Date.now() - startTime;

  // Stop screencast
  await client.send('Page.stopScreencast');
  await browser.close();
  appServer.close();
  webServer.close();

  console.log(`Raw captured frames: ${rawFrames.length} across ${totalDurationMs}ms`);

  // Resample frames to precise 30 FPS constant framerate
  const totalTargetFrames = Math.floor((totalDurationMs / 1000) * FPS);
  console.log(`Resampling to ${totalTargetFrames} frames @ ${FPS} FPS...`);

  const resampledFrames = [];
  let rawIdx = 0;
  for (let i = 0; i < totalTargetFrames; i++) {
    const targetTimeMs = (i / FPS) * 1000;
    while (rawIdx < rawFrames.length - 1 && rawFrames[rawIdx + 1].t <= targetTimeMs) {
      rawIdx++;
    }
    resampledFrames.push(rawFrames[rawIdx].buf);
  }

  // Build FFmpeg Adelay Filter
  const beep1Delay = audioCues.find(c => c.name === 'beep_1')?.timeMs || 1600;
  const expat1Delay = audioCues.find(c => c.name === 'expat_turn1')?.timeMs || 1900;
  const trans1Delay = audioCues.find(c => c.name === 'trans_turn1')?.timeMs || 14000;
  const beep2Delay = audioCues.find(c => c.name === 'beep_2')?.timeMs || 27000;
  const contractor2Delay = audioCues.find(c => c.name === 'contractor_turn2')?.timeMs || 27200;
  const expat2Delay = audioCues.find(c => c.name === 'expat_turn2')?.timeMs || 38000;
  const expat3Delay = audioCues.find(c => c.name === 'expat_turn3')?.timeMs || 47000;
  const trans3Delay = audioCues.find(c => c.name === 'trans_turn3')?.timeMs || 51000;

  console.log('Audio cue offsets (ms):', {
    beep1Delay,
    expat1Delay,
    trans1Delay,
    beep2Delay,
    contractor2Delay,
    expat2Delay,
    expat3Delay,
    trans3Delay
  });

  const filterComplex = [
    `[1:a]adelay=${beep1Delay}|${beep1Delay}[a1]`,
    `[2:a]adelay=${expat1Delay}|${expat1Delay}[a2]`,
    `[3:a]adelay=${trans1Delay}|${trans1Delay}[a3]`,
    `[4:a]adelay=${beep2Delay}|${beep2Delay}[a4]`,
    `[5:a]adelay=${contractor2Delay}|${contractor2Delay}[a5]`,
    `[6:a]adelay=${expat2Delay}|${expat2Delay}[a6]`,
    `[7:a]adelay=${expat3Delay}|${expat3Delay}[a7]`,
    `[8:a]adelay=${trans3Delay}|${trans3Delay}[a8]`,
    `[a1][a2][a3][a4][a5][a6][a7][a8]amix=inputs=8:duration=longest:normalize=0[aout]`
  ].join(';');

  const finalFfmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(FPS),
    '-i', 'pipe:0',
    '-i', AUDIO_BEEP,
    '-i', AUDIO_EXPAT_TURN1,
    '-i', AUDIO_TRANS_TURN1,
    '-i', AUDIO_BEEP,
    '-i', AUDIO_CONTRACTOR_TURN2,
    '-i', AUDIO_EXPAT_TURN2,
    '-i', AUDIO_EXPAT_TURN3,
    '-i', AUDIO_TRANS_TURN3,
    '-filter_complex', filterComplex,
    '-map', '0:v',
    '-map', '[aout]',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '48000',
    '-shortest',
    OUTPUT_VIDEO
  ];

  console.log('Spawning FFmpeg to mux video and audio...');
  const ffmpeg = spawn(FFMPEG_PATH, finalFfmpegArgs);

  ffmpeg.stderr.on('data', (d) => {
    // console.log('FFmpeg:', d.toString());
  });

  // Write frames in chunks with flow control
  await new Promise((resolve, reject) => {
    let frameIndex = 0;

    function writeNextChunk() {
      let canWrite = true;
      while (frameIndex < resampledFrames.length && canWrite) {
        canWrite = ffmpeg.stdin.write(resampledFrames[frameIndex]);
        frameIndex++;
      }

      if (frameIndex < resampledFrames.length) {
        ffmpeg.stdin.once('drain', writeNextChunk);
      } else {
        ffmpeg.stdin.end();
      }
    }

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('✓ Video generated successfully at:', OUTPUT_VIDEO);
        const stats = fs.statSync(OUTPUT_VIDEO);
        console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        resolve();
      } else {
        reject(new Error('FFmpeg exited with code ' + code));
      }
    });

    ffmpeg.on('error', reject);
    writeNextChunk();
  });

  console.log('--- Done! ---');
}

main().catch(err => {
  console.error('Error generating video:', err);
  process.exit(1);
});
