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
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-8 relative overflow-hidden transition-colors duration-300">
    <!-- Decorative background elements -->
    <div
      class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none">
    </div>
    <div
      class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none">
    </div>

    <div
      class="w-full max-w-sm sm:max-w-md bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10 transition-all duration-300">

      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Créer un compte</h1>
        <p class="text-gray-500 dark:text-slate-400 text-sm">Rejoignez la discussion sur <span
            class="text-blue-500 dark:text-blue-400 font-semibold">Nexum</span></p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">

        <div v-if="error"
          class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl flex items-start gap-3 animate-pulse">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ error }}
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nom
            d'affichage</label>
          <div class="relative group">
            <input v-model="displayName" type="text" required
              class="w-full bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all group-hover:border-gray-300 dark:group-hover:border-slate-600"
              placeholder="Ex: Alice" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Adresse
            Email</label>
          <div class="relative group">
            <input v-model="email" type="email" required
              class="w-full bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all group-hover:border-gray-300 dark:group-hover:border-slate-600"
              placeholder="alice@exemple.com" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Mot de
            passe</label>
          <div class="relative group">
            <input v-model="password" type="password" required minlength="4"
              class="w-full bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all group-hover:border-gray-300 dark:group-hover:border-slate-600"
              placeholder="••••••••" />
          </div>
          <p class="mt-2 text-xs text-gray-500 dark:text-slate-500">Au moins 4 caractères</p>
        </div>

        <button type="submit" :disabled="isLoading"
          class="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-white dark:disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none disabled:shadow-none cursor-pointer flex items-center justify-center gap-2 mt-2">
          <svg v-if="isLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <span v-else>S'inscrire</span>
        </button>
      </form>

      <div class="mt-8 text-center text-sm">
        <span class="text-gray-500 dark:text-slate-500">Déjà un compte ?</span>
        <NuxtLink to="/login"
          class="ml-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:underline font-semibold transition">
          Se connecter
        </NuxtLink>
      </div>

    </div>
  </div>
</template>