// Nuxt server route: /api/media-proxy/[id]
// Fetches media metadata from the API, then tries to serve the file
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)
  const token = query.token

  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing media ID' })
  }

  const baseApiUrl = `${config.public.apiBaseUrl}/${config.public.slug}`
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  // Step 1: Get media metadata (JSON) to find the path/filename
  let mediaPath = null
  let meta = null
  try {
    meta = await $fetch(`${baseApiUrl}/media/${id}`, {
      headers: { Accept: 'application/ld+json', ...authHeaders }
    })
    mediaPath = meta?.path || null
  } catch (e) {
    throw createError({ statusCode: 404, message: 'Media not found' })
  }

  if (!mediaPath) {
    throw createError({ statusCode: 404, message: 'Media has no path' })
  }

  // Step 2: Try to fetch the actual file from known Symfony public paths
  const domainBase = config.public.apiBaseUrl.replace(/\/api$/, '')
  const candidatePaths = [
    // contentUrl fourni par API Platform (chemin le plus fiable)
    ...(meta?.contentUrl ? [`${domainBase}${meta.contentUrl.startsWith('/') ? '' : '/'}${meta.contentUrl}`] : []),
    `${domainBase}/media/${mediaPath}`,
    `${domainBase}/uploads/media/${mediaPath}`,
    `${domainBase}/uploads/${mediaPath}`,
    `${domainBase}/${mediaPath}`,
  ]

  for (const url of candidatePaths) {
    try {
      const response = await $fetch.raw(url, {
        headers: authHeaders,
        responseType: 'arrayBuffer'
      })
      const contentType = response.headers.get('content-type') || 'application/octet-stream'
      // If we got JSON back, this path doesn't serve the file
      if (contentType.includes('application/json') || contentType.includes('text/html')) continue

      setResponseHeader(event, 'Content-Type', contentType)
      setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
      return new Uint8Array(response._data)
    } catch {
      // Try next path
    }
  }

  throw createError({ statusCode: 404, message: `File not accessible. Path: ${mediaPath}` })
})
