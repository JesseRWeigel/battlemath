import { StrictMode } from 'react';
import App from './App';
import { getTranslations } from './i18n';
import { computeAnswer } from './AppReducer';
import { generateDailyProblems, getDailyHistory } from './utils/DailyChallenge';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

beforeEach(() => localStorage.clear());

import { render, screen, fireEvent } from '@testing-library/react';

it('renders without crashing', () => {
  render(<App />);

  expect(screen.getByText(/Battle Math/)).toBeInTheDocument();
});

it('changes translated labels through settings without corrupting the daily challenge', () => {
  localStorage.setItem('state', JSON.stringify({ hasSeenTutorial: true }));
  render(<App />);
  fireEvent.click(screen.getByTestId('daily-challenge-button'));
  fireEvent.click(screen.getByLabelText('Show settings'));
  fireEvent.click(screen.getByText('ES'));
  expect(screen.getByRole('heading')).toHaveTextContent(
    getTranslations('es').title,
  );
  const saved = JSON.parse(localStorage.getItem('state')!);
  expect(saved.locale).toBe('es');
  expect(
    screen.getByRole('radiogroup', { name: 'Select language' }),
  ).toHaveTextContent('ES');
  fireEvent.click(screen.getByText('FR'));
  expect(JSON.parse(localStorage.getItem('state')!).locale).toBe('fr');
  expect(screen.getByRole('heading')).toHaveTextContent(
    getTranslations('fr').title,
  );
});

it('offers a labeled keyboard-operable practice checkbox and persists it', async () => {
  localStorage.setItem(
    'state',
    JSON.stringify({ hasSeenTutorial: true, bestScore: 42 }),
  );
  const { unmount } = render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  const checkbox = screen.getByRole('checkbox', { name: 'Untimed practice' });
  expect(checkbox).toHaveAccessibleDescription(/No countdown/);
  checkbox.focus();
  expect(checkbox).toHaveFocus();
  // DOM integration coverage; native browser and screen-reader QA remain manual.
  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();
  expect(JSON.parse(localStorage.getItem('state')!).practiceMode).toBe(true);
  fireEvent.click(screen.getByTestId('daily-challenge-button'));
  expect(screen.getByTestId('timer')).toHaveTextContent('Untimed practice');
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  unmount();
  render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  expect(
    screen.getByRole('checkbox', { name: 'Untimed practice' }),
  ).toBeChecked();
  expect(JSON.parse(localStorage.getItem('state')!).bestScore).toBe(42);
});

it('records a challenge against the date it started across midnight', () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  try {
    vi.setSystemTime(new Date(2026, 10, 24, 23, 59, 59));
    localStorage.setItem('state', JSON.stringify({ hasSeenTutorial: true }));
    const problems = generateDailyProblems();
    render(<App />);
    fireEvent.click(screen.getByTestId('daily-challenge-button'));

    vi.setSystemTime(new Date(2026, 10, 25, 0, 0, 1));
    for (const { val1, operator, val2 } of problems) {
      fireEvent.change(screen.getByLabelText('Enter your answer'), {
        target: {
          value: String(
            computeAnswer(val1, operator as '+' | '-' | '*' | '/', val2),
          ),
        },
      });
      fireEvent.click(screen.getByTestId('submit'));
    }

    expect(getDailyHistory()).toEqual({
      '2026-11-24': expect.objectContaining({ completed: true, accuracy: 100 }),
    });
  } finally {
    vi.useRealTimers();
  }
});

it('opens without overwriting unreadable saved game state', () => {
  localStorage.setItem('state', '{"truncated":');

  render(<App />);

  expect(screen.getByText(/Battle Math/)).toBeInTheDocument();
  expect(localStorage.getItem('state')).toBe('{"truncated":');
});

it('opens and starts a daily challenge when browser storage is blocked', () => {
  const getter = vi
    .spyOn(window, 'localStorage', 'get')
    .mockImplementation(() => {
      throw new DOMException('Storage is blocked', 'SecurityError');
    });
  try {
    render(<App />);
    fireEvent.click(screen.getByTestId('daily-challenge-button'));
    expect(screen.getByLabelText('Enter your answer')).toBeInTheDocument();
  } finally {
    getter.mockRestore();
  }
});

it('finishes a daily challenge without replacing malformed history', () => {
  localStorage.setItem('state', JSON.stringify({ hasSeenTutorial: true }));
  localStorage.setItem('dailyChallengeHistory', 'null');
  const problems = generateDailyProblems();
  render(<App />);
  fireEvent.click(screen.getByTestId('daily-challenge-button'));
  for (const { val1, operator, val2 } of problems) {
    fireEvent.change(screen.getByLabelText('Enter your answer'), {
      target: {
        value: String(
          computeAnswer(val1, operator as '+' | '-' | '*' | '/', val2),
        ),
      },
    });
    fireEvent.click(screen.getByTestId('submit'));
  }
  expect(screen.getByText(/100%/)).toBeInTheDocument();
  expect(localStorage.getItem('dailyChallengeHistory')).toBe('null');
});

it('keeps the selected locale for the session when saving fails', () => {
  localStorage.setItem(
    'state',
    JSON.stringify({ hasSeenTutorial: true, locale: 'en' }),
  );
  const setItem = vi
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => {
      throw new DOMException('Storage is full', 'QuotaExceededError');
    });
  try {
    render(<App />);
    fireEvent.click(screen.getByTestId('daily-challenge-button'));
    fireEvent.click(screen.getByLabelText('Show settings'));
    fireEvent.click(screen.getByText('ES'));
    expect(screen.getByRole('heading')).toHaveTextContent(
      getTranslations('es').title,
    );
    expect(JSON.parse(localStorage.getItem('state')!).locale).toBe('en');
  } finally {
    setItem.mockRestore();
  }
});
