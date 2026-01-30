<script setup>
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { request } = useAPI()
const { isFavorite, toggleFavorite } = useChannels()

const { data: channels, pending, error, refresh } = await useAsyncData('channels', () =>
  request('/channels'), {
  transform: (data) => {
    return data.member || data['hydra:member'] || []
  }
}
)

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short'
  })
}

const showModal = ref(false)
const isCreating = ref(false)
const errorMessage = ref('')
const newChannel = ref({ name: '', description: '' })

const createChannel = async () => {
  if (!newChannel.value.name.trim()) return

  // Check for duplicates locally
  const normalizedName = newChannel.value.name.toLowerCase().trim()
  const exists = channels.value?.some(c => c.name.toLowerCase().trim() === normalizedName)

  if (exists) {
    errorMessage.value = "Un salon portant ce nom existe déjà."
    return
  }

  errorMessage.value = ''
  isCreating.value = true
  try {
    await request('/channels', {
      method: 'POST',
      body: {
        name: newChannel.value.name,
        description: newChannel.value.description
      }
    })
    showModal.value = false
    newChannel.value = { name: '', description: '' }
    refresh()
  } catch (e) {
    console.error(e)
    errorMessage.value = "Une erreur est survenue lors de la création."
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <div class="h-full flex flex-1 overflow-hidden">
    <AppSidebar />

    <div class="flex-1 overflow-y-auto bg-slate-950 p-6">
      <div class="max-w-5xl mx-auto">
        <div class="flex justify-between items-end mb-6">
          <h2 class="text-2xl font-bold text-white">Salons disponibles</h2>
          <div class="flex items-center gap-4">
            <button @click="refresh" class="text-sm text-blue-400 hover:underline cursor-pointer">
              Actualiser
            </button>
            <button @click="showModal = true"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-blue-500/20">
              + Nouveau salon
            </button>
          </div>
        </div>

        <div v-if="pending" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>

        <div v-else-if="error" class="bg-red-950/30 border border-red-900 text-red-200 p-4 rounded-xl text-center">
          <p>Impossible de charger les salons.</p>
          <p class="text-sm opacity-75 mt-1">{{ error.statusCode }} - {{ error.message }}</p>
        </div>

        <div v-else-if="!channels || channels.length === 0"
          class="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
          <p class="text-slate-500">Aucun salon n'a été créé pour le moment.</p>
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="channel in channels" :key="channel.id"
            class="group bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition duration-200 flex flex-col h-full">
            <div class="flex justify-between items-start mb-3">
              <span class="text-2xl">💬</span>
              <span
                class="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full group-hover:bg-slate-700 transition">
                {{ formatDate(channel.createdAt) }}
              </span>
            </div>

            <h3 class="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition">
              {{ channel.name }}
            </h3>

            <p class="text-sm text-slate-400 line-clamp-2 mb-4 flex-grow">
              {{ channel.description || "Pas de description" }}
            </p>

            <div class="flex items-center gap-2 mt-4">
              <button @click="toggleFavorite(channel)" class="p-2 rounded-lg transition"
                :class="isFavorite(channel.id) ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'"
                :title="isFavorite(channel.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'">
                <svg class="w-5 h-5" :fill="isFavorite(channel.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              <NuxtLink :to="`/channels/${channel.slug}`"
                class="flex-1 text-center py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition">
                Voir
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="showModal = false">
      <div class="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button class="absolute top-4 right-4 text-slate-500 hover:text-white" @click="showModal = false">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-xl font-bold text-white mb-6">Créer un nouveau salon</h3>

        <form @submit.prevent="createChannel" class="space-y-4">
          <div v-if="errorMessage" class="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
            {{ errorMessage }}
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Nom du salon</label>
            <input v-model="newChannel.name" type="text"
              class="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="ex: Général" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Description</label>
            <textarea v-model="newChannel.description" rows="3"
              class="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="De quoi parle ce salon ?"></textarea>
          </div>

          <div class="flex justify-end pt-2">
            <button type="button" @click="showModal = false"
              class="px-4 py-2 text-slate-400 hover:text-white mr-2">Annuler</button>
            <button type="submit" :disabled="isCreating"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2">
              <span v-if="isCreating"
                class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
              Créer le salon
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
