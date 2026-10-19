import { Controller, Get } from '@nestjs/common';
import { PilotService } from './pilot.service.js';

@Controller('pilot')
export class PilotController {
  constructor(private readonly pilot: PilotService) {}

  @Get('me')
  getProfile() {
    return this.pilot.getProfile();
  }
}
