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
const { getChannel } = useChannels()

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
    const config = useRuntimeConfig()
    const route = useRoute()
    const slug = route.params.slug || config.public.slug

    const publicationIri = props.post['@id']
      || (props.post.id ? `/api/${slug}/publications/${props.post.id}` : null)

    if (!publicationIri) return

    const data = await request('/comments', {
      query: {
        publication: publicationIri,
        'order[createdAt]': 'asc'
      }
    })

    const rawComments = data.member || data['hydra:member'] || []

    comments.value = rawComments.filter(comment => {
      const parentRef = comment.publication || comment.parent

      if (!parentRef) return false

      const commentParentId = typeof parentRef === 'object'
        ? (parentRef['@id'] || parentRef.id)
        : parentRef

      const cId = String(commentParentId).split('/').pop()
      const pId = String(props.post.id || (props.post['@id'] ? props.post['@id'].split('/').pop() : ''))

      return cId === pId
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
    const config = useRuntimeConfig()
    const route = useRoute()
    const slug = route.params.slug || config.public.slug

    const publicationIri = props.post['@id']
      || (props.post.id ? `/api/${slug}/publications/${props.post.id}` : null)

    console.log('PostThread: Submitting comment', { publicationIri, body: newComment.value })

    if (!publicationIri) {
      console.error("No publication IRI found", props.post)
      return
    }

    const response = await request('/comments', {
      method: 'POST',
      body: {
        body: newComment.value,
        publication: publicationIri
      }
    })

    console.log('PostThread: Comment submitted', response)


    if (response) {
      comments.value.push(response)
      emit('comment-added')
    }

    newComment.value = ''
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
  <div class="flex flex-col h-full bg-white dark:bg-[#09090b] relative">
    <!-- Main Post Content (Pinned at top) -->
    <div
      class="p-6 border-b border-gray-100 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-3">
          <UserAvatar :user="post.author" sizeClass="h-10 w-10 rounded-xl" />
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              {{ getUserName(post.author) }}
              <span v-if="isMe(post.author)"
                class="px-1.5 py-0.5 rounded-md text-[10px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold uppercase tracking-wide">Vous</span>
            </h3>
            <div class="flex items-center gap-2 text-[11px] font-medium text-gray-500 dark:text-zinc-500">
              <span>{{ formatDate(post.createdAt) }}</span>
              <span v-if="post.channel">
                • <NuxtLink v-if="getChannel(post.channel)" :to="`/channels/${getChannel(post.channel).slug}`"
                  class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 hover:underline transition-colors">{{
                    getChannel(post.channel).name }}</NuxtLink>
              </span>
            </div>
          </div>
        </div>
      </div>
      <p class="text-gray-800 dark:text-zinc-300 text-sm leading-relaxed">
        {{ post.body }}
      </p>

      <!-- Media in thread view -->
      <div v-if="post.media && post.media.length > 0" class="mt-3 grid gap-2"
        :class="post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'">
        <AuthImage v-for="(media, index) in post.media" :key="index" :media="media"
          img-class="rounded-xl w-full object-cover border border-gray-100 dark:border-zinc-800 max-h-[200px]"
          alt="Média" />
      </div>
    </div>

    <!-- Comments List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-gray-50/50 dark:bg-zinc-950/50">
      <div v-if="comments.length === 0" class="flex flex-col items-center justify-center py-10 text-center opacity-60">
        <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-gray-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500 dark:text-zinc-500">Pas encore de commentaires.<br>Soyez le premier à réagir !</p>
      </div>

      <div v-for="comment in comments" :key="comment['@id'] || comment.id" class="flex gap-3 w-full group"
        :class="[isMe(comment.author) ? 'flex-row-reverse' : 'flex-row']">

        <UserAvatar v-if="!isMe(comment.author)" :user="comment.author" sizeClass="h-8 w-8 mt-auto rounded-lg" />

        <div class="flex flex-col max-w-[85%] min-w-[20%]"
          :class="[isMe(comment.author) ? 'items-end' : 'items-start']">
          <div class="flex items-center gap-2 mb-1 px-1">
            <span class="text-[11px] font-bold text-gray-700 dark:text-zinc-300">
              {{ isMe(comment.author) ? 'Vous' : getUserName(comment.author) }}
            </span>
            <span class="text-[10px] text-gray-400 dark:text-zinc-600">
              {{ comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], {
                hour: '2-digit', minute:
              '2-digit' }) : '' }}
            </span>
          </div>

          <div class="px-4 py-2.5 text-sm shadow-sm relative group-hover:shadow-md transition-shadow duration-200"
            :class="[
              isMe(comment.author)
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl rounded-tr-sm'
                : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-800 dark:text-zinc-300 rounded-2xl rounded-tl-sm'
            ]">
            {{ comment.body }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#09090b] shrink-0">
      <form @submit.prevent="submitComment" class="relative flex items-end gap-2">
        <div class="relative flex-1">
          <textarea v-model="newComment" rows="1"
            class="w-full bg-gray-100 dark:bg-zinc-900 border-0 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-zinc-500/20 resize-none min-h-[48px] max-h-[120px]"
            :placeholder="`Répondre à ${getUserName(post.author).split(' ')[0]}...`" :disabled="isSendingComment"
            @input="(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }"
            @keydown.enter.exact.prevent="submitComment"></textarea>

          <button type="submit" :disabled="isSendingComment || !newComment.trim()"
            class="absolute right-2 bottom-2 p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl transition disabled:opacity-50 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-500 disabled:cursor-not-allowed shadow-md disabled:shadow-none">
            <svg v-if="isSendingComment" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            <svg v-else class="h-4 w-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
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