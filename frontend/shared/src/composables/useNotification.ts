import { useNotificationStore } from '../stores/notification'
import type { NotificationType } from '../types'

/**
 * Composable for showing toast notifications
 */
export function useNotification() {
  const store = useNotificationStore()

  function success(title: string, message?: string) {
    store.add({ type: 'success', title, message })
  }

  function error(title: string, message?: string) {
    store.add({ type: 'error', title, message })
  }

  function warning(title: string, message?: string) {
    store.add({ type: 'warning', title, message })
  }

  function info(title: string, message?: string) {
    store.add({ type: 'info', title, message })
  }

  function notify(type: NotificationType, title: string, message?: string) {
    store.add({ type, title, message })
  }

  return {
    success,
    error,
    warning,
    info,
    notify,
    notifications: store.notifications,
    remove: store.remove,
    clearAll: store.clearAll,
  }
}
