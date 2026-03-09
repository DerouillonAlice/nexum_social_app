<script setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const authStore = useAuthStore()
const { request } = useAPI()

const userId = route.params.id
const user = ref(null)
const isLoading = ref(true)
const error = ref(null)

const isOwnProfile = computed(() => {
  const currentUserId = authStore.user?.['@id']?.split('/').pop() || authStore.user?.id
  return String(userId) === String(currentUserId)
})

onMounted(async () => {
  try {
    // If viewing own profile, redirect to /profile
    if (isOwnProfile.value) {
      navigateTo('/profile')
      return
    }

    user.value = await request(`/users/${userId}`, {
      ignoreSlug: true
    })
  } catch (e) {
    console.error('Error loading user profile:', e)
    error.value = 'Impossible de charger ce profil'
  } finally {
    isLoading.value = false
  }
})

const userPublications = computed(() => {
  return user.value?.publications || []
})

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
        
        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-500 dark:text-red-400">{{ error }}</p>
          <NuxtLink to="/" class="mt-4 inline-block text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline">
            Retour à l'accueil
          </NuxtLink>
        </div>
        
        <div v-else-if="user" class="space-y-6">
          <!-- Profile Header -->
          <div class="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-gray-200 dark:border-zinc-800">
            <div class="flex items-start gap-6">
              <!-- Avatar -->
              <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 border-4 border-gray-200 dark:border-zinc-700 flex-shrink-0">
                <img 
                  v-if="user.avatar?.contentUrl" 
                  :src="user.avatar.contentUrl" 
                  alt="Avatar" 
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-4xl text-gray-400 dark:text-zinc-500">
                  {{ user.displayName?.[0]?.toUpperCase() || '?' }}
                </div>
              </div>

              <!-- User Info -->
              <div class="flex-1">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-4">{{ user.displayName }}</h1>

                <div class="space-y-2 text-gray-700 dark:text-zinc-300">
                  <div v-if="user.prenom || user.nom" class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{{ user.prenom }} {{ user.nom }}</span>
                  </div>

                  <div v-if="user.email" class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{{ user.email }}</span>
                  </div>

                  <div v-if="user.dateAnniversaire" class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ formatDate(user.dateAnniversaire) }}</span>
                  </div>
                </div>

                <p v-if="user.biographie" class="mt-4 text-gray-500 dark:text-zinc-400">
                  {{ user.biographie }}
                </p>
              </div>
            </div>
          </div>

          <!-- Publications Section -->
          <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
            <h2 class="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-4">Publications</h2>
            
            <div v-if="userPublications.length === 0" class="text-center py-8 text-gray-500 dark:text-zinc-500">
              Aucune publication pour le moment
            </div>

            <div v-else class="space-y-4">
              <div 
                v-for="publication in userPublications" 
                :key="publication['@id'] || publication.id"
                class="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 transition"
              >
                <h3 class="font-semibold text-gray-900 dark:text-zinc-100 mb-2">{{ publication.title }}</h3>
                <p class="text-gray-500 dark:text-zinc-400 text-sm mb-2">{{ publication.body }}</p>
                <div class="text-xs text-gray-400 dark:text-zinc-600">
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
