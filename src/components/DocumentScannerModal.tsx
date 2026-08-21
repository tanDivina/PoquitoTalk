import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../theme/colors';
import {
  scanDocumentOrBill,
  SAMPLE_DOCUMENTS,
  DocumentScanResult,
} from '../services/gemma';

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
  const [expandedQIdx, setExpandedQIdx] = useState<number | null>(0);
  const [selectedLupaIdx, setSelectedLupaIdx] = useState<number | null>(null);
  const [showCurrencyTooltip, setShowCurrencyTooltip] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location) {
      return new URLSearchParams(window.location.search).get('tooltip') === 'true';
    }
    return false;
  });

  const getLupaContextualTip = (label: string, docType: string): string => {
    const l = label.toLowerCase();
    if (l.includes('nis') || l.includes('cuenta')) {
      return 'The 7-digit NIS (Número de Identificación de Suministro) is your unique meter ID. Type this exact number when paying via Punto Pago kiosks or online banking.';
    }
    if (l.includes('kwh') || l.includes('consumo')) {
      return 'In Bocas del Toro, electricity tiers scale rapidly after 300 kWh. Turning off A/C mini-splits when leaving the house reduces this charge by up to 60%.';
    }
    if (l.includes('vencimiento') || l.includes('fecha')) {
      return 'Payment due date. Naturgy disconnects meters after 2 unpaid cycles, requiring a $15-$25 reconnection fee at the Calle E office.';
    }
    if (l.includes('cargo fijo')) {
      return 'Standard base grid connection charge applied by ASEP Panama regardless of monthly usage.';
    }
    if (l.includes('alquiler') || l.includes('depósito')) {
      return 'Always keep WhatsApp screenshots of bank transfers (ACH or Yappy) as proof of payment for your landlord in Bocas.';
    }
    return `Specific line item for ${docType}. Verify that the amount matches your agreed contract or metered reading.`;
  };

  // Initialize with first sample on open
  React.useEffect(() => {
    if (visible && !result) {
      handleScanSample('naturgy_power');
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
        // Process uploaded document
        const scanned = await scanDocumentOrBill('naturgy electricity bill upload');
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
                <Ionicons name="scan-circle" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Document & Bill Scanner</Text>
                <Text style={styles.modalSubtitle}>Translate electricity, water & menus</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Primary Instant Scan / Upload Action */}
            <TouchableOpacity style={styles.uploadBtn} onPress={handlePickDocument} activeOpacity={0.85}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="camera" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.uploadTextBox}>
                <Text style={styles.uploadBtnTitle}>Scan Document, Bill or Menu</Text>
                <Text style={styles.uploadBtnSubtitle}>Take photo or upload PDF/JPG • Auto-detects content</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>

            {/* Interactive Sample Document Selector */}
            <View style={styles.sampleHeaderRow}>
              <Ionicons name="document-text-outline" size={14} color={Colors.primary} />
              <Text style={styles.sectionLabel}>OR TRY AN INTERACTIVE SAMPLE</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.samplesRow}>
              {SAMPLE_DOCUMENTS.map((d: any) => {
                const isSelected = selectedDocId === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.sampleChip, isSelected && styles.sampleChipActive]}
                    onPress={() => handleScanSample(d.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={d.id.includes('power') ? 'flash-outline' : d.id.includes('water') ? 'water-outline' : d.id.includes('menu') ? 'restaurant-outline' : 'medkit-outline'}
                      size={14}
                      color={isSelected ? '#FFFFFF' : Colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.sampleDocTitle, isSelected && styles.sampleDocTitleActive]}>
                      {d.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {isScanning ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Scanning & analyzing document line items...</Text>
              </View>
            ) : result ? (
              <View style={styles.resultContainer}>
                {/* Sample Document Notice Banner */}
                <View style={styles.sampleNoticeBanner}>
                  <Ionicons name="information-circle-outline" size={14} color={Colors.primary} />
                  <Text style={styles.sampleNoticeText}>
                    <Text style={styles.sampleNoticeBold}>SAMPLE PREVIEW:</Text> Interactive breakdown of a real Panamanian document
                  </Text>
                </View>

                {/* Document Type & Total Badge */}
                <View style={styles.heroCard}>
                  <View style={styles.docBadgeRow}>
                    <Text style={styles.docBadgeText}>{result.badge}</Text>
                  </View>
                  <Text style={styles.docTitleText}>{result.docType}</Text>
                  
                  <View style={styles.totalBox}>
                    <View style={styles.totalLabelGroup}>
                      <Text style={styles.totalLabel}>TOTAL / HIGHLIGHT:</Text>
                      <TouchableOpacity
                        style={styles.currencyBadgeBtn}
                        onPress={() => setShowCurrencyTooltip(!showCurrencyTooltip)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="information-circle" size={13} color={Colors.primary} />
                        <Text style={styles.currencyBadgeText}>B/. = $ USD</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.totalValue}>{result.dueOrTotal}</Text>
                  </View>

                  {/* Tap-to-Reveal Panama Currency Parity Tooltip */}
                  {showCurrencyTooltip && (
                    <TouchableOpacity
                      style={styles.currencyTooltip}
                      onPress={() => setShowCurrencyTooltip(false)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.tooltipHeaderRow}>
                        <View style={styles.tooltipIconBubble}>
                          <Ionicons name="swap-horizontal" size={13} color={Colors.primary} />
                        </View>
                        <Text style={styles.tooltipTitle}>Panama 1:1 Currency Parity</Text>
                      </View>
                      <Text style={styles.tooltipBody}>
                        In Panama, <Text style={styles.tooltipBold}>B/. (Balboas)</Text> and <Text style={styles.tooltipBold}>$ (USD)</Text> represent the exact same 1:1 value. Both symbols are used interchangeably across Naturgy bills, bank accounts, and receipts.
                      </Text>
                      <Text style={styles.tooltipDismiss}>Tap to close</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Plain English Summary */}
                <View style={styles.summaryCard}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="information-circle" size={16} color={Colors.primary} />
                    <Text style={styles.cardHeading}>PLAIN ENGLISH EXPLANATION</Text>
                  </View>
                  <Text style={styles.summaryText}>{result.englishSummary}</Text>
                </View>

                {/* Key Line Items Breakdown with Itemized Explainer */}
                <View style={styles.detailsSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="list-outline" size={14} color={Colors.primary} />
                    <Text style={styles.sectionLabel}>ITEMIZED LINE BREAKDOWN</Text>
                  </View>
                  <Text style={styles.lupaHint}>
                    Tap any line below to see what it means:
                  </Text>
                  
                  {result.keyDetails.map((item, idx) => {
                    const isInspected = selectedLupaIdx === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.detailRow,
                          isInspected && styles.detailRowInspected,
                        ]}
                        onPress={() => setSelectedLupaIdx(isInspected ? null : idx)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.detailRowTop}>
                          <View style={styles.detailLeft}>
                            <View style={styles.lupaLabelGroup}>
                              <Ionicons
                                name={isInspected ? "chevron-down-circle" : "chevron-forward-circle-outline"}
                                size={14}
                                color={isInspected ? Colors.primary : Colors.outline}
                              />
                              <Text style={[styles.detailSpanishLabel, isInspected && styles.detailSpanishLabelInspected]}>
                                {item.label}
                              </Text>
                            </View>
                            <Text style={styles.detailEnglishMeaning}>{item.english}</Text>
                          </View>
                          <Text style={[styles.detailValue, isInspected && styles.detailValueInspected]}>
                            {item.value}
                          </Text>
                        </View>

                        {isInspected && (
                          <View style={styles.lupaExplainerBox}>
                            <View style={styles.lupaBadgeRow}>
                              <Text style={styles.lupaBadgeText}>EXPLANATION & GUIDANCE</Text>
                            </View>
                            <Text style={styles.lupaDescription}>
                              {getLupaContextualTip(item.label, result.docType)}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Useful Questions to Ask (Stacked Flashcard Deck) */}
                {result.suggestedQuestions && result.suggestedQuestions.length > 0 && (
                  <View style={styles.questionsSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Ionicons name="chatbubbles-outline" size={13} color={Colors.tertiary} />
                      <Text style={styles.sectionLabel}>USEFUL SPANISH INQUIRIES</Text>
                    </View>
                    
                    <View style={styles.stackedQuestionsWrapper}>
                      {result.suggestedQuestions.map((q, idx) => {
                        const isExpanded = expandedQIdx === idx;
                        const isPlaying = playingQIdx === idx;
                        const isCopied = copiedQIdx === idx;

                        return (
                          <View
                            key={idx}
                            style={[
                              styles.questionCard,
                              {
                                marginTop: idx > 0 ? -12 : 0,
                                zIndex: isExpanded ? 30 : result.suggestedQuestions.length - idx,
                                elevation: isExpanded ? 6 : result.suggestedQuestions.length - idx,
                                borderWidth: isExpanded ? 1.5 : 1,
                                borderColor: isExpanded ? Colors.tertiary : '#E5E2DA',
                              },
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.qHeaderRow}
                              onPress={() => setExpandedQIdx(isExpanded ? null : idx)}
                              activeOpacity={0.8}
                            >
                              <View style={styles.qIndexBubble}>
                                <Text style={styles.qIndexText}>0{idx + 1}</Text>
                              </View>
                              <Text style={styles.qEnglishSummaryText} numberOfLines={isExpanded ? undefined : 1}>
                                {q.english}
                              </Text>
                              <Ionicons
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={isExpanded ? Colors.primary : Colors.outline}
                              />
                            </TouchableOpacity>

                            {isExpanded && (
                              <View style={styles.qExpandedBody}>
                                <Text style={styles.qSpanishText}>"{q.spanish}"</Text>

                                <View style={styles.qActionRow}>
                                  <TouchableOpacity
                                    style={[styles.qActionBtn, styles.qPlayBtn]}
                                    onPress={() => handlePlayQuestionAudio(q.spanish, idx)}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons
                                      name={isPlaying ? 'stop-circle' : 'volume-high'}
                                      size={14}
                                      color={Colors.tertiary}
                                    />
                                    <Text style={styles.qPlayText}>{isPlaying ? 'Stop' : 'Listen'}</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={[styles.qActionBtn, styles.qCopyBtn]}
                                    onPress={() => handleCopyQuestion(q.spanish, idx)}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons
                                      name={isCopied ? 'checkmark' : 'copy-outline'}
                                      size={14}
                                      color={isCopied ? '#16A34A' : Colors.onSurfaceVariant}
                                    />
                                    <Text style={[styles.qCopyText, isCopied && { color: '#16A34A' }]}>
                                      {isCopied ? 'Copied' : 'Copy'}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
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
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
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
    color: Colors.outline,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    marginBottom: 16,
    gap: 14,
  },
  sampleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  samplesRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  sampleChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: Colors.primary,
  },
  sampleDocTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  sampleDocTitleActive: {
    color: '#166534',
    fontWeight: '800',
  },
  sampleNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  sampleNoticeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#166534',
  },
  sampleNoticeBold: {
    fontWeight: '800',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  uploadTextBox: {
    flex: 1,
  },
  uploadBtnTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.2,
  },
  uploadBtnSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  resultContainer: {
    gap: 14,
    paddingBottom: 24,
  },
  heroCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  docBadgeRow: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginBottom: 6,
  },
  docBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  docTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 10,
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.5,
  },
  currencyBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  currencyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  currencyTooltip: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.2,
    borderColor: '#86EFAC',
    gap: 6,
  },
  tooltipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tooltipIconBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  tooltipBody: {
    fontSize: 11.5,
    color: '#14532D',
    lineHeight: 16,
  },
  tooltipBold: {
    fontWeight: '800',
    color: '#166534',
  },
  tooltipDismiss: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'right',
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  summaryCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
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
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14532D',
    lineHeight: 19,
  },
  detailsSection: {
    gap: 8,
  },
  lupaHint: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailRow: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRowInspected: {
    borderColor: Colors.primary || '#059669',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    shadowColor: Colors.primary || '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  detailRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLeft: {
    flex: 1,
    marginRight: 10,
  },
  lupaLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailSpanishLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  detailSpanishLabelInspected: {
    color: '#14532D',
    fontWeight: '800',
  },
  detailEnglishMeaning: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  detailValueInspected: {
    color: '#15803D',
    fontSize: 14,
  },
  lupaExplainerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  lupaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lupaBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.6,
  },
  lupaDescription: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    lineHeight: 17,
  },
  questionsSection: {
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  stackedQuestionsWrapper: {
    marginTop: 8,
  },
  questionCard: {
    borderRadius: 18,
    backgroundColor: '#FAF9F6',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  qHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qIndexBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0ECE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5A5248',
  },
  qEnglishSummaryText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1B1C1A',
  },
  qExpandedBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EBE5DC',
  },
  qSpanishText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B1C1A',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  qActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  qActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  qPlayBtn: {
    backgroundColor: '#F2ECE4',
    borderWidth: 1,
    borderColor: '#E2D9CC',
  },
  qPlayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5A5248',
  },
  qCopyBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qCopyText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
});
