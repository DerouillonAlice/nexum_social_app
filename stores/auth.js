export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null, 
  }),
  actions: {
    setToken(newToken) {
      this.token = newToken
      const cookieToken = useCookie('auth_token')
      cookieToken.value = newToken
    },
    setUser(newUser) {
      this.user = newUser
      const cookieUser = useCookie('auth_user')
      cookieUser.value = newUser
    },
    loadFromCookie() {
      const cookieToken = useCookie('auth_token')
      const cookieUser = useCookie('auth_user')
      if (cookieToken.value) this.token = cookieToken.value
      if (cookieUser.value) this.user = cookieUser.value
    },
    setAuth(newToken, newUser) {
      this.setToken(newToken)
      this.setUser(newUser)
    },
    clearAuth() {
      this.token = null
      this.user = null
      const cookieToken = useCookie('auth_token')
      const cookieUser = useCookie('auth_user')
      cookieToken.value = null
      cookieUser.value = null
    }
  }
})