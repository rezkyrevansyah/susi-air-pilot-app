import { IsIn } from 'class-validator';
import { IsDateOnly } from '../common/is-date-only.decorator.js';
import { RANGES } from '../data/data.types.js';
import type { ChartRange } from '../data/data.types.js';

export class FlightHoursQueryDto {
  @IsDateOnly()
  from!: string;

  @IsDateOnly()
  to!: string;
}

export class FlightSummaryQueryDto {
  @IsIn(RANGES)
  range: ChartRange = '1w';
}
