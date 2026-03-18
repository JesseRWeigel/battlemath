import { Reducer } from 'react';

export function randomNumberGenerator(
  min: number,
  max: number,
  modeType: string,
): number {
  if (modeType.includes('decimal'))
    return Number.parseFloat((Math.random() * (max - min)).toFixed(2));
  else return Math.floor(Math.random() * (max - min)) + min;
}

export const TYPES = {
  SET_ANSWER: 0,
  ADD_ENEMY: 1,
  REMOVE_ENEMY: 2,
  CHECK_ANSWER: 3,
  NEW_PROBLEM: 4,
  SET_MODE: 5,
  SET_DIFFICULTY: 6,
  RESTART: 7,
  SET_MODE_TYPES: 8,
  RESTORE_STATE: 9,
  SET_SOUND_ENABLED: 10,
  SET_HIGH_CONTRAST: 11,
  START_TIMER: 12,
  SET_ADAPTIVE: 13,
  DISMISS_TUTORIAL: 14,
  SHOW_TUTORIAL: 15,
  SET_ANSWER_MODE: 16,
} as const;

const OPERATORS = {
  addition: '+',
  subtraction: '-',
  multiplication: '*',
  division: '/',
} as const;

const DIFFICULTIES = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
} as const;

const MODE_TYPES = {
  wholeNumber: 'wholeNumber',
  decimals: 'decimal',
  negative: 'negative',
} as const;

export type ActionType = {
  type: (typeof TYPES)[keyof typeof TYPES];
  payload?: unknown;
};

export type AppState = {
  answer: string;
  numOfEnemies: number;
  previousNumOfEnemies: number;
  val1: number;
  val2: number;
  won: boolean;
  operator: (typeof OPERATORS)[keyof typeof OPERATORS];
  mode: keyof typeof OPERATORS;
  difficulty: keyof typeof DIFFICULTIES;
  modeType: keyof typeof MODE_TYPES;
  isStoredState: boolean;
  soundEnabled: boolean;
  highContrast: boolean;
  score: number;
  questionStartTime: number;
  bestScore: number;
  lastPointsEarned: number | null;
  attempts: number;
  hintLevel: number;
  recentResults: boolean[];
  adaptiveDifficulty: boolean;
  adaptiveMessage: string | null;
  streak: number;
  maxStreak: number;
  streakBonus: number;
  showTutorial: boolean;
  hasSeenTutorial: boolean;
  totalAttempts: number;
  correctAttempts: number;
  totalAnswerTime: number;
  starsEarned: number;
  answerMode: 'type' | 'choose';
  choices: number[];
};

export function calculateStars(
  correctAttempts: number,
  totalAttempts: number,
  totalAnswerTime: number,
): number {
  if (totalAttempts === 0) return 0;
  const accuracy = correctAttempts / totalAttempts;
  const avgTime = totalAnswerTime / correctAttempts;

  if (accuracy >= 0.9 && avgTime < 10000) return 3; // 90%+ acc, <10s avg
  if (accuracy >= 0.7) return 2; // 70%+ accuracy
  return 1; // completed
}

export const initialState: AppState = {
  answer: '',
  numOfEnemies: 3,
  previousNumOfEnemies: 3,
  val1: 0,
  val2: 0,
  won: false,
  operator: '+',
  mode: 'addition',
  difficulty: 'easy',
  modeType: 'wholeNumber',
  isStoredState: true,
  soundEnabled: true,
  highContrast: false,
  score: 0,
  questionStartTime: 0,
  bestScore: 0,
  lastPointsEarned: null,
  attempts: 0,
  hintLevel: 0,
  recentResults: [],
  adaptiveDifficulty: true,
  adaptiveMessage: null,
  streak: 0,
  maxStreak: 0,
  streakBonus: 0,
  showTutorial: false,
  hasSeenTutorial: false,
  totalAttempts: 0,
  correctAttempts: 0,
  totalAnswerTime: 0,
  starsEarned: 0,
  answerMode: 'type',
  choices: [],
};

/**
 * Calculate points earned based on how quickly the answer was given.
 * Faster answers earn more points.
 */
export function calculatePoints(elapsedMs: number): number {
  const seconds = elapsedMs / 1000;
  if (seconds < 5) return 10;
  if (seconds < 10) return 8;
  if (seconds < 15) return 6;
  if (seconds < 20) return 4;
  if (seconds < 25) return 2;
  return 1;
}

/**
 * Determine if difficulty should change based on recent results.
 * Returns the new difficulty string, or null if no change needed.
 */
export function getAdaptiveDifficulty(
  currentDifficulty: string,
  recentResults: boolean[],
): string | null {
  if (recentResults.length < 2) return null;

  const last3 = recentResults.slice(-3);
  const last2 = recentResults.slice(-2);

  if (last3.length === 3 && last3.every((r) => r)) {
    if (currentDifficulty === 'easy') return 'medium';
    if (currentDifficulty === 'medium') return 'hard';
    return null;
  }

  if (last2.length === 2 && last2.every((r) => !r)) {
    if (currentDifficulty === 'hard') return 'medium';
    if (currentDifficulty === 'medium') return 'easy';
    return null;
  }

  return null;
}

export function getStreakMilestone(
  streak: number,
): { label: string; bonus: number } | null {
  switch (streak) {
    case 3:
      return { label: 'Nice!', bonus: 2 };
    case 5:
      return { label: 'On Fire!', bonus: 5 };
    case 10:
      return { label: 'Unstoppable!', bonus: 10 };
    case 15:
      return { label: 'LEGENDARY!', bonus: 15 };
    default:
      return null;
  }
}

export function computeAnswer(
  val1: number,
  operator: string,
  val2: number,
): number {
  let result: number;
  switch (operator) {
    case '+':
      result = val1 + val2;
      break;
    case '-':
      result = val1 - val2;
      break;
    case '*':
      result = val1 * val2;
      break;
    case '/':
      result = val1 / val2;
      break;
    default:
      result = val1 + val2;
  }
  return Number.parseFloat(result.toFixed(2));
}

export function generateChoices(correctAnswer: number): number[] {
  const choices = [correctAnswer];
  const range = Math.max(Math.abs(correctAnswer) * 0.3, 3);
  while (choices.length < 4) {
    const offset = Math.floor(Math.random() * range * 2) - range;
    const distractor = Math.round(correctAnswer + offset);
    if (distractor !== correctAnswer && !choices.includes(distractor)) {
      choices.push(distractor);
    }
  }
  return choices.sort(() => Math.random() - 0.5);
}

export const reducer: Reducer<AppState, ActionType> = (state, action) => {
  const randomNumber = (
    diff = state.difficulty,
    mode = state.mode,
    modeType = state.modeType,
  ) => {
    let val1, val2;
    let x = 1,
      y = 9;

    switch (diff) {
      case 'medium': {
        x = 10;
        y = 99;
        break;
      }
      case 'hard': {
        x = 100;
        y = 999;
        break;
      }
    }

    val1 = randomNumberGenerator(x, y, modeType);

    switch (mode) {
      case 'division': {
        y = modeType.includes('decimal') ? y : Math.floor(y / val1);
        break;
      }
      case 'subtraction': {
        y = val1;
        break;
      }
    }
    val2 = randomNumberGenerator(x, y, modeType);

    while (
      val1 % val2 !== 0 &&
      mode === 'division' &&
      (modeType.includes('wholeNumber') || modeType.includes('negative'))
    )
      val2--;

    if (modeType.includes('negative')) {
      if (Math.random() < 0.5) {
        val1 = -val1;
      } else {
        val2 = -val2;
      }
    }

    return [val1, val2];
  };

  switch (action.type) {
    case TYPES.RESTART: {
      let val = randomNumber();
      switch (state.mode) {
        case 'division': {
          state.operator = '/';
          break;
        }
        case 'subtraction': {
          state.operator = '-';
          break;
        }
        case 'addition': {
          state.operator = '+';
          break;
        }
        case 'multiplication': {
          state.operator = '*';
          break;
        }
      }

      return {
        ...initialState,
        mode: state.mode,
        difficulty: state.difficulty,
        modeType: state.modeType,
        val1: val[0],
        val2: val[1],
        operator: state.operator,
        bestScore: state.bestScore,
        questionStartTime: Date.now(),
        adaptiveDifficulty: state.adaptiveDifficulty,
        recentResults: [],
        adaptiveMessage: null,
        maxStreak: state.maxStreak,
        answerMode: state.answerMode,
        choices:
          state.answerMode === 'choose'
            ? generateChoices(computeAnswer(val[0], state.operator, val[1]))
            : [],
      };
    }

    case TYPES.SET_ANSWER: {
      return {
        ...state,
        isStoredState: false,
        answer: action.payload as string,
      };
    }

    case TYPES.ADD_ENEMY: {
      if (state.numOfEnemies < 6) {
        return {
          ...state,
          previousNumOfEnemies: state.numOfEnemies,
          numOfEnemies: state.numOfEnemies + 1,
        };
      }
      break;
    }

    case TYPES.REMOVE_ENEMY: {
      const newState = { ...state, previousNumOfEnemies: state.numOfEnemies };
      newState.numOfEnemies--;

      if (newState.numOfEnemies === 0) {
        newState.won = true;
      }

      return newState;
    }

    case TYPES.CHECK_ANSWER: {
      let answer;

      if (state.modeType) {
        if (state.modeType.includes('decimal'))
          answer = parseFloat(state?.answer ?? '');
        else answer = parseFloat(state?.answer ?? '');
      }

      // eslint-disable-next-line no-eval
      let expected = eval(`${state.val1} ${state.operator} ${state.val2}`);
      expected = Number.parseFloat(expected.toFixed(2));

      console.log(expected);

      const isCorrect = answer === expected;

      const newRecentResults = [
        ...state.recentResults.slice(-(5 - 1)),
        isCorrect,
      ];

      let newDifficulty = state.difficulty;
      let adaptiveMessage: string | null = null;
      if (state.adaptiveDifficulty) {
        const suggested = getAdaptiveDifficulty(
          state.difficulty,
          newRecentResults,
        );
        if (suggested) {
          const isIncrease =
            (state.difficulty === 'easy' && suggested === 'medium') ||
            (state.difficulty === 'medium' && suggested === 'hard');
          adaptiveMessage = isIncrease
            ? "Great job! Here's a harder one!"
            : "Let's practice with easier ones!";
          newDifficulty = suggested as (typeof state)['difficulty'];
        }
      }

      // Track total attempts for star rating
      const newTotalAttempts = state.totalAttempts + 1;

      if (isCorrect) {
        const elapsed = Date.now() - state.questionStartTime;
        const basePoints = calculatePoints(elapsed);
        const attemptMultiplier =
          state.attempts === 0 ? 1 : state.attempts === 1 ? 0.5 : 0.25;
        const pointsEarned = Math.round(basePoints * attemptMultiplier);

        const newStreak = state.streak + 1;
        const newMaxStreak = Math.max(state.maxStreak, newStreak);
        const milestone = getStreakMilestone(newStreak);
        const streakBonus = milestone ? milestone.bonus : 0;

        const newScore = state.score + pointsEarned + streakBonus;
        const newBestScore = Math.max(state.bestScore, newScore);

        const newCorrectAttempts = state.correctAttempts + 1;
        const newTotalAnswerTime = state.totalAnswerTime + elapsed;

        const stateWithEnemies = reducer(
          { ...state, difficulty: newDifficulty },
          { type: TYPES.REMOVE_ENEMY },
        );
        const stateWithProblem = reducer(stateWithEnemies, {
          type: TYPES.NEW_PROBLEM,
        });

        const isVictory = stateWithEnemies.won;
        const starsEarned = isVictory
          ? calculateStars(
              newCorrectAttempts,
              newTotalAttempts,
              newTotalAnswerTime,
            )
          : state.starsEarned;

        return {
          ...stateWithProblem,
          score: newScore,
          bestScore: newBestScore,
          lastPointsEarned: pointsEarned,
          questionStartTime: Date.now(),
          attempts: 0,
          hintLevel: 0,
          recentResults: newRecentResults,
          difficulty: newDifficulty,
          adaptiveMessage,
          streak: newStreak,
          maxStreak: newMaxStreak,
          streakBonus,
          totalAttempts: newTotalAttempts,
          correctAttempts: newCorrectAttempts,
          totalAnswerTime: newTotalAnswerTime,
          starsEarned,
        };
      }

      const newAttempts = state.attempts + 1;

      if (newAttempts >= 3) {
        const stateWithEnemies = reducer(
          { ...state, difficulty: newDifficulty },
          { type: TYPES.ADD_ENEMY },
        );
        const stateWithProblem = reducer(stateWithEnemies, {
          type: TYPES.NEW_PROBLEM,
        });

        return {
          ...stateWithProblem,
          score: state.score,
          bestScore: state.bestScore,
          lastPointsEarned: 0,
          questionStartTime: Date.now(),
          attempts: newAttempts,
          hintLevel: 3,
          recentResults: newRecentResults,
          difficulty: newDifficulty,
          adaptiveMessage,
          streak: 0,
          streakBonus: 0,
          totalAttempts: newTotalAttempts,
        };
      }

      return {
        ...state,
        answer: '',
        attempts: newAttempts,
        hintLevel: newAttempts,
        lastPointsEarned: null,
        recentResults: newRecentResults,
        totalAttempts: newTotalAttempts,
      };
    }

    case TYPES.NEW_PROBLEM: {
      let val = randomNumber();

      if (val[0] === state.val1 && val[1] === state.val2) {
        return reducer(state, { type: TYPES.NEW_PROBLEM });
      }

      return {
        ...state,
        val1: val[0],
        val2: val[1],
        answer: '',
        questionStartTime: state.questionStartTime || Date.now(),
        attempts: 0,
        hintLevel: 0,
        choices:
          state.answerMode === 'choose'
            ? generateChoices(computeAnswer(val[0], state.operator, val[1]))
            : [],
      };
    }

    case TYPES.SET_MODE: {
      const mode = action.payload as keyof typeof OPERATORS;
      let val = randomNumber(this, mode);
      return {
        ...state,
        mode,
        val1: val[0],
        val2: val[1],
        operator: OPERATORS[mode],
      };
    }

    case TYPES.SET_DIFFICULTY: {
      const difficulty = action.payload as keyof typeof DIFFICULTIES;

      let val = randomNumber(difficulty);
      return {
        ...state,
        difficulty,
        val1: val[0],
        val2: val[1],
      };
    }

    case TYPES.SET_MODE_TYPES: {
      const modeType = action.payload as keyof typeof MODE_TYPES;

      let val = randomNumber(this, this, modeType);
      return {
        ...state,
        modeType,
        val1: val[0],
        val2: val[1],
      };
    }

    case TYPES.SET_SOUND_ENABLED: {
      return {
        ...state,
        soundEnabled: action.payload as boolean,
      };
    }

    case TYPES.SET_HIGH_CONTRAST: {
      return {
        ...state,
        highContrast: action.payload as boolean,
      };
    }

    case TYPES.SET_ADAPTIVE: {
      return {
        ...state,
        adaptiveDifficulty: action.payload as boolean,
        adaptiveMessage: null,
      };
    }

    case TYPES.DISMISS_TUTORIAL: {
      return {
        ...state,
        showTutorial: false,
        hasSeenTutorial: true,
      };
    }

    case TYPES.SHOW_TUTORIAL: {
      return {
        ...state,
        showTutorial: true,
      };
    }

    case TYPES.SET_ANSWER_MODE: {
      const answerMode = action.payload as 'type' | 'choose';
      const choices =
        answerMode === 'choose'
          ? generateChoices(
              computeAnswer(state.val1, state.operator, state.val2),
            )
          : [];
      return {
        ...state,
        answerMode,
        choices,
      };
    }

    case TYPES.RESTORE_STATE: {
      const storedState = action.payload as Partial<AppState>;
      return {
        ...initialState,
        ...storedState,
        isStoredState: true,
        showTutorial: storedState.hasSeenTutorial ? false : true,
        hasSeenTutorial: storedState.hasSeenTutorial ?? false,
      };
    }

    case TYPES.START_TIMER: {
      return {
        ...state,
        questionStartTime: Date.now(),
      };
    }

    default:
      throw new Error(`Invalid action ${action.type}`);
  }

  return state;
};
