<script setup>
const notifStore = useNotificationsStore()
const { getUserName } = useUsers()

const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString()
}

const getIcon = (type) => {
    if (type === 'like') return '❤️'
    if (type === 'comment') return '💬'
    return 'bell'
}

const markAllRead = () => {
    notifStore.markAllAsRead()
}
</script>

<template>
    <div class="max-w-3xl mx-auto py-8 px-4">
        <div class="flex items-center justify-between mb-8">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <button v-if="notifStore.notifications.some(n => !n.read)" @click="markAllRead"
                class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Tout marquer comme lu
            </button>
        </div>

        <div v-if="notifStore.notifications.length === 0" class="text-center py-20">
            <div
                class="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <p class="text-gray-500 dark:text-slate-400">Aucune notification pour le moment</p>
        </div>

        <div v-else class="space-y-4">
            <div v-for="notif in notifStore.notifications" :key="notif.id"
                class="p-4 rounded-xl border transition-colors relative"
                :class="notif.read ? 'bg-white dark:bg-[#151725] border-gray-100 dark:border-white/5' : 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20'">

                <div class="flex gap-4">
                    <UserAvatar :user="notif.actor" sizeClass="h-10 w-10 rounded-full" />

                    <div class="flex-1">
                        <p class="text-sm text-gray-900 dark:text-white">
                            <span class="font-bold">{{ getUserName(notif.actor) }}</span>
                            <span v-if="notif.type === 'like'"> a aimé votre publication</span>
                            <span v-else-if="notif.type === 'comment'"> a commenté votre publication</span>
                        </p>

                        <p v-if="notif.body" class="text-sm text-gray-600 dark:text-slate-400 mt-1 line-clamp-2">
                            "{{ notif.body }}"
                        </p>

                        <span class="text-xs text-gray-400 mt-2 block">{{ formatDate(notif.createdAt) }}</span>
                    </div>

                    <div class="flex items-start gap-2">
                        <span class="text-xl">{{ getIcon(notif.type) }}</span>
                        <button v-if="!notif.read" @click="notifStore.markAsRead(notif.id)"
                            class="w-2 h-2 rounded-full bg-blue-500 mt-2" title="Marquer comme lu"></button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
