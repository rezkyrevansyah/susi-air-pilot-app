<template>
  <img
    v-if="profile"
    :src="profile.avatarUrl"
    :alt="profile.name"
    :width="size"
    :height="size"
    class="avatar"
  />
  <span
    v-else
    class="avatar"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 36 });

const { profile } = storeToRefs(useSessionStore());
</script>

<style scoped lang="scss">
.avatar {
  display: block;
  flex-shrink: 0;
  border-radius: 50%;
  background: $navy;
}
</style>
