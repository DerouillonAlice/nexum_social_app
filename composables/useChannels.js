export const useChannels = () => {
    const { request } = useAPI()
    const channels = useState('channels', () => [])
    
    const fetchChannels = async () => {

        try {
            const data = await request('/channels')
            channels.value = data.member || data['hydra:member'] || []
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
    
    return {
        channels,
        fetchChannels,
        getChannel
    }
}
