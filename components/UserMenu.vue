<script setup>
const props = defineProps({
    user: {
        type: Object,
        required: true
    }
})

const authStore = useAuthStore()
const isMenuOpen = ref(false)

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}

const logout = () => {
    authStore.clearAuth()
    navigateTo('/login')
    isMenuOpen.value = false
}

onMounted(() => {
    document.addEventListener('click', (e) => {
        const el = document.getElementById('user-menu-dropdown')
        const trigger = document.getElementById('user-menu-trigger')
        if (isMenuOpen.value && el && !el.contains(e.target) && !trigger.contains(e.target)) {
            isMenuOpen.value = false
        }
    })
})
</script>

<template>
    <div class="relative">
        <button id="user-menu-trigger" @click="toggleMenu"
            class="flex items-center gap-2 cursor-pointer focus:outline-none p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <UserAvatar :user="user" sizeClass="h-8 w-8" />
            <span class="text-sm font-medium text-gray-700 dark:text-white hidden md:block">{{ user.name }}</span>
            <svg class="h-4 w-4 text-gray-500 dark:text-slate-500 transition-transform duration-200"
                :class="{ 'rotate-180': isMenuOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <div v-if="isMenuOpen" id="user-menu-dropdown"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1d2d] z-10 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
            <a href="#"
                class="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">Paramètres</a>
            <div class="border-t border-gray-100 dark:border-white/5 my-1"></div>
            <button @click="logout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                Se déconnecter
            </button>
        </div>
    </div>
</template>
