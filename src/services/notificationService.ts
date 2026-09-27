import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure notification behavior when app is in foreground or background
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
} catch (e) {
  console.warn('[NotificationService] setNotificationHandler notice:', e);
}

let isChannelConfigured = false;
let activeReminderNotificationId: string | null = null;

/**
 * Configure high-priority Android notification channel for floating heads-up return banners
 */
export async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android' || isChannelConfigured) return;

  try {
    await Notifications.setNotificationChannelAsync('whatsapp-return', {
      name: 'Return to PoquitoTalk',
      description: 'Floating heads-up banner to easily return to PoquitoTalk after WhatsApp handoff',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#059669',
      enableVibrate: true,
      showBadge: false,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
    isChannelConfigured = true;
  } catch (err) {
    console.warn('[NotificationService] Failed to create Android notification channel:', err);
  }
}

/**
 * Request notification permissions (primarily Android 13+ POST_NOTIFICATIONS & iOS)
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (err) {
    console.warn('[NotificationService] Permission check error:', err);
    return false;
  }
}

interface ScheduleReturnOptions {
  recipientName?: string;
  isWalkieChannel?: boolean;
  walkieRoomId?: string | null;
  delaySeconds?: number;
}

/**
 * Schedules a high-priority heads-up return banner that drops over WhatsApp
 */
export async function scheduleReturnNotification({
  recipientName = 'Contractor',
  isWalkieChannel = false,
  walkieRoomId,
  delaySeconds = 12,
}: ScheduleReturnOptions): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    await setupAndroidNotificationChannel();
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Cancel any existing active reminder
    if (activeReminderNotificationId) {
      await cancelReturnNotification();
    }

    const title = isWalkieChannel
      ? '🦜 PoquitoTalk • Live Channel Active'
      : '🦜 PoquitoTalk • Return to Chat';

    const body = isWalkieChannel
      ? `Capitán ${recipientName} is on the link! Tap to return to your live stream.`
      : `Tap here to return to PoquitoTalk for automatic translation.`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: '#059669',
        data: {
          type: 'whatsapp_return',
          recipientName,
          isWalkieChannel,
          walkieRoomId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
        channelId: 'whatsapp-return',
      },
    });

    activeReminderNotificationId = notificationId;
    return notificationId;
  } catch (err) {
    console.warn('[NotificationService] Failed to schedule return notification:', err);
    return null;
  }
}

/**
 * Cancels any pending return notification once the user comes back to the app
 */
export async function cancelReturnNotification(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    if (activeReminderNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(activeReminderNotificationId);
      activeReminderNotificationId = null;
    }
  } catch (err) {
    console.warn('[NotificationService] Failed to cancel return notification:', err);
  }
}
