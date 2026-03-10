'use server'

import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { FLAG_DEPENDENCIES } from '@/lib/feature-flags-shared'

export async function toggleFeatureFlag(
  key: string,
  enabled: boolean,
  secret: string
) {
  if (secret !== process.env.DEV_SECRET) {
    return { error: 'Unauthorized' }
  }

  const admin = createSupabaseAdmin()

  // If disabling a flag, also disable all dependents
  if (!enabled) {
    const dependents = Object.entries(FLAG_DEPENDENCIES)
      .filter(([, dep]) => dep === key)
      .map(([child]) => child)

    if (dependents.length > 0) {
      await admin
        .from('feature_flags')
        .update({ enabled: false, updated_at: new Date().toISOString() })
        .in('key', dependents)
    }
  }

  // If enabling a flag, check that its dependency is enabled
  if (enabled && FLAG_DEPENDENCIES[key]) {
    const { data: parent } = await admin
      .from('feature_flags')
      .select('enabled')
      .eq('key', FLAG_DEPENDENCIES[key])
      .single()

    if (!parent?.enabled) {
      return { error: `Requires "${FLAG_DEPENDENCIES[key]}" to be enabled first` }
    }
  }

  const { error } = await admin
    .from('feature_flags')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}
