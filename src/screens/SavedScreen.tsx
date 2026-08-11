/**
 * Saved — bookmarked terms, grouped by category.
 *
 * Rows swipe away, and the same removal is exposed as an accessibility action
 * so it is reachable without a gesture.
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef } from 'react';
import { Alert, SectionList, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { Divider, Screen, ScreenHeader } from '../components/Screen';
import { TermRow } from '../components/TermRow';
import { useToast } from '../components/Toast';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { useLibrary } from '../store/library';
import { useTheme } from '../theme/useTheme';
import { CATEGORIES, TermSummary } from '../types/term';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Saved'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SavedScreen({ navigation }: Props) {
  const { color, space } = useTheme();

  const bookmarks = useLibrary((state) => state.bookmarks);
  const byId = useLibrary((state) => state.byId);
  const toggleBookmark = useLibrary((state) => state.toggleBookmark);
  const clearBookmarks = useLibrary((state) => state.clearBookmarks);
  const showToast = useToast((state) => state.show);

  const sections = useMemo(() => {
    const saved = bookmarks
      .map((id) => byId[id])
      .filter((term): term is TermSummary => term != null);

    // Group by a term's first category, in taxonomy order rather than
    // alphabetical, so the grouping matches Browse.
    const grouped = new Map<string, TermSummary[]>();
    for (const term of saved) {
      const key = term.categories[0] ?? 'Other';
      const bucket = grouped.get(key);
      if (bucket) bucket.push(term);
      else grouped.set(key, [term]);
    }

    return [...grouped.entries()]
      .sort(
        (a, b) =>
          (CATEGORIES as readonly string[]).indexOf(a[0]) -
          (CATEGORIES as readonly string[]).indexOf(b[0]),
      )
      .map(([title, data]) => ({
        title,
        data: [...data].sort((a, b) => a.term.localeCompare(b.term)),
      }));
  }, [bookmarks, byId]);

  const remove = useCallback(
    async (term: TermSummary) => {
      await toggleBookmark(term.id);
      showToast(`Removed ${term.term}.`);
    },
    [toggleBookmark, showToast],
  );

  const confirmClear = useCallback(() => {
    Alert.alert(
      'Clear all saved terms?',
      `This removes ${bookmarks.length} ${bookmarks.length === 1 ? 'term' : 'terms'} from Saved. Revision progress is kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: () => {
            void clearBookmarks();
            showToast('Cleared.');
          },
        },
      ],
    );
  }, [bookmarks.length, clearBookmarks, showToast]);

  if (bookmarks.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Saved" />
        <EmptyState
          title="Nothing saved yet"
          body="Save a term from its page and it lands here, grouped by category and ready to revise."
          action={{
            label: 'Find a term',
            onPress: () => navigation.navigate('Tabs', { screen: 'Search' }),
          }}
          secondaryAction={{
            label: 'Browse categories',
            onPress: () => navigation.navigate('Tabs', { screen: 'Browse' }),
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Saved"
        subtitle={`${bookmarks.length} ${bookmarks.length === 1 ? 'term' : 'terms'}`}
        action={{ label: 'Clear all', onPress: confirmClear, accessibilityLabel: 'Clear all saved terms' }}
      />

      <SectionList
        sections={sections}
        keyExtractor={(term) => term.id}
        stickySectionHeadersEnabled={false}
        renderItem={({ item }) => (
          <SwipeableRow onRemove={() => void remove(item)}>
            <TermRow
              term={item}
              onPress={(termId) => navigation.navigate('Term', { termId })}
              showCategory={false}
              onRemove={() => void remove(item)}
              removeLabel="Remove from saved"
            />
          </SwipeableRow>
        )}
        renderSectionHeader={({ section }) => (
          <View
            style={{
              paddingHorizontal: space.lg,
              paddingTop: space.lg,
              paddingBottom: space.xs,
              backgroundColor: color.background,
            }}
          >
            <AppText variant="label" tone="faint" accessibilityRole="header">
              {section.title}
            </AppText>
          </View>
        )}
        ItemSeparatorComponent={() => <Divider inset />}
        contentContainerStyle={{ paddingBottom: space.huge }}
      />
    </Screen>
  );
}

function SwipeableRow({
  onRemove,
  children,
}: {
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const { color, space } = useTheme();
  const ref = useRef<Swipeable>(null);

  return (
    <Swipeable
      ref={ref}
      friction={2}
      rightThreshold={48}
      overshootRight={false}
      onSwipeableOpen={() => {
        ref.current?.close();
        onRemove();
      }}
      renderRightActions={() => (
        <View
          style={{
            backgroundColor: color.surfaceMuted,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingHorizontal: space.lg,
          }}
        >
          <AppText variant="small" weight="semibold" style={{ color: color.caution }}>
            Remove
          </AppText>
        </View>
      )}
    >
      {children}
    </Swipeable>
  );
}
