<script setup>
const route = useRoute()
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <div class="p-10 text-center text-white">
    <h1 class="text-3xl font-bold">Salon #{{ route.params.id }}</h1>
    <p class="mt-4 text-slate-400">La messagerie arrive bientôt...</p>
    <NuxtLink to="/channels" class="text-blue-400 hover:underline mt-4 inline-block">
      ← Retour aux salons
    </NuxtLink>
  </div>
</template>