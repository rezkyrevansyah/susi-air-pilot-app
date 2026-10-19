<template>
  <main class="auth">
    <slot />
  </main>
</template>

<style scoped lang="scss">
.auth {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: $surface;
}
</style>
