<script setup>
const { register } = useAPI()

const email = ref('')
const password = ref('')
const displayName = ref('')

const isLoading = ref(false)
const error = ref(null)

const handleRegister = async () => {
  if (!email.value || !password.value || !displayName.value) return

  isLoading.value = true
  error.value = null

  try {
    await register(email.value, password.value, displayName.value)
    
    navigateTo('/login')
    alert('Compte créé avec succès ! Connectez-vous.')
    
  } catch (e) {
    console.error(e)
    error.value = "Erreur lors de l'inscription. Vérifiez les champs ou le code d'inscription."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-4">
    <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Créer un compte</h1>
        <p class="text-slate-400">Rejoignez la discussion sur Nexum</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        
        <div v-if="error" class="bg-red-900/20 border border-red-900 text-red-400 text-sm p-3 rounded-lg">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-400 mb-1">Nom d'affichage</label>
          <input 
            v-model="displayName"
            type="text" 
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white"
            placeholder="Ex: Alice"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-400 mb-1">Adresse Email</label>
          <input 
            v-model="email"
            type="email" 
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white"
            placeholder="alice@exemple.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-400 mb-1">Mot de passe</label>
          <input 
            v-model="password"
            type="password" 
            required
            minlength="4"
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-white"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">Création en cours...</span>
          <span v-else>S'inscrire</span>
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-slate-500">
        Déjà un compte ? 
        <NuxtLink to="/login" class="text-blue-400 hover:underline">
          Se connecter
        </NuxtLink>
      </div>

    </div>
  </div>
</template>