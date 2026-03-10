import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia, defineStore } from 'pinia'

// Mock Nuxt auto-imports
vi.stubGlobal('defineStore', defineStore)
vi.stubGlobal('useCookie', () => ({ value: null }))

// Import store after global mocks are set
const { useAuthStore } = await import('../../stores/auth.js')

describe('Auth Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAuthStore()
  })

  it('initialise avec un state vide', () => {
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
  })

  describe('setToken', () => {
    it('enregistre le token', () => {
      store.setToken('jwt-token-123')
      expect(store.token).toBe('jwt-token-123')
    })

    it('écrase un token existant', () => {
      store.setToken('token-1')
      store.setToken('token-2')
      expect(store.token).toBe('token-2')
    })
  })

  describe('setUser', () => {
    it('stocke uniquement les champs essentiels de l\'utilisateur', () => {
      const fullUser = {
        id: 42,
        '@id': '/api/users/42',
        email: 'alice@example.com',
        displayName: 'Alice',
        nom: 'Dupont',
        prenom: 'Alice',
        avatar: 'avatar.png',
        channelsFavoris: ['/api/channels/1'],
        someExtraField: true
      }

      store.setUser(fullUser)

      expect(store.user).toEqual({
        id: 42,
        '@id': '/api/users/42',
        email: 'alice@example.com',
        displayName: 'Alice',
        nom: 'Dupont',
        prenom: 'Alice',
      })
      expect(store.user.avatar).toBeUndefined()
      expect(store.user.channelsFavoris).toBeUndefined()
      expect(store.user.someExtraField).toBeUndefined()
    })

    it('met l\'utilisateur à null si on passe null', () => {
      store.setUser({ id: 1, email: 'a@a.com', displayName: 'A' })
      expect(store.user).not.toBeNull()

      store.setUser(null)
      expect(store.user).toBeNull()
    })
  })

  describe('setAuth', () => {
    it('enregistre le token et l\'utilisateur en même temps', () => {
      store.setAuth('my-token', {
        id: 1,
        '@id': '/api/users/1',
        email: 'bob@example.com',
        displayName: 'Bob',
        nom: 'Martin',
        prenom: 'Bob',
      })

      expect(store.token).toBe('my-token')
      expect(store.user).not.toBeNull()
      expect(store.user.email).toBe('bob@example.com')
      expect(store.user.displayName).toBe('Bob')
    })
  })

  describe('clearAuth', () => {
    it('efface le token et l\'utilisateur', () => {
      store.setAuth('my-token', {
        id: 1,
        '@id': '/api/users/1',
        email: 'bob@example.com',
        displayName: 'Bob',
      })

      expect(store.token).toBe('my-token')
      expect(store.user).not.toBeNull()

      store.clearAuth()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })
  })

  describe('loadFromCookie', () => {
    it('ne plante pas si les cookies sont vides', () => {
      expect(() => store.loadFromCookie()).not.toThrow()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })
  })
})
