import { Injectable } from '@nestjs/common';
import { SeedService } from '../data/seed.service.js';

const AVATAR =
  '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#0E2138"/><text x="48" y="49" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" font-weight="700" fill="white">JD</text></svg>';

@Injectable()
export class PilotService {
  constructor(private readonly seed: SeedService) {}

  getProfile() {
    return {
      ...this.seed.flights.pilot,
      avatarUrl: `data:image/svg+xml;base64,${Buffer.from(AVATAR).toString('base64')}`,
    };
  }
}
