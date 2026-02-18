<script setup>
const authStore = useAuthStore()
const { request } = useAPI()
const { fetchUsers, getUserName } = useUsers()
const { fetchChannels, getChannel, isFavorite, favoriteChannels } = useChannels()
const { deletePublication } = useMessages()
const { fetchReactions, toggleLike, hasLiked, getReactionCount } = useReactions()
const { startPolling, stopPolling } = useNotifications()

const posts = ref([])
const selectedPost = ref(null)
const initialLoading = ref(true)
const showFavoritesOnly = ref(true)
const openMenuId = ref(null)
const commentCounts = ref({})

onUnmounted(() => {
  stopPolling()
})

const handleDeletePost = async (post) => {
  if (!confirm('Supprimer cette publication ?')) return
  const success = await deletePublication(post)
  if (success) {
    posts.value = posts.value.filter(p => p.id !== post.id)
    if (selectedPost.value?.id === post.id) {
      selectedPost.value = null
    }
  }
  openMenuId.value = null
}

const fetchPosts = async () => {
  try {
    const query = {
      'order[createdAt]': 'desc',
      'exists[parent]': 'false'
    }

    const data = await request('/publications', {
      query: {
        'order[createdAt]': 'desc',
        'exists[parent]': 'false'
      }
    })
    posts.value = data.member || data['hydra:member'] || []

    posts.value = posts.value.slice().sort((a, b) => {
      const ta = a && a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b && b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })

    if (posts.value.length > 0) {
      // If the currently selected post no longer exists in the list, deselect it
      if (selectedPost.value && !posts.value.some(p => (p.id && selectedPost.value.id && p.id === selectedPost.value.id) || (p['@id'] && selectedPost.value['@id'] && p['@id'] === selectedPost.value['@id']))) {
        selectedPost.value = null
      }
      fetchCommentCounts()
    } else {
      selectedPost.value = null
    }
  } catch (e) {
    console.error(e)
  }
}

const fetchCommentCounts = async () => {
  try {
    const data = await request('/comments', {
      query: {
        itemsPerPage: 500,
        'order[createdAt]': 'desc'
      }
    })

    const allComments = data.member || data['hydra:member'] || []
    const counts = {}

    allComments.forEach(comment => {
      if (comment.publication) {
        const pubId = typeof comment.publication === 'object'
          ? (comment.publication.id || comment.publication['@id']?.split('/').pop())
          : String(comment.publication).split('/').pop()

        if (pubId) {
          counts[pubId] = (counts[pubId] || 0) + 1
        }
      }
    })

    commentCounts.value = counts
  } catch (e) {
    console.error("Failed to fetch comment counts", e)
  }
}

onMounted(async () => {
  if (authStore.user) {
    initialLoading.value = true
    await fetchUsers()
    await fetchChannels()
    await fetchPosts()
    await fetchReactions()
    startPolling() // Start polling for notifications
    initialLoading.value = false
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
    // Increment local count
    if (selectedPost.value.id) {
      commentCounts.value[selectedPost.value.id] = (commentCounts.value[selectedPost.value.id] || 0) + 1
    }
  }
}

const getChannelId = (post) => {
  if (!post.channel) return null
  if (typeof post.channel === 'object') {
    return post.channel.id || post.channel['@id']?.split('/').pop()
  }
  return String(post.channel).split('/').pop()
}

const filteredPosts = computed(() => {
  if (!showFavoritesOnly.value || favoriteChannels.value.length === 0) {
    return posts.value
  }

  const favoriteIds = new Set(favoriteChannels.value.map(c => String(c.id)))

  return posts.value.filter(post => {
    const channelId = getChannelId(post)
    return channelId && favoriteIds.has(channelId)
  })
})
</script>

<template>
  <div class="flex overflow-hidden bg-gray-50 dark:bg-[#0f111a] text-gray-900 dark:text-white"
    style="height: calc(100vh - 4rem);">
    <template v-if="authStore.user">
      <AppSidebar />

      <div class="flex-1 overflow-y-auto px-8 py-8 border-r border-gray-200 dark:border-white/5 relative min-w-0">
        <div class="mx-auto space-y-8 max-w-5xl">

          <LoadingSpinner v-if="initialLoading" class="mb-10" />
          <PublicationComposer v-else :show-channel-selector="true" @posted="fetchPosts" class="mb-10" />

          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Publications</h2>
            <button @click="showFavoritesOnly = !showFavoritesOnly"
              class="text-sm px-4 py-2 rounded-lg transition font-medium"
              :class="showFavoritesOnly ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700'">
              {{ showFavoritesOnly ? '★ Favoris uniquement' : '☆ Tout afficher' }}
            </button>
          </div>

          <div v-if="filteredPosts.length === 0 && !initialLoading"
            class="text-center py-10 text-gray-500 dark:text-slate-500">
            <p v-if="showFavoritesOnly && favoriteChannels.length === 0">Suivez des espaces pour voir leurs publications
              ici.</p>
            <p v-else-if="showFavoritesOnly">Aucune publication dans vos espaces favoris.</p>
            <p v-else>Aucune publication.</p>
          </div>

          <article v-for="post in filteredPosts" :key="post.id"
            class="group bg-white dark:bg-[#151725] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
            :class="selectedPost?.id === post.id ? 'ring-2 ring-blue-500/50 shadow-blue-500/10' : ''">

            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-4">
                <UserAvatar :user="post.author" sizeClass="h-12 w-12 rounded-2xl" />
                <div>
                  <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {{ getUserName(post.author) }}
                    <span v-if="isMe(post.author)"
                      class="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 font-bold tracking-wide uppercase">Vous</span>
                  </h3>
                  <div class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                    <span>{{ formatDate(post.createdAt) }}</span>
                    <span v-if="post.channel" class="flex items-center gap-1">
                      <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></span>
                      dans
                      <NuxtLink v-if="getChannel(post.channel)" :to="`/channels/${getChannel(post.channel).slug}`"
                        class="text-blue-500 hover:text-blue-600 hover:underline transition-colors" @click.stop>
                        {{ getChannel(post.channel).name }}
                      </NuxtLink>
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="isMe(post.author)" class="relative">
                <button @click.stop="openMenuId = openMenuId === post.id ? null : post.id"
                  class="p-2 text-gray-400 hover:text-gray-900 dark:text-slate-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                <div v-if="openMenuId === post.id"
                  class="absolute right-0 top-12 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 z-20 min-w-[160px] p-1.5 transform origin-top-right transition-all">
                  <button @click.stop="handleDeletePost(post)"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition font-medium">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>

            <div class="pl-0 sm:pl-[4rem]">
              <p class="text-gray-800 dark:text-slate-200 text-base leading-relaxed whitespace-pre-wrap mb-6">
                {{ post.body }}
              </p>

              <!-- Media Grid -->
              <div v-if="post.media && post.media.length > 0" class="mb-6 grid gap-2"
                :class="post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'">
                <AuthImage v-for="(media, index) in post.media" :key="index" :media="media"
                  img-class="rounded-2xl w-full object-cover border border-gray-100 dark:border-white/5 max-h-[400px]"
                  alt="Média de la publication" />
              </div>

              <div class="flex items-center gap-6 pt-6 border-t border-gray-100 dark:border-white/5">
                <button @click.stop="toggleLike(post)"
                  class="flex items-center gap-2.5 text-sm font-medium transition-all group"
                  :class="hasLiked(post) ? 'text-pink-500' : 'text-gray-500 dark:text-slate-400 hover:text-pink-500'">
                  <div class="p-2 rounded-full transition-colors"
                    :class="hasLiked(post) ? 'bg-pink-50 dark:bg-pink-500/10' : 'group-hover:bg-pink-50 dark:group-hover:bg-pink-500/10'">
                    <svg class="h-5 w-5 transition-transform group-active:scale-90"
                      :class="hasLiked(post) ? 'fill-current' : ''" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span>{{ getReactionCount(post) || 'J\'aime' }}</span>
                </button>

                <button @click="selectedPost = post"
                  class="flex items-center gap-2.5 text-sm font-medium transition-all group text-gray-500 dark:text-slate-400 hover:text-blue-500">
                  <div
                    class="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                    <svg class="h-5 w-5 transition-transform group-active:scale-90" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span>{{ commentCounts[post.id] > 0 ? commentCounts[post.id] + ' commentaire' +
                    (commentCounts[post.id] > 1 ? 's' : '') : 'Commenter' }}</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="max-w-0"
        enter-to-class="max-w-[28rem]" leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="max-w-[28rem]" leave-to-class="max-w-0">
        <aside v-if="selectedPost"
          class="hidden xl:flex flex-col w-[28rem] overflow-hidden border-l border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-[#12141f] flex-shrink-0">
          <div
            class="border-b border-gray-200 dark:border-white/5 p-6 flex items-center justify-between bg-white dark:bg-[#0f111a]/50 backdrop-blur-sm sticky top-0 z-10">
            <h3 class="font-semibold text-lg text-gray-900 dark:text-white whitespace-nowrap">Commentaires</h3>
            <button @click="selectedPost = null"
              class="p-2 hover:bg-gray-200 dark:hover:bg-white/5 rounded-lg transition text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto">
            <PostThread :post="selectedPost" @comment-added="onCommentAdded" />
          </div>
        </aside>
      </Transition>

      <div v-if="selectedPost"
        class="xl:hidden fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        @click="selectedPost = null">
        <div class="bg-[#12141f] w-full sm:max-w-2xl sm:rounded-t-2xl max-h-[80vh] overflow-y-auto" @click.stop>
          <div class="sticky top-0 bg-[#12141f] border-b border-white/5 p-4 flex justify-between items-center">
            <h3 class="font-semibold">Commentaires</h3>
            <button @click="selectedPost = null" class="p-2 hover:bg-white/5 rounded-lg transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <PostThread :post="selectedPost" @comment-added="onCommentAdded" />
        </div>
      </div>

    </template>
    <template v-else>
      <div class="w-full h-full flex flex-col items-center justify-center text-center px-4">
        <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-600 mb-6">
          L'espace de travail du futur
        </h1>
        <p class="text-xl text-slate-400 max-w-2xl mb-10">
          Connectez vos équipes, rationalisez vos flux de travail et centralisez vos communications en un seul endroit
          sécurisé.
        </p>
        <div class="flex gap-4">
          <NuxtLink to="/login"
            class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition">
            Se connecter
          </NuxtLink>
          <NuxtLink to="/register"
            class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-500/25">
            Commencer gratuitement
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>
