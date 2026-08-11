/**
 * Term detail.
 *
 * Reading order is deliberate: headword, categories, the one-line definition at
 * size, then the full definition, then the example, then what it gets confused
 * with, then the network of related terms.
 *
 * The related chips are the app's signature moment — they rise in one after
 * another once the definition has settled, because moving sideways through
 * connected terms is what this is for.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Linking, Pressable, ScrollView, Share, View } from 'react-native';

import { AppText, Headword } from '../components/AppText';
import { CategoryChip, TermChip } from '../components/Chip';
import { DefinitionBlock, Section } from '../components/DefinitionBlock';
import { Button, EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { useToast } from '../components/Toast';
import { getTerm } from '../data/db';
import type { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../store/library';
import { MIN_TARGET, motion } from '../theme/tokens';
import { useReducedMotion, useTheme } from '../theme/useTheme';
import type { Term } from '../types/term';

type Props = NativeStackScreenProps<RootStackParamList, 'Term'>;

/** Let the definition land before the connections arrive. */
const CHIP_DELAY_MS = 180;

export function TermScreen({ route, navigation }: Props) {
  const { termId } = route.params;
  const { color, space, measure } = useTheme();

  const [term, setTerm] = useState<Term | null>(null);
  const [missing, setMissing] = useState(false);

  const byId = useLibrary((state) => state.byId);
  const bookmarks = useLibrary((state) => state.bookmarks);
  const toggleBookmark = useLibrary((state) => state.toggleBookmark);
  const showToast = useToast((state) => state.show);

  const saved = bookmarks.includes(termId);

  useEffect(() => {
    let active = true;
    setTerm(null);
    setMissing(false);
    getTerm(termId).then((found) => {
      if (!active) return;
      if (found) setTerm(found);
      else setMissing(true);
    });
    return () => {
      active = false;
    };
  }, [termId]);

  const onSave = useCallback(async () => {
    const nowSaved = await toggleBookmark(termId);
    void Haptics.selectionAsync().catch(() => {});
    showToast(nowSaved ? 'Saved.' : 'Removed.');
  }, [termId, toggleBookmark, showToast]);

  const onCopy = useCallback(async () => {
    if (!term) return;
    await Clipboard.setStringAsync(`${term.term} — ${term.shortDef}\n\n${term.longDef}`);
    showToast('Copied.');
  }, [term, showToast]);

  const onShare = useCallback(async () => {
    if (!term) return;
    try {
      await Share.share({
        message: `${term.term}: ${term.shortDef}\n\n${term.longDef}\n\nExample: ${term.example}`,
      });
    } catch {
      // A dismissed share sheet is not an error worth surfacing.
    }
  }, [term]);

  if (missing) {
    return (
      <Screen edges={['left', 'right']}>
        <EmptyState
          title="That term is not here"
          body="It may have been renamed in a content update."
          action={{ label: 'Back to search', onPress: () => navigation.popToTop() }}
        />
      </Screen>
    );
  }

  if (!term) {
    return (
      <Screen edges={['left', 'right']}>
        <View style={{ padding: space.lg }}>
          <AppText variant="body" tone="muted">
            Loading…
          </AppText>
        </View>
      </Screen>
    );
  }

  const related = term.relatedIds
    .map((id) => byId[id])
    .filter((entry): entry is NonNullable<typeof entry> => entry != null);

  return (
    <Screen edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={{
          padding: space.lg,
          paddingBottom: space.huge,
          gap: space.xl,
          maxWidth: measure.card,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <View style={{ gap: space.md }}>
          <Headword>{term.term}</Headword>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {term.categories.map((category) => (
              <CategoryChip key={category} category={category} size="md" />
            ))}
            <DifficultyBadge difficulty={term.difficulty} />
          </View>

          {term.aliases.length > 0 ? (
            <AppText variant="caption" tone="faint">
              Also called {term.aliases.join(', ')}
            </AppText>
          ) : null}
        </View>

        <View style={{ gap: space.base, maxWidth: measure.text }}>
          <AppText variant="title" weight="medium">
            {term.shortDef}
          </AppText>
          <AppText variant="body" tone="muted">
            {term.longDef}
          </AppText>
        </View>

        <DefinitionBlock label="Example" emphasis="quote">
          {term.example}
        </DefinitionBlock>

        {term.misuse ? (
          <DefinitionBlock label="Commonly confused with">{term.misuse}</DefinitionBlock>
        ) : null}

        {related.length > 0 ? (
          <Section
            label="Related terms"
            trailing={
              <Pressable
                onPress={() => navigation.navigate('Connections', { termId: term.id })}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`See how ${term.term} connects to other terms`}
              >
                <AppText variant="caption" tone="accent" weight="medium">
                  See connections
                </AppText>
              </Pressable>
            }
          >
            <RelatedChips
              related={related}
              onPress={(id) => navigation.push('Term', { termId: id })}
            />
          </Section>
        ) : null}

        <View style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            <Button
              label={saved ? 'Remove from saved' : 'Save term'}
              variant={saved ? 'quiet' : 'primary'}
              onPress={() => void onSave()}
            />
            <Button label="Copy definition" variant="quiet" onPress={() => void onCopy()} />
            <Button label="Share" variant="quiet" onPress={() => void onShare()} />
          </View>
        </View>

        {term.sources.length > 0 ? (
          <Section label="Further reading">
            <View style={{ gap: space.sm }}>
              {term.sources.map((source) => (
                <Pressable
                  key={source.url}
                  onPress={() => void Linking.openURL(source.url).catch(() => {})}
                  accessibilityRole="link"
                  accessibilityLabel={`${source.label}. Opens in your browser`}
                  style={({ pressed }) => ({
                    minHeight: MIN_TARGET,
                    justifyContent: 'center',
                    paddingVertical: space.sm,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <AppText variant="small" tone="accent" weight="medium">
                    {source.label} ↗
                  </AppText>
                  <AppText variant="caption" tone="faint" numberOfLines={1}>
                    {source.url.replace(/^https:\/\//, '')}
                  </AppText>
                </Pressable>
              ))}
            </View>
            <AppText variant="caption" tone="faint" style={{ marginTop: space.xs }}>
              Definitions here are written from scratch. These links are where to read more.
            </AppText>
          </Section>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Term['difficulty'] }) {
  const { color, radius, space } = useTheme();
  const labels = {
    core: 'Core',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderColor: color.borderStrong,
        borderWidth: 1,
        borderRadius: radius.pill,
        paddingHorizontal: space.md,
        paddingVertical: space.xs + 1,
      }}
    >
      <AppText variant="caption" tone="muted" weight="medium">
        {labels[difficulty]}
      </AppText>
    </View>
  );
}

/**
 * The signature moment. Chips rise in sequence after the definition has
 * settled — and appear instantly, with no delay at all, under reduce-motion.
 */
function RelatedChips({
  related,
  onPress,
}: {
  related: { id: string; term: string }[];
  onPress: (termId: string) => void;
}) {
  const { space } = useTheme();
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    // One timeline; each chip reveals over its own slice of it. Driving a
    // single value keeps this on the native thread with one animation.
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: motion.duration.base + related.length * motion.stagger,
      delay: CHIP_DELAY_MS,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [related, progress, reduced]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
      {related.map((entry, position) => (
        <Animated.View
          key={entry.id}
          style={{
            opacity: progress.interpolate({
              inputRange: [Math.min(position / (related.length + 1), 0.95), 1],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [Math.min(position / (related.length + 1), 0.95), 1],
                  outputRange: [6, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          }}
        >
          <TermChip label={entry.term} onPress={() => onPress(entry.id)} hint="Opens the related term" />
        </Animated.View>
      ))}
    </View>
  );
}
