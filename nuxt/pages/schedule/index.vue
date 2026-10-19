<template>
  <div class="schedule">
    <AppTopBar />

    <div class="schedule__content">
      <PageTitle
        title="Schedule"
        :subtitle="
          data && !data.schedules.length
            ? 'No entries returned for this month'
            : 'Tap a day to open its details'
        "
        class="schedule__title"
      />

      <StateMessage
        v-if="schedule.failed === month"
        variant="error"
        title="Can't load this month"
        class="schedule__main"
        @retry="schedule.load(month)"
      >
        We couldn't reach the Pilot App server. Check your connection, then try
        again.
      </StateMessage>
      <ScheduleCalendar
        v-else
        :month="month"
        :data="data"
        :legend="legend"
        :loading="!data"
        :highlight="upcoming?.duty_date"
        class="schedule__main"
      />

      <NextDutyCard
        v-if="upcoming"
        :entry="upcoming"
        :label="
          legend.find((item) => item.code === upcoming!.duty_type)?.label ??
          upcoming.duty_type
        "
        class="schedule__side"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Schedule · Susi Air Pilot App' });

const route = useRoute();
const schedule = useScheduleStore();

// The month lives in the URL so the date page can link back to it.
const month = computed(() =>
  parseMonth(route.query.month)
    ? String(route.query.month)
    : BUSINESS_TODAY.slice(0, 7),
);
const data = computed(() => schedule.months.get(month.value));

// The legend is the same for every month; keep showing the last one while
// another month loads.
const legend = computed(
  () =>
    data.value?.legend ?? [...schedule.months.values()].at(-1)?.legend ?? [],
);
const upcoming = computed(() =>
  data.value ? nextDuty(data.value.schedules) : undefined,
);

watch(month, (key) => schedule.load(key), { immediate: true });
</script>

<style scoped lang="scss">
.schedule__content {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-5 $space-4 $space-8;

  @include narrow {
    padding-inline: $space-3;
  }

  @include desktop {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
    gap: $space-6;
    max-width: 1280px;
    padding: $space-8;
  }
}

.schedule__title {
  @include desktop {
    grid-column: 1 / -1;
  }
}
</style>
