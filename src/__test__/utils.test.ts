import { describe, expect, it } from 'vitest';
import { convertTemporalToMs } from '../utils';

describe('convertTemporalToMs', () => {
  it('converts all supported units', () => {
    expect(
      convertTemporalToMs({
        hours: 1,
        minutes: 2,
        seconds: 3,
        ms: 4,
      })
    ).toBe(3723004);
  });

  it('handles partial values', () => {
    expect(convertTemporalToMs({ seconds: 2 })).toBe(2000);
    expect(convertTemporalToMs({})).toBe(0);
  });

  it('handles partial values', () => {
    expect(convertTemporalToMs({ seconds: 2 })).toBe(2000);
    expect(convertTemporalToMs({})).toBe(0);
  });
});
