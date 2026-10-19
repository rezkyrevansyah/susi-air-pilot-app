<template>
  <div>
    <AppTopBar />
    <div class="placeholder-page">
      <PageTitle title="More" />
      <StateMessage variant="placeholder" title="More coming soon">
        This tab is a placeholder destination.
      </StateMessage>
      <AppButton variant="secondary" :icon="LogOut" @click="signOut">
        Sign out
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LogOut } from 'lucide-vue-next';

useHead({ title: 'More · Susi Air Pilot App' });

function signOut() {
  useSessionStore().logout();
  navigateTo('/sign-in');
}
</script>
