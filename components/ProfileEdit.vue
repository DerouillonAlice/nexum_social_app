<script setup>
const authStore = useAuthStore()
const { updateUser, uploadMedia } = useAPI()

const isUpdating = ref(false)
const isUploadingAvatar = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Form fields
const email = ref(authStore.user?.email || '')
const displayName = ref(authStore.user?.displayName || '')
const prenom = ref(authStore.user?.prenom || '')
const nom = ref(authStore.user?.nom || '')
const dateAnniversaire = ref(authStore.user?.dateAnniversaire?.split('T')[0] || '')
const biographie = ref(authStore.user?.biographie || '')

const selectedAvatar = ref(null)
const avatarPreview = ref(null)

const currentAvatar = computed(() => {
  if (avatarPreview.value) return avatarPreview.value

  const avatar = authStore.user?.avatar
  if (!avatar) return null

  if (typeof avatar === 'object' && avatar.contentUrl) {
    return avatar.contentUrl
  }

  return null
})

const handleAvatarSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    errorMsg.value = 'Veuillez sélectionner une image'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMsg.value = 'L\'image ne doit pas dépasser 5 Mo'
    return
  }

  selectedAvatar.value = file
  errorMsg.value = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Watch for user data changes and update form fields
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    email.value = newUser.email || ''
    displayName.value = newUser.displayName || ''
    prenom.value = newUser.prenom || ''
    nom.value = newUser.nom || ''
    dateAnniversaire.value = newUser.dateAnniversaire?.split('T')[0] || ''
    biographie.value = newUser.biographie || ''
  }
}, { immediate: true, deep: true })

const handleUpdateProfile = async () => {
  if (isUpdating.value) return

  errorMsg.value = ''
  successMsg.value = ''

  // Validation
  if (!displayName.value.trim()) {
    errorMsg.value = 'Le nom d\'affichage est requis'
    return
  }

  if (!email.value.trim() || !email.value.includes('@')) {
    errorMsg.value = 'Email valide requis'
    return
  }

  isUpdating.value = true

  try {
    const userId = authStore.user['@id'] || authStore.user.id
    const updateData = {
      email: email.value,
      displayName: displayName.value,
      prenom: prenom.value,
      nom: nom.value,
      biographie: biographie.value
    }

    // Add date only if provided
    if (dateAnniversaire.value) {
      updateData.dateAnniversaire = new Date(dateAnniversaire.value).toISOString()
    }

    // Upload avatar if selected
    if (selectedAvatar.value) {
      try {
        isUploadingAvatar.value = true
        const mediaResponse = await uploadMedia(selectedAvatar.value)
        const mediaIri = mediaResponse['@id'] || mediaResponse.id
        updateData.avatar = mediaIri
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError)
        errorMsg.value = 'Erreur lors de l\'upload de l\'avatar (bug backend connu). Le reste du profil sera mis à jour.'
        // Continue with profile update even if avatar fails
      } finally {
        isUploadingAvatar.value = false
      }
    }

    console.log('Sending update:', updateData)
    const response = await updateUser(userId, updateData)
    console.log('Update response:', response)

    // Update local auth store
    authStore.user = {
      ...authStore.user,
      ...updateData
    }

    successMsg.value = 'Profil mis à jour avec succès'
    selectedAvatar.value = null
    avatarPreview.value = null
  } catch (e) {
    console.error('Update error:', e)
    errorMsg.value = 'Erreur lors de la mise à jour du profil'
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
    <h2 class="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Modifier mon profil</h2>

    <form @submit.prevent="handleUpdateProfile" class="space-y-6">
      <!-- Avatar Section -->
      <div class="flex flex-col items-center gap-4 pb-6 border-b border-gray-200 dark:border-zinc-800">
        <div class="relative">
          <div
            class="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 border-4 border-gray-200 dark:border-zinc-700">
            <img v-if="currentAvatar" :src="currentAvatar" alt="Avatar" class="w-full h-full object-cover" />
            <div v-else
              class="w-full h-full flex items-center justify-center text-4xl text-gray-400 dark:text-zinc-500">
              {{ displayName[0]?.toUpperCase() || '?' }}
            </div>
          </div>
          <div v-if="isUploadingAvatar"
            class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <LoadingSpinner />
          </div>
        </div>

        <div class="text-center">
          <label class="cursor-pointer">
            <span
              class="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-100 rounded-xl text-sm font-medium transition inline-block">
              {{ selectedAvatar ? 'Changer l\'image' : 'Choisir un avatar' }}
            </span>
            <input type="file" accept="image/*" @change="handleAvatarSelect" :disabled="isUpdating" class="hidden" />
          </label>
          <p class="text-xs text-gray-400 dark:text-zinc-600 mt-2">Max 5 Mo</p>
        </div>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          Email
        </label>
        <input id="email" v-model="email" type="email" required :disabled="isUpdating"
          class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition disabled:opacity-50" />
      </div>

      <!-- Display Name -->
      <div>
        <label for="displayName" class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          Nom d'affichage
        </label>
        <input id="displayName" v-model="displayName" type="text" required :disabled="isUpdating"
          class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition disabled:opacity-50" />
      </div>

      <!-- First Name -->
      <div>
        <label for="prenom" class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          Prénom
        </label>
        <input id="prenom" v-model="prenom" type="text" :disabled="isUpdating"
          class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition disabled:opacity-50" />
      </div>

      <!-- Last Name -->
      <div>
        <label for="nom" class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          Nom
        </label>
        <input id="nom" v-model="nom" type="text" :disabled="isUpdating"
          class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition disabled:opacity-50" />
      </div>

      <!-- Birthday -->
      <div>
        <label for="dateAnniversaire" class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          Date d'anniversaire
        </label>
        <input id="dateAnniversaire" v-model="dateAnniversaire" type="date" :disabled="isUpdating"
          class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition disabled:opacity-50" />
      </div>

      <!-- Biography -->
      <div>
        <label for="biographie" class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          Biographie
        </label>
        <textarea id="biographie" v-model="biographie" rows="4" :disabled="isUpdating"
          placeholder="Parlez-nous de vous..."
          class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition disabled:opacity-50 resize-none"></textarea>
      </div>

      <div v-if="errorMsg" class="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-sm">
        {{ errorMsg }}
      </div>

      <div v-if="successMsg" class="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm">
        {{ successMsg }}
      </div>

      <button type="submit" :disabled="isUpdating"
        class="w-full px-6 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
        {{ isUpdating ? 'Mise à jour...' : 'Enregistrer les modifications' }}
      </button>
    </form>
  </div>
</template>
