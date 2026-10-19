import { Module } from '@nestjs/common';
import { DataModule } from '../data/data.module.js';
import { FlightHoursController } from './flight-hours.controller.js';
import { FlightHoursService } from './flight-hours.service.js';

@Module({
  imports: [DataModule],
  controllers: [FlightHoursController],
  providers: [FlightHoursService],
})
export class FlightHoursModule {}
