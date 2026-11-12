import {
  initialState,
  reducer,
  TYPES,
  calculateStars,
  ActionType,
} from './AppReducer';
import { LEVELS } from './levels';
import { getDailyHistory, saveDailyResult } from './utils/DailyChallenge';

afterEach(() => vi.restoreAllMocks());

it('gives identical points and stars for fast and slow practice answers', () => {
  const state = {
    ...initialState,
    practiceMode: true,
    val1: 2,
    val2: 3,
    answer: '5',
    numOfEnemies: 1,
    questionStartTime: 1000,
    bestScore: 99,
  };
  vi.spyOn(Date, 'now').mockReturnValue(2000);
  const fast = reducer(state, { type: TYPES.CHECK_ANSWER });
  vi.mocked(Date.now).mockReturnValue(601000);
  const slow = reducer(state, { type: TYPES.CHECK_ANSWER });
  expect(slow.score).toBe(fast.score);
  expect(slow.starsEarned).toBe(3);
  expect(slow.bestScore).toBe(99);
  expect(slow.practiceBestScore).toBe(10);
  expect(calculateStars(10, 10, 600000, false)).toBe(2);
});

it('separates level records and preserves both when changing modes', () => {
  const existing = {
    levelId: 1,
    completed: true,
    stars: 2,
    bestScore: 12,
    bestAccuracy: 80,
  };
  const won = reducer(
    {
      ...initialState,
      practiceMode: true,
      currentLevel: LEVELS[0],
      levelProgress: { 1: existing },
      score: 30,
      totalAttempts: 3,
      correctAttempts: 3,
      starsEarned: 3,
    },
    { type: TYPES.COMPLETE_LEVEL },
  );
  expect(won.levelProgress[1]).toEqual(existing);
  expect(won.practiceLevelProgress[1].stars).toBe(3);
  const menu = reducer(won, { type: TYPES.BACK_TO_LEVELS });
  const timed = reducer(menu, { type: TYPES.SET_PRACTICE, payload: false });
  expect(timed.practiceLevelProgress).toEqual(won.practiceLevelProgress);
  expect(timed.levelProgress[1]).toEqual(existing);
});

it('does not allow scoring rules to change mid-round', () => {
  const playing = reducer(initialState, { type: TYPES.PLAY_FREE });
  expect(reducer(playing, { type: TYPES.SET_PRACTICE, payload: true })).toEqual(
    playing,
  );
});

it('defaults legacy saves to timed and preserves existing records', () => {
  const progress = {
    1: {
      levelId: 1,
      completed: true,
      stars: 2,
      bestScore: 12,
      bestAccuracy: 80,
    },
  };
  const restored = reducer(initialState, {
    type: TYPES.RESTORE_STATE,
    payload: { levelProgress: progress, bestScore: 42 },
  });
  expect(restored.practiceMode).toBe(false);
  expect(restored.practiceLevelProgress).toEqual({});
  expect(restored.levelProgress).toEqual(progress);
  expect(restored.bestScore).toBe(42);
});

it('preserves practice settings and records across all new-round actions', () => {
  const saved = {
    ...initialState,
    practiceMode: true,
    practiceBestScore: 100,
    bestScore: 50,
    practiceLevelProgress: {
      1: {
        levelId: 1,
        completed: true,
        stars: 3,
        bestScore: 30,
        bestAccuracy: 100,
      },
    },
  };
  for (const action of [
    { type: TYPES.PLAY_FREE },
    { type: TYPES.RESTART },
    { type: TYPES.SELECT_LEVEL, payload: LEVELS[0] },
    {
      type: TYPES.START_DAILY_CHALLENGE,
      payload: [
        {
          val1: 2,
          val2: 3,
          operator: '+',
          mode: 'addition',
          difficulty: 'easy',
        },
      ],
    },
  ] as ActionType[]) {
    const next = reducer(saved, action);
    expect(next.practiceMode).toBe(true);
    expect(next.practiceBestScore).toBe(100);
    expect(next.bestScore).toBe(50);
    expect(next.practiceLevelProgress).toEqual(saved.practiceLevelProgress);
  }
});

it('keeps practice daily results separate from legacy timed history', () => {
  localStorage.clear();
  saveDailyResult({
    date: '2026-11-12',
    score: 20,
    accuracy: 80,
    completed: true,
  });
  saveDailyResult(
    { date: '2026-11-12', score: 30, accuracy: 100, completed: true },
    true,
  );
  expect(getDailyHistory()['2026-11-12'].score).toBe(20);
  expect(getDailyHistory(true)['2026-11-12'].score).toBe(30);
});
