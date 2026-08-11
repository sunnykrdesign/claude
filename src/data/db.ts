/**
 * Local database. The app is offline-first: the bundled `assets/terms.json` is
 * loaded into SQLite on first run and every read after that goes to the DB, so
 * nothing on screen ever waits on the network.
 *
 * Search uses an FTS5 virtual table where the platform provides one. FTS5 is
 * compiled into the SQLite that ships with expo-sqlite, but the build is
 * probed at migration time and the app degrades to a LIKE scan plus the
 * in-memory fuzzy index rather than failing to start.
 */

import * as SQLite from 'expo-sqlite';

import type { Category, Difficulty, Source, Term } from '../types/term';
import { sortKey } from '../types/term';

export const DB_NAME = 'ux-dictionary.db';

/** Bumped when the table shape changes; forces a rebuild of derived tables. */
const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let ftsAvailable = true;

export function isFtsAvailable(): boolean {
  return ftsAvailable;
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

/** Test seam: drops the cached handle so a fresh open re-runs migrations. */
export function resetDbForTests(): void {
  dbPromise = null;
  ftsAvailable = true;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS terms (
      id           TEXT PRIMARY KEY NOT NULL,
      term         TEXT NOT NULL,
      sort_key     TEXT NOT NULL,
      letter       TEXT NOT NULL,
      aliases      TEXT NOT NULL,
      categories   TEXT NOT NULL,
      short_def    TEXT NOT NULL,
      long_def     TEXT NOT NULL,
      example      TEXT NOT NULL,
      misuse       TEXT,
      related_ids  TEXT NOT NULL,
      difficulty   TEXT NOT NULL,
      sources      TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS terms_sort_key ON terms (sort_key);

    CREATE TABLE IF NOT EXISTS term_categories (
      term_id  TEXT NOT NULL,
      category TEXT NOT NULL,
      PRIMARY KEY (term_id, category)
    );

    CREATE INDEX IF NOT EXISTS term_categories_category ON term_categories (category);

    CREATE TABLE IF NOT EXISTS bookmarks (
      term_id    TEXT PRIMARY KEY NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS revision (
      term_id          TEXT PRIMARY KEY NOT NULL,
      box              INTEGER NOT NULL DEFAULT 1,
      due_at           INTEGER NOT NULL,
      last_reviewed_at INTEGER,
      correct_count    INTEGER NOT NULL DEFAULT 0,
      lapse_count      INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS revision_due ON revision (due_at);

    CREATE TABLE IF NOT EXISTS recent_searches (
      query       TEXT PRIMARY KEY NOT NULL,
      searched_at INTEGER NOT NULL
    );

    /*
     * Searches that returned nothing. Local only, never transmitted — this is
     * the backlog of terms worth writing next, readable in Settings.
     */
    CREATE TABLE IF NOT EXISTS missed_searches (
      query   TEXT PRIMARY KEY NOT NULL,
      hits    INTEGER NOT NULL DEFAULT 1,
      last_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  try {
    await db.execAsync(`
      CREATE VIRTUAL TABLE IF NOT EXISTS terms_fts USING fts5(
        term,
        aliases,
        short_def,
        long_def,
        id UNINDEXED,
        tokenize = 'unicode61 remove_diacritics 2'
      );
    `);
    ftsAvailable = true;
  } catch {
    ftsAvailable = false;
  }

  await setMeta(db, 'schema_version', String(SCHEMA_VERSION));
}

/* ------------------------------------------------------------------ meta -- */

export async function getMeta(
  db: SQLite.SQLiteDatabase,
  key: string,
): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

export async function setMeta(
  db: SQLite.SQLiteDatabase,
  key: string,
  value: string,
): Promise<void> {
  await db.runAsync(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value],
  );
}

/* --------------------------------------------------------------- seeding -- */

export const CONTENT_VERSION_KEY = 'content_version';

/**
 * Replaces the term corpus in a single transaction. Bookmarks and revision
 * progress live in separate tables keyed by term id, so a content update never
 * touches the user's data.
 */
export async function replaceTerms(
  db: SQLite.SQLiteDatabase,
  terms: Term[],
  version: number,
): Promise<void> {
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync('DELETE FROM terms; DELETE FROM term_categories;');
    if (ftsAvailable) {
      await tx.execAsync('DELETE FROM terms_fts;');
    }

    const insertTerm = await tx.prepareAsync(`
      INSERT INTO terms
        (id, term, sort_key, letter, aliases, categories, short_def, long_def,
         example, misuse, related_ids, difficulty, sources)
      VALUES ($id, $term, $sortKey, $letter, $aliases, $categories, $shortDef,
              $longDef, $example, $misuse, $relatedIds, $difficulty, $sources)
    `);
    const insertCategory = await tx.prepareAsync(
      'INSERT OR IGNORE INTO term_categories (term_id, category) VALUES ($termId, $category)',
    );
    const insertFts = ftsAvailable
      ? await tx.prepareAsync(`
          INSERT INTO terms_fts (term, aliases, short_def, long_def, id)
          VALUES ($term, $aliases, $shortDef, $longDef, $id)
        `)
      : null;

    try {
      for (const term of terms) {
        const key = sortKey(term.term);
        const letter = key.charAt(0).toUpperCase();
        await insertTerm.executeAsync({
          $id: term.id,
          $term: term.term,
          $sortKey: key,
          $letter: letter >= 'A' && letter <= 'Z' ? letter : '#',
          $aliases: JSON.stringify(term.aliases ?? []),
          $categories: JSON.stringify(term.categories ?? []),
          $shortDef: term.shortDef,
          $longDef: term.longDef,
          $example: term.example,
          $misuse: term.misuse ?? null,
          $relatedIds: JSON.stringify(term.relatedIds ?? []),
          $difficulty: term.difficulty,
          $sources: JSON.stringify(term.sources ?? []),
        });

        for (const category of term.categories ?? []) {
          await insertCategory.executeAsync({ $termId: term.id, $category: category });
        }

        if (insertFts) {
          await insertFts.executeAsync({
            $term: term.term,
            $aliases: (term.aliases ?? []).join(' '),
            $shortDef: term.shortDef,
            $longDef: term.longDef,
            $id: term.id,
          });
        }
      }
    } finally {
      await insertTerm.finalizeAsync();
      await insertCategory.finalizeAsync();
      await insertFts?.finalizeAsync();
    }

    await tx.runAsync(
      'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [CONTENT_VERSION_KEY, String(version)],
    );
  });
}

/** True when the store already holds content at or above `version`. */
export async function hasContentAtLeast(
  db: SQLite.SQLiteDatabase,
  version: number,
): Promise<boolean> {
  const current = await getMeta(db, CONTENT_VERSION_KEY);
  if (current == null) return false;
  const count = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM terms');
  if (!count || count.n === 0) return false;
  return Number(current) >= version;
}

/* --------------------------------------------------------------- reading -- */

type TermRow = {
  id: string;
  term: string;
  sort_key: string;
  letter: string;
  aliases: string;
  categories: string;
  short_def: string;
  long_def: string;
  example: string;
  misuse: string | null;
  related_ids: string;
  difficulty: string;
  sources: string;
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToTerm(row: TermRow): Term {
  return {
    id: row.id,
    term: row.term,
    aliases: parseJson<string[]>(row.aliases, []),
    categories: parseJson<Category[]>(row.categories, []),
    shortDef: row.short_def,
    longDef: row.long_def,
    example: row.example,
    misuse: row.misuse ?? undefined,
    relatedIds: parseJson<string[]>(row.related_ids, []),
    difficulty: row.difficulty as Difficulty,
    sources: parseJson<Source[]>(row.sources, []),
  };
}

export async function countTerms(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM terms');
  return row?.n ?? 0;
}

export async function getAllTerms(): Promise<Term[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TermRow>('SELECT * FROM terms ORDER BY sort_key');
  return rows.map(rowToTerm);
}

export async function getTerm(id: string): Promise<Term | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<TermRow>('SELECT * FROM terms WHERE id = ?', [id]);
  return row ? rowToTerm(row) : null;
}

export async function getTerms(ids: string[]): Promise<Term[]> {
  if (ids.length === 0) return [];
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(', ');
  const rows = await db.getAllAsync<TermRow>(
    `SELECT * FROM terms WHERE id IN (${placeholders})`,
    ids,
  );
  const byId = new Map(rows.map((row) => [row.id, rowToTerm(row)]));
  // Preserve the caller's ordering — related-term chips are ordered by intent.
  return ids.map((id) => byId.get(id)).filter((term): term is Term => term != null);
}

export async function getTermIdsInCategory(category: Category): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ term_id: string }>(
    `SELECT tc.term_id FROM term_categories tc
     JOIN terms t ON t.id = tc.term_id
     WHERE tc.category = ?
     ORDER BY t.sort_key`,
    [category],
  );
  return rows.map((row) => row.term_id);
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ category: string; n: number }>(
    'SELECT category, COUNT(*) AS n FROM term_categories GROUP BY category',
  );
  return Object.fromEntries(rows.map((row) => [row.category, row.n]));
}
