<script setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const channelSlug = route.params.slug 

const { request } = useAPI()
const { messages, isLoading, isSending, fetchMessages, sendMessage } = useMessages()


const { data: channel } = await useAsyncData(`channel-${channelSlug}`, () => 
  request(`/channels/${channelSlug}`)
)

await fetchMessages(channelSlug)

const newMessage = ref('')
const messagesContainer = ref(null)

const handleSend = async () => {
  const success = await sendMessage(channelSlug, newMessage.value)
  if (success) {
    newMessage.value = ''
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

let pollingInterval
onMounted(() => {
  scrollToBottom()
  pollingInterval = setInterval(() => fetchMessages(channelSlug), 3000)
})

onUnmounted(() => clearInterval(pollingInterval))
watch(messages, () => scrollToBottom())
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-64px)] bg-slate-950 text-slate-200">
    
    <header class="flex-none border-b border-slate-800 bg-slate-900/50 p-4 flex items-center gap-3 shadow-sm z-10">
      <NuxtLink to="/channels" class="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </NuxtLink>
      <div>
        <h1 class="font-bold text-white text-lg flex items-center gap-2">
          <span class="text-slate-500 text-xl">#</span>
          {{ channel?.name || channelSlug }}
        </h1>
        <p v-if="channel?.description" class="text-xs text-slate-400">
            {{ channel.description }}
        </p>
      </div>
    </header>

    <main ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
      <div v-if="isLoading && messages.length === 0" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="messages.length === 0" class="text-center py-20 opacity-50">
        <p>Aucun message dans #{{ channelSlug }}.</p>
      </div>

      <div v-for="msg in messages" :key="msg.id" class="flex gap-4 group animate-fade-in">
        <div class="flex-none w-10 h-10 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm uppercase">
            ?
        </div>
        <div class="flex-1">
          <div class="flex items-baseline gap-2">
            <span class="font-bold text-white">Anonyme</span>
            <span class="text-xs text-slate-500">{{ formatTime(msg.createdAt) }}</span>
          </div>
          <div class="text-slate-300 mt-1 leading-relaxed break-words whitespace-pre-wrap">
            {{ msg.body }}
          </div>
        </div>
      </div>
    </main>

    <footer class="flex-none p-4 bg-slate-900 border-t border-slate-800">
      <form @submit.prevent="handleSend" class="relative max-w-5xl mx-auto flex gap-2">
        <input 
          v-model="newMessage"
          type="text" 
          placeholder="Envoyer un message..." 
          class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 transition text-white placeholder-slate-500"
          :disabled="isSending"
        />
        <button 
          type="submit"
          :disabled="!newMessage.trim() || isSending"
          class="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:bg-transparent disabled:text-slate-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </footer>
  </div>
</template>