import {
  BOX_INTERVALS_DAYS,
  DAY_MS,
  EMPTY_STREAK,
  MAX_BOX,
  advanceStreak,
  applyOutcome,
  clampBox,
  dayKey,
  describeNextReview,
  initialState,
  isDue,
  isLearned,
  liveStreak,
} from '../leitner';

const NOW = new Date('2026-03-10T09:00:00Z').getTime();

describe('scheduling', () => {
  it('makes a new card due immediately', () => {
    const state = initialState('affordance', NOW);
    expect(state.box).toBe(1);
    expect(isDue(state, NOW)).toBe(true);
  });

  it('promotes one box at a time and schedules that box interval', () => {
    let state = initialState('affordance', NOW);

    state = applyOutcome(state, 'got-it', NOW);
    expect(state.box).toBe(2);
    expect(state.dueAt).toBe(NOW + BOX_INTERVALS_DAYS[1] * DAY_MS);

    state = applyOutcome(state, 'got-it', NOW);
    expect(state.box).toBe(3);
    expect(state.dueAt).toBe(NOW + BOX_INTERVALS_DAYS[2] * DAY_MS);
  });

  it('never promotes past the last box', () => {
    let state = initialState('affordance', NOW);
    for (let i = 0; i < 10; i += 1) {
      state = applyOutcome(state, 'got-it', NOW);
    }
    expect(state.box).toBe(MAX_BOX);
    expect(isLearned(state)).toBe(true);
    expect(state.correctCount).toBe(10);
  });

  it('sends a lapse straight back to box one', () => {
    let state = initialState('affordance', NOW);
    state = applyOutcome(state, 'got-it', NOW);
    state = applyOutcome(state, 'got-it', NOW);
    expect(state.box).toBe(3);

    state = applyOutcome(state, 'review-again', NOW);
    expect(state.box).toBe(1);
    expect(state.lapseCount).toBe(1);
    expect(state.dueAt).toBe(NOW + BOX_INTERVALS_DAYS[0] * DAY_MS);
  });

  it('clamps a corrupt box value into range', () => {
    expect(clampBox(0)).toBe(1);
    expect(clampBox(99)).toBe(MAX_BOX);
    expect(clampBox(Number.NaN)).toBe(1);
  });

  it('describes the wait in days', () => {
    const state = applyOutcome(initialState('a', NOW), 'got-it', NOW);
    expect(describeNextReview(state, NOW)).toBe('Due in 3 days');
    expect(describeNextReview(state, state.dueAt)).toBe('Due now');
  });
});

describe('streaks', () => {
  it('starts at one on the first review', () => {
    expect(advanceStreak(EMPTY_STREAK, '2026-03-10')).toEqual({
      current: 1,
      longest: 1,
      lastDay: '2026-03-10',
    });
  });

  it('ignores a second review on the same day', () => {
    const first = advanceStreak(EMPTY_STREAK, '2026-03-10');
    expect(advanceStreak(first, '2026-03-10')).toBe(first);
  });

  it('extends across consecutive days, including month boundaries', () => {
    let streak = advanceStreak(EMPTY_STREAK, '2026-03-30');
    streak = advanceStreak(streak, '2026-03-31');
    streak = advanceStreak(streak, '2026-04-01');
    expect(streak.current).toBe(3);
    expect(streak.longest).toBe(3);
  });

  it('resets after a missed day but keeps the best run', () => {
    let streak = advanceStreak(EMPTY_STREAK, '2026-03-10');
    streak = advanceStreak(streak, '2026-03-11');
    streak = advanceStreak(streak, '2026-03-20');
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(2);
  });

  it('treats a streak as alive until a whole day has been missed', () => {
    const streak = { current: 4, longest: 6, lastDay: '2026-03-10' };
    expect(liveStreak(streak, '2026-03-10')).toBe(4);
    expect(liveStreak(streak, '2026-03-11')).toBe(4);
    expect(liveStreak(streak, '2026-03-12')).toBe(0);
  });

  it('keys days by local calendar date', () => {
    const local = new Date(2026, 2, 9, 23, 30);
    expect(dayKey(local.getTime())).toBe('2026-03-09');
  });
});
