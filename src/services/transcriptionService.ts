// Audio Recording & Voice Transcription Service
// Handles native microphone capture via expo-av and multi-tier speech-to-text engines

import { Audio } from "expo-av";
import { Platform } from "react-native";
import { stopAllAudioPlayback } from "./googleVoice";

export interface TranscriptionResult {
  text: string;
  source: "elevenlabs_scribe" | "whisper_api" | "groq_whisper" | "backend_proxy" | "web_speech" | "fallback";
  confidence?: number;
}

/**
 * Normalizes common speech-to-text misspellings, phonetic approximations,
 * and dialect variations of Bocas del Toro local geography and terms.
 * e.g. "Bustimentos" -> "Bastimentos"
 *      "Caranero" -> "Carenero"
 *      "Solarte" / "Zolarte" -> "Solarte"
 */
export function normalizeBocasTerminology(text: string): string {
  if (!text || typeof text !== "string") return "";

  let result = text;

  // 1. Bastimentos variations: Bastimentos, Bastimentus, Bustimentos, Bustimentus, Bastimento, Bustimento, Vastimentos, Vastimentus, Bostimentos, Bostimentus, Bastimendos, Bastiments, etc.
  // Handles pauses splitting the word (e.g. "Basti mentos", "Busti mentos", "Basty mentos", "Busti mentus")
  result = result.replace(/\b[bBvV][aAuUoO][sS][tT][iIeEyY]?[\s-]*[mM][eEaAiI][nN][tT][oOuUaAeE][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Bastimentos' : 'bastimentos');
  result = result.replace(/\b[bBvV][aAuUoO][sS][tT][iIeEyY]?[\s-]*[mM][eEaAiI][nN][dD][oOuUaAeE][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Bastimentos' : 'bastimentos');
  result = result.replace(/\b[bBvV][aAuUoO][sS][tT][iIeEyY]?[\s-]*[mM][eEaAiI][nN][tT][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Bastimentos' : 'bastimentos');
  result = result.replace(/\b[bBvV][aAuUoO][sS][tT][aA][\s-]*[mM][eE][nN][tT][oOuUaAeE][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Bastimentos' : 'bastimentos');

  // 2. Carenero variations: Carenero, Caranero, Caraneros, Careneros, Cariñero, Carinero, Carenaro, Carenera (including "Care nero")
  result = result.replace(/\b[cC][aA][rR][aAeEiI][\s-]*[nNñÑ][eEaAoO][rR][oOaA][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Carenero' : 'carenero');

  // 3. Solarte variations: Solarte, Solartes, Zolarte, Zolartes, Salarte, Solarti, Solartey (including "So larte")
  result = result.replace(/\b[sSzZ][oOaA][\s-]*[lL][aA][rR][tT][eEiIyY][sS]?\b/g, (m) => m[0] === m[0].toUpperCase() ? 'Solarte' : 'solarte');

  // 4. Old Bank variations
  result = result.replace(/\b[oO]ld?[\s-]?[bB][aAeE]n[gk]\b/gi, 'Old Bank');

  // 5. Red Frog variations
  result = result.replace(/\b[rR]ed[\s-]?[fF]ro[gk][s]?\b/gi, 'Red Frog');

  // 6. Bluff & Playa Bluff variations
  result = result.replace(/\b([pP]laya\s+)?[bB]luf{1,2}\b/gi, 'Playa Bluff');

  // 7. Bocas Town / Bocas City
  result = result.replace(/\b[bB]ocas\s+[tT][aAoO]wn\b/gi, 'Bocas Town');
  result = result.replace(/\b[bB]ocas\s+[cC]ity\b/gi, 'Bocas Town');

  // 8. Taxi 25 / Docks
  result = result.replace(/\b[tT]axi\s+(25|twenty[\s-]?five|veinticinco)\b/gi, 'Taxi 25');
  result = result.replace(/\b[mM]uelle\s+[tT]axi\s+(25|twenty[\s-]?five|veinticinco)\b/gi, 'Muelle Taxi 25');

  // 9. Local utilities & brands
  result = result.replace(/\b[nN]atur[gj]y\b/gi, 'Naturgy');
  result = result.replace(/\b[aA]gua[\s-]?[fF]iel\b/gi, 'Aguafiel');

  return result;
}

/**
 * Automatically detects and cleans up obvious speech repetitions, stutters, and loop hallucinations
 * e.g. "I, I need" -> "I need"
 *      "the the boat" -> "the boat"
 *      "Can you can you please" -> "Can you please"
 *      "I want to go I want to go to Bocas" -> "I want to go to Bocas"
 *      "Thank you. Thank you." -> "Thank you."
 */
export function cleanSpeechRepetitions(text: string): string {
  if (!text || typeof text !== "string") return "";

  let prev = "";
  let str = normalizeBocasTerminology(text.trim());

  // Strip stutter commas on immediate word repeats: "I, I" -> "I I"
  str = str.replace(/\b([a-zA-Z0-9'\u00C0-\u017F]+),\s+(\1)\b/gi, "$1 $2");

  // Sentence / clause repetitions separated by punctuation
  str = str.replace(/([^.?!,;\n]+[.?!,;\n]+)\s*\1+/gi, "$1");

  // Iteratively reduce consecutive repeated n-grams (from 5-word down to 1-word)
  let passes = 0;
  while (str !== prev && passes < 5) {
    prev = str;
    passes++;
    const tokens = str.split(/\s+/);

    for (let n = 5; n >= 1; n--) {
      let i = 0;
      const newTokens: string[] = [];
      while (i < tokens.length) {
        if (i + 2 * n <= tokens.length) {
          const chunk1 = tokens
            .slice(i, i + n)
            .map((w) => w.replace(/[.,?!;:"]/g, "").toLowerCase())
            .join(" ");
          const chunk2 = tokens
            .slice(i + n, i + 2 * n)
            .map((w) => w.replace(/[.,?!;:"]/g, "").toLowerCase())
            .join(" ");

          if (chunk1 && chunk1 === chunk2) {
            for (let k = 0; k < n; k++) {
              let tok = tokens[i + k].replace(/,$/, "");
              newTokens.push(tok);
            }
            i += 2 * n;
            continue;
          }
        }
        newTokens.push(tokens[i]);
        i++;
      }
      tokens.length = 0;
      tokens.push(...newTokens);
    }
    str = tokens.join(" ").replace(/,\s*,+/g, ",").replace(/\s+/g, " ").trim();
  }

  // Final pass of local phonetic normalization
  str = normalizeBocasTerminology(str);

  // Preserve initial capitalization
  if (text.length > 0 && text[0] === text[0].toUpperCase() && str.length > 0) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  }

  return str;
}

let activeRecording: Audio.Recording | null = null;

/**
 * Request microphone permissions and start audio recording
 */
export async function startVoiceRecording(): Promise<Audio.Recording | null> {
  try {
    // 0. Ensure all background speaker audio is stopped
    await stopAllAudioPlayback();

    // 1. Request microphone permissions
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted && perm.status !== "granted") {
      console.warn("Microphone permission not granted");
    }

    // 2. Configure audio session for recording
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      console.warn("Audio.setAudioModeAsync warning:", e);
    }

    // 3. Stop any existing recording
    if (activeRecording) {
      try {
        await activeRecording.stopAndUnloadAsync();
      } catch (e) {
        // ignore
      }
      activeRecording = null;
    }

    // 4. Create and start recording
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      activeRecording = recording;
      return recording;
    } catch (createErr) {
      console.warn("prepareToRecordAsync fallback to createAsync:", createErr);
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      activeRecording = recording;
      return recording;
    }
  } catch (error) {
    console.error("Error starting audio recording:", error);
    return null;
  }
}

/**
 * Stop active audio recording and return file URI
 */
export async function stopVoiceRecording(): Promise<string | null> {
  if (!activeRecording) {
    return null;
  }

  try {
    await activeRecording.stopAndUnloadAsync();
    const uri = activeRecording.getURI();
    activeRecording = null;

    // Reset audio session back to playback
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch (e) {
      // ignore
    }

    return uri;
  } catch (error) {
    console.error("Error stopping audio recording:", error);
    activeRecording = null;
    return null;
  }
}

const BOCAS_WHISPER_PROMPT = "Bocas del Toro, Isla Colón, Bastimentos, Carenero, Isla Solarte, Red Frog, Old Bank, Playa Bluff, Bocas Town, lancha, muelle Taxi 25, capitán, dólares, WhatsApp";

/**
 * Transcribe recorded audio file into text using Whisper or serverless backend
 */
export async function transcribeAudioFile(
  audioUri: string,
  lang: string = "en"
): Promise<TranscriptionResult> {
  if (!audioUri) {
    return {
      text: "",
      source: "fallback"
    };
  }

  const filename = audioUri.split("/").pop() || "voice_recording.m4a";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? "audio/" + match[1] : "audio/m4a";

  // 1. First Tier: ElevenLabs Scribe API (Multi-language Audio-to-Text)
  const elevenLabsKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
  if (elevenLabsKey) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === "ios" ? audioUri.replace("file://", "") : audioUri,
        name: filename,
        type: type,
      } as any);
      formData.append("model_id", "scribe_v1");

      const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.text && data.text.trim().length > 0) {
          const cleanedText = cleanSpeechRepetitions(data.text.trim());
          return { text: cleanedText, source: "elevenlabs_scribe" as any };
        }
      }
    } catch (e) {
      console.warn("ElevenLabs Scribe transcription failed:", e);
    }
  }

  // 2. Second Tier: Direct Groq Whisper (Ultra Fast ~250ms) if key available
  const groqKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (groqKey) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === "ios" ? audioUri.replace("file://", "") : audioUri,
        name: filename,
        type: type,
      } as any);
      formData.append("model", "whisper-large-v3");
      formData.append("language", lang === "es" ? "es" : "en");
      formData.append("prompt", BOCAS_WHISPER_PROMPT);
      formData.append("response_format", "json");

      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + groqKey,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.text && data.text.trim().length > 0) {
          const cleanedText = cleanSpeechRepetitions(data.text.trim());
          return { text: cleanedText, source: "groq_whisper" };
        }
      }
    } catch (e) {
      console.warn("Groq Whisper transcription failed:", e);
    }
  }

  // 2. Second Tier: OpenAI Whisper API if key available
  const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === "ios" ? audioUri.replace("file://", "") : audioUri,
        name: filename,
        type: type,
      } as any);
      formData.append("model", "whisper-1");
      formData.append("language", lang === "es" ? "es" : "en");
      formData.append("prompt", BOCAS_WHISPER_PROMPT);

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + openaiKey,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.text && data.text.trim().length > 0) {
          const cleanedText = cleanSpeechRepetitions(data.text.trim());
          return { text: cleanedText, source: "whisper_api" };
        }
      }
    } catch (e) {
      console.warn("OpenAI Whisper transcription failed:", e);
    }
  }

  // 3. Third Tier: LiteSpeed Backend Proxy Endpoint
  try {
    const formData = new FormData();
    formData.append("audio", {
      uri: Platform.OS === "ios" ? audioUri.replace("file://", "") : audioUri,
      name: filename,
      type: type,
    } as any);
    formData.append("lang", lang);

    const backendUrl = "https://poquitotalk.hero-apps.com/api/transcribe.php";
    const response = await fetch(backendUrl, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && data.text && data.text.trim().length > 0) {
        const cleanedText = cleanSpeechRepetitions(data.text.trim());
        return { text: cleanedText, source: "backend_proxy" };
      }
    }
  } catch (e) {
    console.warn("Backend proxy transcription failed:", e);
  }

  // 4. Return empty if no transcription engine succeeded
  return {
    text: "",
    source: "fallback",
  };
}
