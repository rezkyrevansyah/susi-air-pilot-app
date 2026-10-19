import type { ScheduleMonth } from '~/types/api';

export const useScheduleStore = defineStore('schedule', () => {
  // Last response per month, keyed "YYYY-MM". Every month change still calls
  // the API; a month seen before is shown straight away while it refreshes.
  const months = ref(new Map<string, ScheduleMonth>());
  const loading = ref<string | null>(null);
  const failed = ref<string | null>(null);

  async function load(key: string) {
    const { year, month } = parseMonth(key)!;
    loading.value = key;
    failed.value = null;
    try {
      const data = await useNuxtApp().$api<ScheduleMonth>('/schedules', {
        query: { year, month: String(month).padStart(2, '0') },
      });
      months.value.set(key, data);
    } catch {
      // Keep showing the last copy if there is one; otherwise show the error.
      if (!months.value.has(key)) failed.value = key;
    } finally {
      if (loading.value === key) loading.value = null;
    }
  }

  return { months, loading, failed, load };
});
