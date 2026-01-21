<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const authStore = useAuthStore()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const logout = () => {
  authStore.clearAuth()
  navigateTo('/login')
  isMenuOpen.value = false
}

</script>

<template>
  <header class="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0f111a] flex-shrink-0 z-10 sticky top-0">
    <div class="flex items-center gap-12 w-full max-w-7xl mx-auto">
      <NuxtLink to="/" class="flex items-center w-64">
        <img src="~/assets/img/logo.png" alt="Nexum Logo" class="h-8 w-auto">
      </NuxtLink>

      <div class="flex-1 max-w-xl relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          class="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder="Rechercher une discussion, un collègue..."
        >
      </div>

      <div class="flex items-center justify-end w-64 gap-6">
        <template v-if="user">
            <button class="text-slate-400 hover:text-white relative">
            <div class="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border-2 border-[#0f111a]"></div>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            </button>
            
            <button class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
            Crée post +
            </button>

            <div class="relative">
                <button 
                  @click="toggleMenu"
                  class="flex items-center gap-2 cursor-pointer focus:outline-none p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <img class="h-8 w-8 rounded-full border border-white/10" :src="user.avatar" :alt="user.name">
                    <span class="text-sm font-medium text-white hidden md:block">{{ user.name }}</span>
                    <svg 
                      class="h-4 w-4 text-slate-500 transition-transform duration-200"
                      :class="{'rotate-180': isMenuOpen}" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                <div v-if="isMenuOpen" class="absolute right-0 mt-2 w-48 bg-[#1a1d2d] border border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                    <a href="#" class="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">Paramètres</a>
                    <div class="border-t border-white/5 my-1"></div>
                    <button @click="logout" class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        Se déconnecter
                    </button>
                </div>
            </div>
        </template>
        <template v-else>
             <NuxtLink to="/login" class="text-slate-400 hover:text-white text-sm font-medium">Se connecter</NuxtLink>
             <NuxtLink to="/register" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">S'inscrire</NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>
