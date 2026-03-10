<script setup>
const { channels, fetchChannels } = useChannels()
const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const isOpen = ref(false)
const isHovered = ref(false)

const closeMenu = () => {
  isOpen.value = false
}

watch(() => route.path, () => {
  closeMenu()
})

onMounted(async () => {
  await fetchChannels()
})
</script>

<template>
  <!-- Mobile Burger -->
  <button @click="isOpen = !isOpen"
    :aria-expanded="isOpen"
    aria-controls="main-sidebar"
    aria-label="Ouvrir le menu de navigation"
    class="md:hidden fixed top-2.5 left-3 z-50 p-2 text-gray-600 dark:text-zinc-400 bg-white/90 dark:bg-zinc-900/90 backdrop-blur rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500/50 focus:outline-none">
    <svg v-if="!isOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>

  <!-- Backdrop -->
  <div v-if="isOpen" @click="closeMenu" class="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" aria-hidden="true"></div>

  <!-- Sidebar -->
  <nav id="main-sidebar" aria-label="Navigation latérale"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    class="fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#0a0a0c] border-r border-gray-200/60 dark:border-zinc-800/60 transform transition-all duration-300 ease-out md:translate-x-0 md:static md:h-full md:flex-shrink-0 flex flex-col py-4 gap-1 overflow-hidden"
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full',
      isHovered || isOpen ? 'w-52' : 'w-[4.5rem]'
    ]">

    <!-- Navigation links -->
    <div class="flex flex-col gap-1 w-full px-2 mt-8 md:mt-0">
      <NuxtLink to="/" class="flex items-center h-11 rounded-xl transition-all duration-200 whitespace-nowrap"
        :class="[
          $route.path === '/' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' : 'text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-300',
          isHovered || isOpen ? 'px-3 gap-3' : 'px-0 justify-center'
        ]"
        title="Fil d'actualité"
        aria-label="Fil d'actualité">
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <span v-if="isHovered || isOpen" class="text-sm font-medium">Fil d'actualité</span>
      </NuxtLink>

      <NuxtLink to="/channels" class="flex items-center h-11 rounded-xl transition-all duration-200 whitespace-nowrap"
        :class="[
          $route.path.startsWith('/channels') ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' : 'text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-300',
          isHovered || isOpen ? 'px-3 gap-3' : 'px-0 justify-center'
        ]"
        title="Explorer les espaces"
        aria-label="Explorer les espaces">
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
        <span v-if="isHovered || isOpen" class="text-sm font-medium">Explorer</span>
      </NuxtLink>

      <NuxtLink to="/profile" class="flex items-center h-11 rounded-xl transition-all duration-200 whitespace-nowrap"
        :class="[
          $route.path.startsWith('/profile') ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' : 'text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-300',
          isHovered || isOpen ? 'px-3 gap-3' : 'px-0 justify-center'
        ]"
        title="Mon profil"
        aria-label="Mon profil">
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span v-if="isHovered || isOpen" class="text-sm font-medium">Mon profil</span>
      </NuxtLink>
    </div>

    <!-- Separator -->
    <div class="mx-2 h-px bg-gray-200 dark:bg-zinc-800 my-2"></div>

    <!-- Label "Espaces" -->
    <div v-if="isHovered || isOpen" class="px-5 mb-1 overflow-hidden whitespace-nowrap">
      <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600">Espaces</span>
    </div>

    <!-- All channels -->
    <div class="flex flex-col gap-1 w-full px-2 flex-1 overflow-y-auto custom-scrollbar">
      <NuxtLink v-for="channel in channels" :key="channel.id" :to="`/channels/${channel.slug}`"
        class="flex items-center h-11 rounded-xl transition-all duration-200 whitespace-nowrap"
        :class="[
          $route.path === `/channels/${channel.slug}` ? 'bg-gray-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-800 dark:hover:text-zinc-200',
          isHovered || isOpen ? 'px-3 gap-3' : 'px-0 justify-center'
        ]"
        :title="channel.name"
        :aria-label="`Espace ${channel.name}`">
        <span class="w-5 h-5 shrink-0 flex items-center justify-center rounded-md text-[11px] font-bold"
          :class="$route.path === `/channels/${channel.slug}` ? 'bg-white/20 dark:bg-zinc-900/20' : 'bg-gray-200 dark:bg-zinc-700'">
          {{ channel.name.charAt(0).toUpperCase() }}
        </span>
        <span v-if="isHovered || isOpen" class="text-sm font-medium truncate">{{ channel.name }}</span>
      </NuxtLink>

      <NuxtLink to="/channels#create" class="flex items-center h-11 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 text-gray-400 dark:text-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all duration-200 whitespace-nowrap"
        :class="isHovered || isOpen ? 'px-3 gap-3' : 'px-0 justify-center'"
        title="Créer un espace" aria-label="Créer un espace">
        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span v-if="isHovered || isOpen" class="text-sm font-medium">Créer un espace</span>
      </NuxtLink>
    </div>

    <!-- Bottom: theme toggle (mobile) -->
    <button @click="toggleTheme" class="md:hidden flex items-center h-11 mx-2 rounded-xl text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus:ring-2 focus:ring-zinc-500/50 focus:outline-none whitespace-nowrap"
      :class="isHovered || isOpen ? 'px-3 gap-3' : 'px-0 justify-center'"
      title="Thème" :aria-label="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'">
      <svg v-if="isDark" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg v-else class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      <span v-if="isHovered || isOpen" class="text-sm font-medium">Thème</span>
    </button>
  </nav>
</template>
