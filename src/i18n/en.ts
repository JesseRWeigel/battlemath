import { Translations } from './types';

export const en: Translations = {
  // UI
  title: 'Battle Math',
  submit: 'Submit',
  playAgain: 'Play Again',
  victory: 'Victory!',
  score: 'Score',
  best: 'Best',
  enemies: 'Enemies',
  timer: 'Timer',
  settings: 'Settings',
  freePlay: 'Free Play',
  levels: 'Levels',
  selectLevel: 'Select a Level',
  backToLevels: 'Back to Levels',
  finalScore: 'Final Score',
  bestScore: 'Best Score',
  bestStreak: 'Best Streak',

  // Operations
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',

  // Difficulty
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',

  // Modes
  whole: 'Whole',
  decimal: 'Decimal',
  negative: 'Negative',
  typeMode: 'Type',
  chooseMode: 'Choose',

  // Settings
  sfxOn: 'SFX On',
  sfxOff: 'SFX Off',
  highContrast: 'HC',
  adaptive: 'Adaptive',
  language: 'Language',

  // Tutorial
  welcomeTitle: 'Welcome, Warrior!',
  welcomeText: 'Defeat the enemies by solving math problems!',
  howToPlayTitle: 'How to Play',
  howToPlayText: [
    'Type the answer and press Submit',
    'Faster answers earn more points!',
  ],
  readyTitle: 'Ready?',
  readyText: [
    'Defeat all enemies to win!',
    "Don't worry \u2014 you get hints if you need them!",
  ],
  next: 'Next',
  skip: 'Skip',
  start: 'Start!',

  // Hints
  hintEncourage: [
    'Almost! Give it another try!',
    'Not quite \u2014 you\u2019ve got this!',
    'Keep going, you\u2019re learning!',
    'Good effort! Try again!',
    'So close! One more try!',
  ],
  hintAddition:
    'Try counting up from {val1} by {val2}. The answer is between {low} and {high}.',
  hintSubtraction:
    'Start at {val1} and count back {val2}. The answer is between {low} and {high}.',
  hintMultiplication:
    'Think of {val1} groups of {val2}. The answer is between {low} and {high}.',
  hintDivision:
    'How many times does {val2} fit into {val1}? The answer is between {low} and {high}.',
  hintAnswer: 'The answer is {answer}. Let\u2019s try another one!',
  hintRange: 'The answer is between {low} and {high}.',

  // Success
  successMessages: [
    'You got it!',
    'Correct! Amazing!',
    "That's right! Well done!",
    'Perfect! Keep it up!',
    "Nailed it! You're a math star!",
  ],
  errorMessage: 'You got that wrong :(',

  // Stars
  accuracy: 'Accuracy',

  // Daily
  dailyChallenge: 'Daily Challenge',
  dayStreak: 'Day Streak',
  completed: 'Completed',

  // Adaptive
  adaptiveHarder: "Great job! Here's a harder one!",
  adaptiveEasier: "Let's practice with easier ones!",
};
