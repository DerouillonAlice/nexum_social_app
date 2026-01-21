export const useUsers = () => {
  const { request } = useAPI()
  
  const users = useState('users', () => [])

  const fetchUsers = async () => {

    try {

      let allUsers = []
      let page = 1
      let hasMore = true
      
      while (hasMore) {
        const data = await request('/users', { 
           ignoreSlug: true,
           query: {
            page: page,
            itemsPerPage: 30 
           }
        })
        
        const pageUsers = data.member || data['hydra:member'] || []
        allUsers = [...allUsers, ...pageUsers]
        
        const nextLink = data.view?.next || data['hydra:view']?.['hydra:next']
        if (nextLink) {
          page++
        } else {
          hasMore = false
        }
      }

      users.value = allUsers
    } catch (e) {
      console.error('DEBUG fetchUsers ERROR:', e)
    }
  }

  const getUserName = (iri) => {
    if (!iri) return 'Anonyme'
    
    let authorId = iri 

    if (typeof iri === 'object') {
      if (iri.displayName) return iri.displayName
      authorId = iri['@id']
    }
    
    if (!authorId) return 'Inconnu'

    const idToCheck = authorId.toString().split('/').pop() 
    const user = users.value.find(u => {
      const uId = u['@id'].split('/').pop()
      return uId === idToCheck
    })
    
    return user ? user.displayName : 'Inconnu'
  }

  return { users, fetchUsers, getUserName }
}