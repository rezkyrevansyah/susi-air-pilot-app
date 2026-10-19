export interface YTick {
  value: number;
  label: string;
  isLimit: boolean;
}

// Split the axis into 3–5 equal steps that land on multiples of 5:
// 45 → 15, 125 → 25, 325 → 65, 625 → 125, 1200 → 400.
export function tickStep(yMax: number): number {
  for (const parts of [3, 4, 5]) {
    const step = yMax / parts;
    if (Number.isInteger(step) && step % 5 === 0) return step;
  }
  return yMax / 4;
}

// Grid ticks plus the limit. A tick too close to the limit keeps its grid
// line but drops its label, so the red limit label never collides with it.
export function yTicks(yMax: number, limit: number): YTick[] {
  const step = tickStep(yMax);
  const minGap = yMax * 0.08;
  const ticks: YTick[] = [];
  for (let value = 0; value <= yMax; value += step) {
    const nearLimit = Math.abs(value - limit) < minGap;
    ticks.push({
      value,
      label: nearLimit ? '' : value === yMax ? `${value} h` : String(value),
      isLimit: false,
    });
  }
  ticks.push({ value: limit, label: `${limit} h`, isLimit: true });
  return ticks;
}

// Day labels under the 15-point chart: both ends, today and two in between.
export const X_LABEL_INDEXES = [0, 3, 7, 11, 14];
