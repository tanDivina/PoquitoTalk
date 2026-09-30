import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { WhatsAppIcon } from "./WhatsAppIcon";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as Speech from "expo-speech";
import { Colors } from "../theme/colors";
import { ConversationThread, ThreadMessage } from "../services/conversations";
import { getCategoryUnifiedMeta } from "../services/presets";
import { speakIncomingEnglish } from "../services/incomingVoice";
import { resolveSpeakerGender, SpeakerGender } from "../utils/speakerGender";
import { translateText } from "../services/translation";
import {
  generateGoogleGeminiAudio,
  playGoogleAudioFile,
  stopAllAudioPlayback,
  GOOGLE_SPANISH_VOICES,
} from "../services/googleVoice";
import { TranslationItem } from "../types";

interface ThreadViewModalProps {
  visible: boolean;
  thread: ConversationThread | null;
  onClose: () => void;
  onUpdateThread: (updatedThread: ConversationThread) => void;
  onDeleteThread?: (threadId: string) => void;
  savedTemplates?: TranslationItem[];
  savedTranslations?: TranslationItem[];
}

export const ThreadViewModal: React.FC<ThreadViewModalProps> = ({
  visible,
  thread,
  onClose,
  onUpdateThread,
  onDeleteThread,
  savedTemplates = [],
  savedTranslations = [],
}) => {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSharing] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [playingEnglishMsgId, setPlayingEnglishMsgId] = useState<string | null>(null);
  const [sharingMsgId, setSharingMsgId] = useState<string | null>(null);

  // Memoized deduplication of thread messages for rendering
  const displayMessages = useMemo(() => {
    if (!thread?.messages || !Array.isArray(thread.messages)) return [];
    const seenIds = new Set<string>();
    const seenContent = new Set<string>();
    const deduped: ThreadMessage[] = [];

    for (const msg of thread.messages) {
      if (msg.id && seenIds.has(msg.id)) continue;
      const contentKey = `${msg.sender}_${msg.textSpanish || msg.textEnglish}_${Math.floor((msg.timestamp || 0) / 4000)}`;
      if (seenContent.has(contentKey)) continue;

      if (msg.id) seenIds.add(msg.id);
      seenContent.add(contentKey);
      deduped.push(msg);
    }
    return deduped;
  }, [thread?.messages]);

  // Live polling for contractor replies while this thread is open
  useEffect(() => {
    if (!visible || !thread) return;
    const roomId = thread.roomId;
    if (!roomId) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const url = `https://poquitotalk.hero-apps.com/api/walkie.php?action=poll&room=${encodeURIComponent(roomId)}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.success || !Array.isArray(data.messages)) return;

        let hasNew = false;
        const currentMessages = [...thread.messages];

        for (const sMsg of data.messages) {
          if (sMsg.sender === 'contractor') {
            const sTimestamp = sMsg.timestamp || Date.now();
            const sTextEs = sMsg.esText || '';
            const sTextEn = sMsg.enText || sTextEs;
            const sAudio = sMsg.audioUrl || undefined;

            const alreadyExists = currentMessages.some(m =>
              (sMsg.id && m.id === sMsg.id) ||
              (Math.abs(m.timestamp - sTimestamp) < 3000 && m.textSpanish === sTextEs)
            );

            if (!alreadyExists) {
              currentMessages.push({
                id: sMsg.id || `msg_contractor_${sTimestamp}`,
                sender: 'SERVICE_PROVIDER',
                textEnglish: sTextEn,
                textSpanish: sTextEs,
                audioUri: sAudio,
                personaName: sMsg.senderName || thread.contactName,
                timestamp: sTimestamp,
              });
              hasNew = true;
            }
          }
        }

        if (hasNew && isMounted) {
          const updatedThread: ConversationThread = {
            ...thread,
            lastUpdated: Date.now(),
            messages: currentMessages,
          };
          onUpdateThread(updatedThread);
        }
      } catch (e) {
        // ignore poll network errors
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [visible, thread?.roomId, thread?.messages?.length]);

  useEffect(() => {
    if (!visible) {
      Speech.stop();
      stopAllAudioPlayback();
      setPlayingMsgId(null);
      setPlayingEnglishMsgId(null);
    }
  }, [visible]);

  if (!visible || !thread) return null;

  const meta = getCategoryUnifiedMeta(thread.category);

  // Incoming English plays in a voice matching this contact (guessed from the name,
  // one tap to change). The contractor never has to set anything.
  const speakerGender = resolveSpeakerGender(thread.speakerGender, thread.contactName);
  const isGenderGuessed = !thread.speakerGender;
  const SPEAKER_GENDER_LABEL: Record<SpeakerGender, string> = {
    MALE: "Male voice",
    FEMALE: "Female voice",
    NEUTRAL: "Neutral voice",
  };
  const SPEAKER_GENDER_ICON: Record<SpeakerGender, string> = {
    MALE: "male",
    FEMALE: "female",
    NEUTRAL: "person-outline",
  };
  const handleCycleSpeakerGender = () => {
    const next: SpeakerGender =
      speakerGender === "MALE" ? "FEMALE" : speakerGender === "FEMALE" ? "NEUTRAL" : "MALE";
    onUpdateThread({ ...thread, speakerGender: next });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText("");
    setIsSharing(true);

    try {
      const translatedSpanish = await translateText(userText, "en", "es");
      const newMsg: ThreadMessage = {
        id: `msg_${Date.now()}`,
        sender: "EXPAT",
        textEnglish: userText,
        textSpanish: translatedSpanish,
        personaName: "Male",
        timestamp: Date.now(),
      };

      const updatedThread: ConversationThread = {
        ...thread,
        lastUpdated: Date.now(),
        messages: [...thread.messages, newMsg],
      };

      onUpdateThread(updatedThread);
    } catch (e) {
      Alert.alert("Translation Error", "Failed to generate translation.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleUseSavedTemplate = (item: TranslationItem) => {
    if (!thread) return;
    const newMsg: ThreadMessage = {
      id: `msg_${Date.now()}`,
      sender: "EXPAT",
      textEnglish: item.inputText,
      textSpanish: item.outputText,
      personaName: "Male",
      timestamp: Date.now(),
    };

    const updatedThread: ConversationThread = {
      ...thread,
      lastUpdated: Date.now(),
      messages: [...thread.messages, newMsg],
    };

    onUpdateThread(updatedThread);
  };

  const handlePlayMessageAudio = async (msg: ThreadMessage) => {
    try {
      if (playingMsgId === msg.id) {
        setPlayingMsgId(null);
        await stopAllAudioPlayback();
        return;
      }

      setPlayingMsgId(msg.id);
      let fileUri = msg.audioUri;
      if (!fileUri) {
        fileUri = await generateGoogleGeminiAudio(msg.textSpanish, msg.personaName || "Male");
      }
      if (fileUri) {
        const sound = await playGoogleAudioFile(fileUri, GOOGLE_SPANISH_VOICES[0]);
        if (sound) {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setPlayingMsgId(null);
              sound.unloadAsync();
            }
          });
        }
      } else {
        setPlayingMsgId(null);
      }
    } catch (e) {
      setPlayingMsgId(null);
    }
  };

  const handlePlayEnglishMessageAudio = async (msg: ThreadMessage) => {
    try {
      if (playingEnglishMsgId === msg.id) {
        setPlayingEnglishMsgId(null);
        Speech.stop();
        return;
      }

      await stopAllAudioPlayback();
      setPlayingMsgId(null);
      setPlayingEnglishMsgId(msg.id);

      // Contractor messages use the contractor's voice; the expat's own messages stay neutral
      const voiceGender = msg.sender === "SERVICE_PROVIDER" ? speakerGender : "NEUTRAL";
      await speakIncomingEnglish(msg.textEnglish, voiceGender, {
        rate: 0.95,
        onDone: () => setPlayingEnglishMsgId(null),
        onError: () => setPlayingEnglishMsgId(null),
      });
    } catch (e) {
      setPlayingEnglishMsgId(null);
    }
  };

  const handleShareToWhatsApp = async (msg: ThreadMessage) => {
    try {
      setSharingMsgId(msg.id);
      const fileUri = await generateGoogleGeminiAudio(msg.textSpanish, msg.personaName || "Male");
      if (fileUri) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "audio/mp3",
          dialogTitle: `Send Voice Note to ${thread.contactName}`,
          UTI: "public.mp3",
        });
      }
    } catch (e) {
      Alert.alert("Share Error", "Could not share voice note to WhatsApp.");
    } finally {
      setSharingMsgId(null);
    }
  };

  const handleShareThread = async () => {
    try {
      const summaryLines = (thread.messages || []).map((m) => {
        const who = m.sender === "EXPAT" ? "Me" : thread.contactName;
        return `[${who}]: ${m.textSpanish || m.textEnglish}`;
      });
      const shareMsg = `💬 Conversation with ${thread.contactName} (${thread.category}) via PoquitoTalk:\n\n${summaryLines.join("\n\n")}`;
      await Share.share({
        message: shareMsg,
        title: `Conversation with ${thread.contactName}`,
      });
    } catch (e) {
      console.warn("Share error:", e);
    }
  };

  const handleOpenWhatsApp = async () => {
    const phone = thread.whatsappNumber;
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const waUrl = `https://wa.me/${cleanPhone}`;
      const canOpen = await Linking.canOpenURL(waUrl);
      if (canOpen) {
        await Linking.openURL(waUrl);
      } else {
        await Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
      }
    } else {
      Alert.alert(
        "WhatsApp Contact",
        `No direct WhatsApp number is stored for ${thread.contactName}. You can add one in Phone Book or send voice notes directly to WhatsApp from this thread.`
      );
    }
  };

  const handleImportIncomingVoiceNote = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*", "application/octet-stream"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const incomingMsg: ThreadMessage = {
          id: `incoming_${Date.now()}`,
          sender: "SERVICE_PROVIDER",
          textEnglish: "Incoming voice note attached. Tap to listen and review transcription.",
          textSpanish: "¡Buenas! Recibido su mensaje, ya voy en camino.",
          audioUri: asset.uri,
          timestamp: Date.now(),
        };

        const updated = {
          ...thread,
          lastUpdated: Date.now(),
          messages: [...thread.messages, incomingMsg],
        };
        onUpdateThread(updated);
        Alert.alert("Voice Note Imported", "Provider voice note attached to conversation timeline.");
      }
    } catch (e) {
      Alert.alert("Import Error", "Could not load voice file.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header with Service Contact Info */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.onBackground} />
          </TouchableOpacity>

          <View style={[styles.avatarCircle, { backgroundColor: meta.badgeBg, borderColor: meta.border, borderWidth: 1 }]}>
            <Ionicons name={(meta.ioniconsName as any) || "person-outline"} size={18} color={meta.color} />
          </View>

          <View style={styles.headerTitleBox}>
            <Text style={styles.contactName}>{thread.contactName}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
              <View style={[styles.categoryPill, { backgroundColor: meta.badgeBg, borderColor: meta.border }]}>
                <Text style={[styles.categoryBadge, { color: meta.color }]}>{thread.category}</Text>
              </View>
              <TouchableOpacity
                onPress={handleCycleSpeakerGender}
                style={styles.speakerGenderChip}
                accessibilityRole="button"
                accessibilityLabel={`Their replies play in a ${SPEAKER_GENDER_LABEL[speakerGender].toLowerCase()}${isGenderGuessed ? ", guessed from the name" : ""}. Tap to change.`}
              >
                <Ionicons name={SPEAKER_GENDER_ICON[speakerGender] as any} size={11} color={Colors.onSurfaceVariant} />
                <Text style={styles.speakerGenderText}>
                  {SPEAKER_GENDER_LABEL[speakerGender]}
                  {isGenderGuessed && speakerGender !== "NEUTRAL" ? " · from name" : ""}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerActionsRow}>
            {/* Share Conversation Transcript */}
            <TouchableOpacity
              onPress={handleShareThread}
              style={styles.recommendBtn}
              accessibilityLabel="Share conversation"
            >
              <Ionicons name="share-social-outline" size={18} color={Colors.secondary} />
            </TouchableOpacity>

            {/* Direct WhatsApp Chat */}
            <TouchableOpacity
              onPress={handleOpenWhatsApp}
              style={styles.importVoiceBtn}
              accessibilityLabel="Open WhatsApp"
            >
              <WhatsAppIcon size={16} color={Colors.whatsapp} />
            </TouchableOpacity>

            {/* Import incoming voice note file */}
            <TouchableOpacity
              onPress={handleImportIncomingVoiceNote}
              style={[styles.importVoiceBtn, { backgroundColor: Colors.surfaceContainerHigh || "#F0EDE6" }]}
              accessibilityLabel="Attach audio note"
            >
              <Ionicons name="attach-outline" size={18} color={Colors.onSurfaceVariant || "#5C4E3A"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages Timeline */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.timeline}
          ref={(ref) => ref?.scrollToEnd({ animated: true })}
        >
          {displayMessages.map((msg) => {
            const isExpat = msg.sender === "EXPAT";
            return (
              <View
                key={msg.id}
                style={[
                  styles.bubbleContainer,
                  isExpat ? styles.expatBubbleAlign : styles.providerBubbleAlign,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isExpat ? styles.expatBubble : styles.providerBubble,
                  ]}
                >
                  <Text style={styles.msgSenderLabel}>
                    {isExpat ? "You (Client)" : `🇵🇦 ${thread.contactName}`}
                  </Text>

                  <Text style={styles.englishText}>{msg.textEnglish}</Text>
                  <Text style={styles.spanishText}>{msg.textSpanish}</Text>

                  {/* Actions for Message Voice Note */}
                  <View style={styles.msgActionsRow}>
                    <TouchableOpacity
                      style={styles.msgActionBtn}
                      onPress={() => handlePlayMessageAudio(msg)}
                    >
                      <Ionicons
                        name={playingMsgId === msg.id ? "pause-circle" : "play-circle"}
                        size={18}
                        color={isExpat ? Colors.secondary : Colors.tertiary}
                      />
                      <Text style={[styles.msgActionText, !isExpat && { color: Colors.tertiary }]}>
                        {msg.audioUri ? "Listen Audio" : "Listen"}
                      </Text>
                    </TouchableOpacity>

                    {!isExpat && msg.textEnglish ? (
                      <TouchableOpacity
                        style={[
                          styles.msgActionBtn,
                          styles.msgEnglishActionBtn,
                          playingEnglishMsgId === msg.id && styles.msgEnglishActionBtnActive,
                        ]}
                        onPress={() => handlePlayEnglishMessageAudio(msg)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={playingEnglishMsgId === msg.id ? "stop-circle" : "volume-high"}
                          size={17}
                          color={playingEnglishMsgId === msg.id ? "#FFFFFF" : "#047857"}
                        />
                        <Text
                          style={[
                            styles.msgActionText,
                            { color: "#047857" },
                            playingEnglishMsgId === msg.id && { color: "#FFFFFF" },
                          ]}
                        >
                          {playingEnglishMsgId === msg.id ? "Stop" : "Listen English"}
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {isExpat && (
                      <TouchableOpacity
                        style={styles.msgWhatsAppBtn}
                        onPress={() => handleShareToWhatsApp(msg)}
                        disabled={sharingMsgId === msg.id}
                        activeOpacity={0.7}
                      >
                        {sharingMsgId === msg.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <WhatsAppIcon size={15} color="#FFFFFF" />
                            <Text style={styles.msgWhatsAppText} numberOfLines={1}>
                              Send Voice Note
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* 1-Tap Bookmarked Templates Tray */}
        {savedTranslations.length > 0 && (
          <View style={styles.templatesTray}>
            <View style={styles.templatesHeaderRow}>
              <Ionicons name="bookmark" size={12} color="#D97706" />
              <Text style={styles.templatesHeaderTitle}>1-TAP BOOKMARKED TEMPLATES</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templatesScrollContent}
            >
              {savedTranslations.map((item, idx) => {
                const itemMeta = getCategoryUnifiedMeta(item.category);
                return (
                  <TouchableOpacity
                    key={item.id || idx}
                    style={[
                      styles.templateChip,
                      {
                        backgroundColor: itemMeta.bg,
                        borderColor: itemMeta.border,
                      },
                    ]}
                    onPress={() => handleUseSavedTemplate(item)}
                    onLongPress={() => setInputText(item.inputText)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                      <Ionicons name={itemMeta.ioniconsName as any} size={11} color={itemMeta.color} style={{ marginRight: 4 }} />
                      <Text style={[styles.templateChipTitle, { color: itemMeta.color }]} numberOfLines={1}>
                        "{item.inputText}"
                      </Text>
                    </View>
                    <Text style={[styles.templateChipSpanish, { color: Colors.onBackground }]} numberOfLines={1}>
                      {item.outputText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Bottom Input Area */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Message in English..."
            placeholderTextColor={Colors.outline}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSendMessage}
            disabled={isSending || !inputText.trim()}
          >
            {isSending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: Colors.surfaceContainerLowest || "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    padding: 8,
    marginRight: 4,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitleBox: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.onBackground,
  },
  categoryPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  categoryBadge: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  speakerGenderChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  speakerGenderText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: Colors.onSurfaceVariant,
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recommendBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.secondaryContainer,
  },
  importVoiceBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#DCF8C6",
  },
  timeline: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  bubbleContainer: {
    flexDirection: "row",
    marginVertical: 4,
  },
  expatBubbleAlign: {
    justifyContent: "flex-end",
  },
  providerBubbleAlign: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  expatBubble: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    borderBottomRightRadius: 4,
  },
  providerBubble: {
    backgroundColor: "#DCF8C6",
    borderColor: "#C3E8A7",
    borderBottomLeftRadius: 4,
  },
  msgSenderLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.outline,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  englishText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: Colors.onBackground,
    lineHeight: 20,
  },
  spanishText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.onSurfaceVariant,
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 18,
  },
  msgActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  msgActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  msgActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.secondary,
  },
  msgEnglishActionBtn: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  msgEnglishActionBtnActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  msgWhatsAppBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  msgWhatsAppText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  templatesTray: {
    backgroundColor: "#FFFDF5",
    borderTopWidth: 1,
    borderTopColor: "#FDE68A",
    paddingVertical: 8,
  },
  templatesHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  templatesHeaderTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 0.5,
  },
  templatesScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  templateChip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 220,
  },
  templateChipTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  templateChipSpanish: {
    fontSize: 10.5,
    fontWeight: "500",
    fontStyle: "italic",
    marginTop: 1,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceContainerLowest || "#FFF",
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onBackground,
    maxHeight: 90,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
});
