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
  <header class="h-14 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-[#0a0a0c] border-b border-gray-200/60 dark:border-zinc-800/60 flex-shrink-0 z-30 sticky top-0">

    <div class="flex items-center gap-4 sm:gap-8 w-full justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 group shrink-0">
        <img src="~/assets/img/logo.png" alt="Nexum" class="h-7 w-auto transition-transform duration-300 group-hover:scale-105">
        <span class="text-lg font-bold tracking-tight hidden sm:inline text-gray-900 dark:text-zinc-100">NEXUM</span>
      </NuxtLink>

      <!-- Search -->
      <div v-if="user" class="flex-1 max-w-lg mx-4">
        <SearchBar />
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-2">
        <button @click="handleToggle"
          :class="user ? 'hidden md:flex' : 'flex'"
          class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          title="Thème">
          <svg v-if="isDark" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <template v-if="user">
          <UserMenu :user="user" />
        </template>
        <template v-else>
          <div class="hidden md:flex items-center gap-2">
            <NuxtLink to="/login" class="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all">
              Connexion
            </NuxtLink>
            <NuxtLink to="/register" class="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:-translate-y-0.5 active:translate-y-0">
              S'inscrire
            </NuxtLink>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>
