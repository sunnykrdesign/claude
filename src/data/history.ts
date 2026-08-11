/**
 * Search history and the no-result log.
 *
 * Both are local-only and never leave the device. The no-result log exists for
 * one reason: it is the list of terms worth writing next. It is visible to the
 * user in Settings and clearable there.
 */

import { getDb } from './db';
import { normalizeQuery } from './search';

const RECENT_LIMIT = 8;

/** Queries shorter than this are keystrokes on the way somewhere, not searches. */
const MIN_LOGGABLE = 3;

export async function recordSearch(rawQuery: string): Promise<void> {
  const query = normalizeQuery(rawQuery);
  if (query.length < MIN_LOGGABLE) return;

  const db = await getDb();
  await db.runAsync(
    `INSERT INTO recent_searches (query, searched_at) VALUES (?, ?)
     ON CONFLICT(query) DO UPDATE SET searched_at = excluded.searched_at`,
    [query, Date.now()],
  );
  await db.runAsync(
    `DELETE FROM recent_searches WHERE query NOT IN (
       SELECT query FROM recent_searches ORDER BY searched_at DESC LIMIT ?
     )`,
    [RECENT_LIMIT],
  );
}

export async function listRecentSearches(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ query: string }>(
    'SELECT query FROM recent_searches ORDER BY searched_at DESC LIMIT ?',
    [RECENT_LIMIT],
  );
  return rows.map((row) => row.query);
}

export async function clearRecentSearches(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM recent_searches');
}

export type MissedSearch = { query: string; hits: number; lastAt: number };

export async function recordMissedSearch(rawQuery: string): Promise<void> {
  const query = normalizeQuery(rawQuery);
  if (query.length < MIN_LOGGABLE) return;

  const db = await getDb();
  await db.runAsync(
    `INSERT INTO missed_searches (query, hits, last_at) VALUES (?, 1, ?)
     ON CONFLICT(query) DO UPDATE SET hits = hits + 1, last_at = excluded.last_at`,
    [query, Date.now()],
  );
}

export async function listMissedSearches(limit = 50): Promise<MissedSearch[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ query: string; hits: number; last_at: number }>(
    'SELECT query, hits, last_at FROM missed_searches ORDER BY hits DESC, last_at DESC LIMIT ?',
    [limit],
  );
  return rows.map((row) => ({ query: row.query, hits: row.hits, lastAt: row.last_at }));
}

export async function clearMissedSearches(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM missed_searches');
}
