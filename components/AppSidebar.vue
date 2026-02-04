<script setup>
const { channels, favoriteChannels, fetchChannels, isFavorite, toggleFavorite } = useChannels()

onMounted(async () => {
  await fetchChannels()
})
</script>

<template>
  <nav
    class="w-64 p-6 overflow-y-auto hidden md:block border-r border-gray-200 dark:border-white/5 bg-white dark:bg-[#0f111a]"
    style="height: 100%;">
    <div class="space-y-1">
      <h3 class="px-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-4">Menu</h3>

      <NuxtLink to="/" class="group flex items-center px-3 py-2 text-sm font-medium rounded-md"
        exact-active-class="bg-blue-500/10 text-blue-400">
        <svg class="mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        Fil d'actualité
      </NuxtLink>

      <NuxtLink to="/channels"
        class="group flex items-center px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-md"
        active-class="bg-blue-500/10 !text-blue-400">
        <svg class="mr-3 h-5 w-5 group-hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Espaces
      </NuxtLink>


      <a href="#"
        class="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-md">
        <svg
          class="mr-3 h-5 w-5 text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Notifications
      </a>

      <NuxtLink to="/profile"
        class="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-md"
        active-class="bg-blue-500/10 !text-blue-400">
        <svg
          class="mr-3 h-5 w-5 text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Mon profil
      </NuxtLink>


    </div>

    <div class="mt-8">
      <h3 class="px-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-4">Espaces
        suivis</h3>
      <div v-if="favoriteChannels.length === 0" class="px-3 text-sm text-gray-500 dark:text-slate-600 italic">
        Aucun espace suivi.
      </div>
      <div class="space-y-1">
        <NuxtLink v-for="channel in favoriteChannels" :key="channel.id" :to="`/channels/${channel.slug}`"
          class="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-md"
          active-class="bg-blue-500/10 !text-blue-400">
          <span class="w-2 h-2 rounded-full bg-yellow-500 mr-4"></span>
          {{ channel.name }}
        </NuxtLink>

        <NuxtLink to="/channels"
          class="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-md mt-4">
          <svg
            class="mr-3 h-5 w-5 text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Rejoindre un espace
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
