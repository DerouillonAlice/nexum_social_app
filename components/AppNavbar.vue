<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const { isDark, toggleTheme } = useTheme()

const handleToggle = () => {
  toggleTheme()
}
</script>

<template>
  <header
    class="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0f111a] flex-shrink-0 z-10 sticky top-0">
    <div class="flex items-center gap-12 w-full max-w-7xl mx-auto">
      <NuxtLink to="/" class="flex items-center w-64">
        <img src="~/assets/img/logo.png" alt="Nexum Logo" class="h-8 w-auto">
      </NuxtLink>

      <SearchBar />

      <div class="flex items-center justify-end w-64 gap-6">
        <button @click="handleToggle"
          class="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">
          <svg v-if="isDark" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <template v-if="user">
          <button class="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white relative">
            <div
              class="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-[#0f111a]">
            </div>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <UserMenu :user="user" />
        </template>
        <template v-else>
          <NuxtLink to="/login"
            class="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium">Se
            connecter</NuxtLink>
          <NuxtLink to="/register"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            S'inscrire</NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>
