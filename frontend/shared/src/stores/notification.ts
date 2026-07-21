import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification, NotificationType } from '../types'
import { generateId } from '../utils/string'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  function add(options: { type: NotificationType; title: string; message?: string; duration?: number }) {
    const notification: Notification = {
      id: generateId(),
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration ?? 5000,
      timestamp: Date.now(),
    }

    notifications.value.push(notification)

    // Auto-remove after duration
    if (notification.duration > 0) {
      setTimeout(() => {
        remove(notification.id)
      }, notification.duration)
    }
  }

  function remove(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function clearAll() {
    notifications.value = []
  }

  return { notifications, add, remove, clearAll }
})
