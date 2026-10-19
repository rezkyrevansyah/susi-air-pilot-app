export default defineNuxtRouteMiddleware((to) => {
  const session = useSessionStore();
  const isSignIn = to.path === '/sign-in';

  if (!session.isAuthenticated && !isSignIn) {
    if (session.token) session.logout('expired');
    return navigateTo('/sign-in');
  }
  if (session.isAuthenticated && isSignIn) {
    return navigateTo('/home');
  }
});
