export const useAPI = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore() 

  const request = async (url, options = {}) => {
    const baseURL = options.ignoreSlug 
      ? config.public.apiBaseUrl 
      : `${config.public.apiBaseUrl}/${config.public.slug}`

    const headers = {
      Accept: 'application/json',
      ...options.headers
    }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    return await $fetch(url, {
      baseURL,
      headers,
      ...options,
      async onResponseError({ response }) {
        if (response.status === 401) {
          authStore.clearAuth()
          navigateTo('/login')
        }
      }
    })
  }

  const login = async (email, password) => {
    const data = await request('/login', {
      method: 'POST',
      body: { email, password },
      ignoreSlug: true 
    })
    
    if (data.token) {
       authStore.token = data.token 
       const user = await request('/users/me')
       authStore.setAuth(data.token, user)
    }
  }

  const logout = () => {
    authStore.clearAuth()
    navigateTo('/login')
  }

  return { request, login, logout }
}