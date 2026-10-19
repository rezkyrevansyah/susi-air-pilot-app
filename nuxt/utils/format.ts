// API dates are calendar dates (YYYY-MM-DD). They are parsed and formatted in
// UTC so the device timezone can never shift a duty or expiry to another day.

export function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

const formatter = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options });

const dayMonthYear = formatter({
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const dayMonth = formatter({ day: 'numeric', month: 'short' });
const weekday = formatter({ weekday: 'short' });
const monthYear = formatter({ month: 'long', year: 'numeric' });

/** 14 Oct 2026 */
export const formatDate = (date: string) =>
  dayMonthYear.format(parseDate(date));

/** 15 May */
export const formatDayMonth = (date: string) =>
  dayMonth.format(parseDate(date));

/** Fri, 15 May — or Fri, 15 May 2026 with `withYear` */
export function formatWeekday(date: string, withYear = false): string {
  const day = parseDate(date);
  const rest = withYear ? dayMonthYear.format(day) : dayMonth.format(day);
  return `${weekday.format(day)}, ${rest}`;
}

/** May 2026, from year and 1-based month */
export const formatMonth = (year: number, month: number) =>
  monthYear.format(new Date(Date.UTC(year, month - 1, 1)));

const oneDecimal = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** Flight hours always show one decimal, like the source data: 1,013.8 */
export const formatHours = (hours: number) => oneDecimal.format(hours);

/** Limits are whole hours: 1,050 */
export const formatLimit = (hours: number) => whole.format(hours);

/** 152 days left · expires today · expired 14 days ago */
export function formatDaysRemaining(days: number): string {
  const plural = (n: number) => `${n} day${n === 1 ? '' : 's'}`;
  if (days > 0) return `${plural(days)} left`;
  if (days === 0) return 'expires today';
  return `expired ${plural(-days)} ago`;
}
