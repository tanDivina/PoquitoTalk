import { translateWithGemma } from './gemma';
import { generateGoogleGeminiAudio } from './googleVoice';

export interface WalkieMessage {
  id: string;
  roomId: string;
  sender: 'expat' | 'contractor';
  senderName?: string;
  rawText?: string;
  cleanedEnglishText?: string;
  spanishText?: string;
  esText?: string;
  enText?: string;
  audioBase64?: string;
  audioData?: string;
  timestamp: number;
  time?: string;
}

export interface WalkieSession {
  roomId: string;
  clientName: string;
  topic?: string;
  topicEs?: string;
  topicEn?: string;
  shareUrl: string;
  status: 'waiting' | 'active' | 'closed' | 'expired';
  createdAt: number;
  startedAt: number | null; // Sets when first voice message is transmitted
  expiresAt: number | null; // Set to startedAt + 15 mins
  turnCount: number;        // Max 15 turns per session
  lastActivityAt: number;   // For 5-min inactivity timeout
  lastMessage?: WalkieMessage;
  messages: WalkieMessage[];
}

const SESSION_MAX_DURATION_MS = 15 * 60 * 1000; // 15 minutes max active session
const SESSION_INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes silence auto-close
const SESSION_MAX_TURNS = 15; // 15 voice exchanges per session

class WalkieTalkieService {
  private activeSession: WalkieSession | null = null;
  private inactivityTimer: NodeJS.Timeout | null = null;

  public createSession(
    clientName?: string,
    topic?: string,
    topicEs?: string,
    topicEn?: string,
    initialAudioBase64?: string
  ): WalkieSession {
    const randomId = Math.random().toString(36).substring(2, 8);
    const roomId = `room_${randomId}`;
    const nameParam = clientName && clientName.trim().length > 0 && clientName.trim() !== 'Client' ? `&n=${encodeURIComponent(clientName.trim())}` : '';
    const cleanTopicEs = (topicEs || topic || '').trim();
    const cleanTopicEn = (topicEn || (cleanTopicEs !== topic ? topic : '') || '').trim();
    const shareUrl = `https://poquitotalk.hero-apps.com/talk?r=${roomId}${nameParam}`;

    const initialMessages: WalkieMessage[] = [];
    if (cleanTopicEs.length > 0) {
      initialMessages.push({
        id: `msg_init_${Date.now()}`,
        roomId,
        sender: 'expat',
        senderName: `${clientName || 'Client'}`,
        rawText: cleanTopicEn || cleanTopicEs,
        cleanedEnglishText: cleanTopicEn || cleanTopicEs,
        spanishText: cleanTopicEs,
        esText: cleanTopicEs,
        enText: cleanTopicEn || cleanTopicEs,
        audioData: initialAudioBase64,
        audioBase64: initialAudioBase64,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    this.activeSession = {
      roomId,
      clientName: clientName || 'Client',
      topic: cleanTopicEn || cleanTopicEs,
      topicEs: cleanTopicEs,
      topicEn: cleanTopicEn,
      shareUrl,
      status: 'waiting', // Waiting for first audio transmission
      createdAt: Date.now(),
      startedAt: null,
      expiresAt: null,
      turnCount: 0,
      lastActivityAt: Date.now(),
      messages: initialMessages,
      lastMessage: initialMessages[0]
    };

    // If initial topic/message exists, sync it to the server room immediately with audio
    if (cleanTopicEs.length > 0) {
      this.sendExpatMessage(
        roomId,
        cleanTopicEn || cleanTopicEs,
        cleanTopicEs,
        clientName || 'Client',
        initialAudioBase64
      );
    }

    return this.activeSession;
  }

  public getActiveSession(): WalkieSession | null {
    if (!this.activeSession) return null;
    this.checkSessionStatus();
    return this.activeSession;
  }

  /**
   * Called whenever either party transmits an audio message.
   * Starts the 15-min countdown on turn 1 and resets 5-min inactivity timer.
   */
  public recordTurn(): { active: boolean; remainingTurns: number; reason?: string } {
    if (!this.activeSession) {
      return { active: false, remainingTurns: 0, reason: 'no_session' };
    }

    const now = Date.now();

    // Start session timer on FIRST voice message
    if (this.activeSession.status === 'waiting' || !this.activeSession.startedAt) {
      this.activeSession.status = 'active';
      this.activeSession.startedAt = now;
      this.activeSession.expiresAt = now + SESSION_MAX_DURATION_MS;
    }

    // Check expiration
    if (this.activeSession.expiresAt && now > this.activeSession.expiresAt) {
      this.activeSession.status = 'expired';
      this.clearInactivityTimer();
      return { active: false, remainingTurns: 0, reason: 'time_limit_reached' };
    }

    // Increment turn count
    this.activeSession.turnCount += 1;
    this.activeSession.lastActivityAt = now;

    if (this.activeSession.turnCount > SESSION_MAX_TURNS) {
      this.activeSession.status = 'closed';
      this.clearInactivityTimer();
      return { active: false, remainingTurns: 0, reason: 'turn_limit_reached' };
    }

    // Reset 5-minute inactivity timer
    this.resetInactivityTimer();

    return {
      active: true,
      remainingTurns: Math.max(0, SESSION_MAX_TURNS - this.activeSession.turnCount)
    };
  }

  private checkSessionStatus(): void {
    if (!this.activeSession) return;
    const now = Date.now();

    // If active and past 15-minute expiration
    if (this.activeSession.expiresAt && now > this.activeSession.expiresAt) {
      this.activeSession.status = 'expired';
      this.clearInactivityTimer();
      return;
    }

    // If active and 5 minutes of silence elapsed
    if (this.activeSession.status === 'active' && (now - this.activeSession.lastActivityAt) > SESSION_INACTIVITY_TIMEOUT_MS) {
      this.activeSession.status = 'closed';
      this.clearInactivityTimer();
      return;
    }
  }

  private resetInactivityTimer(): void {
    this.clearInactivityTimer();
    this.inactivityTimer = setTimeout(() => {
      if (this.activeSession && this.activeSession.status === 'active') {
        this.activeSession.status = 'closed';
      }
    }, SESSION_INACTIVITY_TIMEOUT_MS);
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  public closeSession(): void {
    this.clearInactivityTimer();
    if (this.activeSession) {
      this.activeSession.status = 'closed';
      this.activeSession = null;
    }
  }

  public addMessage(msg: WalkieMessage): void {
    if (!this.activeSession) return;
    const exists = this.activeSession.messages.some(m => m.id === msg.id);
    if (!exists) {
      this.activeSession.messages.push(msg);
      this.activeSession.lastMessage = msg;
      this.recordTurn();
    }
  }

  /**
   * Transmits expat English/Spanish reply directly to Walkie Server API
   */
  public async sendExpatMessage(
    roomId: string,
    enText: string,
    esText: string,
    senderName: string = 'Client',
    audioData?: string
  ): Promise<WalkieMessage | null> {
    const timestamp = Date.now();
    const msgId = `msg_${timestamp}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.recordTurn();

    const newMsg: WalkieMessage = {
      id: msgId,
      roomId,
      sender: 'expat',
      senderName: senderName || 'Client',
      rawText: enText,
      cleanedEnglishText: enText,
      spanishText: esText,
      esText,
      enText,
      audioData: audioData || '',
      audioBase64: audioData || '',
      timestamp,
      time: timeStr
    };

    if (this.activeSession && this.activeSession.roomId === roomId) {
      this.addMessage(newMsg);
    }

    try {
      const payload = {
        id: msgId,
        roomId,
        sender: 'expat',
        senderName: senderName || 'Client',
        esText,
        enText,
        audioData: audioData || '',
        timestamp,
        time: timeStr
      };

      const res = await fetch('https://poquitotalk.hero-apps.com/api/walkie.php?action=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return newMsg;
      }
    } catch (err) {
      console.warn('Error sending expat walkie message to server:', err);
    }

    return newMsg;
  }

  /**
   * Process raw contractor Spanish input with accent normalization rules
   */
  public async processContractorAudio(roomId: string, rawAudioText: string): Promise<WalkieMessage> {
    // Record turn & verify session status
    this.recordTurn();

    // Run through Gemma translation & accent cleaner engine (es -> en)
    const cleanedEnglish = await translateWithGemma(rawAudioText, 'es', 'en');

    const msg: WalkieMessage = {
      id: `msg_${Date.now()}`,
      roomId,
      sender: 'contractor',
      rawText: rawAudioText,
      cleanedEnglishText: cleanedEnglish,
      spanishText: rawAudioText,
      esText: rawAudioText,
      enText: cleanedEnglish,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (this.activeSession && this.activeSession.roomId === roomId) {
      this.addMessage(msg);
    }

    return msg;
  }
}

export const walkieTalkieService = new WalkieTalkieService();
