export const useChannels = () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    const { request } = useAPI()
    const channels = useState('channels', () => [])
    const favoriteIds = useState('favoriteChannelIds', () => new Set())

    // Charge les favoris depuis l'API /users/{id} (channelsFavoris n'est pas dans le store auth)
    const loadFavoritesFromAPI = async () => {
        if (!authStore.user) return
        try {
            const userId = authStore.user['@id']?.split('/').pop() || authStore.user.id
            if (!userId) return
            const userData = await request(`/users/${userId}`, { ignoreSlug: true })
            const favList = userData?.channelsFavoris || []
            const ids = favList.map(iri => {
                if (typeof iri === 'string') {
                    const match = iri.match(/\/(\d+)$/)
                    return match ? parseInt(match[1]) : null
                }
                return iri.id || null
            }).filter(id => id !== null)
            favoriteIds.value = new Set(ids)
        } catch (e) {
            console.error('Error loading favorites from API', e)
        }
    }

    const fetchChannels = async () => {
        try {
            const data = await request('/channels')
            const rawChannels = data.member || data['hydra:member'] || []
            channels.value = rawChannels

            await loadFavoritesFromAPI()

            return channels.value
        } catch (e) {
            console.error('Error fetching channels', e)
            return []
        }
    }
    
    const getChannel = (iriOrId) => {
        if (!iriOrId) return null
        if (typeof iriOrId === 'object') return iriOrId
        
        return channels.value.find(c => {
             const cId = c['@id'] || `/api/channels/${c.id}` 
             return c['@id'] === iriOrId || c.id == iriOrId || iriOrId.endsWith(`/${c.id}`)
        })
    }
    
    const isFavorite = (channelId) => {
        const id = typeof channelId === 'object' ? channelId.id : channelId
        return favoriteIds.value.has(id)
    }
    
    const toggleFavorite = async (channel) => {
        const channelId = channel.id
        const baseURL = config.public.apiBaseUrl
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        if (authStore.token) {
            headers.Authorization = `Bearer ${authStore.token}`
        }
        
        try {
            if (isFavorite(channelId)) {
                await $fetch(`/channels/${channelId}/favorite`, {
                    baseURL,
                    method: 'DELETE',
                    headers
                })
                favoriteIds.value.delete(channelId)
            } else {
                await $fetch(`/channels/${channelId}/favorite`, {
                    baseURL,
                    method: 'PUT',
                    headers,
                    body: {}
                })
                favoriteIds.value.add(channelId)
            }
            
            favoriteIds.value = new Set(favoriteIds.value)
            return true
        } catch (e) {
            console.error('Error toggling favorite', e)
            throw e
        }
    }
    
    const favoriteChannels = computed(() => {
        return channels.value.filter(c => favoriteIds.value.has(c.id))
    })

    const isChannelOwner = (channel) => {
        if (!authStore.user || !channel) return false
        const myIri = authStore.user['@id'] || `/api/users/${authStore.user.id}`
        const myId = authStore.user.id?.toString() || myIri?.split('/').pop()

        // Check createdBy or owner field
        const ownerField = channel.createdBy || channel.owner || channel.user
        if (!ownerField) return false

        if (typeof ownerField === 'string') {
            const ownerId = ownerField.split('/').pop()
            return ownerId === myId || ownerField === myIri
        }
        if (typeof ownerField === 'object') {
            const ownerId = (ownerField['@id'] || ownerField.id)?.toString().split('/').pop()
            return ownerId === myId
        }
        return false
    }

    const deleteChannel = async (channel) => {
        const channelId = channel.id
        if (!channelId) return false

        try {
            await request(`/channels/${channelId}`, {
                method: 'DELETE'
            })
            // Remove from local state
            channels.value = channels.value.filter(c => c.id !== channelId)
            favoriteIds.value.delete(channelId)
            favoriteIds.value = new Set(favoriteIds.value)
            return true
        } catch (e) {
            console.error('Error deleting channel', e)
            throw e
        }
    }
    
    return {
        channels,
        favoriteIds,
        favoriteChannels,
        fetchChannels,
        getChannel,
        isFavorite,
        toggleFavorite,
        isChannelOwner,
        deleteChannel,
        loadFavoritesFromAPI
    }
}
