import {
  reducer,
  initialState,
  TYPES,
  randomNumberGenerator,
  calculatePoints,
  getAdaptiveDifficulty,
  getStreakMilestone,
  AppState,
  ActionType,
} from './AppReducer';

// Helper to create a state with overrides
const makeState = (overrides: Partial<AppState> = {}): AppState => ({
  ...initialState,
  ...overrides,
});

describe('randomNumberGenerator', () => {
  it('generates whole numbers within range', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomNumberGenerator(1, 9, 'wholeNumber');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('generates decimal numbers within range', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomNumberGenerator(1, 9, 'decimal');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(9);
      // Should have at most 2 decimal places
      const decimalPlaces = (result.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    }
  });

  it('respects min/max for medium difficulty range', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomNumberGenerator(10, 99, 'wholeNumber');
      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(99);
    }
  });

  it('respects min/max for hard difficulty range', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomNumberGenerator(100, 999, 'wholeNumber');
      expect(result).toBeGreaterThanOrEqual(100);
      expect(result).toBeLessThanOrEqual(999);
    }
  });
});

describe('getAdaptiveDifficulty', () => {
  it('returns medium when 3 correct on easy', () => {
    expect(getAdaptiveDifficulty('easy', [true, true, true])).toBe('medium');
  });

  it('returns hard when 3 correct on medium', () => {
    expect(getAdaptiveDifficulty('medium', [true, true, true])).toBe('hard');
  });

  it('returns null when 3 correct already on hard', () => {
    expect(getAdaptiveDifficulty('hard', [true, true, true])).toBeNull();
  });

  it('returns medium when 2 wrong on hard', () => {
    expect(getAdaptiveDifficulty('hard', [false, false])).toBe('medium');
  });

  it('returns easy when 2 wrong on medium', () => {
    expect(getAdaptiveDifficulty('medium', [false, false])).toBe('easy');
  });

  it('returns null when 2 wrong already on easy', () => {
    expect(getAdaptiveDifficulty('easy', [false, false])).toBeNull();
  });

  it('returns null for mixed results', () => {
    expect(getAdaptiveDifficulty('easy', [true, false, true])).toBeNull();
    expect(getAdaptiveDifficulty('medium', [false, true, false])).toBeNull();
    expect(getAdaptiveDifficulty('hard', [true, false])).toBeNull();
  });

  it('returns null when fewer than 2 results', () => {
    expect(getAdaptiveDifficulty('easy', [])).toBeNull();
    expect(getAdaptiveDifficulty('easy', [true])).toBeNull();
  });

  it('only looks at last 3 for increase and last 2 for decrease', () => {
    // Last 3 are correct even though earlier ones are wrong
    expect(
      getAdaptiveDifficulty('easy', [false, false, true, true, true]),
    ).toBe('medium');
    // Last 2 are wrong even though earlier ones are correct
    expect(
      getAdaptiveDifficulty('hard', [true, true, true, false, false]),
    ).toBe('medium');
  });
});

describe('reducer', () => {
  describe('RESTORE_STATE', () => {
    it('restores a saved state and sets isStoredState to true', () => {
      const savedState = makeState({
        numOfEnemies: 5,
        val1: 42,
        val2: 7,
        answer: '49',
        mode: 'multiplication',
        operator: '*',
        difficulty: 'hard',
        isStoredState: false,
      });

      const result = reducer(initialState, {
        type: TYPES.RESTORE_STATE,
        payload: savedState,
      });

      expect(result.numOfEnemies).toBe(5);
      expect(result.val1).toBe(42);
      expect(result.val2).toBe(7);
      expect(result.mode).toBe('multiplication');
      expect(result.isStoredState).toBe(true);
    });
  });

  describe('SET_ANSWER', () => {
    it('updates the answer field', () => {
      const state = makeState();
      const result = reducer(state, {
        type: TYPES.SET_ANSWER,
        payload: '42',
      });

      expect(result.answer).toBe('42');
    });

    it('sets isStoredState to false', () => {
      const state = makeState({ isStoredState: true });
      const result = reducer(state, {
        type: TYPES.SET_ANSWER,
        payload: '5',
      });

      expect(result.isStoredState).toBe(false);
    });
  });

  describe('SET_MODE', () => {
    it('changes operator to subtraction', () => {
      const state = makeState();
      const result = reducer(state, {
        type: TYPES.SET_MODE,
        payload: 'subtraction',
      });

      expect(result.mode).toBe('subtraction');
      expect(result.operator).toBe('-');
    });

    it('changes operator to multiplication', () => {
      const state = makeState();
      const result = reducer(state, {
        type: TYPES.SET_MODE,
        payload: 'multiplication',
      });

      expect(result.mode).toBe('multiplication');
      expect(result.operator).toBe('*');
    });

    it('changes operator to division', () => {
      const state = makeState();
      const result = reducer(state, {
        type: TYPES.SET_MODE,
        payload: 'division',
      });

      expect(result.mode).toBe('division');
      expect(result.operator).toBe('/');
    });

    it('generates new val1 and val2', () => {
      const state = makeState({ val1: 0, val2: 0 });
      const result = reducer(state, {
        type: TYPES.SET_MODE,
        payload: 'addition',
      });

      // New problem values should be generated (may still be 0 in rare cases,
      // but at least the fields exist)
      expect(result).toHaveProperty('val1');
      expect(result).toHaveProperty('val2');
      expect(typeof result.val1).toBe('number');
      expect(typeof result.val2).toBe('number');
    });
  });

  describe('SET_DIFFICULTY', () => {
    it('changes difficulty to medium and generates appropriate numbers', () => {
      const state = makeState({ difficulty: 'easy' });
      const result = reducer(state, {
        type: TYPES.SET_DIFFICULTY,
        payload: 'medium',
      });

      expect(result.difficulty).toBe('medium');
      expect(result.val1).toBeGreaterThanOrEqual(10);
      expect(result.val1).toBeLessThanOrEqual(99);
    });

    it('changes difficulty to hard and generates appropriate numbers', () => {
      const state = makeState({ difficulty: 'easy' });
      const result = reducer(state, {
        type: TYPES.SET_DIFFICULTY,
        payload: 'hard',
      });

      expect(result.difficulty).toBe('hard');
      expect(result.val1).toBeGreaterThanOrEqual(100);
      expect(result.val1).toBeLessThanOrEqual(999);
    });

    it('changes difficulty to easy and generates appropriate numbers', () => {
      const state = makeState({ difficulty: 'hard' });
      const result = reducer(state, {
        type: TYPES.SET_DIFFICULTY,
        payload: 'easy',
      });

      expect(result.difficulty).toBe('easy');
      expect(result.val1).toBeGreaterThanOrEqual(1);
      expect(result.val1).toBeLessThanOrEqual(9);
    });
  });

  describe('SET_MODE_TYPES', () => {
    it('changes mode type to decimals', () => {
      const state = makeState({ modeType: 'wholeNumber' });
      const result = reducer(state, {
        type: TYPES.SET_MODE_TYPES,
        payload: 'decimals',
      });

      expect(result.modeType).toBe('decimals');
    });

    it('changes mode type to wholeNumber', () => {
      const state = makeState({ modeType: 'decimals' });
      const result = reducer(state, {
        type: TYPES.SET_MODE_TYPES,
        payload: 'wholeNumber',
      });

      expect(result.modeType).toBe('wholeNumber');
      expect(Number.isInteger(result.val1)).toBe(true);
      expect(Number.isInteger(result.val2)).toBe(true);
    });

    it('changes mode type to negative', () => {
      const state = makeState({ modeType: 'wholeNumber' });
      const result = reducer(state, {
        type: TYPES.SET_MODE_TYPES,
        payload: 'negative',
      });

      expect(result.modeType).toBe('negative');
    });

    it('generates at least one negative value in negative mode', () => {
      let sawNegative = false;
      for (let i = 0; i < 50; i++) {
        const state = makeState({ modeType: 'negative' });
        const result = reducer(state, { type: TYPES.NEW_PROBLEM });
        if (result.val1 < 0 || result.val2 < 0) {
          sawNegative = true;
          break;
        }
      }
      expect(sawNegative).toBe(true);
    });

    it('negative mode produces integers (not decimals)', () => {
      for (let i = 0; i < 20; i++) {
        const state = makeState({ modeType: 'negative' });
        const result = reducer(state, { type: TYPES.NEW_PROBLEM });
        expect(Number.isInteger(result.val1)).toBe(true);
        expect(Number.isInteger(result.val2)).toBe(true);
      }
    });
  });

  describe('ADD_ENEMY', () => {
    it('increments numOfEnemies by 1', () => {
      const state = makeState({ numOfEnemies: 3 });
      const result = reducer(state, { type: TYPES.ADD_ENEMY });

      expect(result.numOfEnemies).toBe(4);
    });

    it('updates previousNumOfEnemies to the old numOfEnemies', () => {
      const state = makeState({ numOfEnemies: 3, previousNumOfEnemies: 2 });
      const result = reducer(state, { type: TYPES.ADD_ENEMY });

      expect(result.previousNumOfEnemies).toBe(3);
      expect(result.numOfEnemies).toBe(4);
    });

    it('does not exceed 6 enemies', () => {
      const state = makeState({ numOfEnemies: 6 });
      const result = reducer(state, { type: TYPES.ADD_ENEMY });

      expect(result.numOfEnemies).toBe(6);
    });
  });

  describe('REMOVE_ENEMY', () => {
    it('decrements numOfEnemies by 1', () => {
      const state = makeState({ numOfEnemies: 3 });
      const result = reducer(state, { type: TYPES.REMOVE_ENEMY });

      expect(result.numOfEnemies).toBe(2);
    });

    it('updates previousNumOfEnemies to the old numOfEnemies', () => {
      const state = makeState({ numOfEnemies: 3, previousNumOfEnemies: 2 });
      const result = reducer(state, { type: TYPES.REMOVE_ENEMY });

      expect(result.previousNumOfEnemies).toBe(3);
    });

    it('sets won to true when numOfEnemies reaches 0', () => {
      const state = makeState({ numOfEnemies: 1 });
      const result = reducer(state, { type: TYPES.REMOVE_ENEMY });

      expect(result.numOfEnemies).toBe(0);
      expect(result.won).toBe(true);
    });

    it('does not set won when enemies remain', () => {
      const state = makeState({ numOfEnemies: 2 });
      const result = reducer(state, { type: TYPES.REMOVE_ENEMY });

      expect(result.won).toBe(false);
    });
  });

  describe('NEW_PROBLEM', () => {
    it('generates new val1 and val2 and clears answer', () => {
      const state = makeState({ val1: 5, val2: 3, answer: '8' });
      const result = reducer(state, { type: TYPES.NEW_PROBLEM });

      expect(result.answer).toBe('');
      expect(typeof result.val1).toBe('number');
      expect(typeof result.val2).toBe('number');
    });

    it('preserves other state properties', () => {
      const state = makeState({
        numOfEnemies: 4,
        mode: 'subtraction',
        operator: '-',
        difficulty: 'medium',
        val1: 50,
        val2: 30,
      });
      const result = reducer(state, { type: TYPES.NEW_PROBLEM });

      expect(result.numOfEnemies).toBe(4);
      expect(result.mode).toBe('subtraction');
      expect(result.operator).toBe('-');
      expect(result.difficulty).toBe('medium');
    });
  });

  describe('CHECK_ANSWER', () => {
    it('removes an enemy when the answer is correct (addition)', () => {
      const state = makeState({
        val1: 3,
        val2: 4,
        operator: '+',
        mode: 'addition',
        answer: '7',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.numOfEnemies).toBe(2);
      expect(result.answer).toBe('');
    });

    it('adds an enemy when the answer is wrong 3 times', () => {
      const state = makeState({
        val1: 3,
        val2: 4,
        operator: '+',
        mode: 'addition',
        answer: '999',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        attempts: 2,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.numOfEnemies).toBe(4);
      expect(result.answer).toBe('');
    });

    it('handles subtraction correctly', () => {
      const state = makeState({
        val1: 9,
        val2: 4,
        operator: '-',
        mode: 'subtraction',
        answer: '5',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.numOfEnemies).toBe(2);
    });

    it('handles multiplication correctly', () => {
      const state = makeState({
        val1: 3,
        val2: 4,
        operator: '*',
        mode: 'multiplication',
        answer: '12',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.numOfEnemies).toBe(2);
    });

    it('handles division correctly', () => {
      const state = makeState({
        val1: 8,
        val2: 4,
        operator: '/',
        mode: 'division',
        answer: '2',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.numOfEnemies).toBe(2);
    });

    it('sets won to true when last enemy is defeated', () => {
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '5',
        numOfEnemies: 1,
        modeType: 'wholeNumber',
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.numOfEnemies).toBe(0);
      expect(result.won).toBe(true);
    });

    it('pushes to recentResults on correct answer', () => {
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '5',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        recentResults: [false],
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.recentResults).toEqual([false, true]);
    });

    it('pushes to recentResults on wrong answer', () => {
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '999',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        recentResults: [true],
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.recentResults).toEqual([true, false]);
    });

    it('keeps recentResults to max 5 entries', () => {
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '5',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        recentResults: [true, false, true, false, true],
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.recentResults.length).toBe(5);
      expect(result.recentResults[4]).toBe(true);
    });

    it('auto-adjusts difficulty up after 3 correct with adaptive on', () => {
      const startTime = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 3000);
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '5',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        difficulty: 'easy',
        recentResults: [true, true],
        adaptiveDifficulty: true,
        questionStartTime: startTime,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.difficulty).toBe('medium');
      expect(result.adaptiveMessage).toBe("Great job! Here's a harder one!");
      jest.restoreAllMocks();
    });

    it('auto-adjusts difficulty down after 2 wrong with adaptive on', () => {
      const startTime = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 3000);
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '999',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        difficulty: 'hard',
        recentResults: [false],
        adaptiveDifficulty: true,
        questionStartTime: startTime,
        attempts: 2,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.difficulty).toBe('medium');
      expect(result.adaptiveMessage).toBe("Let's practice with easier ones!");
      jest.restoreAllMocks();
    });

    it('does not auto-adjust when adaptive is off', () => {
      const startTime = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 3000);
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '5',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        difficulty: 'easy',
        recentResults: [true, true],
        adaptiveDifficulty: false,
        questionStartTime: startTime,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.difficulty).toBe('easy');
      expect(result.adaptiveMessage).toBeNull();
      jest.restoreAllMocks();
    });

    it('wrong attempt 1: increments attempts/hintLevel, enemy count unchanged', () => {
      const state = makeState({
        val1: 3,
        val2: 4,
        operator: '+',
        mode: 'addition',
        answer: '999',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        attempts: 0,
        hintLevel: 0,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.numOfEnemies).toBe(3);
      expect(result.attempts).toBe(1);
      expect(result.hintLevel).toBe(1);
      expect(result.answer).toBe('');
    });

    it('wrong attempt 2: increments attempts/hintLevel, enemy count unchanged', () => {
      const state = makeState({
        val1: 3,
        val2: 4,
        operator: '+',
        mode: 'addition',
        answer: '999',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        attempts: 1,
        hintLevel: 1,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.numOfEnemies).toBe(3);
      expect(result.attempts).toBe(2);
      expect(result.hintLevel).toBe(2);
      expect(result.answer).toBe('');
    });

    it('wrong attempt 3: adds enemy, reveals answer, generates new problem', () => {
      const state = makeState({
        val1: 3,
        val2: 4,
        operator: '+',
        mode: 'addition',
        answer: '999',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        attempts: 2,
        hintLevel: 2,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.numOfEnemies).toBe(4);
      expect(result.attempts).toBe(3);
      expect(result.hintLevel).toBe(3);
    });

    it('correct on attempt 2: removes enemy, awards 50% points', () => {
      const startTime = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 3000);
      const state = makeState({
        val1: 3,
        val2: 4,
        operator: '+',
        mode: 'addition',
        answer: '7',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        attempts: 1,
        hintLevel: 1,
        questionStartTime: startTime,
        score: 0,
        bestScore: 0,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });

      expect(result.numOfEnemies).toBe(2);
      expect(result.attempts).toBe(0);
      expect(result.hintLevel).toBe(0);
      // 10 base points * 0.5 = 5
      expect(result.score).toBe(5);
      jest.restoreAllMocks();
    });
  });

  describe('RESTART', () => {
    it('resets to initial state but keeps mode, difficulty, and modeType', () => {
      const state = makeState({
        numOfEnemies: 1,
        answer: '42',
        won: true,
        mode: 'multiplication',
        operator: '*',
        difficulty: 'hard',
        modeType: 'wholeNumber',
      });
      const result = reducer(state, { type: TYPES.RESTART });

      expect(result.numOfEnemies).toBe(initialState.numOfEnemies);
      expect(result.answer).toBe('');
      expect(result.won).toBe(false);
      expect(result.mode).toBe('multiplication');
      expect(result.operator).toBe('*');
      expect(result.difficulty).toBe('hard');
      expect(result.modeType).toBe('wholeNumber');
    });

    it('generates new problem values', () => {
      const state = makeState();
      const result = reducer(state, { type: TYPES.RESTART });

      expect(typeof result.val1).toBe('number');
      expect(typeof result.val2).toBe('number');
    });

    it('preserves the correct operator for each mode on restart', () => {
      const modes = [
        { mode: 'addition' as const, op: '+' as const },
        { mode: 'subtraction' as const, op: '-' as const },
        { mode: 'multiplication' as const, op: '*' as const },
        { mode: 'division' as const, op: '/' as const },
      ];

      for (const { mode, op } of modes) {
        const state = makeState({ mode, operator: op });
        const result = reducer(state, { type: TYPES.RESTART });
        expect(result.operator).toBe(op);
      }
    });

    it('clears recentResults but preserves adaptiveDifficulty', () => {
      const state = makeState({
        recentResults: [true, false, true],
        adaptiveDifficulty: true,
      });
      const result = reducer(state, { type: TYPES.RESTART });

      expect(result.recentResults).toEqual([]);
      expect(result.adaptiveDifficulty).toBe(true);
    });

    it('preserves adaptiveDifficulty=false through restart', () => {
      const state = makeState({
        recentResults: [true, false],
        adaptiveDifficulty: false,
      });
      const result = reducer(state, { type: TYPES.RESTART });

      expect(result.recentResults).toEqual([]);
      expect(result.adaptiveDifficulty).toBe(false);
    });
  });

  describe('SET_ADAPTIVE', () => {
    it('toggles adaptiveDifficulty on', () => {
      const state = makeState({ adaptiveDifficulty: false });
      const result = reducer(state, {
        type: TYPES.SET_ADAPTIVE,
        payload: true,
      });
      expect(result.adaptiveDifficulty).toBe(true);
      expect(result.adaptiveMessage).toBeNull();
    });

    it('toggles adaptiveDifficulty off', () => {
      const state = makeState({ adaptiveDifficulty: true });
      const result = reducer(state, {
        type: TYPES.SET_ADAPTIVE,
        payload: false,
      });
      expect(result.adaptiveDifficulty).toBe(false);
      expect(result.adaptiveMessage).toBeNull();
    });
  });

  describe('START_TIMER', () => {
    it('sets questionStartTime to current time', () => {
      const now = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(now);
      const state = makeState({ questionStartTime: 0 });
      const result = reducer(state, { type: TYPES.START_TIMER });
      expect(result.questionStartTime).toBe(now);
      jest.restoreAllMocks();
    });
  });

  describe('CHECK_ANSWER with scoring', () => {
    it('awards 10 points for a correct answer under 5 seconds', () => {
      const startTime = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 3000);
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '5',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        questionStartTime: startTime,
        score: 0,
        bestScore: 0,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });
      expect(result.score).toBe(10);
      expect(result.lastPointsEarned).toBe(10);
      jest.restoreAllMocks();
    });

    it('awards 8 points for a correct answer under 10 seconds', () => {
      const startTime = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 7000);
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '5',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        questionStartTime: startTime,
        score: 0,
        bestScore: 0,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });
      expect(result.score).toBe(8);
      jest.restoreAllMocks();
    });

    it('awards 0 points for a wrong answer', () => {
      const startTime = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 2000);
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '999',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        questionStartTime: startTime,
        score: 5,
        bestScore: 5,
        attempts: 2,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });
      expect(result.score).toBe(5);
      expect(result.lastPointsEarned).toBe(0);
      jest.restoreAllMocks();
    });

    it('accumulates score across multiple correct answers', () => {
      const startTime = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 3000);
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '5',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        questionStartTime: startTime,
        score: 20,
        bestScore: 20,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });
      expect(result.score).toBe(30);
      jest.restoreAllMocks();
    });

    it('updates bestScore when score exceeds it', () => {
      const startTime = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(startTime + 3000);
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '5',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
        questionStartTime: startTime,
        score: 50,
        bestScore: 55,
      });
      const result = reducer(state, { type: TYPES.CHECK_ANSWER });
      expect(result.score).toBe(60);
      expect(result.bestScore).toBe(60);
      jest.restoreAllMocks();
    });
  });

  describe('RESTART with scoring', () => {
    it('resets score to 0 but preserves bestScore', () => {
      const state = makeState({
        score: 42,
        bestScore: 58,
        won: true,
      });
      const result = reducer(state, { type: TYPES.RESTART });
      expect(result.score).toBe(0);
      expect(result.bestScore).toBe(58);
    });
  });

  describe('invalid action', () => {
    it('throws an error for unknown action types', () => {
      const state = makeState();
      expect(() => {
        reducer(state, { type: 999 as any });
      }).toThrow('Invalid action 999');
    });
  });
});

describe('calculatePoints', () => {
  it('returns 10 for under 5 seconds', () => {
    expect(calculatePoints(0)).toBe(10);
    expect(calculatePoints(2000)).toBe(10);
    expect(calculatePoints(4999)).toBe(10);
  });

  it('returns 8 for under 10 seconds', () => {
    expect(calculatePoints(5000)).toBe(8);
    expect(calculatePoints(9999)).toBe(8);
  });

  it('returns 6 for under 15 seconds', () => {
    expect(calculatePoints(10000)).toBe(6);
    expect(calculatePoints(14999)).toBe(6);
  });

  it('returns 4 for under 20 seconds', () => {
    expect(calculatePoints(15000)).toBe(4);
    expect(calculatePoints(19999)).toBe(4);
  });

  it('returns 2 for under 25 seconds', () => {
    expect(calculatePoints(20000)).toBe(2);
    expect(calculatePoints(24999)).toBe(2);
  });

  it('returns 1 for 25 seconds or more', () => {
    expect(calculatePoints(25000)).toBe(1);
    expect(calculatePoints(30000)).toBe(1);
    expect(calculatePoints(100000)).toBe(1);
  });
});

describe('getStreakMilestone', () => {
  it('returns milestone at 3', () => {
    const m = getStreakMilestone(3);
    expect(m).toEqual({ label: 'Nice!', bonus: 2 });
  });

  it('returns milestone at 5', () => {
    expect(getStreakMilestone(5)).toEqual({ label: 'On Fire!', bonus: 5 });
  });

  it('returns milestone at 10', () => {
    expect(getStreakMilestone(10)).toEqual({
      label: 'Unstoppable!',
      bonus: 10,
    });
  });

  it('returns milestone at 15', () => {
    expect(getStreakMilestone(15)).toEqual({ label: 'LEGENDARY!', bonus: 15 });
  });

  it('returns null for non-milestone streaks', () => {
    expect(getStreakMilestone(1)).toBeNull();
    expect(getStreakMilestone(2)).toBeNull();
    expect(getStreakMilestone(4)).toBeNull();
    expect(getStreakMilestone(7)).toBeNull();
    expect(getStreakMilestone(20)).toBeNull();
  });
});

describe('streak system', () => {
  it('CHECK_ANSWER correct increments streak', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now + 3000);
    const state: AppState = {
      ...initialState,
      val1: 2,
      val2: 3,
      operator: '+' as const,
      answer: '5',
      numOfEnemies: 3,
      previousNumOfEnemies: 3,
      questionStartTime: now,
      streak: 0,
      maxStreak: 0,
      streakBonus: 0,
    };
    const result = reducer(state, { type: TYPES.CHECK_ANSWER });
    expect(result.streak).toBe(1);
    jest.restoreAllMocks();
  });

  it('CHECK_ANSWER correct at milestone 3 awards bonus', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now + 3000);
    const state: AppState = {
      ...initialState,
      val1: 2,
      val2: 3,
      operator: '+' as const,
      answer: '5',
      numOfEnemies: 3,
      previousNumOfEnemies: 3,
      questionStartTime: now,
      streak: 2,
      maxStreak: 2,
      streakBonus: 0,
    };
    const result = reducer(state, { type: TYPES.CHECK_ANSWER });
    expect(result.streak).toBe(3);
    expect(result.streakBonus).toBe(2); // Nice! milestone
    jest.restoreAllMocks();
  });

  it('CHECK_ANSWER wrong after 3 attempts resets streak', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now + 3000);
    const state: AppState = {
      ...initialState,
      val1: 2,
      val2: 3,
      operator: '+' as const,
      answer: '99',
      numOfEnemies: 3,
      previousNumOfEnemies: 3,
      questionStartTime: now,
      streak: 5,
      maxStreak: 5,
      streakBonus: 0,
      attempts: 2,
      hintLevel: 2,
    };
    const result = reducer(state, { type: TYPES.CHECK_ANSWER });
    expect(result.streak).toBe(0);
    expect(result.streakBonus).toBe(0);
    jest.restoreAllMocks();
  });

  it('RESTART resets streak but preserves maxStreak', () => {
    const state: AppState = {
      ...initialState,
      streak: 8,
      maxStreak: 12,
    };
    const result = reducer(state, { type: TYPES.RESTART });
    expect(result.streak).toBe(0);
    expect(result.maxStreak).toBe(12);
  });
});
