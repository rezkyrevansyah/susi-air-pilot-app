<template>
  <div>
    <AppTopBar />
    <div class="placeholder-page">
      <PageTitle title="Logbook" />
      <StateMessage variant="placeholder" title="Logbook coming soon">
        This tab is a placeholder destination.
      </StateMessage>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Logbook · Susi Air Pilot App' });
</script>
