<script setup>
const authStore = useAuthStore()
const route = useRoute()

const showCreateButton = computed(() => {
  if (!authStore.user) return false
  return route.path === '/' || route.path.startsWith('/channels/')
})
</script>

<template>
  <div class="min-h-screen bg-[#0f111a] text-slate-100 font-sans flex flex-col">
    <AppNavbar :user="authStore.user" />
    <main class="flex-1 flex flex-col overflow-hidden">
        <slot />
    </main>

    <button
      v-if="showCreateButton"
      class="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-4 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 z-50 flex items-center justify-center cursor-pointer"
      title="Créer un post"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>
