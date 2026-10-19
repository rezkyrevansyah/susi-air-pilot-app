import type { ChartRange, DocumentsResponse, FlightSummary } from '~/types/api';

export const useHomeStore = defineStore('home', () => {
  const range = ref<ChartRange>('1w');
  const summary = ref<FlightSummary | null>(null);
  const documents = ref<DocumentsResponse | null>(null);
  const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const chartLoading = ref(false);
  const chartError = ref(false);
  let latestRangeRequest = 0;

  const api = () => useNuxtApp().$api;
  const fetchSummary = (r: ChartRange) =>
    api()<FlightSummary>('/flight-hours/summary', { query: { range: r } });

  async function load() {
    status.value = 'loading';
    try {
      const [nextSummary, nextDocuments] = await Promise.all([
        fetchSummary(range.value),
        api()<DocumentsResponse>('/documents'),
        useSessionStore().loadProfile(),
      ]);
      summary.value = nextSummary;
      documents.value = nextDocuments;
      status.value = 'ready';
    } catch {
      status.value = 'error';
    }
  }

  // Only the chart depends on the range. The current chart stays on screen
  // while the next one loads, and a slow older response never wins.
  async function setRange(next: ChartRange) {
    if (next === range.value && !chartError.value) return;
    const request = ++latestRangeRequest;
    const previous = range.value;
    range.value = next;
    chartLoading.value = true;
    chartError.value = false;
    try {
      const nextSummary = await fetchSummary(next);
      if (request === latestRangeRequest) summary.value = nextSummary;
    } catch {
      if (request === latestRangeRequest) {
        range.value = previous;
        chartError.value = true;
      }
    } finally {
      if (request === latestRangeRequest) chartLoading.value = false;
    }
  }

  return {
    range,
    summary,
    documents,
    status,
    chartLoading,
    chartError,
    load,
    setRange,
  };
});
