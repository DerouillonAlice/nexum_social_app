<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})
</script>

<template>
  <header class="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0f111a] flex-shrink-0 z-10 sticky top-0">
    <div class="flex items-center gap-12 w-full max-w-7xl mx-auto">
      <NuxtLink to="/" class="flex items-center w-64">
        <img src="~/assets/img/logo.png" alt="Nexum Logo" class="h-8 w-auto">
      </NuxtLink>

      <SearchBar />

      <div class="flex items-center justify-end w-64 gap-6">
        <template v-if="user">
            <button class="text-slate-400 hover:text-white relative">
            <div class="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border-2 border-[#0f111a]"></div>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            </button>
            
            <UserMenu :user="user" />
        </template>
        <template v-else>
             <NuxtLink to="/login" class="text-slate-400 hover:text-white text-sm font-medium">Se connecter</NuxtLink>
             <NuxtLink to="/register" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">S'inscrire</NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>
