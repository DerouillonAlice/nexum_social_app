export const useSearch = () => {
  const { request } = useAPI()

  const searchQuery = ref('')
  const searchResults = ref({ users: [], channels: [], posts: [] })
  const isSearching = ref(false)
  const showResults = ref(false)
  let searchTimeout = null

  const handleSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    
    if (searchQuery.value.length < 2) {
        searchResults.value = { users: [], channels: [], posts: [] }
        showResults.value = false
        return
    }

    showResults.value = true
    isSearching.value = true

    searchTimeout = setTimeout(async () => {
        try {
        const query = searchQuery.value.toLowerCase()
        const [users, channels, posts] = await Promise.all([
            request('/users', { 
                query: { 
                    'displayName': searchQuery.value, 
                    itemsPerPage: 30,
                    page: 1
                },
                ignoreSlug: true
            }).catch(() => null),
            request('/channels', { 
                query: { 
                    'name': searchQuery.value, 
                    itemsPerPage: 30,
                    page: 1
                } 
            }).catch(() => null),
            request('/publications', { 
                query: { 
                    'body': searchQuery.value, 
                    itemsPerPage: 30, 
                    'exists[parent]': 'false',
                    page: 1
                } 
            }).catch(() => null)
        ])

        const filterItems = (items, predicate) => {
            if (!items) return []
            const list = items.member || items['hydra:member'] || []
            return list.filter(predicate).slice(0, 3)
        }

        searchResults.value = {
            users: filterItems(users, u => 
                (u.displayName && u.displayName.toLowerCase().includes(query)) || 
                (u.username && u.username.toLowerCase().includes(query)) ||
                (u.email && u.email.toLowerCase().includes(query))
            ),
            channels: filterItems(channels, c => 
                c.name && c.name.toLowerCase().includes(query)
            ),
            posts: filterItems(posts, p => 
                p.body && p.body.toLowerCase().includes(query)
            )
        }
        } catch (e) {
        console.error('Search error', e)
        } finally {
        isSearching.value = false
        }
    }, 300)
  }

  const clearSearch = () => {
    searchQuery.value = ''
    showResults.value = false
  }

  return {
    searchQuery,
    searchResults,
    isSearching,
    showResults,
    handleSearch,
    clearSearch
  }
}
