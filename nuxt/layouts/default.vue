<template>
  <div class="shell">
    <AppNav />
    <main class="shell__main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore();

// The profile feeds the avatar and the desktop rail on every page.
// A failure here is surfaced by the page that needs the data.
onMounted(() => session.loadProfile().catch(() => {}));
</script>

<style scoped lang="scss">
.shell__main {
  min-height: 100dvh;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));

  @include desktop {
    margin-left: 240px;
    padding-bottom: 0;
  }
}
</style>
