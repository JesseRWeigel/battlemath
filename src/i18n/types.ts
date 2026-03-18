export type Locale = 'en' | 'es' | 'fr';

export interface Translations {
  // UI
  title: string;
  submit: string;
  playAgain: string;
  victory: string;
  score: string;
  best: string;
  enemies: string;
  timer: string;
  settings: string;
  freePlay: string;
  levels: string;
  selectLevel: string;
  backToLevels: string;
  finalScore: string;
  bestScore: string;
  bestStreak: string;

  // Operations
  addition: string;
  subtraction: string;
  multiplication: string;
  division: string;

  // Difficulty
  easy: string;
  medium: string;
  hard: string;

  // Modes
  whole: string;
  decimal: string;
  negative: string;
  typeMode: string;
  chooseMode: string;

  // Settings
  sfxOn: string;
  sfxOff: string;
  highContrast: string;
  adaptive: string;
  language: string;

  // Tutorial
  welcomeTitle: string;
  welcomeText: string;
  howToPlayTitle: string;
  howToPlayText: string[];
  readyTitle: string;
  readyText: string[];
  next: string;
  skip: string;
  start: string;

  // Hints
  hintEncourage: string[];
  hintAddition: string;
  hintSubtraction: string;
  hintMultiplication: string;
  hintDivision: string;
  hintAnswer: string;
  hintRange: string;

  // Success
  successMessages: string[];
  errorMessage: string;

  // Stars
  accuracy: string;

  // Daily
  dailyChallenge: string;
  dayStreak: string;
  completed: string;

  // Adaptive
  adaptiveHarder: string;
  adaptiveEasier: string;
}
