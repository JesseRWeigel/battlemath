import {
  generateDailyProblems,
  getTodayKey,
  getDailyStreak,
  getDailyHistory,
  saveDailyResult,
  DailyProblem,
} from './DailyChallenge';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe('generateDailyProblems', () => {
  it('returns exactly 10 problems', () => {
    const problems = generateDailyProblems();
    expect(problems).toHaveLength(10);
  });

  it('each problem has required fields', () => {
    const problems = generateDailyProblems();
    for (const p of problems) {
      expect(p).toHaveProperty('val1');
      expect(p).toHaveProperty('val2');
      expect(p).toHaveProperty('operator');
      expect(p).toHaveProperty('mode');
      expect(p).toHaveProperty('difficulty');
      expect(typeof p.val1).toBe('number');
      expect(typeof p.val2).toBe('number');
      expect(['+', '-', '*', '/']).toContain(p.operator);
      expect([
        'addition',
        'subtraction',
        'multiplication',
        'division',
      ]).toContain(p.mode);
      expect(['easy', 'medium', 'hard']).toContain(p.difficulty);
    }
  });

  it('is deterministic — same call produces same problems', () => {
    const first = generateDailyProblems();
    const second = generateDailyProblems();
    expect(first).toEqual(second);
  });

  it('division problems divide evenly', () => {
    const problems = generateDailyProblems().filter((p) => p.operator === '/');
    for (const p of problems) {
      expect(p.val1 % p.val2).toBe(0);
    }
  });

  it('subtraction problems do not go negative', () => {
    const problems = generateDailyProblems().filter((p) => p.operator === '-');
    for (const p of problems) {
      expect(p.val1).toBeGreaterThanOrEqual(p.val2);
    }
  });
});

describe('getTodayKey', () => {
  it('returns YYYY-MM-DD format', () => {
    const key = getTodayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches current date', () => {
    const key = getTodayKey();
    const d = new Date();
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(key).toBe(expected);
  });
});

describe('getDailyStreak', () => {
  it('returns 0 when no history', () => {
    expect(getDailyStreak()).toBe(0);
  });

  it('returns 1 when only today is completed', () => {
    const today = getTodayKey();
    saveDailyResult({ date: today, score: 50, accuracy: 80, completed: true });
    expect(getDailyStreak()).toBe(1);
  });

  it('counts consecutive days', () => {
    const d = new Date();
    for (let i = 0; i < 5; i++) {
      const day = new Date(d);
      day.setDate(day.getDate() - i);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      saveDailyResult({ date: key, score: 50, accuracy: 80, completed: true });
    }
    expect(getDailyStreak()).toBe(5);
  });

  it('stops counting at gap', () => {
    const d = new Date();
    // Complete today and yesterday, skip day before
    for (const offset of [0, 1, 3, 4]) {
      const day = new Date(d);
      day.setDate(day.getDate() - offset);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      saveDailyResult({ date: key, score: 50, accuracy: 80, completed: true });
    }
    expect(getDailyStreak()).toBe(2); // today + yesterday, gap at day -2
  });
});

describe('saveDailyResult / getDailyHistory', () => {
  it('saves and retrieves a result', () => {
    saveDailyResult({
      date: '2026-03-18',
      score: 100,
      accuracy: 95,
      completed: true,
    });
    const history = getDailyHistory();
    expect(history['2026-03-18']).toEqual({
      date: '2026-03-18',
      score: 100,
      accuracy: 95,
      completed: true,
    });
  });

  it('overwrites previous result for same date', () => {
    saveDailyResult({
      date: '2026-03-18',
      score: 50,
      accuracy: 60,
      completed: false,
    });
    saveDailyResult({
      date: '2026-03-18',
      score: 100,
      accuracy: 95,
      completed: true,
    });
    const history = getDailyHistory();
    expect(history['2026-03-18'].score).toBe(100);
  });
});
