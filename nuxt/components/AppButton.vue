<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled || loading"
    :aria-busy="loading || undefined"
    class="button"
    :class="`button--${variant}`"
  >
    <LoaderCircle v-if="loading" class="button__spinner" aria-hidden="true" />
    <component
      :is="icon"
      v-else-if="icon"
      class="button__icon"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { LoaderCircle } from 'lucide-vue-next';
import { NuxtLink } from '#components';

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'text';
    type?: 'button' | 'submit';
    to?: string;
    icon?: Component;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  { variant: 'primary', type: 'button' },
);
</script>

<style scoped lang="scss">
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 $space-6;
  border: 0;
  border-radius: $radius-pill;
  @include text(19px, 24px, 700);
  transition: background-color 0.15s;

  &:disabled:not([aria-busy]) {
    background: $disabled-bg;
    color: $disabled-ink;
    border-color: transparent;
    cursor: not-allowed;
  }

  &[aria-busy] {
    cursor: progress;
  }
}

.button--primary {
  background: $red;
  color: #fff;

  &:not(:disabled):hover,
  &:not(:disabled):active {
    background: $red-pressed;
  }
}

.button--secondary {
  background: $surface;
  color: $navy;
  border: 1.5px solid $navy;

  &:not(:disabled):active {
    background: $navy-tint;
  }
}

.button--text {
  min-height: 44px;
  padding: 0 $space-3;
  background: none;
  color: $navy;
  @include text(15px, 20px, 700);

  &:not(:disabled):active {
    background: $navy-tint;
  }
}

.button__icon,
.button__spinner {
  width: 20px;
  height: 20px;
}

.button__spinner {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
