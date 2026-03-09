<script setup>
const authStore = useAuthStore()
const route = useRoute()
const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 flex flex-col">
    <AppNavbar :user="authStore?.user" />
    <main class="flex-1 flex flex-col overflow-hidden">
      <slot />
    </main>
  </div>
</template>
