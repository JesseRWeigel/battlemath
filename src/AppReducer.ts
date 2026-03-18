import { Reducer } from 'react';
import { Level, LevelProgress } from './levels';
import { DailyProblem } from './utils/DailyChallenge';
import { Locale } from './i18n';

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
  SELECT_LEVEL: 17,
  COMPLETE_LEVEL: 18,
  BACK_TO_LEVELS: 19,
  PLAY_FREE: 20,
  SET_LOCALE: 21,
  START_DAILY_CHALLENGE: 21,
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
  currentLevel: Level | null;
  levelProgress: Record<number, LevelProgress>;
  gameScreen: 'levelSelect' | 'playing' | 'victory';
  isDailyChallenge: boolean;
  dailyProblems: DailyProblem[];
  dailyProblemIndex: number;
  locale: Locale;
  isBossLevel: boolean;
  bossHP: number;
  bossMaxHP: number;
};

export function calculateStars(
  correctAttempts: number,
  totalAttempts: number,
  totalAnswerTime: number,
): number {
  if (totalAttempts === 0) return 0;
  const accuracy = correctAttempts / totalAttempts;
  const avgTime = totalAnswerTime / correctAttempts;

  if (accuracy >= 0.9 && avgTime < 10000) return 3;
  if (accuracy >= 0.7) return 2;
  return 1;
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
  currentLevel: null,
  levelProgress: {},
  gameScreen: 'levelSelect',
  isDailyChallenge: false,
  dailyProblems: [],
  dailyProblemIndex: 0,
  locale: 'en' as Locale,
  isBossLevel: false,
  bossHP: 0,
  bossMaxHP: 0,
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
        currentLevel: state.currentLevel,
        levelProgress: state.levelProgress,
        locale: state.locale,
        gameScreen: 'playing',
        numOfEnemies: state.currentLevel
          ? state.currentLevel.isBoss
            ? 1
            : state.currentLevel.enemyCount
          : initialState.numOfEnemies,
        previousNumOfEnemies: state.currentLevel
          ? state.currentLevel.isBoss
            ? 1
            : state.currentLevel.enemyCount
          : initialState.numOfEnemies,
        isBossLevel: state.currentLevel?.isBoss === true,
        bossHP: state.currentLevel?.isBoss ? 5 : 0,
        bossMaxHP: state.currentLevel?.isBoss ? 5 : 0,
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
      // Don't auto-adjust difficulty during structured levels
      if (state.adaptiveDifficulty && !state.currentLevel) {
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
        const bossMultiplier = state.isBossLevel ? 3 : 1;
        const pointsEarned = Math.round(
          basePoints * attemptMultiplier * bossMultiplier,
        );

        const newStreak = state.streak + 1;
        const newMaxStreak = Math.max(state.maxStreak, newStreak);
        const milestone = getStreakMilestone(newStreak);
        const streakBonus = milestone ? milestone.bonus : 0;

        const newScore = state.score + pointsEarned + streakBonus;
        const newBestScore = Math.max(state.bestScore, newScore);

        const newCorrectAttempts = state.correctAttempts + 1;
        const newTotalAnswerTime = state.totalAnswerTime + elapsed;

        // Boss levels: decrement HP instead of removing enemy immediately
        if (state.isBossLevel) {
          const newBossHP = state.bossHP - 1;
          const bossDefeated = newBossHP <= 0;

          const stateForProblem = {
            ...state,
            difficulty: newDifficulty,
            numOfEnemies: bossDefeated ? 0 : 1,
            previousNumOfEnemies: 1,
            won: bossDefeated,
            bossHP: newBossHP,
          };
          const stateWithProblem = bossDefeated
            ? stateForProblem
            : reducer(stateForProblem, { type: TYPES.NEW_PROBLEM });

          const starsEarned = bossDefeated
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
            isBossLevel: state.isBossLevel,
            bossHP: newBossHP,
            bossMaxHP: state.bossMaxHP,
          };
        }

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
      // Daily challenge: use the next pre-generated problem
      if (state.isDailyChallenge && state.dailyProblems.length > 0) {
        const nextIndex = state.dailyProblemIndex + 1;
        if (nextIndex < state.dailyProblems.length) {
          const p = state.dailyProblems[nextIndex];
          const op = p.operator as (typeof OPERATORS)[keyof typeof OPERATORS];
          return {
            ...state,
            val1: p.val1,
            val2: p.val2,
            operator: op,
            mode: p.mode as keyof typeof OPERATORS,
            difficulty: p.difficulty as keyof typeof DIFFICULTIES,
            answer: '',
            questionStartTime: state.questionStartTime || Date.now(),
            attempts: 0,
            hintLevel: 0,
            dailyProblemIndex: nextIndex,
            choices:
              state.answerMode === 'choose'
                ? generateChoices(computeAnswer(p.val1, op, p.val2))
                : [],
          };
        }
        return { ...state, answer: '', attempts: 0, hintLevel: 0 };
      }

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

    case TYPES.SELECT_LEVEL: {
      const level = action.payload as Level;
      const op =
        OPERATORS[level.world as keyof typeof OPERATORS] || OPERATORS.addition;
      const mode = level.world as keyof typeof OPERATORS;
      const difficulty = level.difficulty as keyof typeof DIFFICULTIES;
      let val = randomNumber(difficulty, mode);
      const choices =
        state.answerMode === 'choose'
          ? generateChoices(computeAnswer(val[0], op, val[1]))
          : [];
      const isBoss = level.isBoss === true;
      return {
        ...initialState,
        mode,
        difficulty,
        modeType: state.modeType,
        operator: op,
        val1: val[0],
        val2: val[1],
        numOfEnemies: isBoss ? 1 : level.enemyCount,
        previousNumOfEnemies: isBoss ? 1 : level.enemyCount,
        currentLevel: level,
        levelProgress: state.levelProgress,
        gameScreen: 'playing',
        questionStartTime: Date.now(),
        soundEnabled: state.soundEnabled,
        highContrast: state.highContrast,
        answerMode: state.answerMode,
        bestScore: state.bestScore,
        choices,
        hasSeenTutorial: state.hasSeenTutorial,
        locale: state.locale,
        isBossLevel: isBoss,
        bossHP: isBoss ? 5 : 0,
        bossMaxHP: isBoss ? 5 : 0,
      };
    }

    case TYPES.COMPLETE_LEVEL: {
      if (!state.currentLevel) return state;
      const accuracy =
        state.totalAttempts > 0
          ? state.correctAttempts / state.totalAttempts
          : 0;
      const prevProgress = state.levelProgress[state.currentLevel.id];
      const newStars = state.starsEarned;
      const newProgress: LevelProgress = {
        levelId: state.currentLevel.id,
        completed: true,
        stars: Math.max(newStars, prevProgress?.stars ?? 0),
        bestScore: Math.max(state.score, prevProgress?.bestScore ?? 0),
        bestAccuracy: Math.max(
          Math.round(accuracy * 100),
          prevProgress?.bestAccuracy ?? 0,
        ),
      };
      const updatedProgress = {
        ...state.levelProgress,
        [state.currentLevel.id]: newProgress,
      };
      return {
        ...state,
        levelProgress: updatedProgress,
        gameScreen: 'victory',
      };
    }

    case TYPES.BACK_TO_LEVELS: {
      return {
        ...state,
        currentLevel: null,
        gameScreen: 'levelSelect',
        won: false,
        isDailyChallenge: false,
        dailyProblems: [],
        dailyProblemIndex: 0,
      };
    }

    case TYPES.PLAY_FREE: {
      let val = randomNumber();
      const choices =
        state.answerMode === 'choose'
          ? generateChoices(computeAnswer(val[0], state.operator, val[1]))
          : [];
      return {
        ...initialState,
        mode: state.mode,
        difficulty: state.difficulty,
        modeType: state.modeType,
        operator: state.operator,
        val1: val[0],
        val2: val[1],
        currentLevel: null,
        levelProgress: state.levelProgress,
        gameScreen: 'playing',
        questionStartTime: Date.now(),
        soundEnabled: state.soundEnabled,
        highContrast: state.highContrast,
        answerMode: state.answerMode,
        bestScore: state.bestScore,
        choices,
        hasSeenTutorial: state.hasSeenTutorial,
        locale: state.locale,
      };
    }

    case TYPES.START_DAILY_CHALLENGE: {
      const problems = action.payload as DailyProblem[];
      const first = problems[0];
      const op = first.operator as (typeof OPERATORS)[keyof typeof OPERATORS];
      const dcMode = first.mode as keyof typeof OPERATORS;
      const dcDifficulty = first.difficulty as keyof typeof DIFFICULTIES;
      const dcChoices =
        state.answerMode === 'choose'
          ? generateChoices(computeAnswer(first.val1, op, first.val2))
          : [];
      return {
        ...initialState,
        mode: dcMode,
        difficulty: dcDifficulty,
        modeType: state.modeType,
        operator: op,
        val1: first.val1,
        val2: first.val2,
        numOfEnemies: 10,
        previousNumOfEnemies: 10,
        currentLevel: null,
        levelProgress: state.levelProgress,
        gameScreen: 'playing',
        questionStartTime: Date.now(),
        soundEnabled: state.soundEnabled,
        highContrast: state.highContrast,
        answerMode: state.answerMode,
        bestScore: state.bestScore,
        choices: dcChoices,
        hasSeenTutorial: state.hasSeenTutorial,
        locale: state.locale,
        isDailyChallenge: true,
        dailyProblems: problems,
        dailyProblemIndex: 0,
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
        levelProgress: storedState.levelProgress ?? {},
        gameScreen: 'levelSelect',
        currentLevel: null,
      };
    }

    case TYPES.START_TIMER: {
      return {
        ...state,
        questionStartTime: Date.now(),
      };
    }

    case TYPES.SET_LOCALE: {
      return {
        ...state,
        locale: action.payload as Locale,
      };
    }

    default:
      throw new Error(`Invalid action ${action.type}`);
  }

  return state;
};
