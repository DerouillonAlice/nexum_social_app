export const useAPI = () => {
  const config = useRuntimeConfig()
  const token = useCookie('token', { maxAge: 60 * 60 * 24 * 7 }) 
  const user = useState('user', () => null) 

  const request = async (url, options = {}) => {
    const baseURL = options.ignoreSlug 
      ? config.public.apiBaseUrl 
      : `${config.public.apiBaseUrl}/${config.public.slug}`

    const headers = {
      Accept: 'application/json',
      ...options.headers
    }

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    return await $fetch(url, {
      baseURL,
      headers,
      ...options,
      async onResponseError({ response }) {
        if (response.status === 401) {
          token.value = null
          user.value = null
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
        token.value = data.token
        await fetchUser()
    }
  }

  const fetchUser = async () => {
    if (!token.value) return
    user.value = await request('/users/me')
  }

  const logout = () => {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  return {
    token,
    user,
    request,
    login,
    logout,
    fetchUser
  }
}