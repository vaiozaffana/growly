import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2E9DBB',
      });

      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2E9DBB',
      });
    }

    return true;
  }

  async scheduleHabitReminder(
    habitId: string,
    habitName: string,
    time: Date,
    repeatDaily: boolean = true
  ): Promise<string | null> {
    try {
      const trigger: Notifications.NotificationTriggerInput = repeatDaily
        ? {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: time.getHours(),
            minute: time.getMinutes(),
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: time,
          };

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌱 Waktunya untuk ' + habitName,
          body: 'Jangan lupa untuk melakukan kebiasaan baikmu hari ini!',
          data: { habitId, type: 'reminder' },
          sound: true,
        },
        trigger,
      });

      return identifier;
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      return null;
    }
  }

  async scheduleStreakCelebration(habitName: string, streakCount: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Streak Luar Biasa!',
        body: `Kamu sudah ${streakCount} hari berturut-turut melakukan ${habitName}! Terus pertahankan!`,
        data: { type: 'celebration' },
        sound: true,
      },
      trigger: null, 
    });
  }

  async sendCompletionConfirmation(habitName: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Kebiasaan Tercatat!',
        body: `${habitName} telah berhasil dicatat. Bagus sekali!`,
        data: { type: 'confirmation' },
        sound: true,
      },
      trigger: null,
    });
  }

  async sendReflectionPrompt(habitName: string, prompt: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💭 Waktunya Refleksi',
        body: prompt,
        data: { type: 'reflection', habitName },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3600, // 1 hour after completion
      },
    });
  }

  async sendMissedHabitReminder(habitName: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌿 Jangan Lupa!',
        body: `Kamu belum menyelesaikan ${habitName} hari ini. Masih ada waktu!`,
        data: { type: 'missed' },
        sound: true,
      },
      trigger: null,
    });
  }

  async cancelReminder(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
