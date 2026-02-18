const reactions = ref({})

export const useReactions = () => {
  const { request } = useAPI()
  const authStore = useAuthStore()

  const fetchReactions = async () => {
    try {
      const data = await request('/reactions', {
        query: { itemsPerPage: 500 }
      })
      const allReactions = data.member || data['hydra:member'] || []
      const map = {}

      allReactions.forEach(reaction => {
        if (reaction.publication) {
          const pubId = typeof reaction.publication === 'object'
            ? (reaction.publication.id || reaction.publication['@id']?.split('/').pop())
            : String(reaction.publication).split('/').pop()

          if (pubId) {
            if (!map[pubId]) map[pubId] = []
            map[pubId].push(reaction)
          }
        }
      })

      reactions.value = map
    } catch (e) {
      console.error('Failed to fetch reactions', e)
    }
  }

  const getReactionCount = (post) => {
    const postId = post.id || post['@id']?.split('/').pop()
    return (reactions.value[postId] || []).length
  }

  const hasLiked = (post) => {
    if (!authStore.user) return false
    const postId = post.id || post['@id']?.split('/').pop()
    const postReactions = reactions.value[postId] || []
    const myId = authStore.user['@id'] || `/api/users/${authStore.user.id}`

    return postReactions.some(r => {
      const authorId = typeof r.author === 'object' ? r.author['@id'] : r.author
      return authorId === myId
    })
  }

  const toggleLike = async (post) => {
    if (!authStore.user) return
    const postId = post.id || post['@id']?.split('/').pop()
    const postReactions = reactions.value[postId] || []
    const myId = authStore.user['@id'] || `/api/users/${authStore.user.id}`

    const myReaction = postReactions.find(r => {
      const authorId = typeof r.author === 'object' ? r.author['@id'] : r.author
      return authorId === myId
    })

    if (myReaction) {
      // Optimistic: remove from UI immediately
      const reactionId = myReaction.id || myReaction['@id']?.split('/').pop()
      reactions.value[postId] = postReactions.filter(r => r !== myReaction)
      try {
        await request(`/reactions/${reactionId}`, { method: 'DELETE' })
      } catch (e) {
        console.warn('DELETE reaction error (may be server bug), re-syncing...', e)
        // Re-fetch to get actual state from server
        await fetchReactions()
      }
    } else {
      // Optimistic: add a temporary reaction to UI
      const config = useRuntimeConfig()
      const publicationIri = post['@id']
        || (post.id ? `/api/${config.public.slug}/publications/${post.id}` : null)

      const tempReaction = {
        id: 'temp_' + Date.now(),
        type: 'like',
        author: authStore.user['@id'] || `/api/users/${authStore.user.id}`,
        publication: publicationIri
      }
      if (!reactions.value[postId]) reactions.value[postId] = []
      reactions.value[postId].push(tempReaction)

      try {
        await request('/reactions', {
          method: 'POST',
          body: {
            type: 'like',
            publication: publicationIri
          }
        })
      } catch (e) {
        console.warn('POST reaction error (may be server bug), re-syncing...', e)
      }
      // Always re-fetch to sync with actual server state
      await fetchReactions()
    }
  }

  return {
    reactions,
    fetchReactions,
    getReactionCount,
    hasLiked,
    toggleLike
  }
}
