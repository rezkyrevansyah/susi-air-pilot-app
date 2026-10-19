<template>
  <div class="home">
    <HomeHeader />

    <div class="home__content">
      <section class="home__section" aria-labelledby="hours-title">
        <SectionHeader
          id="hours-title"
          title="Hours to Limit"
          :meta="
            home.status === 'error'
              ? `Couldn't load`
              : summary
                ? `As of ${formatDate(summary.asOf)}`
                : ''
          "
        />

        <StateMessage
          v-if="home.status === 'error'"
          variant="error"
          title="Can't load your data"
          @retry="home.load()"
        >
          We couldn't reach the Pilot App server. Check your connection, then
          try again.
        </StateMessage>

        <div v-else class="home__cards">
          <template v-if="summary">
            <LimitCard
              v-for="card in summary.cards"
              :key="card.period"
              :card="card"
            />
          </template>
          <template v-else>
            <span
              v-for="n in 4"
              :key="n"
              class="skeleton home__card-skeleton"
            />
          </template>
        </div>
      </section>

      <template v-if="home.status !== 'error'">
        <FlightHoursCard
          v-if="summary"
          :chart="summary.chart"
          :as-of="summary.asOf"
        />
        <span v-else class="skeleton home__chart-skeleton" />

        <section
          class="home__section home__documents"
          aria-labelledby="documents-title"
        >
          <SectionHeader
            id="documents-title"
            title="My Documents"
            :meta="documents ? `${documents.documents.length} documents` : ''"
          />
          <DocumentsList v-if="documents" :documents="documents.documents" />
          <span v-else class="skeleton home__documents-skeleton" />
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Home · Susi Air Pilot App' });

const home = useHomeStore();
const { summary, documents } = storeToRefs(home);

onMounted(() => {
  if (home.status !== 'ready') home.load();
});
</script>

<style scoped lang="scss">
.home__content {
  display: grid;
  gap: 28px;
  padding: $space-6 $space-4 $space-8;

  @include narrow {
    padding-inline: $space-3;
  }

  @include desktop {
    grid-template-columns: minmax(0, 1fr) 400px;
    gap: $space-6;
    padding: 0;

    > :first-child {
      grid-column: 1 / -1;
    }
  }
}

.home {
  @include desktop {
    display: flex;
    flex-direction: column;
    gap: 28px;
    max-width: 1280px;
    padding: $space-8;
  }
}

.home__section {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.home__cards {
  display: grid;
  gap: $space-3;

  @include desktop {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: $space-4;
  }
}

.home__documents {
  @include desktop {
    grid-column: 2;
  }
}

.home__card-skeleton {
  height: 115px;
  border-radius: $radius-card;
}

.home__chart-skeleton {
  height: 409px;
  border-radius: $radius-card;
}

.home__documents-skeleton {
  height: 394px;
  border-radius: $radius-card;
}
</style>
