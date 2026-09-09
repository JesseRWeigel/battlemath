import App from './App';
import { getTranslations } from './i18n';

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
