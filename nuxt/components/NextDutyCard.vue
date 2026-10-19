<template>
  <NuxtLink
    :to="`/schedule/${entry.duty_date}`"
    class="next-duty"
    :aria-label="`Next duty: ${formatWeekday(entry.duty_date, true)}, ${entry.base_name}, ${label}, ${remaining} remaining`"
  >
    <span
      class="next-duty__swatch"
      :class="{
        'next-duty__swatch--light': textOn(entry.base_color) === 'light',
      }"
      :style="{ background: entry.base_color }"
    >
      {{ entry.duty_type }}
    </span>
    <span class="next-duty__text">
      <strong>{{ formatWeekday(entry.duty_date, true) }}</strong>
      <span class="next-duty__detail">
        {{ entry.base_name }} · {{ label }} · {{ remaining }}
        {{ remaining === 1 ? 'duty' : 'duties' }} remaining
      </span>
    </span>
    <ChevronRight class="next-duty__chevron" aria-hidden="true" />
  </NuxtLink>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import type { ScheduleEntry } from '~/types/api';

const props = defineProps<{ entry: ScheduleEntry; label: string }>();
const remaining = computed(() => remainingDuties(props.entry));
</script>

<style scoped lang="scss">
.next-duty {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: 14px $space-4;
  @include card;
}

.next-duty__swatch {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: $radius-field;
  @include text(12px, 16px, 800);
}

.next-duty__swatch--light {
  color: #fff;
}

.next-duty__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  strong {
    @include text(14px, 18px, 800);
  }
}

.next-duty__detail {
  color: $muted;
  @include text(12px, 16px, 500);
}

.next-duty__chevron {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}
</style>
