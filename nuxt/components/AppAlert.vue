<template>
  <div class="alert" :class="`alert--${tone}`" role="alert">
    <component
      :is="tone === 'network' ? WifiOff : CircleAlert"
      aria-hidden="true"
    />
    <div>
      <p class="alert__title">{{ title }}</p>
      <p v-if="$slots.default" class="alert__body"><slot /></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleAlert, WifiOff } from 'lucide-vue-next';

defineProps<{ title: string; tone: 'error' | 'network' }>();
</script>

<style scoped lang="scss">
.alert {
  display: flex;
  gap: $space-3;
  padding: 14px $space-4;
  border: 1px solid;
  border-radius: $radius-field;

  > svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
}

.alert--error {
  background: $danger-bg;
  border-color: #f4bfca;
  color: $danger-ink;
}

.alert--network {
  background: $warning-bg;
  border-color: #f3d9a6;
  color: $warning-ink;
}

.alert__title {
  @include text(14px, 20px, 700);
}

.alert__body {
  margin-top: 2px;
  color: $navy;
  @include text(13px, 18px, 500);
}
</style>
