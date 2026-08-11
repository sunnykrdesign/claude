import { MIN_ACCEPTABLE_TERMS, parseCollection, parseTerm } from '../validate';

function makeTerm(overrides: Record<string, unknown> = {}) {
  return {
    id: 'affordance',
    term: 'Affordance',
    aliases: ['perceived affordance'],
    categories: ['Interaction & UI Patterns'],
    shortDef: 'A visual clue that tells you what an element does.',
    longDef: 'Longer explanation. Second sentence.',
    example: 'A raised button looks pressable.',
    relatedIds: ['signifier'],
    difficulty: 'core',
    sources: [{ label: 'NN/g', url: 'https://www.nngroup.com/articles/' }],
    ...overrides,
  };
}

function makeCollection(count: number) {
  return {
    version: 2,
    generatedAt: '2026-03-10',
    terms: Array.from({ length: count }, (_, i) =>
      makeTerm({ id: `term-${i}`, term: `Term ${i}`, relatedIds: [] }),
    ),
  };
}

describe('parseTerm', () => {
  it('accepts a well-formed term', () => {
    expect(parseTerm(makeTerm())?.id).toBe('affordance');
  });

  it('rejects unknown difficulties', () => {
    expect(parseTerm(makeTerm({ difficulty: 'expert' }))).toBeNull();
  });

  it('rejects a term with no recognised category', () => {
    expect(parseTerm(makeTerm({ categories: ['Vibes'] }))).toBeNull();
  });

  it('drops unrecognised categories but keeps the term', () => {
    const parsed = parseTerm(makeTerm({ categories: ['Vibes', 'Research'] }));
    expect(parsed?.categories).toEqual(['Research']);
  });

  it('drops sources that are not label and url pairs', () => {
    const parsed = parseTerm(makeTerm({ sources: [{ label: 'NN/g' }, 42] }));
    expect(parsed?.sources).toEqual([]);
  });

  it('treats an empty misuse string as absent', () => {
    expect(parseTerm(makeTerm({ misuse: '' }))?.misuse).toBeUndefined();
  });
});

describe('parseCollection', () => {
  it('accepts a valid payload', () => {
    const result = parseCollection(makeCollection(MIN_ACCEPTABLE_TERMS));
    expect(result.ok).toBe(true);
  });

  it('rejects a payload with no version', () => {
    const result = parseCollection({ terms: [] });
    expect(result).toEqual({ ok: false, reason: 'Payload has no usable version number.' });
  });

  it('refuses to replace the corpus with a near-empty payload', () => {
    const result = parseCollection(makeCollection(3));
    expect(result.ok).toBe(false);
  });

  it('skips malformed entries instead of failing the whole payload', () => {
    const collection = makeCollection(MIN_ACCEPTABLE_TERMS);
    collection.terms.push(makeTerm({ id: '', term: 'Broken' }) as never);
    const result = parseCollection(collection);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.skipped).toBe(1);
  });

  it('drops duplicate ids', () => {
    const collection = makeCollection(MIN_ACCEPTABLE_TERMS);
    collection.terms.push(collection.terms[0]);
    const result = parseCollection(collection);
    if (!result.ok) throw new Error('expected a valid payload');
    expect(result.skipped).toBe(1);
    expect(result.collection.terms).toHaveLength(MIN_ACCEPTABLE_TERMS);
  });

  it('strips related links that point at terms which did not survive', () => {
    const collection = makeCollection(MIN_ACCEPTABLE_TERMS);
    collection.terms[0].relatedIds = ['term-1', 'ghost'];
    const result = parseCollection(collection);
    if (!result.ok) throw new Error('expected a valid payload');
    expect(result.collection.terms[0].relatedIds).toEqual(['term-1']);
  });

  it('strips a self-link', () => {
    const collection = makeCollection(MIN_ACCEPTABLE_TERMS);
    collection.terms[0].relatedIds = ['term-0'];
    const result = parseCollection(collection);
    if (!result.ok) throw new Error('expected a valid payload');
    expect(result.collection.terms[0].relatedIds).toEqual([]);
  });
});
