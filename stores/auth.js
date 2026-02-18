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
      // Store only essential user fields to keep cookie size small
      if (newUser) {
        this.user = {
          id: newUser.id,
          '@id': newUser['@id'],
          email: newUser.email,
          displayName: newUser.displayName,
          nom: newUser.nom,
          prenom: newUser.prenom,
        }
      } else {
        this.user = null
      }
    },
    setAuth(newToken, newUser) {
      this.setToken(newToken)
      this.setUser(newUser)
    },
    clearAuth() {
      this.token = null
      this.user = null
      // Clean up old cookies from previous approach
      const oldToken = useCookie('auth_token')
      const oldUser = useCookie('auth_user')
      oldToken.value = null
      oldUser.value = null
    },
    // Migration: load token from old cookies if persist plugin state is empty
    loadFromCookie() {
      const oldToken = useCookie('auth_token')
      const oldUser = useCookie('auth_user')
      if (oldToken.value && !this.token) {
        this.token = oldToken.value
      }
      if (oldUser.value && !this.user) {
        try {
          const parsed = typeof oldUser.value === 'string' 
            ? JSON.parse(oldUser.value) 
            : oldUser.value
          this.setUser(parsed)
        } catch (e) {
          // ignore
        }
      }
      // Clean up old cookies
      if (this.token) {
        oldToken.value = null
        oldUser.value = null
      }
    }
  },
  persist: true,
})