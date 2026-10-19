import type { ScheduleMonth } from '~/types/api';

export const useScheduleStore = defineStore('schedule', () => {
  // Months already fetched, keyed "YYYY-MM". The data is read-only for the
  // session, so going back and forth between months never refetches.
  const months = ref(new Map<string, ScheduleMonth>());
  const loading = ref<string | null>(null);
  const failed = ref<string | null>(null);

  async function load(key: string) {
    if (months.value.has(key)) return;
    const { year, month } = parseMonth(key)!;
    loading.value = key;
    failed.value = null;
    try {
      const data = await useNuxtApp().$api<ScheduleMonth>('/schedules', {
        query: { year, month: String(month).padStart(2, '0') },
      });
      months.value.set(key, data);
    } catch {
      failed.value = key;
    } finally {
      if (loading.value === key) loading.value = null;
    }
  }

  return { months, loading, failed, load };
});
