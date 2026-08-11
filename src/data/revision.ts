/** Persistence for the Leitner scheduler in `./leitner`. */

import { getDb, getMeta, setMeta } from './db';
import { EMPTY_STREAK, RevisionState, Streak, advanceStreak, dayKey } from './leitner';

type RevisionRow = {
  term_id: string;
  box: number;
  due_at: number;
  last_reviewed_at: number | null;
  correct_count: number;
  lapse_count: number;
};

function rowToState(row: RevisionRow): RevisionState {
  return {
    termId: row.term_id,
    box: row.box,
    dueAt: row.due_at,
    lastReviewedAt: row.last_reviewed_at,
    correctCount: row.correct_count,
    lapseCount: row.lapse_count,
  };
}

export async function listRevisionStates(): Promise<RevisionState[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RevisionRow>('SELECT * FROM revision');
  return rows.map(rowToState);
}

export async function saveRevisionState(state: RevisionState): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO revision
       (term_id, box, due_at, last_reviewed_at, correct_count, lapse_count)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(term_id) DO UPDATE SET
       box              = excluded.box,
       due_at           = excluded.due_at,
       last_reviewed_at = excluded.last_reviewed_at,
       correct_count    = excluded.correct_count,
       lapse_count      = excluded.lapse_count`,
    [
      state.termId,
      state.box,
      state.dueAt,
      state.lastReviewedAt,
      state.correctCount,
      state.lapseCount,
    ],
  );
}

export async function resetRevisionProgress(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM revision');
  await setMeta(db, STREAK_KEY, JSON.stringify(EMPTY_STREAK));
}

/* --------------------------------------------------------------- streaks -- */

const STREAK_KEY = 'revision_streak';

export async function loadStreak(): Promise<Streak> {
  const db = await getDb();
  const raw = await getMeta(db, STREAK_KEY);
  if (!raw) return EMPTY_STREAK;
  try {
    const parsed = JSON.parse(raw) as Partial<Streak>;
    return {
      current: Number(parsed.current) || 0,
      longest: Number(parsed.longest) || 0,
      lastDay: parsed.lastDay ?? null,
    };
  } catch {
    return EMPTY_STREAK;
  }
}

/** Called once per completed review. Returns the streak after the update. */
export async function recordReviewDay(now: number): Promise<Streak> {
  const db = await getDb();
  const next = advanceStreak(await loadStreak(), dayKey(now));
  await setMeta(db, STREAK_KEY, JSON.stringify(next));
  return next;
}
