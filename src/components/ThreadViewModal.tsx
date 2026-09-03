import React, { useState } from "react";
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
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { WhatsAppIcon } from "./WhatsAppIcon";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Colors } from "../theme/colors";
import { ConversationThread, ThreadMessage } from "../services/conversations";
import { getCategoryUnifiedMeta } from "../services/presets";
import { translateWithGemma } from "../services/gemma";
import { generateGoogleGeminiAudio, playGoogleAudioFile, GOOGLE_SPANISH_VOICES } from "../services/googleVoice";
import { TranslationItem } from "../types";

interface ThreadViewModalProps {
  visible: boolean;
  thread: ConversationThread | null;
  onClose: () => void;
  onUpdateThread: (updatedThread: ConversationThread) => void;
  savedTranslations?: TranslationItem[];
}

export const ThreadViewModal: React.FC<ThreadViewModalProps> = ({
  visible,
  thread,
  onClose,
  onUpdateThread,
  savedTranslations = [],
}) => {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSharing] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  if (!visible || !thread) return null;

  const meta = getCategoryUnifiedMeta(thread.category);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText("");
    setIsSharing(true);

    try {
      const translatedSpanish = await translateWithGemma(userText, "en", "es");
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
      setPlayingMsgId(msg.id);
      const fileUri = await generateGoogleGeminiAudio(msg.textSpanish, msg.personaName || "Male");
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
      }
    } catch (e) {
      setPlayingMsgId(null);
    }
  };

  const handleShareToWhatsApp = async (msg: ThreadMessage) => {
    try {
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
    }
  };

  const handleShareRecommendation = async () => {
    try {
      const shareMsg = `🌴 Highly recommend ${thread.contactName} (${thread.category}) in Bocas del Toro!
Arranged seamlessly with Spanish voice notes using PoquitoTalk.app 🇵🇦`;
      await Share.share({
        message: shareMsg,
        title: `Recommend ${thread.contactName}`,
      });
    } catch (e) {
      console.warn("Recommendation share error:", e);
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
        <View style={styles.header}>
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
            </View>
          </View>

          <View style={styles.headerActionsRow}>
            {/* Growth Loop 4: Service Proof & Recommendation Card Share */}
            <TouchableOpacity
              onPress={handleShareRecommendation}
              style={styles.recommendBtn}
            >
              <Ionicons name="share-social-outline" size={18} color={Colors.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleImportIncomingVoiceNote}
              style={styles.importVoiceBtn}
            >
              <WhatsAppIcon size={16} color={Colors.whatsapp} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages Timeline */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.timeline}
          ref={(ref) => ref?.scrollToEnd({ animated: true })}
        >
          {(thread?.messages || []).map((msg) => {
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

                  {/* Actions for Expat Outgoing Voice Note */}
                  {isExpat && (
                    <View style={styles.msgActionsRow}>
                      <TouchableOpacity
                        style={styles.msgActionBtn}
                        onPress={() => handlePlayMessageAudio(msg)}
                      >
                        <Ionicons
                          name={playingMsgId === msg.id ? "pause-circle" : "play-circle"}
                          size={18}
                          color={Colors.secondary}
                        />
                        <Text style={styles.msgActionText}>Listen</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.msgWhatsAppBtn}
                        onPress={() => handleShareToWhatsApp(msg)}
                      >
                        <WhatsAppIcon size={14} color="#FFF" />
                        <Text style={styles.msgWhatsAppText}>Send Voice Note</Text>
                      </TouchableOpacity>
                    </View>
                  )}
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
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={`Message ${thread.contactName} in English...`}
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
    paddingVertical: 6,
    borderRadius: 12,
  },
  msgActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.secondary,
  },
  msgWhatsAppBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.whatsapp,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  msgWhatsAppText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF",
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
