/**
 * A revision session: one card at a time, flip to reveal, then grade it.
 *
 * "Review again" sends the card back to Leitner box one *and* re-queues it for
 * later in this sitting, so a card you did not know comes round again before
 * you close the app.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '../components/AppText';
import { Button, EmptyState } from '../components/EmptyState';
import { FlashCard } from '../components/FlashCard';
import { Screen, ScreenHeader } from '../components/Screen';
import { getTerms } from '../data/db';
import { MAX_BOX, ReviewOutcome, describeNextReview } from '../data/leitner';
import { buildSessionQueue } from '../data/session';
import { deckTitle, type RootStackParamList } from '../navigation/types';
import { useLibrary } from '../store/library';
import { useTheme } from '../theme/useTheme';
import type { Term } from '../types/term';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviseSession'>;

export function ReviseSessionScreen({ route, navigation }: Props) {
  const { deck } = route.params;
  const { space, color } = useTheme();

  const index = useLibrary((state) => state.index);
  const bookmarks = useLibrary((state) => state.bookmarks);
  const revision = useLibrary((state) => state.revision);
  const reviewTerm = useLibrary((state) => state.reviewTerm);

  const [terms, setTerms] = useState<Term[] | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState({ gotIt: 0, again: 0 });

  // The queue is built once, from the state as it was when the session opened.
  // Grading mutates `revision`, and a queue that reshuffled underneath the user
  // would be unusable.
  const deckIds = useMemo(() => {
    switch (deck.kind) {
      case 'saved':
        return bookmarks;
      case 'category':
        return index.filter((term) => term.categories.includes(deck.category)).map((t) => t.id);
      case 'due':
      case 'all':
        return index.map((term) => term.id);
    }
  }, [deck, index, bookmarks]);

  useEffect(() => {
    const built = buildSessionQueue(deckIds, revision, Date.now(), {
      dueOnly: deck.kind === 'due',
    });
    setQueue(built);
    getTerms(built).then(setTerms);
    // Deliberately not depending on `revision`: see above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckIds, deck.kind]);

  const termsById = useMemo(
    () => Object.fromEntries((terms ?? []).map((term) => [term.id, term])),
    [terms],
  );

  const currentId = queue[position];
  const current = currentId ? termsById[currentId] : undefined;
  const finished = terms != null && position >= queue.length;

  const grade = useCallback(
    async (outcome: ReviewOutcome) => {
      if (!currentId) return;

      void Haptics.impactAsync(
        outcome === 'got-it'
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium,
      ).catch(() => {});

      await reviewTerm(currentId, outcome);

      setReviewed((prev) =>
        outcome === 'got-it'
          ? { ...prev, gotIt: prev.gotIt + 1 }
          : { ...prev, again: prev.again + 1 },
      );

      if (outcome === 'review-again') {
        // Back of the queue, so it comes round again this sitting.
        setQueue((prev) => [...prev, currentId]);
      }

      setFlipped(false);
      setPosition((prev) => prev + 1);
    },
    [currentId, reviewTerm],
  );

  if (terms == null) {
    return (
      <Screen edges={['left', 'right']}>
        <View style={{ padding: space.lg }}>
          <AppText variant="body" tone="muted">
            Building your session…
          </AppText>
        </View>
      </Screen>
    );
  }

  if (queue.length === 0) {
    return (
      <Screen edges={['left', 'right']}>
        <EmptyState
          title="Nothing due right now"
          body={
            deck.kind === 'saved'
              ? 'Save a few terms first, then come back to revise them.'
              : 'Everything in this deck is scheduled for later. That is the system working.'
          }
          action={{ label: 'Back to decks', onPress: () => navigation.goBack() }}
        />
      </Screen>
    );
  }

  if (finished || !current) {
    const total = reviewed.gotIt + reviewed.again;
    return (
      <Screen edges={['left', 'right']}>
        <EmptyState
          title="Session complete"
          body={`${total} ${total === 1 ? 'card' : 'cards'} reviewed — ${reviewed.gotIt} got it, ${reviewed.again} to see again.`}
          action={{ label: 'Back to decks', onPress: () => navigation.goBack() }}
          secondaryAction={{
            label: 'Go again',
            onPress: () => {
              setPosition(0);
              setFlipped(false);
              setReviewed({ gotIt: 0, again: 0 });
              const rebuilt = buildSessionQueue(deckIds, useLibrary.getState().revision, Date.now(), {
                dueOnly: deck.kind === 'due',
              });
              setQueue(rebuilt);
              void getTerms(rebuilt).then(setTerms);
            },
          }}
        />
      </Screen>
    );
  }

  const state = revision[current.id];

  return (
    <Screen edges={['left', 'right']}>
      <ScreenHeader
        title={deckTitle(deck)}
        subtitle={`Card ${position + 1} of ${queue.length}`}
        action={{ label: 'End', onPress: () => navigation.goBack(), accessibilityLabel: 'End session' }}
      />

      <View style={{ flex: 1, paddingHorizontal: space.lg, paddingBottom: space.base }}>
        <FlashCard
          term={current}
          flipped={flipped}
          onFlip={() => setFlipped((prev) => !prev)}
          position={`Card ${position + 1} of ${queue.length}`}
          boxLabel={
            state
              ? `Box ${state.box} of ${MAX_BOX} · ${describeNextReview(state, Date.now())}`
              : 'New card'
          }
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: space.md,
          paddingHorizontal: space.lg,
          paddingBottom: space.lg,
          paddingTop: space.md,
          borderTopWidth: 1,
          borderTopColor: color.border,
        }}
      >
        {flipped ? (
          <>
            <View style={{ flex: 1 }}>
              <Button
                label="Review again"
                variant="quiet"
                onPress={() => void grade('review-again')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Got it" onPress={() => void grade('got-it')} />
            </View>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <Button label="Show definition" onPress={() => setFlipped(true)} />
          </View>
        )}
      </View>
    </Screen>
  );
}
