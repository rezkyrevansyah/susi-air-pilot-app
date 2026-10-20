<template>
  <section class="calendar" aria-labelledby="calendar-month">
    <div class="calendar__nav">
      <NuxtLink
        :to="{ query: { month: shiftMonth(month, -1) } }"
        class="calendar__arrow"
        aria-label="Previous month"
      >
        <ChevronLeft aria-hidden="true" />
      </NuxtLink>
      <div class="calendar__heading">
        <h2 id="calendar-month" class="calendar__month">
          {{ formatMonth(year, monthNumber) }}
        </h2>
        <p class="calendar__caption" aria-live="polite">
          <template v-if="loading">
            <LoaderCircle class="calendar__spinner" aria-hidden="true" />
            Loading from API…
          </template>
          <template v-else-if="data">{{ dutyDaysLabel }}</template>
        </p>
      </div>
      <NuxtLink
        :to="{ query: { month: shiftMonth(month, 1) } }"
        class="calendar__arrow"
        aria-label="Next month"
      >
        <ChevronRight aria-hidden="true" />
      </NuxtLink>
    </div>

    <div class="calendar__grid" role="grid" :aria-busy="loading">
      <div class="calendar__weekdays" role="row">
        <span v-for="day in WEEKDAYS" :key="day" role="columnheader">{{
          day
        }}</span>
      </div>
      <div class="calendar__days">
        <template
          v-for="(cell, index) in cells"
          :key="cell?.date ?? `pad-${index}`"
        >
          <span v-if="!cell" aria-hidden="true" />
          <span
            v-else-if="loading"
            class="calendar__day calendar__day--loading"
          />
          <CalendarDay
            v-else
            :day="cell"
            :label="cell.entry ? legendLabel(cell.entry.duty_type) : ''"
            :highlighted="cell.date === highlight"
          />
        </template>
      </div>
    </div>

    <div
      v-if="data && !data.schedules.length && !loading"
      class="calendar__empty"
    >
      <CalendarX aria-hidden="true" />
      <div>
        <p class="calendar__empty-title">
          No duties scheduled in {{ formatMonth(year, monthNumber) }}
        </p>
        <p>The API returned no schedule entries for this month.</p>
      </div>
    </div>

    <ul v-if="legend.length" class="calendar__legend" aria-label="Duty types">
      <li v-for="item in legend" :key="item.code">
        <span class="calendar__swatch" :style="{ background: item.color }" />
        <strong>{{ item.code }}</strong>
        <span class="calendar__legend-label">{{ item.label }}</span>
      </li>
      <li class="calendar__indicator">
        <span class="calendar__chip"
          ><span><Check aria-hidden="true" /></span
        ></span>
        All logged
      </li>
      <li class="calendar__indicator">
        <span class="calendar__chip"><span>2</span></span>
        Duties remaining
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import {
  CalendarX,
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from 'lucide-vue-next';
import type { DutyLegend, ScheduleMonth } from '~/types/api';

const props = defineProps<{
  month: string;
  data?: ScheduleMonth;
  legend: readonly DutyLegend[];
  loading: boolean;
  highlight?: string;
}>();

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const year = computed(() => parseMonth(props.month)!.year);
const monthNumber = computed(() => parseMonth(props.month)!.month);
const cells = computed(() =>
  monthGrid(year.value, monthNumber.value, props.data?.schedules ?? []),
);
const dutyDaysLabel = computed(() => {
  const count = props.data?.schedules.length ?? 0;
  return count
    ? `${count} duty ${count === 1 ? 'day' : 'days'}`
    : 'No duty days';
});

const legendLabel = (code: string) =>
  props.legend.find((item) => item.code === code)?.label ?? code;
</script>

<style scoped lang="scss">
.calendar {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-4;
  @include card;

  @include narrow {
    padding: $space-3;
  }
}

.calendar__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar__arrow {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: $navy-tint;

  svg {
    width: 22px;
    height: 22px;
  }

  &:active {
    background: #dde3eb;
  }
}

.calendar__heading {
  text-align: center;
}

.calendar__month {
  @include text(18px, 24px, 800);
}

.calendar__caption {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 16px;
  margin-top: 2px;
  color: $muted;
  @include text(12px, 16px, 500);
}

.calendar__spinner {
  width: 12px;
  height: 12px;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.calendar__grid {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.calendar__weekdays,
.calendar__days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: $space-1;

  @include narrow {
    gap: 3px;
  }
}

.calendar__weekdays {
  color: $muted;
  text-align: center;
  @include text(11px, 16px, 700);
}

.calendar__day--loading {
  height: 58px;
  border-radius: 10px;
  background: $bg;
}

.calendar__empty {
  display: flex;
  gap: $space-3;
  padding: $space-3 14px;
  border-radius: $radius-field;
  background: $bg;
  color: $muted;
  @include text(12px, 16px, 500);

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    color: $navy;
  }
}

.calendar__empty-title {
  margin-bottom: 2px;
  color: $navy;
  @include text(13px, 18px, 800);
}

.calendar__legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px $space-3;
  margin: 0;
  padding: $space-3 0 0;
  border-top: 1px solid $border;
  list-style: none;
  @include text(12px, 16px, 500);

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }

  li {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  strong {
    font-weight: 800;
  }
}

.calendar__legend-label {
  color: $muted;
  overflow-wrap: anywhere;
}

.calendar__swatch {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.calendar__indicator {
  font-weight: 600;
}

.calendar__chip {
  display: grid;
  place-items: center;
  width: 26px;
  height: 22px;
  border-radius: 6px;
  background: $muted;

  > span {
    display: grid;
    place-items: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    @include text(10px, 12px, 800);
  }

  svg {
    width: 11px;
    height: 11px;
  }
}
</style>
