export const useNotifications = () => {
  const { request } = useAPI()
  const authStore = useAuthStore()
  const notifStore = useNotificationsStore()
  const pollingInterval = ref(null)

  const checkForNewNotifications = async () => {
    if (!authStore.user) return

    try {
      // 1. Fetch my posts to know what to watch
      const myId = authStore.user['@id'] || `/api/users/${authStore.user.id}`
      const postsData = await request('/publications', {
        query: { author: myId } // Assuming API supports filtering by author
      })
      const myPosts = postsData.member || postsData['hydra:member'] || []
      const myPostIds = myPosts.map(p => p['@id'] || `/api/publications/${p.id}`)

      if (myPostIds.length === 0) return

      // 2. Fetch recent comments on my posts
      // Since API doesn't allow complex filtering, we might need to fetch all recent comments 
      // or iterate. For optimization, let's fetch global recent comments and filter client-side 
      // (Not ideal but consistent with "client-side notifications" plan)
      // BETTER: if API allows, filter comments where publication.author is me.
      // If not, we fetch comments for my posts.
      
      // Let's try fetching comments sorted by date desc
      const commentsData = await request('/comments', {
        query: { 
          'order[createdAt]': 'desc',
          itemsPerPage: 50 // Check last 50 comments
        }
      })
      const recentComments = commentsData.member || commentsData['hydra:member'] || []

      recentComments.forEach(comment => {
        // Check if comment is on one of my posts
        const postRef = comment.publication
        const postIri = typeof postRef === 'object' ? (postRef['@id'] || `/api/publications/${postRef.id}`) : postRef
        
        if (myPostIds.includes(postIri)) {
           // It's a comment on my post.
           // Check if author is NOT me
           const authorRef = comment.author
           const authorId = typeof authorRef === 'object' ? (authorRef['@id'] || `/api/users/${authorRef.id}`) : authorRef
           
           if (authorId !== myId) {
             const notifId = `comment_${comment.id}`
             const existing = notifStore.notifications.some(n => n.id === notifId)
             
             // Simple check: if not exists, add it.
             // Ideally we should check if it's newer than lastChecked, but for now ID check handles duplicates.
             if (!existing) {
               notifStore.addNotification({
                 id: notifId,
                 type: 'comment',
                 actor: comment.author, // detailed object hopefully
                 publication: comment.publication,
                 createdAt: comment.createdAt,
                 read: false,
                 body: comment.body
               })
             }
           }
        }
      })

      // 3. Fetch recent reactions (likes)
      const reactionsData = await request('/reactions', {
        query: {
           type: 'like',
           itemsPerPage: 50 
           // API doesn't support order by createdAt usually for reactions unless configured
        }
      })
      
      const recentReactions = reactionsData.member || reactionsData['hydra:member'] || []
      
       recentReactions.forEach(reaction => {
        const postRef = reaction.publication
        const postIri = typeof postRef === 'object' ? (postRef['@id'] || `/api/publications/${postRef.id}`) : postRef
        
         if (myPostIds.includes(postIri)) {
           const authorRef = reaction.author
           const authorId = typeof authorRef === 'object' ? (authorRef['@id'] || `/api/users/${authorRef.id}`) : authorRef

           if (authorId !== myId) {
             const notifId = `like_${reaction.id || 'unknown_' + Date.now()}` // fallback if no ID
             // If reaction has no ID (sometimes happens with specific API configs), generate one from composite key
              const compositeId = `like_${postIri}_${authorId}`
             
             if (!notifStore.notifications.some(n => n.id === (reaction.id ? `like_${reaction.id}` : compositeId))) {
               notifStore.addNotification({
                 id: reaction.id ? `like_${reaction.id}` : compositeId,
                 type: 'like',
                 actor: reaction.author,
                 publication: reaction.publication,
                 createdAt: Date.now(), // Reactions might not have createdAt, default to now
                 read: false
               })
             }
           }
        }
      })
      
      notifStore.lastChecked = Date.now()

    } catch (e) {
      console.error('Error polling notifications', e)
    }
  }

  const startPolling = () => {
    checkForNewNotifications() // Initial check
    pollingInterval.value = setInterval(checkForNewNotifications, 30000) // 30s
  }

  const stopPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  return {
    startPolling,
    stopPolling,
    checkForNewNotifications
  }
}
