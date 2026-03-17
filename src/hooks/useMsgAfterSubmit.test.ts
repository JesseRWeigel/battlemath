import { renderHook, act } from '@testing-library/react'
import { useMsgAfterSubmit } from './useMsgAfterSubmit'
import { MESSAGES } from '../utils/Messages'

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('useMsgAfterSubmit', () => {
  it('returns empty msg and isErrorMessage false on initial render', () => {
    const { result } = renderHook(() =>
      useMsgAfterSubmit([3, 3], false)
    )
    expect(result.current.msg).toBe('')
    expect(result.current.isErrorMessage).toBe(false)
  })

  it('shows success message when numOfEnemies decreases (correct answer)', () => {
    const { result, rerender } = renderHook(
      ({ vars, stored }) => useMsgAfterSubmit(vars, stored),
      { initialProps: { vars: [3, 3] as [number, number], stored: false } }
    )

    rerender({ vars: [3, 2], stored: false })

    expect(result.current.msg).toBe(MESSAGES.ANSWER_SUBMIT.SUCCESS)
    expect(result.current.isErrorMessage).toBe(false)
  })

  it('shows error message when numOfEnemies increases (wrong answer)', () => {
    const { result, rerender } = renderHook(
      ({ vars, stored }) => useMsgAfterSubmit(vars, stored),
      { initialProps: { vars: [3, 3] as [number, number], stored: false } }
    )

    rerender({ vars: [3, 4], stored: false })

    expect(result.current.msg).toBe(MESSAGES.ANSWER_SUBMIT.ERROR)
    expect(result.current.isErrorMessage).toBe(true)
  })

  it('does not show a message when isStoredState is true', () => {
    const { result, rerender } = renderHook(
      ({ vars, stored }) => useMsgAfterSubmit(vars, stored),
      { initialProps: { vars: [3, 3] as [number, number], stored: true } }
    )

    rerender({ vars: [3, 2], stored: true })

    expect(result.current.msg).toBe('')
    expect(result.current.isErrorMessage).toBe(false)
  })

  it('uses custom messages when provided', () => {
    const custom = { successMsg: 'Nice!', errorMsg: 'Oops!' }
    const { result, rerender } = renderHook(
      ({ vars, stored }) => useMsgAfterSubmit(vars, stored, custom),
      { initialProps: { vars: [3, 3] as [number, number], stored: false } }
    )

    rerender({ vars: [3, 2], stored: false })
    expect(result.current.msg).toBe('Nice!')

    // Let timer clear before next assertion
    act(() => { jest.advanceTimersByTime(1500) })

    rerender({ vars: [3, 4], stored: false })
    expect(result.current.msg).toBe('Oops!')
  })

  it('auto-clears the message after 1500ms', () => {
    const { result, rerender } = renderHook(
      ({ vars, stored }) => useMsgAfterSubmit(vars, stored),
      { initialProps: { vars: [3, 3] as [number, number], stored: false } }
    )

    rerender({ vars: [3, 2], stored: false })
    expect(result.current.msg).toBe(MESSAGES.ANSWER_SUBMIT.SUCCESS)

    act(() => {
      jest.advanceTimersByTime(1500)
    })

    expect(result.current.msg).toBe('')
    expect(result.current.isErrorMessage).toBe(false)
  })
})
