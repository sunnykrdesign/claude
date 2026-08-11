/**
 * Spaced repetition, Leitner style. Pure functions — no database, no clock of
 * their own — so the scheduling rules can be tested directly.
 *
 * Four boxes with fixed intervals: 1, 3, 7 and 21 days. "Got it" promotes a
 * card one box; "Review again" sends it back to box one. A card in box four is
 * treated as learned.
 */

export const BOX_INTERVALS_DAYS = [1, 3, 7, 21] as const;

export const MIN_BOX = 1;
export const MAX_BOX = BOX_INTERVALS_DAYS.length;

export const DAY_MS = 24 * 60 * 60 * 1000;

export type ReviewOutcome = 'got-it' | 'review-again';

export type RevisionState = {
  termId: string;
  /** 1–4. */
  box: number;
  /** Epoch ms at which the card should next be shown. */
  dueAt: number;
  lastReviewedAt: number | null;
  correctCount: number;
  lapseCount: number;
};

export function clampBox(box: number): number {
  if (!Number.isFinite(box)) return MIN_BOX;
  return Math.min(MAX_BOX, Math.max(MIN_BOX, Math.round(box)));
}

export function intervalMsForBox(box: number): number {
  return BOX_INTERVALS_DAYS[clampBox(box) - 1] * DAY_MS;
}

/** A card the user has never reviewed is due immediately. */
export function initialState(termId: string, now: number): RevisionState {
  return {
    termId,
    box: MIN_BOX,
    dueAt: now,
    lastReviewedAt: null,
    correctCount: 0,
    lapseCount: 0,
  };
}

export function applyOutcome(
  state: RevisionState,
  outcome: ReviewOutcome,
  now: number,
): RevisionState {
  const box = outcome === 'got-it' ? clampBox(state.box + 1) : MIN_BOX;
  return {
    ...state,
    box,
    dueAt: now + intervalMsForBox(box),
    lastReviewedAt: now,
    correctCount: state.correctCount + (outcome === 'got-it' ? 1 : 0),
    lapseCount: state.lapseCount + (outcome === 'got-it' ? 0 : 1),
  };
}

export function isDue(state: RevisionState, now: number): boolean {
  return state.dueAt <= now;
}

export function isLearned(state: RevisionState): boolean {
  return state.box >= MAX_BOX;
}

/** Human-readable gap until the next review, for the card footer. */
export function describeNextReview(state: RevisionState, now: number): string {
  const ms = state.dueAt - now;
  if (ms <= 0) return 'Due now';
  const days = Math.round(ms / DAY_MS);
  if (days <= 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

/* --------------------------------------------------------------- streaks -- */

export type Streak = {
  current: number;
  longest: number;
  /** Local calendar day, `YYYY-MM-DD`. */
  lastDay: string | null;
};

export const EMPTY_STREAK: Streak = { current: 0, longest: 0, lastDay: null };

/** Local calendar day for a timestamp — streaks follow the user's midnight. */
export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / DAY_MS);
}

/**
 * Records a review on `today`. Same day is a no-op, the next day extends the
 * run, and any longer gap starts a new one. Never decreases `longest`.
 */
export function advanceStreak(streak: Streak, today: string): Streak {
  if (streak.lastDay === today) return streak;

  const gap = streak.lastDay ? daysBetween(streak.lastDay, today) : null;
  const current = gap === 1 ? streak.current + 1 : 1;

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastDay: today,
  };
}

/**
 * A streak that has not been extended today is still alive; one that missed a
 * whole day is not. Used for display only — the stored value is not rewritten
 * until the next review lands.
 */
export function liveStreak(streak: Streak, today: string): number {
  if (!streak.lastDay) return 0;
  const gap = daysBetween(streak.lastDay, today);
  return gap <= 1 ? streak.current : 0;
}
