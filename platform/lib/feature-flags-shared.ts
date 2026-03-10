// Shared constants safe to import from both server and client components

export type FeatureFlag = {
  key: string
  enabled: boolean
  label: string
  description: string | null
  tier: number
  sort_order: number
  updated_at: string
}

// Dependency definitions (used by dev admin UI)
export const FLAG_DEPENDENCIES: Record<string, string> = {
  tournament_detail: 'tournament_browsing',
  tournament_registration: 'tournament_detail',
  cancel_registration: 'tournament_registration',
  results_entry: 'organizer_tools',
}
