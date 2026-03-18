import { Translations } from './types';

export const fr: Translations = {
  // UI
  title: 'Bataille Math',
  submit: 'Valider',
  playAgain: 'Rejouer',
  victory: 'Victoire !',
  score: 'Score',
  best: 'Meilleur',
  enemies: 'Ennemis',
  timer: 'Temps',
  settings: 'Param\u00e8tres',
  freePlay: 'Jeu Libre',
  levels: 'Niveaux',
  selectLevel: 'Choisir un Niveau',
  backToLevels: 'Retour aux Niveaux',
  finalScore: 'Score Final',
  bestScore: 'Meilleur Score',
  bestStreak: 'Meilleure S\u00e9rie',

  // Operations
  addition: 'Addition',
  subtraction: 'Soustraction',
  multiplication: 'Multiplication',
  division: 'Division',

  // Difficulty
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',

  // Modes
  whole: 'Entier',
  decimal: 'D\u00e9cimal',
  negative: 'N\u00e9gatif',
  typeMode: 'Taper',
  chooseMode: 'Choisir',

  // Settings
  sfxOn: 'SFX Oui',
  sfxOff: 'SFX Non',
  highContrast: 'HC',
  adaptive: 'Adaptatif',
  language: 'Langue',

  // Tutorial
  welcomeTitle: 'Bienvenue, Guerrier !',
  welcomeText:
    'Vaincs les ennemis en r\u00e9solvant des probl\u00e8mes de maths !',
  howToPlayTitle: 'Comment Jouer',
  howToPlayText: [
    'Tape la r\u00e9ponse et appuie sur Valider',
    'Les r\u00e9ponses rapides rapportent plus de points !',
  ],
  readyTitle: 'Pr\u00eat ?',
  readyText: [
    'Vaincs tous les ennemis pour gagner !',
    'Pas de souci \u2014 tu re\u00e7ois des indices si tu en as besoin !',
  ],
  next: 'Suivant',
  skip: 'Passer',
  start: 'Commencer !',

  // Hints
  hintEncourage: [
    'Presque ! Essaie encore !',
    'Pas tout \u00e0 fait \u2014 tu peux le faire !',
    'Continue, tu progresses !',
    'Bon effort ! R\u00e9essaie !',
    'Si proche ! Encore un essai !',
  ],
  hintAddition:
    'Essaie de compter \u00e0 partir de {val1} en ajoutant {val2}. La r\u00e9ponse est entre {low} et {high}.',
  hintSubtraction:
    'Commence \u00e0 {val1} et compte en arri\u00e8re de {val2}. La r\u00e9ponse est entre {low} et {high}.',
  hintMultiplication:
    'Pense \u00e0 {val1} groupes de {val2}. La r\u00e9ponse est entre {low} et {high}.',
  hintDivision:
    'Combien de fois {val2} entre dans {val1} ? La r\u00e9ponse est entre {low} et {high}.',
  hintAnswer: 'La r\u00e9ponse est {answer}. Essayons une autre !',
  hintRange: 'La r\u00e9ponse est entre {low} et {high}.',

  // Success
  successMessages: [
    'Tu as trouv\u00e9 !',
    'Correct ! G\u00e9nial !',
    "C'est exact ! Bien jou\u00e9 !",
    'Parfait ! Continue !',
    'Bravo ! Tu es une star des maths !',
  ],
  errorMessage: "Ce n'est pas la bonne r\u00e9ponse :(",

  // Stars
  accuracy: 'Pr\u00e9cision',

  // Daily
  dailyChallenge: 'D\u00e9fi du Jour',
  dayStreak: 'S\u00e9rie de Jours',
  completed: 'Termin\u00e9',

  // Adaptive
  adaptiveHarder: 'Bravo ! Voici un plus difficile !',
  adaptiveEasier: 'Entra\u00eenons-nous avec des plus faciles !',
};
