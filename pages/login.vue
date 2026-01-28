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
  <div class="flex min-h-screen items-center justify-center bg-slate-950">
    <div class="">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-blue-500 mb-2">Nexum</h1>
        <p class="text-slate-400 text-sm">
          Workspace
          <span class="text-white font-mono bg-slate-800 px-1 rounded">{{
            useRuntimeConfig().public.slug
          }}</span>
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2"
            >Email</label
          >
          <input
            v-model="email"
            type="email"
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2"
            >Mot de passe</label
          >
          <input
            v-model="password"
            type="password"
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div
          v-if="errorMsg"
          class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center"
        >
          {{ errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-bold py-3 rounded-lg transition duration-200 cursor-pointer"
        >
          {{ isLoading ? "Connexion..." : "Se connecter" }}
        </button>

        <div class="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ?
          <NuxtLink to="/register" class="text-blue-400 hover:underline">
            Créer un compte
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
