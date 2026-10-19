import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { ApiExceptionFilter } from './common/api-exception.filter.js';
import { ConfigModule } from './config/config.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { FlightHoursModule } from './flight-hours/flight-hours.module.js';
import { PilotModule } from './pilot/pilot.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule {}
