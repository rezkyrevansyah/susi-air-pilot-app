<template>
  <div class="date-page">
    <header class="date-page__bar">
      <NuxtLink
        :to="backLink"
        class="date-page__back"
        aria-label="Back to schedule"
      >
        <ChevronLeft aria-hidden="true" />
      </NuxtLink>
      <div class="date-page__title">
        <h1>{{ formatWeekday(date, true) }}</h1>
        <p>Schedule</p>
      </div>
      <span class="date-page__balance" />
    </header>

    <div class="date-page__content">
      <StateMessage variant="placeholder" title="Detail page coming soon">
        This screen is a placeholder.
      </StateMessage>
      <AppButton variant="secondary" :to="backLink">Back to Schedule</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';

// A malformed date in the URL goes back to the calendar instead of a 404.
definePageMeta({
  middleware: (to) =>
    isCalendarDate(to.params.date) ? undefined : navigateTo('/schedule'),
});

const route = useRoute();
const date = computed(() => String(route.params.date));
const backLink = computed(() => ({
  path: '/schedule',
  query: { month: date.value.slice(0, 7) },
}));

useHead({
  title: () => `${formatWeekday(date.value, true)} · Susi Air Pilot App`,
});
</script>

<style scoped lang="scss">
.date-page__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  height: 56px;
  padding: 0 $space-4;
  background: $surface;

  @include desktop {
    max-width: 640px;
    margin: $space-8 $space-8 0;
    padding: 0;
    background: none;
  }
}

.date-page__back,
.date-page__balance {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}

.date-page__back {
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: $navy-tint;

  svg {
    width: 22px;
    height: 22px;
  }
}

.date-page__title {
  text-align: center;

  h1 {
    @include text(16px, 20px, 800);
  }

  p {
    margin-top: 1px;
    color: $muted;
    @include text(12px, 16px, 500);
  }
}

.date-page__content {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-6 $space-4;

  @include desktop {
    max-width: 640px;
    padding: $space-6 $space-8;
  }
}
</style>
