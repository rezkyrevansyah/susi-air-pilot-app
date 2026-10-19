<template>
  <main class="error-page">
    <AppLogo :width="160" />
    <StateMessage variant="empty" :title="title">
      {{
        error.statusCode === 404
          ? 'This page does not exist in the Pilot App.'
          : 'Please try again in a moment.'
      }}
    </StateMessage>
    <AppButton @click="clearError({ redirect: '/home' })">Go to Home</AppButton>
  </main>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();
const title = computed(() =>
  props.error.statusCode === 404 ? 'Page not found' : 'Something went wrong',
);
useHead({ title: () => `${title.value} · Susi Air Pilot App` });
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-6;
  max-width: 440px;
  margin: 0 auto;
  padding: 64px $space-4;

  > * {
    align-self: stretch;
  }

  img {
    align-self: center;
  }
}
</style>
