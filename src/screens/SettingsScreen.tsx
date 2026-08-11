/**
 * Settings.
 *
 * Also the honest place to say what the app collects: nothing leaves the
 * device. The no-result log is shown here because it belongs to the user, and
 * it doubles as the list of terms worth adding next.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';

import { AppText } from '../components/AppText';
import { ToggleChip } from '../components/Chip';
import { Section } from '../components/DefinitionBlock';
import { Button } from '../components/EmptyState';
import { Screen, ScreenHeader } from '../components/Screen';
import { useToast } from '../components/Toast';
import { CONTENT_MANIFEST_URL } from '../config';
import { isFtsAvailable } from '../data/db';
import { MissedSearch, clearMissedSearches, listMissedSearches } from '../data/history';
import { cancelDailyReminder, scheduleDailyReminder } from '../data/reminders';
import { checkForContentUpdate, getLastCheckedAt } from '../data/updates';
import type { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../store/library';
import { ReminderTime, ThemePreference, useSettings } from '../store/settings';
import { MIN_TARGET } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Follow system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const REMINDER_TIMES: { label: string; time: ReminderTime }[] = [
  { label: '8:00', time: { hour: 8, minute: 0 } },
  { label: '13:00', time: { hour: 13, minute: 0 } },
  { label: '19:30', time: { hour: 19, minute: 30 } },
  { label: '21:00', time: { hour: 21, minute: 0 } },
];

export function SettingsScreen({ navigation }: Props) {
  const { color, space, radius } = useTheme();

  const themePreference = useSettings((state) => state.themePreference);
  const setThemePreference = useSettings((state) => state.setThemePreference);
  const reminderEnabled = useSettings((state) => state.reminderEnabled);
  const setReminderEnabled = useSettings((state) => state.setReminderEnabled);
  const reminderTime = useSettings((state) => state.reminderTime);
  const setReminderTime = useSettings((state) => state.setReminderTime);

  const termCount = useLibrary((state) => state.index.length);
  const contentVersion = useLibrary((state) => state.contentVersion);
  const reloadIndex = useLibrary((state) => state.reloadIndex);
  const resetProgress = useLibrary((state) => state.resetProgress);
  const showToast = useToast((state) => state.show);

  const [missed, setMissed] = useState<MissedSearch[]>([]);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    void listMissedSearches(20).then(setMissed);
    void getLastCheckedAt().then(setLastChecked);
  }, []);

  const onToggleReminder = useCallback(
    async (next: boolean) => {
      if (!next) {
        await setReminderEnabled(false);
        await cancelDailyReminder();
        showToast('Reminder off.');
        return;
      }

      const result = await scheduleDailyReminder(reminderTime);
      if (result.ok) {
        await setReminderEnabled(true);
        showToast('Reminder on.');
        return;
      }

      await setReminderEnabled(false);
      Alert.alert(
        result.reason === 'denied' ? 'Notifications are off' : 'Not available here',
        result.reason === 'denied'
          ? 'Turn on notifications for this app in your device settings, then try again.'
          : 'This client cannot schedule notifications. A development build supports them.',
      );
    },
    [reminderTime, setReminderEnabled, showToast],
  );

  const onPickTime = useCallback(
    async (time: ReminderTime) => {
      await setReminderTime(time);
      if (reminderEnabled) {
        await scheduleDailyReminder(time);
        showToast('Reminder updated.');
      }
    },
    [reminderEnabled, setReminderTime, showToast],
  );

  const onCheckForUpdates = useCallback(async () => {
    setChecking(true);
    const result = await checkForContentUpdate(async () => {
      await reloadIndex();
    });
    setChecking(false);
    setLastChecked(await getLastCheckedAt());

    switch (result.status) {
      case 'updated':
        showToast(`Updated to ${result.termCount} terms.`);
        break;
      case 'up-to-date':
        showToast('Already up to date.');
        break;
      case 'disabled':
        showToast('No update source configured.');
        break;
      case 'failed':
        showToast('Could not check right now.');
        break;
    }
  }, [reloadIndex, showToast]);

  const confirmReset = useCallback(() => {
    Alert.alert(
      'Reset revision progress?',
      'Leitner boxes, due dates and your streak are cleared. Saved terms are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void resetProgress();
            showToast('Progress reset.');
          },
        },
      ],
    );
  }, [resetProgress, showToast]);

  return (
    <Screen edges={['left', 'right']}>
      <ScreenHeader
        title="Settings"
        action={{ label: 'Done', onPress: () => navigation.goBack() }}
      />

      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xxl, paddingBottom: space.huge }}>
        <Section label="Appearance">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {THEME_OPTIONS.map((option) => (
              <ToggleChip
                key={option.value}
                label={option.label}
                selected={themePreference === option.value}
                onPress={() => void setThemePreference(option.value)}
              />
            ))}
          </View>
        </Section>

        <Section label="Daily revision reminder">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: space.md,
              minHeight: MIN_TARGET,
            }}
          >
            <AppText variant="small" tone="muted" style={{ flex: 1 }}>
              One notification a day. The only one the app sends.
            </AppText>
            <Switch
              value={reminderEnabled}
              onValueChange={(next) => void onToggleReminder(next)}
              accessibilityLabel="Daily revision reminder"
            />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {REMINDER_TIMES.map((option) => (
              <ToggleChip
                key={option.label}
                label={option.label}
                selected={
                  reminderTime.hour === option.time.hour &&
                  reminderTime.minute === option.time.minute
                }
                onPress={() => void onPickTime(option.time)}
              />
            ))}
          </View>
        </Section>

        <Section label="Content">
          <View
            style={{
              backgroundColor: color.surface,
              borderColor: color.border,
              borderWidth: 1,
              borderRadius: radius.md,
              padding: space.base,
              gap: space.xs,
            }}
          >
            <Row label="Terms" value={String(termCount)} />
            <Row label="Content version" value={String(contentVersion)} />
            <Row label="Search index" value={isFtsAvailable() ? 'Full text' : 'Fuzzy only'} />
            <Row
              label="Last checked"
              value={
                CONTENT_MANIFEST_URL == null
                  ? 'Updates off'
                  : lastChecked
                    ? new Date(lastChecked).toLocaleDateString()
                    : 'Never'
              }
            />
          </View>
          <Button
            label={checking ? 'Checking…' : 'Check for new terms'}
            variant="quiet"
            onPress={() => void onCheckForUpdates()}
          />
        </Section>

        <Section
          label="Searches with no result"
          trailing={
            missed.length > 0 ? (
              <Pressable
                onPress={() => {
                  void clearMissedSearches();
                  setMissed([]);
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Clear the no-result log"
              >
                <AppText variant="caption" tone="accent" weight="medium">
                  Clear
                </AppText>
              </Pressable>
            ) : undefined
          }
        >
          {missed.length === 0 ? (
            <AppText variant="small" tone="muted">
              Nothing yet. When a search finds nothing, it is logged here so you know what is
              missing.
            </AppText>
          ) : (
            <View style={{ gap: space.sm }}>
              {missed.map((entry) => (
                <View
                  key={entry.query}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}
                >
                  <AppText variant="small" style={{ flex: 1 }}>
                    {entry.query}
                  </AppText>
                  <AppText variant="caption" tone="faint">
                    {entry.hits}×
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </Section>

        <Section label="Progress">
          <Button label="Reset revision progress" variant="danger" onPress={confirmReset} />
        </Section>

        <Section label="About">
          <AppText variant="small" tone="muted">
            Every definition here is written from scratch. Source links point at where to read
            more, not at text that was copied.
          </AppText>
          <AppText variant="small" tone="muted">
            Searches, bookmarks and revision progress stay on this device. Nothing is uploaded and
            there is no account.
          </AppText>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { space } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}
    >
      <AppText variant="small" tone="muted">
        {label}
      </AppText>
      <AppText variant="small" weight="medium">
        {value}
      </AppText>
    </View>
  );
}
