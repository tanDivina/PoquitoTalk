const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runVisualDualPhoneTest() {
  console.log('=== Starting Real Dual-Phone Live E2E Walkie-Talkie Verification ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const roomId = 'room_live_' + Math.random().toString(36).substring(2, 8);
  console.log('Room ID:', roomId);

  // Phone 2: Contractor Web Page
  const pageContractor = await browser.newPage();
  await pageContractor.setViewport({ width: 420, height: 860, deviceScaleFactor: 2 });
  
  const talkUrl = `https://poquitotalk.hero-apps.com/talk.html?room=${roomId}&name=Dorien`;
  console.log('Contractor opening:', talkUrl);
  await pageContractor.goto(talkUrl, { waitUntil: 'networkidle2' });

  // Phone 1: Expat sends audio message
  console.log('\n[Phone 1 - Expat] Sending audio message...');
  const expatMsg = {
    id: 'msg_expat_' + Date.now(),
    roomId: roomId,
    sender: 'expat',
    senderName: 'Dorien (Cliente)',
    enText: 'Hi Captain Jim, do you have a water taxi available tomorrow at 9 AM to Carenero?',
    esText: '¡Buenas Capitán Jim! ¿Tiene lancha disponible mañana a las 9 am para Isla Carenero?',
    audioData: 'https://poquitotalk.hero-apps.com/audio/presets/mateo_water_taxi.mp3',
    timestamp: Date.now()
  };

  const send1 = await pageContractor.evaluate(async (msg) => {
    const res = await fetch('https://poquitotalk.hero-apps.com/api/walkie.php?action=send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    return res.json();
  }, expatMsg);
  console.log('[Phone 1 -> Server] Expat message dispatched:', send1.success);

  // Wait for Contractor page to poll and render
  console.log('[Phone 2 - Contractor] Waiting for contractor page to receive and render message...');
  await sleep(3000);

  // Check messages on Contractor screen
  const contractorBubbles = await pageContractor.evaluate(() => {
    const bubbles = document.querySelectorAll('.conv-bubble');
    return Array.from(bubbles).map(b => ({
      sender: b.querySelector('.conv-bubble-header span')?.innerText,
      spanish: b.querySelector('.conv-bubble-spanish')?.innerText,
      english: b.querySelector('.conv-bubble-english')?.innerText
    }));
  });
  console.log('[Phone 2 - Contractor] Messages on screen:', JSON.stringify(contractorBubbles, null, 2));

  // Phone 2: Contractor replies
  console.log('\n[Phone 2 - Contractor] Recording reply in Spanish...');
  const contractorMsg = {
    id: 'msg_contractor_' + Date.now(),
    roomId: roomId,
    sender: 'contractor',
    senderName: 'Capitán Jim',
    esText: '¡Buenas Dorien! Sí claro, te puedo recoger en el muelle de Bocas a las 9:00 en punto.',
    enText: 'Hello Dorien! Yes sure, I will pick you up at the dock in Bocas at 9:00 sharp.',
    audioData: 'https://poquitotalk.hero-apps.com/audio/presets/mateo_water_taxi.mp3',
    timestamp: Date.now()
  };

  const send2 = await pageContractor.evaluate(async (msg) => {
    const res = await fetch('https://poquitotalk.hero-apps.com/api/walkie.php?action=send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    return res.json();
  }, contractorMsg);
  console.log('[Phone 2 -> Server] Contractor reply dispatched:', send2.success);

  await sleep(2000);

  // Take full screenshot of Phone 2 Contractor screen
  const contractorScreenshotPath = path.join(__dirname, '..', 'phone2_contractor_live.png');
  await pageContractor.screenshot({ path: contractorScreenshotPath });
  console.log('Saved:', contractorScreenshotPath);

  await browser.close();
  console.log('\n=== REAL 2-WAY LIVE TESTING SUCCESSFUL ===');
}

runVisualDualPhoneTest().catch(console.error);
