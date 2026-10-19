<template>
  <div class="top-bar">
    <AppLogo />
    <PilotAvatar />
  </div>
</template>

<style scoped lang="scss">
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 $space-4;
  background: $surface;

  @include desktop {
    display: none;
  }
}
</style>
