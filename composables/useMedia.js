// Cache: publicationId -> array of media objects
const mediaCache = ref({})

export const useMedia = () => {
  const { request } = useAPI()
  const config = useRuntimeConfig()

  /**
   * Fetch all media and cache by publication ID.
   * Also reads media embedded directly in publication objects (post.media array).
   */
  const fetchMediaForPublications = async (publications) => {
    if (!publications || publications.length === 0) return

    // First, read media already embedded in publication objects
    const newCache = { ...mediaCache.value }
    publications.forEach(pub => {
      if (!pub.media || !Array.isArray(pub.media) || pub.media.length === 0) return
      const pubId = pub.id || pub['@id']?.split('/').pop()
      if (!pubId) return
      newCache[pubId] = pub.media
    })
    mediaCache.value = newCache

    // Then fetch from API to get any media not embedded
    try {
      const data = await request('/media', {
        query: { itemsPerPage: 500 }
      })
      const allMedia = data.member || data['hydra:member'] || []

      allMedia.forEach(media => {
        if (!media.publication) return
        const pubId = typeof media.publication === 'object'
          ? (media.publication.id || media.publication['@id']?.split('/').pop())
          : String(media.publication).split('/').pop()
        if (!pubId) return
        if (!mediaCache.value[pubId]) mediaCache.value[pubId] = []
        // Avoid duplicates
        const exists = mediaCache.value[pubId].some(m => (m.id || m['@id']) === (media.id || media['@id']))
        if (!exists) mediaCache.value[pubId].push(media)
      })
    } catch (e) {
      console.error('Failed to fetch media', e)
    }
  }

  /**
   * Get the media items for a given post.
   */
  const getMediaForPost = (post) => {
    const postId = post?.id || post?.['@id']?.split('/').pop()
    if (!postId) return []
    return mediaCache.value[postId] || []
  }

  /**
   * Build the proxied URL for a media item.
   * Uses the Nuxt server route /api/media-proxy/[id] which adds auth token.
   */
  const getMediaUrl = (media) => {
    if (!media) return null
    const id = media.id || media['@id']?.split('/').pop()
    if (!id) return null
    const authStore = useAuthStore()
    const token = authStore.token || ''
    return `/api/media-proxy/${id}?token=${encodeURIComponent(token)}`
  }

  return {
    mediaCache,
    fetchMediaForPublications,
    getMediaForPost,
    getMediaUrl
  }
}
