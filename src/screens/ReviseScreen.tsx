/**
 * Revise — the deck picker.
 *
 * This is the screen that makes the app worth having over a PDF, so it leads
 * with the two things that keep people coming back: what is due, and the streak.
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/EmptyState';
import { Screen, ScreenHeader } from '../components/Screen';
import { dayKey, isDue, liveStreak } from '../data/leitner';
import { deckProgress } from '../data/session';
import type { Deck, RootStackParamList, TabParamList } from '../navigation/types';
import { useLibrary } from '../store/library';
import { categoryTint } from '../theme/categories';
import { MIN_TARGET } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { CATEGORIES } from '../types/term';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Revise'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ReviseScreen({ navigation }: Props) {
  const { color, radius, space, scheme } = useTheme();

  const index = useLibrary((state) => state.index);
  const revision = useLibrary((state) => state.revision);
  const bookmarks = useLibrary((state) => state.bookmarks);
  const streak = useLibrary((state) => state.streak);

  const now = Date.now();

  const dueCount = useMemo(
    () => Object.values(revision).filter((state) => isDue(state, now)).length,
    [revision, now],
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const term of index) {
      for (const category of term.categories) {
        const bucket = map.get(category);
        if (bucket) bucket.push(term.id);
        else map.set(category, [term.id]);
      }
    }
    return map;
  }, [index]);

  const overall = useMemo(
    () => deckProgress(index.map((term) => term.id), revision, now),
    [index, revision, now],
  );

  const start = (deck: Deck) => navigation.navigate('ReviseSession', { deck });
  const current = liveStreak(streak, dayKey(now));

  return (
    <Screen>
      <ScreenHeader title="Revise" subtitle="Flashcards with spaced repetition" />

      <ScrollView contentContainerStyle={{ paddingBottom: space.huge, gap: space.xl }}>
        <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
          <View
            style={{
              flexDirection: 'row',
              gap: space.md,
            }}
          >
            <Stat label="Day streak" value={String(current)} caption={`Best ${streak.longest}`} />
            <Stat label="Due now" value={String(dueCount)} caption="Cards ready" />
            <Stat
              label="Learned"
              value={String(overall.learned)}
              caption={`of ${overall.total}`}
            />
          </View>

          <Button
            label={dueCount > 0 ? `Review ${dueCount} due` : 'Start a session'}
            onPress={() => start(dueCount > 0 ? { kind: 'due' } : { kind: 'all' })}
          />
        </View>

        <View style={{ gap: space.md }}>
          <AppText variant="label" tone="faint" style={{ paddingHorizontal: space.lg }}>
            Your decks
          </AppText>
          <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
            <DeckCard
              title="Saved terms"
              subtitle={
                bookmarks.length > 0
                  ? `${bookmarks.length} saved`
                  : 'Save terms to build your own deck'
              }
              disabled={bookmarks.length === 0}
              progress={deckProgress(bookmarks, revision, now)}
              onPress={() => start({ kind: 'saved' })}
            />
            <DeckCard
              title="Everything"
              subtitle={`${index.length} terms`}
              progress={overall}
              onPress={() => start({ kind: 'all' })}
            />
          </View>
        </View>

        <View style={{ gap: space.md }}>
          <AppText variant="label" tone="faint" style={{ paddingHorizontal: space.lg }}>
            By category
          </AppText>
          <View style={{ paddingHorizontal: space.lg, gap: space.sm }}>
            {CATEGORIES.map((category) => {
              const ids = byCategory.get(category) ?? [];
              if (ids.length === 0) return null;
              const progress = deckProgress(ids, revision, now);
              const tint = categoryTint(category, scheme);

              return (
                <Pressable
                  key={category}
                  onPress={() => start({ kind: 'category', category })}
                  accessibilityRole="button"
                  accessibilityLabel={`${category}. ${progress.learned} of ${progress.total} learned. Starts a revision session`}
                  style={({ pressed }) => ({
                    minHeight: MIN_TARGET,
                    backgroundColor: pressed ? color.surfaceMuted : color.surface,
                    borderColor: color.border,
                    borderWidth: 1,
                    borderRadius: radius.md,
                    padding: space.base,
                    gap: space.sm,
                  })}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: space.sm,
                    }}
                  >
                    <AppText variant="small" weight="medium" style={{ flex: 1 }}>
                      {category}
                    </AppText>
                    <AppText variant="caption" tone="faint">
                      {progress.learned}/{progress.total}
                    </AppText>
                  </View>
                  <ProgressBar
                    value={progress.total === 0 ? 0 : progress.learned / progress.total}
                    tint={tint.text}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value, caption }: { label: string; value: string; caption: string }) {
  const { color, radius, space } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}. ${caption}`}
      style={{
        flex: 1,
        backgroundColor: color.surface,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: space.md,
        gap: space.xxs,
      }}
    >
      <AppText variant="label" tone="faint">
        {label}
      </AppText>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" tone="faint">
        {caption}
      </AppText>
    </View>
  );
}

function DeckCard({
  title,
  subtitle,
  progress,
  onPress,
  disabled = false,
}: {
  title: string;
  subtitle: string;
  progress: { total: number; learned: number };
  onPress: () => void;
  disabled?: boolean;
}) {
  const { color, radius, space } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={`${title}. ${subtitle}. ${progress.learned} of ${progress.total} learned`}
      style={({ pressed }) => ({
        minHeight: MIN_TARGET,
        opacity: disabled ? 0.5 : 1,
        backgroundColor: pressed ? color.surfaceMuted : color.surface,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: space.base,
        gap: space.sm,
      })}
    >
      <AppText variant="body" weight="semibold">
        {title}
      </AppText>
      <AppText variant="caption" tone="muted">
        {subtitle}
      </AppText>
      <ProgressBar value={progress.total === 0 ? 0 : progress.learned / progress.total} />
    </Pressable>
  );
}

/** Progress is always paired with the numbers beside it, never a bar alone. */
function ProgressBar({ value, tint }: { value: number; tint?: string }) {
  const { color, radius } = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        height: 6,
        borderRadius: radius.pill,
        backgroundColor: color.surfaceMuted,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`,
          height: '100%',
          backgroundColor: tint ?? color.accent,
        }}
      />
    </View>
  );
}
