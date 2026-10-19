<template>
  <div
    class="range"
    role="radiogroup"
    aria-label="Chart range"
    @keydown.left.prevent="step(-1)"
    @keydown.right.prevent="step(1)"
  >
    <button
      v-for="option in CHART_RANGES"
      :key="option"
      ref="buttons"
      type="button"
      role="radio"
      class="range__option"
      :aria-checked="option === modelValue"
      :tabindex="option === modelValue ? 0 : -1"
      @click="$emit('update:modelValue', option)"
    >
      <LoaderCircle
        v-if="loading && option === modelValue"
        class="range__spinner"
        aria-hidden="true"
      />
      {{ option }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import { CHART_RANGES, type ChartRange } from '~/types/api';

const props = defineProps<{ modelValue: ChartRange; loading?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [ChartRange] }>();
const buttons = useTemplateRef<HTMLButtonElement[]>('buttons');

function step(direction: number) {
  const index = CHART_RANGES.indexOf(props.modelValue);
  const next = (index + direction + CHART_RANGES.length) % CHART_RANGES.length;
  emit('update:modelValue', CHART_RANGES[next]!);
  buttons.value?.[next]?.focus();
}
</script>

<style scoped lang="scss">
.range {
  display: flex;
  gap: $space-1;
  padding: $space-1;
  border-radius: $radius-pill;
  background: $navy-tint;
}

.range__option {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  border: 0;
  border-radius: $radius-pill;
  background: none;
  color: $muted;
  @include text(13px, 16px, 800);
  transition:
    background-color 0.15s,
    color 0.15s;

  &[aria-checked='true'] {
    background: $navy;
    color: #fff;
  }

  &:not([aria-checked='true']):hover {
    color: $navy;
  }
}

.range__spinner {
  width: 14px;
  height: 14px;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
