import { randomUUID } from 'crypto'

export type Profile = {
  id: string
  email: string
  display_name: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  bio: string | null
  city: string | null
  home_country: string
  nationality: string[]
  social_links: Record<string, string>
  role: 'player' | 'organizer' | 'admin'
  identity_verified: boolean
  identity_verified_at: string | null
  didit_session_id: string | null
  date_of_birth: string | null
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export type Tournament = {
  id: string
  name: string
  club_name: string
  city: string
  country: string
  series: string
  start_date: string
  end_date: string
  entry_fee: number
  image_url: string | null
  status: string
  organizer_id: string
  description: string | null
  capacity: number
  registration_open: boolean
  registration_deadline: string | null
  venue_address: string | null
  contact_email: string | null
  points_multiplier: number
  requires_verification: boolean
  created_at: string
  updated_at: string
}

export type Registration = {
  id: string
  tournament_id: string
  player_id: string
  status: 'registered' | 'confirmed' | 'cancelled' | 'no_show'
  registered_at: string
  cancelled_at: string | null
}

export function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: randomUUID(),
    email: `player-${Date.now()}@test.com`,
    display_name: 'Test Player',
    first_name: null,
    last_name: null,
    avatar_url: null,
    bio: null,
    city: null,
    home_country: 'NL',
    nationality: ['NL'],
    social_links: {},
    role: 'player',
    identity_verified: false,
    identity_verified_at: null,
    didit_session_id: null,
    date_of_birth: null,
    onboarding_complete: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function buildTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: randomUUID(),
    name: 'Amsterdam Open',
    club_name: 'Holland Casino',
    city: 'Amsterdam',
    country: 'NL',
    series: 'Open',
    start_date: '2026-06-01',
    end_date: '2026-06-03',
    entry_fee: 100,
    image_url: null,
    status: 'upcoming',
    organizer_id: randomUUID(),
    description: null,
    capacity: 100,
    registration_open: true,
    registration_deadline: null,
    venue_address: null,
    contact_email: null,
    points_multiplier: 1.0,
    requires_verification: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function buildRegistration(overrides: Partial<Registration> = {}): Registration {
  return {
    id: randomUUID(),
    tournament_id: randomUUID(),
    player_id: randomUUID(),
    status: 'registered',
    registered_at: new Date().toISOString(),
    cancelled_at: null,
    ...overrides,
  }
}
