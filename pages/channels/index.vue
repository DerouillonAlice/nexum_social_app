<script setup>
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { request, logout } = useAPI()

const { data: channels, pending, error, refresh } = await useAsyncData('channels', () => 
  request('/channels'), {
    transform: (data) => {
        return data.member || data['hydra:member'] || []    }
  }
)

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short'
  })
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200">
    <nav class="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 class="text-xl font-bold text-blue-500">Nexum</h1>
        
        <div class="flex items-center gap-4">
          <div v-if="authStore.user" class="hidden sm:block text-right">
            <p class="text-sm font-medium text-white">{{ authStore.user.displayName }}</p>
            <p class="text-xs text-slate-500">{{ authStore.user.email }}</p>
          </div>
          <button 
            @click="logout" 
            class="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-400 transition"
            title="Se déconnecter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-5xl mx-auto p-6">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-bold text-white">Salons disponibles</h2>
        <button @click="refresh" class="text-sm text-blue-400 hover:underline cursor-pointer">
          Actualiser
        </button>
      </div>

      <div v-if="pending" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="error" class="bg-red-950/30 border border-red-900 text-red-200 p-4 rounded-xl text-center">
        <p>Impossible de charger les salons.</p>
        <p class="text-sm opacity-75 mt-1">{{ error.statusCode }} - {{ error.message }}</p>
      </div>

      <div v-else-if="!channels || channels.length === 0" class="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
        <p class="text-slate-500">Aucun salon n'a été créé pour le moment.</p>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <NuxtLink 
  v-for="channel in channels" 
  :key="channel.id"
  :to="`/channels/${channel.slug}`" 
  class="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 p-5 rounded-xl transition duration-200 flex flex-col h-full"
        >
          <div class="flex justify-between items-start mb-3">
            <span class="text-2xl">💬</span>
            <span class="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full group-hover:bg-slate-700 transition">
              {{ formatDate(channel.createdAt) }}
            </span>
          </div>
          
          <h3 class="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition">
            {{ channel.name }}
          </h3>
          
          <p class="text-sm text-slate-400 line-clamp-2 mb-4 flex-grow">
            {{ channel.description || "Pas de description" }}
          </p>

          <div class="flex items-center text-sm text-blue-500 font-medium">
            Rejoindre
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>