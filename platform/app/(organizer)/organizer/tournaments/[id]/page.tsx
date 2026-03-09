import { createSupabaseServer } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { TournamentForm } from '@/components/organizer/tournament-form'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('name')
    .eq('id', id)
    .single()

  return {
    title: tournament
      ? `Edit ${tournament.name} — OPC Europe`
      : 'Edit Tournament — OPC Europe',
  }
}

export default async function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (!tournament) notFound()
  if (tournament.organizer_id !== user.id) redirect('/organizer/dashboard')

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
        Edit Tournament
      </h2>
      <TournamentForm tournament={tournament} />
    </div>
  )
}
