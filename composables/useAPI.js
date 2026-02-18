export const useAPI = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore() 

  const request = async (url, options = {}) => {
    const baseURL = options.ignoreSlug 
      ? config.public.apiBaseUrl 
      : `${config.public.apiBaseUrl}/${config.public.slug}`

    const headers = {
       Accept: 'application/ld+json',
      'Content-Type': 'application/ld+json',
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
          const route = useRoute()
          if (route.path !== '/login') {
            authStore.clearAuth()
            navigateTo('/login')
          }
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
    
    authStore.setToken(data.token)

    try {
      const userList = await request('/users', { 
        query: { email: email },
        ignoreSlug: true 
      })
      
      console.log('Login: users found for email', email, userList)

      let myProfile = null
      let page = 1
      let searchActive = true

      const firstPageResults = userList.member || userList['hydra:member'] || []
      myProfile = firstPageResults.find(u => u.email === email)

      let nextLink = userList.view?.next || userList['hydra:view']?.['hydra:next']
      
      while (!myProfile && searchActive && nextLink) {
          page++
          try {
            console.log(`Login: searching profile on page ${page}...`)
            const nextPage = await request('/users', { 
               ignoreSlug: true,
               query: { page: page }
            })
            const nextResults = nextPage.member || nextPage['hydra:member'] || []
            myProfile = nextResults.find(u => u.email === email)
            
            nextLink = nextPage.view?.next || nextPage['hydra:view']?.['hydra:next']
            if (!nextLink) searchActive = false
          } catch (err) {
            console.error("Erreur pagination login", err)
            searchActive = false
          }
      }

      console.log('Login: selected profile', myProfile)
      
      if (myProfile) {
        authStore.setAuth(data.token, myProfile) 
      } 
    } catch (e) {
      console.error("Erreur récupération profil", e)
    }
  }

  const logout = () => {
    authStore.clearAuth()
    navigateTo('/login')
  }

  const register = async (email, password, displayName) => {
    const code = config.public.registrationCode || '' 
    
    await request('/register', {
      method: 'POST',
      body: { 
        email, 
        password, 
        displayName,
        codeInscription: code 
      },
      ignoreSlug: true 
    })
  }

  const uploadMedia = async (file, additionalFields = {}) => {
    const formData = new FormData()
    formData.append('file', file)
    
    Object.keys(additionalFields).forEach(key => {
      formData.append(key, additionalFields[key])
    })

    if (authStore.user && (authStore.user['@id'] || authStore.user.id)) {
        const userId = authStore.user['@id'] || `/api/users/${authStore.user.id}`
        if (!formData.has('owner')) {
             formData.append('owner', userId)
        }
    }

    const baseURL = `${config.public.apiBaseUrl}/${config.public.slug}`
    
    const headers = {
      Accept: 'application/ld+json'
    }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    return await $fetch('/media', {
      baseURL,
      method: 'POST',
      body: formData,
      headers,
      async onResponseError({ response }) {
        console.error('Upload Error Response:', response._data)
        if (response.status === 401) {
          authStore.clearAuth()
          navigateTo('/login')
        }
      }
    })
  }

  const updateUser = async (userId, data) => {
    const id = typeof userId === 'string' && userId.includes('/')
      ? userId.split('/').pop()
      : userId

    const baseURL = config.public.apiBaseUrl
    
    const headers = {
      'Content-Type': 'application/merge-patch+json',
      'Accept': 'application/ld+json'
    }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    return await $fetch(`/users/${id}`, {
      baseURL,
      method: 'PATCH',
      body: data,
      headers,
      async onResponseError({ response }) {
        if (response.status === 401) {
          authStore.clearAuth()
          navigateTo('/login')
        }
      }
    })
  }

  const getCurrentUser = async () => {
    const userId = authStore.user?.['@id'] || authStore.user?.id
    if (!userId) return null

    const id = typeof userId === 'string' && userId.includes('/')
      ? userId.split('/').pop()
      : userId

    const user = await request(`/users/${id}`, {
      ignoreSlug: true
    })

    authStore.user = user
    return user
  }

  return { request, login, logout, register, uploadMedia, updateUser, getCurrentUser }

}