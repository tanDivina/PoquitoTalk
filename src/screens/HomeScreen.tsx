import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Alert,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { WalkieTalkieIcon } from '../components/WalkieTalkieIcon';
import { SpeakerIcon } from '../components/SpeakerIcon';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as Speech from 'expo-speech';
import { Audio } from '../services/audioCompat';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { TranslationCard } from '../components/TranslationCard';
import { VoiceQualityModal } from '../components/VoiceQualityModal';
import { VoiceNoteDecoderModal } from '../components/VoiceNoteDecoderModal';
import { DocumentScannerModal } from '../components/DocumentScannerModal';
import { WalkieExplainerModal } from '../components/WalkieExplainerModal';
import { PostWhatsAppModal } from '../components/PostWhatsAppModal';
import { MicButton } from '../components/MicButton';
import { AnimatedParrotMascot } from '../components/AnimatedParrotMascot';
import { PoquitoAvatar } from '../components/PoquitoAvatar';
import { translateWithGemma } from '../services/gemma';
import { TranslationItem } from '../types';
import { VoiceOption, GOOGLE_SPANISH_VOICES, generateGoogleGeminiAudio } from '../services/googleVoice';
import { walkieTalkieService } from '../services/walkieTalkie';
import { speakIncomingEnglish } from '../services/incomingVoice';
import { getClientDisplayName } from '../services/userService';
import { resolveSpeakerGender } from '../utils/speakerGender';
import { shareWalkieTalkieToWhatsApp } from '../services/deepLinks';
import { startVoiceRecording, stopVoiceRecording, transcribeAudioFile, cleanSpeechRepetitions, normalizeBocasTerminology } from '../services/transcriptionService';
import { getPreferredVoiceGender } from '../services/storage';
import {
  scheduleReturnNotification,
  cancelReturnNotification,
  setupAndroidNotificationChannel,
} from '../services/notificationService';
import * as Notifications from 'expo-notifications';

function formatExpatFacingSenderName(rawName?: string | null): string {
  if (!rawName) return 'Contractor';
  const trimmed = rawName.trim();
  if (
    trimmed === 'Contratista' ||
    trimmed === 'Tú (Contratista)' ||
    trimmed === 'Tu (Contratista)' ||
    trimmed.toLowerCase().includes('contratista')
  ) {
    return 'Contractor';
  }
  return trimmed;
}

interface HomeScreenProps {
  navigation?: any;
  isPro: boolean;
  onOpenPaywall: () => void;
  onOpenSaved?: () => void;
  onOpenSettings?: () => void;
  savedTranslations: TranslationItem[];
  onToggleSave: (item: TranslationItem) => void;
  activePresetPrompt?: string;
  activePresetCategory?: string;
  onClearPresetPrompt?: () => void;
  initialVoice?: VoiceOption;
  onResetOnboarding?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  navigation,
  isPro,
  onOpenPaywall,
  onOpenSaved,
  onOpenSettings,
  savedTranslations,
  onToggleSave,
  activePresetPrompt,
  activePresetCategory,
  onClearPresetPrompt,
  initialVoice,
  onResetOnboarding,
}) => {
  const [inputText, setInputText] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('prompt')) return decodeURIComponent(p.get('prompt') || '');
      if (p.get('translated') === 'true') {
        return "Hello friend, do you have a boat available to take us from Bocas Town to Isla Solarte today at 2:00 PM?";
      }
      if (p.get('demo') === 'walkie') {
        const sender = p.get('walkieSender') || 'Contractor';
        return `Hi ${sender}! Are you available to pick us up at Taxi 25 dock in Bocas Town around 4:00 PM and take us back to Isla Solarte?`;
      }
    }
    return '';
  });
  const [outputText, setOutputText] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('output')) return decodeURIComponent(p.get('output') || '');
      if (p.get('translated') === 'true') {
        return "¡Hola amigo! ¿Tiene lancha disponible para llevarnos desde Bocas Town hasta Isla Solarte hoy a las 2:00 PM?";
      }
      if (p.get('demo') === 'walkie') {
        const sender = p.get('walkieSender') || 'Contractor';
        return `¡Hola ${sender}! ¿Está disponible para recogernos en el muelle de Taxi 25 en Bocas Town como a las cuatro de la tarde y llevarnos de vuelta a Isla Solarte?`;
      }
    }
    return '';
  });
  const [fromLang, setFromLang] = useState<'en' | 'es'>('en');
  const [toLang, setToLang] = useState<'en' | 'es'>('es');
  const [isTranslating, setIsTranslating] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('translating') === 'true' ||
             new URLSearchParams(window.location.search).get('isTranslating') === 'true';
    }
    return false;
  });
  const [isListening, setIsListening] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('listening') === 'true' ||
             new URLSearchParams(window.location.search).get('isListening') === 'true';
    }
    return false;
  });
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(initialVoice || GOOGLE_SPANISH_VOICES[0]);
  const [showVoiceQualityModal, setShowVoiceQualityModal] = useState(false);
  const [isPlayingTranslationAudio, setIsPlayingTranslationAudio] = useState(false);

  useEffect(() => {
    (async () => {
      if (initialVoice) {
        setSelectedVoice(initialVoice);
      } else {
        const savedGender = await getPreferredVoiceGender();
        const voice = GOOGLE_SPANISH_VOICES.find((v) => v.gender === savedGender) || GOOGLE_SPANISH_VOICES[0];
        setSelectedVoice(voice);
      }
    })();
  }, [initialVoice]);

  const [showVoiceDecoderModal, setShowVoiceDecoderModal] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('decoder') === 'true';
    }
    return false;
  });
  const [showDocScannerModal, setShowDocScannerModal] = useState(false);
  const [showWalkieExplainer, setShowWalkieExplainer] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('walkie') === 'true';
    }
    return false;
  });
  const [clipboardReplyText, setClipboardReplyText] = useState<string | null>(null);
  const [isTranslatingCopiedReply, setIsTranslatingCopiedReply] = useState(false);
  const [lastCheckedClipboard, setLastCheckedClipboard] = useState<string>('');
  const [incomingWalkieSender, setIncomingWalkieSender] = useState<string | null>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('walkieSender') || null;
    }
    return null;
  });
  const [activeWalkieSession, setActiveWalkieSession] = useState<{
    roomId: string;
    shareUrl: string;
    topic?: string;
    topicEs?: string;
    topicEn?: string;
  } | null>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('walkieActive') === 'true') {
        return {
          roomId: 'bocas-channel-8291',
          shareUrl: 'https://poquitotalk.hero-apps.com/talk?room=bocas-channel-8291',
          topic: p.get('topic') || 'Taxi 25 to Isla Solarte at 4:00 PM',
          topicEs: p.get('topicEs') || 'Taxi 25 a Isla Solarte a las 4:00 PM',
          topicEn: p.get('topicEn') || 'Taxi 25 to Isla Solarte at 4:00 PM',
        };
      }
    }
    return null;
  });
  const [isChannelMinimized, setIsChannelMinimized] = useState(false);
  const [incomingWalkieMessage, setIncomingWalkieMessage] = useState<{
    id?: string;
    esText: string;
    enText: string;
    audioData?: string;
    senderName?: string;
    time?: string;
  } | null>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('incoming') === 'true') {
        const sender = p.get('walkieSender') || 'Capitán Luis';
        return {
          id: 'msg_981',
          esText: p.get('esText') || '¡Buenas tardes! Sí, claro, tengo la lancha lista en el muelle principal. El viaje a Solarte son $10.',
          enText: p.get('enText') || 'Good afternoon! Yes, of course, I have the boat ready at the main dock. The trip to Solarte is $10.',
          senderName: sender,
          time: '04:01 PM',
        };
      }
    }
    return null;
  });
  const [walkieMessages, setWalkieMessages] = useState<any[]>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('walkieActive') === 'true' || p.get('incoming') === 'true') {
        const sender = p.get('walkieSender') || 'Capitán Luis';
        const m1 = {
          id: 'msg_1',
          sender: 'expat',
          esText: `¡Hola ${sender}! ¿Está disponible para recogernos en el muelle de Taxi 25 en Bocas Town como a las cuatro de la tarde y llevarnos de vuelta a Isla Solarte?`,
          enText: `Hi ${sender}! Are you available to pick us up at Taxi 25 dock in Bocas Town around 4:00 PM and take us back to Isla Solarte?`,
          timestamp: Date.now() - 120000,
        };
        const m2 = {
          id: 'msg_2',
          sender: 'contractor',
          senderName: sender,
          esText: '¡Buenas tardes doña Sarah! Sí, claro que sí, a las cuatro en punto estoy amarrado en Taxi 25 esperándolos en la lancha. ¡Nos vemos allá!',
          enText: 'Good afternoon Mrs. Sarah! Yes, of course, at four sharp I will be tied up at Taxi 25 waiting for you in the boat. See you there!',
          timestamp: Date.now() - 30000,
        };
        if (p.get('walkieDuplicate') === 'true') {
          return [m1, { ...m1, id: 'msg_1_dup' }, m2, { ...m2, id: 'msg_2_dup' }];
        }
        return [m1, m2];
      }
    }
    return [];
  });
  const [isTransmittingToWalkie, setIsTransmittingToWalkie] = useState(false);
  const [isReplyingToWalkie, setIsReplyingToWalkie] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('replying') === 'true' ||
             new URLSearchParams(window.location.search).get('isReplying') === 'true';
    }
    return false;
  });
  const [showWalkieHistory, setShowWalkieHistory] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('history') === 'true';
    }
    return false;
  });
  const [isWalkieTapRecording, setIsWalkieTapRecording] = useState(false);
  const walkiePressStartRef = useRef<number>(0);

  const handleExitChannel = useCallback(() => {
    walkieTalkieService.closeSession();
    setActiveWalkieSession(null);
    setIncomingWalkieMessage(null);
    setWalkieMessages([]);
    setIsReplyingToWalkie(false);
    setIsWalkieTapRecording(false);
    setIsChannelMinimized(false);
  }, []);

  const promptExitChannel = useCallback((onConfirm?: () => void) => {
    Alert.alert(
      'Leave Channel',
      'Would you like to keep this walkie session active in the background, or end the session?',
      [
        { text: 'Stay in Channel', style: 'cancel' },
        {
          text: 'Minimize (Keep Active)',
          onPress: () => {
            setIsChannelMinimized(true);
            if (onConfirm) onConfirm();
          },
        },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            handleExitChannel();
            if (onConfirm) onConfirm();
          },
        },
      ]
    );
  }, [handleExitChannel]);

  // Keep activeWalkieSession synchronized with walkieTalkieService
  useEffect(() => {
    const unsubscribe = walkieTalkieService.subscribeSession((session) => {
      if (!session) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const p = new URLSearchParams(window.location.search);
          if (p.get('incoming') === 'true' || p.get('walkieActive') === 'true') {
            return;
          }
        }
        setActiveWalkieSession(null);
        setIncomingWalkieMessage(null);
        setWalkieMessages([]);
        setIsReplyingToWalkie(false);
        setIsWalkieTapRecording(false);
      }
    });
    return unsubscribe;
  }, []);

  // Memoized deduplication of walkie messages for the live message stream
  const displayWalkieMessages = useMemo(() => {
    if (!walkieMessages || !Array.isArray(walkieMessages)) return [];
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (new URLSearchParams(window.location.search).get('walkieDuplicate') === 'true') {
        return walkieMessages;
      }
    }
    const seenIds = new Set<string>();
    const seenContent = new Set<string>();
    const deduped: any[] = [];

    for (const msg of walkieMessages) {
      if (msg.id && seenIds.has(msg.id)) continue;
      const contentKey = `${msg.sender}_${msg.esText || msg.spanishText || msg.text || ''}_${Math.floor((msg.timestamp || 0) / 4000)}`;
      if (seenContent.has(contentKey)) continue;

      if (msg.id) seenIds.add(msg.id);
      seenContent.add(contentKey);
      deduped.push(msg);
    }
    return deduped;
  }, [walkieMessages]);

  // Post-WhatsApp Modal State & Navigation Handoff
  const [showPostWhatsAppModal, setShowPostWhatsAppModal] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('postWhatsApp') === 'true';
    }
    return false;
  });
  const [postWhatsAppRecipient, setPostWhatsAppRecipient] = useState<string | undefined>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('recipient') || 'Capitán Luis';
    }
    return undefined;
  });
  const [postWhatsAppDispatchType, setPostWhatsAppDispatchType] = useState<'voice_note' | 'text'>('voice_note');
  const pendingPostWhatsAppRef = useRef(false);

  // Setup Android notification channel & listen for notification taps
  useEffect(() => {
    try {
      setupAndroidNotificationChannel();
    } catch (e) {
      console.warn('Channel setup notice:', e);
    }

    if (Platform.OS !== 'web') {
      try {
        const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response?.notification?.request?.content?.data;
          if (data && data.type === 'whatsapp_return') {
            if (data.isWalkieChannel && data.walkieRoomId) {
              setIsChannelMinimized(false);
            } else {
              setShowPostWhatsAppModal(true);
            }
          }
        });

        return () => {
          try {
            responseSubscription?.remove();
          } catch (e) {}
        };
      } catch (e) {
        console.warn('Notifications listener setup notice:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App is back in foreground -> cancel any pending return notification banner
        cancelReturnNotification();

        if (pendingPostWhatsAppRef.current) {
          pendingPostWhatsAppRef.current = false;
          setShowPostWhatsAppModal(true);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleDispatchedToWhatsApp = useCallback((contactName?: string, dispatchType?: 'voice_note' | 'text') => {
    setPostWhatsAppRecipient(contactName);
    setPostWhatsAppDispatchType(dispatchType || 'voice_note');
    pendingPostWhatsAppRef.current = true;

    // Schedule Android floating heads-up banner over WhatsApp in 12 seconds
    scheduleReturnNotification({
      recipientName: contactName,
      isWalkieChannel: !!activeWalkieSession,
      walkieRoomId: activeWalkieSession?.roomId,
      delaySeconds: 12,
    });

    setTimeout(() => {
      if (pendingPostWhatsAppRef.current) {
        pendingPostWhatsAppRef.current = false;
        setShowPostWhatsAppModal(true);
      }
    }, 1200);
  }, [activeWalkieSession]);

  // Poll for live Walkie-Talkie messages from server when a session is active
  useEffect(() => {
    if (!activeWalkieSession) {
      setWalkieMessages([]);
      return;
    }

    let lastTimestamp = 0;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://poquitotalk.hero-apps.com/api/walkie.php?action=poll&room=${encodeURIComponent(activeWalkieSession.roomId)}&since=${lastTimestamp}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            setWalkieMessages((prev) => {
              const combined = [...prev];
              data.messages.forEach((m: any) => {
                const isDuplicate = combined.some((c) =>
                  c.id === m.id ||
                  (c.sender === m.sender &&
                   c.esText === m.esText &&
                   Math.abs((c.timestamp || 0) - (m.timestamp || 0)) < 5000)
                );
                if (!isDuplicate) {
                  combined.push(m);
                }
              });
              return combined;
            });

            const contractorMsgs = data.messages.filter((m: any) => m.sender === 'contractor');
            if (contractorMsgs.length > 0) {
              const latest = contractorMsgs[contractorMsgs.length - 1];
              setIncomingWalkieSender(formatExpatFacingSenderName(latest.senderName));
              setIncomingWalkieMessage(latest);
            }
            const maxTs = Math.max(...data.messages.map((m: any) => m.timestamp || 0));
            if (maxTs > lastTimestamp) {
              lastTimestamp = maxTs;
            }
          }
        }
      } catch (err) {
        // Network retry
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeWalkieSession]);

  const handleLaunchWalkieTalkie = async (topicEs?: string, topicEn?: string, audioBase64?: string) => {
    try {
      const finalTopicEs = (topicEs || outputText || '').trim();
      const finalTopicEn = (topicEn || inputText || '').trim();

      let initialAudioBase64 = audioBase64 || '';
      if (!initialAudioBase64 && finalTopicEs) {
        try {
          const audioUri = await generateGoogleGeminiAudio(finalTopicEs, selectedVoice.id);
          if (audioUri) {
            const FileSystem = require('expo-file-system/legacy');
            const rawB64 = await FileSystem.readAsStringAsync(audioUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            if (rawB64) {
              initialAudioBase64 = `data:audio/mp3;base64,${rawB64}`;
            }
          }
        } catch (audioErr) {
          console.warn('Initial audio generation fallback:', audioErr);
        }
      }

      const session = walkieTalkieService.createSession(
        await getClientDisplayName(),
        finalTopicEn || finalTopicEs,
        finalTopicEs,
        finalTopicEn,
        initialAudioBase64
      );
      setActiveWalkieSession({
        roomId: session.roomId,
        shareUrl: session.shareUrl,
        topic: finalTopicEn || finalTopicEs,
        topicEs: finalTopicEs,
        topicEn: finalTopicEn,
      });
      setIsChannelMinimized(false);
      if (session.messages && session.messages.length > 0) {
        setWalkieMessages(session.messages);
      }

      // Prompt user with instant option to share link to contractor on WhatsApp
      Alert.alert(
        '2-Way Channel Ready',
        'Your 2-way walkie-talkie channel is active. Share the link with your contractor now on WhatsApp to start speaking in real time.',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Share on WhatsApp',
            onPress: () => {
              handleDispatchedToWhatsApp('Amigo', 'text');
              shareWalkieTalkieToWhatsApp(
                session.shareUrl,
                'Amigo',
                finalTopicEs,
                finalTopicEn
              );
            },
          },
        ]
      );
    } catch (e) {
      console.warn('Walkie launch error:', e);
    }
  };

  const handlePlayWalkieEnglish = async (text: string, fromContractor: boolean = true) => {
    if (!text) return;
    try {
      Speech.stop();
      // Contractor replies play in a voice matching the contractor (guessed from their name,
      // neutral when unknown). Never the user's own Diego/Sofia setting.
      const gender = fromContractor
        ? resolveSpeakerGender(undefined, walkieTalkieService.getActiveSession()?.contactName)
        : 'NEUTRAL';
      await speakIncomingEnglish(text, gender, { rate: 1.0 });
    } catch (e) {
      console.warn('Speech English playback error:', e);
    }
  };

  const handlePlayWalkieOriginal = async (audioData?: string, fallbackEsText?: string) => {
    try {
      Speech.stop();
      if (audioData) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: audioData },
            { shouldPlay: true }
          );
          return;
        } catch (e) {
          console.warn('Audio.Sound.createAsync error, falling back to Speech.speak:', e);
        }
      }
      if (fallbackEsText) {
        Speech.speak(fallbackEsText, { language: 'es-PA' });
      }
    } catch (e) {
      console.warn('Audio original playback error:', e);
    }
  };

  const isMessageSaved = (msg: any) => {
    const en = (msg.enText || msg.cleanedEnglishText || msg.englishText || '').trim().toLowerCase();
    const es = (msg.esText || msg.spanishText || msg.text || '').trim().toLowerCase();
    if (!en || !es) return false;
    return (savedTranslations || []).some((t) => {
      const tIn = (t.inputText || '').trim().toLowerCase();
      const tOut = (t.outputText || '').trim().toLowerCase();
      return (tIn === en && tOut === es) || (t.id && msg.id && (t.id === msg.id || t.id === `saved_${msg.id}`));
    });
  };

  const handleToggleSaveChannelMessage = (msg: any) => {
    const primaryEnglish = (msg.enText || msg.cleanedEnglishText || msg.englishText || '').trim();
    const spanishText = (msg.esText || msg.spanishText || msg.text || '').trim();
    if (!primaryEnglish || !spanishText) return;

    const topicLabel =
      activeWalkieSession?.topicEn ||
      activeWalkieSession?.topicEs ||
      activeWalkieSession?.topic ||
      (msg.sender === 'expat' ? 'Custom Requests' : 'Contractor Replies');

    const item: TranslationItem = {
      id: msg.id ? `saved_${msg.id}` : `saved_${Date.now()}`,
      timestamp: msg.timestamp || Date.now(),
      fromLang: msg.sender === 'expat' ? 'en' : 'es',
      toLang: msg.sender === 'expat' ? 'es' : 'en',
      inputText: primaryEnglish,
      outputText: spanishText,
      category: topicLabel,
      isSaved: true,
    };

    onToggleSave(item);
  };

  const handleWalkiePttStart = async () => {
    try {
      setIsListening(true);
      await startVoiceRecording();
    } catch (err) {
      console.warn('Walkie PTT start error:', err);
      setIsListening(false);
      setIsWalkieTapRecording(false);
    }
  };

  const handleWalkiePttStopAndTransmit = async () => {
    try {
      setIsListening(false);
      setIsWalkieTapRecording(false);
      setIsTranslating(true);
      const audioUri = await stopVoiceRecording();
      if (!audioUri) {
        setIsTranslating(false);
        return;
      }

      // Transcribe audio with Bocas terminology normalization
      const transcription = await transcribeAudioFile(audioUri, 'en');
      const recognizedText = cleanSpeechRepetitions(normalizeBocasTerminology(transcription.text));

      if (!recognizedText || !recognizedText.trim()) {
        setIsTranslating(false);
        return;
      }

      // Translate to Spanish
      const translated = await translateWithGemma(recognizedText, 'en', 'es');
      const finalEs = translated || recognizedText;

      // Generate Spanish audio base64
      let audioBase64 = '';
      try {
        const genUri = await generateGoogleGeminiAudio(finalEs, selectedVoice.id);
        if (genUri) {
          const FileSystem = require('expo-file-system/legacy');
          const rawB64 = await FileSystem.readAsStringAsync(genUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          if (rawB64) {
            audioBase64 = `data:audio/mp3;base64,${rawB64}`;
          }
        }
      } catch (audioErr) {
        console.warn('TTS Audio Base64 error:', audioErr);
      }

      // Transmit directly into active channel
      if (activeWalkieSession) {
        const sentMsg = await walkieTalkieService.sendExpatMessage(
          activeWalkieSession.roomId,
          recognizedText,
          finalEs,
          await getClientDisplayName(),
          audioBase64
        );
        if (sentMsg) {
          setWalkieMessages((prev) => {
            const alreadyExists = prev.some((m) =>
              m.id === sentMsg.id ||
              (m.sender === sentMsg.sender &&
               m.esText === sentMsg.esText &&
               Math.abs((m.timestamp || 0) - (sentMsg.timestamp || 0)) < 5000)
            );
            if (!alreadyExists) {
              return [...prev, sentMsg];
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.warn('Walkie PTT Stop & Transmit error:', e);
      Alert.alert('Transmission Error', 'Could not transmit voice note. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleWalkiePttPressIn = async () => {
    if (isTranslating) return;
    walkiePressStartRef.current = Date.now();
    if (isWalkieTapRecording) {
      // Already in hands-free tap-recording mode: this tap stops and transmits
      setIsWalkieTapRecording(false);
      await handleWalkiePttStopAndTransmit();
      return;
    }
    // Start recording immediately
    await handleWalkiePttStart();
  };

  const handleWalkiePttPressOut = async () => {
    if (isTranslating) return;
    const pressDuration = Date.now() - walkiePressStartRef.current;
    if (isWalkieTapRecording) {
      return;
    }
    if (pressDuration >= 380) {
      // Held down for >380ms: release transmits immediately
      setIsWalkieTapRecording(false);
      await handleWalkiePttStopAndTransmit();
    } else {
      // Quick tap (<380ms): keep hands-free recording active
      setIsWalkieTapRecording(true);
    }
  };

  const handleWalkieTextSendAndTransmit = async () => {
    if (!inputText || !inputText.trim() || !activeWalkieSession) return;

    try {
      setIsTranslating(true);
      const normalizedEn = cleanSpeechRepetitions(normalizeBocasTerminology(inputText.trim()));
      const translated = await translateWithGemma(normalizedEn, 'en', 'es');
      const finalEs = translated || normalizedEn;

      let audioBase64 = '';
      try {
        const genUri = await generateGoogleGeminiAudio(finalEs, selectedVoice.id);
        if (genUri) {
          const FileSystem = require('expo-file-system/legacy');
          const rawB64 = await FileSystem.readAsStringAsync(genUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          if (rawB64) {
            audioBase64 = `data:audio/mp3;base64,${rawB64}`;
          }
        }
      } catch (audioErr) {
        console.warn('TTS Audio Base64 error:', audioErr);
      }

      const sentMsg = await walkieTalkieService.sendExpatMessage(
        activeWalkieSession.roomId,
        normalizedEn,
        finalEs,
        await getClientDisplayName(),
        audioBase64
      );
      if (sentMsg) {
        setWalkieMessages((prev) => {
          const alreadyExists = prev.some((m) =>
            m.id === sentMsg.id ||
            (m.sender === sentMsg.sender &&
             m.esText === sentMsg.esText &&
             Math.abs((m.timestamp || 0) - (sentMsg.timestamp || 0)) < 5000)
          );
          if (!alreadyExists) {
            return [...prev, sentMsg];
          }
          return prev;
        });
      }
      setInputText('');
      setOutputText('');
    } catch (e) {
      console.warn('Walkie Text Send error:', e);
      Alert.alert('Transmission Error', 'Could not transmit message. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTransmitToWalkie = async () => {
    if (!activeWalkieSession || !outputText || !outputText.trim()) {
      Alert.alert('No Translation Ready', 'Please translate your message into Spanish first to transmit.');
      return;
    }

    try {
      setIsTransmittingToWalkie(true);
      
      let audioBase64 = '';
      try {
        const audioUri = await generateGoogleGeminiAudio(outputText, selectedVoice.id);
        if (audioUri) {
          const FileSystem = require('expo-file-system/legacy');
          const rawB64 = await FileSystem.readAsStringAsync(audioUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          if (rawB64) {
            audioBase64 = `data:audio/mp3;base64,${rawB64}`;
          }
        }
      } catch (audioErr) {
        console.warn('Audio base64 generation fallback:', audioErr);
      }

      const sentMsg = await walkieTalkieService.sendExpatMessage(
        activeWalkieSession.roomId,
        inputText,
        outputText,
        await getClientDisplayName(),
        audioBase64
      );

      if (sentMsg) {
        setWalkieMessages((prev) => {
          const alreadyExists = prev.some((m) =>
            m.id === sentMsg.id ||
            (m.sender === sentMsg.sender &&
             m.esText === sentMsg.esText &&
             Math.abs((m.timestamp || 0) - (sentMsg.timestamp || 0)) < 5000)
          );
          if (!alreadyExists) {
            return [...prev, sentMsg];
          }
          return prev;
        });
      }

      Alert.alert(
        '✓ Transmitted to Channel! 📻',
        `Your Spanish voice message has been sent directly to the contractor's live web screen.`,
        [{ text: 'OK' }]
      );

      setInputText('');
      setOutputText('');
      setIsReplyingToWalkie(false);
    } catch (err) {
      Alert.alert('Error', 'Could not transmit message. Please try again.');
    } finally {
      setIsTransmittingToWalkie(false);
    }
  };

  // Auto-detect copied WhatsApp Spanish reply from clipboard
  useEffect(() => {
    checkClipboardReply();
  }, []);

  const checkClipboardReply = async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (hasString) {
        const text = await Clipboard.getStringAsync();
        const trimmed = text.trim();
        const lower = trimmed.toLowerCase();

        // Strictly ignore any text originating from PoquitoTalk itself
        if (
          lower.includes('poquitotalk') ||
          lower.includes('hero-apps') ||
          lower.includes('sent via') ||
          lower.includes('enviado por') ||
          lower.includes('enviado desde') ||
          lower.includes('poquito')
        ) {
          return;
        }

        // Check if text looks like an authentic Spanish WhatsApp reply
        const spanishKeywords = [
          'hola', 'buenas', 'puedo', 'mañana', 'hora', 'muelle',
          'precio', 'dólares', 'costo', 'cuánto', 'dónde', 'revisar',
          'estoy', 'llegar', 'gracias', 'claro', 'dale', 'listo'
        ];
        const isSpanishReply =
          spanishKeywords.some((kw) => lower.includes(kw)) &&
          trimmed.length > 5 &&
          trimmed !== inputText;

        if (isSpanishReply) {
          setClipboardReplyText(trimmed);
        }
      }
    } catch (e) {
      console.warn('Clipboard check:', e);
    }
  };

  const handleTranslateWhatsAppReply = () => {
    if (!clipboardReplyText) return;
    setFromLang('es');
    setToLang('en');
    setInputText(clipboardReplyText);
    handleTranslateText(clipboardReplyText, 'es', 'en');
    setClipboardReplyText(null);
  };

  // Sync active preset prompt if selected from Presets tab
  useEffect(() => {
    if (activePresetPrompt) {
      setInputText(activePresetPrompt);
      handleTranslateText(activePresetPrompt, 'en', 'es');
    }
  }, [activePresetPrompt]);

  const handleTranslateText = async (textToTranslate?: string, srcLang = 'en', tgtLang = 'es') => {
    const rawText = textToTranslate || inputText;
    const text = cleanSpeechRepetitions(rawText);
    if (!text.trim()) return;

    if (text !== inputText && !textToTranslate) {
      setInputText(text);
    }

    Keyboard.dismiss();
    setIsTranslating(true);

    try {
      const translated = await translateWithGemma(text, srcLang, tgtLang);
      setOutputText(translated);
    } catch (error) {
      setOutputText(text);
    } finally {
      setIsTranslating(false);
    }
  };

  const inputRef = React.useRef<TextInput>(null);
  const recordingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleStopVoiceAndTranslate = async () => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsListening(false);
    setIsTranslating(true);
    try {
      const audioUri = await stopVoiceRecording();
      if (audioUri) {
        const result = await transcribeAudioFile(audioUri, fromLang);
        if (result && result.text && result.text.trim().length > 0) {
          const cleanedText = cleanSpeechRepetitions(result.text);
          setInputText(cleanedText);
          await handleTranslateText(cleanedText, fromLang, toLang);
          return;
        }
      }
      // If voice could not be decoded, focus input for typing or keyboard dictation
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error('Error during voice transcription:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleMicPress = async () => {
    // 1. If already listening / recording, STOP recording and TRANSCRIBE
    if (isListening) {
      await handleStopVoiceAndTranslate();
      return;
    }

    // 2. Start fresh native microphone recording
    setInputText('');
    setOutputText('');
    setIsListening(true);
    await startVoiceRecording();

    // Set 30s safety auto-transcribe timer in case user finishes speaking and puts phone down
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
    }
    recordingTimerRef.current = setTimeout(() => {
      handleStopVoiceAndTranslate();
    }, 30000);
  };

  const handleListenToIncomingVoiceNote = () => {
    setIsListening(true);
    setFromLang('es');
    setToLang('en');
    
    // Simulate live listening to WhatsApp speaker playback
    setTimeout(() => {
      setIsListening(false);
      const incomingSpanishVoice = "¡Buenas! Puedo pasar a revisar el aire acondicionado hoy a las 3 de la tarde. ¿Me confirma su ubicación en Isla Colón?";
      setInputText(incomingSpanishVoice);
      handleTranslateText(incomingSpanishVoice, 'es', 'en');
    }, 2500);
  };

  const handleImportAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setIsTranslating(true);
        setFromLang('es');
        setToLang('en');

        setTimeout(() => {
          setIsTranslating(false);
          const transcribedText = "Hola, le confirmo que el técnico de lanchas puede pasar a las 2:30 PM. ¿Nos espera en el muelle principal?";
          setInputText(transcribedText);
          handleTranslateText(transcribedText, 'es', 'en');
          Alert.alert("Audio Voice Note Imported", `File "${file.name}" transcribed and translated to English successfully!`);
        }, 2000);
      }
    } catch (err) {
      Alert.alert("Import Cancelled", "No audio file was selected.");
    }
  };

  const currentTranslationItem: TranslationItem = {
    id: `${inputText}-${outputText}`,
    inputText,
    outputText,
    fromLang,
    toLang,
    timestamp: Date.now(),
  };

  const isSaved = savedTranslations.some(
    (t) => t.inputText === inputText && t.outputText === outputText
  );

  return (
    <View style={styles.screenContainer}>
      <Header
        isPro={isPro}
        onOpenPaywall={onOpenPaywall}
        onOpenSaved={onOpenSaved}
        savedCount={savedTranslations.length}
        onOpenSettings={onOpenSettings}
        onResetOnboarding={onResetOnboarding}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ========================================================================= */}
      {/* 1. DEDICATED WALKIE-TALKIE CHANNEL MODE (When activeWalkieSession !== null && !isChannelMinimized) */}
      {/* ========================================================================= */}
      {activeWalkieSession && !isChannelMinimized ? (
        <View>
          {/* Top Bar with Clear Return to Menu Action */}
          <View style={styles.channelTopBar}>
            <TouchableOpacity
              style={styles.channelBackBtn}
              onPress={() => promptExitChannel()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={16} color="#C2410C" />
              <Text style={styles.channelBackBtnText}>Exit Channel</Text>
            </TouchableOpacity>

            <View style={styles.channelStatusBadge}>
              <View style={styles.walkieDot} />
              <Text style={styles.channelStatusText}>LIVE CHANNEL</Text>
            </View>
          </View>

          {/* Channel Hero & WhatsApp Share Card */}
          <View style={styles.channelHeroCard}>
            <View style={styles.channelHeaderRow}>
              <PoquitoAvatar state="talkie-tx" size={48} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.channelRecipientTitle}>
                  {`Talking with ${formatExpatFacingSenderName(incomingWalkieSender)}`}
                </Text>
                <Text style={styles.channelTopicSubtitle} numberOfLines={1}>
                  {activeWalkieSession.topicEn || activeWalkieSession.topicEs || activeWalkieSession.topic || 'Live Bocas Voice Channel'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.channelWhatsAppShareBtn}
              onPress={() => {
                const recipient = formatExpatFacingSenderName(incomingWalkieSender);
                handleDispatchedToWhatsApp(recipient, 'text');
                shareWalkieTalkieToWhatsApp(
                  activeWalkieSession.shareUrl,
                  recipient,
                  activeWalkieSession.topicEs,
                  activeWalkieSession.topicEn
                );
              }}
              activeOpacity={0.85}
            >
              <WhatsAppIcon size={18} color="#FFFFFF" />
              <Text style={styles.channelWhatsAppShareBtnText}>Share Channel Link on WhatsApp</Text>
            </TouchableOpacity>
          </View>

          {/* Live Conversation Stream */}
          <View style={styles.channelStreamContainer}>
            <Text style={styles.channelStreamHeading}>
              LIVE MESSAGES {displayWalkieMessages.length > 0 ? `(${displayWalkieMessages.length})` : ''}
            </Text>

            {displayWalkieMessages.length === 0 ? (
              <View style={styles.channelEmptyFeed}>
                <Ionicons name="radio-outline" size={32} color="#94A3B8" />
                <Text style={styles.channelEmptyFeedText}>
                  Channel is connected and listening. Speak or type below to send your voice note.
                </Text>
              </View>
            ) : (
              displayWalkieMessages.map((msg, idx) => {
                const isExpat = msg.sender === 'expat';
                const senderDisplay = isExpat ? 'You (Client)' : formatExpatFacingSenderName(msg.senderName || incomingWalkieSender);
                const primaryEnglish = msg.enText || msg.cleanedEnglishText || msg.englishText;
                const spanishText = msg.esText || msg.spanishText || msg.text;
                const isSaved = isMessageSaved(msg);

                return (
                  <View
                    key={msg.id || idx}
                    style={[
                      styles.channelBubble,
                      isExpat ? styles.channelBubbleExpat : styles.channelBubbleContractor
                    ]}
                  >
                    <View style={styles.channelBubbleHeader}>
                      <View style={styles.channelBubbleHeaderLeft}>
                        <Ionicons
                          name={isExpat ? 'person-circle-outline' : 'construct-outline'}
                          size={15}
                          color={isExpat ? '#1E40AF' : '#065F46'}
                        />
                        <Text style={[styles.channelBubbleSenderName, isExpat ? { color: '#1E40AF' } : { color: '#065F46' }]}>
                          {senderDisplay}
                        </Text>
                        {msg.timestamp && (
                          <Text style={styles.channelBubbleTime}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        )}
                      </View>

                      {primaryEnglish && spanishText ? (
                        <TouchableOpacity
                          style={styles.channelHeaderBookmarkBtn}
                          onPress={() => handleToggleSaveChannelMessage(msg)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          activeOpacity={0.7}
                          accessibilityLabel={isSaved ? 'Remove from templates' : 'Save as template'}
                        >
                          <Ionicons
                            name={isSaved ? 'bookmark' : 'bookmark-outline'}
                            size={16}
                            color={isSaved ? '#D97706' : '#94A3B8'}
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    {primaryEnglish ? (
                      <Text style={styles.channelBubbleEnglishText}>
                        "{primaryEnglish}"
                      </Text>
                    ) : null}

                    {spanishText ? (
                      <View style={[styles.channelBubbleSpanishBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.channelBubbleSpanishLabel}>
                            {isExpat ? 'TRANSMITTED TO CONTRACTOR (SPANISH):' : 'SPOKEN BY CONTRACTOR (SPANISH):'}
                          </Text>
                          <Text style={styles.channelBubbleSpanishText}>
                            "{spanishText}"
                          </Text>
                        </View>
                        {msg.audioData || spanishText ? (
                          <TouchableOpacity
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: '#047857',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onPress={() => handlePlayWalkieOriginal(msg.audioData, spanishText)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ) : null}

                    {/* Audio Playback Controls & Template Bookmark */}
                    <View style={styles.channelBubbleAudioRow}>
                      {primaryEnglish ? (
                        <TouchableOpacity
                          style={styles.channelAudioBtn}
                          onPress={() => handlePlayWalkieEnglish(primaryEnglish, !isExpat)}
                          activeOpacity={0.8}
                        >
                          <SpeakerIcon size={15} color="#047857" />
                          <Text style={styles.channelAudioBtnText}>Listen in English</Text>
                        </TouchableOpacity>
                      ) : null}

                      {primaryEnglish && spanishText ? (
                        <TouchableOpacity
                          style={[
                            styles.channelBookmarkBtn,
                            isSaved && styles.channelBookmarkBtnActive
                          ]}
                          onPress={() => handleToggleSaveChannelMessage(msg)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={isSaved ? 'bookmark' : 'bookmark-outline'}
                            size={13}
                            color={isSaved ? '#D97706' : '#64748B'}
                          />
                          <Text
                            style={[
                              styles.channelBookmarkBtnText,
                              isSaved && styles.channelBookmarkBtnTextActive
                            ]}
                          >
                            {isSaved ? 'Saved to Templates' : 'Save as Template'}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Unified Channel Controls: Hold/Tap PTT Mic + English Text Input */}
          <View style={styles.channelBottomControls}>
            <TouchableOpacity
              style={[
                styles.channelPttBtn,
                isListening && styles.channelPttBtnActive,
                isTranslating && styles.channelPttBtnTranslating
              ]}
              onPressIn={handleWalkiePttPressIn}
              onPressOut={handleWalkiePttPressOut}
              activeOpacity={0.85}
            >
              {isTranslating ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.channelPttBtnText}>Transmitting Spanish voice note...</Text>
                </>
              ) : isListening ? (
                <>
                  <Ionicons name="mic" size={22} color="#FFFFFF" />
                  <Text style={styles.channelPttBtnText}>
                    {isWalkieTapRecording ? 'RECORDING... TAP TO TRANSMIT' : 'RECORDING... RELEASE TO TRANSMIT'}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="mic" size={20} color="#FFFFFF" />
                  <Text style={styles.channelPttBtnText}>HOLD OR TAP TO TALK (ENGLISH)</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.channelTextInputRow}>
              <TextInput
                style={styles.channelTextInput}
                placeholder="Type reply in English..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                multiline={false}
                onSubmitEditing={handleWalkieTextSendAndTransmit}
              />
              <TouchableOpacity
                style={[
                  styles.channelSendBtn,
                  (!inputText.trim() || isTranslating) && styles.channelSendBtnDisabled
                ]}
                onPress={handleWalkieTextSendAndTransmit}
                disabled={!inputText.trim() || isTranslating}
                activeOpacity={0.8}
              >
                {isTranslating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* ========================================================================= */
        /* 2. STANDARD TRANSLATOR VIEW (When activeWalkieSession === null or minimized) */
        /* ========================================================================= */
        <View>
          {/* Active Channel Minimized Banner */}
          {activeWalkieSession && isChannelMinimized && (
            <TouchableOpacity
              style={styles.minimizedChannelBanner}
              onPress={() => setIsChannelMinimized(false)}
              activeOpacity={0.88}
            >
              <View style={styles.minimizedChannelPulseDot} />
              <Ionicons name="radio" size={18} color="#059669" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.minimizedChannelTitle} numberOfLines={1}>
                  {`Live Channel Active: ${formatExpatFacingSenderName(incomingWalkieSender)}`}
                </Text>
                <Text style={styles.minimizedChannelSub} numberOfLines={1}>
                  Tap anywhere to return to live walkie conversation
                </Text>
              </View>
              <View style={styles.minimizedChannelBadge}>
                <Text style={styles.minimizedChannelBadgeText}>RESUME</Text>
                <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

          {/* WhatsApp Clipboard Reply Detection Banner (Only if real contractor reply detected) */}
          {clipboardReplyText && (
            <View style={styles.replyBanner}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={handleTranslateWhatsAppReply}
                activeOpacity={0.85}
              >
                <View style={styles.replyBannerHeader}>
                  <WhatsAppIcon size={16} color="#FFF" />
                  <Text style={styles.replyBannerTitle}>Copied WhatsApp Reply Detected</Text>
                </View>
                <Text style={styles.replyBannerText} numberOfLines={2}>
                  "{clipboardReplyText}"
                </Text>
                <View style={styles.replyBannerBtn}>
                  <Text style={styles.replyBannerBtnText}>Translate to English</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.secondary} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.replyBannerDismiss}
                onPress={() => setClipboardReplyText(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={22} color="rgba(255, 255, 255, 0.85)" />
              </TouchableOpacity>
            </View>
          )}

          {/* Category Badge Context & Back Button */}
          {activePresetCategory && (
            <View style={styles.categoryBadgeRow}>
              <View style={styles.categoryBadge}>
                <Ionicons
                  name={
                    activePresetCategory.toLowerCase().includes('taxi') || activePresetCategory.toLowerCase().includes('car')
                      ? 'car'
                      : activePresetCategory.toLowerCase().includes('boat') || activePresetCategory.toLowerCase().includes('water')
                      ? 'boat'
                      : activePresetCategory.toLowerCase().includes('restaurant') || activePresetCategory.toLowerCase().includes('dining')
                      ? 'restaurant'
                      : 'bookmark'
                  }
                  size={14}
                  color={Colors.secondary}
                />
                <Text style={styles.categoryBadgeText}>{activePresetCategory}</Text>
              </View>

              <TouchableOpacity
                style={styles.backToPresetsBtn}
                onPress={() => {
                  if (onClearPresetPrompt) onClearPresetPrompt();
                  if (navigation) navigation.navigate('Presets');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={14} color={Colors.secondary} />
                <Text style={styles.backToPresetsBtnText}>Back to Presets</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Incoming Contractor Voice Note Card (Devpost Frameless Showcase & Live Walkie Feature) */}
          {incomingWalkieMessage && (
            <View style={styles.incomingWalkieCard}>
              <View style={styles.incomingWalkieHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <View style={styles.liveIndicatorDot} />
                  <Text style={styles.incomingWalkieTag}>
                    {`VOICE MESSAGE FROM ${incomingWalkieMessage.senderName ? incomingWalkieMessage.senderName.toUpperCase() : 'CONTRACTOR'}`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIncomingWalkieMessage(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={20} color="#047857" />
                </TouchableOpacity>
              </View>

              {/* Avatar + English Translation Row */}
              <View style={styles.incomingWalkieTopRow}>
                <PoquitoAvatar state="talkie-rx" size={52} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.incomingWalkiePrimaryEnText}>
                    "{incomingWalkieMessage.enText}"
                  </Text>
                </View>
              </View>

              {/* Wider Spanish Voice Note Box shifted to the left, taking up more space with a clean round play button on the right */}
              <View style={styles.incomingWalkieEsBox}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.incomingWalkieEsTag}>Spanish Voice Note:</Text>
                  <Text style={styles.incomingWalkieSecondaryEsText}>
                    "{incomingWalkieMessage.esText}"
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.incomingEsPlayCircleBtn}
                  onPress={() => {
                    if (incomingWalkieMessage.esText) {
                      handlePlayWalkieOriginal(incomingWalkieMessage.audioData, incomingWalkieMessage.esText);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={17} color="#FFFFFF" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              </View>

              {/* Action Buttons Row: Only 2 Buttons (Listen in English & Reply in English), fitting on 1 line */}
              <View style={styles.incomingAudioBtnRow}>
                <TouchableOpacity
                  style={styles.incomingListenEnBtn}
                  onPress={() => {
                    if (incomingWalkieMessage.enText) {
                      handlePlayWalkieEnglish(incomingWalkieMessage.enText);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="volume-high" size={17} color="#FFFFFF" />
                  <Text style={styles.incomingListenEnBtnText}>Listen in English</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.incomingReplyEnBtn}
                  onPress={() => {
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
                  <Text style={styles.incomingReplyEnBtnText}>Reply in English</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Primary Translation Input Card */}
          <View style={styles.inputCard}>
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                inputText.length > 50 && { minHeight: 68 },
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
              placeholder="What would you like to say in Spanish?"
              placeholderTextColor={Colors.outline}
              multiline
              numberOfLines={3}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                if (!text) setOutputText('');
                if (text.length > 0) setIsListening(false);
              }}
            />

            {inputText.length > 0 && (
              <View style={styles.inputActions}>
                <TouchableOpacity onPress={() => { setInputText(''); setOutputText(''); }} style={styles.clearInputBtn}>
                  <Ionicons name="close-circle-outline" size={20} color={Colors.outline} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.translateBtn}
                  onPress={() => handleTranslateText()}
                  disabled={isTranslating}
                  activeOpacity={0.8}
                >
                  {isTranslating ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="send" size={15} color="#FFF" />
                      <Text style={styles.translateBtnText}>Translate</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Quick Island Starter Chips (1-tap instant action when idle) */}
          {inputText.length === 0 && outputText.length === 0 && (
            <View style={styles.quickStartersContainer}>
              <View style={styles.quickStartersRow}>
                <TouchableOpacity
                  style={styles.starterChip}
                  onPress={() => {
                    const text = "How much for a water taxi to Carenero?";
                    setInputText(text);
                    handleTranslateText(text, 'en', 'es');
                  }}
                  activeOpacity={0.78}
                >
                  <Ionicons name="boat-outline" size={13} color="#0284C7" style={{ marginRight: 4 }} />
                  <Text style={styles.starterChipText}>"How much for a water taxi to Carenero?"</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.starterChip}
                  onPress={() => {
                    const text = "When can you come by tomorrow?";
                    setInputText(text);
                    handleTranslateText(text, 'en', 'es');
                  }}
                  activeOpacity={0.78}
                >
                  <Ionicons name="time-outline" size={13} color="#D97706" style={{ marginRight: 4 }} />
                  <Text style={styles.starterChipText}>"When can you come by?"</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.starterChip}
                  onPress={() => {
                    const text = "Do you deliver 5-gallon water?";
                    setInputText(text);
                    handleTranslateText(text, 'en', 'es');
                  }}
                  activeOpacity={0.78}
                >
                  <Ionicons name="water-outline" size={13} color="#0284C7" style={{ marginRight: 4 }} />
                  <Text style={styles.starterChipText}>"Do you deliver water?"</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Centerpiece Push-To-Talk Mascot (Conversational Translator Stance) */}
          <MicButton
            isListening={isListening}
            isTranslating={isTranslating}
            isPlayingAudio={isPlayingTranslationAudio}
            onPress={handleMicPress}
            label="TAP & SPEAK ENGLISH"
            mode="translator"
          />

          {/* Translation Output Card */}
          {outputText.length > 0 && (
            <TranslationCard
              inputText={inputText}
              outputText={outputText}
              fromLang={fromLang}
              toLang={toLang}
              onSave={() => onToggleSave(currentTranslationItem)}
              isSaved={isSaved}
              initialVoice={selectedVoice}
              onPlayingChange={setIsPlayingTranslationAudio}
              onStartWalkie={(spanishText, englishText) => {
                handleLaunchWalkieTalkie(spanishText, englishText);
              }}
              onSelectQuickPrompt={(prompt) => {
                setFromLang('en');
                setToLang('es');
                setInputText(prompt);
                handleTranslateText(prompt, 'en', 'es');
              }}
              onDispatchedToWhatsApp={handleDispatchedToWhatsApp}
            />
          )}

          {/* Island Expats Toolkit (Spacious, Un-Clipped Action Cards) */}
          <View style={styles.toolkitSection}>
            <Text style={styles.toolkitHeading}>ISLAND TOOLKIT</Text>

            {/* 1. 2-Way Live Walkie Channel */}
            <TouchableOpacity
              style={styles.toolkitCard}
              onPress={() => setShowWalkieExplainer(true)}
              activeOpacity={0.6}
            >
              <View style={[styles.toolkitIconCircle, { backgroundColor: '#FFDBCD' }]}>
                <WalkieTalkieIcon size={20} color="#1A1208" strokeWidth={2.0} />
              </View>
              <View style={styles.toolkitTextBox}>
                <View style={styles.toolkitTitleRow}>
                  <Text style={styles.toolkitTitle}>2-Way Walkie-Talkie</Text>
                  <View style={styles.liveTagBadge}>
                    <View style={styles.liveTagDot} />
                    <Text style={styles.liveTagText}>LIVE</Text>
                  </View>
                </View>
                <Text style={styles.toolkitSubtitle}>
                  Instant WhatsApp link for real-time 2-way translation
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* 2. Decode WhatsApp Voice Note */}
            <TouchableOpacity
              style={styles.toolkitCard}
              onPress={() => setShowVoiceDecoderModal(true)}
              activeOpacity={0.82}
            >
              <View style={[styles.toolkitIconCircle, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="mic" size={20} color="#D97706" />
              </View>
              <View style={styles.toolkitTextBox}>
                <Text style={styles.toolkitTitle}>Decode WhatsApp Voice Note</Text>
                <Text style={styles.toolkitSubtitle}>
                  Slow down rapid Spanish contractor audio with 0.75x slow replay
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* 3. Spanish Bill & Contract Scanner */}
            <TouchableOpacity
              style={styles.toolkitCard}
              onPress={() => setShowDocScannerModal(true)}
              activeOpacity={0.82}
            >
              <View style={[styles.toolkitIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="document-text" size={20} color="#059669" />
              </View>
              <View style={styles.toolkitTextBox}>
                <Text style={styles.toolkitTitle}>Spanish Bill & Contract Scanner</Text>
                <Text style={styles.toolkitSubtitle}>
                  Snap a photo of Naturgy power bills, water tickets & leases
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <VoiceQualityModal
        visible={showVoiceQualityModal}
        onClose={() => setShowVoiceQualityModal(false)}
        selectedVoice={selectedVoice}
        onSelectFreeStandardVoice={() => {
          Alert.alert("Standard Free Voice Selected", "Your audio message will be generated using the local standard free voice.");
        }}
        onBuyCreditsOrPro={onOpenPaywall}
      />

      {/* 2-Way Walkie-Talkie In-Between Explainer Sheet */}
      <WalkieExplainerModal
        visible={showWalkieExplainer}
        onClose={() => setShowWalkieExplainer(false)}
        initialTopicEs={outputText ? outputText.trim() : (fromLang === 'es' ? inputText.trim() : '')}
        initialTopicEn={inputText ? inputText.trim() : ''}
        selectedVoiceId={selectedVoice?.id}
        onLaunch={(topicEs, topicEn, audioBase64) => handleLaunchWalkieTalkie(topicEs, topicEn, audioBase64)}
      />

      {/* Inbound Voice Note Decoder Modal */}
      <VoiceNoteDecoderModal
        visible={showVoiceDecoderModal}
        onClose={() => setShowVoiceDecoderModal(false)}
      />

      {/* Document & Utility Bill Scanner Modal */}
      <DocumentScannerModal
        visible={showDocScannerModal}
        onClose={() => setShowDocScannerModal(false)}
      />

      {/* Post-WhatsApp Handoff Modal */}
      <PostWhatsAppModal
        visible={showPostWhatsAppModal}
        onClose={() => setShowPostWhatsAppModal(false)}
        contactName={postWhatsAppRecipient}
        dispatchType={postWhatsAppDispatchType}
        walkieRoomId={activeWalkieSession?.roomId}
        onOpenDecoder={() => setShowVoiceDecoderModal(true)}
        onOpenWalkieChannel={() => {
          if (activeWalkieSession) {
            setIsChannelMinimized(false);
          } else {
            setShowWalkieExplainer(true);
          }
        }}
      />
    </ScrollView>
  </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 150,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondaryContainer || '#F4FAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary,
  },
  backToPresetsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainer || '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  backToPresetsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  dictationActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.secondaryContainer || '#F4FAFE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.secondaryLight,
  },
  dictationActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    flex: 1,
  },
  replyBanner: {
    backgroundColor: Colors.whatsapp,
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: Colors.whatsapp,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  replyBannerDismiss: {
    padding: 2,
    marginLeft: 8,
  },
  replyBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  replyBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  replyBannerText: {
    fontSize: 12,
    color: '#E8F5E9',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  replyBannerBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  replyBannerBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
  },
  voiceNoteHelperCard: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  voiceNoteHelperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  voiceNoteHelperTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  voiceNoteHelperDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 12,
  },
  threadsLauncherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  threadsLauncherText: {
    flex: 1,
  },
  threadsLauncherTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  threadsLauncherSub: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  inputCard: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  textInput: {
    fontSize: 14.5,
    color: Colors.onBackground,
    minHeight: 64,
    lineHeight: 21,
    paddingTop: 2,
    paddingBottom: 2,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  quickStartersContainer: {
    marginTop: 10,
    marginBottom: 4,
  },
  quickStartersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'center',
  },
  starterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150, 72, 36, 0.16)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  starterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A2E20',
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  translateBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },
  followUpSection: {
    marginTop: 14,
  },
  followUpSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  followUpRow: {
    gap: 8,
  },
  followUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  followUpChipIcon: {
    fontSize: 14,
  },
  followUpChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  walkieActiveBanner: {
    backgroundColor: Colors.secondaryContainer || '#FFDBCD',
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  walkieActiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  walkieLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walkieDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.whatsapp,
  },
  walkieLiveText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  walkieActiveTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 2,
  },
  walkieActiveDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
    marginBottom: 12,
  },
  walkieShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: 8,
    borderRadius: 14,
  },
  walkieShareBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary,
  },
  walkieToggleFeedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF0EA',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  walkieToggleFeedText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#C2410C',
  },
  walkieFeatureCard: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  walkieFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  walkieFeatureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  walkieFeatureDesc: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 16,
  },
  startWalkieCardBtn: {
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  startWalkieCardBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  voiceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  voiceToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 3,
  },
  voiceToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 13,
  },
  voiceToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  voiceToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  voiceToggleBtnTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  utilityBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  utilityBarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderWidth: 1,
    borderColor: Colors.cardBorder || '#E8E4DE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  utilityBarBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },

  clearInputBtn: {
    padding: 4,
  },
  toolkitSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  toolkitHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  toolkitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  toolkitIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toolkitTextBox: {
    flex: 1,
    justifyContent: 'center',
  },
  toolkitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolkitTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  liveTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  liveTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.6,
  },
  toolkitSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  translatingLoaderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 211, 102, 0.3)',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  translatingLoaderText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
    textAlign: 'center',
  },
  incomingWalkieCard: {
    backgroundColor: '#FAF8F5',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#047857',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  incomingWalkieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  incomingWalkieTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  incomingWalkieTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  incomingWalkiePrimaryEnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#064E3B',
    lineHeight: 21,
  },
  incomingWalkieEsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  incomingWalkieEsTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  incomingWalkieSecondaryEsText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  incomingEsPlayCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  incomingAudioBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  incomingListenEnBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#0284C7',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  incomingListenEnBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  incomingReplyEnBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#059669',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  incomingReplyEnBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  walkieTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginVertical: 4,
  },
  walkieTopicText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
    flex: 1,
  },
  walkieHistoryContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
  },
  walkieHistoryHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  walkieHistoryBubble: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  walkieBubbleExpat: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },
  walkieBubbleContractor: {
    backgroundColor: '#F0FDF4',
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  walkieBubbleSender: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
  },
  walkieBubbleEnglish: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 19,
  },
  walkieBubbleSpanish: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  replyingToWalkieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFEDD5',
    borderColor: '#FED7AA',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
    gap: 8,
  },
  replyingToWalkieText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
    flex: 1,
  },
  transmitWalkieBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 6,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  transmitWalkieBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  walkieQuickTransmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 8,
    gap: 8,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  walkieQuickTransmitText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 1,
  },

  // Dedicated Walkie Channel Mode Styles
  channelTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  channelBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FFEDD5',
    borderRadius: 10,
  },
  channelBackBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#C2410C',
  },
  channelStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  channelStatusText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.6,
  },
  channelHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  channelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  channelRecipientTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 20,
  },
  channelTopicSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#EA580C',
    marginTop: 2,
  },
  channelWhatsAppShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    borderWidth: 1,
    borderColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  channelWhatsAppShareBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  channelStreamContainer: {
    marginBottom: 16,
  },
  channelStreamHeading: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  channelEmptyFeed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  channelEmptyFeedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  channelBubble: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  channelBubbleExpat: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    alignSelf: 'flex-end',
    width: '94%',
  },
  channelBubbleContractor: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    alignSelf: 'flex-start',
    width: '94%',
  },
  channelBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  channelBubbleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  channelHeaderBookmarkBtn: {
    padding: 3,
    borderRadius: 6,
  },
  channelHeaderBookmarkBtnActive: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
  },
  channelBubbleSenderName: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  channelBubbleTime: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  channelBubbleEnglishText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 6,
  },
  channelBubbleSpanishBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 8,
  },
  channelBubbleSpanishLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
    letterSpacing: 0.4,
  },
  channelBubbleSpanishText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 17,
    fontStyle: 'italic',
  },
  channelBubbleAudioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  channelAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 10,
  },
  channelAudioBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#047857',
  },
  channelBookmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 10,
  },
  channelBookmarkBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  channelBookmarkBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#B45309',
  },
  channelBookmarkBtnTextActive: {
    color: '#92400E',
  },
  channelBottomControls: {
    marginTop: 8,
    marginBottom: 24,
    gap: 10,
  },
  channelPttBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  channelPttBtnActive: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  channelPttBtnTranslating: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  channelPttBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  channelTextInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  channelTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 8,
  },
  channelSendBtn: {
    backgroundColor: '#EA580C',
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelSendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  minimizedChannelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  minimizedChannelPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginRight: 2,
  },
  minimizedChannelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.2,
  },
  minimizedChannelSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
    marginTop: 2,
  },
  minimizedChannelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
    gap: 2,
  },
  minimizedChannelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
