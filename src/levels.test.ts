import { LEVELS, isLevelUnlocked, LevelProgress } from './levels';

describe('LEVELS', () => {
  it('has 12 levels', () => {
    expect(LEVELS).toHaveLength(12);
  });

  it('has 4 worlds', () => {
    const worlds = new Set(LEVELS.map((l) => l.world));
    expect(worlds.size).toBe(4);
    expect(worlds).toContain('addition');
    expect(worlds).toContain('subtraction');
    expect(worlds).toContain('multiplication');
    expect(worlds).toContain('division');
  });

  it('has 4 boss levels', () => {
    const bosses = LEVELS.filter((l) => l.isBoss);
    expect(bosses).toHaveLength(4);
  });

  it('boss levels are every 3rd level per world', () => {
    const bosses = LEVELS.filter((l) => l.isBoss);
    expect(bosses.map((b) => b.id)).toEqual([3, 6, 9, 12]);
  });
});

describe('isLevelUnlocked', () => {
  it('level 1 is always unlocked', () => {
    expect(isLevelUnlocked(1, {})).toBe(true);
  });

  it('level 2 is locked when level 1 not completed', () => {
    expect(isLevelUnlocked(2, {})).toBe(false);
  });

  it('level 2 is unlocked when level 1 completed with 1+ star', () => {
    const progress: Record<number, LevelProgress> = {
      1: {
        levelId: 1,
        completed: true,
        stars: 1,
        bestScore: 10,
        bestAccuracy: 70,
      },
    };
    expect(isLevelUnlocked(2, progress)).toBe(true);
  });

  it('level 2 is locked when level 1 completed with 0 stars', () => {
    const progress: Record<number, LevelProgress> = {
      1: {
        levelId: 1,
        completed: true,
        stars: 0,
        bestScore: 0,
        bestAccuracy: 0,
      },
    };
    expect(isLevelUnlocked(2, progress)).toBe(false);
  });

  it('returns false for unknown level id', () => {
    expect(isLevelUnlocked(999, {})).toBe(false);
  });

  it('level 4 (subtraction world) requires level 3 completed', () => {
    const progress: Record<number, LevelProgress> = {
      1: {
        levelId: 1,
        completed: true,
        stars: 2,
        bestScore: 20,
        bestAccuracy: 80,
      },
      2: {
        levelId: 2,
        completed: true,
        stars: 2,
        bestScore: 20,
        bestAccuracy: 80,
      },
      3: {
        levelId: 3,
        completed: true,
        stars: 1,
        bestScore: 10,
        bestAccuracy: 70,
      },
    };
    expect(isLevelUnlocked(4, progress)).toBe(true);
  });
});
