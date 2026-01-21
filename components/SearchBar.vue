<script setup>
const { 
  searchQuery, 
  searchResults, 
  isSearching, 
  showResults, 
  handleSearch, 
  clearSearch 
} = useSearch()
</script>

<template>
    <div class="flex-1 max-w-xl relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          v-model="searchQuery"
          @input="handleSearch"
          type="text" 
          class="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder="Rechercher une discussion, un collègue..."
        >

         <div v-if="showResults" class="absolute left-0 right-0 mt-2 bg-[#1a1d2d] border border-white/10 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div v-if="isSearching" class="p-4 text-center text-slate-500 text-sm">
                Recherche en cours...
            </div>
            <div v-else-if="!searchResults.users.length && !searchResults.channels.length && !searchResults.posts.length" class="p-4 text-center text-slate-500 text-sm">
                Aucun résultat trouvé
            </div>
            <div v-else class="py-2">
                <div v-if="searchResults.users.length > 0" class="mb-2">
                    <h4 class="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateurs</h4>
                    <button 
                        v-for="user in searchResults.users" 
                        :key="user.id" 
                        class="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-3 transition-colors"
                        @click="clearSearch"
                    >
                        <UserAvatar :user="user" sizeClass="h-6 w-6" />
                        <span class="text-sm text-slate-200">{{ user.displayName || user.username }}</span>
                    </button>
                </div>

                <div v-if="searchResults.channels.length > 0" class="mb-2">
                    <h4 class="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salons</h4>
                    <NuxtLink 
                        v-for="channel in searchResults.channels" 
                        :key="channel.id" 
                        :to="`/channels/${channel.slug}`"
                        class="block px-4 py-2 hover:bg-white/5 transition-colors"
                         @click.native="clearSearch"
                    >
                        <div class="flex items-center gap-2">
                             <span class="text-slate-400">#</span>
                             <span class="text-sm text-slate-200">{{ channel.name }}</span>
                        </div>
                    </NuxtLink>
                </div>

                <div v-if="searchResults.posts.length > 0">
                    <h4 class="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Messages</h4>
                    <button 
                        v-for="post in searchResults.posts" 
                        :key="post.id" 
                         class="w-full text-left px-4 py-2 hover:bg-white/5 block transition-colors"
                         @click="clearSearch"
                    >
                        <div class="flex items-center gap-2 mb-1">
                             <UserAvatar :user="post.author" sizeClass="h-4 w-4" />
                             <span class="text-xs text-slate-400">{{ post.author?.displayName || 'Anonyme' }}</span>
                        </div>
                        <p class="text-sm text-slate-300 line-clamp-1 break-all">{{ post.body }}</p>
                    </button>
                </div>
            </div>
        </div>
      </div>
</template>
