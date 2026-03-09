<script setup>
const { 
  searchQuery, 
  searchResults, 
  isSearching, 
  showResults, 
  handleSearch, 
  clearSearch 
} = useSearch()

// Extract numeric ID from user object
const getUserId = (user) => {
  if (user['@id']) {
    return user['@id'].split('/').pop()
  }
  return user.id
}
</script>

<template>
    <div class="flex-1 max-w-xl relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-gray-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          v-model="searchQuery"
          @input="handleSearch"
          type="text" 
          class="block w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 transition"
          placeholder="Rechercher..."
        >

         <div v-if="showResults" class="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
            <div v-if="isSearching" class="p-4 text-center text-gray-400 dark:text-zinc-600 text-sm">
                Recherche en cours...
            </div>
            <div v-else-if="!searchResults.users.length && !searchResults.channels.length && !searchResults.posts.length" class="p-4 text-center text-gray-400 dark:text-zinc-600 text-sm">
                Aucun résultat trouvé
            </div>
            <div v-else class="py-2">
                <div v-if="searchResults.users.length > 0" class="mb-2">
                    <h4 class="px-4 py-1 text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-wider">Utilisateurs</h4>
                    <NuxtLink 
                        v-for="user in searchResults.users" 
                        :key="user.id"
                        :to="`/profile/${getUserId(user)}`"
                        class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                        @click="clearSearch"
                    >
                        <UserAvatar :user="user" sizeClass="h-6 w-6" />
                        <span class="text-sm text-gray-700 dark:text-zinc-300">{{ user.displayName || user.username }}</span>
                    </NuxtLink>
                </div>

                <div v-if="searchResults.channels.length > 0" class="mb-2">
                    <h4 class="px-4 py-1 text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-wider">Salons</h4>
                    <NuxtLink 
                        v-for="channel in searchResults.channels" 
                        :key="channel.id" 
                        :to="`/channels/${channel.slug}`"
                        class="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                         @click.native="clearSearch"
                    >
                        <div class="flex items-center gap-2">
                             <span class="text-zinc-500 dark:text-zinc-400 text-sm">#</span>
                             <span class="text-sm text-gray-700 dark:text-zinc-300">{{ channel.name }}</span>
                        </div>
                    </NuxtLink>
                </div>

                <div v-if="searchResults.posts.length > 0">
                    <h4 class="px-4 py-1 text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-wider">Messages</h4>
                    <button 
                        v-for="post in searchResults.posts" 
                        :key="post.id" 
                         class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 block transition-colors"
                         @click="clearSearch"
                    >
                        <div class="flex items-center gap-2 mb-1">
                             <UserAvatar :user="post.author" sizeClass="h-4 w-4" />
                             <span class="text-xs text-gray-400 dark:text-zinc-500">{{ post.author?.displayName || 'Anonyme' }}</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-zinc-400 line-clamp-1 break-all">{{ post.body }}</p>
                    </button>
                </div>
            </div>
        </div>
      </div>
</template>
