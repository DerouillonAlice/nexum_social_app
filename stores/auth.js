export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
  }),
  actions: {
    setToken(newToken) {
      this.token = newToken
    },
    setUser(newUser) {
      this.user = newUser
    },
    setAuth(newToken, newUser) {
      this.setToken(newToken)
      this.setUser(newUser)
    },
    clearAuth() {
      this.token = null
      this.user = null
      // Also clear old cookies if they exist
      const oldToken = useCookie('auth_token')
      const oldUser = useCookie('auth_user')
      oldToken.value = null
      oldUser.value = null
    },
    // Migration: load from old cookies if persist plugin state is empty
    loadFromCookie() {
      const oldToken = useCookie('auth_token')
      const oldUser = useCookie('auth_user')
      if (oldToken.value && !this.token) {
        this.token = oldToken.value
      }
      if (oldUser.value && !this.user) {
        this.user = oldUser.value
      }
      // Clean up old cookies once migrated
      if (this.token) {
        oldToken.value = null
        oldUser.value = null
      }
    }
  },
  persist: true,
})