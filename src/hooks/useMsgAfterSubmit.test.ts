import { renderHook, act } from '@testing-library/react';
import { useMsgAfterSubmit } from './useMsgAfterSubmit';
import { MESSAGES } from '../utils/Messages';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useMsgAfterSubmit', () => {
  it('returns empty msg and isErrorMessage false on initial render', () => {
    const { result } = renderHook(() => useMsgAfterSubmit([3, 3], false));
    expect(result.current.msg).toBe('');
    expect(result.current.isErrorMessage).toBe(false);
  });

  it('shows a success message when numOfEnemies decreases (correct answer)', () => {
    const { result, rerender } = renderHook(
      ({ vars, stored }) => useMsgAfterSubmit(vars, stored),
      { initialProps: { vars: [3, 3] as [number, number], stored: false } },
    );

    rerender({ vars: [3, 2], stored: false });

    // Success is now a random pick from the array
    expect(MESSAGES.ANSWER_SUBMIT.SUCCESS).toContain(result.current.msg);
    expect(result.current.isErrorMessage).toBe(false);
  });

  it('does not show error message when numOfEnemies increases (hints handle this now)', () => {
    const { result, rerender } = renderHook(
      ({ vars, stored }) => useMsgAfterSubmit(vars, stored),
      { initialProps: { vars: [3, 3] as [number, number], stored: false } },
    );

    rerender({ vars: [3, 4], stored: false });

    // Hook no longer handles wrong answers — progressive hints do
    expect(result.current.msg).toBe('');
    expect(result.current.isErrorMessage).toBe(false);
  });

  it('does not show a message when isStoredState is true', () => {
    const { result, rerender } = renderHook(
      ({ vars, stored }) => useMsgAfterSubmit(vars, stored),
      { initialProps: { vars: [3, 3] as [number, number], stored: true } },
    );

    rerender({ vars: [3, 2], stored: true });

    expect(result.current.msg).toBe('');
    expect(result.current.isErrorMessage).toBe(false);
  });

  it('auto-clears the message after 1500ms', () => {
    const { result, rerender } = renderHook(
      ({ vars, stored }) => useMsgAfterSubmit(vars, stored),
      { initialProps: { vars: [3, 3] as [number, number], stored: false } },
    );

    rerender({ vars: [3, 2], stored: false });
    expect(MESSAGES.ANSWER_SUBMIT.SUCCESS).toContain(result.current.msg);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.msg).toBe('');
    expect(result.current.isErrorMessage).toBe(false);
  });
});
