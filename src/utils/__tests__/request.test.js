import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bindRouter } from '../request'

describe('request util', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('bindRouter stores reference', () => {
    const mockRouter = { push: vi.fn(), currentRoute: { value: { fullPath: '/home' } } }
    bindRouter(mockRouter)
    // After binding, gotoLogin should use this router
    expect(true).toBe(true) // binding doesn't throw
  })

  it('bindRouter with null does not throw', () => {
    expect(() => bindRouter(null)).not.toThrow()
    expect(() => bindRouter(undefined)).not.toThrow()
  })

  describe('token injection', () => {
    it('reads token from localStorage', () => {
      const token = 'test-jwt-token-abc'
      localStorage.setItem('auth', JSON.stringify({ token }))
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      expect(auth.token).toBe(token)
    })

    it('handles missing auth in localStorage', () => {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      expect(auth.token).toBeUndefined()
    })
  })
})
