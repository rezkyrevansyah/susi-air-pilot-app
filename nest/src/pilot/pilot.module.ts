import { Module } from '@nestjs/common';
import { DataModule } from '../data/data.module.js';
import { PilotController } from './pilot.controller.js';
import { PilotService } from './pilot.service.js';

@Module({
  imports: [DataModule],
  controllers: [PilotController],
  providers: [PilotService],
})
export class PilotModule {}
