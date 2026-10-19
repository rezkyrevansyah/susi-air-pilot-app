import { SeedService } from '../data/seed.service.js';
import { FlightHoursService } from './flight-hours.service.js';

describe('FlightHoursService', () => {
  const seed = new SeedService();
  const service = new FlightHoursService(seed);

  it('matches all four reference-date cards', () => {
    expect(service.getSummary('1w').cards).toEqual([
      {
        period: 'daily',
        windowDays: 1,
        hours: 6.4,
        limit: 8,
        remainingHours: 1.6,
        usagePercent: 80,
      },
      {
        period: 'weekly',
        windowDays: 7,
        hours: 25.2,
        limit: 40,
        remainingHours: 14.8,
        usagePercent: 63,
      },
      {
        period: 'monthly',
        windowDays: 30,
        hours: 87.2,
        limit: 100,
        remainingHours: 12.8,
        usagePercent: 87,
      },
      {
        period: 'annual',
        windowDays: 365,
        hours: 1013.8,
        limit: 1050,
        remainingHours: 36.2,
        usagePercent: 97,
      },
    ]);
  });

  it('keeps today centered and includes the seeded future values', () => {
    const { chart } = service.getSummary('1w');
    expect(chart.points).toHaveLength(15);
    expect(chart.points[0]?.date).toBe('2026-05-08');
    expect(chart.points[7]).toEqual({
      date: '2026-05-15',
      rollingHours: 25.2,
      isOverLimit: false,
    });
    expect(chart.points[14]?.date).toBe('2026-05-22');
    expect(chart.peak).toEqual({ date: '2026-05-20', rollingHours: 44.7 });
    expect(chart.overLimitDays).toBe(4);
  });

  it('matches the monthly over-limit dates', () => {
    const { chart } = service.getSummary('1m');
    expect(chart.peak).toEqual({ date: '2026-05-08', rollingHours: 102.2 });
    expect(
      chart.points
        .filter((point) => point.isOverLimit)
        .map((point) => point.date),
    ).toEqual(['2026-05-08', '2026-05-21']);
  });

  it('uses inclusive windows and counts missing dates as zero across a leap day', () => {
    const sparse = new FlightHoursService({
      ...seed,
      flights: {
        ...seed.flights,
        flightHours: [
          { date: '2024-02-27', hours: 9 },
          { date: '2024-02-28', hours: 0.1 },
          { date: '2024-03-01', hours: 0.2 },
        ],
      },
    });
    expect(sparse.calculateRollingHours('2024-03-01', 3)).toBe(0.3);
    expect(sparse.calculateRollingHours('2024-02-29', 1)).toBe(0);
    expect(sparse.calculateRollingHours('2024-02-26', 30)).toBe(0);
  });

  it('pads the early dataset with zero rather than shrinking the window', () => {
    expect(service.calculateRollingHours('2024-12-27', 365)).toBe(5.7);
    expect(service.calculateRollingHours('2024-12-28', 1)).toBe(0);
    expect(service.calculateRollingHours('2024-12-28', 7)).toBe(5.7);
  });
});
