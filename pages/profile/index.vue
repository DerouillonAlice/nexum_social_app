<script setup>
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { getCurrentUser } = useAPI()
const { deletePublication } = useMessages()

const isLoading = ref(true)
const openMenuId = ref(null)

onMounted(async () => {
  try {
    await getCurrentUser()
  } catch (e) {
    console.error('Error loading user profile:', e)
  } finally {
    isLoading.value = false
  }
})

const userPublications = computed(() => {
  return authStore.user?.publications || []
})

const handleDeletePublication = async (publication) => {
  if (!confirm('Supprimer cette publication ?')) return
  const pubId = publication.id || publication['@id']?.split('/').pop()
  const success = await deletePublication(publication)
  if (success) {
    authStore.user.publications = authStore.user.publications.filter(
      p => (p.id || p['@id']?.split('/').pop()) !== pubId
    )
  }
  openMenuId.value = null
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="h-full flex flex-1 overflow-hidden">
    <AppSidebar />

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="max-w-4xl mx-auto">
        <LoadingSpinner v-if="isLoading" />

        <div v-else class="space-y-6">
          <!-- Profile Header -->
          <div class="bg-white dark:bg-[#151725] rounded-2xl p-8 border border-gray-200 dark:border-white/5">
            <div class="flex items-start gap-6">
              <!-- Avatar -->
              <UserAvatar 
                :user="authStore.user" 
                sizeClass="w-32 h-32"
                class="border-4 border-gray-300 dark:border-slate-700"
              />

              <!-- User Info -->
              <div class="flex-1">
                <div class="flex items-center justify-between mb-4">
                  <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ authStore.user?.displayName }}</h1>
                  <NuxtLink to="/settings"
                    class="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition">
                    Modifier le profil
                  </NuxtLink>
                </div>

                <div class="space-y-2 text-gray-700 dark:text-slate-300">
                  <div v-if="authStore.user?.prenom || authStore.user?.nom" class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-500 dark:text-slate-500" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{{ authStore.user.prenom }} {{ authStore.user.nom }}</span>
                  </div>

                  <div v-if="authStore.user?.email" class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-500 dark:text-slate-500" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{{ authStore.user.email }}</span>
                  </div>

                  <div v-if="authStore.user?.dateAnniversaire" class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-500 dark:text-slate-500" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ formatDate(authStore.user.dateAnniversaire) }}</span>
                  </div>
                </div>

                <p v-if="authStore.user?.biographie" class="mt-4 text-gray-600 dark:text-slate-400">
                  {{ authStore.user.biographie }}
                </p>
              </div>
            </div>
          </div>

          <!-- Publications Section -->
          <div class="bg-white dark:bg-[#151725] rounded-2xl p-6 border border-gray-200 dark:border-white/5">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Publications</h2>

            <div v-if="userPublications.length === 0" class="text-center py-8 text-gray-500 dark:text-slate-500">
              Aucune publication pour le moment
            </div>

            <div v-else class="space-y-4">
              <div v-for="publication in userPublications" :key="publication['@id'] || publication.id"
                class="p-4 bg-gray-100 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition relative">
                <div class="flex justify-between items-start">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-2">{{ publication.title }}</h3>
                  <div class="relative">
                    <button @click="openMenuId = openMenuId === publication.id ? null : publication.id"
                      class="p-1 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800 rounded transition">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    <div v-if="openMenuId === publication.id"
                      class="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-10 min-w-[120px]">
                      <button @click="handleDeletePublication(publication)"
                        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
                <p class="text-gray-600 dark:text-slate-400 text-sm mb-2">{{ publication.body }}</p>
                <div class="text-xs text-gray-500 dark:text-slate-500">
                  {{ formatDate(publication.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
