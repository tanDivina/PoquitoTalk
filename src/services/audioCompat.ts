// Audio Compatibility Layer for Expo SDK 57
// Replaces deprecated expo-av (ExponentAV) with expo-audio (ExpoAudio)
// Providing backward-compatible Sound and Recording APIs.

import * as ExpoAudio from 'expo-audio';
import { Platform } from 'react-native';

export interface SoundStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  durationMillis?: number;
  positionMillis?: number;
  didJustFinish?: boolean;
  error?: string;
}

export class SoundInstance {
  private player: any = null;
  private statusCallback: ((status: SoundStatus) => void) | null = null;
  private listenerSub: any = null;
  private pollInterval: any = null;
  private _isPlaying: boolean = false;
  private _durationMillis: number = 0;
  private _positionMillis: number = 0;

  constructor(player: any) {
    this.player = player;
    this.setupListeners();
  }

  private setupListeners() {
    if (!this.player) return;

    try {
      if (typeof this.player.addListener === 'function') {
        this.listenerSub = this.player.addListener('playbackStatusUpdate', (status: any) => {
          this.handleStatusUpdate(status);
        });
      }
    } catch (e) {
      // ignore
    }

    // Safety polling for finish state if listener is not active
    this.pollInterval = setInterval(() => {
      try {
        if (this.player && this.player.currentStatus) {
          this.handleStatusUpdate(this.player.currentStatus);
        }
      } catch (e) {}
    }, 250);
  }

  private handleStatusUpdate(rawStatus: any) {
    const isPlaying = rawStatus?.playing ?? false;
    const currentTimeSec = rawStatus?.currentTime ?? (rawStatus?.positionMillis ? rawStatus.positionMillis / 1000 : 0);
    const durationSec = rawStatus?.duration ?? (rawStatus?.durationMillis ? rawStatus.durationMillis / 1000 : 0);
    
    this._isPlaying = isPlaying;
    this._positionMillis = Math.round(currentTimeSec * 1000);
    this._durationMillis = Math.round(durationSec * 1000);

    const didFinish =
      rawStatus?.playbackState === 'ended' ||
      rawStatus?.didJustFinish === true ||
      (durationSec > 0 && currentTimeSec >= durationSec - 0.1);

    if (this.statusCallback) {
      this.statusCallback({
        isLoaded: rawStatus?.isLoaded ?? true,
        isPlaying,
        positionMillis: this._positionMillis,
        durationMillis: this._durationMillis,
        didJustFinish: didFinish,
      });
    }

    if (didFinish && this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  async playAsync(): Promise<void> {
    try {
      if (this.player) {
        this.player.play();
        this._isPlaying = true;
      }
    } catch (err) {
      console.warn('SoundInstance.playAsync error:', err);
    }
  }

  async pauseAsync(): Promise<void> {
    try {
      if (this.player) {
        this.player.pause();
        this._isPlaying = false;
      }
    } catch (err) {
      console.warn('SoundInstance.pauseAsync error:', err);
    }
  }

  async stopAsync(): Promise<void> {
    try {
      if (this.player) {
        this.player.pause();
        this._isPlaying = false;
      }
    } catch (err) {
      console.warn('SoundInstance.stopAsync error:', err);
    }
  }

  async unloadAsync(): Promise<void> {
    try {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
      if (this.listenerSub && typeof this.listenerSub.remove === 'function') {
        this.listenerSub.remove();
        this.listenerSub = null;
      }
      if (this.player) {
        if (typeof this.player.remove === 'function') {
          this.player.remove();
        } else if (typeof this.player.pause === 'function') {
          this.player.pause();
        }
        this.player = null;
      }
      this.statusCallback = null;
      this._isPlaying = false;
    } catch (err) {
      console.warn('SoundInstance.unloadAsync error:', err);
    }
  }

  async setRateAsync(rate: number, _shouldCorrectPitch: boolean = false): Promise<void> {
    try {
      if (this.player && typeof this.player.setPlaybackRate === 'function') {
        this.player.setPlaybackRate(rate);
      }
    } catch (err) {
      console.warn('SoundInstance.setRateAsync error:', err);
    }
  }

  async setVolumeAsync(volume: number): Promise<void> {
    try {
      if (this.player && typeof this.player.setVolume === 'function') {
        this.player.setVolume(volume);
      } else if (this.player) {
        this.player.volume = volume;
      }
    } catch (err) {
      console.warn('SoundInstance.setVolumeAsync error:', err);
    }
  }

  async getStatusAsync(): Promise<SoundStatus> {
    return {
      isLoaded: !!this.player,
      isPlaying: this._isPlaying,
      durationMillis: this._durationMillis,
      positionMillis: this._positionMillis,
    };
  }

  setOnPlaybackStatusUpdate(callback: ((status: SoundStatus) => void) | null): void {
    this.statusCallback = callback;
  }
}

export class RecordingInstance {
  private recorder: any = null;
  private recordedUri: string | null = null;

  async prepareToRecordAsync(options?: any): Promise<void> {
    try {
      const AudioModule = ExpoAudio.AudioModule;
      const opts = options || ExpoAudio.RecordingPresets.HIGH_QUALITY;
      if (AudioModule && AudioModule.AudioRecorder) {
        this.recorder = new AudioModule.AudioRecorder(opts);
        if (typeof this.recorder.prepareToRecordAsync === 'function') {
          await this.recorder.prepareToRecordAsync(opts);
        }
      }
    } catch (err) {
      console.warn('RecordingInstance.prepareToRecordAsync error:', err);
    }
  }

  async startAsync(): Promise<void> {
    try {
      if (this.recorder && typeof this.recorder.record === 'function') {
        this.recorder.record();
      }
    } catch (err) {
      console.warn('RecordingInstance.startAsync error:', err);
    }
  }

  async stopAndUnloadAsync(): Promise<void> {
    try {
      if (this.recorder) {
        if (typeof this.recorder.stop === 'function') {
          await this.recorder.stop();
        }
        this.recordedUri = this.recorder.uri || null;
      }
    } catch (err) {
      console.warn('RecordingInstance.stopAndUnloadAsync error:', err);
    }
  }

  getURI(): string | null {
    return this.recordedUri || (this.recorder?.uri ?? null);
  }

  static async createAsync(options?: any): Promise<{ recording: RecordingInstance; status: any }> {
    const recording = new RecordingInstance();
    await recording.prepareToRecordAsync(options);
    await recording.startAsync();
    return { recording, status: { canRecord: true, isRecording: true } };
  }
}

export const Audio = {
  Sound: {
    async createAsync(
      source: { uri: string } | string | number,
      initialStatus?: { shouldPlay?: boolean; rate?: number }
    ): Promise<{ sound: SoundInstance; status: SoundStatus }> {
      try {
        const audioSource = typeof source === 'object' && source !== null && 'uri' in source ? source.uri : source;
        const player = ExpoAudio.createAudioPlayer(audioSource);
        const sound = new SoundInstance(player);

        if (initialStatus?.rate) {
          await sound.setRateAsync(initialStatus.rate);
        }

        if (initialStatus?.shouldPlay) {
          await sound.playAsync();
        }

        return {
          sound,
          status: {
            isLoaded: true,
            isPlaying: !!initialStatus?.shouldPlay,
          },
        };
      } catch (err) {
        console.warn('Audio.Sound.createAsync error:', err);
        throw err;
      }
    },
  },

  Recording: RecordingInstance,

  RecordingOptionsPresets: {
    HIGH_QUALITY: ExpoAudio.RecordingPresets.HIGH_QUALITY,
    LOW_QUALITY: ExpoAudio.RecordingPresets.LOW_QUALITY,
  },

  async setAudioModeAsync(options: {
    allowsRecordingIOS?: boolean;
    playsInSilentModeIOS?: boolean;
    staysActiveInBackground?: boolean;
    shouldDuckAndroid?: boolean;
    playThroughEarpieceAndroid?: boolean;
  }): Promise<void> {
    try {
      await ExpoAudio.setAudioModeAsync({
        playsInSilentMode: options.playsInSilentModeIOS ?? true,
        allowsRecording: options.allowsRecordingIOS ?? false,
        shouldPlayInBackground: options.staysActiveInBackground ?? false,
        shouldRouteThroughEarpiece: options.playThroughEarpieceAndroid ?? false,
      });
    } catch (err) {
      console.warn('Audio.setAudioModeAsync warning:', err);
    }
  },

  async requestPermissionsAsync() {
    try {
      return await ExpoAudio.requestRecordingPermissionsAsync();
    } catch (err) {
      console.warn('Audio.requestPermissionsAsync warning:', err);
      return { granted: false, status: 'denied' as const, canAskAgain: true, expires: 'never' as const };
    }
  },

  async getPermissionsAsync() {
    try {
      return await ExpoAudio.getRecordingPermissionsAsync();
    } catch (err) {
      console.warn('Audio.getPermissionsAsync warning:', err);
      return { granted: false, status: 'denied' as const, canAskAgain: true, expires: 'never' as const };
    }
  },
};

export default Audio;

export namespace Audio {
  export type Sound = SoundInstance;
  export type Recording = RecordingInstance;
}
