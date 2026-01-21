export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Tente de charger depuis le cookie si pas de token en mémoire
  if (!authStore.token) {
    authStore.loadFromCookie()
  }

  if (!authStore.token) {
    return navigateTo('/login')
  }
})