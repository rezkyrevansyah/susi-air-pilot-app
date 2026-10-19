<template>
  <header class="home-header">
    <AppTopBar />
    <div class="home-header__body">
      <div>
        <p class="home-header__greeting">{{ greeting }}</p>
        <h1 class="home-header__name">
          <span v-if="profile">{{ profile.name }}</span>
          <span v-else class="skeleton home-header__name-skeleton" />
        </h1>
      </div>
      <p class="home-header__chip">
        <Clock3 aria-hidden="true" />
        <strong v-if="profile">{{
          formatHours(profile.totalFlightHours)
        }}</strong>
        <span v-else class="skeleton home-header__chip-skeleton" />
        <span>total flight hours</span>
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Clock3 } from 'lucide-vue-next';

const { profile } = storeToRefs(useSessionStore());

// A greeting follows the pilot's own clock, so it is the one place the real
// time is used. Business logic still runs on the fixed reference date.
const hour = new Date().getHours();
const greeting =
  hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
</script>

<style scoped lang="scss">
.home-header {
  padding-bottom: $space-5;
  background: $surface;
  border-radius: 0 0 24px 24px;
  box-shadow: $shadow-card;

  @include desktop {
    padding: 0;
    background: none;
    box-shadow: none;
  }
}

.home-header__body {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-2 $space-4 0;

  @include narrow {
    padding-inline: $space-3;
  }

  @include desktop {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    padding: 0;
  }
}

.home-header__greeting {
  color: $muted;
}

.home-header__name {
  margin-top: 2px;
  @include text(28px, 34px, 800);
}

.home-header__chip {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: $space-2;
  padding: $space-2 14px $space-2 $space-3;
  background: $bg;
  border: 1px solid $border;
  border-radius: $radius-pill;
  color: $muted;
  @include text(13px, 18px, 500);

  svg {
    width: 16px;
    height: 16px;
    color: $navy;
  }

  strong {
    color: $navy;
    @include text(15px, 18px, 800);
  }

  @include desktop {
    align-self: auto;
    padding: 10px $space-4 10px 14px;
    background: $surface;
  }
}

.home-header__name-skeleton {
  display: block;
  width: 160px;
  height: 28px;
  margin-top: 4px;
}

.home-header__chip-skeleton {
  width: 48px;
  height: 14px;
}
</style>
