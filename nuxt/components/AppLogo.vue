<template>
  <img
    src="/susi-air-logo.png"
    alt="Susi Air"
    :width="width"
    :height="Math.round(width / 3.95)"
    class="logo"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ width?: number }>(), { width: 112 });
</script>

<style scoped lang="scss">
.logo {
  height: auto;
}
</style>
