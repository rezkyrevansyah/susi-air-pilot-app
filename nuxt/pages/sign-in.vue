<template>
  <div class="sign-in">
    <div class="sign-in__main">
      <header class="sign-in__brand">
        <AppLogo :width="220" />
        <h1 class="sign-in__title">Pilot App</h1>
        <p class="sign-in__subtitle">
          Sign in to check your flight hours, documents and duties.
        </p>
      </header>

      <form class="sign-in__form" novalidate @submit.prevent="submit">
        <AppAlert
          v-if="formError === 'credentials'"
          tone="error"
          title="Incorrect username or password"
        >
          Check your details and try again.
        </AppAlert>
        <AppAlert
          v-else-if="formError === 'network'"
          tone="network"
          title="Can't reach the server"
        >
          Check your connection and try again.
        </AppAlert>
        <AppAlert
          v-else-if="session.notice === 'expired'"
          tone="error"
          title="Your session has ended"
        >
          Sign in again to continue.
        </AppAlert>

        <AppInput
          ref="usernameInput"
          v-model.trim="username"
          label="Username"
          name="username"
          :icon="User"
          placeholder="Enter your username"
          hint="The username on your crew account"
          autocomplete="username"
          :error="touched && !username ? 'Enter your username' : ''"
          :disabled="loading"
        />
        <AppInput
          ref="passwordInput"
          v-model="password"
          label="Password"
          name="password"
          type="password"
          :icon="Lock"
          placeholder="Enter your password"
          hint="Passwords are case sensitive"
          autocomplete="current-password"
          :error="touched && !password ? 'Enter your password' : ''"
          :disabled="loading"
        />

        <AppButton type="submit" :loading="loading">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </AppButton>
      </form>
    </div>

    <p class="sign-in__footer">Susi Air Pilot App · Internal use only</p>
  </div>
</template>

<script setup lang="ts">
import { Lock, User } from 'lucide-vue-next';

definePageMeta({ layout: 'auth' });
useHead({ title: 'Sign in · Susi Air Pilot App' });

const session = useSessionStore();
const username = ref('');
const password = ref('');
const touched = ref(false);
const loading = ref(false);
const formError = ref<'credentials' | 'network' | null>(null);
const usernameInput = useTemplateRef('usernameInput');
const passwordInput = useTemplateRef('passwordInput');

async function submit() {
  touched.value = true;
  if (!username.value) return usernameInput.value?.focus();
  if (!password.value) return passwordInput.value?.focus();

  loading.value = true;
  formError.value = null;
  try {
    await session.login(username.value, password.value);
    await navigateTo('/home');
  } catch (error) {
    const code = apiError(error)?.code;
    formError.value =
      code === 'INVALID_CREDENTIALS' ? 'credentials' : 'network';
    if (code === 'INVALID_CREDENTIALS') {
      password.value = '';
      touched.value = false;
      await nextTick();
      passwordInput.value?.focus();
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.sign-in {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: $space-8;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 48px $space-6 calc(#{$space-6} + env(safe-area-inset-bottom));

  @include narrow {
    padding-inline: $space-4;
  }

  @include desktop {
    justify-content: center;
  }
}

.sign-in__main {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.sign-in__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;

  img {
    margin-bottom: 14px;
  }
}

.sign-in__title {
  @include text(28px, 34px, 800);
}

.sign-in__subtitle {
  color: $muted;
}

.sign-in__form {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.sign-in__footer {
  color: $muted;
  text-align: center;
  @include text(12px, 16px, 500);
}
</style>
