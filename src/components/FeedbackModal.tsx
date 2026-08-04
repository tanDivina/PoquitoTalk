import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const [category, setCategory] = useState<'Feature Request' | 'Bug Report' | 'Praise' | 'General Feedback'>('Feature Request');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Required', 'Please enter your feedback comments before submitting.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      _subject: `[PoquitoTalk App Feedback] ${category} (${rating}★)`,
      Category: category,
      Rating: `${rating} Out of 5 Stars`,
      Comment: comment.trim(),
      Email: email.trim() || 'Anonymous Expat User',
      Platform: Platform.OS,
      SubmittedAt: new Date().toISOString(),
      _captcha: 'false',
    };

    try {
      await fetch('https://formsubmit.co/ajax/support@hero-apps.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('FormSubmit dispatch error:', e);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleResetAndClose = () => {
    setComment('');
    setEmail('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <Text style={styles.title}>Send Feedback</Text>
              <Text style={styles.subtitle}>Help us shape PoquitoTalk for Bocas del Toro!</Text>
            </View>
            <TouchableOpacity onPress={handleResetAndClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.onBackground} />
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.whatsapp} />
              </View>
              <Text style={styles.successTitle}>Thank You!</Text>
              <Text style={styles.successMessage}>
                Your feedback has been sent directly to support@hero-apps.com. We review every submission!
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleResetAndClose}>
                <Text style={styles.doneBtnText}>Back to App</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.body}>
              {/* Category selector with Crisp Vector SVG Icons */}
              <Text style={styles.label}>FEEDBACK CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {[
                  { label: 'Feature Request', icon: 'bulb-outline', value: 'Feature Request' },
                  { label: 'Bug Report', icon: 'bug-outline', value: 'Bug Report' },
                  { label: 'Praise', icon: 'thumbs-up-outline', value: 'Praise' },
                  { label: 'General', icon: 'chatbubble-ellipses-outline', value: 'General Feedback' },
                ].map((cat) => {
                  const active = category === cat.value;
                  return (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryBtn,
                        active && styles.categoryBtnActive,
                      ]}
                      onPress={() => setCategory(cat.value as any)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={16}
                        color={active ? Colors.secondary : Colors.outline}
                      />
                      <Text
                        style={[
                          styles.categoryBtnText,
                          active && styles.categoryBtnTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Star Rating */}
              <Text style={styles.label}>OVERALL RATING</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={28}
                      color={star <= rating ? '#FFB800' : Colors.outline}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comments Input */}
              <Text style={styles.label}>YOUR COMMENTS</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Tell us what feature you'd love or what issue you encountered..."
                placeholderTextColor={Colors.outline}
                value={comment}
                onChangeText={setComment}
              />

              {/* Email Input */}
              <Text style={styles.label}>YOUR EMAIL (OPTIONAL FOR REPLIES)</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.outline}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFF" />
                    <Text style={styles.submitBtnText}>Submit Feedback</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surfaceContainerLowest || '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerTitleBox: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    gap: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  categoryBtnActive: {
    backgroundColor: Colors.secondaryContainer,
    borderColor: Colors.secondary,
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  categoryBtnTextActive: {
    color: Colors.secondary,
    fontWeight: '800',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textArea: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 12,
    minHeight: 85,
    textAlignVertical: 'top',
    fontSize: 14,
    color: Colors.onBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  input: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  successBadge: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  successMessage: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  doneBtn: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 12,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
