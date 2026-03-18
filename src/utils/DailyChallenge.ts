export interface DailyProblem {
  val1: number;
  val2: number;
  operator: string;
  mode: string;
  difficulty: string;
}

// Seeded random number generator (same date = same problems)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function generateDailyProblems(): DailyProblem[] {
  const rand = seededRandom(dateSeed());
  const operations = ['addition', 'subtraction', 'multiplication', 'division'];
  const operators = ['+', '-', '*', '/'];
  const difficulties = ['easy', 'medium', 'hard'];
  const problems: DailyProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const opIdx = Math.floor(rand() * 4);
    const diffIdx = Math.min(Math.floor(rand() * 3), 2);
    const mode = operations[opIdx];
    const operator = operators[opIdx];
    const difficulty = difficulties[diffIdx];

    // Generate numbers based on difficulty
    const ranges = { easy: [1, 9], medium: [10, 99], hard: [100, 999] };
    const [min, max] = ranges[difficulty as keyof typeof ranges];
    let val1 = Math.floor(rand() * (max - min + 1)) + min;
    let val2 = Math.floor(rand() * (max - min + 1)) + min;

    // Ensure division is clean
    if (operator === '/') {
      val2 = Math.max(val2, 2);
      val1 = val2 * Math.floor(rand() * (max / val2)) || val2;
    }
    // Ensure subtraction doesn't go negative (for whole number mode)
    if (operator === '-' && val2 > val1) {
      [val1, val2] = [val2, val1];
    }

    problems.push({ val1, val2, operator, mode, difficulty });
  }
  return problems;
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface DailyResult {
  date: string;
  score: number;
  accuracy: number;
  completed: boolean;
}

export function getDailyHistory(): Record<string, DailyResult> {
  const stored = localStorage.getItem('dailyChallengeHistory');
  return stored ? JSON.parse(stored) : {};
}

export function saveDailyResult(result: DailyResult): void {
  const history = getDailyHistory();
  history[result.date] = result;
  localStorage.setItem('dailyChallengeHistory', JSON.stringify(history));
}

export function getDailyStreak(): number {
  const history = getDailyHistory();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (history[key]?.completed) {
      streak++;
    } else if (i > 0) {
      break; // Gap found (skip today if not yet completed)
    }
  }
  return streak;
}
