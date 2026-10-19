<template>
  <nav class="nav" aria-label="Main">
    <AppLogo class="nav__logo" :width="140" />

    <ul class="nav__list">
      <li v-for="item in items" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="nav__item"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <component :is="item.icon" class="nav__icon" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>

    <div class="nav__user">
      <PilotAvatar />
      <div>
        <p class="nav__name">{{ profile?.name ?? '' }}</p>
        <p class="nav__role">Pilot</p>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { BookOpen, CalendarDays, Ellipsis, House } from 'lucide-vue-next';

const items = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/logbook', label: 'Logbook', icon: BookOpen },
  { to: '/more', label: 'More', icon: Ellipsis },
];

const route = useRoute();
const { profile } = storeToRefs(useSessionStore());

const isActive = (path: string) =>
  route.path === path || route.path.startsWith(`${path}/`);
</script>

<style scoped lang="scss">
// Mobile: fixed bottom bar. Desktop: left rail with logo and the signed-in pilot.
.nav {
  position: fixed;
  inset: auto 0 0;
  z-index: 10;
  padding: $space-2 $space-2 env(safe-area-inset-bottom);
  background: $surface;
  border-top: 1px solid $border;
  box-shadow: $shadow-nav;

  @include desktop {
    inset: 0 auto 0 0;
    width: 240px;
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding: 28px $space-4 $space-6;
    border-top: 0;
    border-right: 1px solid $border;
    box-shadow: none;
  }
}

.nav__logo,
.nav__user {
  display: none;
}

.nav__list {
  display: flex;
  gap: $space-1;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    flex: 1;
  }

  @include desktop {
    flex-direction: column;
    flex: 1;
  }
}

.nav__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-height: 56px;
  padding: 9px 0 6px;
  border-radius: $radius-field;
  color: $muted;
  @include text(11px, 14px, 600);

  // Red indicator above the active tab.
  &::before {
    content: '';
    position: absolute;
    top: 0;
    width: 28px;
    height: 3px;
    border-radius: 2px;
  }

  &[aria-current='page'] {
    color: $navy;
    font-weight: 800;

    &::before {
      background: $red;
    }
  }

  &:active {
    background: $navy-tint;
  }

  @include desktop {
    flex-direction: row;
    gap: $space-3;
    min-height: 48px;
    padding: 0 14px;
    @include text(14px, 20px, 600);

    &::before {
      display: none;
    }

    &[aria-current='page'] {
      background: $navy-tint;
    }

    &:hover {
      color: $navy;
    }
  }
}

.nav__icon {
  width: 24px;
  height: 24px;

  @include desktop {
    width: 22px;
    height: 22px;
  }
}

@include desktop {
  .nav__logo {
    display: block;
  }

  .nav__user {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-4 $space-2 0;
    border-top: 1px solid $border;
  }
}

.nav__name {
  @include text(14px, 18px, 700);
}

.nav__role {
  color: $muted;
  @include text(12px, 16px, 500);
}
</style>
