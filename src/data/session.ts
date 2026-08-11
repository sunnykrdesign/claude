/**
 * Building a revision session. Pure, so the queue rules can be tested without
 * a database or a clock.
 */

import { RevisionState, isDue, isLearned } from './leitner';

/** Enough for a sitting, short enough to finish. */
export const DEFAULT_SESSION_SIZE = 20;

export type SessionOptions = {
  /** Only include cards the scheduler says are due. */
  dueOnly?: boolean;
  limit?: number;
};

/**
 * Orders a deck for study: cards that are due first, oldest due date first,
 * then cards never seen before. Learned cards that are not yet due are left
 * out unless nothing else is available, so a session is never empty when the
 * user asked for one.
 */
export function buildSessionQueue(
  termIds: string[],
  revision: Record<string, RevisionState>,
  now: number,
  options: SessionOptions = {},
): string[] {
  const limit = options.limit ?? DEFAULT_SESSION_SIZE;

  const due: RevisionState[] = [];
  const fresh: string[] = [];
  const resting: RevisionState[] = [];

  for (const termId of termIds) {
    const state = revision[termId];
    if (!state) {
      fresh.push(termId);
    } else if (isDue(state, now)) {
      due.push(state);
    } else {
      resting.push(state);
    }
  }

  due.sort((a, b) => a.dueAt - b.dueAt);

  if (options.dueOnly) {
    return due.slice(0, limit).map((state) => state.termId);
  }

  const queue = [...due.map((state) => state.termId), ...fresh];

  if (queue.length === 0) {
    // Everything is scheduled ahead. Offer the nearest cards rather than an
    // empty session — the user explicitly asked to revise.
    resting.sort((a, b) => a.dueAt - b.dueAt);
    return resting.slice(0, limit).map((state) => state.termId);
  }

  return queue.slice(0, limit);
}

/** Counts for the deck list: how far through a category the user is. */
export type DeckProgress = {
  total: number;
  seen: number;
  learned: number;
  due: number;
};

export function deckProgress(
  termIds: string[],
  revision: Record<string, RevisionState>,
  now: number,
): DeckProgress {
  let seen = 0;
  let learned = 0;
  let due = 0;

  for (const termId of termIds) {
    const state = revision[termId];
    if (!state) continue;
    seen += 1;
    if (isLearned(state)) learned += 1;
    if (isDue(state, now)) due += 1;
  }

  return { total: termIds.length, seen, learned, due };
}
