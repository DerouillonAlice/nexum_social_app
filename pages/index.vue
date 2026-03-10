<script setup>
const authStore = useAuthStore()
const { request } = useAPI()
const { fetchUsers, getUserName } = useUsers()
const { fetchChannels, getChannel, isFavorite, favoriteChannels } = useChannels()
const { deletePublication, editPublication } = useMessages()
const { fetchReactions, toggleLike, hasLiked, getReactionCount } = useReactions()

const posts = ref([])
const selectedPost = ref(null)
const initialLoading = ref(true)
const showFavoritesOnly = ref(true)
const openMenuId = ref(null)
const commentCounts = ref({})
const editingPostId = ref(null)
const editingBody = ref('')

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

const startEditing = (post) => {
  editingPostId.value = post.id
  editingBody.value = post.body || ''
  openMenuId.value = null
}

const cancelEditing = () => {
  editingPostId.value = null
  editingBody.value = ''
}

const saveEditing = async (post) => {
  if (!editingBody.value.trim()) return
  const updated = await editPublication(post, editingBody.value.trim())
  if (updated) {
    const index = posts.value.findIndex(p => p.id === post.id)
    if (index !== -1) {
      posts.value[index] = { ...posts.value[index], body: updated.body || editingBody.value.trim() }
    }
  }
  editingPostId.value = null
  editingBody.value = ''
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
  <div class="flex flex-1 overflow-hidden bg-[#fafafa] dark:bg-[#09090b] text-gray-900 dark:text-zinc-100">
    <template v-if="authStore.user">
      <AppSidebar />

      <div class="flex-1 overflow-y-auto px-6 py-6 border-r border-gray-200/60 dark:border-zinc-800/60 relative min-w-0 custom-scrollbar">
        <div class="mx-auto space-y-6 max-w-2xl">

          <PublicationComposer v-if="!initialLoading" :show-channel-selector="true" @posted="fetchPosts" />

          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-zinc-200">Publications</h2>
            <button v-if="!initialLoading" @click="showFavoritesOnly = !showFavoritesOnly"
              class="text-xs px-3 py-1.5 rounded-lg transition-all font-medium border"
              :class="showFavoritesOnly ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent shadow-sm' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'">
              {{ showFavoritesOnly ? '★ Favoris' : '☆ Tout' }}
            </button>
          </div>

          <LoadingSpinner v-if="initialLoading" />

          <div v-else-if="filteredPosts.length === 0"
            class="text-center py-12 text-gray-400 dark:text-zinc-600">
            <p v-if="showFavoritesOnly && favoriteChannels.length === 0">Suivez des espaces pour voir leurs publications ici.</p>
            <p v-else-if="showFavoritesOnly">Aucune publication dans vos espaces favoris.</p>
            <p v-else>Aucune publication.</p>
          </div>

          <article v-for="post in filteredPosts" :key="post.id"
            class="group bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200/60 dark:border-zinc-800/60 hover:border-gray-300 dark:hover:border-zinc-700 transition-all duration-200 relative"
            :class="selectedPost?.id === post.id ? 'ring-2 ring-zinc-400/40 dark:ring-zinc-500/40' : ''">

            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <UserAvatar :user="post.author" sizeClass="h-10 w-10 rounded-full" />
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                    {{ getUserName(post.author) }}
                    <span v-if="isMe(post.author)" class="px-1.5 py-0.5 rounded-md text-[10px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold uppercase tracking-wide">Vous</span>
                  </h3>
                  <div class="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-zinc-500">
                    <span>{{ formatDate(post.createdAt) }}</span>
                    <span v-if="post.channel" class="flex items-center gap-1">
                      <span class="text-gray-300 dark:text-zinc-700">·</span>
                      <NuxtLink v-if="getChannel(post.channel)" :to="`/channels/${getChannel(post.channel).slug}`"
                        class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors" @click.stop>
                        #{{ getChannel(post.channel).name }}
                      </NuxtLink>
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="isMe(post.author)" class="relative">
                <button @click.stop="openMenuId = openMenuId === post.id ? null : post.id"
                  class="p-1.5 text-gray-400 hover:text-gray-600 dark:text-zinc-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                <div v-if="openMenuId === post.id"
                  class="absolute right-0 top-10 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg z-20 min-w-[140px] p-1">
                  <button @click.stop="startEditing(post)"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition font-medium">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                  <button @click.stop="handleDeletePost(post)"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition font-medium">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>

            <!-- Media -->
            <div v-if="post.media && post.media.length > 0" class="mb-4 grid gap-2"
              :class="post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'">
              <AuthImage v-for="(media, index) in post.media" :key="index" :media="media"
                img-class="rounded-xl w-full object-cover border border-gray-100 dark:border-zinc-800 max-h-[350px]"
                alt="Média de la publication" />
            </div>

            <!-- Body -->
            <div v-if="editingPostId === post.id" class="mb-4">
              <textarea v-model="editingBody" rows="3"
                class="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500/30 focus:border-zinc-500/50 outline-none resize-none transition-all"></textarea>
              <div class="flex items-center gap-2 mt-2 justify-end">
                <button @click="cancelEditing"
                  class="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 bg-gray-100 dark:bg-zinc-800 rounded-lg transition-colors">
                  Annuler
                </button>
                <button @click="saveEditing(post)" :disabled="!editingBody.trim()"
                  class="px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Enregistrer
                </button>
              </div>
            </div>
            <p v-else-if="post.body" class="text-gray-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{{ post.body }}</p>

            <!-- Actions -->
            <div class="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-zinc-800/60">
              <button @click.stop="selectedPost = post"
                class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {{ commentCounts[post.id] > 0 ? commentCounts[post.id] : '' }}
              </button>

              <button @click.stop="toggleLike(post)"
                class="flex items-center gap-1.5 text-xs font-medium transition-colors"
                :class="hasLiked(post) ? 'text-pink-500' : 'text-gray-500 dark:text-zinc-500 hover:text-pink-500'">
                <svg class="h-4 w-4" :class="hasLiked(post) ? 'fill-current' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {{ getReactionCount(post) || '' }}
              </button>
            </div>
          </article>
        </div>
      </div>

      <!-- Comments panel -->
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="max-w-0"
        enter-to-class="max-w-[26rem]" leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="max-w-[26rem]" leave-to-class="max-w-0">
        <aside v-if="selectedPost"
          class="hidden xl:flex flex-col w-[26rem] overflow-hidden border-l border-gray-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 flex-shrink-0">
          <div class="border-b border-gray-200/60 dark:border-zinc-800/60 p-4 flex items-center justify-between sticky top-0 z-10 bg-white dark:bg-zinc-900">
            <h3 class="font-semibold text-sm text-gray-800 dark:text-zinc-200">Commentaires</h3>
            <button @click="selectedPost = null"
              class="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <PostThread :post="selectedPost" @comment-added="onCommentAdded" />
          </div>
        </aside>
      </Transition>

      <!-- Mobile comments modal -->
      <div v-if="selectedPost"
        class="xl:hidden fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm"
        @click="selectedPost = null">
        <div class="bg-white dark:bg-zinc-900 w-full sm:max-w-2xl sm:rounded-2xl max-h-[80vh] overflow-y-auto" @click.stop>
          <div class="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-200/60 dark:border-zinc-800/60 p-4 flex justify-between items-center">
            <h3 class="font-semibold text-sm">Commentaires</h3>
            <button @click="selectedPost = null" class="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <PostThread :post="selectedPost" @comment-added="onCommentAdded" />
        </div>
      </div>

    </template>
    <template v-else>
      <div class="w-full h-full overflow-y-auto custom-scrollbar">

        <!-- Hero Section -->
        <section class="relative flex flex-col items-center justify-center text-center px-6 py-28 lg:py-36">
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-20 left-1/4 w-72 h-72 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
            <div class="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-200/25 dark:bg-indigo-900/15 rounded-full blur-3xl"></div>
            <div class="absolute top-1/2 right-1/3 w-64 h-64 bg-sky-200/20 dark:bg-sky-900/10 rounded-full blur-3xl"></div>
          </div>

          <div class="relative z-10 max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/40 bg-blue-50/80 dark:bg-blue-950/30 text-xs font-medium text-blue-600 dark:text-blue-400 mb-8 backdrop-blur-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Plateforme open source
            </div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight leading-tight mb-6">
              Communiquez <br class="hidden sm:block">simplement.
            </h1>
            <p class="text-lg text-gray-500 dark:text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Nexum réunit vos équipes dans un espace de discussion intuitif. Salons, publications, commentaires — tout ce dont vous avez besoin, sans superflu.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
              <NuxtLink to="/register" class="px-7 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold text-sm transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 w-full sm:w-auto">
                Créer un compte
              </NuxtLink>
              <NuxtLink to="/login" class="px-7 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all w-full sm:w-auto">
                Se connecter
              </NuxtLink>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="px-6 py-20 border-t border-gray-100 dark:border-zinc-900">
          <div class="max-w-5xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-4">Tout est pensé pour la simplicité</h2>
              <p class="text-gray-500 dark:text-zinc-500 max-w-lg mx-auto">Des outils essentiels, une interface épurée. Rien de trop.</p>
            </div>

            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Feature 1 -->
              <div class="p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-zinc-100 mb-2">Salons de discussion</h3>
                <p class="text-sm text-gray-500 dark:text-zinc-500 leading-relaxed">Créez des salons thématiques pour organiser vos conversations par projet, équipe ou sujet.</p>
              </div>

              <!-- Feature 2 -->
              <div class="p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-zinc-100 mb-2">Publications & médias</h3>
                <p class="text-sm text-gray-500 dark:text-zinc-500 leading-relaxed">Partagez du texte et des images. Vos publications sont visibles par tous les membres du salon.</p>
              </div>

              <!-- Feature 3 -->
              <div class="p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-zinc-100 mb-2">Favoris & flux personnalisé</h3>
                <p class="text-sm text-gray-500 dark:text-zinc-500 leading-relaxed">Suivez vos salons préférés et retrouvez un fil d'actualité filtré selon vos centres d'intérêt.</p>
              </div>

              <!-- Feature 4 -->
              <div class="p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                <div class="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5 text-pink-500 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-zinc-100 mb-2">Réactions & commentaires</h3>
                <p class="text-sm text-gray-500 dark:text-zinc-500 leading-relaxed">Réagissez aux publications, commentez et engagez la conversation avec votre communauté.</p>
              </div>

              <!-- Feature 5 -->
              <div class="p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                <div class="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-zinc-100 mb-2">Recherche globale</h3>
                <p class="text-sm text-gray-500 dark:text-zinc-500 leading-relaxed">Retrouvez n'importe quel utilisateur, salon ou publication en un instant grâce à la recherche intégrée.</p>
              </div>

              <!-- Feature 6 -->
              <div class="p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-zinc-100 mb-2">Mode sombre</h3>
                <p class="text-sm text-gray-500 dark:text-zinc-500 leading-relaxed">Interface adaptée à vos préférences avec un thème clair et sombre, pour un confort visuel optimal.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="px-6 py-20 border-t border-gray-100 dark:border-zinc-900">
          <div class="max-w-2xl mx-auto text-center">
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-4">Prêt à rejoindre la conversation ?</h2>
            <p class="text-gray-500 dark:text-zinc-500 mb-8">Créez votre compte en quelques secondes et commencez à échanger avec votre communauté.</p>
            <NuxtLink to="/register" class="inline-flex px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold text-sm transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95">
              Commencer gratuitement
            </NuxtLink>
          </div>
        </section>

        <!-- Footer -->
        <footer class="px-6 py-8 border-t border-gray-100 dark:border-zinc-900 text-center">
          <p class="text-xs text-gray-400 dark:text-zinc-600">Nexum — Projet universitaire IUT · {{ new Date().getFullYear() }}</p>
        </footer>
      </div>
    </template>
  </div>
</template>
