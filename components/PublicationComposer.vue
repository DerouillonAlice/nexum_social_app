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
    <div
        class="bg-white dark:bg-[#151725] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex flex-col gap-4">
            <div v-if="showChannelSelector" class="relative">
                <select v-model="selectedChannel"
                    class="appearance-none bg-blue-50 dark:bg-blue-500/10 border-none rounded-xl px-4 py-2 pr-10 text-sm font-semibold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition hover:bg-blue-100 dark:hover:bg-blue-500/20">
                    <option :value="null" disabled>Sélectionner un salon</option>
                    <option v-for="channel in channels" :key="channel.id" :value="channel">
                        # {{ channel.name }}
                    </option>
                </select>
                <div
                    class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-600 dark:text-blue-400">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            <div class="relative">
                <textarea v-model="content" :placeholder="props.placeholder" rows="3"
                    class="w-full bg-transparent border-none p-0 text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-0 resize-none"
                    :disabled="isSending" @keydown.enter.ctrl.exact="handleSubmit"
                    @keydown.enter.meta.exact="handleSubmit"></textarea>

                <div v-if="selectedFile" class="mt-4 relative inline-block group">
                    <div
                        class="relative h-32 w-32 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
                        <img :src="filePreview" class="w-full h-full object-cover" />
                        <button @click="removeFile" type="button"
                            class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                            <div class="bg-white/20 p-2 rounded-full text-white hover:bg-white/30 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/5">
                <div class="flex items-center gap-2">
                    <button type="button" @click="fileInput.click()"
                        class="p-2.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all duration-200"
                        title="Ajouter une image">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </button>
                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />

                    <span class="text-xs text-gray-400 dark:text-slate-500 font-medium ml-2 hidden sm:inline-block">
                        Ajoutez une image à votre publication
                    </span>
                </div>

                <button @click="handleSubmit" :disabled="!canSubmit"
                    class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center gap-2">
                    <span v-if="isSending">Publication...</span>
                    <span v-else>Publier</span>
                    <svg v-if="!isSending" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>
