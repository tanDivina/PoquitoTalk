import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../theme/colors';
import { ConversationThread, ThreadMessage } from '../services/conversations';
import { translateWithGemma } from '../services/gemma';
import { generateGoogleGeminiAudio, playGoogleAudioFile, GOOGLE_SPANISH_VOICES } from '../services/googleVoice';

interface ThreadViewModalProps {
  visible: boolean;
  thread: ConversationThread | null;
  onClose: () => void;
  onUpdateThread: (updatedThread: ConversationThread) => void;
}

export const ThreadViewModal: React.FC<ThreadViewModalProps> = ({
  visible,
  thread,
  onClose,
  onUpdateThread,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSharing] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  if (!visible || !thread) return null;

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');
    setIsSharing(true);

    try {
      const translatedSpanish = await translateWithGemma(userText, 'en', 'es');
      const newMsg: ThreadMessage = {
        id: `msg_${Date.now()}`,
        sender: 'EXPAT',
        textEnglish: userText,
        textSpanish: translatedSpanish,
        personaName: 'Male',
        timestamp: Date.now(),
      };

      const updatedThread: ConversationThread = {
        ...thread,
        lastUpdated: Date.now(),
        messages: [...thread.messages, newMsg],
      };

      onUpdateThread(updatedThread);
    } catch (e) {
      Alert.alert('Translation Error', 'Failed to generate translation.');
    } finally {
      setIsSharing(false);
    }
  };

  const handlePlayMessageAudio = async (msg: ThreadMessage) => {
    try {
      setPlayingMsgId(msg.id);
      const fileUri = await generateGoogleGeminiAudio(msg.textSpanish, msg.personaName || 'Male');
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
      const fileUri = await generateGoogleGeminiAudio(msg.textSpanish, msg.personaName || 'Male');
      if (fileUri) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'audio/mp3',
          dialogTitle: `Send Voice Note to ${thread.contactName}`,
          UTI: 'public.mp3',
        });
      }
    } catch (e) {
      Alert.alert('Share Error', 'Could not share voice note to WhatsApp.');
    }
  };

  const handleShareRecommendation = async () => {
    try {
      const shareMsg = `🌴 Highly recommend ${thread.contactName} (${thread.category}) in Bocas del Toro!\nArranged seamlessly with Spanish voice notes using PoquitoTalk.app 🇵🇦`;
      await Share.share({
        message: shareMsg,
        title: `Recommend ${thread.contactName}`,
      });
    } catch (e) {
      console.warn('Recommendation share error:', e);
    }
  };

  const handleImportIncomingVoiceNote = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsSharing(true);
        setTimeout(async () => {
          setIsSharing(false);
          const spanishText = "Hola, le confirmo que el técnico puede llegar en 20 minutos al muelle.";
          const englishText = await translateWithGemma(spanishText, 'es', 'en');

          const incomingMsg: ThreadMessage = {
            id: `msg_inc_${Date.now()}`,
            sender: 'SERVICE_PROVIDER',
            textEnglish: englishText,
            textSpanish: spanishText,
            timestamp: Date.now(),
          };

          const updatedThread: ConversationThread = {
            ...thread,
            lastUpdated: Date.now(),
            messages: [...thread.messages, incomingMsg],
          };

          onUpdateThread(updatedThread);
        }, 1500);
      }
    } catch (e) {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.onBackground} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.contactName}>{thread.contactName}</Text>
            <Text style={styles.categoryBadge}>{thread.category}</Text>
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
              <FontAwesome5 name="whatsapp" size={16} color={Colors.whatsapp} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages Timeline */}
        <ScrollView contentContainerStyle={styles.timeline} ref={(ref) => ref?.scrollToEnd({ animated: true })}>
          {(thread?.messages || []).map((msg) => {
            const isExpat = msg.sender === 'EXPAT';
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
                    {isExpat ? '🇺🇸 You (Expat)' : `🇵🇦 ${thread.contactName}`}
                  </Text>

                  <Text style={styles.spanishText}>{msg.textSpanish}</Text>
                  <Text style={styles.englishText}>{msg.textEnglish}</Text>

                  {/* Actions for Expat Outgoing Voice Note */}
                  {isExpat && (
                    <View style={styles.msgActionsRow}>
                      <TouchableOpacity
                        style={styles.msgActionBtn}
                        onPress={() => handlePlayMessageAudio(msg)}
                      >
                        <Ionicons
                          name={playingMsgId === msg.id ? 'pause-circle' : 'play-circle'}
                          size={18}
                          color={Colors.secondary}
                        />
                        <Text style={styles.msgActionText}>Listen</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.msgWhatsAppBtn}
                        onPress={() => handleShareToWhatsApp(msg)}
                      >
                        <FontAwesome5 name="whatsapp" size={14} color="#FFF" />
                        <Text style={styles.msgWhatsAppText}>Send Voice Note</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  categoryBadge: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#E8F5E9',
  },
  timeline: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  bubbleContainer: {
    marginBottom: 10,
    maxWidth: '88%',
  },
  expatBubbleAlign: {
    alignSelf: 'flex-end',
  },
  providerBubbleAlign: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
  },
  expatBubble: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderColor: Colors.secondaryContainer,
  },
  providerBubble: {
    backgroundColor: Colors.surfaceContainer,
    borderColor: Colors.cardBorder,
  },
  msgSenderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.outline,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  spanishText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 4,
  },
  englishText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  msgActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  msgActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  msgActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  msgWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.whatsapp,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  msgWhatsAppText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
