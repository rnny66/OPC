'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Not authorized')
  return { supabase, userId: user.id }
}

export async function updateDefaultBrackets(
  brackets: { placementMin: number; placementMax: number | null; basePoints: number }[]
) {
  const { supabase } = await requireAdmin()

  // Delete all existing brackets
  const { error: deleteError } = await supabase
    .from('default_points_brackets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // delete all rows

  if (deleteError) return { error: deleteError.message }

  // Insert new brackets
  const { error: insertError } = await supabase
    .from('default_points_brackets')
    .insert(
      brackets.map(b => ({
        placement_min: b.placementMin,
        placement_max: b.placementMax,
        base_points: b.basePoints,
      }))
    )

  if (insertError) return { error: insertError.message }

  revalidatePath('/admin/points-config')
  return { success: true }
}

export async function updateCountryConfig(
  countryCode: string,
  globalMultiplier: number,
  customBrackets: { min: number; max: number | null; points: number }[] | null
) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('country_config')
    .update({
      global_multiplier: globalMultiplier,
      custom_brackets: customBrackets,
      updated_at: new Date().toISOString(),
    })
    .eq('country_code', countryCode)

  if (error) return { error: error.message }

  revalidatePath('/admin/points-config')
  return { success: true }
}

export async function recomputeAllStats() {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.rpc('compute_all_player_stats')

  if (error) return { error: error.message }

  revalidatePath('/admin/points-config')
  return { success: true }
}

export async function promoteToOrganizer(userId: string) {
  await requireAdmin()

  const adminClient = createSupabaseAdmin()
  const { error } = await adminClient
    .from('profiles')
    .update({ role: 'organizer' })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function inviteOrganizer(email: string) {
  const { userId } = await requireAdmin()

  const adminClient = createSupabaseAdmin()
  const { error } = await adminClient
    .from('organizer_invitations')
    .insert({ email, invited_by: userId })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function cancelTournamentAdmin(tournamentId: string) {
  await requireAdmin()

  const adminClient = createSupabaseAdmin()
  const { error } = await adminClient
    .from('tournaments')
    .update({ status: 'cancelled' })
    .eq('id', tournamentId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/tournaments')
  return { success: true }
}
