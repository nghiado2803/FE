import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './authStore'
import apiClient from '@/services/api'

export interface AppNotification {
  id: number
  title: string
  content: string
  type: string
  createdAt: string
  isRead: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<AppNotification[]>([])
  const unreadCount = ref(0)
  const authStore = useAuthStore()
  let eventSource: EventSource | null = null

  const fetchNotifications = async () => {
    if (!authStore.isAuthenticated) return
    try {
      const res = await apiClient.get('/customer/notifications')
      notifications.value = res as unknown as AppNotification[]
      await fetchUnreadCount()
    } catch (error) {
      console.error('Lỗi tải thông báo:', error)
    }
  }

  const fetchUnreadCount = async () => {
    if (!authStore.isAuthenticated) return
    try {
      const res = await apiClient.get('/customer/notifications/unread-count') as { count: number }
      unreadCount.value = res.count
    } catch (error) {
      console.error('Lỗi tải số thông báo chưa đọc:', error)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await apiClient.put(`/customer/notifications/${id}/read`)
      const notif = notifications.value.find(n => n.id === id)
      if (notif && !notif.isRead) {
        notif.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error)
    }
  }

  const connectRealtime = () => {
    if (!authStore.user?.id || eventSource) return

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
    eventSource = new EventSource(`${baseUrl}/sse/subscribe/${authStore.user.id}`)

    eventSource.addEventListener('NOTIFICATION', (event) => {
      const newNotif = JSON.parse(event.data) as AppNotification
      notifications.value.unshift({ ...newNotif, isRead: false })
      unreadCount.value++

      // Phát sự kiện để các component khác có thể lắng nghe (ví dụ hiện Toast hoặc Modal)
      window.dispatchEvent(new CustomEvent('app-notification', { detail: newNotif }))
    })

    eventSource.onerror = () => {
      console.error('SSE Connection Error. Attempting to reconnect...')
      eventSource?.close()
      eventSource = null
      setTimeout(connectRealtime, 5000)
    }
  }

  const disconnectRealtime = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  }

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    connectRealtime,
    disconnectRealtime
  }
})
