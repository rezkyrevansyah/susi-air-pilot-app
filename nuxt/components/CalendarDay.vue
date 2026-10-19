<template>
  <NuxtLink
    :to="`/schedule/${day.date}`"
    class="day"
    :class="{
      'day--duty': entry,
      'day--light-text': entry && textOn(entry.base_color) === 'light',
      'day--today': day.date === BUSINESS_TODAY,
      'day--highlighted': highlighted,
    }"
    :style="entry ? { background: entry.base_color } : undefined"
    :aria-label="ariaLabel"
  >
    <span class="day__top">
      <span class="day__number">{{ day.day }}</span>
      <span v-if="entry" class="day__status">
        <Check v-if="remaining === 0" aria-hidden="true" />
        <template v-else>{{ remaining }}</template>
      </span>
    </span>
    <span v-if="entry" class="day__base">{{ entry.base_name }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import type { CalendarDay } from '~/utils/calendar';

const props = defineProps<{
  day: CalendarDay;
  label: string;
  highlighted?: boolean;
}>();

const entry = computed(() => props.day.entry);
const remaining = computed(() =>
  entry.value ? remainingDuties(entry.value) : 0,
);

const ariaLabel = computed(() => {
  const date = formatWeekday(props.day.date, true);
  if (!entry.value) return `${date}, no duty`;
  const status =
    remaining.value === 0
      ? 'all duties logged'
      : `${remaining.value} of ${entry.value.count_schedules} duties remaining`;
  return `${date}, ${props.label} at ${entry.value.base_name}, ${status}`;
});
</script>

<style scoped lang="scss">
.day {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  height: 58px;
  padding: 3px 3px 5px;
  border-radius: 10px;
  background: $bg;
  color: $navy;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.96);
  }

  @include narrow {
    height: 52px;
  }
}

.day--light-text {
  color: #fff;
}

.day--highlighted {
  box-shadow: inset 0 0 0 2.5px $navy;
}

.day__top {
  display: flex;
  justify-content: space-between;
}

.day__number {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  @include text(12px, 16px, 700);

  .day--duty & {
    font-weight: 800;
  }

  .day--today & {
    background: $navy;
    color: #fff;
  }
}

.day__status {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  color: $navy;
  @include text(10px, 12px, 800);

  svg {
    width: 11px;
    height: 11px;
  }
}

.day__base {
  overflow: hidden;
  padding-left: 3px;
  @include text(10px, 12px, 800);
  letter-spacing: 0.4px;
  white-space: nowrap;
}
</style>
