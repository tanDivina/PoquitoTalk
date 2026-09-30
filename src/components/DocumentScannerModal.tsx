import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../theme/colors';
import {
  scanDocumentOrBill,
  SAMPLE_DOCUMENTS,
  DocumentScanResult,
} from '../services/translation';

interface DocumentScannerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('naturgy_power');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<DocumentScanResult | null>(null);
  const [playingQIdx, setPlayingQIdx] = useState<number | null>(null);
  const [copiedQIdx, setCopiedQIdx] = useState<number | null>(null);

  useEffect(() => {
    if (visible && !result) {
      handleScanSample('naturgy_power');
    } else if (!visible) {
      Speech.stop();
      setPlayingQIdx(null);
    }
  }, [visible]);

  const handleScanSample = async (docId: string) => {
    setSelectedDocId(docId);
    setIsScanning(true);
    const scanned = await scanDocumentOrBill(docId);
    setResult(scanned);
    setIsScanning(false);
  };

  const handlePickDocument = async () => {
    try {
      const doc = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!doc.canceled && doc.assets && doc.assets.length > 0) {
        setIsScanning(true);
        const scanned = await scanDocumentOrBill('naturgy electricity bill photo upload');
        setResult(scanned);
        setIsScanning(false);
      }
    } catch (e) {
      console.warn('Doc picker error:', e);
    }
  };

  const handlePlayQuestionAudio = (questionText: string, index: number) => {
    if (playingQIdx === index) {
      Speech.stop();
      setPlayingQIdx(null);
      return;
    }

    setPlayingQIdx(index);
    Speech.speak(questionText, {
      language: 'es-PA',
      pitch: 0.95,
      rate: 0.88,
      onDone: () => setPlayingQIdx(null),
      onError: () => setPlayingQIdx(null),
    });
  };

  const handleCopyQuestion = async (questionText: string, index: number) => {
    await Clipboard.setStringAsync(questionText);
    setCopiedQIdx(index);
    setTimeout(() => setCopiedQIdx(null), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBubble}>
                <Ionicons name="document-text" size={20} color={Colors.tertiary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Bill & Document Scanner</Text>
                <Text style={styles.modalSubtitle}>Translate electricity, water & lease bills</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Primary Action: Photograph or Upload Bill */}
            <TouchableOpacity style={styles.uploadBtn} onPress={handlePickDocument} activeOpacity={0.85}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.uploadTextBox}>
                <Text style={styles.uploadBtnTitle}>Photograph or Upload Bill</Text>
                <Text style={styles.uploadBtnSubtitle}>Auto-extract NIS meter, total due & due dates</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#0F172A" />
            </TouchableOpacity>

            {/* Interactive Sample Selector */}
            <View style={styles.sampleHeaderRow}>
              <Ionicons name="receipt" size={14} color="#0F172A" />
              <Text style={styles.sectionLabel}>OR TRY A SAMPLE BILL</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.samplesRow}>
              {SAMPLE_DOCUMENTS.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <TouchableOpacity
                    key={doc.id}
                    style={[styles.sampleChip, isSelected && styles.sampleChipActive]}
                    onPress={() => handleScanSample(doc.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={doc.icon as any}
                      size={14}
                      color={isSelected ? '#FFFFFF' : '#0F172A'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.sampleDocTitle, isSelected && styles.sampleDocTitleActive]}>
                      {doc.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {isScanning ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#0F172A" />
                <Text style={styles.loadingText}>Analyzing utility bill & line items...</Text>
              </View>
            ) : result ? (
              <View style={styles.resultContainer}>
                {/* Bill Header & Total Due Card */}
                <View style={styles.heroCard}>
                  <View style={styles.docBadgeRow}>
                    <Text style={styles.docBadgeText}>{result.badge.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.docTitleText}>{result.docType}</Text>

                  <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>TOTAL AMOUNT DUE:</Text>
                    <Text style={styles.totalValue}>{result.dueOrTotal}</Text>
                  </View>
                </View>

                {/* Plain English Meaning */}
                <View style={styles.summaryCard}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="bulb" size={15} color="#0F172A" />
                    <Text style={styles.cardHeading}>PLAIN ENGLISH EXPLANATION</Text>
                  </View>
                  <Text style={styles.summaryText}>{result.englishSummary}</Text>
                </View>

                {/* Key Line Items Breakdown */}
                <View style={styles.detailsSection}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="list" size={14} color="#0F172A" />
                    <Text style={styles.sectionLabel}>KEY LINE ITEMS & CHARGES</Text>
                  </View>

                  {result.keyDetails.map((detail, idx) => (
                    <View key={idx} style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <Text style={styles.detailSpanishLabel}>{detail.label}</Text>
                        <Text style={styles.detailEnglishMeaning}>{detail.english}</Text>
                      </View>
                      <Text style={styles.detailValue}>{detail.value}</Text>
                    </View>
                  ))}
                </View>

                {/* 1-Tap Spanish Inquiry Questions */}
                {result.suggestedQuestions && result.suggestedQuestions.length > 0 && (
                  <View style={styles.questionsSection}>
                    <View style={styles.cardHeaderRow}>
                      <Ionicons name="chatbubbles" size={14} color="#0F172A" />
                      <Text style={styles.sectionLabel}>1-TAP QUESTIONS TO ASK</Text>
                    </View>

                    {result.suggestedQuestions.map((q, idx) => {
                      const isPlaying = playingQIdx === idx;
                      const isCopied = copiedQIdx === idx;
                      return (
                        <View key={idx} style={styles.questionCard}>
                          <Text style={styles.qEnglishText}>{q.english}</Text>
                          <Text style={styles.qSpanishText}>"{q.spanish}"</Text>

                          <View style={styles.qActionRow}>
                            <TouchableOpacity
                              style={[styles.qActionBtn, isPlaying && styles.qActionBtnActive]}
                              onPress={() => handlePlayQuestionAudio(q.spanish, idx)}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name={isPlaying ? 'stop-circle' : 'volume-high'}
                                size={14}
                                color={isPlaying ? '#FFFFFF' : '#0F172A'}
                              />
                              <Text style={[styles.qActionBtnText, isPlaying && styles.qActionBtnTextActive]}>
                                {isPlaying ? 'Stop' : 'Speak'}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.qActionBtn}
                              onPress={() => handleCopyQuestion(q.spanish, idx)}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name={isCopied ? 'checkmark' : 'copy'}
                                size={14}
                                color={isCopied ? '#059669' : '#0F172A'}
                              />
                              <Text style={[styles.qActionBtnText, isCopied && styles.qActionBtnTextSuccess]}>
                                {isCopied ? 'Copied' : 'Copy'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.6,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  uploadIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextBox: {
    flex: 1,
  },
  uploadBtnTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  uploadBtnSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  sampleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  samplesRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  sampleChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  sampleDocTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  sampleDocTitleActive: {
    color: '#FFFFFF',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  resultContainer: {
    gap: 12,
    paddingBottom: 24,
  },
  heroCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  docBadgeRow: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginBottom: 6,
  },
  docBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.4,
  },
  docTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  summaryCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 19,
  },
  detailsSection: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLeft: {
    flex: 1,
    marginRight: 10,
  },
  detailSpanishLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailEnglishMeaning: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  questionsSection: {
    marginTop: 4,
    gap: 10,
  },
  questionCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  qEnglishText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  qSpanishText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  qActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qActionBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  qActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  qActionBtnTextActive: {
    color: '#FFFFFF',
  },
  qActionBtnTextSuccess: {
    color: '#059669',
  },
});
