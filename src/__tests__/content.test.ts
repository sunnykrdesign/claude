/**
 * Integrity checks against the corpus that actually ships.
 *
 * `scripts/validate-terms.mjs` covers the authored source; this covers the
 * built artefact, so a stale or hand-edited `assets/terms.json` fails the suite
 * rather than reaching a device.
 */

import seed from '../../assets/terms.json';
import { parseCollection } from '../data/validate';
import { CATEGORIES, DIFFICULTIES } from '../types/term';
import { termOfTheDay } from '../utils/termOfTheDay';
import { toSummary } from '../types/term';
import type { Term } from '../types/term';

const collection = seed as { version: number; generatedAt: string; terms: Term[] };
const terms = collection.terms;
const ids = new Set(terms.map((term) => term.id));

describe('bundled corpus', () => {
  it('parses with the same validator the update path uses', () => {
    const result = parseCollection(seed);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.skipped).toBe(0);
  });

  it('has a version and a build date', () => {
    expect(collection.version).toBeGreaterThanOrEqual(1);
    expect(collection.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('has unique ids', () => {
    expect(ids.size).toBe(terms.length);
  });

  it('never links to a term that does not exist', () => {
    const dead = terms.flatMap((term) =>
      term.relatedIds.filter((id) => !ids.has(id)).map((id) => `${term.id} → ${id}`),
    );
    expect(dead).toEqual([]);
  });

  it('never links to itself', () => {
    const selfLinks = terms.filter((term) => term.relatedIds.includes(term.id));
    expect(selfLinks.map((term) => term.id)).toEqual([]);
  });

  it('keeps every shortDef under fifteen words', () => {
    const tooLong = terms
      .filter((term) => term.shortDef.trim().split(/\s+/).length > 15)
      .map((term) => term.id);
    expect(tooLong).toEqual([]);
  });

  it('gives every term a concrete example', () => {
    const missing = terms.filter((term) => term.example.trim().length < 20).map((t) => t.id);
    expect(missing).toEqual([]);
  });

  it('uses only known categories and difficulties', () => {
    for (const term of terms) {
      expect(term.categories.length).toBeGreaterThan(0);
      for (const category of term.categories) {
        expect(CATEGORIES).toContain(category);
      }
      expect(DIFFICULTIES).toContain(term.difficulty);
    }
  });

  it('uses https for every source link', () => {
    const insecure = terms.flatMap((term) =>
      term.sources.filter((source) => !source.url.startsWith('https://')).map(() => term.id),
    );
    expect(insecure).toEqual([]);
  });

  it('never reuses an alias across two terms', () => {
    const owners = new Map<string, string>();
    const clashes: string[] = [];
    for (const term of terms) {
      for (const alias of term.aliases) {
        const key = alias.toLowerCase();
        const owner = owners.get(key);
        if (owner) clashes.push(`${alias}: ${owner} and ${term.id}`);
        owners.set(key, term.id);
      }
    }
    expect(clashes).toEqual([]);
  });

  it('has no orphan terms — every term is reachable from another', () => {
    const linked = new Set(terms.flatMap((term) => term.relatedIds));
    const orphans = terms.filter((term) => !linked.has(term.id)).map((term) => term.id);
    expect(orphans).toEqual([]);
  });
});

describe('term of the day', () => {
  const index = terms.map(toSummary);

  it('is stable within a day and moves between days', () => {
    expect(termOfTheDay(index, '2026-03-10')?.id).toBe(termOfTheDay(index, '2026-03-10')?.id);

    const week = new Set(
      ['11', '12', '13', '14', '15', '16', '17'].map(
        (day) => termOfTheDay(index, `2026-03-${day}`)?.id,
      ),
    );
    // Seven consecutive days should not land on the same term repeatedly.
    expect(week.size).toBeGreaterThan(4);
  });

  it('prefers core terms', () => {
    expect(termOfTheDay(index, '2026-03-10')?.difficulty).toBe('core');
  });

  it('handles an empty corpus', () => {
    expect(termOfTheDay([], '2026-03-10')).toBeNull();
  });
});
