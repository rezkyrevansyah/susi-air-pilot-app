import { describe, expect, it } from 'vitest';
import type { LimitCard, ScheduleEntry } from '~/types/api';
import {
  isCalendarDate,
  monthGrid,
  nextDuty,
  shiftMonth,
  textOn,
} from '../utils/calendar';
import { tickStep, yTicks } from '../utils/chart';
import {
  formatDate,
  formatDaysRemaining,
  formatHours,
  formatWeekday,
} from '../utils/format';
import { limitStatus } from '../utils/limits';

const entry = (date: string, scheduled: number, logged: number) =>
  ({
    id: date,
    duty_date: date,
    status: 1,
    base_name: 'SIQ',
    base_color: '#10B981',
    duty_type: 'DTY',
    count_schedules: scheduled,
    count_logbooks: logged,
  }) satisfies ScheduleEntry;

const card = (hours: number, limit: number) =>
  ({
    period: 'weekly',
    windowDays: 7,
    hours,
    limit,
    remainingHours: Math.max(0, Math.round((limit - hours) * 10) / 10),
    usagePercent: Math.round((hours / limit) * 100),
  }) satisfies LimitCard;

describe('format', () => {
  it('formats hours and calendar dates without timezone drift', () => {
    expect(formatHours(1013.8)).toBe('1,013.8');
    expect(formatHours(6)).toBe('6.0');
    expect(formatDate('2026-10-14')).toBe('14 Oct 2026');
    expect(formatWeekday('2026-05-15')).toBe('Fri, 15 May');
    expect(formatWeekday('2026-05-19', true)).toBe('Tue, 19 May 2026');
  });

  it('describes days until expiry', () => {
    expect(formatDaysRemaining(152)).toBe('152 days left');
    expect(formatDaysRemaining(1)).toBe('1 day left');
    expect(formatDaysRemaining(0)).toBe('expires today');
    expect(formatDaysRemaining(-14)).toBe('expired 14 days ago');
  });
});

describe('limitStatus', () => {
  it('moves from within to near to over the limit', () => {
    expect(limitStatus(card(6.4, 8))).toMatchObject({
      tone: 'success',
      label: 'Within limit · 80%',
      detail: '1.6 h left',
    });
    expect(limitStatus(card(1013.8, 1050))).toMatchObject({
      tone: 'warning',
      label: 'Near limit · 97%',
    });
    expect(limitStatus(card(41.2, 40))).toMatchObject({
      tone: 'danger',
      label: 'Over limit · 103%',
      detail: '1.2 h over',
    });
  });
});

describe('chart ticks', () => {
  it('splits every range from the brief into even steps', () => {
    expect([45, 125, 325, 625, 1200].map(tickStep)).toEqual([
      15, 25, 65, 125, 400,
    ]);
  });

  it('labels the limit and hides grid labels that would collide with it', () => {
    const labels = (yMax: number, limit: number) =>
      yTicks(yMax, limit)
        .filter((tick) => tick.label)
        .map((tick) => tick.label);
    expect(labels(45, 40)).toEqual(['0', '15', '30', '45 h', '40 h']);
    expect(labels(125, 100)).toEqual(['0', '25', '50', '75', '125 h', '100 h']);
  });
});

describe('calendar', () => {
  it('starts weeks on Monday', () => {
    const may = monthGrid(2026, 5, []);
    expect(may.findIndex(Boolean)).toBe(4); // 1 May 2026 is a Friday
    expect(may.filter(Boolean)).toHaveLength(31);
    expect(monthGrid(2026, 6, []).findIndex(Boolean)).toBe(0); // a Monday
  });

  it('places entries on their own day', () => {
    const grid = monthGrid(2026, 5, [entry('2026-05-19', 2, 0)]);
    expect(grid.find((cell) => cell?.day === 19)?.entry?.base_name).toBe('SIQ');
    expect(grid.find((cell) => cell?.day === 18)?.entry).toBeUndefined();
  });

  it('finds the next day with duties left to log', () => {
    const entries = [
      entry('2026-05-14', 6, 6),
      entry('2026-05-15', 6, 6),
      entry('2026-05-21', 4, 0),
      entry('2026-05-19', 2, 0),
    ];
    expect(nextDuty(entries)?.duty_date).toBe('2026-05-19');
    expect(nextDuty([entry('2026-04-30', 2, 0)])).toBeUndefined();
  });

  it('moves between months across a year end', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });

  it('validates calendar dates', () => {
    expect(isCalendarDate('2026-05-19')).toBe(true);
    expect(isCalendarDate('2026-02-30')).toBe(false);
    expect(isCalendarDate('19-05-2026')).toBe(false);
  });

  it('picks readable text for duty colours', () => {
    expect(textOn('#10B981')).toBe('dark');
    expect(textOn('#FBA577')).toBe('dark');
    expect(textOn('#475569')).toBe('light');
    expect(textOn('#7C3AED')).toBe('light');
    expect(textOn('#111827')).toBe('light');
  });
});
