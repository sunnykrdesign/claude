/**
 * Runtime validation for term payloads.
 *
 * This is the lean structural check that guards the *remote* update path — a
 * malformed payload must never be able to empty the dictionary. The authoring
 * checks (dead `relatedIds`, duplicate aliases, `shortDef` length) live in
 * `scripts/validate-terms.mjs` and run in CI, where a human can fix them.
 */

import { CATEGORIES, DIFFICULTIES, Term, TermCollection } from '../types/term';

const CATEGORY_SET = new Set<string>(CATEGORIES);
const DIFFICULTY_SET = new Set<string>(DIFFICULTIES);

/** A payload that replaces the corpus with almost nothing is treated as corrupt. */
export const MIN_ACCEPTABLE_TERMS = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function parseTerm(value: unknown): Term | null {
  if (!isRecord(value)) return null;

  const { id, term, shortDef, longDef, example, difficulty } = value;
  if (typeof id !== 'string' || id.length === 0) return null;
  if (typeof term !== 'string' || term.length === 0) return null;
  if (typeof shortDef !== 'string' || shortDef.length === 0) return null;
  if (typeof longDef !== 'string' || longDef.length === 0) return null;
  if (typeof example !== 'string') return null;
  if (typeof difficulty !== 'string' || !DIFFICULTY_SET.has(difficulty)) return null;

  const categories = stringArray(value.categories).filter((category) =>
    CATEGORY_SET.has(category),
  );
  if (categories.length === 0) return null;

  const sources = Array.isArray(value.sources)
    ? value.sources
        .filter(isRecord)
        .filter((source) => typeof source.label === 'string' && typeof source.url === 'string')
        .map((source) => ({ label: source.label as string, url: source.url as string }))
    : [];

  return {
    id,
    term,
    aliases: stringArray(value.aliases),
    categories: categories as Term['categories'],
    shortDef,
    longDef,
    example,
    misuse: typeof value.misuse === 'string' && value.misuse ? value.misuse : undefined,
    relatedIds: stringArray(value.relatedIds),
    difficulty: difficulty as Term['difficulty'],
    sources,
  };
}

export type ParseResult =
  | { ok: true; collection: TermCollection; skipped: number }
  | { ok: false; reason: string };

/**
 * Validates a whole payload. Individual bad entries are dropped and counted;
 * a payload that is the wrong shape, or that arrives suspiciously empty, is
 * rejected outright so the existing corpus survives.
 */
export function parseCollection(value: unknown): ParseResult {
  if (!isRecord(value)) return { ok: false, reason: 'Payload is not an object.' };

  const version = Number(value.version);
  if (!Number.isInteger(version) || version < 1) {
    return { ok: false, reason: 'Payload has no usable version number.' };
  }

  if (!Array.isArray(value.terms)) {
    return { ok: false, reason: 'Payload has no terms array.' };
  }

  const terms: Term[] = [];
  const seen = new Set<string>();
  let skipped = 0;

  for (const entry of value.terms) {
    const term = parseTerm(entry);
    if (!term || seen.has(term.id)) {
      skipped += 1;
      continue;
    }
    seen.add(term.id);
    terms.push(term);
  }

  if (terms.length < MIN_ACCEPTABLE_TERMS) {
    return { ok: false, reason: `Payload held only ${terms.length} usable terms.` };
  }

  // Drop links to terms that did not survive, so no chip can lead nowhere.
  for (const term of terms) {
    term.relatedIds = term.relatedIds.filter((id) => seen.has(id) && id !== term.id);
  }

  return {
    ok: true,
    skipped,
    collection: {
      version,
      generatedAt:
        typeof value.generatedAt === 'string' ? value.generatedAt : new Date().toISOString(),
      terms,
    },
  };
}
