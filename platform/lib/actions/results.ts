'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculatePoints } from '@/lib/points'

export async function saveResults(
  tournamentId: string,
  results: { playerId: string; placement: number }[]
) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fetch tournament to verify ownership and get multiplier
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('organizer_id, points_multiplier')
    .eq('id', tournamentId)
    .single()

  if (tournamentError || !tournament) throw new Error('Tournament not found')
  if (tournament.organizer_id !== user.id) throw new Error('Not authorized')

  if (results.length === 0) throw new Error('No results to save')

  // Calculate points and build upsert rows
  const rows = results.map((r) => ({
    tournament_id: tournamentId,
    player_id: r.playerId,
    placement: r.placement,
    points_awarded: calculatePoints(r.placement, tournament.points_multiplier),
    entered_by: user.id,
  }))

  const { error } = await supabase
    .from('tournament_results')
    .upsert(rows, { onConflict: 'tournament_id,player_id' })

  if (error) throw new Error(error.message)

  revalidatePath(`/organizer/tournaments/${tournamentId}/results`)
}
