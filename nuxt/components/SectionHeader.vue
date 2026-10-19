<template>
  <div class="section-header">
    <h2 :id="id" class="section-header__title">{{ title }}</h2>
    <p v-if="meta" class="section-header__meta">{{ meta }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; meta?: string; id?: string }>();
</script>

<style scoped lang="scss">
.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-3;
}

.section-header__title {
  @include text(18px, 24px, 800);
}

.section-header__meta {
  color: $muted;
  @include text(12px, 16px, 500);
}
</style>
