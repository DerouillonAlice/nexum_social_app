export const useMessages = () => {
  const { request } = useAPI()
  const config = useRuntimeConfig()
  
  const messages = ref([])
  const isLoading = ref(false)
  const isSending = ref(false)

  const fetchMessages = async (channelSlug) => {
    isLoading.value = true
    try {
      const data = await request('/publications', {
        query: { 
          'channel.slug': channelSlug, 
          'order[createdAt]': 'asc' 
        } 
      })
      messages.value = data.member || data['hydra:member'] || []
    } catch (e) {
      console.error("Erreur chargement messages", e)
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (channelSlug, content) => {
    if (!content.trim() || isSending.value) return false

    isSending.value = true
    try {

      const channelIRI = `/api/${config.public.slug}/channels/${channelSlug}`

      await request('/publications', {
        method: 'POST',
        body: {
          title: 'Message',
          body: content,
          channel: channelIRI
        }
      })
      
      await fetchMessages(channelSlug)
      return true 
    } catch (e) {
      return false
    } finally {
      isSending.value = false
    }
  }

  return {
    messages,
    isLoading,
    isSending,
    fetchMessages,
    sendMessage
  }
}