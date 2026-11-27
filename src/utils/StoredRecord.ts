/** Distinguish absent data from data this session cannot safely read or replace. */
export function readStoredRecord<T extends object>(
  key: string,
): { status: 'ok'; value: T } | { status: 'missing' | 'unavailable' } {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return { status: 'missing' };
    const value: unknown = JSON.parse(raw);
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return { status: 'ok', value: value as T };
    }
  } catch {
    // Storage can be blocked, or an older saved record can be unreadable.
  }
  return { status: 'unavailable' };
}

export function writeStoredRecord(key: string, value: object): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A blocked or full store must not interrupt the current game.
  }
}
