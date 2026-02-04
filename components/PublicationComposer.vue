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
    <div class="bg-white dark:bg-[#151725] rounded-2xl p-4 border border-gray-200 dark:border-white/5 shadow-lg">
        <div class="flex gap-4">
            <div class="flex-1">
                <div v-if="showChannelSelector" class="mb-3">
                    <select v-model="selectedChannel"
                        class="w-full bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 transition">
                        <option :value="null" disabled>Sélectionner un salon</option>
                        <option v-for="channel in channels" :key="channel.id" :value="channel">
                            # {{ channel.name }}
                        </option>
                    </select>
                </div>

                <textarea v-model="content" :placeholder="props.placeholder" rows="3"
                    class="w-full bg-gray-100 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-700/50 rounded-lg p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 transition resize-none"
                    :disabled="isSending" @keydown.enter.ctrl.exact="handleSubmit"
                    @keydown.enter.meta.exact="handleSubmit"></textarea>
                <div v-if="selectedFile" class="mt-3 relative inline-block">
                    <div
                        class="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-300 dark:border-slate-700 group">
                        <img :src="filePreview" class="w-full h-full object-cover" />
                        <button @click="removeFile" type="button"
                            class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-slate-500 mt-1 truncate max-w-[120px]">
                        {{ selectedFile.name }}
                    </div>
                </div>

                <div class="flex justify-between items-center mt-3">
                    <div class="flex items-center gap-2">
                        <button type="button" @click="fileInput.click()"
                            class="p-2 text-gray-600 dark:text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                            title="Ajouter une image">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path
                                    d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                        </button>
                        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
                    </div>

                    <button @click="handleSubmit" :disabled="!canSubmit"
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        <span v-if="isSending">Envoi...</span>
                        <span v-else>Envoyer</span>
                        <svg v-if="!isSending" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
