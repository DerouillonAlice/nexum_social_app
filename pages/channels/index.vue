<script setup>
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { request } = useAPI()
const { isFavorite, toggleFavorite, isChannelOwner, deleteChannel } = useChannels()

const { data: channels, pending, error, refresh } = await useAsyncData('channels', () =>
  request('/channels'), {
  transform: (data) => {
    return data.member || data['hydra:member'] || []
  }
}
)

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = (now - date) / 1000
  if (diff < 3600) return `Il y a ${Math.max(1, Math.floor(diff / 60))} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const showModal = ref(false)
const isCreating = ref(false)
const errorMessage = ref('')
const newChannel = ref({ name: '', description: '' })
const searchQuery = ref('')
const channelToDelete = ref(null)
const isDeleting = ref(false)

const route = useRoute()

// Auto-open create modal if navigated with #create
onMounted(() => {
  if (route.hash === '#create') {
    showModal.value = true
  }
})

watch(() => route.hash, (hash) => {
  if (hash === '#create') {
    showModal.value = true
  }
})

const filteredChannels = computed(() => {
  if (!channels.value) return []
  if (!searchQuery.value.trim()) return channels.value
  const q = searchQuery.value.toLowerCase().trim()
  return channels.value.filter(c =>
    c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
  )
})

const createChannel = async () => {
  if (!newChannel.value.name.trim()) return

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

const handleDeleteChannel = async () => {
  if (!channelToDelete.value) return
  isDeleting.value = true
  try {
    await deleteChannel(channelToDelete.value)
    channelToDelete.value = null
    refresh()
  } catch (e) {
    console.error(e)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-1 overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
    <AppSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="flex-none bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border-b border-gray-200/60 dark:border-zinc-800/60 px-6 py-4">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Salons
                <span v-if="channels" class="text-sm font-normal text-gray-400 dark:text-zinc-600">{{ channels.length }}</span>
              </h2>
            </div>
            <button @click="showModal = true"
              class="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-semibold text-sm transition hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center gap-2 active:scale-95">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Créer
            </button>
          </div>

          <!-- Search -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><path stroke-linecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Rechercher un salon..."
              class="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/60 dark:border-zinc-700/60 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition" />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="max-w-4xl mx-auto py-2">

          <LoadingSpinner v-if="pending" />

          <div v-else-if="error" class="mx-6 mt-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-xl text-center text-sm">
            <p class="font-medium">Impossible de charger les salons.</p>
          </div>

          <div v-else-if="!channels || channels.length === 0" class="flex flex-col items-center justify-center py-20 text-center px-6">
            <div class="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-1">Aucun salon</h3>
            <p class="text-sm text-gray-500 dark:text-zinc-500 mb-5">Créez le premier salon pour lancer la conversation.</p>
            <button @click="showModal = true"
              class="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition">
              Créer un salon
            </button>
          </div>

          <template v-else>
            <!-- Favorites section -->
            <div v-if="filteredChannels.some(c => isFavorite(c.id))">
              <div class="px-6 pt-4 pb-2">
                <h3 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Favoris</h3>
              </div>
              <div class="space-y-px">
                <NuxtLink v-for="channel in filteredChannels.filter(c => isFavorite(c.id))" :key="'fav-' + channel.id"
                  :to="`/channels/${channel.slug}`"
                  class="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <div class="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-sm font-bold shrink-0">
                    {{ channel.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">
                        <span class="text-gray-400 dark:text-zinc-500 font-normal">#</span> {{ channel.name }}
                      </span>
                      <svg class="w-3.5 h-3.5 text-amber-400 shrink-0 fill-current" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <p class="text-xs text-gray-400 dark:text-zinc-600 truncate mt-0.5">
                      {{ channel.description || 'Aucune description' }}
                    </p>
                  </div>
                  <button @click.prevent.stop="toggleFavorite(channel)"
                    class="p-1.5 text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Retirer des favoris">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <svg class="w-4 h-4 text-gray-300 dark:text-zinc-700 shrink-0 group-hover:text-gray-400 dark:group-hover:text-zinc-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
              </div>
            </div>

            <!-- All channels -->
            <div>
              <div class="px-6 pt-4 pb-2">
                <h3 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  {{ searchQuery.trim() ? 'Résultats' : 'Tous les salons' }}
                </h3>
              </div>

              <div v-if="filteredChannels.length === 0" class="px-6 py-8 text-center">
                <p class="text-sm text-gray-500 dark:text-zinc-400">Aucun salon trouvé pour « {{ searchQuery }} »</p>
              </div>

              <div v-else class="space-y-px">
                <div v-for="channel in filteredChannels" :key="channel.id"
                  class="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <NuxtLink :to="`/channels/${channel.slug}`" class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center text-sm font-bold shrink-0">
                      {{ channel.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">
                          <span class="text-gray-400 dark:text-zinc-500 font-normal">#</span> {{ channel.name }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                        {{ channel.description || 'Aucune description' }}
                      </p>
                    </div>
                  </NuxtLink>

                  <span class="text-[11px] text-gray-500 dark:text-zinc-400 shrink-0 hidden sm:block">{{ formatDate(channel.createdAt) }}</span>

                  <button v-if="isChannelOwner(channel)" @click.stop="channelToDelete = channel"
                    class="p-1.5 rounded-lg transition shrink-0 text-gray-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="Supprimer ce salon">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <button @click.stop="toggleFavorite(channel)"
                    class="p-1.5 rounded-lg transition shrink-0"
                    :class="isFavorite(channel.id) ? 'text-amber-400' : 'text-gray-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 hover:text-amber-400'"
                    :title="isFavorite(channel.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'">
                    <svg class="w-4 h-4" :fill="isFavorite(channel.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>

                  <NuxtLink :to="`/channels/${channel.slug}`"
                    class="shrink-0">
                    <svg class="w-4 h-4 text-gray-300 dark:text-zinc-700 group-hover:text-gray-400 dark:group-hover:text-zinc-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>

    <!-- Create Channel Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showModal = false">
      <div
        class="bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button
          class="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          @click="showModal = false">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1">Nouveau salon</h3>
        <p class="text-gray-500 dark:text-zinc-500 mb-5 text-sm">Créez un espace de discussion.</p>

        <form @submit.prevent="createChannel" class="space-y-4">
          <div v-if="errorMessage"
            class="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errorMessage }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Nom</label>
            <input v-model="newChannel.name" type="text"
              class="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 transition"
              placeholder="ex: Général" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Description
              <span class="text-gray-400 dark:text-zinc-600 font-normal">(optionnel)</span>
            </label>
            <textarea v-model="newChannel.description" rows="2"
              class="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 transition resize-none"
              placeholder="De quoi parle ce salon ?"></textarea>
          </div>

          <div class="flex justify-end pt-2 gap-2">
            <button type="button" @click="showModal = false"
              class="px-4 py-2 text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition">
              Annuler
            </button>
            <button type="submit" :disabled="isCreating"
              class="px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-semibold text-sm transition hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              <span v-if="isCreating" class="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"></span>
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Channel Confirmation Modal -->
    <div v-if="channelToDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="channelToDelete = null">
      <div class="bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
        <div class="flex items-start gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-zinc-100">Supprimer ce salon ?</h3>
            <p class="text-sm text-gray-500 dark:text-zinc-500 mt-1">
              Le salon <strong class="text-gray-700 dark:text-zinc-300">#{{ channelToDelete.name }}</strong> et tous ses messages seront supprimés définitivement.
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button @click="channelToDelete = null"
            class="px-4 py-2 text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition">
            Annuler
          </button>
          <button @click="handleDeleteChannel" :disabled="isDeleting"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            <span v-if="isDeleting" class="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"></span>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
