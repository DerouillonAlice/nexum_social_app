<script setup>
const authStore = useAuthStore()
const route = useRoute()
const { initTheme } = useTheme()

const showCreateButton = computed(() => {
  if (!authStore.user) return false
  return route.path === '/' || route.path.startsWith('/channels/')
})

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#0f111a] text-gray-900 dark:text-slate-100 font-sans flex flex-col">
    <AppNavbar :user="authStore?.user" />
    <main class="flex-1 flex flex-col overflow-hidden">
      <slot />
    </main>


  </div>
</template>
