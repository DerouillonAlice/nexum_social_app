<script setup>
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const channelSlug = route.params.slug 
const authStore = useAuthStore() 

const { request } = useAPI()
const { messages, isLoading, isSending, fetchMessages, sendMessage } = useMessages()
const { fetchUsers, getUserName } = useUsers() 

const { data: channel, error: channelError } = await useAsyncData(`channel-${channelSlug}`, () => 
  request(`/channels/${channelSlug}`)
)

const isInitialLoading = ref(true)

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

const newMessage = ref('')
const messagesContainer = ref(null)
const handleSend = async () => {
  if (channel.value && await sendMessage(channel.value, newMessage.value)) {
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
  <div class="h-full flex flex-1 overflow-hidden">
    <AppSidebar />
    
    <div class="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 text-slate-200">
      
      <div v-if="channelError" class="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
               <svg class="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
               <h3 class="text-xl font-bold text-white mb-2">Erreur lors du chargement du salon</h3>
               <p class="text-slate-400 max-w-md">Impossible d'accéder au salon "<strong>{{ channelSlug }}</strong>".<br/>Il a peut-être été supprimé ou plusieurs salons portent le même identifiant.</p>
          </div>
          <NuxtLink to="/channels" class="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-medium">
             Retour aux salons
          </NuxtLink>
      </div>

      <template v-else>
      <header class="flex-none border-b border-slate-800 bg-slate-900/50 p-4 flex items-center gap-3 shadow-sm z-10">
        <NuxtLink to="/channels" class="text-slate-400 hover:text-white transition md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </NuxtLink>
        <div class="flex flex-col">
            <h1 class="font-bold text-white text-lg flex items-center gap-2">
                <span class="text-slate-500">#</span> 
                {{ channel?.name || channelSlug }}
            </h1>
            <p v-if="channel?.description" class="text-xs text-slate-500">{{ channel.description }}</p>
        </div>
      </header>

      <main ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        
        <LoadingSpinner v-if="isInitialLoading || isLoading" />
        
        <div v-else-if="messages.length === 0" class="text-center py-20 opacity-50">
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
        <form @submit.prevent="handleSend" class="relative w-full flex gap-2">
          <input v-model="newMessage" type="text" :placeholder="`Envoyer un message dans #${channel?.name || channelSlug}`" class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-3 focus:border-blue-500 transition text-white" :disabled="isSending" />
          <button type="submit" :disabled="!newMessage.trim() || isSending" class="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </footer>
      </template>
    </div>
  </div>
</template>
