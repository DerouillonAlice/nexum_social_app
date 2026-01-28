<script setup>
const authStore = useAuthStore()
const { updateUser } = useAPI()

const isUpdating = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const displayName = ref(authStore.user?.displayName || '')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const handleUpdateProfile = async () => {
  if (isUpdating.value) return

  errorMsg.value = ''
  successMsg.value = ''

  if (!displayName.value.trim()) {
    errorMsg.value = 'Le nom d\'affichage est requis'
    return
  }

  if (newPassword.value && newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (newPassword.value && newPassword.value.length < 6) {
    errorMsg.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  isUpdating.value = true

  try {
    const userId = authStore.user['@id'] || authStore.user.id
    const updateData = {
      displayName: displayName.value
    }

    if (newPassword.value) {
      updateData.password = newPassword.value
    }

    await updateUser(userId, updateData)

    authStore.user = { ...authStore.user, displayName: displayName.value }

    successMsg.value = 'Profil mis à jour avec succès'
    
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
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

      <div class="pt-4 border-t border-white/5">
        <h3 class="text-lg font-semibold text-white mb-4">Changer le mot de passe</h3>
        <p class="text-sm text-slate-400 mb-4">Laissez vide si vous ne souhaitez pas changer votre mot de passe</p>

        <div class="space-y-4">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-slate-300 mb-2">
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              :disabled="isUpdating"
              class="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-slate-300 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              :disabled="isUpdating"
              class="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
            />
          </div>
        </div>
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
