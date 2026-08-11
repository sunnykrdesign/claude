/**
 * Browse — the A–Z index, filtered by category and difficulty.
 *
 * Sticky letter headers keep your place while scrolling, and the filters are
 * additive so "Accessibility, core" is one tap each.
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, View } from 'react-native';

import { AppText } from '../components/AppText';
import { CategoryFilter } from '../components/CategoryFilter';
import { EmptyState } from '../components/EmptyState';
import { Divider, Screen, ScreenHeader } from '../components/Screen';
import { TermRow } from '../components/TermRow';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { useLibrary } from '../store/library';
import { useTheme } from '../theme/useTheme';
import { CATEGORIES, Category, DIFFICULTIES, Difficulty, TermSummary, indexLetter } from '../types/term';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Browse'>,
  NativeStackScreenProps<RootStackParamList>
>;

type LetterSection = { title: string; data: TermSummary[] };

/** Groups an already-sorted list into A–Z sections. */
export function toLetterSections(terms: TermSummary[]): LetterSection[] {
  const sections: LetterSection[] = [];
  for (const term of terms) {
    const letter = indexLetter(term.term);
    const last = sections[sections.length - 1];
    if (last && last.title === letter) {
      last.data.push(term);
    } else {
      sections.push({ title: letter, data: [term] });
    }
  }
  return sections;
}

export function BrowseScreen({ navigation, route }: Props) {
  const { color, space } = useTheme();

  const index = useLibrary((state) => state.index);
  const counts = useLibrary((state) => state.categoryCounts);
  const bookmarks = useLibrary((state) => state.bookmarks);

  const [category, setCategory] = useState<Category | null>(route.params?.category ?? null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(
    route.params?.difficulty ?? null,
  );

  // Arriving from the category grid on Search should apply that filter, even
  // if the tab was already mounted.
  useEffect(() => {
    if (route.params?.category !== undefined) setCategory(route.params.category);
    if (route.params?.difficulty !== undefined) setDifficulty(route.params.difficulty);
  }, [route.params?.category, route.params?.difficulty]);

  const savedSet = useMemo(() => new Set(bookmarks), [bookmarks]);

  const sections = useMemo(() => {
    const filtered = index.filter(
      (term) =>
        (category == null || term.categories.includes(category)) &&
        (difficulty == null || term.difficulty === difficulty),
    );
    return toLetterSections(filtered);
  }, [index, category, difficulty]);

  const total = useMemo(
    () => sections.reduce((sum, section) => sum + section.data.length, 0),
    [sections],
  );

  const openTerm = useCallback(
    (termId: string) => navigation.navigate('Term', { termId }),
    [navigation],
  );

  const difficultyCounts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const term of index) {
      if (category != null && !term.categories.includes(category)) continue;
      result[term.difficulty] = (result[term.difficulty] ?? 0) + 1;
    }
    return result;
  }, [index, category]);

  return (
    <Screen>
      <ScreenHeader
        title="Browse"
        subtitle={`${total} ${total === 1 ? 'term' : 'terms'}${category ? ` in ${category}` : ''}`}
        action={
          category || difficulty
            ? {
                label: 'Reset',
                onPress: () => {
                  setCategory(null);
                  setDifficulty(null);
                },
                accessibilityLabel: 'Reset filters',
              }
            : undefined
        }
      />

      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <CategoryFilter
          label="Category"
          options={CATEGORIES}
          selected={category}
          onChange={setCategory}
          counts={counts}
          hideEmpty
        />
        <CategoryFilter
          label="Difficulty"
          options={DIFFICULTIES}
          selected={difficulty}
          onChange={setDifficulty}
          counts={difficultyCounts}
          allLabel="Any level"
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(term) => term.id}
        stickySectionHeadersEnabled
        renderItem={({ item }) => (
          <TermRow
            term={item}
            onPress={openTerm}
            saved={savedSet.has(item.id)}
            showCategory={category == null}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View
            style={{
              backgroundColor: color.background,
              paddingHorizontal: space.lg,
              paddingTop: space.md,
              paddingBottom: space.xs,
              borderBottomWidth: 1,
              borderBottomColor: color.border,
            }}
          >
            <AppText variant="label" tone="accent" accessibilityRole="header">
              {section.title}
            </AppText>
          </View>
        )}
        ItemSeparatorComponent={() => <Divider inset />}
        contentContainerStyle={{ paddingBottom: space.huge }}
        ListEmptyComponent={
          <EmptyState
            title="Nothing matches those filters"
            body="Try a different category, or clear the difficulty filter."
            action={{
              label: 'Reset filters',
              onPress: () => {
                setCategory(null);
                setDifficulty(null);
              },
            }}
          />
        }
      />
    </Screen>
  );
}
