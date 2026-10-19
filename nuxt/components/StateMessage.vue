<template>
  <div
    class="state"
    :class="`state--${variant}`"
    :role="variant === 'error' ? 'alert' : undefined"
  >
    <span class="state__icon">
      <component :is="icon" aria-hidden="true" />
    </span>
    <h3 class="state__title">{{ title }}</h3>
    <p class="state__body"><slot /></p>
    <AppButton
      v-if="variant === 'error'"
      :icon="RefreshCw"
      class="state__retry"
      @click="$emit('retry')"
    >
      Try Again
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { CalendarX, Hourglass, RefreshCw, WifiOff } from 'lucide-vue-next';

const props = defineProps<{
  variant: 'error' | 'empty' | 'placeholder';
  title: string;
}>();
defineEmits<{ retry: [] }>();

const icons: Record<typeof props.variant, Component> = {
  error: WifiOff,
  empty: CalendarX,
  placeholder: Hourglass,
};
const icon = computed(() => icons[props.variant]);
</script>

<style scoped lang="scss">
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: $space-6;
  text-align: center;
  @include card;
}

.state__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: $navy-tint;
  color: $navy;

  svg {
    width: 26px;
    height: 26px;
  }

  .state--error & {
    background: $warning-bg;
    color: $warning-ink;
  }

  .state--placeholder & {
    width: 72px;
    height: 72px;
    border-radius: 20px;

    svg {
      width: 33px;
      height: 33px;
    }
  }
}

.state--placeholder {
  padding: 40px $space-6;
}

.state__title {
  @include text(18px, 24px, 800);

  .state--placeholder & {
    font-size: 20px;
  }
}

.state__body {
  color: $muted;

  &:empty {
    display: none;
  }
}

.state__retry {
  width: 220px;
  max-width: 100%;
}
</style>
