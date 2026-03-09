import { describe, it, expect } from 'vitest'

// We test the route classification logic as a pure function
import { classifyRoute } from '@/lib/auth/routes'

describe('route classification', () => {
  it('identifies public routes', () => {
    expect(classifyRoute('/login')).toBe('public')
    expect(classifyRoute('/signup')).toBe('public')
    expect(classifyRoute('/verify-email')).toBe('public')
    expect(classifyRoute('/verify-identity')).toBe('public')
  })

  it('identifies protected routes', () => {
    expect(classifyRoute('/dashboard')).toBe('protected')
    expect(classifyRoute('/profile')).toBe('protected')
    expect(classifyRoute('/profile/edit')).toBe('protected')
    expect(classifyRoute('/tournaments/123/register')).toBe('protected')
  })

  it('identifies organizer routes', () => {
    expect(classifyRoute('/organizer/dashboard')).toBe('organizer')
    expect(classifyRoute('/organizer/tournaments/123')).toBe('organizer')
    expect(classifyRoute('/organizer/tournaments/123/results')).toBe('organizer')
  })

  it('identifies admin routes', () => {
    expect(classifyRoute('/admin/dashboard')).toBe('admin')
    expect(classifyRoute('/admin/users')).toBe('admin')
    expect(classifyRoute('/admin/organizers')).toBe('admin')
  })

  it('treats unknown routes as public', () => {
    expect(classifyRoute('/')).toBe('public')
    expect(classifyRoute('/about')).toBe('public')
    expect(classifyRoute('/tournaments')).toBe('public')
  })

  it('classifies rankings and player profile routes as public', () => {
    expect(classifyRoute('/rankings')).toBe('public')
    expect(classifyRoute('/players/john-doe')).toBe('public')
  })
})
