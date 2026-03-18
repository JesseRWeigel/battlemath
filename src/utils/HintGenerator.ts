import { Translations } from '../i18n';

function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

const encourageMessages = [
  'Almost! Give it another try!',
  'Not quite \u2014 you\u2019ve got this!',
  'Keep going, you\u2019re learning!',
  'Good effort! Try again!',
  'So close! One more try!',
];

export function generateHint(
  val1: number,
  val2: number,
  operator: string,
  hintLevel: number,
  t?: Translations,
): string {
  if (hintLevel === 1) {
    const msgs = t ? t.hintEncourage : encourageMessages;
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  let answer: number;
  switch (operator) {
    case '+':
      answer = val1 + val2;
      break;
    case '-':
      answer = val1 - val2;
      break;
    case '*':
      answer = val1 * val2;
      break;
    case '/':
      answer = val1 / val2;
      break;
    default:
      answer = 0;
  }

  if (hintLevel === 2) {
    const low = Math.floor(answer * 0.8);
    const high = Math.ceil(answer * 1.2);
    if (t) {
      const vars = { val1, val2, low, high };
      switch (operator) {
        case '+':
          return interpolate(t.hintAddition, vars);
        case '-':
          return interpolate(t.hintSubtraction, vars);
        case '*':
          return interpolate(t.hintMultiplication, vars);
        case '/':
          return interpolate(t.hintDivision, vars);
        default:
          return interpolate(t.hintRange, vars);
      }
    }
    switch (operator) {
      case '+':
        return `Try counting up from ${val1} by ${val2}. The answer is between ${low} and ${high}.`;
      case '-':
        return `Start at ${val1} and count back ${val2}. The answer is between ${low} and ${high}.`;
      case '*':
        return `Think of ${val1} groups of ${val2}. The answer is between ${low} and ${high}.`;
      case '/':
        return `How many times does ${val2} fit into ${val1}? The answer is between ${low} and ${high}.`;
      default:
        return `The answer is between ${low} and ${high}.`;
    }
  }

  if (hintLevel === 3) {
    const displayAnswer = Number.isInteger(answer) ? answer : answer.toFixed(2);
    if (t) {
      return interpolate(t.hintAnswer, { answer: displayAnswer });
    }
    return `The answer is ${displayAnswer}. Let\'s try another one!`;
  }

  return '';
}
