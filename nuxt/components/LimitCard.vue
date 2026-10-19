<template>
  <article class="limit-card" :class="`limit-card--${state.tone}`">
    <div class="limit-card__top">
      <div>
        <h3 class="limit-card__label">{{ periodLabel(card) }}</h3>
        <p class="limit-card__window">{{ windowLabel(card) }}</p>
      </div>
      <p class="limit-card__value">
        <strong>{{ formatHours(card.hours) }}</strong>
        <span>/ {{ formatLimit(card.limit) }} h</span>
      </p>
    </div>

    <div
      class="limit-card__track"
      role="meter"
      :aria-label="`${periodLabel(card)} hours against the ${formatLimit(card.limit)} hour limit`"
      :aria-valuenow="card.hours"
      aria-valuemin="0"
      :aria-valuemax="card.limit"
    >
      <span :style="{ width: `${Math.min(card.usagePercent, 100)}%` }" />
    </div>

    <div class="limit-card__status">
      <p class="limit-card__state">
        <component :is="icons[state.tone]" aria-hidden="true" />
        {{ state.label }}
      </p>
      <p class="limit-card__detail">{{ state.detail }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { CircleCheck, OctagonAlert, TriangleAlert } from 'lucide-vue-next';
import type { LimitCard as Card } from '~/types/api';

const props = defineProps<{ card: Card }>();
const state = computed(() => limitStatus(props.card));
const icons = {
  success: CircleCheck,
  warning: TriangleAlert,
  danger: OctagonAlert,
};
</script>

<style scoped lang="scss">
.limit-card {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-4;
  @include card;
}

.limit-card__top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-3;

  // Four cards share one row on desktop, so the value drops under the title.
  @include desktop {
    flex-direction: column;
    align-items: flex-start;
    gap: $space-2;
  }
}

.limit-card__label {
  @include text(15px, 20px, 800);
}

.limit-card__window {
  margin-top: 2px;
  color: $muted;
  @include text(12px, 16px, 500);
}

.limit-card__value {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;

  strong {
    @include text(26px, 30px, 800);
    font-variant-numeric: tabular-nums;

    .limit-card--danger & {
      color: $danger-ink;
    }
  }

  span {
    color: $muted;
    @include text(13px, 16px, 600);
  }
}

.limit-card__track {
  height: 8px;
  overflow: hidden;
  border-radius: 4px;
  background: $navy-tint;

  span {
    display: block;
    height: 100%;
    border-radius: 4px;
    transition: width 0.4s ease-out;

    .limit-card--success & {
      background: $success;
    }
    .limit-card--warning & {
      background: $warning;
    }
    .limit-card--danger & {
      background: $danger;
    }
  }
}

.limit-card__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-2;
  @include text(12px, 16px, 600);
}

.limit-card__state {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;

  svg {
    width: 14px;
    height: 14px;
  }

  .limit-card--success & {
    color: $success-ink;
  }
  .limit-card--warning & {
    color: $warning-ink;
  }
  .limit-card--danger & {
    color: $danger-ink;
  }
}

.limit-card__detail {
  color: $muted;

  .limit-card--danger & {
    color: $danger-ink;
  }
}
</style>
