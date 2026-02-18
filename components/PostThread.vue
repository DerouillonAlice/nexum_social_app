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
  <div class="flex flex-col h-full">
    <div class="p-6 pb-6 border-b border-gray-200 dark:border-white/5 shrink-0">
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center gap-3">
          <UserAvatar :user="post.author" sizeClass="h-8 w-8" />
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {{ getUserName(post.author) }}
              <span v-if="isMe(post.author)"
                class="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 font-medium">Vous</span>
            </h3>
            <div class="flex items-center gap-2 text-[10px] text-gray-500 dark:text-slate-500">
              <span>{{ formatDate(post.createdAt) }}</span>
              <span v-if="post.channel">
                • <NuxtLink v-if="getChannel(post.channel)" :to="`/channels/${getChannel(post.channel).slug}`"
                  class="text-blue-400 hover:text-blue-300 hover:underline transition-colors">{{
                    getChannel(post.channel).name }}</NuxtLink>
              </span>
            </div>
          </div>
        </div>
      </div>
      <p class="text-gray-700 dark:text-slate-300 text-xs mb-3 line-clamp-3">
        {{ post.body }}
      </p>
    </div>

    <div class="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
      <div v-for="comment in comments" :key="comment['@id'] || comment.id" class="flex gap-3 w-full"
        :class="[isMe(comment.author) ? 'flex-row-reverse' : 'flex-row']">
        <UserAvatar v-if="!isMe(comment.author)" :user="comment.author" sizeClass="h-8 w-8 mt-1" />
        <div class="flex flex-col max-w-[85%]" :class="[isMe(comment.author) ? 'items-end' : 'items-start']">
          <h4 class="text-[10px] font-bold text-gray-600 dark:text-slate-400 mb-1 px-1"
            :class="[isMe(comment.author) ? 'text-right' : 'text-left']">
            {{ isMe(comment.author) ? 'Vous' : getUserName(comment.author) }}
          </h4>
          <div class="p-3 text-sm wrap-break-word relative group transition-all duration-200" :class="[
            isMe(comment.author)
              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
              : 'bg-gray-200 dark:bg-[#2a2d3d] text-gray-900 dark:text-slate-200 rounded-2xl rounded-tl-sm'
          ]">
            {{ comment.body }}
          </div>
          <span class="text-[10px] text-gray-500 dark:text-slate-500 mt-1 px-1">
            {{ comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }) : '' }}
          </span>
        </div>
      </div>
    </div>

    <div
      class="p-6 border-t border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-[#0f111a]/30 backdrop-blur-sm shrink-0">
      <form @submit.prevent="submitComment" class="relative">
        <input v-model="newComment" type="text"
          class="w-full bg-gray-200 dark:bg-[#151725] border border-gray-300 dark:border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition"
          :placeholder="`Répondre à ${getUserName(post.author).split(' ')[0]}...`" :disabled="isSendingComment">
        <button type="submit" :disabled="isSendingComment || !newComment.trim()"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed">
          <svg class="h-5 w-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
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