<script setup>
const authStore = useAuthStore()
const { request } = useAPI()
const { fetchUsers, getUserName } = useUsers()
const { fetchChannels, getChannel } = useChannels()

const posts = ref([])
const selectedPost = ref(null)

const fetchPosts = async () => {
  try {
    const data = await request('/publications', {
        query: {
            'order[createdAt]': 'desc',
            'exists[parent]': 'false'
        }
    })
    posts.value = data.member || data['hydra:member'] || []
    if (posts.value.length > 0) {
      selectedPost.value = posts.value[0]
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
    if (authStore.user) {
        await fetchUsers()
        await fetchChannels()
        await fetchPosts()
    }
})

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
    const diff = (now - date) / 1000 // seconds

    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
    return date.toLocaleDateString()
}

const comments = ref([])
const newComment = ref('')
const isSendingComment = ref(false)

watch(selectedPost, () => {
}, { immediate: true })

const onCommentAdded = () => {
  if (selectedPost.value) {
     if (!selectedPost.value.comments) selectedPost.value.comments = []
     selectedPost.value.comments.push({ id: 'temp_' + Date.now() }) 
  }
}
</script>

<template>
  <div class="h-full flex flex-1 overflow-hidden">
    <template v-if="authStore.user">
      <AppSidebar />
      
      <div class="flex-1 overflow-y-auto px-6 py-6 border-r border-white/5 relative">
        <div class="max-w-3xl mx-auto space-y-6">
          
          <article v-for="post in posts" :key="post.id" class="bg-[#151725] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition shadow-lg shadow-black/20 cursor-pointer" @click="selectedPost = post">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <UserAvatar :user="post.author" sizeClass="h-10 w-10" />
                <div>
                  <h3 class="text-base font-semibold text-white flex items-center gap-2">
                    {{ getUserName(post.author) }}
                    <span v-if="isMe(post.author)" class="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 font-medium">Vous</span>
                  </h3>
                  <div class="flex items-center gap-2 text-xs text-slate-500">
                    <span>{{ formatDate(post.createdAt) }}</span>
                    <span v-if="post.channel" class="flex items-center gap-1">
                       • dans 
                       <NuxtLink v-if="getChannel(post.channel)" :to="`/channels/${getChannel(post.channel).slug}`" class="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium" @click.stop>
                         {{ getChannel(post.channel).name }}
                       </NuxtLink>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p class="text-slate-300 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
              {{ post.body }}
            </p>

            <div class="flex items-center gap-4 pt-4 border-t border-white/5">
                <button class="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition group">
                   <svg class="h-5 w-5 text-slate-500 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                   </svg>
                   Commenter ({{ post.comments?.length || 0 }})
                </button>
                <button class="flex items-center gap-2 text-sm text-slate-400 hover:text-pink-400 transition group">
                   <svg class="h-5 w-5 text-slate-500 group-hover:text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                   </svg>
                   J'aime ({{ post.likes || 0 }})
                </button>
            </div>
          </article>
        </div>
      </div>

      <aside v-if="selectedPost" class="w-80 p-6 overflow-y-auto hidden xl:flex flex-col bg-[#12141f]">
         <PostThread :post="selectedPost" @comment-added="onCommentAdded" />
      </aside>
    </template>


    <template v-else>
       <div class="w-full h-full flex flex-col items-center justify-center text-center px-4">
          <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-600 mb-6">
            L'espace de travail du futur
          </h1>
          <p class="text-xl text-slate-400 max-w-2xl mb-10">
            Connectez vos équipes, rationalisez vos flux de travail et centralisez vos communications en un seul endroit sécurisé.
          </p>
          <div class="flex gap-4">
            <NuxtLink to="/login" class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition">
              Se connecter
            </NuxtLink>
            <NuxtLink to="/register" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-500/25">
              Commencer gratuitement
            </NuxtLink>
          </div>
       </div>
    </template>
  </div>
</template>
