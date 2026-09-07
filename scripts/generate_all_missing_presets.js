const fs = require('fs');
const path = require('path');

let envStr = '';
if (fs.existsSync('.env.local')) envStr += fs.readFileSync('.env.local', 'utf8') + '\n';
if (fs.existsSync('.env')) envStr += fs.readFileSync('.env', 'utf8') + '\n';
const match = envStr.match(/EXPO_PUBLIC_ELEVENLABS_API_KEY=(.*)/);
if (!match) {
  console.error('EXPO_PUBLIC_ELEVENLABS_API_KEY not found in env files.');
  process.exit(1);
}
const apiKey = match[1].trim();

const PERSONAS = {
  diego: {
    name: 'Diego',
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George
    stability: 0.45,
    similarityBoost: 0.85,
    style: 0.20,
  },
  sofia: {
    name: 'Sofia',
    voiceId: 'cgSgspJ2msm6clMCkdW9', // Jessica
    stability: 0.45,
    similarityBoost: 0.85,
    style: 0.20,
  },
};

const missingData = JSON.parse(fs.readFileSync('missing_phrases.json', 'utf8'));
const outputDir = path.join(__dirname, '..', 'assets', 'audio', 'presets');

async function generateAudio(text, personaKey, filename) {
  const persona = PERSONAS[personaKey];
  const filePath = path.join(outputDir, filename);

  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.size > 5000) {
      console.log(`[SKIP] Already exists: ${filename} (${stats.size} bytes)`);
      return true;
    }
  }

  console.log(`[GENERATE] ${persona.name} -> ${filename}...`);
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${persona.voiceId}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: persona.stability,
          similarity_boost: persona.similarityBoost,
          style: persona.style,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[ERROR] ${filename} failed with status ${res.status}: ${errText}`);
      return false;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`[SUCCESS] Saved ${filename} (${buffer.length} bytes)`);
    return true;
  } catch (err) {
    console.error(`[EXCEPTION] ${filename}:`, err);
    return false;
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Starting batch generation of missing preset audio...`);
  console.log(`Output directory: ${outputDir}`);

  // 1. Diego (Male)
  console.log(`\n=== GENERATING DIEGO (MALE) PRESETS (${missingData.diegoMissing.length}) ===`);
  for (let i = 0; i < missingData.diegoMissing.length; i++) {
    const item = missingData.diegoMissing[i];
    const filename = `diego_${item.resolvedId}.mp3`;
    const success = await generateAudio(item.output, 'diego', filename);
    if (success) {
      await sleep(600);
    }
  }

  // 2. Sofia (Female)
  console.log(`\n=== GENERATING SOFIA (FEMALE) PRESETS (${missingData.sofiaMissing.length}) ===`);
  for (let i = 0; i < missingData.sofiaMissing.length; i++) {
    const item = missingData.sofiaMissing[i];
    const filename = `sofia_${item.resolvedId}.mp3`;
    const success = await generateAudio(item.output, 'sofia', filename);
    if (success) {
      await sleep(600);
    }
  }

  console.log(`\nAll batch preset audio generation completed!`);
}

main();
