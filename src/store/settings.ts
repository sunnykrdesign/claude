/**
 * User preferences. Small enough to live in the `meta` table as JSON, and
 * hydrated once at launch so the first paint already has the right theme.
 */

import { create } from 'zustand';

import { getDb, getMeta, setMeta } from '../data/db';

export type ThemePreference = 'system' | 'light' | 'dark';

const SETTINGS_KEY = 'settings';

export type ReminderTime = { hour: number; minute: number };

export type SettingsSnapshot = {
  themePreference: ThemePreference;
  reminderEnabled: boolean;
  reminderTime: ReminderTime;
};

export const DEFAULT_SETTINGS: SettingsSnapshot = {
  themePreference: 'system',
  reminderEnabled: false,
  reminderTime: { hour: 19, minute: 30 },
};

type SettingsState = SettingsSnapshot & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  setReminderEnabled: (enabled: boolean) => Promise<void>;
  setReminderTime: (time: ReminderTime) => Promise<void>;
};

function coerce(value: unknown): SettingsSnapshot {
  if (typeof value !== 'object' || value === null) return DEFAULT_SETTINGS;
  const record = value as Record<string, unknown>;
  const preference = record.themePreference;
  const time = record.reminderTime as Partial<ReminderTime> | undefined;

  return {
    themePreference:
      preference === 'light' || preference === 'dark' || preference === 'system'
        ? preference
        : DEFAULT_SETTINGS.themePreference,
    reminderEnabled: record.reminderEnabled === true,
    reminderTime: {
      hour: clamp(Number(time?.hour), 0, 23, DEFAULT_SETTINGS.reminderTime.hour),
      minute: clamp(Number(time?.minute), 0, 59, DEFAULT_SETTINGS.reminderTime.minute),
    },
  };
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export const useSettings = create<SettingsState>((set, get) => {
  async function persist(next: SettingsSnapshot): Promise<void> {
    set(next);
    const db = await getDb();
    await setMeta(db, SETTINGS_KEY, JSON.stringify(next));
  }

  function snapshot(): SettingsSnapshot {
    const { themePreference, reminderEnabled, reminderTime } = get();
    return { themePreference, reminderEnabled, reminderTime };
  }

  return {
    ...DEFAULT_SETTINGS,
    hydrated: false,

    async hydrate() {
      try {
        const db = await getDb();
        const raw = await getMeta(db, SETTINGS_KEY);
        set({ ...coerce(raw ? JSON.parse(raw) : null), hydrated: true });
      } catch {
        // A settings read failure must not stop the app starting.
        set({ ...DEFAULT_SETTINGS, hydrated: true });
      }
    },

    setThemePreference(themePreference) {
      return persist({ ...snapshot(), themePreference });
    },

    setReminderEnabled(reminderEnabled) {
      return persist({ ...snapshot(), reminderEnabled });
    },

    setReminderTime(reminderTime) {
      return persist({ ...snapshot(), reminderTime });
    },
  };
});
