import type { LoginResponse, PilotProfile } from '~/types/api';

const STORAGE_KEY = 'susi-air.session';

interface StoredSession {
  token: string;
  expiresAt: number;
}

function readStored(): StoredSession | null {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return stored?.token && stored.expiresAt > Date.now() ? stored : null;
  } catch {
    return null;
  }
}

export const useSessionStore = defineStore('session', () => {
  const stored = readStored();
  const token = ref(stored?.token ?? '');
  const expiresAt = ref(stored?.expiresAt ?? 0);
  const profile = ref<PilotProfile | null>(null);
  // Shown on the sign-in page after a forced logout.
  const notice = ref<'expired' | null>(null);

  // Token expiry is real elapsed time, unlike the fixed business date.
  const isAuthenticated = computed(
    () => Boolean(token.value) && expiresAt.value > Date.now(),
  );

  async function login(username: string, password: string) {
    const response = await useNuxtApp().$api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    token.value = response.accessToken;
    expiresAt.value = Date.now() + response.expiresIn * 1000;
    notice.value = null;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: token.value, expiresAt: expiresAt.value }),
    );
  }

  function logout(reason: 'expired' | null = null) {
    token.value = '';
    expiresAt.value = 0;
    profile.value = null;
    notice.value = reason;
    localStorage.removeItem(STORAGE_KEY);
  }

  async function loadProfile() {
    profile.value ??= await useNuxtApp().$api<PilotProfile>('/pilot/me');
    return profile.value;
  }

  return {
    token,
    profile,
    notice,
    isAuthenticated,
    login,
    logout,
    loadProfile,
  };
});
