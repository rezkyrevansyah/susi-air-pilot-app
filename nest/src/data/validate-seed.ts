import { isDateOnly } from '../common/date.js';
import {
  DocumentData,
  FlightData,
  RANGES,
  ScheduleData,
} from './data.types.js';

function requireValue(condition: boolean, field: string): asserts condition {
  if (!condition) throw new Error(`Invalid seed field: ${field}`);
}

function record(value: unknown, field: string): Record<string, unknown> {
  requireValue(
    typeof value === 'object' && value !== null && !Array.isArray(value),
    field,
  );
  return value as Record<string, unknown>;
}

function rows(value: unknown, field: string): Record<string, unknown>[] {
  requireValue(Array.isArray(value), field);
  return (value as unknown[]).map((item, index) =>
    record(item, `${field}[${index}]`),
  );
}

function text(value: unknown, field: string): asserts value is string {
  requireValue(typeof value === 'string' && value.trim().length > 0, field);
}

function number(
  value: unknown,
  field: string,
  integer = false,
): asserts value is number {
  requireValue(
    typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= 0 &&
      (!integer || Number.isInteger(value)),
    field,
  );
}

function unique(items: Record<string, unknown>[], key: string): void {
  requireValue(
    new Set(items.map((item) => item[key])).size === items.length,
    `${key} must be unique`,
  );
}

function color(value: unknown, field: string): void {
  requireValue(
    typeof value === 'string' && /^#[\da-f]{6}$/i.test(value),
    field,
  );
}

export function validateFlightData(value: unknown): FlightData {
  const data = record(value, 'flight data');
  const pilot = record(data.pilot, 'pilot');
  text(pilot.name, 'pilot.name');
  number(pilot.totalFlightHours, 'pilot.totalFlightHours');
  const limits = record(data.limits, 'limits');
  for (const key of ['daily', 'weekly', 'monthly', 'annual']) {
    number(limits[key], `limits.${key}`);
    requireValue(limits[key] > 0, `limits.${key}`);
  }
  const bounds = record(data.chartBounds, 'chartBounds');
  for (const range of RANGES) {
    const bound = record(bounds[range], `chartBounds.${range}`);
    for (const key of ['limit', 'max', 'windowDays', 'displayRangeDays']) {
      number(bound[key], `chartBounds.${range}.${key}`, true);
      requireValue(bound[key] > 0, `chartBounds.${range}.${key}`);
    }
    requireValue(
      Number(bound.max) >= Number(bound.limit),
      `chartBounds.${range}.max`,
    );
    requireValue(
      bound.displayRangeDays === 7,
      `chartBounds.${range}.displayRangeDays`,
    );
  }
  const hours = rows(data.flightHours, 'flightHours');
  requireValue(hours.length > 0, 'flightHours must not be empty');
  for (const row of hours) {
    requireValue(isDateOnly(row.date), 'flightHours.date');
    number(row.hours, 'flightHours.hours');
  }
  unique(hours, 'date');
  return value as FlightData;
}

export function validateDocumentData(value: unknown): DocumentData {
  const data = record(value, 'document data');
  requireValue(isDateOnly(data.today), 'documents.today');
  const thresholds = record(data.thresholds, 'thresholds');
  number(thresholds.warningDays, 'thresholds.warningDays', true);
  const documents = rows(data.documents, 'documents');
  for (const row of documents) {
    text(row.id, 'documents.id');
    text(row.label, 'documents.label');
    requireValue(isDateOnly(row.expiryDate), 'documents.expiryDate');
  }
  unique(documents, 'id');
  return value as DocumentData;
}

export function validateScheduleData(value: unknown): ScheduleData {
  const data = record(value, 'schedule data');
  requireValue(isDateOnly(data.today), 'schedules.today');
  const legend = rows(data.legend, 'legend');
  for (const row of legend) {
    text(row.code, 'legend.code');
    text(row.label, 'legend.label');
    color(row.color, 'legend.color');
  }
  unique(legend, 'code');
  const codes = new Set(legend.map((item) => item.code));
  const schedules = rows(data.schedules, 'schedules');
  for (const row of schedules) {
    text(row.id, 'schedules.id');
    text(row.base_name, 'schedules.base_name');
    requireValue(isDateOnly(row.duty_date), 'schedules.duty_date');
    requireValue(row.status === 1 || row.status === 2, 'schedules.status');
    requireValue(codes.has(row.duty_type), 'schedules.duty_type');
    color(row.base_color, 'schedules.base_color');
    number(row.count_schedules, 'schedules.count_schedules', true);
    number(row.count_logbooks, 'schedules.count_logbooks', true);
    requireValue(
      row.count_logbooks <= row.count_schedules,
      'schedules.count_logbooks exceeds count_schedules',
    );
  }
  unique(schedules, 'id');
  unique(schedules, 'duty_date');
  return value as ScheduleData;
}
