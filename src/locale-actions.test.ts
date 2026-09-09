import { reducer, initialState, TYPES } from './AppReducer';
import { generateDailyProblems } from './utils/DailyChallenge';

describe('locale and daily challenge action isolation', () => {
  it('changes locale without changing game state before a challenge', () => {
    expect(
      reducer(initialState, { type: TYPES.SET_LOCALE, payload: 'es' }),
    ).toEqual({ ...initialState, locale: 'es' });
  });

  it('preserves the current problem and progress when changing language during a challenge', () => {
    const problems = generateDailyProblems();
    const started = reducer(
      { ...initialState, locale: 'es' },
      { type: TYPES.START_DAILY_CHALLENGE, payload: problems },
    );
    expect(started.locale).toBe('es');
    expect(started.dailyProblems).toEqual(problems);
    const progressed = { ...started, dailyProblemIndex: 3, score: 12 };
    expect(
      reducer(progressed, { type: TYPES.SET_LOCALE, payload: 'fr' }),
    ).toEqual({ ...progressed, locale: 'fr' });
    const ended = reducer(progressed, { type: TYPES.BACK_TO_LEVELS });
    expect(reducer(ended, { type: TYPES.SET_LOCALE, payload: 'en' })).toEqual({
      ...ended,
      locale: 'en',
    });
  });
});
