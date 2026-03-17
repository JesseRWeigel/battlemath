import { generateHint } from './HintGenerator';

describe('generateHint', () => {
  describe('hintLevel 1', () => {
    it('returns a non-empty encouragement string', () => {
      const hint = generateHint(3, 4, '+', 1);
      expect(hint).toBeTruthy();
      expect(typeof hint).toBe('string');
    });
    it('never says wrong', () => {
      for (let i = 0; i < 20; i++) {
        expect(generateHint(5, 3, '-', 1).toLowerCase()).not.toContain('wrong');
      }
    });
  });
  describe('hintLevel 2', () => {
    it('addition hint', () => {
      expect(generateHint(3, 4, '+', 2)).toContain('counting up');
    });
    it('subtraction hint', () => {
      expect(generateHint(9, 4, '-', 2)).toContain('count back');
    });
    it('multiplication hint', () => {
      expect(generateHint(3, 4, '*', 2)).toContain('groups of');
    });
    it('division hint', () => {
      expect(generateHint(8, 4, '/', 2)).toContain('fit into');
    });
  });
  describe('hintLevel 3', () => {
    it('reveals addition answer', () => {
      expect(generateHint(3, 4, '+', 3)).toContain('7');
    });
    it('reveals subtraction answer', () => {
      expect(generateHint(9, 4, '-', 3)).toContain('5');
    });
    it('reveals multiplication answer', () => {
      expect(generateHint(3, 4, '*', 3)).toContain('12');
    });
    it('reveals division answer', () => {
      expect(generateHint(8, 4, '/', 3)).toContain('2');
    });
    it('handles decimals', () => {
      expect(generateHint(7, 3, '/', 3)).toContain('2.33');
    });
  });
  it('hintLevel 0 returns empty', () => {
    expect(generateHint(3, 4, '+', 0)).toBe('');
  });
});
