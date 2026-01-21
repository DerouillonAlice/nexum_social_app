<script setup>
const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-[#0f111a] text-slate-100 font-sans flex flex-col">
    <AppNavbar :user="authStore.user" />
    <main class="flex-1 flex flex-col overflow-hidden">
        <slot />
    </main>
  </div>
</template>
