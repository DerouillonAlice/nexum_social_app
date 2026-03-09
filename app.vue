<script setup>
const { fetchUsers } = useUsers()
const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.user) {
    await fetchUsers()
  }
})

watch(() => authStore.user, async (newUser) => {
  if (newUser) {
    await fetchUsers()
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>