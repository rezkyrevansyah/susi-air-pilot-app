import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  validateDocumentData,
  validateFlightData,
  validateScheduleData,
} from './validate-seed.js';

function freeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

export function readSeed<T>(
  filename: string,
  validate: (value: unknown) => T,
): T {
  try {
    const raw: unknown = JSON.parse(
      readFileSync(join(import.meta.dirname, filename), 'utf8'),
    );
    return freeze(validate(raw));
  } catch (error) {
    throw new Error(
      `Cannot load ${filename}: ${error instanceof Error ? error.message : 'invalid seed'}`,
    );
  }
}

@Injectable()
export class SeedService {
  readonly flights = readSeed('mock-flight-hours.json', validateFlightData);
  readonly documents = readSeed('mock-documents.json', validateDocumentData);
  readonly schedules = readSeed('mock-schedules.json', validateScheduleData);
}
