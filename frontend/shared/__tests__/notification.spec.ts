import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../src/stores/notification'

describe('Notification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with no notifications', () => {
    const store = useNotificationStore()
    expect(store.notifications).toHaveLength(0)
  })

  it('adds a notification', () => {
    const store = useNotificationStore()
    store.add({ type: 'success', title: 'Item added to cart' })

    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0].type).toBe('success')
    expect(store.notifications[0].title).toBe('Item added to cart')
  })

  it('generates unique IDs for notifications', () => {
    const store = useNotificationStore()
    store.add({ type: 'info', title: 'First' })
    store.add({ type: 'info', title: 'Second' })

    expect(store.notifications[0].id).not.toBe(store.notifications[1].id)
  })

  it('adds notification with message', () => {
    const store = useNotificationStore()
    store.add({ type: 'error', title: 'Failed', message: 'Network error occurred' })

    expect(store.notifications[0].message).toBe('Network error occurred')
  })

  it('removes a notification by id', () => {
    const store = useNotificationStore()
    store.add({ type: 'success', title: 'Test' })
    const id = store.notifications[0].id

    store.remove(id)
    expect(store.notifications).toHaveLength(0)
  })

  it('clears all notifications', () => {
    const store = useNotificationStore()
    store.add({ type: 'success', title: 'One' })
    store.add({ type: 'info', title: 'Two' })
    store.add({ type: 'warning', title: 'Three' })

    store.clearAll()
    expect(store.notifications).toHaveLength(0)
  })

  it('sets default duration of 5000ms', () => {
    const store = useNotificationStore()
    store.add({ type: 'info', title: 'Test' })

    expect(store.notifications[0].duration).toBe(5000)
  })

  it('allows custom duration', () => {
    const store = useNotificationStore()
    store.add({ type: 'info', title: 'Test', duration: 10000 })

    expect(store.notifications[0].duration).toBe(10000)
  })

  it('sets timestamp on notification', () => {
    const before = Date.now()
    const store = useNotificationStore()
    store.add({ type: 'info', title: 'Test' })
    const after = Date.now()

    expect(store.notifications[0].timestamp).toBeGreaterThanOrEqual(before)
    expect(store.notifications[0].timestamp).toBeLessThanOrEqual(after)
  })
})
