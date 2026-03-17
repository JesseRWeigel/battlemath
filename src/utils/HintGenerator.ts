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
): string {
  if (hintLevel === 1) {
    return encourageMessages[
      Math.floor(Math.random() * encourageMessages.length)
    ];
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
    return `The answer is ${displayAnswer}. Let's try another one!`;
  }

  return '';
}
