import { cache } from 'react'
import { createSupabaseServer } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export type { FeatureFlag } from '@/lib/feature-flags-shared'
export { FLAG_DEPENDENCIES } from '@/lib/feature-flags-shared'

// --- Per-request cached flag fetcher (for Server Components / Actions) ---

export const getFeatureFlags = cache(async (): Promise<Map<string, boolean>> => {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('feature_flags')
    .select('key, enabled')
  const map = new Map<string, boolean>()
  data?.forEach((f: { key: string; enabled: boolean }) => map.set(f.key, f.enabled))
  return map
})

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flags = await getFeatureFlags()
  return flags.get(key) ?? false
}

// --- Route → flag mapping (used by middleware) ---

type FlagRouteEntry = {
  prefix: string
  flag: string
  dependsOn?: string
}

export const FLAG_ROUTE_MAP: FlagRouteEntry[] = [
  // More specific prefixes first
  { prefix: '/organizer/tournaments/', flag: 'organizer_tools' },
  { prefix: '/organizer', flag: 'organizer_tools' },
  { prefix: '/admin', flag: 'admin_panel' },
  { prefix: '/rankings', flag: 'rankings' },
  { prefix: '/players/', flag: 'player_profiles' },
  { prefix: '/verify-identity', flag: 'identity_verification' },
  // Tournament routes: detail before browsing (more specific first)
  { prefix: '/tournaments/', flag: 'tournament_detail', dependsOn: 'tournament_browsing' },
  { prefix: '/tournaments', flag: 'tournament_browsing' },
  // CMS content routes
  { prefix: '/news', flag: 'cms_news' },
  { prefix: '/blog', flag: 'cms_blog' },
  { prefix: '/events', flag: 'cms_events' },
]

/**
 * Check if a route is blocked by a disabled feature flag.
 * Returns the blocking flag key, or null if the route is allowed.
 * Used by middleware (takes supabase client directly since cache() is unavailable).
 */
export async function getRequiredFlagForMiddleware(
  supabase: SupabaseClient,
  pathname: string
): Promise<string | null> {
  const entry = FLAG_ROUTE_MAP.find(r => pathname.startsWith(r.prefix))
  if (!entry) return null

  // Fetch only the flags we need
  const flagKeys = [entry.flag]
  if (entry.dependsOn) flagKeys.push(entry.dependsOn)

  const { data } = await supabase
    .from('feature_flags')
    .select('key, enabled')
    .in('key', flagKeys)

  if (!data) return entry.flag

  const flagMap = new Map(data.map((f: { key: string; enabled: boolean }) => [f.key, f.enabled]))

  // Check dependency first
  if (entry.dependsOn && !flagMap.get(entry.dependsOn)) {
    return entry.dependsOn
  }

  // Check the flag itself
  if (!flagMap.get(entry.flag)) {
    return entry.flag
  }

  return null
}

