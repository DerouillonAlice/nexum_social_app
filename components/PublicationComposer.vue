<script setup>
const props = defineProps({
    defaultChannel: {
        type: Object,
        default: null
    },
    showChannelSelector: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: 'Quoi de neuf ?'
    }
})

const emit = defineEmits(['posted'])

const { sendMessage, isSending } = useMessages()
const { channels, fetchChannels } = useChannels()

const content = ref('')
const selectedChannel = ref(props.defaultChannel)
const selectedFile = ref(null)
const filePreview = ref(null)
const fileInput = ref(null)

// Initialize channels if needed
onMounted(async () => {
    if (props.showChannelSelector && channels.value.length === 0) {
        await fetchChannels()
    }

    if (props.defaultChannel) {
        selectedChannel.value = props.defaultChannel
    } else if (channels.value.length > 0 && !selectedChannel.value) {
        selectedChannel.value = channels.value[0]
    }
})

// Update selected channel if default changes
watch(() => props.defaultChannel, (newVal) => {
    if (newVal) selectedChannel.value = newVal
})

const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image')
        return
    }

    selectedFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
        filePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
}

const removeFile = () => {
    selectedFile.value = null
    filePreview.value = null
    if (fileInput.value) fileInput.value.value = ''
}

const handleSubmit = async () => {
    if (!selectedChannel.value) {
        return
    }

    const success = await sendMessage(selectedChannel.value, content.value, selectedFile.value)

    if (success) {
        content.value = ''
        removeFile()
        emit('posted')
    }
}

const canSubmit = computed(() => {
    return (content.value.trim() || selectedFile.value) && selectedChannel.value && !isSending.value
})
</script>

<template>
    <div class="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-200/60 dark:border-zinc-800/60" role="form" aria-label="Composer une publication">
        <div class="flex flex-col gap-3">
            <div v-if="showChannelSelector" class="relative">
                <select v-model="selectedChannel" aria-label="Sélectionner un salon"
                    class="appearance-none bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-zinc-600 dark:text-zinc-400 focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500/40 cursor-pointer transition">
                    <option :value="null" disabled>Sélectionner un salon</option>
                    <option v-for="channel in channels" :key="channel.id" :value="channel">
                        # {{ channel.name }}
                    </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500 dark:text-zinc-400">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            <div class="flex items-start gap-3">
                <UserAvatar :user="$pinia.state.value.auth?.user" sizeClass="h-9 w-9 rounded-full" />
                <textarea v-model="content" :placeholder="props.placeholder" rows="2"
                    aria-label="Contenu de la publication"
                    class="flex-1 bg-transparent border-none p-0 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-0 resize-none leading-relaxed"
                    :disabled="isSending" @keydown.enter.ctrl.exact="handleSubmit"
                    @keydown.enter.meta.exact="handleSubmit"></textarea>
            </div>

            <div v-if="selectedFile" class="ml-12 relative inline-block group">
                <div class="relative h-24 w-24 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800">
                    <img :src="filePreview" class="w-full h-full object-cover" />
                    <button @click="removeFile" type="button"
                        aria-label="Retirer l'image sélectionnée"
                        class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="flex items-center justify-between ml-12">
                <div class="flex items-center gap-1">
                    <button type="button" @click="fileInput.click()"
                        aria-label="Ajouter une image à la publication"
                        class="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-1.5"
                        title="Ajouter une image">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Image
                    </button>
                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
                </div>

                <button @click="handleSubmit" :disabled="!canSubmit"
                    class="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                    <span v-if="isSending">...</span>
                    <span v-else>Publier</span>
                </button>
            </div>
        </div>
    </div>
</template>
