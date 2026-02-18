export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    lastChecked: null,
    unreadCount: 0
  }),
  actions: {
    addNotification(notification) {
      // Avoid duplicates based on unique ID (constructed from type + resource ID)
      if (!this.notifications.some(n => n.id === notification.id)) {
        this.notifications.unshift(notification)
        this.unreadCount++
      }
    },
    markAsRead(notificationId) {
      const notif = this.notifications.find(n => n.id === notificationId)
      if (notif && !notif.read) {
        notif.read = true
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
    },
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true)
      this.unreadCount = 0
    },
    clearAll() {
      this.notifications = []
      this.unreadCount = 0
    }
  },
  persist: true
})
