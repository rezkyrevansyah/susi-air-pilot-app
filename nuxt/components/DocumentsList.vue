<template>
  <ul class="documents">
    <li v-for="doc in documents" :key="doc.id" class="document">
      <div class="document__line">
        <h3 class="document__name">{{ doc.label }}</h3>
        <span class="badge" :class="`badge--${doc.status}`">
          <component :is="badges[doc.status].icon" aria-hidden="true" />
          {{ badges[doc.status].label }}
        </span>
      </div>
      <p class="document__meta">
        <Calendar aria-hidden="true" />
        <time :datetime="doc.expiryDate">{{ formatDate(doc.expiryDate) }}</time>
        <span :class="`document__relative--${doc.status}`">
          · {{ formatDaysRemaining(doc.daysRemaining) }}
        </span>
      </p>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { Calendar, CircleCheck, CircleX, TriangleAlert } from 'lucide-vue-next';
import type { PilotDocument } from '~/types/api';

defineProps<{ documents: PilotDocument[] }>();

// The status itself comes from the API; this only maps it to the badge.
const badges = {
  safe: { label: 'Safe', icon: CircleCheck },
  soon: { label: 'Expiring Soon', icon: TriangleAlert },
  expired: { label: 'Expired', icon: CircleX },
};
</script>

<style scoped lang="scss">
.documents {
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: hidden;
  @include card;
}

.document {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px $space-4;

  & + & {
    border-top: 1px solid $border;
    margin-inline: $space-4;
    padding-inline: 0;
  }
}

.document__line {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.document__name {
  flex: 1;
  @include text(14px, 20px, 700);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  height: 28px;
  padding: 0 9px;
  border-radius: $radius-pill;
  @include text(12px, 16px, 800);

  svg {
    width: 14px;
    height: 14px;
  }
}

.badge--safe {
  background: $success-bg;
  color: $success-ink;
}

.badge--soon {
  background: $warning-bg;
  color: $warning-ink;
}

.badge--expired {
  background: $danger-bg;
  color: $danger-ink;
}

.document__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $muted;
  @include text(12px, 16px, 500);

  svg {
    width: 14px;
    height: 14px;
  }

  time {
    color: $navy;
    @include text(13px, 16px, 700);
  }
}

.document__relative--soon {
  color: $warning-ink;
}

.document__relative--expired {
  color: $danger-ink;
}
</style>
