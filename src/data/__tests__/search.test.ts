import { buildFuse, fuzzyRank, normalizeQuery, rankLexical, toFtsQuery } from '../search';
import type { TermSummary } from '../../types/term';

const index: TermSummary[] = [
  {
    id: 'affordance',
    term: 'Affordance',
    aliases: ['perceived affordance'],
    categories: ['Interaction & UI Patterns'],
    shortDef: 'A visual clue that tells you what an element does.',
    difficulty: 'core',
    relatedIds: ['signifier'],
  },
  {
    id: 'signifier',
    term: 'Signifier',
    aliases: [],
    categories: ['Interaction & UI Patterns'],
    shortDef: 'The cue that advertises an available action.',
    difficulty: 'core',
    relatedIds: ['affordance'],
  },
  {
    id: 'hicks-law',
    term: "Hick's Law",
    aliases: ['Hick-Hyman law'],
    categories: ['UX Laws & Principles'],
    shortDef: 'More choices mean a longer decision.',
    difficulty: 'core',
    relatedIds: [],
  },
  {
    id: 'heuristic-evaluation',
    term: 'Heuristic evaluation',
    aliases: ['expert review'],
    categories: ['Research'],
    shortDef: 'Experts inspect an interface against usability rules.',
    difficulty: 'intermediate',
    relatedIds: [],
  },
  {
    id: 'a-b-test',
    term: 'A/B test',
    aliases: ['split test'],
    categories: ['Research'],
    shortDef: 'Randomly splitting traffic between two versions.',
    difficulty: 'intermediate',
    relatedIds: [],
  },
];

const ids = (hits: { term: TermSummary }[]) => hits.map((hit) => hit.term.id);

describe('normalizeQuery', () => {
  it('folds case, accents and repeated spaces', () => {
    expect(normalizeQuery('  Affordânce   Test ')).toBe('affordance test');
  });
});

describe('rankLexical', () => {
  it('returns nothing for an empty query', () => {
    expect(rankLexical('   ', index)).toEqual([]);
  });

  it('puts an exact headword first', () => {
    const hits = rankLexical('signifier', index);
    expect(hits[0].term.id).toBe('signifier');
    expect(hits[0].reason).toBe('exact');
  });

  it('ranks a headword prefix above an alias and a definition match', () => {
    const hits = rankLexical('a', index);
    // "A/B test" and "Affordance" both start with A; a definition match must
    // not outrank either.
    expect(hits[0].reason).toBe('prefix');
  });

  it('matches aliases', () => {
    const hits = rankLexical('split test', index);
    expect(hits[0].term.id).toBe('a-b-test');
    expect(hits[0].reason).toBe('alias');
  });

  it('matches a word inside a multi-word headword', () => {
    const hits = rankLexical('law', index);
    expect(ids(hits)).toContain('hicks-law');
    expect(hits.find((hit) => hit.term.id === 'hicks-law')?.reason).toBe('word');
  });

  it('does not match mid-word', () => {
    // "aw" appears inside "Law" but not at a word boundary.
    expect(ids(rankLexical('aw', index))).not.toContain('hicks-law');
  });

  it('falls back to the one-line definition', () => {
    const hits = rankLexical('traffic', index);
    expect(ids(hits)).toEqual(['a-b-test']);
    expect(hits[0].reason).toBe('definition');
  });

  it('ignores punctuation differences in the headword', () => {
    expect(ids(rankLexical('hick', index))).toContain('hicks-law');
  });
});

describe('fuzzyRank', () => {
  const fuse = buildFuse(index);

  it('recovers from a typo', () => {
    expect(ids(fuzzyRank('affordence', index, fuse))).toContain('affordance');
  });

  it('recovers from a misspelling in the middle of a word', () => {
    expect(ids(fuzzyRank('hueristic evaluation', index, fuse))).toContain('heuristic-evaluation');
  });

  it('stays out of the way for very short queries', () => {
    expect(fuzzyRank('af', index, fuse)).toEqual([]);
  });

  it('always scores below the exact passes', () => {
    const exact = rankLexical('signifier', index);
    const fuzzy = fuzzyRank('signifer', index, fuse);
    expect(Math.min(...fuzzy.map((hit) => hit.score))).toBeGreaterThan(
      Math.max(...exact.map((hit) => hit.score)),
    );
  });
});

describe('toFtsQuery', () => {
  it('quotes tokens and prefix-matches the last one', () => {
    expect(toFtsQuery('mental model')).toBe('"mental" AND "model"*');
  });

  it('strips FTS operators so user input cannot be a syntax error', () => {
    expect(toFtsQuery('a"b* OR c')).toBe('"ab" AND "or" AND "c"*');
  });

  it('returns null when there is nothing to match', () => {
    expect(toFtsQuery('   ')).toBeNull();
    expect(toFtsQuery('***')).toBeNull();
  });
});
