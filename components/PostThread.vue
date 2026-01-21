<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['comment-added'])

const authStore = useAuthStore()
const { request } = useAPI()
const { getUserName } = useUsers()

const comments = ref([])
const newComment = ref('')
const isSendingComment = ref(false)

const isMe = (authorIri) => {
    if (!authStore.user || !authorIri) return false
    const authorId = typeof authorIri === 'object' ? authorIri['@id'] : authorIri
    const myId = authStore.user['@id'] || `/api/users/${authStore.user.id}`
    return authorId === myId
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = (now - date) / 1000 

    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
    return date.toLocaleDateString()
}

const fetchComments = async () => {
  if (!props.post) return
  
  try {
    const parentId = props.post['@id'] || props.post.id
    const data = await request('/publications', {
        query: {
            parent: parentId,
            'order[createdAt]': 'asc'
        }
    })
    
    const rawComments = data.member || data['hydra:member'] || []
    
    comments.value = rawComments.filter(comment => {
        if (!comment.parent) return false
        
        const commentParentId = typeof comment.parent === 'object' ? (comment.parent['@id'] || comment.parent.id) : comment.parent
        const currentPostId = props.post['@id'] || props.post.id

        if (!commentParentId || !currentPostId) return false

        const cId = String(commentParentId)
        const pId = String(currentPostId)
        
        return cId.includes(pId) || pId.includes(cId)
    })

  } catch (e) {
    console.error("Failed to fetch replies", e)
    comments.value = []
  }
}

const submitComment = async () => {
    if (!newComment.value.trim() || !props.post) return

    isSendingComment.value = true
    try {
        const parentIri = props.post['@id'] || `/api/publications/${props.post.id}`
        const channelIri = typeof props.post.channel === 'object' 
            ? props.post.channel['@id'] 
            : props.post.channel

        const response = await request('/publications', {
            method: 'POST',
            body: {
                title: 'Reply',
                body: newComment.value,
                parent: parentIri,
                channel: channelIri
            }
        })
        

        if (response) {
            comments.value.push(response)
        }
        
        newComment.value = ''
        fetchComments()
        emit('comment-added')
    } catch (e) {
        console.error(e)
    } finally {
        isSendingComment.value = false
    }
}

watch(() => props.post, () => {
    comments.value = []
    fetchComments()
}, { immediate: true })
</script>

<template>
    <div class="flex flex-col h-full">
        <div class="mb-6 pb-6 border-b border-white/5 shrink-0">
            <h3 class="text-lg font-bold text-white mb-2">Fil de discussion</h3>
             <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3">
                <UserAvatar :user="post.author" sizeClass="h-8 w-8" />
                <div>
                  <h3 class="text-sm font-semibold text-white flex items-center gap-2">
                    {{ getUserName(post.author) }}
                    <span v-if="isMe(post.author)" class="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 font-medium">Vous</span>
                  </h3>
                   <span class="text-[10px] text-slate-500">{{ formatDate(post.createdAt) }}</span>
                </div>
              </div>
            </div>
            <p class="text-slate-300 text-xs mb-3 line-clamp-3">
              {{ post.body }}
            </p>
        </div>

        <div class="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
            <div 
              v-for="comment in comments" 
              :key="comment['@id'] || comment.id" 
              class="flex gap-3 w-full"
              :class="[isMe(comment.author) ? 'flex-row-reverse' : 'flex-row']"
            >
                <UserAvatar 
                  v-if="!isMe(comment.author)"
                  :user="comment.author" 
                  sizeClass="h-8 w-8 mt-1" 
                />
                <div 
                  class="flex flex-col max-w-[85%]"
                  :class="[isMe(comment.author) ? 'items-end' : 'items-start']"
                >
                   <h4 
                    class="text-[10px] font-bold text-slate-400 mb-1 px-1"
                    :class="[isMe(comment.author) ? 'text-right' : 'text-left']"
                   >
                    {{ isMe(comment.author) ? 'Vous' : getUserName(comment.author) }}
                   </h4>
                   <div 
                    class="p-3 text-sm wrap-break-word relative group transition-all duration-200"
                    :class="[
                      isMe(comment.author) 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-[#2a2d3d] text-slate-200 rounded-2xl rounded-tl-sm'
                    ]"
                   >
                     {{ comment.body }}
                   </div>
                   <span class="text-[10px] text-slate-500 mt-1 px-1">
                      {{ comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '' }}
                   </span>
                </div>
            </div>
        </div>

        <div class="mt-auto shrink-0">
             <form @submit.prevent="submitComment" class="relative">
                <input v-model="newComment" type="text" 
                  class="w-full bg-[#0f111a] border border-white/10 rounded-lg pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  :placeholder="`Répondre à ${getUserName(post.author).split(' ')[0]}...`"
                  :disabled="isSendingComment"
                >
                <button type="submit" :disabled="isSendingComment || !newComment.trim()" class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition disabled:opacity-50">
                    <svg class="h-4 w-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
             </form>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgb(55 65 81 / 0.5); 
    border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgb(71 85 105); 
}
</style>