import { translateWithGemma } from './gemma';
import { generateGoogleGeminiAudio } from './googleVoice';

export interface WalkieMessage {
  id: string;
  roomId: string;
  sender: 'expat' | 'contractor';
  rawText?: string;
  cleanedEnglishText?: string;
  spanishText?: string;
  audioBase64?: string;
  timestamp: number;
}

export interface WalkieSession {
  roomId: string;
  clientName: string;
  shareUrl: string;
  status: 'active' | 'closed';
  createdAt: number;
  lastMessage?: WalkieMessage;
}

class WalkieTalkieService {
  private activeSession: WalkieSession | null = null;
  private pollInterval: NodeJS.Timeout | null = null;

  public createSession(clientName?: string): WalkieSession {
    const randomId = Math.random().toString(36).substring(2, 8);
    const roomId = `room_${randomId}`;
    const nameParam = clientName && clientName.trim().length > 0 ? `&name=${encodeURIComponent(clientName.trim())}` : '';
    const shareUrl = `https://poquitotalk.hero-apps.com/talk?room=${roomId}${nameParam}`;

    this.activeSession = {
      roomId,
      clientName: clientName || 'Cliente',
      shareUrl,
      status: 'active',
      createdAt: Date.now()
    };

    return this.activeSession;
  }

  public getActiveSession(): WalkieSession | null {
    return this.activeSession;
  }

  public closeSession(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.activeSession) {
      this.activeSession.status = 'closed';
      this.activeSession = null;
    }
  }

  /**
   * Process raw contractor Spanish input with accent normalization rules
   */
  public async processContractorAudio(roomId: string, rawAudioText: string): Promise<WalkieMessage> {
    // Run through Gemma translation & accent cleaner engine (es -> en)
    const cleanedEnglish = await translateWithGemma(rawAudioText, 'es', 'en');

    const msg: WalkieMessage = {
      id: `msg_${Date.now()}`,
      roomId,
      sender: 'contractor',
      rawText: rawAudioText,
      cleanedEnglishText: cleanedEnglish,
      spanishText: rawAudioText,
      timestamp: Date.now()
    };

    if (this.activeSession && this.activeSession.roomId === roomId) {
      this.activeSession.lastMessage = msg;
    }

    return msg;
  }
}

export const walkieTalkieService = new WalkieTalkieService();
