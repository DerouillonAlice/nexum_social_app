<script setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const channelSlug = route.params.slug 
const authStore = useAuthStore() 

const { request } = useAPI()
const { messages, isLoading, isSending, fetchMessages, sendMessage } = useMessages()
const { fetchUsers, getUserName } = useUsers() 

const { data: channel } = await useAsyncData(`channel-${channelSlug}`, () => 
  request(`/channels/${channelSlug}`)
)

onMounted(async () => {
  await fetchUsers() 
  await fetchMessages(channelSlug)
  scrollToBottom()
  
  pollingInterval = setInterval(() => fetchMessages(channelSlug), 3000)
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

const newMessage = ref('')
const messagesContainer = ref(null)
const handleSend = async () => {
  if (await sendMessage(channelSlug, newMessage.value)) {
    newMessage.value = ''
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
watch(messages, () => scrollToBottom())
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-64px)] bg-slate-950 text-slate-200">
    
    <header class="flex-none border-b border-slate-800 bg-slate-900/50 p-4 flex items-center gap-3 shadow-sm z-10">
      <NuxtLink to="/channels" class="text-slate-400 hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </NuxtLink>
      <h1 class="font-bold text-white text-lg"># {{ channel?.name || channelSlug }}</h1>
    </header>

    <main ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
      
      <div v-if="messages.length === 0" class="text-center py-20 opacity-50">
        <p>C'est calme... Trop calme.</p>
      </div>

      <div 
        v-for="msg in messages" 
        :key="msg.id" 
        class="flex gap-4 group animate-fade-in"
        :class="{ 'flex-row-reverse': isMe(msg.author) }"
      >
        <div 
          class="flex-none w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-sm border"
          :class="isMe(msg.author) ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-700 text-slate-300 border-slate-600'"
        >
          {{ getUserName(msg.author)[0] }}
        </div>

        <div class="flex-1 max-w-2xl">
          <div class="flex items-baseline gap-2 mb-1" :class="{ 'justify-end': isMe(msg.author) }">
            <span class="font-bold text-white text-sm">
              {{ isMe(msg.author) ? 'Moi' : getUserName(msg.author) }}
            </span>
            <span class="text-xs text-slate-500">{{ formatTime(msg.createdAt) }}</span>
          </div>
          
          <div 
            class="py-2 px-4 rounded-2xl shadow-sm text-sm leading-relaxed break-words whitespace-pre-wrap"
            :class="isMe(msg.author) 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-slate-800 text-slate-200 rounded-tl-none'"
          >
            {{ msg.body }}
          </div>
        </div>
      </div>
    </main>

    <footer class="flex-none p-4 bg-slate-900 border-t border-slate-800">
      <form @submit.prevent="handleSend" class="relative max-w-5xl mx-auto flex gap-2">
        <input v-model="newMessage" type="text" placeholder="Envoyer..." class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-3 focus:border-blue-500 transition text-white" :disabled="isSending" />
        <button type="submit" :disabled="!newMessage.trim() || isSending" class="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </footer>
  </div>
</template>