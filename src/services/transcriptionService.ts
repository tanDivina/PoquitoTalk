// Audio Recording & Voice Transcription Service
// Handles native microphone capture via expo-av and multi-tier speech-to-text engines

import { Audio } from "expo-av";
import { Platform } from "react-native";

export interface TranscriptionResult {
  text: string;
  source: "whisper_api" | "groq_whisper" | "backend_proxy" | "web_speech" | "fallback";
  confidence?: number;
}

let activeRecording: Audio.Recording | null = null;

/**
 * Request microphone permissions and start audio recording
 */
export async function startVoiceRecording(): Promise<Audio.Recording | null> {
  try {
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
  const match = /\\.(\\w+)$/.exec(filename);
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
          return { text: data.text.trim(), source: "elevenlabs_scribe" as any };
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
          return { text: data.text.trim(), source: "groq_whisper" };
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
          return { text: data.text.trim(), source: "whisper_api" };
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
        return { text: data.text.trim(), source: "backend_proxy" };
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
