import type { ScheduleEntry } from '~/types/api';

// The brief fixes "today" for the whole app. Never derive it from the clock.
export const BUSINESS_TODAY = '2026-05-15';

const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** "2026-05" → { year: 2026, month: 5 }, or null when malformed. */
export function parseMonth(value: unknown) {
  const match = typeof value === 'string' ? MONTH_RE.exec(value) : null;
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
}

export const monthKey = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, '0')}`;

export function shiftMonth(key: string, delta: number): string {
  const { year, month } = parseMonth(key)!;
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return monthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
}

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export interface CalendarDay {
  date: string;
  day: number;
  entry?: ScheduleEntry;
}

/** Monday-first cells for one month; `null` pads the first week. */
export function monthGrid(
  year: number,
  month: number,
  entries: readonly ScheduleEntry[],
): (CalendarDay | null)[] {
  const byDate = new Map(entries.map((entry) => [entry.duty_date, entry]));
  const firstWeekday =
    (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (CalendarDay | null)[] = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${monthKey(year, month)}-${String(day).padStart(2, '0')}`;
    cells.push({ date, day, entry: byDate.get(date) });
  }
  return cells;
}

export const remainingDuties = (entry: ScheduleEntry) =>
  entry.count_schedules - entry.count_logbooks;

/** First day from `from` onwards that still has duties left to log. */
export function nextDuty(
  entries: readonly ScheduleEntry[],
  from = BUSINESS_TODAY,
): ScheduleEntry | undefined {
  return [...entries]
    .filter((entry) => entry.duty_date >= from && remainingDuties(entry) > 0)
    .sort((a, b) => a.duty_date.localeCompare(b.duty_date))[0];
}

// Duty colours come from the API, so the text colour on top of them is
// chosen by contrast: navy on light fills, white on dark ones.
export function textOn(hex: string): 'light' | 'dark' {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance =
    0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  const navyLuminance = 0.0144; // #0E2138
  const onNavy = (luminance + 0.05) / (navyLuminance + 0.05);
  const onWhite = 1.05 / (luminance + 0.05);
  return onNavy >= onWhite ? 'dark' : 'light';
}
