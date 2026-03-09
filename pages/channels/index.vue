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
  <div class="h-full flex flex-1 overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
    <AppSidebar />

    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-end mb-10">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Salons disponibles</h2>
            <p class="text-gray-500 dark:text-zinc-500">Rejoignez des conversations ou créez votre propre espace.</p>
          </div>
          <div class="flex items-center gap-4">
            <button @click="refresh"
              class="p-2.5 text-gray-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all duration-200"
              title="Actualiser">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button @click="showModal = true"
              class="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-sm transition hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center gap-2 transform active:scale-95">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nouveau salon
            </button>
          </div>
        </div>

        <div v-if="pending" class="flex justify-center py-20">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
            <span class="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
            <span class="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"></span>
          </div>
        </div>

        <div v-else-if="error"
          class="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 p-6 rounded-2xl text-center">
          <p class="font-medium">Impossible de charger les salons.</p>
          <p class="text-sm opacity-75 mt-1">{{ error.statusCode }} - {{ error.message }}</p>
        </div>

        <div v-else-if="!channels || channels.length === 0"
          class="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
          <div
            class="w-16 h-16 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1">C'est un peu vide ici</h3>
          <p class="text-gray-500 dark:text-zinc-500 mb-6">Aucun salon n'a été créé pour le moment.</p>
          <button @click="showModal = true" class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium">Créer le premier
            salon</button>
        </div>

        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div v-for="channel in channels" :key="channel.id"
            class="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/5 flex flex-col h-full relative overflow-hidden">

            <div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click.stop="toggleFavorite(channel)" class="p-2 rounded-xl transition backdrop-blur-sm"
                :class="isFavorite(channel.id) ? 'bg-yellow-50 text-yellow-400 dark:bg-yellow-500/10' : 'bg-gray-100/50 hover:bg-gray-100 text-gray-400 hover:text-yellow-400 dark:bg-zinc-800/50 dark:hover:bg-zinc-800'"
                :title="isFavorite(channel.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'">
                <svg class="w-5 h-5" :fill="isFavorite(channel.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>

            <div
              class="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xl font-bold mb-4">
              {{ channel.name.charAt(0).toUpperCase() }}
            </div>

            <h3
              class="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              {{ channel.name }}
            </h3>

            <p class="text-sm text-gray-500 dark:text-zinc-500 line-clamp-2 mb-6 flex-grow leading-relaxed">
              {{ channel.description || "Aucune description disponible pour ce salon." }}
            </p>

            <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-zinc-800">
              <span
                class="text-xs font-medium text-gray-400 dark:text-zinc-600 bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded-md">
                {{ formatDate(channel.createdAt) }}
              </span>

              <NuxtLink :to="`/channels/${channel.slug}`"
                class="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1">
                Rejoindre
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showModal = false">
      <div
        class="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative transform transition-all">
        <button
          class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          @click="showModal = false">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Nouveau salon</h3>
        <p class="text-gray-500 dark:text-zinc-500 mb-6 text-sm">Créez un espace pour discuter d'un sujet spécifique.
        </p>

        <form @submit.prevent="createChannel" class="space-y-5">
          <div v-if="errorMessage"
            class="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errorMessage }}
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">Nom du salon</label>
            <input v-model="newChannel.name" type="text"
              class="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-4 focus:ring-zinc-500/10 transition"
              placeholder="ex: Général" required />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">Description <span
                class="text-gray-400 dark:text-zinc-600 font-normal">(optionnel)</span></label>
            <textarea v-model="newChannel.description" rows="3"
              class="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-4 focus:ring-zinc-500/10 transition resize-none"
              placeholder="De quoi parle ce salon ?"></textarea>
          </div>

          <div class="flex justify-end pt-4 gap-3">
            <button type="button" @click="showModal = false"
              class="px-5 py-2.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition">Annuler</button>
            <button type="submit" :disabled="isCreating"
              class="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold transition hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
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
