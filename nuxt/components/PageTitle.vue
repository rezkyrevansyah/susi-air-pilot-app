<template>
  <div class="page-title">
    <h1>{{ title }}</h1>
    <p v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<style scoped lang="scss">
h1 {
  @include text(28px, 34px, 800);
}

p {
  margin-top: 2px;
  color: $muted;
}
</style>
