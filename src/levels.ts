export interface Level {
  id: number;
  world: string; // 'addition' | 'subtraction' | 'multiplication' | 'division'
  worldName: string; // Display name
  difficulty: string; // 'easy' | 'medium' | 'hard'
  label: string; // e.g., "Addition 1", "Addition 2"
  enemyCount: number; // problems to solve (5 for normal, 5 for boss with 5 HP)
  isBoss: boolean; // boss level every 3rd level per world
  requiredStars: number; // minimum stars from previous level to unlock (0 = always unlocked)
}

export const LEVELS: Level[] = [
  // Addition World (levels 1-3)
  {
    id: 1,
    world: 'addition',
    worldName: 'Meadow',
    difficulty: 'easy',
    label: 'Addition 1',
    enemyCount: 5,
    isBoss: false,
    requiredStars: 0,
  },
  {
    id: 2,
    world: 'addition',
    worldName: 'Meadow',
    difficulty: 'medium',
    label: 'Addition 2',
    enemyCount: 5,
    isBoss: false,
    requiredStars: 1,
  },
  {
    id: 3,
    world: 'addition',
    worldName: 'Meadow',
    difficulty: 'hard',
    label: 'Addition 3',
    enemyCount: 5,
    isBoss: true,
    requiredStars: 1,
  },

  // Subtraction World (levels 4-6)
  {
    id: 4,
    world: 'subtraction',
    worldName: 'Frozen Peaks',
    difficulty: 'easy',
    label: 'Subtraction 1',
    enemyCount: 5,
    isBoss: false,
    requiredStars: 1,
  },
  {
    id: 5,
    world: 'subtraction',
    worldName: 'Frozen Peaks',
    difficulty: 'medium',
    label: 'Subtraction 2',
    enemyCount: 5,
    isBoss: false,
    requiredStars: 1,
  },
  {
    id: 6,
    world: 'subtraction',
    worldName: 'Frozen Peaks',
    difficulty: 'hard',
    label: 'Subtraction 3',
    enemyCount: 5,
    isBoss: true,
    requiredStars: 1,
  },

  // Multiplication World (levels 7-9)
  {
    id: 7,
    world: 'multiplication',
    worldName: 'Magic Forest',
    difficulty: 'easy',
    label: 'Multiplication 1',
    enemyCount: 5,
    isBoss: false,
    requiredStars: 1,
  },
  {
    id: 8,
    world: 'multiplication',
    worldName: 'Magic Forest',
    difficulty: 'medium',
    label: 'Multiplication 2',
    enemyCount: 5,
    isBoss: false,
    requiredStars: 1,
  },
  {
    id: 9,
    world: 'multiplication',
    worldName: 'Magic Forest',
    difficulty: 'hard',
    label: 'Multiplication 3',
    enemyCount: 5,
    isBoss: true,
    requiredStars: 1,
  },

  // Division World (levels 10-12)
  {
    id: 10,
    world: 'division',
    worldName: 'Crystal Cave',
    difficulty: 'easy',
    label: 'Division 1',
    enemyCount: 5,
    isBoss: false,
    requiredStars: 1,
  },
  {
    id: 11,
    world: 'division',
    worldName: 'Crystal Cave',
    difficulty: 'medium',
    label: 'Division 2',
    enemyCount: 5,
    isBoss: false,
    requiredStars: 1,
  },
  {
    id: 12,
    world: 'division',
    worldName: 'Crystal Cave',
    difficulty: 'hard',
    label: 'Division 3',
    enemyCount: 5,
    isBoss: true,
    requiredStars: 1,
  },
];

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  stars: number; // 0-3
  bestScore: number;
  bestAccuracy: number;
}

export function isLevelUnlocked(
  levelId: number,
  progress: Record<number, LevelProgress>,
): boolean {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return false;
  if (level.id === 1) return true; // First level always unlocked

  const prevLevel = LEVELS.find((l) => l.id === levelId - 1);
  if (!prevLevel) return true;

  const prevProgress = progress[prevLevel.id];
  if (!prevProgress || !prevProgress.completed) return false;
  return prevProgress.stars >= level.requiredStars;
}
