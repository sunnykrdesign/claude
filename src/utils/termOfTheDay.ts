/**
 * Term of the day. Deterministic from the calendar day, so the same term shows
 * all day, on every launch, without storing anything — and a different one
 * shows tomorrow.
 */

import type { TermSummary } from '../types/term';

/** FNV-1a. Small, stable, and good enough to spread days across the corpus. */
function hash(input: string): number {
  let value = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/**
 * Prefers `core` terms — the daily card is for learning the vocabulary
 * everyone is expected to know, not for showing off the long tail.
 */
export function termOfTheDay(index: TermSummary[], dayKey: string): TermSummary | null {
  if (index.length === 0) return null;

  const core = index.filter((term) => term.difficulty === 'core');
  const pool = core.length > 0 ? core : index;

  // The pool is already sorted by term, so hashing the day gives a stable but
  // unpredictable-looking rotation.
  return pool[hash(dayKey) % pool.length];
}
