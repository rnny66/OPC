import { describe, it, expect } from 'vitest'
import { buildProfile, buildTournament, buildRegistration } from '../factories'

describe('test factories', () => {
  it('builds a profile with defaults', () => {
    const profile = buildProfile()
    expect(profile.id).toBeDefined()
    expect(profile.role).toBe('player')
    expect(profile.identity_verified).toBe(false)
    expect(profile.onboarding_complete).toBe(false)
  })

  it('builds a profile with overrides', () => {
    const profile = buildProfile({ role: 'organizer', display_name: 'Marcel' })
    expect(profile.role).toBe('organizer')
    expect(profile.display_name).toBe('Marcel')
  })

  it('builds a tournament with defaults', () => {
    const tournament = buildTournament()
    expect(tournament.id).toBeDefined()
    expect(tournament.registration_open).toBe(true)
    expect(tournament.requires_verification).toBe(false)
  })

  it('builds a registration with defaults', () => {
    const reg = buildRegistration()
    expect(reg.id).toBeDefined()
    expect(reg.status).toBe('registered')
  })
})
