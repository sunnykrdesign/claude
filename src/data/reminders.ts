/**
 * The one notification the app is allowed to send: an optional daily nudge to
 * revise. Everything here fails soft — notifications are unavailable in some
 * clients and may be denied at the OS level, and neither is an error the user
 * needs to see as a crash.
 */

import * as Notifications from 'expo-notifications';

import type { ReminderTime } from '../store/settings';

const CHANNEL_ID = 'daily-revision';

export type ReminderResult =
  | { ok: true }
  | { ok: false; reason: 'denied' | 'unavailable' };

async function ensureAndroidChannel(): Promise<void> {
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily revision',
      importance: Notifications.AndroidImportance.DEFAULT,
      // A revision reminder should never interrupt anything.
      vibrationPattern: [0, 120],
      sound: null,
    });
  } catch {
    // Not Android, or channels unsupported — the schedule call still works.
  }
}

export async function scheduleDailyReminder(time: ReminderTime): Promise<ReminderResult> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    const granted =
      existing.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return { ok: false, reason: 'denied' };

    await ensureAndroidChannel();
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to revise',
        body: 'A few cards now keeps the streak going.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
        channelId: CHANNEL_ID,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Nothing scheduled, or notifications unavailable. Either way, done.
  }
}
