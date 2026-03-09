'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateRegistrationStatus(
  registrationId: string,
  status: string,
  tournamentId: string
) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // RLS enforces that organizer owns the tournament
  const { error } = await supabase
    .from('tournament_registrations')
    .update({ status })
    .eq('id', registrationId)

  if (error) throw new Error(error.message)

  revalidatePath(`/organizer/tournaments/${tournamentId}/registrations`)
}
