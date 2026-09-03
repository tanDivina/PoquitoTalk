#!/usr/bin/env node

/**
 * PoquitoTalk Dual-Screen Simultaneous Two-Way Walkie-Talkie Demonstration
 * Captures synchronized side-by-side video (Expat iPhone App + Contractor Web Walkie)
 * Multiplexes frame-accurate ElevenLabs & Studio Audio tracks via FFmpeg.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn, execSync } = require("child_process");
const puppeteer = require("puppeteer-core");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const WEB_DIR = path.join(__dirname, "..", "web-funnel");
const OUTPUT_VIDEO = path.join(__dirname, "..", "dual_screen_walkie_talkie_demo.mp4");
const TEMP_RAW_VIDEO = path.join(__dirname, "..", ".tmp_dual_walkie_raw.mp4");

const CAPTAIN_JIM_AUDIO = path.join(__dirname, "..", "assets", "audio", "captain_jim_elevenlabs.mp3");
const TURN1_SPANISH_AUDIO = path.join(__dirname, "..", "assets", "audio", "simulation", "turn1_spanish_trans.mp3");
const TURN2_CONTRACTOR_AUDIO = path.join(__dirname, "..", "assets", "audio", "simulation", "turn2_contractor_spanish.mp3");
const TURN2_EXPAT_AUDIO = path.join(__dirname, "..", "assets", "audio", "simulation", "turn2_expat_trans.mp3");
const BEEP_AUDIO = path.join(__dirname, "..", "assets", "audio", "walkie_beep.mp3");

const PORT = 8138;
const FPS = 30;

function startStaticServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".webp": "image/webp",
      ".mp3": "audio/mpeg",
      ".svg": "image/svg+xml",
    };

    const server = http.createServer((req, res) => {
      const urlPath = req.url.split("?")[0];
      let filePath = path.join(WEB_DIR, urlPath === "/" ? "dual_walkie_simulation.html" : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(WEB_DIR, "dual_walkie_simulation.html");
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || "application/octet-stream";

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end("Error loading file");
          return;
        }
        res.writeHead(200, {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
        });
        res.end(content);
      });
    });

    server.listen(PORT, () => {
      console.log("Static dual demo server running on http://localhost:" + PORT);
      resolve(server);
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const server = await startStaticServer();

  console.log("Launching headless Chrome for Dual-Screen Walkie-Talkie demonstration...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--window-size=1920,1080",
      "--hide-scrollbars",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });

  console.log("Loading dual-screen simulation stage...");
  await page.goto("http://localhost:" + PORT + "/dual_walkie_simulation.html", { waitUntil: "networkidle0" });

  // Pre-warm WebP images in page cache
  await page.evaluate(() => {
    ["poquito_tilt_34_51_160.webp", "poquito_talk_58_73_160.webp", "poquito_listening_49_60_160.webp"].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  });

  // Start FFmpeg raw capture stream
  console.log("Starting FFmpeg raw screencast capture...");
  const ffmpegStream = spawn("/opt/homebrew/bin/ffmpeg", [
    "-y",
    "-f", "image2pipe",
    "-vcodec", "mjpeg",
    "-r", "" + FPS,
    "-i", "-",
    "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-pix_fmt", "yuv420p",
    "-r", "" + FPS,
    TEMP_RAW_VIDEO,
  ]);

  const client = await page.target().createCDPSession();
  await client.send("Page.startScreencast", {
    format: "jpeg",
    quality: 95,
    everyNthFrame: 1,
  });

  let frameCount = 0;
  client.on("Page.screencastFrame", async (frame) => {
    try {
      frameCount++;
      const buffer = Buffer.from(frame.data, "base64");
      ffmpegStream.stdin.write(buffer);
      await client.send("Page.screencastFrameAck", { sessionId: frame.sessionId });
    } catch (e) {}
  });

  const audioCues = []; // Stores { frameNumber, audioPath }

  console.log("Action 1: Scene Intro & Channel Connection (1.8s)...");
  await page.evaluate(() => {
    window.setMascot("resting");
    window.setStatusBanner("Canal conectado con éxito • Bocas Marina Slip #4");
    window.setSubtitles("expat", "PoquitoTalk Walkie-Talkie • Conversación Bidireccional en Tiempo Real");
  });
  await sleep(1800);

  // Turn 1: Expat speaks English (Captain Jim)
  console.log("Action 2: Expat holds PTT button on iPhone...");
  await page.evaluate(() => window.setVirtualFinger(505, 875, false, true));
  await sleep(400);

  audioCues.push({ frameNumber: frameCount, audioPath: BEEP_AUDIO });
  await page.evaluate(() => {
    window.setVirtualFinger(505, 875, true, true);
    window.setExpatRecording(true);
    window.showExpatBubble1();
    window.setStatusBanner("Expatriado transmitiendo voz en inglés...");
    window.setSubtitles("expat", "Hey buenas tardes! Tomorrow morning around 9:00 AM works great at slip #4 Bocas Marina.");
  });

  audioCues.push({ frameNumber: frameCount, audioPath: CAPTAIN_JIM_AUDIO });
  await sleep(7900);

  // Expat releases PTT
  console.log("Action 3: Expat releases button, AI Translates to Spanish (0.4s)...");
  audioCues.push({ frameNumber: frameCount, audioPath: BEEP_AUDIO });
  await page.evaluate(() => {
    window.setVirtualFinger(505, 875, false, false);
    window.setExpatRecording(false);
    window.setStatusBanner("⚡ Traduciendo voz al español con IA...");
  });
  await sleep(400);

  // Turn 1 Translation Delivered to Contractor
  console.log("Action 4: Contractor receives live translated Spanish voice (8.2s)...");
  audioCues.push({ frameNumber: frameCount, audioPath: BEEP_AUDIO });
  await page.evaluate(() => {
    window.setMascot("listening");
    window.showContractorCard1();
    window.setStatusBanner("🔊 Contratista escuchando mensaje traducido en español...");
    window.setSubtitles("translation_to_contractor", "¡Buenas tardes! Perfecto. Mañana por la mañana a las nueve está perfecto. El bote está en el muelle número cuatro en Bocas Marina.");
  });
  audioCues.push({ frameNumber: frameCount, audioPath: TURN1_SPANISH_AUDIO });
  await sleep(8200);

  await page.evaluate(() => {
    window.setMascot("resting");
    window.setStatusBanner("Canal libre • Listo para responder");
  });
  await sleep(300);

  // Turn 2: Contractor speaks Spanish
  console.log("Action 5: Contractor presses PTT & speaks Spanish (7.2s)...");
  await page.evaluate(() => window.setVirtualFinger(1415, 860, false, true));
  await sleep(400);

  audioCues.push({ frameNumber: frameCount, audioPath: BEEP_AUDIO });
  await page.evaluate(() => {
    window.setVirtualFinger(1415, 860, true, true);
    window.setContractorRecording(true);
    window.showContractorCard2();
    window.setStatusBanner("Contratista transmitiendo voz en español...");
    window.setSubtitles("contractor", "¡Listo patrón! Mañana a las nueve en punto estoy allá con las herramientas para chequear el motor. ¡Wepa!");
  });

  audioCues.push({ frameNumber: frameCount, audioPath: TURN2_CONTRACTOR_AUDIO });
  await sleep(7200);

  // Contractor releases button
  console.log("Action 6: Contractor releases button, AI translates to English (0.4s)...");
  audioCues.push({ frameNumber: frameCount, audioPath: BEEP_AUDIO });
  await page.evaluate(() => {
    window.setVirtualFinger(1415, 860, false, false);
    window.setContractorRecording(false);
    window.setStatusBanner("⚡ Traduciendo voz al inglés con IA...");
  });
  await sleep(400);

  // Turn 2 Translation Delivered to Expat
  console.log("Action 7: Expat receives translated English speech on iPhone (7.4s)...");
  audioCues.push({ frameNumber: frameCount, audioPath: BEEP_AUDIO });
  await page.evaluate(() => {
    window.showExpatBubble2();
    window.setStatusBanner("🔊 Expatriado escuchando mensaje traducido en inglés...");
    window.setSubtitles("translation_to_expat", "All set boss! Tomorrow at nine sharp I will be there at slip four with the tools to check the engine. Wepa!");
  });
  audioCues.push({ frameNumber: frameCount, audioPath: TURN2_EXPAT_AUDIO });
  await sleep(7400);

  // Outro
  console.log("Action 8: Outro & Final Synced Showcase (2.5s)...");
  await page.evaluate(() => {
    window.setStatusBanner("Conversación completada • Transcripción bidireccional sincronizada");
    window.setSubtitles("expat", "PoquitoTalk • Comunicación fluida sin barreras de idioma en Bocas del Toro 🇵🇦");
  });
  await sleep(2500);

  // Stop recording
  console.log("Finishing CDP screencast stream...");
  await client.send("Page.stopScreencast");
  await browser.close();
  server.close();

  ffmpegStream.stdin.end();
  await new Promise((resolve) => ffmpegStream.on("close", resolve));
  console.log("Raw video stream recorded. Total frames: " + frameCount);

  // Multiplexing Audio with FFmpeg
  console.log("Multiplexing all synchronized audio tracks with FFmpeg adelay filter...");
  const validCues = audioCues.filter(c => fs.existsSync(c.audioPath));
  console.log("Audio cues to mux: " + validCues.length);

  const inputArgs = ["-y", "-i", TEMP_RAW_VIDEO];
  const filterParts = [];

  validCues.forEach((cue, idx) => {
    inputArgs.push("-i", cue.audioPath);
    const delayMs = Math.max(0, Math.round((cue.frameNumber / FPS) * 1000));
    const streamIdx = idx + 1;
    filterParts.push(`[${streamIdx}:a]adelay=${delayMs}|${delayMs}[a${idx}]`);
  });

  const mixInputs = validCues.map((_, idx) => `[a${idx}]`).join("");
  const filterComplex = `${filterParts.join(";")};${mixInputs}amix=inputs=${validCues.length}:normalize=0[aout]`;

  const finalFFmpegArgs = [
    ...inputArgs,
    "-filter_complex", `"${filterComplex}"`,
    "-map", "0:v",
    "-map", "[aout]",
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    OUTPUT_VIDEO,
  ];

  console.log("Executing FFmpeg muxing command...");
  execSync(`/opt/homebrew/bin/ffmpeg ${finalFFmpegArgs.join(" ")}`);

  if (fs.existsSync(TEMP_RAW_VIDEO)) {
    fs.unlinkSync(TEMP_RAW_VIDEO);
  }

  console.log("SUCCESS! Dual-screen Walkie-Talkie demonstration generated at: " + OUTPUT_VIDEO);
  const dur = execSync("/opt/homebrew/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"" + OUTPUT_VIDEO + "\"").toString().trim();
  console.log("Output video duration: " + dur + " seconds");
}

main().catch(err => {
  console.error("Error generating dual demo:", err);
  process.exit(1);
});
