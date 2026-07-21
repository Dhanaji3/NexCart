/**
 * Type-safe localStorage wrapper with JSON serialization
 */
export const storage = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item) as T
    } catch {
      return defaultValue
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn(`Failed to save "${key}" to localStorage`)
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },

  clear(): void {
    localStorage.clear()
  },

  has(key: string): boolean {
    return localStorage.getItem(key) !== null
  },
}

/**
 * Session storage wrapper
 */
export const sessionStore = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = sessionStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item) as T
    } catch {
      return defaultValue
    }
  },

  set<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn(`Failed to save "${key}" to sessionStorage`)
    }
  },

  remove(key: string): void {
    sessionStorage.removeItem(key)
  },
}

// Storage keys constants
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  CART_ITEMS: 'cart_items',
  WISHLIST: 'wishlist',
  THEME: 'theme',
  LOCALE: 'locale',
  RECENT_SEARCHES: 'recent_searches',
} as const
