import { addDays, daysBetween, isDateOnly } from './date.js';

describe('date-only arithmetic', () => {
  it.each([
    '2026-02-29',
    '2026-04-31',
    '2026-5-01',
    '2026-05-15T00:00:00Z',
    '',
    undefined,
  ])('rejects %s', (value) => {
    expect(isDateOnly(value)).toBe(false);
  });

  it('handles leap years and month/year boundaries without local time', () => {
    expect(isDateOnly('2024-02-29')).toBe(true);
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(daysBetween('2026-05-15', '2026-06-11')).toBe(27);
  });
});
