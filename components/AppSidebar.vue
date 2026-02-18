<script setup>
const { channels, favoriteChannels, fetchChannels, isFavorite, toggleFavorite } = useChannels()
const route = useRoute()

const isOpen = ref(false)

const closeMenu = () => {
  isOpen.value = false
}

// Close menu when route changes
watch(() => route.path, () => {
  closeMenu()
})

onMounted(async () => {
  await fetchChannels()
})
</script>

<template>
  <!-- Mobile Burger Button -->
  <button @click="isOpen = !isOpen"
    class="md:hidden fixed top-3 left-4 z-50 p-2 text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-[#12141f]/80 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
    <svg v-if="!isOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
    <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>

  <!-- Backdrop for mobile -->
  <div v-if="isOpen" @click="closeMenu"
    class="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>

  <!-- Sidebar Navigation -->
  <nav
    class="fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-[#0f111a] border-r border-gray-100 dark:border-white/5 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-full md:w-64 md:border-r md:flex-shrink-0 flex flex-col shadow-2xl md:shadow-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'">

    <div class="p-6 pt-16 md:pt-6 h-full overflow-y-auto custom-scrollbar">
      <div class="space-y-1">
        <h3 class="px-3 text-xs font-semibold text-gray-400 dark:text-slate-600 uppercase tracking-wider mb-4">Menu
        </h3>

        <NuxtLink to="/"
          class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
          :class="$route.path === '/' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm shadow-blue-100 dark:shadow-none' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-200'">
          <svg class="mr-3 h-5 w-5 transition-colors"
            :class="$route.path === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Fil d'actualité
        </NuxtLink>

        <NuxtLink to="/channels"
          class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
          :class="$route.path === '/channels' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm shadow-blue-100 dark:shadow-none' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-200'">
          <svg class="mr-3 h-5 w-5 transition-colors"
            :class="$route.path === '/channels' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Explorer les espaces
        </NuxtLink>

        <NuxtLink to="/notifications"
          class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
          :class="$route.path === '/notifications' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm shadow-blue-100 dark:shadow-none' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-200'">
          <svg class="mr-3 h-5 w-5 transition-colors"
            :class="$route.path === '/notifications' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notifications
        </NuxtLink>

        <NuxtLink to="/profile"
          class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
          :class="$route.path === '/profile' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm shadow-blue-100 dark:shadow-none' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-200'">
          <svg class="mr-3 h-5 w-5 transition-colors"
            :class="$route.path === '/profile' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Mon profil
        </NuxtLink>
      </div>

      <div class="mt-8">
        <h3
          class="px-3 text-xs font-semibold text-gray-400 dark:text-slate-600 uppercase tracking-wider mb-4 flex items-center justify-between">
          Espaces suivis
          <span v-if="favoriteChannels.length > 0"
            class="bg-gray-100 dark:bg-slate-800 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full">{{
              favoriteChannels.length }}</span>
        </h3>

        <div v-if="favoriteChannels.length === 0"
          class="px-3 py-4 text-sm text-gray-500 dark:text-slate-600 italic bg-gray-50 dark:bg-white/5 rounded-xl text-center">
          <p class="mb-2">Aucun favori</p>
          <NuxtLink to="/channels" class="text-blue-500 hover:text-blue-600 text-xs font-medium">Explorer les espaces
          </NuxtLink>
        </div>

        <div class="space-y-1">
          <NuxtLink v-for="channel in favoriteChannels" :key="channel.id" :to="`/channels/${channel.slug}`"
            class="group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200"
            :class="$route.path === `/channels/${channel.slug}` ? 'bg-white dark:bg-white/5 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-200'">
            <span class="w-2 h-2 rounded-full mr-3 transition-colors"
              :class="$route.path === `/channels/${channel.slug}` ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-700 group-hover:bg-blue-400'"></span>
            <span class="truncate">{{ channel.name }}</span>
          </NuxtLink>

          <NuxtLink to="/channels"
            class="group flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl mt-4 transition-colors">
            <div
              class="mr-3 flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-gray-300 dark:border-slate-700 group-hover:border-blue-400 transition-colors">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Rejoindre un espace
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
