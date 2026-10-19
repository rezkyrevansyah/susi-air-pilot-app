<template>
  <section class="hours-card" aria-labelledby="chart-title">
    <header class="hours-card__header">
      <h2 id="chart-title" class="hours-card__title">Rolling flight hours</h2>
      <p class="hours-card__window">Last {{ chart.windowDays }} days</p>
    </header>

    <RangeSelector
      :model-value="home.range"
      :loading="home.chartLoading"
      @update:model-value="home.setRange"
    />
    <p v-if="home.chartError" class="hours-card__error" role="alert">
      Couldn't load that range. Pick it again to retry.
    </p>

    <RollingChart :chart="chart" :as-of="asOf" />

    <ul class="hours-card__legend">
      <li><span class="swatch swatch--line" />Rolling total</li>
      <li>
        <span class="swatch swatch--limit" />Limit
        {{ formatLimit(chart.limit) }} h
      </li>
      <li><span class="swatch swatch--over" />Above limit</li>
    </ul>

    <p
      class="hours-card__summary"
      :class="{ 'hours-card__summary--over': chart.overLimitDays }"
    >
      <component
        :is="chart.overLimitDays ? TriangleAlert : CircleCheck"
        aria-hidden="true"
      />
      <span>
        Highest value {{ formatHours(chart.peak.rollingHours) }} h on
        {{ formatDayMonth(chart.peak.date) }} ·
        {{
          chart.overLimitDays
            ? `above the limit on ${chart.overLimitDays} ${chart.overLimitDays === 1 ? 'day' : 'days'}`
            : 'within the limit every day'
        }}
      </span>
    </p>
  </section>
</template>

<script setup lang="ts">
import { CircleCheck, TriangleAlert } from 'lucide-vue-next';
import type { FlightSummary } from '~/types/api';

defineProps<{ chart: FlightSummary['chart']; asOf: string }>();
const home = useHomeStore();
</script>

<style scoped lang="scss">
.hours-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: $space-4;
  @include card;
}

.hours-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.hours-card__title {
  @include text(16px, 20px, 800);
}

.hours-card__window {
  color: $muted;
  @include text(12px, 16px, 500);
}

.hours-card__error {
  color: $danger-ink;
  @include text(12px, 16px, 600);
}

.hours-card__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px $space-4;
  margin: 0;
  padding: 0;
  list-style: none;
  @include text(12px, 15px, 600);

  li {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.swatch {
  display: inline-block;
  width: 16px;
}

.swatch--line {
  height: 3px;
  border-radius: 2px;
  background: $chart;
}

.swatch--limit {
  height: 2px;
  background: $danger;
}

.swatch--over {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: $danger;
}

.hours-card__summary {
  display: flex;
  gap: $space-2;
  color: $muted;
  @include text(12px, 15px, 500);

  svg {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    color: $success-ink;
  }
}

.hours-card__summary--over svg {
  color: $danger-ink;
}
</style>
