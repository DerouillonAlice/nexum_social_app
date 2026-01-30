export const useMessages = () => {
  const { request } = useAPI()
  const config = useRuntimeConfig()
  
  const messages = ref([])
  const isLoading = ref(false)
  const isSending = ref(false)

  const fetchMessages = async (channel) => {
    isLoading.value = true
    try {
      let filter = {}
      if (typeof channel === 'string') {
          if (channel.includes('/')) {
              filter['channel'] = channel
          } else {
              filter['channel.slug'] = channel
          }
      } else if (channel && (channel['@id'] || channel.id)) {
           filter['channel'] = channel['@id'] || channel.id
      }
      
      const data = await request('/publications', {
        query: { 
          ...filter,
          'order[createdAt]': 'asc' 
        } 
      })

      const rawMessages = data.member || data['hydra:member'] || []
      
      const targetChannelId = (typeof channel === 'object' ? (channel['@id'] || channel.id) : filter['channel'] || filter['channel.slug'])
      
      messages.value = rawMessages.filter(msg => {
          if (!msg.channel) return false
          const msgChannelId = typeof msg.channel === 'object' ? (msg.channel['@id'] || msg.channel.id) : msg.channel
          
          if (filter['channel.slug']) {
              if (typeof msg.channel === 'object' && msg.channel.slug) {
                  return msg.channel.slug === filter['channel.slug']
              }
          }
          
          if (targetChannelId && msgChannelId) {
             return targetChannelId === msgChannelId || msgChannelId.endsWith(targetChannelId) || targetChannelId.endsWith(msgChannelId)
          }
          
          return true
      })
    } catch (e) {
      console.error("Erreur chargement messages", e)
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (channel, content, file = null) => {
    if ((!content.trim() && !file) || isSending.value) return false

    isSending.value = true
    try {
      let channelIRI = ''
      if (typeof channel === 'string') {
         if (channel.includes('/')) {
             channelIRI = channel
         } else {
             channelIRI = `/api/${config.public.slug}/channels/${channel}`
         }
      } else if (channel && (channel['@id'] || channel.id)) {
          channelIRI = channel['@id'] || channel.id
      }

      const publication = await request('/publications', {
        method: 'POST',
        body: {
          title: 'Message',
          body: content,
          channel: channelIRI
        }
      })
      
      if (file && publication) {
        try {
          const publicationIri = publication['@id'] || publication.id
          await useAPI().uploadMedia(file, { publication: publicationIri })
        } catch (mediaError) {
          console.error("Erreur upload media", mediaError)
        }
      }
      
      await fetchMessages(channel)
      return true 
    } catch (e) {
      console.error("Erreur envoi message", e)
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