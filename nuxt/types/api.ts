// Response shapes of the Pilot API (see nest/README.md).

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface PilotProfile {
  name: string;
  totalFlightHours: number;
  avatarUrl: string;
}

export type ChartRange = '1w' | '1m' | '3m' | '6m' | '1y';
export const CHART_RANGES: ChartRange[] = ['1w', '1m', '3m', '6m', '1y'];

export type LimitPeriod = 'daily' | 'weekly' | 'monthly' | 'annual';

export interface LimitCard {
  period: LimitPeriod;
  windowDays: number;
  hours: number;
  limit: number;
  remainingHours: number;
  usagePercent: number;
}

export interface ChartPoint {
  date: string;
  rollingHours: number;
  isOverLimit: boolean;
}

export interface FlightSummary {
  asOf: string;
  range: ChartRange;
  cards: LimitCard[];
  chart: {
    windowDays: number;
    limit: number;
    yMax: number;
    points: ChartPoint[];
    peak: { date: string; rollingHours: number };
    overLimitDays: number;
  };
}

export type DocumentStatus = 'safe' | 'soon' | 'expired';

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentStatus;
}

export interface DocumentsResponse {
  asOf: string;
  documents: PilotDocument[];
}

export interface DutyLegend {
  code: string;
  label: string;
  color: string;
}

export interface ScheduleEntry {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface ScheduleMonth {
  year: number;
  month: number;
  legend: DutyLegend[];
  schedules: ScheduleEntry[];
}

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  details?: string[];
}
