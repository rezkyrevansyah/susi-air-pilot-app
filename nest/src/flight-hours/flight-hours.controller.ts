import { Controller, Get, Query } from '@nestjs/common';
import {
  FlightHoursQueryDto,
  FlightSummaryQueryDto,
} from './flight-hours.dto.js';
import { FlightHoursService } from './flight-hours.service.js';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flights: FlightHoursService) {}

  @Get()
  getDailyHours(@Query() query: FlightHoursQueryDto) {
    return this.flights.getDailyHours(query.from, query.to);
  }

  @Get('summary')
  getSummary(@Query() query: FlightSummaryQueryDto) {
    return this.flights.getSummary(query.range);
  }
}
