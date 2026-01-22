import { defineStore } from 'pinia'

export const useChannelStore = defineStore('channels', {
  state: () => ({
    followedByUsers: {} 
  }),
  getters: {
    followed: (state) => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return []
        
        const userId = user['@id'] || user.id
        const key = String(userId)
        
        return state.followedByUsers[key] || []
    }
  },
  actions: {
    getUserId() {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return null
        return String(user['@id'] || user.id)
    },
    follow(channel) {
      const userId = this.getUserId()
      if (!userId) return

      const channelId = channel['@id'] || channel.id || (typeof channel === 'string' ? channel : null)
      if (!channelId) return
      
      if (!this.followedByUsers[userId]) {
          this.followedByUsers[userId] = []
      }
      
      const userFollows = this.followedByUsers[userId]
      if (!userFollows.includes(channelId)) {
        userFollows.push(channelId)
      }
    },
    unfollow(channel) {
      const userId = this.getUserId()
      if (!userId) return

      const channelId = channel['@id'] || channel.id || (typeof channel === 'string' ? channel : null)
      if (!channelId) return

      if (this.followedByUsers[userId]) {
          this.followedByUsers[userId] = this.followedByUsers[userId].filter(id => id !== channelId)
      }
    },
    isFollowing(channel) {
      const userFollows = this.followed
      
      const channelId = channel['@id'] || channel.id || (typeof channel === 'string' ? channel : null)
      if (!channelId) return false
      
      return userFollows.some(id => 
          id === channelId || 
          (typeof id === 'string' && typeof channelId === 'string' && (id.endsWith('/' + channelId) || channelId.endsWith('/' + id)))
      )
    },
    toggle(channel) {
        if (this.isFollowing(channel)) {
            this.unfollow(channel)
        } else {
            this.follow(channel)
        }
    }
  },
  persist: true
})
