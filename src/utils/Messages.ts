import { Translations } from '../i18n';

export const MESSAGES = {
  ANSWER_SUBMIT: {
    ERROR: 'You got that wrong :(',
    SUCCESS: [
      'You got it!',
      'Correct! Amazing!',
      "That's right! Well done!",
      'Perfect! Keep it up!',
      "Nailed it! You're a math star!",
    ],
  },
};

export function getRandomSuccessMessage(t?: Translations): string {
  const messages = t ? t.successMessages : MESSAGES.ANSWER_SUBMIT.SUCCESS;
  return messages[Math.floor(Math.random() * messages.length)];
}
