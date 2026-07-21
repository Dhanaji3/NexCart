import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../src/stores/auth'

// Mock the API module
vi.mock('../src/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    updateProfile: vi.fn(),
  },
}))

import { authApi } from '../src/api'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts unauthenticated with no token', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(auth.token).toBeNull()
    expect(auth.isAdmin).toBe(false)
  })

  it('starts authenticated when token exists in localStorage', () => {
    localStorage.setItem('token', 'existing-token')
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.token).toBe('existing-token')
  })

  it('logs in successfully and stores token', async () => {
    const mockResponse = {
      user: { id: 1, name: 'John', email: 'john@example.com', avatar: '', role: 'customer' as const },
      token: 'jwt-token-123',
    }
    vi.mocked(authApi.login).mockResolvedValue(mockResponse)

    const auth = useAuthStore()
    const result = await auth.login('john@example.com', 'password123')

    expect(result).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user?.email).toBe('john@example.com')
    expect(auth.token).toBe('jwt-token-123')
    expect(localStorage.getItem('token')).toBe('jwt-token-123')
  })

  it('handles login failure', async () => {
    vi.mocked(authApi.login).mockRejectedValue({ message: 'Invalid credentials' })

    const auth = useAuthStore()
    const result = await auth.login('bad@email.com', 'wrong')

    expect(result).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error).toBe('Invalid credentials')
  })

  it('identifies admin users', async () => {
    const mockResponse = {
      user: { id: 2, name: 'Admin', email: 'admin@vueshop.com', avatar: '', role: 'admin' as const },
      token: 'admin-token',
    }
    vi.mocked(authApi.login).mockResolvedValue(mockResponse)

    const auth = useAuthStore()
    await auth.login('admin@vueshop.com', 'admin123')

    expect(auth.isAdmin).toBe(true)
  })

  it('identifies non-admin users', async () => {
    const mockResponse = {
      user: { id: 1, name: 'John', email: 'john@example.com', avatar: '', role: 'customer' as const },
      token: 'token',
    }
    vi.mocked(authApi.login).mockResolvedValue(mockResponse)

    const auth = useAuthStore()
    await auth.login('john@example.com', 'password')

    expect(auth.isAdmin).toBe(false)
  })

  it('logs out and clears state', async () => {
    const mockResponse = {
      user: { id: 1, name: 'John', email: 'john@example.com', avatar: '', role: 'customer' as const },
      token: 'jwt-token',
    }
    vi.mocked(authApi.login).mockResolvedValue(mockResponse)

    const auth = useAuthStore()
    await auth.login('john@example.com', 'password')
    auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(auth.token).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('registers a new user', async () => {
    const mockResponse = {
      user: { id: 3, name: 'New User', email: 'new@example.com', avatar: '', role: 'customer' as const },
      token: 'new-token',
    }
    vi.mocked(authApi.register).mockResolvedValue(mockResponse)

    const auth = useAuthStore()
    const result = await auth.register('New User', 'new@example.com', 'password123')

    expect(result).toBe(true)
    expect(auth.user?.name).toBe('New User')
    expect(auth.isAuthenticated).toBe(true)
  })

  it('handles registration failure', async () => {
    vi.mocked(authApi.register).mockRejectedValue({ message: 'Email already exists' })

    const auth = useAuthStore()
    const result = await auth.register('User', 'existing@example.com', 'pass')

    expect(result).toBe(false)
    expect(auth.error).toBe('Email already exists')
  })

  it('updates user profile', async () => {
    const updatedUser = { id: 1, name: 'John Updated', email: 'john@example.com', avatar: '', role: 'customer' as const }
    vi.mocked(authApi.updateProfile).mockResolvedValue(updatedUser)

    localStorage.setItem('token', 'token')
    const auth = useAuthStore()
    auth.user = { id: 1, name: 'John', email: 'john@example.com', avatar: '', role: 'customer' }
    const result = await auth.updateProfile({ name: 'John Updated' })

    expect(result).toBe(true)
    expect(auth.user?.name).toBe('John Updated')
  })

  it('sets loading state during API calls', async () => {
    let resolveLogin: any
    vi.mocked(authApi.login).mockImplementation(
      () => new Promise((resolve) => { resolveLogin = resolve })
    )

    const auth = useAuthStore()
    const loginPromise = auth.login('test@test.com', 'pass')

    expect(auth.loading).toBe(true)

    resolveLogin({ user: { id: 1, name: 'Test', email: 'test@test.com', avatar: '', role: 'customer' }, token: 't' })
    await loginPromise

    expect(auth.loading).toBe(false)
  })

  it('fetches current user on init when token exists', () => {
    vi.mocked(authApi.getMe).mockResolvedValue({ id: 1, name: 'John', email: 'john@example.com', avatar: '', role: 'customer' as const })

    localStorage.setItem('token', 'valid-token')
    const auth = useAuthStore()

    expect(authApi.getMe).toHaveBeenCalled()
  })
})
