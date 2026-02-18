<script setup>
const { login } = useAPI();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMsg = ref("");

const handleSubmit = async () => {
  isLoading.value = true;
  errorMsg.value = "";

  try {
    await login(email.value, password.value);
    navigateTo("/");
  } catch (e) {
    errorMsg.value = "Impossible de se connecter. Vérifiez vos identifiants.";
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-8 relative overflow-hidden transition-colors duration-300">
    <!-- Decorative background elements -->
    <div
      class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none">
    </div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none">
    </div>

    <div
      class="w-full max-w-sm sm:max-w-md bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10 transition-all duration-300">
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Nexum</h1>
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50">
          <span class="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Workspace</span>
          <span class="text-gray-900 dark:text-white font-mono text-xs font-bold">{{ useRuntimeConfig().public.slug
            }}</span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label
            class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
          <div class="relative group">
            <input v-model="email" type="email" required
              class="w-full bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all group-hover:border-gray-300 dark:group-hover:border-slate-600"
              placeholder="votre@email.com" />
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mot de
              passe</label>
            <!-- <a href="#" class="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition">Oublié ?</a> -->
          </div>
          <div class="relative group">
            <input v-model="password" type="password" required
              class="w-full bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-700/50 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all group-hover:border-gray-300 dark:group-hover:border-slate-600"
              placeholder="••••••••" />
          </div>
        </div>

        <div v-if="errorMsg"
          class="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm text-center flex items-center justify-center gap-2 animate-pulse">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ errorMsg }}
        </div>

        <button type="submit" :disabled="isLoading"
          class="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-white dark:disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none disabled:shadow-none cursor-pointer flex items-center justify-center gap-2">
          <svg v-if="isLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          {{ isLoading ? "Connexion..." : "Se connecter" }}
        </button>

        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500 dark:text-slate-500 mb-4">Pas encore de compte ?</p>
          <NuxtLink to="/register"
            class="inline-block w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-all text-sm font-semibold">
            Créer un compte gratuitement
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
