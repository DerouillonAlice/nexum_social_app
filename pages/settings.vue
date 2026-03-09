<script setup>
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { getCurrentUser } = useAPI()

onMounted(async () => {
  try {
    await getCurrentUser()
  } catch (e) {
    console.error('Error loading user profile:', e)
  }
})
</script>

<template>
  <div class="h-full flex flex-1 overflow-hidden">
    <AppSidebar />

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Paramètres</h1>
          <p class="text-gray-500 dark:text-zinc-500">Gérez vos informations personnelles</p>
        </div>

        <ProfileEdit />
      </div>
    </div>
  </div>
</template>
