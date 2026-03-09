<script setup>
const props = defineProps({
    media: { type: Object, required: true },
    alt: { type: String, default: '' },
    imgClass: { type: String, default: '' }
})

const authStore = useAuthStore()

const imgSrc = computed(() => {
    const id = props.media?.id || props.media?.['@id']?.split('/').pop()
    if (!id) return null
    const token = authStore.token || ''
    return `/api/media-proxy/${id}?token=${encodeURIComponent(token)}`
})

const error = ref(false)

watch(() => props.media?.id, () => { error.value = false })
</script>

<template>
    <img v-if="imgSrc && !error" :src="imgSrc" :alt="alt" :class="imgClass" @error="error = true" />
    <div v-else-if="error"
        class="inline-flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-lg text-gray-400 dark:text-zinc-500 text-xs px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        Image non disponible
    </div>
    <div v-else class="inline-block bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse h-20 w-20" />
</template>
