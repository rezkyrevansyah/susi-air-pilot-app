import { BadRequestException, Injectable } from '@nestjs/common';
import { addDays, REFERENCE_DATE } from '../common/date.js';
import { ChartRange, LimitPeriod } from '../data/data.types.js';
import { SeedService } from '../data/seed.service.js';

const CARD_WINDOWS: Record<LimitPeriod, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  annual: 365,
};
const roundHours = (hours: number) => Math.round(hours * 10) / 10;

@Injectable()
export class FlightHoursService {
  private readonly hoursByDate: ReadonlyMap<string, number>;

  constructor(private readonly seed: SeedService) {
    this.hoursByDate = new Map(
      seed.flights.flightHours.map(({ date, hours }) => [date, hours]),
    );
  }

  getDailyHours(from: string, to: string) {
    if (from > to) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'from must be on or before to',
      });
    }
    return {
      from,
      to,
      days: this.seed.flights.flightHours
        .filter(({ date }) => date >= from && date <= to)
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  calculateRollingHours(endDate: string, windowDays: number): number {
    let total = 0;
    for (let offset = 0; offset < windowDays; offset++) {
      total += this.hoursByDate.get(addDays(endDate, -offset)) ?? 0;
    }
    return roundHours(total);
  }

  getSummary(range: ChartRange) {
    const bounds = this.seed.flights.chartBounds[range];
    const cards = (Object.entries(CARD_WINDOWS) as [LimitPeriod, number][]).map(
      ([period, windowDays]) => {
        const hours = this.calculateRollingHours(REFERENCE_DATE, windowDays);
        const limit = this.seed.flights.limits[period];
        return {
          period,
          windowDays,
          hours,
          limit,
          remainingHours: roundHours(Math.max(0, limit - hours)),
          usagePercent: Math.round((hours / limit) * 100),
        };
      },
    );
    const points = Array.from(
      { length: bounds.displayRangeDays * 2 + 1 },
      (_, index) => {
        const date = addDays(REFERENCE_DATE, index - bounds.displayRangeDays);
        const rollingHours = this.calculateRollingHours(
          date,
          bounds.windowDays,
        );
        return { date, rollingHours, isOverLimit: rollingHours > bounds.limit };
      },
    );
    const peak = points.reduce((highest, point) =>
      point.rollingHours > highest.rollingHours ? point : highest,
    );
    return {
      asOf: REFERENCE_DATE,
      range,
      cards,
      chart: {
        windowDays: bounds.windowDays,
        limit: bounds.limit,
        yMax: bounds.max,
        points,
        peak: { date: peak.date, rollingHours: peak.rollingHours },
        overLimitDays: points.filter((point) => point.isOverLimit).length,
      },
    };
  }
}
