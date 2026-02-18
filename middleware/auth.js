export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Migration: restore from old cookies if persist plugin state is empty
  if (!authStore.token) {
    authStore.loadFromCookie()
  }

  if (!authStore.token) {
    return navigateTo('/login')
  }
})