/**
 * Search.
 *
 * Three passes, cheapest first, merged by score:
 *
 *   1. Lexical — a scan of the in-memory summary index. With a few hundred
 *      terms this is sub-millisecond and gives us the ranking we actually
 *      want: exact headword, then headword prefix, then alias, then a word
 *      boundary inside the headword, then the one-line definition.
 *   2. Full text — SQLite FTS5 over the long definitions, so "the law about
 *      thumbs" finds something even when no headword matches.
 *   3. Fuzzy — Fuse.js, only when the first two passes came up thin. This is
 *      what makes "affordence" and "hueristic" resolve.
 *
 * Passes 1 and 3 are pure functions over a plain array so they can be tested
 * and reasoned about without a database.
 */

import Fuse from 'fuse.js';

import { getDb, isFtsAvailable } from './db';
import type { TermSummary } from '../types/term';

export type MatchReason =
  | 'exact'
  | 'prefix'
  | 'alias'
  | 'word'
  | 'definition'
  | 'fulltext'
  | 'fuzzy';

export type SearchHit = {
  term: TermSummary;
  /** Lower is better. */
  score: number;
  reason: MatchReason;
};

export const SEARCH_LIMIT = 40;

/** Below this many hits from the exact passes, we spend the fuzzy budget. */
const FUZZY_THRESHOLD = 6;

export function normalizeQuery(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTarget(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Does `haystack` contain `needle` at the start of a word? Catches "law" in
 * "Hick's Law" without also matching the "law" inside "outlaw".
 */
function hasWordPrefix(haystack: string, needle: string): boolean {
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at < 0) return false;
    if (at === 0 || !/[a-z0-9]/.test(haystack.charAt(at - 1))) return true;
    from = at + 1;
  }
}

/**
 * Pass 1. Returns hits ordered by score, best first. Ties break on headword
 * length so the shorter, more general term wins — searching "test" should
 * surface "A/B test" above "Concurrent think aloud".
 */
export function rankLexical(rawQuery: string, index: TermSummary[]): SearchHit[] {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];

  const hits: SearchHit[] = [];

  for (const term of index) {
    const name = normalizeTarget(term.term);
    let score: number | null = null;
    let reason: MatchReason = 'definition';

    if (name === query) {
      score = 0;
      reason = 'exact';
    } else if (name.startsWith(query)) {
      score = 1;
      reason = 'prefix';
    } else {
      for (const rawAlias of term.aliases) {
        const alias = normalizeTarget(rawAlias);
        if (alias === query) {
          score = 1.5;
          reason = 'alias';
          break;
        }
        if (alias.startsWith(query)) {
          score = 2;
          reason = 'alias';
          break;
        }
      }
    }

    if (score == null && hasWordPrefix(name, query)) {
      score = 2.5;
      reason = 'word';
    }

    if (score == null && hasWordPrefix(normalizeTarget(term.shortDef), query)) {
      score = 4;
      reason = 'definition';
    }

    if (score != null) {
      hits.push({ term, score: score + Math.min(name.length, 60) / 1000, reason });
    }
  }

  return hits.sort((a, b) => a.score - b.score);
}

/**
 * Pass 3. Typo tolerance. Deliberately tight: a threshold loose enough to fix
 * "hueristic" is already loose enough to return noise, so this only ever runs
 * as a top-up and its hits always sort below the exact passes.
 */
export function fuzzyRank(
  rawQuery: string,
  index: TermSummary[],
  fuse?: Fuse<TermSummary>,
): SearchHit[] {
  const query = normalizeQuery(rawQuery);
  if (query.length < 3) return [];

  const engine = fuse ?? buildFuse(index);
  return engine
    .search(query, { limit: SEARCH_LIMIT })
    .map(({ item, score }) => ({
      term: item,
      score: 6 + (score ?? 0.5),
      reason: 'fuzzy' as const,
    }));
}

export function buildFuse(index: TermSummary[]): Fuse<TermSummary> {
  return new Fuse(index, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.36,
    minMatchCharLength: 3,
    keys: [
      { name: 'term', weight: 0.6 },
      { name: 'aliases', weight: 0.25 },
      { name: 'shortDef', weight: 0.15 },
    ],
  });
}

/**
 * Turns a user query into an FTS5 MATCH expression. Every token is quoted, so
 * a stray `"` or `*` is a literal rather than a syntax error, and the last
 * token gets a prefix star so results update usefully per keystroke.
 */
export function toFtsQuery(rawQuery: string): string | null {
  const tokens = normalizeQuery(rawQuery)
    .split(' ')
    .map((token) => token.replace(/["*^:()-]/g, ''))
    .filter((token) => token.length > 0);

  if (tokens.length === 0) return null;

  return tokens
    .map((token, i) => (i === tokens.length - 1 ? `"${token}"*` : `"${token}"`))
    .join(' AND ');
}

/** Pass 2. Ids only — the summaries come from the in-memory index. */
export async function fullTextIds(rawQuery: string): Promise<string[]> {
  if (!isFtsAvailable()) return [];
  const match = toFtsQuery(rawQuery);
  if (!match) return [];

  try {
    const db = await getDb();
    const rows = await db.getAllAsync<{ id: string }>(
      `SELECT id FROM terms_fts WHERE terms_fts MATCH ? ORDER BY rank LIMIT ?`,
      [match, SEARCH_LIMIT],
    );
    return rows.map((row) => row.id);
  } catch {
    // A malformed MATCH should degrade to "no full-text hits", never to a crash.
    return [];
  }
}

function mergeHits(groups: SearchHit[][], limit: number): SearchHit[] {
  const best = new Map<string, SearchHit>();
  for (const group of groups) {
    for (const hit of group) {
      const existing = best.get(hit.term.id);
      if (!existing || hit.score < existing.score) {
        best.set(hit.term.id, hit);
      }
    }
  }
  return [...best.values()].sort((a, b) => a.score - b.score).slice(0, limit);
}

/**
 * The orchestrator the UI calls. Lexical hits are computed synchronously and
 * the async passes only add to them, so a caller that renders optimistically
 * never shows fewer results than it had a keystroke ago.
 */
export async function searchTerms(
  rawQuery: string,
  index: TermSummary[],
  options: { fuse?: Fuse<TermSummary>; limit?: number } = {},
): Promise<SearchHit[]> {
  const limit = options.limit ?? SEARCH_LIMIT;
  const lexical = rankLexical(rawQuery, index);

  const byId = new Map(index.map((term) => [term.id, term]));
  const ftsHits: SearchHit[] = (await fullTextIds(rawQuery))
    .map((id) => byId.get(id))
    .filter((term): term is TermSummary => term != null)
    .map((term, position) => ({
      term,
      score: 5 + position / 1000,
      reason: 'fulltext' as const,
    }));

  const exact = mergeHits([lexical, ftsHits], limit);
  if (exact.length >= FUZZY_THRESHOLD) return exact;

  return mergeHits([lexical, ftsHits, fuzzyRank(rawQuery, index, options.fuse)], limit);
}
