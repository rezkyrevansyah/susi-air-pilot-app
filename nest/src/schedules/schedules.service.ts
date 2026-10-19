import { Injectable } from '@nestjs/common';
import { SeedService } from '../data/seed.service.js';

@Injectable()
export class SchedulesService {
  constructor(private readonly seed: SeedService) {}

  getMonth(year: string, month: string) {
    return {
      year: Number(year),
      month: Number(month),
      legend: this.seed.schedules.legend,
      schedules: this.seed.schedules.schedules
        .filter(({ duty_date }) => duty_date.startsWith(`${year}-${month}-`))
        .sort((a, b) => a.duty_date.localeCompare(b.duty_date)),
    };
  }
}
