export const RANGES = ['1w', '1m', '3m', '6m', '1y'] as const;
export type ChartRange = (typeof RANGES)[number];
export type LimitPeriod = 'daily' | 'weekly' | 'monthly' | 'annual';

export interface FlightDay {
  readonly date: string;
  readonly hours: number;
}

export interface ChartBounds {
  readonly limit: number;
  readonly max: number;
  readonly windowDays: number;
  readonly displayRangeDays: number;
}

export interface FlightData {
  readonly pilot: { readonly name: string; readonly totalFlightHours: number };
  readonly limits: Readonly<Record<LimitPeriod, number>>;
  readonly chartBounds: Readonly<Record<ChartRange, ChartBounds>>;
  readonly flightHours: readonly FlightDay[];
}

export interface PilotDocument {
  readonly id: string;
  readonly label: string;
  readonly expiryDate: string;
}

export interface DocumentData {
  readonly today: string;
  readonly thresholds: { readonly warningDays: number };
  readonly documents: readonly PilotDocument[];
}

export interface DutyLegend {
  readonly code: string;
  readonly label: string;
  readonly color: string;
}

export interface Schedule {
  readonly id: string;
  readonly duty_date: string;
  readonly status: number;
  readonly base_name: string;
  readonly base_color: string;
  readonly duty_type: string;
  readonly count_schedules: number;
  readonly count_logbooks: number;
}

export interface ScheduleData {
  readonly today: string;
  readonly legend: readonly DutyLegend[];
  readonly schedules: readonly Schedule[];
}
