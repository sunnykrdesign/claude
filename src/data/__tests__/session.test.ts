import { DAY_MS, RevisionState, initialState } from '../leitner';
import { buildSessionQueue, deckProgress } from '../session';

const NOW = new Date('2026-03-10T09:00:00Z').getTime();

function state(termId: string, box: number, dueIn: number): RevisionState {
  return {
    ...initialState(termId, NOW),
    box,
    dueAt: NOW + dueIn,
  };
}

describe('buildSessionQueue', () => {
  const deck = ['a', 'b', 'c', 'd'];

  it('puts due cards first, oldest due first', () => {
    const revision = {
      a: state('a', 2, -1 * DAY_MS),
      b: state('b', 3, -5 * DAY_MS),
      c: state('c', 4, 10 * DAY_MS),
    };
    // b was due five days ago, a one day ago, c is not due, d is new.
    expect(buildSessionQueue(deck, revision, NOW)).toEqual(['b', 'a', 'd']);
  });

  it('includes never-seen cards after the due ones', () => {
    const revision = { a: state('a', 1, -DAY_MS) };
    expect(buildSessionQueue(deck, revision, NOW)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('honours dueOnly', () => {
    const revision = { a: state('a', 1, -DAY_MS) };
    expect(buildSessionQueue(deck, revision, NOW, { dueOnly: true })).toEqual(['a']);
  });

  it('returns nothing for a dueOnly session with nothing due', () => {
    const revision = { a: state('a', 2, DAY_MS) };
    expect(buildSessionQueue(['a'], revision, NOW, { dueOnly: true })).toEqual([]);
  });

  it('offers the nearest cards rather than an empty session', () => {
    const revision = {
      a: state('a', 4, 20 * DAY_MS),
      b: state('b', 2, 2 * DAY_MS),
    };
    // Nothing is due and nothing is new, so the soonest card leads.
    expect(buildSessionQueue(['a', 'b'], revision, NOW)).toEqual(['b', 'a']);
  });

  it('caps the session length', () => {
    const many = Array.from({ length: 50 }, (_, i) => `term-${i}`);
    expect(buildSessionQueue(many, {}, NOW, { limit: 5 })).toHaveLength(5);
  });
});

describe('deckProgress', () => {
  it('counts seen, learned and due', () => {
    const revision = {
      a: state('a', 4, 5 * DAY_MS),
      b: state('b', 1, -DAY_MS),
    };
    expect(deckProgress(['a', 'b', 'c'], revision, NOW)).toEqual({
      total: 3,
      seen: 2,
      learned: 1,
      due: 1,
    });
  });

  it('handles an empty deck', () => {
    expect(deckProgress([], {}, NOW)).toEqual({ total: 0, seen: 0, learned: 0, due: 0 });
  });
});
