import { reducer, initialState, TYPES, randomNumberGenerator, AppState, ActionType } from './AppReducer'

// Helper to create a state with overrides
const makeState = (overrides: Partial<AppState> = {}): AppState => ({
  ...initialState,
  ...overrides,
})

describe('randomNumberGenerator', () => {
  it('generates whole numbers within range', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomNumberGenerator(1, 9, 'wholeNumber')
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(9)
      expect(Number.isInteger(result)).toBe(true)
    }
  })

  it('generates decimal numbers within range', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomNumberGenerator(1, 9, 'decimal')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(9)
      // Should have at most 2 decimal places
      const decimalPlaces = (result.toString().split('.')[1] || '').length
      expect(decimalPlaces).toBeLessThanOrEqual(2)
    }
  })

  it('respects min/max for medium difficulty range', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomNumberGenerator(10, 99, 'wholeNumber')
      expect(result).toBeGreaterThanOrEqual(10)
      expect(result).toBeLessThanOrEqual(99)
    }
  })

  it('respects min/max for hard difficulty range', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomNumberGenerator(100, 999, 'wholeNumber')
      expect(result).toBeGreaterThanOrEqual(100)
      expect(result).toBeLessThanOrEqual(999)
    }
  })
})

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
      })

      const result = reducer(initialState, {
        type: TYPES.RESTORE_STATE,
        payload: savedState,
      })

      expect(result.numOfEnemies).toBe(5)
      expect(result.val1).toBe(42)
      expect(result.val2).toBe(7)
      expect(result.mode).toBe('multiplication')
      expect(result.isStoredState).toBe(true)
    })
  })

  describe('SET_ANSWER', () => {
    it('updates the answer field', () => {
      const state = makeState()
      const result = reducer(state, {
        type: TYPES.SET_ANSWER,
        payload: '42',
      })

      expect(result.answer).toBe('42')
    })

    it('sets isStoredState to false', () => {
      const state = makeState({ isStoredState: true })
      const result = reducer(state, {
        type: TYPES.SET_ANSWER,
        payload: '5',
      })

      expect(result.isStoredState).toBe(false)
    })
  })

  describe('SET_MODE', () => {
    it('changes operator to subtraction', () => {
      const state = makeState()
      const result = reducer(state, {
        type: TYPES.SET_MODE,
        payload: 'subtraction',
      })

      expect(result.mode).toBe('subtraction')
      expect(result.operator).toBe('-')
    })

    it('changes operator to multiplication', () => {
      const state = makeState()
      const result = reducer(state, {
        type: TYPES.SET_MODE,
        payload: 'multiplication',
      })

      expect(result.mode).toBe('multiplication')
      expect(result.operator).toBe('*')
    })

    it('changes operator to division', () => {
      const state = makeState()
      const result = reducer(state, {
        type: TYPES.SET_MODE,
        payload: 'division',
      })

      expect(result.mode).toBe('division')
      expect(result.operator).toBe('/')
    })

    it('generates new val1 and val2', () => {
      const state = makeState({ val1: 0, val2: 0 })
      const result = reducer(state, {
        type: TYPES.SET_MODE,
        payload: 'addition',
      })

      // New problem values should be generated (may still be 0 in rare cases,
      // but at least the fields exist)
      expect(result).toHaveProperty('val1')
      expect(result).toHaveProperty('val2')
      expect(typeof result.val1).toBe('number')
      expect(typeof result.val2).toBe('number')
    })
  })

  describe('SET_DIFFICULTY', () => {
    it('changes difficulty to medium and generates appropriate numbers', () => {
      const state = makeState({ difficulty: 'easy' })
      const result = reducer(state, {
        type: TYPES.SET_DIFFICULTY,
        payload: 'medium',
      })

      expect(result.difficulty).toBe('medium')
      expect(result.val1).toBeGreaterThanOrEqual(10)
      expect(result.val1).toBeLessThanOrEqual(99)
    })

    it('changes difficulty to hard and generates appropriate numbers', () => {
      const state = makeState({ difficulty: 'easy' })
      const result = reducer(state, {
        type: TYPES.SET_DIFFICULTY,
        payload: 'hard',
      })

      expect(result.difficulty).toBe('hard')
      expect(result.val1).toBeGreaterThanOrEqual(100)
      expect(result.val1).toBeLessThanOrEqual(999)
    })

    it('changes difficulty to easy and generates appropriate numbers', () => {
      const state = makeState({ difficulty: 'hard' })
      const result = reducer(state, {
        type: TYPES.SET_DIFFICULTY,
        payload: 'easy',
      })

      expect(result.difficulty).toBe('easy')
      expect(result.val1).toBeGreaterThanOrEqual(1)
      expect(result.val1).toBeLessThanOrEqual(9)
    })
  })

  describe('SET_MODE_TYPES', () => {
    it('changes mode type to decimals', () => {
      const state = makeState({ modeType: 'wholeNumber' })
      const result = reducer(state, {
        type: TYPES.SET_MODE_TYPES,
        payload: 'decimals',
      })

      expect(result.modeType).toBe('decimals')
    })

    it('changes mode type to wholeNumber', () => {
      const state = makeState({ modeType: 'decimals' })
      const result = reducer(state, {
        type: TYPES.SET_MODE_TYPES,
        payload: 'wholeNumber',
      })

      expect(result.modeType).toBe('wholeNumber')
      expect(Number.isInteger(result.val1)).toBe(true)
      expect(Number.isInteger(result.val2)).toBe(true)
    })
  })

  describe('ADD_ENEMY', () => {
    it('increments numOfEnemies by 1', () => {
      const state = makeState({ numOfEnemies: 3 })
      const result = reducer(state, { type: TYPES.ADD_ENEMY })

      expect(result.numOfEnemies).toBe(4)
    })

    it('updates previousNumOfEnemies to the old numOfEnemies', () => {
      const state = makeState({ numOfEnemies: 3, previousNumOfEnemies: 2 })
      const result = reducer(state, { type: TYPES.ADD_ENEMY })

      expect(result.previousNumOfEnemies).toBe(3)
      expect(result.numOfEnemies).toBe(4)
    })

    it('does not exceed 6 enemies', () => {
      const state = makeState({ numOfEnemies: 6 })
      const result = reducer(state, { type: TYPES.ADD_ENEMY })

      expect(result.numOfEnemies).toBe(6)
    })
  })

  describe('REMOVE_ENEMY', () => {
    it('decrements numOfEnemies by 1', () => {
      const state = makeState({ numOfEnemies: 3 })
      const result = reducer(state, { type: TYPES.REMOVE_ENEMY })

      expect(result.numOfEnemies).toBe(2)
    })

    it('updates previousNumOfEnemies to the old numOfEnemies', () => {
      const state = makeState({ numOfEnemies: 3, previousNumOfEnemies: 2 })
      const result = reducer(state, { type: TYPES.REMOVE_ENEMY })

      expect(result.previousNumOfEnemies).toBe(3)
    })

    it('sets won to true when numOfEnemies reaches 0', () => {
      const state = makeState({ numOfEnemies: 1 })
      const result = reducer(state, { type: TYPES.REMOVE_ENEMY })

      expect(result.numOfEnemies).toBe(0)
      expect(result.won).toBe(true)
    })

    it('does not set won when enemies remain', () => {
      const state = makeState({ numOfEnemies: 2 })
      const result = reducer(state, { type: TYPES.REMOVE_ENEMY })

      expect(result.won).toBe(false)
    })
  })

  describe('NEW_PROBLEM', () => {
    it('generates new val1 and val2 and clears answer', () => {
      const state = makeState({ val1: 5, val2: 3, answer: '8' })
      const result = reducer(state, { type: TYPES.NEW_PROBLEM })

      expect(result.answer).toBe('')
      expect(typeof result.val1).toBe('number')
      expect(typeof result.val2).toBe('number')
    })

    it('preserves other state properties', () => {
      const state = makeState({
        numOfEnemies: 4,
        mode: 'subtraction',
        operator: '-',
        difficulty: 'medium',
        val1: 50,
        val2: 30,
      })
      const result = reducer(state, { type: TYPES.NEW_PROBLEM })

      expect(result.numOfEnemies).toBe(4)
      expect(result.mode).toBe('subtraction')
      expect(result.operator).toBe('-')
      expect(result.difficulty).toBe('medium')
    })
  })

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
      })
      const result = reducer(state, { type: TYPES.CHECK_ANSWER })

      expect(result.numOfEnemies).toBe(2)
      expect(result.answer).toBe('')
    })

    it('adds an enemy when the answer is wrong', () => {
      const state = makeState({
        val1: 3,
        val2: 4,
        operator: '+',
        mode: 'addition',
        answer: '999',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
      })
      const result = reducer(state, { type: TYPES.CHECK_ANSWER })

      expect(result.numOfEnemies).toBe(4)
      expect(result.answer).toBe('')
    })

    it('handles subtraction correctly', () => {
      const state = makeState({
        val1: 9,
        val2: 4,
        operator: '-',
        mode: 'subtraction',
        answer: '5',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
      })
      const result = reducer(state, { type: TYPES.CHECK_ANSWER })

      expect(result.numOfEnemies).toBe(2)
    })

    it('handles multiplication correctly', () => {
      const state = makeState({
        val1: 3,
        val2: 4,
        operator: '*',
        mode: 'multiplication',
        answer: '12',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
      })
      const result = reducer(state, { type: TYPES.CHECK_ANSWER })

      expect(result.numOfEnemies).toBe(2)
    })

    it('handles division correctly', () => {
      const state = makeState({
        val1: 8,
        val2: 4,
        operator: '/',
        mode: 'division',
        answer: '2',
        numOfEnemies: 3,
        modeType: 'wholeNumber',
      })
      const result = reducer(state, { type: TYPES.CHECK_ANSWER })

      expect(result.numOfEnemies).toBe(2)
    })

    it('sets won to true when last enemy is defeated', () => {
      const state = makeState({
        val1: 2,
        val2: 3,
        operator: '+',
        mode: 'addition',
        answer: '5',
        numOfEnemies: 1,
        modeType: 'wholeNumber',
      })
      const result = reducer(state, { type: TYPES.CHECK_ANSWER })

      expect(result.numOfEnemies).toBe(0)
      expect(result.won).toBe(true)
    })
  })

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
      })
      const result = reducer(state, { type: TYPES.RESTART })

      expect(result.numOfEnemies).toBe(initialState.numOfEnemies)
      expect(result.answer).toBe('')
      expect(result.won).toBe(false)
      expect(result.mode).toBe('multiplication')
      expect(result.operator).toBe('*')
      expect(result.difficulty).toBe('hard')
      expect(result.modeType).toBe('wholeNumber')
    })

    it('generates new problem values', () => {
      const state = makeState()
      const result = reducer(state, { type: TYPES.RESTART })

      expect(typeof result.val1).toBe('number')
      expect(typeof result.val2).toBe('number')
    })

    it('preserves the correct operator for each mode on restart', () => {
      const modes = [
        { mode: 'addition' as const, op: '+' as const },
        { mode: 'subtraction' as const, op: '-' as const },
        { mode: 'multiplication' as const, op: '*' as const },
        { mode: 'division' as const, op: '/' as const },
      ]

      for (const { mode, op } of modes) {
        const state = makeState({ mode, operator: op })
        const result = reducer(state, { type: TYPES.RESTART })
        expect(result.operator).toBe(op)
      }
    })
  })

  describe('invalid action', () => {
    it('throws an error for unknown action types', () => {
      const state = makeState()
      expect(() => {
        reducer(state, { type: 999 as any })
      }).toThrow('Invalid action 999')
    })
  })
})
