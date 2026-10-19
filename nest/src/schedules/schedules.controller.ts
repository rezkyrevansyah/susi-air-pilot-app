import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesQueryDto } from './schedules.dto.js';
import { SchedulesService } from './schedules.service.js';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  getMonth(@Query() query: SchedulesQueryDto) {
    return this.schedules.getMonth(query.year, query.month);
  }
}
