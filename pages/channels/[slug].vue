<script setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const channelSlug = route.params.slug
const authStore = useAuthStore()

const { request } = useAPI()
const { messages, isLoading, isSending, fetchMessages, sendMessage } = useMessages()
const { fetchUsers, getUserName, getUser } = useUsers()
const { isChannelOwner, deleteChannel } = useChannels()

const { data: channel, error: channelError } = await useAsyncData(`channel-${channelSlug}`, () =>
  request(`/channels/${channelSlug}`)
)

const isInitialLoading = ref(true)
const newMessage = ref('')
const messagesContainer = ref(null)
const selectedFile = ref(null)
const filePreview = ref(null)
const fileInput = ref(null)
const showChannelInfo = ref(false)
const showDeleteConfirm = ref(false)
const isDeletingChannel = ref(false)

onMounted(async () => {
  await fetchUsers()
  if (channel.value) {
    await fetchMessages(channel.value)
    isInitialLoading.value = false
    scrollToBottom()
    pollingInterval = setInterval(() => fetchMessages(channel.value), 3000)
  } else {
    isInitialLoading.value = false
  }
})

let pollingInterval
onUnmounted(() => clearInterval(pollingInterval))

const isMe = (messageAuthorIri) => {
  if (!authStore.user || !messageAuthorIri) return false
  const authorId = typeof messageAuthorIri === 'object' ? messageAuthorIri['@id'] : messageAuthorIri
  const myId = authStore.user?.['@id'] || authStore.user?.id
  const cleanAuthorId = authorId?.toString().split('/').pop()
  const cleanMyId = myId?.toString().split('/').pop()
  return cleanAuthorId === cleanMyId
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('Veuillez sélectionner une image')
    return
  }
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { filePreview.value = e.target.result }
  reader.readAsDataURL(file)
}

const removeFile = () => {
  selectedFile.value = null
  filePreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const handleSend = async () => {
  if ((!newMessage.value.trim() && !selectedFile.value) || isSending.value) return
  if (channel.value && await sendMessage(channel.value, newMessage.value, selectedFile.value)) {
    newMessage.value = ''
    removeFile()
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  })
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const formatDateSeparator = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (date.toDateString() === yesterday.toDateString()) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

const shouldShowDateSeparator = (index) => {
  if (index === 0) return true
  const current = new Date(messages.value[index].createdAt).toDateString()
  const prev = new Date(messages.value[index - 1].createdAt).toDateString()
  return current !== prev
}

const shouldGroupWithPrevious = (index) => {
  if (index === 0) return false
  const current = messages.value[index]
  const prev = messages.value[index - 1]
  // Same author and within 5 minutes
  const currentAuthor = typeof current.author === 'object' ? current.author['@id'] : current.author
  const prevAuthor = typeof prev.author === 'object' ? prev.author['@id'] : prev.author
  if (currentAuthor !== prevAuthor) return false
  const timeDiff = (new Date(current.createdAt) - new Date(prev.createdAt)) / 1000
  return timeDiff < 300 && !shouldShowDateSeparator(index)
}

watch(messages, () => scrollToBottom())

const handleDeleteChannel = async () => {
  if (!channel.value) return
  isDeletingChannel.value = true
  try {
    await deleteChannel(channel.value)
    navigateTo('/channels')
  } catch (e) {
    console.error(e)
    isDeletingChannel.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <div class="flex flex-1 overflow-hidden">
    <AppSidebar />

    <div class="flex-1 flex flex-col overflow-hidden bg-[#fafafa] dark:bg-[#09090b] text-gray-900 dark:text-zinc-200">

      <!-- Error state -->
      <div v-if="channelError" class="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div class="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-1">Salon introuvable</h3>
        <p class="text-sm text-gray-500 dark:text-zinc-500 max-w-sm mb-5">
          Impossible d'accéder à « {{ channelSlug }} ». Il a peut-être été supprimé.
        </p>
        <NuxtLink to="/channels"
          class="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition">
          Retour aux salons
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Header -->
        <header class="flex-none bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border-b border-gray-200/60 dark:border-zinc-800/60 px-4 py-2.5 flex items-center gap-3 z-10">
          <NuxtLink to="/channels"
            class="p-1.5 -ml-1 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m15 18-6-6 6-6" />
            </svg>
          </NuxtLink>

          <div class="flex-1 min-w-0">
            <h1 class="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
              <span class="text-gray-400 dark:text-zinc-500">#</span>
              {{ channel?.name || channelSlug }}
            </h1>
            <p v-if="channel?.description" class="text-[11px] text-gray-500 dark:text-zinc-400 truncate">{{ channel.description }}</p>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <button @click="showChannelInfo = !showChannelInfo"
              class="p-1.5 text-gray-400 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition">
              <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </header>

        <!-- Channel info dropdown -->
        <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
          <div v-if="showChannelInfo" class="flex-none bg-white dark:bg-zinc-900 border-b border-gray-200/60 dark:border-zinc-800/60 px-5 py-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-400 shrink-0">
                {{ channel?.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-zinc-100"># {{ channel?.name }}</h3>
                <p class="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">
                  {{ channel?.description || 'Aucune description' }}
                </p>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400 mt-1.5">
                  {{ messages.length }} message{{ messages.length !== 1 ? 's' : '' }}
                </p>
              </div>
              <button v-if="isChannelOwner(channel)" @click="showDeleteConfirm = true"
                class="p-1.5 text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition shrink-0 self-start"
                title="Supprimer ce salon">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </Transition>

        <!-- Messages area -->
        <main ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-4 scroll-smooth custom-scrollbar">

          <LoadingSpinner v-if="isInitialLoading" />

          <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-1">
              Bienvenue dans #{{ channel?.name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-zinc-400 max-w-xs">
              C'est le début de ce salon. Envoyez le premier message !
            </p>
          </div>

          <template v-else>
            <div v-for="(msg, index) in messages" :key="msg.id">
              <!-- Date separator -->
              <div v-if="shouldShowDateSeparator(index)" class="flex items-center gap-3 my-5 first:mt-0">
                <div class="flex-1 h-px bg-gray-200/60 dark:bg-zinc-800/60"></div>
                <span class="text-[11px] font-medium text-gray-500 dark:text-zinc-400 shrink-0">
                  {{ formatDateSeparator(msg.createdAt) }}
                </span>
                <div class="flex-1 h-px bg-gray-200/60 dark:bg-zinc-800/60"></div>
              </div>

              <!-- Message -->
              <div class="group flex gap-3 px-2 py-0.5 -mx-2 rounded-lg hover:bg-gray-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                :class="{ 'mt-3': !shouldGroupWithPrevious(index), 'mt-px': shouldGroupWithPrevious(index) }">

                <!-- Avatar or spacer -->
                <div class="w-9 shrink-0">
                  <UserAvatar v-if="!shouldGroupWithPrevious(index)" :user="msg.author" sizeClass="h-9 w-9" />
                  <span v-else class="text-[10px] text-gray-500 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity text-center block pt-1">
                    {{ formatTime(msg.createdAt) }}
                  </span>
                </div>

                <div class="flex-1 min-w-0">
                  <!-- Name + time for first in group -->
                  <div v-if="!shouldGroupWithPrevious(index)" class="flex items-baseline gap-2 mb-0.5">
                    <span class="text-sm font-semibold" :class="isMe(msg.author) ? 'text-zinc-900 dark:text-zinc-100' : 'text-gray-900 dark:text-zinc-100'">
                      {{ isMe(msg.author) ? 'Vous' : getUserName(msg.author) }}
                    </span>
                    <span class="text-[11px] text-gray-500 dark:text-zinc-400">{{ formatTime(msg.createdAt) }}</span>
                  </div>

                  <!-- Message body -->
                  <p v-if="msg.body" class="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed wrap-break-word whitespace-pre-wrap">{{ msg.body }}</p>

                  <!-- Media -->
                  <div v-if="msg.media && msg.media.length > 0" class="mt-1.5 flex flex-wrap gap-1.5">
                    <AuthImage v-for="(media, mIdx) in msg.media" :key="mIdx" :media="media"
                      img-class="rounded-lg max-w-xs max-h-60 object-cover border border-gray-100 dark:border-zinc-800"
                      alt="Média" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </main>

        <!-- Message input footer -->
        <footer class="flex-none px-4 pb-4 pt-2">
          <div class="bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800/60 rounded-xl overflow-hidden focus-within:border-gray-300 dark:focus-within:border-zinc-700 transition-colors">

            <!-- File preview -->
            <div v-if="selectedFile" class="px-3 pt-3">
              <div class="relative inline-block group">
                <div class="h-20 w-20 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
                  <img :src="filePreview" class="w-full h-full object-cover" />
                </div>
                <button @click="removeFile" type="button"
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-end gap-2 p-2">
              <!-- Attach button -->
              <button @click="fileInput.click()" type="button"
                class="p-2 text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />

              <!-- Text input -->
              <textarea v-model="newMessage" rows="1"
                :placeholder="`Message #${channel?.name || channelSlug}`"
                class="flex-1 bg-transparent border-none text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-0 resize-none py-2 px-1 max-h-32 leading-relaxed"
                :disabled="isSending"
                @keydown.enter.exact.prevent="handleSend"
                @keydown.enter.shift.exact.stop
                @input="$event.target.style.height = 'auto'; $event.target.style.height = Math.min($event.target.scrollHeight, 128) + 'px'"
              ></textarea>

              <!-- Send button -->
              <button @click="handleSend"
                :disabled="(!newMessage.trim() && !selectedFile) || isSending"
                class="p-2 rounded-lg transition shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                :class="(newMessage.trim() || selectedFile) ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200' : 'text-gray-400 dark:text-zinc-600'">
                <svg v-if="isSending" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>

          <p class="text-center text-[11px] text-gray-500 dark:text-zinc-500 mt-1.5">
            Entrée pour envoyer · Maj+Entrée pour un retour à la ligne
          </p>
        </footer>
      </template>
    </div>

    <!-- Delete Channel Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showDeleteConfirm = false">
      <div class="bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
        <div class="flex items-start gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-zinc-100">Supprimer ce salon ?</h3>
            <p class="text-sm text-gray-500 dark:text-zinc-500 mt-1">
              Le salon <strong class="text-gray-700 dark:text-zinc-300">#{{ channel?.name }}</strong> et tous ses messages seront supprimés définitivement.
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button @click="showDeleteConfirm = false"
            class="px-4 py-2 text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition">
            Annuler
          </button>
          <button @click="handleDeleteChannel" :disabled="isDeletingChannel"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            <span v-if="isDeletingChannel" class="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"></span>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
