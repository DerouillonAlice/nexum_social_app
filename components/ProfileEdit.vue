<script setup>
const authStore = useAuthStore()
const { updateUser } = useAPI()

const isUpdating = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Form fields
const displayName = ref(authStore.user?.displayName || '')
const biographie = ref(authStore.user?.biographie || '')

const handleUpdateProfile = async () => {
  if (isUpdating.value) return

  errorMsg.value = ''
  successMsg.value = ''

  // Validation
  if (!displayName.value.trim()) {
    errorMsg.value = 'Le nom d\'affichage est requis'
    return
  }

  isUpdating.value = true

  try {
    const userId = authStore.user['@id'] || authStore.user.id
    const updateData = {
      displayName: displayName.value,
      biographie: biographie.value
    }

    console.log('Sending update:', updateData)
    const response = await updateUser(userId, updateData)
    console.log('Update response:', response)

    // Update local auth store
    authStore.user = { 
      ...authStore.user, 
      displayName: displayName.value,
      biographie: biographie.value
    }

    successMsg.value = 'Profil mis à jour avec succès'
  } catch (e) {
    console.error('Update error:', e)
    errorMsg.value = 'Erreur lors de la mise à jour du profil'
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div class="bg-[#151725] rounded-2xl p-6 border border-white/5">
    <h2 class="text-xl font-bold text-white mb-6">Modifier mon profil</h2>

    <form @submit.prevent="handleUpdateProfile" class="space-y-6">
      <div>
        <label for="displayName" class="block text-sm font-medium text-slate-300 mb-2">
          Nom d'affichage
        </label>
        <input
          id="displayName"
          v-model="displayName"
          type="text"
          required
          :disabled="isUpdating"
          class="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
        />
      </div>

      <!-- Biography -->
      <div>
        <label for="biographie" class="block text-sm font-medium text-slate-300 mb-2">
          Biographie
        </label>
        <textarea
          id="biographie"
          v-model="biographie"
          rows="4"
          :disabled="isUpdating"
          placeholder="Parlez-nous de vous..."
          class="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50 resize-none"
        ></textarea>
      </div>

      <div v-if="errorMsg" class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
        {{ errorMsg }}
      </div>

      <div v-if="successMsg" class="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
        {{ successMsg }}
      </div>

      <button
        type="submit"
        :disabled="isUpdating"
        class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isUpdating ? 'Mise à jour...' : 'Enregistrer les modifications' }}
      </button>
    </form>
  </div>
</template>
