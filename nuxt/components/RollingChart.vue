<template>
  <div
    ref="wrapper"
    class="chart"
    role="group"
    tabindex="0"
    :aria-label="`Rolling ${chart.windowDays}-day flight hours, ${formatDayMonth(points[0]!.date)} to ${formatDayMonth(points.at(-1)!.date)}. Use the arrow keys to read each day.`"
    @keydown.left.prevent="select(selected - 1)"
    @keydown.right.prevent="select(selected + 1)"
  >
    <svg
      :width="width"
      :height="HEIGHT"
      :viewBox="`0 0 ${width} ${HEIGHT}`"
      aria-hidden="true"
      @click="pick"
      @pointermove="$event.pointerType === 'mouse' && pick($event)"
    >
      <rect
        :x="LEFT"
        :y="TOP"
        :width="width - LEFT"
        :height="Math.max(0, y(chart.limit) - TOP)"
        class="chart__band"
      />

      <template v-for="tick in ticks" :key="`${tick.value}-${tick.isLimit}`">
        <line
          v-if="!tick.isLimit"
          :x1="LEFT"
          :x2="width"
          :y1="y(tick.value)"
          :y2="y(tick.value)"
          :class="tick.value === 0 ? 'chart__baseline' : 'chart__grid'"
        />
        <text
          v-if="tick.label"
          :x="LEFT - 6"
          :y="y(tick.value) + 4"
          text-anchor="end"
          :class="tick.isLimit ? 'chart__limit-label' : 'chart__axis'"
        >
          {{ tick.label }}
        </text>
      </template>

      <rect
        :x="LEFT"
        :y="y(chart.limit) - 1"
        :width="width - LEFT"
        height="2"
        class="chart__limit"
      />
      <line
        :x1="x(todayIndex)"
        :x2="x(todayIndex)"
        :y1="TOP"
        :y2="BOTTOM"
        class="chart__today"
      />

      <polyline :points="linePoints" class="chart__line" />

      <g v-for="(point, index) in points" :key="point.date">
        <template v-if="index === selected">
          <circle
            :cx="x(index)"
            :cy="y(point.rollingHours)"
            r="12"
            :class="point.isOverLimit ? 'chart__halo--over' : 'chart__halo'"
          />
          <circle
            :cx="x(index)"
            :cy="y(point.rollingHours)"
            r="4.5"
            :class="
              point.isOverLimit
                ? 'chart__dot--over-selected'
                : 'chart__dot--selected'
            "
          />
        </template>
        <circle
          v-else
          :cx="x(index)"
          :cy="y(point.rollingHours)"
          :r="point.isOverLimit ? 4.75 : 3.75"
          :class="point.isOverLimit ? 'chart__dot--over' : 'chart__dot'"
        />
      </g>

      <template v-for="index in X_LABEL_INDEXES" :key="index">
        <g v-if="index === todayIndex">
          <rect
            :x="x(index) - 27"
            :y="BOTTOM + 8"
            width="54"
            height="22"
            rx="11"
            class="chart__pill"
          />
          <text
            :x="x(index)"
            :y="BOTTOM + 23"
            text-anchor="middle"
            class="chart__pill-text"
          >
            Today
          </text>
        </g>
        <text
          v-else
          :x="x(index)"
          :y="BOTTOM + 23"
          text-anchor="middle"
          class="chart__axis"
        >
          {{ formatDayMonth(points[index]!.date) }}
        </text>
      </template>
    </svg>

    <div class="chart__tooltip" :style="tooltipStyle" aria-live="polite">
      <p class="chart__tooltip-date">{{ formatWeekday(current.date) }}</p>
      <p class="chart__tooltip-value">
        {{ formatHours(current.rollingHours) }} h
      </p>
      <p v-if="current.isOverLimit" class="chart__tooltip-note">
        {{ formatHours(current.rollingHours - chart.limit) }} h over limit
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FlightSummary } from '~/types/api';

const props = defineProps<{ chart: FlightSummary['chart']; asOf: string }>();

// Plot geometry in pixels, taken from the design: a 36 px gutter for the
// Y labels, 10 px inset at both ends of the line, labels under the plot.
const HEIGHT = 208;
const LEFT = 36;
const INSET = 10;
const TOP = 8;
const BOTTOM = 176;

const wrapper = useTemplateRef<HTMLElement>('wrapper');
const width = ref(326);
let observer: ResizeObserver | undefined;
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (entry) width.value = Math.round(entry.contentRect.width);
  });
  if (wrapper.value) observer.observe(wrapper.value);
});
onBeforeUnmount(() => observer?.disconnect());

const points = computed(() => props.chart.points);
const ticks = computed(() => yTicks(props.chart.yMax, props.chart.limit));
const todayIndex = computed(() =>
  Math.max(
    0,
    points.value.findIndex((p) => p.date === props.asOf),
  ),
);

const x = (index: number) =>
  LEFT +
  INSET +
  (index * (width.value - LEFT - INSET * 2)) / (points.value.length - 1);
// Values above the chart maximum are still drawn; the SVG does not clip them.
const y = (hours: number) =>
  BOTTOM - (hours / props.chart.yMax) * (BOTTOM - TOP);

const linePoints = computed(() =>
  points.value.map((p, i) => `${x(i)},${y(p.rollingHours)}`).join(' '),
);

const selected = ref(todayIndex.value);
const current = computed(() => points.value[selected.value]!);

function select(index: number) {
  selected.value = Math.min(points.value.length - 1, Math.max(0, index));
}

function pick(event: MouseEvent) {
  const box = (event.currentTarget as SVGElement).getBoundingClientRect();
  const step = (width.value - LEFT - INSET * 2) / (points.value.length - 1);
  select(Math.round((event.clientX - box.left - LEFT - INSET) / step));
}

// As in the design the tooltip sits to the left of the point, so the line
// ahead stays visible. Early points flip it to the right, and it drops below
// the point when there is no room above.
const tooltipStyle = computed(() => {
  const px = x(selected.value);
  const py = y(current.value.rollingHours);
  const shift = selected.value <= 3 ? '-12px' : 'calc(-100% + 12px)';
  const above = py - 60 >= 0;
  return {
    left: `${px}px`,
    top: above ? `${py - 12}px` : `${py + 16}px`,
    transform: `translate(${shift}, ${above ? '-100%' : '0'})`,
  };
});
</script>

<style scoped lang="scss">
.chart {
  position: relative;
  border-radius: $radius-field;

  svg {
    overflow: visible;
    cursor: pointer;
    touch-action: pan-y;
  }
}

.chart__band {
  fill: rgba($danger, 0.1);
}

.chart__grid {
  stroke: $border;
}

.chart__baseline {
  stroke: $border-strong;
}

.chart__axis,
.chart__limit-label,
.chart__pill-text {
  font-size: 11px;
  font-weight: 600;
  fill: $muted;
}

.chart__limit-label {
  font-weight: 800;
  fill: $danger-ink;
}

.chart__limit {
  fill: $danger;
}

.chart__today {
  stroke: rgba($navy, 0.25);
  stroke-width: 1.5;
}

.chart__line {
  fill: none;
  stroke: $chart;
  stroke-width: 3;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.chart__dot {
  fill: #fff;
  stroke: $chart;
  stroke-width: 2.5;
}

.chart__dot--over {
  fill: $danger;
  stroke: #fff;
  stroke-width: 1.5;
}

.chart__halo {
  fill: rgba($chart, 0.2);
}

.chart__halo--over {
  fill: rgba($danger, 0.2);
}

.chart__dot--selected {
  fill: #fff;
  stroke: $chart;
  stroke-width: 3;
}

.chart__dot--over-selected {
  fill: $danger;
  stroke: #fff;
  stroke-width: 2;
}

.chart__pill {
  fill: $navy;
}

.chart__pill-text {
  font-weight: 800;
  fill: #fff;
}

.chart__tooltip {
  position: absolute;
  min-width: 90px;
  padding: 7px 10px;
  border-radius: 10px;
  background: $navy;
  box-shadow: $shadow-pop;
  pointer-events: none;
  white-space: nowrap;
}

.chart__tooltip-date {
  color: #c9d3e0;
  @include text(11px, 14px, 600);
}

.chart__tooltip-value {
  color: #fff;
  @include text(15px, 20px, 800);
}

.chart__tooltip-note {
  color: #ffb4c2;
  @include text(11px, 14px, 700);
}
</style>
