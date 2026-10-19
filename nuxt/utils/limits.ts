import type { LimitCard } from '~/types/api';
import { formatHours } from './format';

export type Tone = 'success' | 'warning' | 'danger';

// Cards turn amber from 90% of a limit, matching the "Near limit" state in the design.
const NEAR_LIMIT_PERCENT = 90;

export interface LimitStatus {
  tone: Tone;
  label: string;
  detail: string;
}

export function limitStatus(card: LimitCard): LimitStatus {
  const percent = `${card.usagePercent}%`;
  if (card.hours > card.limit) {
    return {
      tone: 'danger',
      label: `Over limit · ${percent}`,
      detail: `${formatHours(card.hours - card.limit)} h over`,
    };
  }
  return {
    tone: card.usagePercent >= NEAR_LIMIT_PERCENT ? 'warning' : 'success',
    label: `${card.usagePercent >= NEAR_LIMIT_PERCENT ? 'Near' : 'Within'} limit · ${percent}`,
    detail: `${formatHours(card.remainingHours)} h left`,
  };
}

const PERIOD_LABELS: Record<LimitCard['period'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  annual: 'Annual',
};

export const periodLabel = (card: LimitCard) => PERIOD_LABELS[card.period];

export const windowLabel = (card: LimitCard) =>
  card.windowDays === 1 ? 'Today only' : `Rolling ${card.windowDays} days`;
