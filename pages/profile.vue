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
          <h1 class="text-3xl font-bold text-white mb-2">Mon profil</h1>
          <p class="text-slate-400">Gérez vos informations personnelles</p>
        </div>

        <div class="bg-[#151725] rounded-2xl p-6 border border-white/5">
          <h2 class="text-xl font-bold text-white mb-4">Informations</h2>
          <div class="space-y-3 text-sm">
            <div>
              <span class="text-slate-500">Nom d'affichage:</span>
              <span class="ml-2 text-white font-medium">{{ authStore.user?.displayName }}</span>
            </div>
            <div>
              <span class="text-slate-500">Email:</span>
              <span class="ml-2 text-white font-medium">{{ authStore.user?.email }}</span>
            </div>
          </div>
        </div>

        <ProfileEdit />
      </div>
    </div>
  </div>
</template>
