export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const session = useSessionStore();

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (session.token) {
        options.headers.set('Authorization', `Bearer ${session.token}`);
      }
    },
    async onResponseError({ request, response }) {
      const isLogin = String(request).endsWith('/auth/login');
      if (response.status === 401 && !isLogin) {
        session.logout('expired');
        await nuxtApp.runWithContext(() => navigateTo('/sign-in'));
      }
    },
  });

  return { provide: { api } };
});
