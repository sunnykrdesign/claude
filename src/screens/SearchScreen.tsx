/**
 * Search — the home screen, and the one the whole product is judged on.
 *
 * The field is focused on launch and results update per keystroke. Ranking is
 * handled in `data/search`; this screen's job is to stay out of the way.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';

import { AppText } from '../components/AppText';
import { CategoryChip } from '../components/Chip';
import { Button, EmptyState } from '../components/EmptyState';
import { Screen, ScreenHeader } from '../components/Screen';
import { SearchBar } from '../components/SearchBar';
import { TermRow } from '../components/TermRow';
import { useToast } from '../components/Toast';
import { recordMissedSearch } from '../data/history';
import { SearchHit, searchTerms } from '../data/search';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { useLibrary } from '../store/library';
import { CATEGORY_BLURBS, categoryTint } from '../theme/categories';
import { MIN_TARGET } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { CATEGORIES, Category, TermSummary } from '../types/term';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Search'>,
  NativeStackScreenProps<RootStackParamList>
>;

/** A query is only logged as "missing" once the user has stopped typing. */
const MISS_LOG_DELAY_MS = 1200;

export function SearchScreen({ navigation }: Props) {
  const { space, color } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const index = useLibrary((state) => state.index);
  const fuse = useLibrary((state) => state.fuse);
  const status = useLibrary((state) => state.status);
  const bookmarks = useLibrary((state) => state.bookmarks);
  const recentSearches = useLibrary((state) => state.recentSearches);
  const noteSearch = useLibrary((state) => state.noteSearch);
  const clearRecent = useLibrary((state) => state.clearRecent);
  const pickTermOfTheDay = useLibrary((state) => state.termOfTheDay);
  const showToast = useToast((state) => state.show);

  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);

  const trimmed = query.trim();
  const savedSet = useMemo(() => new Set(bookmarks), [bookmarks]);

  // Results per keystroke. The async passes can resolve out of order, so each
  // run is tagged and stale results are dropped rather than rendered.
  const runId = useRef(0);
  useEffect(() => {
    if (trimmed.length === 0) {
      setHits([]);
      return;
    }
    const id = (runId.current += 1);
    let active = true;
    searchTerms(trimmed, index, { fuse: fuse ?? undefined }).then((results) => {
      if (active && id === runId.current) setHits(results);
    });
    return () => {
      active = false;
    };
  }, [trimmed, index, fuse]);

  // Log unanswered searches so the content backlog writes itself.
  useEffect(() => {
    if (trimmed.length < 3 || hits.length > 0) return;
    const timer = setTimeout(() => {
      void recordMissedSearch(trimmed);
    }, MISS_LOG_DELAY_MS);
    return () => clearTimeout(timer);
  }, [trimmed, hits.length]);

  const openTerm = useCallback(
    (termId: string) => {
      if (trimmed.length > 0) void noteSearch(trimmed);
      navigation.navigate('Term', { termId });
    },
    [navigation, noteSearch, trimmed],
  );

  const openCategory = useCallback(
    (category: Category) => navigation.navigate('Tabs', { screen: 'Browse', params: { category } }),
    [navigation],
  );

  const renderRow = useCallback(
    ({ item, index: position }: { item: SearchHit; index: number }) => (
      <TermRow
        term={item.term}
        onPress={openTerm}
        entranceIndex={position}
        saved={savedSet.has(item.term.id)}
      />
    ),
    [openTerm, savedSet],
  );

  if (status === 'loading' || status === 'idle') {
    return (
      <Screen>
        <ScreenHeader title="Dictionary" />
        <AppText variant="body" tone="muted" style={{ paddingHorizontal: space.lg }}>
          Opening the dictionary…
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Dictionary"
        subtitle={`${index.length} terms, available offline`}
        action={{ label: 'Settings', onPress: () => navigation.navigate('Settings') }}
      />

      <SearchBar
        ref={inputRef}
        value={query}
        onChangeText={setQuery}
        autoFocus
        placeholder="Search terms, aliases, definitions"
        resultSummary={
          trimmed.length === 0
            ? undefined
            : hits.length === 1
              ? '1 result'
              : `${hits.length} results`
        }
      />

      <FlatList
        data={hits}
        keyExtractor={(hit) => hit.term.id}
        renderItem={renderRow}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingTop: space.sm, paddingBottom: space.huge }}
        ListEmptyComponent={
          trimmed.length === 0 ? (
            <SearchLanding
              onOpenTerm={openTerm}
              onOpenCategory={openCategory}
              recentSearches={recentSearches}
              onPickRecent={setQuery}
              onClearRecent={() => void clearRecent()}
              termOfTheDay={pickTermOfTheDay()}
              onOpenBrowse={() => navigation.navigate('Tabs', { screen: 'Browse' })}
            />
          ) : (
            <EmptyState
              title={`No match for “${trimmed}”`}
              body="Try a shorter word, or browse the categories to find it by hand."
              action={{ label: 'Browse all terms', onPress: () => navigation.navigate('Tabs', { screen: 'Browse' }) }}
              secondaryAction={{
                label: 'Suggest this term',
                onPress: () => {
                  void recordMissedSearch(trimmed);
                  showToast('Noted on this device.');
                },
              }}
            />
          )
        }
      />

      {/* A quiet reminder that the corpus is finite and local. */}
      {trimmed.length > 0 && hits.length > 0 ? (
        <View
          style={{
            paddingHorizontal: space.lg,
            paddingBottom: space.sm,
            borderTopWidth: 1,
            borderTopColor: color.border,
            paddingTop: space.sm,
          }}
        >
          <AppText variant="caption" tone="faint">
            Tap a term for the full definition, examples and related terms.
          </AppText>
        </View>
      ) : null}
    </Screen>
  );
}

type LandingProps = {
  termOfTheDay: TermSummary | null;
  onOpenTerm: (termId: string) => void;
  onOpenCategory: (category: Category) => void;
  onOpenBrowse: () => void;
  recentSearches: string[];
  onPickRecent: (query: string) => void;
  onClearRecent: () => void;
};

/**
 * The zero state: today's term, what you looked up recently, and the whole
 * taxonomy as a grid. Nothing here is decorative — each block is a way in.
 */
function SearchLanding({
  termOfTheDay,
  onOpenTerm,
  onOpenCategory,
  onOpenBrowse,
  recentSearches,
  onPickRecent,
  onClearRecent,
}: LandingProps) {
  const { color, radius, space, scheme } = useTheme();
  const counts = useLibrary((state) => state.categoryCounts);

  return (
    <View style={{ gap: space.xl, paddingTop: space.md }}>
      {termOfTheDay ? (
        <View style={{ paddingHorizontal: space.lg, gap: space.sm }}>
          <AppText variant="label" tone="faint">
            Term of the day
          </AppText>
          <Pressable
            onPress={() => onOpenTerm(termOfTheDay.id)}
            accessibilityRole="button"
            accessibilityLabel={`Term of the day. ${termOfTheDay.term}. ${termOfTheDay.shortDef}`}
            accessibilityHint="Opens the full definition"
            style={({ pressed }) => ({
              backgroundColor: pressed ? color.surfaceMuted : color.surface,
              borderColor: color.border,
              borderWidth: 1,
              borderRadius: radius.lg,
              padding: space.lg,
              gap: space.sm,
            })}
          >
            <AppText variant="title">{termOfTheDay.term}</AppText>
            <AppText variant="body" tone="muted">
              {termOfTheDay.shortDef}
            </AppText>
            {termOfTheDay.categories[0] ? (
              <CategoryChip category={termOfTheDay.categories[0]} style={{ marginTop: space.xxs }} />
            ) : null}
          </Pressable>
        </View>
      ) : null}

      {recentSearches.length > 0 ? (
        <View style={{ gap: space.sm }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: space.lg,
            }}
          >
            <AppText variant="label" tone="faint">
              Recent searches
            </AppText>
            <Pressable
              onPress={onClearRecent}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Clear recent searches"
            >
              <AppText variant="caption" tone="accent" weight="medium">
                Clear
              </AppText>
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: space.sm,
              paddingHorizontal: space.lg,
            }}
          >
            {recentSearches.map((recent) => (
              <Pressable
                key={recent}
                onPress={() => onPickRecent(recent)}
                accessibilityRole="button"
                accessibilityLabel={`Search again for ${recent}`}
                hitSlop={8}
                style={({ pressed }) => ({
                  minHeight: MIN_TARGET - 10,
                  justifyContent: 'center',
                  backgroundColor: pressed ? color.surfaceMuted : color.surface,
                  borderColor: color.border,
                  borderWidth: 1,
                  borderRadius: radius.pill,
                  paddingHorizontal: space.md,
                })}
              >
                <AppText variant="small">{recent}</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ gap: space.md }}>
        <AppText variant="label" tone="faint" style={{ paddingHorizontal: space.lg }}>
          Browse by category
        </AppText>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: space.md,
            paddingHorizontal: space.lg,
          }}
        >
          {CATEGORIES.map((category) => {
            const tint = categoryTint(category, scheme);
            const count = counts[category] ?? 0;
            return (
              <Pressable
                key={category}
                onPress={() => onOpenCategory(category)}
                disabled={count === 0}
                accessibilityRole="button"
                accessibilityLabel={`${category}, ${count} terms. ${CATEGORY_BLURBS[category]}`}
                style={({ pressed }) => ({
                  flexGrow: 1,
                  flexBasis: '44%',
                  minHeight: MIN_TARGET + 24,
                  opacity: count === 0 ? 0.45 : 1,
                  backgroundColor: pressed ? tint.border : tint.surface,
                  borderColor: tint.border,
                  borderWidth: 1,
                  borderRadius: radius.md,
                  padding: space.md,
                  gap: space.xxs,
                })}
              >
                <AppText variant="small" weight="semibold" style={{ color: tint.text }}>
                  {category}
                </AppText>
                <AppText variant="caption" tone="faint">
                  {count} {count === 1 ? 'term' : 'terms'}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ paddingHorizontal: space.lg }}>
        <Button label="Open the A–Z index" variant="quiet" onPress={onOpenBrowse} />
      </View>
    </View>
  );
}
